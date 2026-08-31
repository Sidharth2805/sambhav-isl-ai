import { useEffect, useRef, useState } from "react";
import axios from "axios";

const BACKEND_URL = "http://127.0.0.1:8000";
const WS_URL = "ws://127.0.0.1:8000/ws/realtime";

const CAPTURE_INTERVAL_MS = 40;


export default function App() {

  // ============================================================
  // REFS
  // ============================================================

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const streamRef = useRef(null);
  const websocketRef = useRef(null);

  const captureTimerRef = useRef(null);

  const frameBusyRef = useRef(false);

  const websocketConnectingRef = useRef(false);

  const mountedRef = useRef(true);

  // Prevent duplicate React state problems when signs arrive.
  const glossRef = useRef("");


  // ============================================================
  // STATE
  // ============================================================

  const [latestPrediction, setLatestPrediction] =
    useState("");

  const [gloss, setGloss] =
    useState("");

  const [english, setEnglish] =
    useState("");

  const [history, setHistory] =
    useState([]);

  const [cameraReady, setCameraReady] =
    useState(false);

  const [connected, setConnected] =
    useState(false);

  const [realtimeActive, setRealtimeActive] =
    useState(false);

  const [bufferFrames, setBufferFrames] =
    useState(0);

  const [status, setStatus] =
    useState("Starting camera...");

  const [isSpeaking, setIsSpeaking] =
    useState(false);

  const [isPaused, setIsPaused] =
    useState(false);


  // ============================================================
  // INITIALIZATION
  // ============================================================

  useEffect(() => {

    mountedRef.current = true;

    startCamera();

    loadHistory();


    return () => {

      mountedRef.current = false;

      stopFrameCapture();

      stopRealtime();

      stopCamera();


      if (
        "speechSynthesis" in window
      ) {

        window.speechSynthesis.cancel();

      }

    };

  }, []);


  // ============================================================
  // CAMERA
  // ============================================================

  async function startCamera() {

    try {

      setStatus(
        "Starting camera..."
      );


      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {

        throw new Error(
          "Webcam is not supported by this browser."
        );

      }


      const stream =
        await navigator.mediaDevices.getUserMedia({

          video: {

            width: {
              ideal: 640
            },

            height: {
              ideal: 480
            },

            frameRate: {
              ideal: 30,
              max: 30
            }

          },

          audio: false

        });


      streamRef.current =
        stream;


      if (
        videoRef.current
      ) {

        videoRef.current.srcObject =
          stream;

        await videoRef.current.play();

      }


      if (mountedRef.current) {

        setCameraReady(true);

        setStatus(
          "Camera ready. Click Start Real-Time Recognition."
        );

      }

    } catch (error) {

      console.error(
        "Camera error:",
        error
      );


      if (mountedRef.current) {

        setCameraReady(false);

        setStatus(
          "Camera access failed."
        );


        alert(
          "Unable to access webcam.\n\n" +
          "Please allow camera permission in your browser and reload the page."
        );

      }

    }

  }


  // ============================================================
  // STOP CAMERA
  // ============================================================

  function stopCamera() {

    if (
      streamRef.current
    ) {

      streamRef.current
        .getTracks()
        .forEach(
          (track) => {

            track.stop();

          }
        );


      streamRef.current =
        null;

    }


    if (mountedRef.current) {

      setCameraReady(false);

    }

  }


  // ============================================================
  // HISTORY
  // ============================================================

  async function loadHistory() {

    try {

      const response =
        await axios.get(
          `${BACKEND_URL}/history`
        );


      if (
        Array.isArray(
          response.data
        )
      ) {

        if (mountedRef.current) {

          setHistory(
            response.data
          );

        }

      } else {

        setHistory([]);

      }

    } catch (error) {

      console.error(
        "History loading error:",
        error
      );


      if (mountedRef.current) {

        setHistory([]);

      }

    }

  }


  // ============================================================
  // WEBSOCKET
  // ============================================================

  function connectWebSocket() {

    return new Promise(
      (resolve, reject) => {

        if (
          websocketRef.current &&
          websocketRef.current.readyState ===
            WebSocket.OPEN
        ) {

          resolve();

          return;

        }


        if (
          websocketConnectingRef.current
        ) {

          const interval =
            setInterval(
              () => {

                if (
                  websocketRef.current &&
                  websocketRef.current.readyState ===
                    WebSocket.OPEN
                ) {

                  clearInterval(
                    interval
                  );

                  resolve();

                }


                if (
                  websocketRef.current &&
                  websocketRef.current.readyState ===
                    WebSocket.CLOSED
                ) {

                  clearInterval(
                    interval
                  );

                  reject(
                    new Error(
                      "WebSocket connection failed."
                    )
                  );

                }

              },
              50
            );


          return;

        }


        websocketConnectingRef.current =
          true;


        setStatus(
          "Connecting to real-time AI..."
        );


        try {

          const websocket =
            new WebSocket(
              WS_URL
            );


          websocket.binaryType =
            "arraybuffer";


          websocketRef.current =
            websocket;


          websocket.onopen = () => {

            console.log(
              "WebSocket connected."
            );


            websocketConnectingRef.current =
              false;


            if (mountedRef.current) {

              setConnected(true);

              setStatus(
                "Real-time AI connected. Show your first sign."
              );

            }


            resolve();

          };


          websocket.onmessage =
            (event) => {

              try {

                const data =
                  JSON.parse(
                    event.data
                  );


                handleRealtimeResponse(
                  data
                );

              } catch (error) {

                console.error(
                  "WebSocket message error:",
                  error
                );

              }

            };


          websocket.onerror =
            (error) => {

              console.error(
                "WebSocket error:",
                error
              );


              websocketConnectingRef.current =
                false;


              if (mountedRef.current) {

                setConnected(false);

                setStatus(
                  "Real-time connection error."
                );

              }


              reject(
                new Error(
                  "WebSocket connection failed."
                )
              );

            };


          websocket.onclose = () => {

            console.log(
              "WebSocket disconnected."
            );


            websocketConnectingRef.current =
              false;


            if (
              websocketRef.current ===
              websocket
            ) {

              websocketRef.current =
                null;

            }


            stopFrameCapture();


            if (mountedRef.current) {

              setConnected(false);

              setRealtimeActive(false);

              setBufferFrames(0);

            }

          };

        } catch (error) {

          websocketConnectingRef.current =
            false;

          reject(error);

        }

      }
    );

  }


  // ============================================================
  // REALTIME RESPONSE
  // ============================================================

  function handleRealtimeResponse(data) {

    // ==========================================================
    // STATUS
    // ==========================================================

    if (
      data.type === "status"
    ) {

      const frames =
        Number(
          data.frames
        ) || 0;


      if (mountedRef.current) {

        setBufferFrames(
          frames
        );

      }


      if (
        data.message &&
        mountedRef.current
      ) {

        setStatus(
          String(
            data.message
          )
        );

      }


      return;

    }


    // ==========================================================
    // PREDICTION
    // ==========================================================

    if (
      data.type === "prediction"
    ) {

      const detected =
        String(
          data.latest_prediction ||
          ""
        ).trim();


      if (!detected) {

        return;

      }


      if (mountedRef.current) {

        setLatestPrediction(
          detected
        );


        setStatus(
          `Detected: ${detected}. Show the next sign after changing/releasing your hand.`
        );

      }


      // --------------------------------------------------------
      // ADD SIGN TO GLOSS
      // --------------------------------------------------------

      const currentGloss =
        glossRef.current.trim();


      const previousWords =
        currentGloss
          ? currentGloss
              .split(/\s+/)
              .filter(Boolean)
          : [];


      // Do not append the same sign twice consecutively.
      if (
        previousWords.length === 0 ||
        previousWords[
          previousWords.length - 1
        ].toLowerCase() !==
        detected.toLowerCase()
      ) {

        const updatedGloss =
          [
            ...previousWords,
            detected
          ].join(" ");


        glossRef.current =
          updatedGloss;


        if (mountedRef.current) {

          setGloss(
            updatedGloss
          );

        }


        // English generated from a previous gloss is now
        // outdated.
        if (mountedRef.current) {

          setEnglish("");

        }

      }


      return;

    }


    // ==========================================================
    // RESET
    // ==========================================================

    if (
      data.type === "reset"
    ) {

      glossRef.current =
        "";


      if (mountedRef.current) {

        setLatestPrediction("");

        setGloss("");

        setEnglish("");

        setBufferFrames(0);

        setStatus(
          "Realtime recognition reset."
        );

      }


      return;

    }


    // ==========================================================
    // ERROR
    // ==========================================================

    if (
      data.type === "error"
    ) {

      console.error(
        "Backend error:",
        data.error
      );


      if (mountedRef.current) {

        setStatus(
          `AI error: ${
            data.error ||
            "Unknown backend error"
          }`
        );

      }

    }

  }


  // ============================================================
  // CAPTURE FRAME
  // ============================================================

  function captureFrame() {

    const video =
      videoRef.current;

    const canvas =
      canvasRef.current;

    const websocket =
      websocketRef.current;


    if (
      !video ||
      !canvas ||
      !websocket
    ) {

      return;

    }


    if (
      websocket.readyState !==
      WebSocket.OPEN
    ) {

      return;

    }


    if (
      video.readyState <
      HTMLMediaElement.HAVE_CURRENT_DATA
    ) {

      return;

    }


    if (
      video.videoWidth <= 0 ||
      video.videoHeight <= 0
    ) {

      return;

    }


    if (
      frameBusyRef.current
    ) {

      return;

    }


    frameBusyRef.current =
      true;


    const width = 640;

    const height = 480;


    canvas.width =
      width;

    canvas.height =
      height;


    const context =
      canvas.getContext(
        "2d"
      );


    if (!context) {

      frameBusyRef.current =
        false;

      return;

    }


    context.drawImage(
      video,
      0,
      0,
      width,
      height
    );


    canvas.toBlob(
      (blob) => {

        try {

          if (!blob) {

            return;

          }


          const currentWebsocket =
            websocketRef.current;


          if (
            !currentWebsocket ||
            currentWebsocket.readyState !==
              WebSocket.OPEN
          ) {

            return;

          }


          currentWebsocket.send(
            blob
          );

        } catch (error) {

          console.error(
            "Frame send error:",
            error
          );

        } finally {

          frameBusyRef.current =
            false;

        }

      },

      "image/jpeg",

      0.70

    );

  }


  // ============================================================
  // START FRAME CAPTURE
  // ============================================================

  function startFrameCapture() {

    stopFrameCapture();


    frameBusyRef.current =
      false;


    captureTimerRef.current =
      setInterval(
        captureFrame,
        CAPTURE_INTERVAL_MS
      );

  }


  // ============================================================
  // STOP FRAME CAPTURE
  // ============================================================

  function stopFrameCapture() {

    if (
      captureTimerRef.current
    ) {

      clearInterval(
        captureTimerRef.current
      );


      captureTimerRef.current =
        null;

    }


    frameBusyRef.current =
      false;

  }


  // ============================================================
  // RESET BACKEND
  // ============================================================

  function resetBackendRealtimeBuffer() {

    const websocket =
      websocketRef.current;


    if (
      websocket &&
      websocket.readyState ===
        WebSocket.OPEN
    ) {

      try {

        websocket.send(
          JSON.stringify({
            action:
              "reset"
          })
        );

      } catch (error) {

        console.error(
          "Reset error:",
          error
        );

      }

    }

  }


  // ============================================================
  // START REALTIME
  // ============================================================

  async function startRealtime() {

    try {

      if (!cameraReady) {

        alert(
          "Camera is not ready yet."
        );

        return;

      }


      if (realtimeActive) {

        return;

      }


      // Clear old recognition session.
      glossRef.current =
        "";


      setLatestPrediction("");

      setGloss("");

      setEnglish("");

      setBufferFrames(0);


      await connectWebSocket();


      resetBackendRealtimeBuffer();


      if (mountedRef.current) {

        setRealtimeActive(true);

        setConnected(true);

        setStatus(
          "Real-time recognition active. Show your first sign."
        );

      }


      startFrameCapture();

    } catch (error) {

      console.error(
        "Realtime start error:",
        error
      );


      stopFrameCapture();


      if (mountedRef.current) {

        setRealtimeActive(false);

        setConnected(false);

        setStatus(
          "Could not start real-time recognition."
        );


        alert(
          "Unable to connect to the real-time AI backend.\n\n" +
          "Make sure FastAPI is running on port 8000."
        );

      }

    }

  }


  // ============================================================
  // STOP REALTIME
  // ============================================================

  function stopRealtime() {

    stopFrameCapture();


    const websocket =
      websocketRef.current;


    if (websocket) {

      try {

        if (
          websocket.readyState ===
            WebSocket.OPEN ||
          websocket.readyState ===
            WebSocket.CONNECTING
        ) {

          websocket.close();

        }

      } catch (error) {

        console.error(
          "WebSocket close error:",
          error
        );

      }

    }


    websocketRef.current =
      null;


    websocketConnectingRef.current =
      false;


    if (mountedRef.current) {

      setRealtimeActive(false);

      setConnected(false);

      setBufferFrames(0);

      setStatus(
        "Real-time recognition stopped."
      );

    }

  }


  // ============================================================
  // CONVERT ISL → ENGLISH
  // ============================================================

  async function convertToEnglish() {

    try {

      const currentGloss =
        glossRef.current.trim();


      if (!currentGloss) {

        alert(
          "Please recognize at least one sign first."
        );

        return;

      }


      setStatus(
        "Converting ISL gloss to English..."
      );


      const response =
        await axios.post(
          `${BACKEND_URL}/convert`,
          {
            gloss:
              currentGloss
          }
        );


      const sentence =
        String(
          response.data?.english_sentence ||
          response.data?.english ||
          ""
        ).trim();


      if (!sentence) {

        throw new Error(
          "Backend did not return an English sentence."
        );

      }


      setEnglish(
        sentence
      );


      setStatus(
        "English sentence generated."
      );


      await loadHistory();

    } catch (error) {

      console.error(
        "Conversion error:",
        error
      );


      setStatus(
        "English conversion failed."
      );


      alert(
        "English conversion failed.\n\n" +
        (
          error.response?.data?.error ||
          error.message ||
          "Check the backend."
        )
      );

    }

  }


  // ============================================================
  // SPEECH
  // ============================================================

  function speakText() {

    try {

      const textToSpeak =
        english.trim();


      if (!textToSpeak) {

        alert(
          "Please generate an English sentence first."
        );

        return;

      }


      if (
        !("speechSynthesis" in window)
      ) {

        throw new Error(
          "Speech synthesis is not supported by this browser."
        );

      }


      const synthesis =
        window.speechSynthesis;


      // --------------------------------------------------------
      // CURRENTLY PAUSED → RESUME
      // --------------------------------------------------------

      if (
        isPaused
      ) {

        synthesis.resume();


        setIsPaused(false);

        setIsSpeaking(true);

        setStatus(
          "Speech resumed."
        );


        return;

      }


      // --------------------------------------------------------
      // CURRENTLY SPEAKING → PAUSE
      // --------------------------------------------------------

      if (
        synthesis.speaking
      ) {

        synthesis.pause();


        setIsPaused(true);

        setIsSpeaking(true);

        setStatus(
          "Speech paused."
        );


        return;

      }


      // --------------------------------------------------------
      // START NEW SPEECH
      // --------------------------------------------------------

      synthesis.cancel();


      const utterance =
        new SpeechSynthesisUtterance(
          textToSpeak
        );


      utterance.lang =
        "en-IN";


      utterance.rate =
        0.9;


      utterance.pitch =
        1.0;


      utterance.onstart =
        () => {

          if (mountedRef.current) {

            setIsSpeaking(true);

            setIsPaused(false);

            setStatus(
              "Speaking English sentence..."
            );

          }

        };


      utterance.onend =
        () => {

          if (mountedRef.current) {

            setIsSpeaking(false);

            setIsPaused(false);

            setStatus(
              "Speech completed."
            );

          }

        };


      utterance.onerror =
        (event) => {

          console.error(
            "Speech error:",
            event
          );


          if (mountedRef.current) {

            setIsSpeaking(false);

            setIsPaused(false);

          }


          if (
            event.error ===
              "canceled" ||
            event.error ===
              "interrupted"
          ) {

            return;

          }


          if (mountedRef.current) {

            setStatus(
              "Speech failed."
            );

          }

        };


      synthesis.speak(
        utterance
      );

    } catch (error) {

      console.error(
        "Speech error:",
        error
      );


      setIsSpeaking(false);

      setIsPaused(false);


      alert(
        error.message ||
        "Speech could not be started."
      );

    }

  }


  // ============================================================
  // STOP SPEECH
  // ============================================================

  function stopSpeech() {

    if (
      "speechSynthesis" in window
    ) {

      window.speechSynthesis.cancel();

    }


    setIsSpeaking(false);

    setIsPaused(false);


    setStatus(
      "Speech stopped."
    );

  }


  // ============================================================
  // REMOVE LAST WORD
  // ============================================================

  function removeLastWord() {

    const words =
      glossRef.current
        .trim()
        .split(/\s+/)
        .filter(Boolean);


    if (
      words.length === 0
    ) {

      return;

    }


    words.pop();


    const updatedGloss =
      words.join(" ");


    glossRef.current =
      updatedGloss;


    setGloss(
      updatedGloss
    );


    setEnglish("");


    stopSpeech();


    setStatus(
      "Last sign removed."
    );

  }


  // ============================================================
  // CLEAR ALL
  // ============================================================

  function clearAll() {

    stopSpeech();


    glossRef.current =
      "";


    setLatestPrediction("");

    setGloss("");

    setEnglish("");

    setBufferFrames(0);


    resetBackendRealtimeBuffer();


    setStatus(
      realtimeActive
        ? "Cleared. Show your next sign."
        : "Cleared. Start real-time recognition."
    );

  }


  // ============================================================
  // UI
  // ============================================================

  return (

    <div
      style={{

        fontFamily:
          "Arial, sans-serif",

        padding:
          "20px",

        maxWidth:
          "900px",

        margin:
          "auto"

      }}
    >

      {/* ======================================================
          TITLE
      ======================================================= */}

      <h1>
        SAMBHAV — Real-Time Sign → Text → Speech
      </h1>


      <p
        style={{
          color:
            "#555"
        }}
      >
        AI-powered Indian Sign Language recognition
      </p>


      {/* ======================================================
          CAMERA
      ======================================================= */}

      <div
        style={{

          position:
            "relative",

          width:
            "640px",

          maxWidth:
            "100%"

        }}
      >

        <video
          ref={videoRef}

          autoPlay
          playsInline
          muted

          width="640"
          height="480"

          style={{

            width:
              "100%",

            height:
              "auto",

            border:
              "2px solid black",

            borderRadius:
              "10px",

            background:
              "black",

            transform:
              "scaleX(-1)"

          }}
        />


        <canvas
          ref={canvasRef}

          style={{
            display:
              "none"
          }}
        />


        <div
          style={{

            position:
              "absolute",

            top:
              "10px",

            left:
              "10px",

            background:
              "rgba(0,0,0,0.65)",

            color:
              "white",

            padding:
              "6px 10px",

            borderRadius:
              "5px",

            fontSize:
              "14px"

          }}
        >

          {realtimeActive
            ? connected
              ? "● Real-Time AI Active"
              : "Connecting..."
            : cameraReady
            ? "Camera Ready"
            : "Camera Starting..."}

        </div>

      </div>


      {/* ======================================================
          STATUS
      ======================================================= */}

      <div
        style={{

          marginTop:
            "15px",

          padding:
            "10px",

          background:
            "#f5f5f5",

          borderRadius:
            "8px"

        }}
      >

        <b>Status:</b>{" "}

        {status}

      </div>


      {/* ======================================================
          BUFFER
      ======================================================= */}

      {realtimeActive &&
        bufferFrames > 0 &&
        bufferFrames < 60 && (

          <div
            style={{

              marginTop:
                "10px",

              padding:
                "10px",

              fontWeight:
                "bold"

            }}
          >

            Preparing AI sequence:
            {" "}
            {bufferFrames}
            /60 frames

          </div>

        )}


      {/* ======================================================
          BUTTONS
      ======================================================= */}

      <div
        style={{

          marginTop:
            "20px",

          display:
            "flex",

          gap:
            "10px",

          flexWrap:
            "wrap"

        }}
      >

        {!realtimeActive ? (

          <button
            onClick={
              startRealtime
            }

            disabled={
              !cameraReady
            }

            style={{

              padding:
                "10px 15px",

              cursor:
                !cameraReady
                  ? "not-allowed"
                  : "pointer",

              fontWeight:
                "bold"

            }}
          >

            Start Real-Time Recognition

          </button>

        ) : (

          <button
            onClick={
              stopRealtime
            }

            style={{

              padding:
                "10px 15px",

              fontWeight:
                "bold"

            }}
          >

            Stop Real-Time Recognition

          </button>

        )}


        <button
          onClick={
            convertToEnglish
          }

          disabled={
            !gloss.trim()
          }

          style={{
            padding:
              "10px 15px"
          }}
        >

          Convert to English

        </button>


        <button
          onClick={
            speakText
          }

          disabled={
            !english.trim()
          }

          style={{
            padding:
              "10px 15px"
          }}
        >

          {isPaused
            ? "Resume Speech"
            : isSpeaking
            ? "Pause Speech"
            : "Speak"}

        </button>


        {isSpeaking && (

          <button
            onClick={
              stopSpeech
            }

            style={{
              padding:
                "10px 15px"
            }}
          >

            Stop Speech

          </button>

        )}


        <button
          onClick={
            removeLastWord
          }

          disabled={
            !gloss.trim()
          }

          style={{
            padding:
              "10px 15px"
          }}
        >

          Remove Last

        </button>


        <button
          onClick={
            clearAll
          }

          style={{
            padding:
              "10px 15px"
          }}
        >

          Clear

        </button>

      </div>


      {/* ======================================================
          LATEST PREDICTION
      ======================================================= */}

      <h2>
        Latest Prediction
      </h2>


      <div
        style={{

          background:
            "#f0f0f0",

          padding:
            "15px",

          borderRadius:
            "8px",

          minHeight:
            "40px",

          fontSize:
            "22px",

          fontWeight:
            "bold"

        }}
      >

        {latestPrediction ||
          "No prediction yet."}

      </div>


      {/* ======================================================
          ISL GLOSS
      ======================================================= */}

      <h2>
        ISL Gloss
      </h2>


      <div
        style={{

          background:
            "#f0f0f0",

          padding:
            "15px",

          borderRadius:
            "8px",

          minHeight:
            "50px",

          fontSize:
            "18px"

        }}
      >

        {gloss ||
          "Your detected signs will appear here."}

      </div>


      {/* ======================================================
          ENGLISH
      ======================================================= */}

      <h2>
        English Sentence
      </h2>


      <div
        style={{

          background:
            "#e8f5e9",

          padding:
            "15px",

          borderRadius:
            "8px",

          minHeight:
            "50px",

          fontSize:
            "18px"

        }}
      >

        {english ||
          "Your English sentence will appear here."}

      </div>


      {/* ======================================================
          SESSION HISTORY
      ======================================================= */}

      <h2>
        Session History
      </h2>


      {history.length === 0 ? (

        <p>
          No previous sessions.
        </p>

      ) : (

        history.map(
          (item, index) => (

            <div
              key={
                `${item.created_at || index}-${index}`
              }

              style={{

                border:
                  "1px solid #ccc",

                padding:
                  "12px",

                marginBottom:
                  "10px",

                borderRadius:
                  "8px",

                background:
                  "#fafafa"

              }}
            >

              <div>

                <b>
                  Gloss:
                </b>{" "}

                {item.gloss ||
                  item.isl_gloss ||
                  ""}

              </div>


              <div>

                <b>
                  English:
                </b>{" "}

                {item.english ||
                  item.english_sentence ||
                  ""}

              </div>


              {item.created_at && (

                <div
                  style={{

                    marginTop:
                      "5px",

                    color:
                      "#666",

                    fontSize:
                      "13px"

                  }}
                >

                  {item.created_at}

                </div>

              )}

            </div>

          )
        )

      )}

    </div>

  );

}