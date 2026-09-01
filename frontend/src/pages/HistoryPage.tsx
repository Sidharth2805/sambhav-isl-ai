import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSessions } from '../utils/communicationApi';
import type { CommunicationSessionDto } from '../utils/communicationApi';

export const HistoryPage: React.FC = () => {
  const { accessToken } = useAuth();
  const [sessions, setSessions] = useState<CommunicationSessionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await getSessions(accessToken);
        setSessions(data);
      } catch (err: any) {
        console.error('Failed to retrieve session history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [accessToken]);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto animate-fadeIn font-['Inter',sans-serif]">
      
      {/* Header */}
      <header className="border-b border-[#e0e3e5] dark:border-[#2d3133] pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#fe9832] text-[28px]">history</span>
            <h1 className="text-3xl font-bold text-[#030813] dark:text-white tracking-tight">Communication History</h1>
          </div>
          <p className="text-sm text-[#45474c] dark:text-[#c1c6d7] mt-1">
            Access your past communication history.
          </p>
        </div>
      </header>

      {/* Content List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-[#45474c] dark:text-[#828796] animate-pulse">
          Loading communication logs...
        </div>
      ) : sessions.length > 0 ? (
        <div className="space-y-3">
          {sessions.map((call) => {
            const isCallActive = call.status === 'ACTIVE' || call.status === 'WAITING' || call.status === 'CREATED';

            return (
              <div
                key={call.id}
                className="bg-white dark:bg-[#1a202c] rounded-2xl p-5 border border-[#e0e3e5] dark:border-[#2d3133] shadow-sm hover:border-[#fe9832] transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#030813]/5 dark:bg-white/5 text-[#030813] dark:text-white flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">videocam</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-sm text-[#030813] dark:text-white">
                        Room Code: <span className="font-mono text-[#fe9832]">{call.roomCode || call.id.substring(0, 8)}</span>
                      </span>
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                        isCallActive
                          ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}>
                        {call.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#45474c] dark:text-[#828796]">
                      Created on {new Date(call.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {call.roomCode && (
                    <button
                      onClick={() => handleCopyText(call.roomCode || '', call.id)}
                      className="px-3 py-1.5 bg-[#f1f4f6] dark:bg-[#2d3133] hover:bg-[#e0e3e5] text-[#030813] dark:text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {copiedId === call.id ? 'check' : 'content_copy'}
                      </span>
                      <span>{copiedId === call.id ? 'Copied' : 'Copy Code'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center text-xs text-[#45474c] dark:text-[#828796]">
          No communication history found.
        </div>
      )}

    </div>
  );
};

export default HistoryPage;
