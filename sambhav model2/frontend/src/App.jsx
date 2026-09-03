import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './App.css';

const BACKEND_URL = 'http://127.0.0.1:8000';

export default function App() {
  const videoRef    = useRef(null);
  const streamRef   = useRef(null);
  const recorderRef = useRef(null);
  const timerRef    = useRef(null);

  const [gloss,       setGloss]       = useState([]);
  const [english,     setEnglish]     = useState('');
  const [confidence,  setConfidence]  = useState(0);
  const [history,     setHistory]     = useState([]);
  const [recording,   setRecording]   = useState(false);
  const [processing,  setProcessing]  = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [status,      setStatus]      = useState('Starting camera...');

  useEffect(() => {
    startCamera();
    loadHistory();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (recorderRef.current) {
        try {
          if (recorderRef.current.state !== 'inactive') recorderRef.current.stop();
        } catch (e) { console.error(e); }
      }
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  async function startCamera() {
    try {
      setStatus('Starting camera...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30, max: 30 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
      setStatus('Camera ready. Show your sign.');
    } catch (error) {
      console.error('Camera error:', error);
      setCameraReady(false);
      setStatus('Camera access failed');
      alert('Unable to access webcam. Please allow camera permission and try again.');
    }
  }

  async function loadHistory() {
    try {
      const response = await axios.get(`${BACKEND_URL}/history`);
      setHistory(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('History loading failed:', error);
    }
  }

  async function captureSign() {
    if (!cameraReady || recording || processing) return;
    const stream = streamRef.current;
    if (!stream) { alert('Camera stream not available.'); return; }

    let mimeType = '';
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9'))      mimeType = 'video/webm;codecs=vp9';
    else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) mimeType = 'video/webm;codecs=vp8';
    else if (MediaRecorder.isTypeSupported('video/webm'))            mimeType = 'video/webm';
    else { alert('Your browser does not support video recording.'); return; }

    const recorder = new MediaRecorder(stream, { mimeType });
    recorderRef.current = recorder;
    const chunks = [];

    recorder.ondataavailable = (e) => { if (e.data?.size > 0) chunks.push(e.data); };

    recorder.onstop = async () => {
      setRecording(false);
      setProcessing(true);
      setStatus('Processing sign with AI model...');
      try {
        if (chunks.length === 0) throw new Error('No video data was recorded.');
        const videoBlob = new Blob(chunks, { type: mimeType });
        const formData  = new FormData();
        formData.append('file', videoBlob, 'sign.webm');
        const response = await axios.post(`${BACKEND_URL}/predict-video`, formData);
        if (!response.data) throw new Error('Empty response from backend.');
        if (response.data.success === false) throw new Error(response.data.error || 'Prediction failed.');
        if (response.data.word === 'No hand detected') {
          setStatus('No hand detected. Please try again.');
          alert('No hand detected during recording.\n\nMake sure your complete hand is visible inside the camera.');
          return;
        }
        const predictedWord       = response.data.word;
        const predictedConfidence = Number(response.data.confidence) || 0;
        if (!predictedWord) throw new Error('Backend did not return a predicted word.');
        setGloss(prev => [...prev, predictedWord]);
        setConfidence(predictedConfidence);
        setEnglish('');
        setStatus(`Detected: ${predictedWord}`);
      } catch (error) {
        console.error('Prediction error:', error);
        setStatus('Prediction failed.');
        alert('Prediction failed.\n\n' + (error.response?.data?.error || error.message || 'Check the backend terminal.'));
      } finally {
        setProcessing(false);
      }
    };

    recorder.onerror = () => {
      setRecording(false);
      setProcessing(false);
      setStatus('Recording error');
      alert('An error occurred while recording.');
    };

    setRecording(true);
    setStatus('Recording sign for 6 seconds...');
    recorder.start(250);
    timerRef.current = setTimeout(() => {
      if (recorder.state !== 'inactive') recorder.stop();
    }, 6000);
  }

  async function convertToEnglish() {
    if (!Array.isArray(gloss) || gloss.length === 0) {
      alert('Please record at least one sign first.');
      return;
    }
    setStatus('Converting ISL gloss to English...');
    try {
      const glossText = gloss.join(' ').trim();
      const response  = await axios.post(`${BACKEND_URL}/convert`, { gloss: glossText });
      if (!response.data) throw new Error('Empty response from backend.');
      if (response.data.success === false) throw new Error(response.data.error || 'English conversion failed.');
      const englishSentence = response.data.english;
      if (!englishSentence || typeof englishSentence !== 'string') throw new Error('Backend did not return a valid English sentence.');
      setEnglish(englishSentence);
      setStatus('English sentence generated.');
      await loadHistory();
    } catch (error) {
      console.error('Conversion error:', error);
      setStatus('English conversion failed.');
      alert('English sentence conversion failed.\n\n' + (error.response?.data?.error || error.message || 'Check the backend.'));
    }
  }

  function speakText() {
    if (!english.trim()) { alert('Please convert the ISL gloss to English first.'); return; }
    if (!('speechSynthesis' in window)) { alert('Speech synthesis is not supported by this browser.'); return; }
    window.speechSynthesis.cancel();
    const utterance   = new SpeechSynthesisUtterance(english);
    utterance.lang    = 'en-IN';
    utterance.rate    = 0.9;
    utterance.pitch   = 1;
    utterance.onstart = () => setStatus('Speaking English sentence...');
    utterance.onend   = () => setStatus('Speech completed.');
    utterance.onerror = () => setStatus('Speech failed.');
    window.speechSynthesis.speak(utterance);
    setStatus('Speaking...');
  }

  function clearAll() {
    setGloss([]);
    setEnglish('');
    setConfidence(0);
    setStatus('Cleared. Show your next sign.');
  }

  function removeLastWord() {
    setGloss(prev => prev.slice(0, -1));
    setEnglish('');
    setStatus('Last sign removed.');
  }

  return (
    <div className="app">

      {/* Header */}
      <div className="header">
        <h1>SAMBHAV</h1>
        <p>AI-powered Indian Sign Language → Text → Speech</p>
      </div>

      <div className="main-layout">

        {/* Camera */}
        <div className="card camera-card">
          <div className="card-title">Live Camera</div>
          <div className="camera-wrapper">
            <video ref={videoRef} autoPlay playsInline muted />
            <div className="camera-badge">
              <span className={`dot ${cameraReady ? '' : 'inactive'}`} />
              {cameraReady ? 'Hand Tracking Active' : 'Camera Starting...'}
            </div>
          </div>

          <div className="status-bar">
            <span className="status-label">Status</span>
            {status}
          </div>

          {recording && (
            <div className="recording-alert">
              🔴 Recording sign for 6 seconds...
            </div>
          )}

          {processing && (
            <div className="processing-alert">
              ⏳ AI model is processing the video...
            </div>
          )}

          <div className="btn-row">
            <button
              className="btn btn-primary"
              onClick={captureSign}
              disabled={recording || processing || !cameraReady}
            >
              {recording ? '🔴 Recording...' : processing ? '⏳ Processing...' : '🎥 Record Sign (6s)'}
            </button>

            <button
              className="btn btn-green"
              onClick={convertToEnglish}
              disabled={gloss.length === 0 || recording || processing}
            >
              🔤 Convert to English
            </button>

            <button
              className="btn btn-secondary"
              onClick={speakText}
              disabled={!english.trim()}
            >
              🔊 Speak
            </button>

            <button
              className="btn btn-secondary"
              onClick={removeLastWord}
              disabled={gloss.length === 0}
            >
              ↩ Remove Last
            </button>

            <button className="btn btn-danger" onClick={clearAll}>
              🗑 Clear
            </button>
          </div>
        </div>

        {/* Latest Prediction */}
        <div className="card">
          <div className="card-title">Latest Prediction</div>
          <div className="prediction-box">
            {gloss.length > 0 ? (
              <div style={{ width: '100%' }}>
                <div className="prediction-word">{gloss[gloss.length - 1]}</div>
                <div className="prediction-confidence">
                  Confidence: {(confidence * 100).toFixed(1)}%
                </div>
                <div className="confidence-bar">
                  <div className="confidence-fill" style={{ width: `${(confidence * 100).toFixed(1)}%` }} />
                </div>
              </div>
            ) : (
              <span className="empty-state">No prediction yet. Record a sign to begin.</span>
            )}
          </div>
        </div>

        {/* ISL Gloss */}
        <div className="card">
          <div className="card-title">ISL Gloss</div>
          <div className="gloss-box">
            {gloss.length > 0
              ? gloss.map((word, i) => <span key={i} className="gloss-tag">{word}</span>)
              : <span className="empty-state">Your detected signs will appear here.</span>
            }
          </div>
        </div>

        {/* English Sentence */}
        <div className="card">
          <div className="card-title">English Sentence</div>
          <div className="english-box">
            {english || <span style={{ color: '#2d6a4f', opacity: 0.6 }}>Your English sentence will appear here.</span>}
          </div>
        </div>

        {/* Session History */}
        <div className="card">
          <div className="card-title">Session History</div>
          {history.length === 0 ? (
            <span className="empty-state">No previous sessions.</span>
          ) : (
            <div className="history-list">
              {history.map((item, index) => (
                <div key={`${item.created_at}-${index}`} className="history-item">
                  <div className="gloss-text">Gloss: {item.gloss}</div>
                  <div className="english-text">{item.english}</div>
                  <div className="timestamp">{item.created_at}</div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
