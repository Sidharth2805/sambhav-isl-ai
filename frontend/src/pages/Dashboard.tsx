import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSessions, createSession, startSession } from '../utils/communicationApi';
import type { CommunicationSessionDto } from '../utils/communicationApi';

export const Dashboard: React.FC = () => {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState<CommunicationSessionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingMode, setStartingMode] = useState<'ONLINE' | 'OFFLINE' | null>(null);

  useEffect(() => {
    const fetchRecentSessions = async () => {
      try {
        setLoading(true);
        const data = await getSessions(accessToken);
        setSessions(data.slice(0, 5)); // show top 5 recent sessions
      } catch (err: any) {
        setError(err?.message || 'We couldn\'t load your recent sessions. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecentSessions();
  }, [accessToken]);

  const handleStartSession = async (mode: 'ONLINE' | 'OFFLINE') => {
    try {
      setStartingMode(mode);
      const session = await createSession(mode, accessToken);
      if (mode === 'ONLINE') {
        // Go to waiting screen/join screen
        navigate(`/communicate/online/${session.id}`);
      } else {
        // Start offline session and navigate to offline workspace
        await startSession(session.id, accessToken);
        navigate(`/communicate/offline/${session.id}`);
      }
    } catch (err: any) {
      alert(err?.message || `Failed to create ${mode} session.`);
    } finally {
      setStartingMode(null);
    }
  };

  const getStatusBadge = (status: string) => {
    let classes = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    let icon = '●';
    if (status === 'ACTIVE') {
      classes = 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400';
      icon = '●';
    } else if (status === 'ENDED') {
      classes = 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400';
      icon = '✓';
    } else if (status === 'CANCELLED') {
      classes = 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400';
      icon = '✖';
    } else if (status === 'WAITING') {
      classes = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400';
      icon = '⏰';
    }

    return (
      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${classes}`}>
        <span>{icon}</span> {status}
      </span>
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* Header section */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
          {getGreeting()}, {user?.name}
        </h1>
        <p className="text-sm md:text-base opacity-75 max-w-2xl">
          SignBridge facilitates communication between individuals using Indian Sign Language (ISL) and spoken or written text. Select a workspace below to start.
        </p>
      </div>

      {/* Quick Action Mode Selection */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ONLINE Session Card */}
        <div className="card flex flex-col justify-between p-6 gap-6 hover:border-primary transition-all duration-200">
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-primary/10 text-primary" aria-hidden="true">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Online Communication</h2>
            <p className="text-sm opacity-85">
              Connect with another participant remotely. Share video feeds, real-time sign recognition previews, text messaging, and audio output inside a private virtual call room.
            </p>
          </div>
          <button
            onClick={() => handleStartSession('ONLINE')}
            disabled={startingMode !== null}
            className="btn-primary w-full mt-4 flex items-center justify-center gap-2 min-h-[44px]"
            aria-label="Start remote online communication room"
          >
            {startingMode === 'ONLINE' ? (
              <>
                <div className="w-5 h-5 border-2 border-bg border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                <span>Creating Session...</span>
              </>
            ) : (
              <span>Start Online Session</span>
            )}
          </button>
        </div>

        {/* OFFLINE Session Card */}
        <div className="card flex flex-col justify-between p-6 gap-6 hover:border-primary transition-all duration-200">
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-accent/10 text-accent" aria-hidden="true">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11a13.916 13.916 0 00-1.6-6.73l-.059-.102m0 0l-.178-.299A14.022 14.022 0 003 11c0 2.292.55 4.456 1.528 6.37l.079.15m1.025-11.89a13.983 13.983 0 014.853-2.12m0 0a13.96 13.96 0 018 2.12m-8-2.12v13.6m6-13.6a13.98 13.98 0 01-3.675 8.35m3.675-8.35a13.98 13.98 0 011.66 6.371m-2.148-2.58A13.98 13.98 0 0015 11c0-2.292-.55-4.456-1.528-6.37" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Offline Communication</h2>
            <p className="text-sm opacity-85">
              Communicate face-to-face in the same physical space. Use the camera to capture Indian Sign Language gestures for live translation into spoken text.
            </p>
          </div>
          <button
            onClick={() => handleStartSession('OFFLINE')}
            disabled={startingMode !== null}
            className="btn-primary w-full mt-4 flex items-center justify-center gap-2 min-h-[44px]"
            aria-label="Start face-to-face offline sign language translation"
          >
            {startingMode === 'OFFLINE' ? (
              <>
                <div className="w-5 h-5 border-2 border-bg border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                <span>Creating Session...</span>
              </>
            ) : (
              <span>Start Offline Workspace</span>
            )}
          </button>
        </div>

      </section>

      {/* Recent Sessions list */}
      <section className="card flex flex-col gap-4">
        <h2 className="text-xl font-bold border-b border-border pb-2">
          Recent Sessions
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2" role="status" aria-live="polite">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" aria-hidden="true" />
            <span className="text-sm opacity-70">Loading recent session activity...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center" role="alert">
            <span className="text-red-500 font-bold mb-2">⚠️ Error loading sessions</span>
            <p className="text-sm opacity-75 max-w-md">{error}</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border rounded-lg bg-bg/50">
            <span className="text-3xl mb-2" aria-hidden="true">🤟</span>
            <p className="text-sm font-semibold opacity-75">No recent conversations found</p>
            <p className="text-xs opacity-60 mt-1">Start your first communication session using the cards above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider opacity-60">
                  <th className="py-3 px-4 font-bold">Mode</th>
                  <th className="py-3 px-4 font-bold">Room Code</th>
                  <th className="py-3 px-4 font-bold">Date & Time</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id} className="border-b border-border hover:bg-bg/50">
                    <td className="py-3 px-4 font-semibold flex items-center gap-2">
                      <span>{session.mode === 'ONLINE' ? '🎥 Remote' : '🤟 Face-to-Face'}</span>
                    </td>
                    <td className="py-3 px-4 select-all font-mono font-bold opacity-80">
                      {session.roomCode || 'N/A'}
                    </td>
                    <td className="py-3 px-4 opacity-75">
                      {new Date(session.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(session.status)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          if (session.mode === 'ONLINE') {
                            navigate(`/communicate/online/${session.id}`);
                          } else {
                            navigate(`/communicate/offline/${session.id}`);
                          }
                        }}
                        className="text-primary hover:underline font-bold text-xs"
                      >
                        Open Session
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
};
export default Dashboard;
