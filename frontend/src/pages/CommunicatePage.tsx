import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createSession, getSessionByRoomCode, startSession } from '../utils/communicationApi';

export const CommunicatePage: React.FC = () => {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  // Mode Selection State
  const [selectedMode, setSelectedMode] = useState<'ONLINE' | 'OFFLINE' | null>(null);

  // Online Flow states
  const [joinCode, setJoinCode] = useState('');
  const [createdSession, setCreatedSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateOnlineRoom = async () => {
    try {
      setLoading(true);
      setError(null);
      const session = await createSession('ONLINE', accessToken);
      if (import.meta.env.DEV) {
        console.log('[SignBridge Debug] Session created');
      }
      setCreatedSession(session);
    } catch (err: any) {
      setError(err?.message || 'We couldn\'t create an online room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinOnlineRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      setError('Please enter a valid room code.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // Retrieve the session from the backend by room code
      const session = await getSessionByRoomCode(joinCode.trim(), accessToken);

      if (session.status === 'ENDED') {
        setError('This session has already ended.');
        return;
      }
      if (session.status === 'CANCELLED') {
        setError('This session has been cancelled.');
        return;
      }

      // If valid, start it if not active (or join directly)
      if (session.status === 'CREATED' || session.status === 'WAITING') {
        await startSession(session.id, accessToken);
        if (import.meta.env.DEV) {
          console.log('[SignBridge Debug] Session started');
        }
      }

      navigate(`/communicate/online/${session.id}`);
    } catch (err: any) {
      if (err?.status === 404) {
        setError('Room code not found. Please verify the code and try again.');
      } else {
        setError(err?.message || 'Failed to connect. Please check your network and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartOfflineTranslation = async () => {
    try {
      setLoading(true);
      setError(null);
      const session = await createSession('OFFLINE', accessToken);
      await startSession(session.id, accessToken);
      navigate(`/communicate/offline/${session.id}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to start offline translation session.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (createdSession?.roomCode) {
      navigator.clipboard.writeText(createdSession.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Communicate</h1>
        <p className="text-sm opacity-75">
          Select a communication mode to begin. Connect remotely via video calls, or translate signs face-to-face.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-sm font-semibold text-red-700 dark:text-red-400" role="alert">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Main Choice */}
      {!selectedMode && !createdSession && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ONLINE Card */}
          <button
            onClick={() => setSelectedMode('ONLINE')}
            className="card flex flex-col items-center text-center p-8 gap-4 hover:border-primary hover:scale-[1.01] transition-all cursor-pointer"
          >
            <span className="text-5xl" aria-hidden="true">🎥</span>
            <h2 className="text-xl font-bold">Online Communication</h2>
            <p className="text-xs opacity-75">
              Connect with another participant remotely. Create a room code or enter an existing code to join a video session.
            </p>
          </button>

          {/* OFFLINE Card */}
          <button
            onClick={handleStartOfflineTranslation}
            disabled={loading}
            className="card flex flex-col items-center text-center p-8 gap-4 hover:border-accent hover:scale-[1.01] transition-all cursor-pointer"
          >
            <span className="text-5xl" aria-hidden="true">🤟</span>
            <h2 className="text-xl font-bold">Offline Communication</h2>
            <p className="text-xs opacity-75">
              Translate Indian Sign Language gestures face-to-face. Open your camera feed to begin translating signs to speech and text.
            </p>
          </button>
        </div>
      )}

      {/* ONLINE Options Panel */}
      {selectedMode === 'ONLINE' && !createdSession && (
        <div className="flex flex-col gap-6">
          <button
            onClick={() => setSelectedMode(null)}
            className="btn-secondary self-start flex items-center gap-2 text-xs py-2 px-3"
          >
            ← Back to Modes
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Create Room Block */}
            <div className="card flex flex-col justify-between p-6 gap-4">
              <div>
                <h3 className="text-lg font-bold mb-2">Create a New Room</h3>
                <p className="text-xs opacity-75 mb-4">
                  Set up a fresh online call room and share the alphanumeric code with the participant you wish to call.
                </p>
              </div>
              <button
                onClick={handleCreateOnlineRoom}
                disabled={loading}
                className="btn-primary w-full min-h-[44px] flex items-center justify-center gap-2 font-bold"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-bg border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                ) : (
                  <span>Create Session Room</span>
                )}
              </button>
            </div>

            {/* Join Room Block */}
            <div className="card p-6">
              <h3 className="text-lg font-bold mb-2">Join a Room</h3>
              <p className="text-xs opacity-75 mb-4">
                Enter the room code shared by your participant to connect to their session.
              </p>
              <form onSubmit={handleJoinOnlineRoom} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="e.g. AB12X7QK"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full min-h-[44px] px-3 font-mono font-bold uppercase rounded-lg border border-border bg-bg text-text"
                  aria-label="Enter room code"
                />
                <button
                  type="submit"
                  disabled={loading || !joinCode.trim()}
                  className="btn-primary w-full min-h-[44px] flex items-center justify-center font-bold"
                >
                  Join Session
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* ONLINE Room Created Waiting Block */}
      {createdSession && (
        <div className="card p-8 flex flex-col items-center text-center gap-6 max-w-md mx-auto">
          <span className="text-4xl" aria-hidden="true">🎉</span>
          <h2 className="text-xl font-bold">Your communication room is ready</h2>
          <p className="text-xs opacity-75">
            Share this room code with the person you want to communicate with.
          </p>

          <div className="w-full py-4 bg-bg border border-border rounded-lg select-all">
            <span className="text-3xl font-mono font-black tracking-widest text-primary">
              {createdSession.roomCode}
            </span>
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={handleCopyCode}
              className="btn-secondary flex-1 min-h-[44px] flex items-center justify-center font-bold text-xs"
            >
              {copied ? '✓ Copied!' : 'Copy Code'}
            </button>
            <button
              onClick={async () => {
                try {
                  await startSession(createdSession.id, accessToken);
                  if (import.meta.env.DEV) {
                    console.log('[SignBridge Debug] Session started');
                  }
                  navigate(`/communicate/online/${createdSession.id}`);
                } catch (err: any) {
                  setError(err?.message || 'Failed to start call.');
                }
              }}
              className="btn-primary flex-1 min-h-[44px] flex items-center justify-center font-bold text-xs"
            >
              Start Call
            </button>
          </div>

          <button
            onClick={() => {
              setCreatedSession(null);
              setSelectedMode(null);
            }}
            className="text-xs text-red-500 hover:underline font-bold"
          >
            Cancel Session
          </button>
        </div>
      )}

    </div>
  );
};
export default CommunicatePage;
