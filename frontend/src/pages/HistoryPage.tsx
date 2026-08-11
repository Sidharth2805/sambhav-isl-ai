import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSessions } from '../utils/communicationApi';
import type { CommunicationSessionDto } from '../utils/communicationApi';

export const HistoryPage: React.FC = () => {
  const { accessToken } = useAuth();
  const [sessions, setSessions] = useState<CommunicationSessionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [modeFilter, setModeFilter] = useState<'ALL' | 'ONLINE' | 'OFFLINE'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await getSessions(accessToken);
        setSessions(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to retrieve session history. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [accessToken]);

  const filteredSessions = sessions.filter((session) => {
    const matchMode = modeFilter === 'ALL' || session.mode === modeFilter;
    const matchStatus = statusFilter === 'ALL' || session.status === statusFilter;
    return matchMode && matchStatus;
  });

  const getStatusBadge = (status: string) => {
    let classes = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    if (status === 'ACTIVE') {
      classes = 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400';
    } else if (status === 'ENDED') {
      classes = 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400';
    } else if (status === 'CANCELLED') {
      classes = 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400';
    } else if (status === 'WAITING') {
      classes = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400';
    }
    return (
      <span className={`inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full ${classes}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Communication History</h1>
        <p className="text-sm opacity-75">
          View and audit past SignBridge online and offline translation sessions.
        </p>
      </div>

      {/* Filter Options Bar */}
      <section className="card p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Mode Selector */}
          <div className="flex flex-col gap-1">
            <label htmlFor="filter-mode" className="text-xs font-bold opacity-75">Workspace Mode</label>
            <select
              id="filter-mode"
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value as any)}
              className="min-h-[40px] px-2.5 rounded-lg border border-border bg-bg text-text text-sm font-semibold"
            >
              <option value="ALL">All Modes</option>
              <option value="ONLINE">🎥 Online (Remote)</option>
              <option value="OFFLINE">🤟 Offline (Face-to-Face)</option>
            </select>
          </div>

          {/* Status Selector */}
          <div className="flex flex-col gap-1">
            <label htmlFor="filter-status" className="text-xs font-bold opacity-75">Call Status</label>
            <select
              id="filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="min-h-[40px] px-2.5 rounded-lg border border-border bg-bg text-text text-sm font-semibold"
            >
              <option value="ALL">All Statuses</option>
              <option value="CREATED">CREATED</option>
              <option value="WAITING">WAITING</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="ENDED">ENDED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>

        <div className="text-xs font-bold opacity-75">
          Showing {filteredSessions.length} record(s)
        </div>
      </section>

      {/* Audit Log list */}
      <section className="card p-6 flex flex-col gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3" role="status">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" aria-hidden="true" />
            <span className="text-sm opacity-70">Loading history records...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-10 text-center" role="alert">
            <span className="text-red-500 font-bold mb-2">⚠️ Connection Issue</span>
            <p className="text-sm opacity-75 max-w-md">{error}</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-4xl mb-2" aria-hidden="true">📭</span>
            <p className="text-sm font-semibold opacity-70">No session records match your filters.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className="p-5 rounded-lg border border-border bg-bg hover:border-primary transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-base">
                      {session.mode === 'ONLINE' ? '🎥 Online Call' : '🤟 Face-to-Face Translation'}
                    </span>
                    {getStatusBadge(session.status)}
                  </div>
                  
                  <div className="text-xs opacity-75 flex flex-wrap gap-x-4 gap-y-1">
                    {session.roomCode && (
                      <span>
                        <strong>Room Code:</strong> <span className="font-mono font-bold">{session.roomCode}</span>
                      </span>
                    )}
                    <span>
                      <strong>Created:</strong> {new Date(session.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="text-xs opacity-75 text-left md:text-right flex flex-col gap-1">
                  {session.startedAt && (
                    <span>
                      <strong>Started:</strong> {new Date(session.startedAt).toLocaleTimeString()}
                    </span>
                  )}
                  {session.endedAt && (
                    <span>
                      <strong>Ended:</strong> {new Date(session.endedAt).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};
export default HistoryPage;
