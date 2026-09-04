import React, { useState } from 'react';
import { AuditLog } from '../../../types';
import {
  ShieldAlert,
  Search,
  RefreshCw,
  Clock,
  User,
  Activity,
  ChevronDown,
  ChevronRight,
  Filter,
  FileCode,
} from 'lucide-react';

interface AdminAuditLogsTabProps {
  auditLogs: AuditLog[];
  onRefresh: () => Promise<void>;
  showToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminAuditLogsTab: React.FC<AdminAuditLogsTabProps> = ({
  auditLogs,
  onRefresh,
  showToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const filteredLogs = auditLogs.filter((log) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      log.adminEmail.toLowerCase().includes(term) ||
      log.action.toLowerCase().includes(term) ||
      (log.targetId && log.targetId.toLowerCase().includes(term)) ||
      (log.details && log.details.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    if (actionFilter === 'all') return true;
    return log.action.includes(actionFilter) || log.targetType === actionFilter;
  });

  const getActionBadgeColor = (action: string) => {
    if (action.includes('delete') || action.includes('ban') || action.includes('reject')) {
      return 'bg-rose-950 text-rose-400 border-rose-800';
    }
    if (action.includes('approve') || action.includes('activate') || action.includes('create')) {
      return 'bg-emerald-950 text-emerald-400 border-emerald-800';
    }
    return 'bg-blue-950 text-blue-400 border-blue-800';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Immutable Security Ledger</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Administrative Audit Trail</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Every privileged action, ban, manual subscription approval, and settings change is cryptographically logged.
          </p>
        </div>

        <button
          onClick={() => onRefresh()}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer flex items-center gap-2 text-xs font-semibold"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit trail by admin, action, target ID..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {(
            [
              { id: 'all', label: 'All Operations' },
              { id: 'user', label: 'Users & Bans' },
              { id: 'p2p', label: 'P2P Payments' },
              { id: 'store', label: 'Stores & Products' },
              { id: 'admin_settings', label: 'System Settings' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setActionFilter(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                actionFilter === item.id
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="divide-y divide-slate-800/80">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No audit logs matching query.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              return (
                <div
                  key={log.id}
                  className="p-4 hover:bg-slate-800/30 transition-colors"
                >
                  <div
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 shrink-0">
                        <Activity className="w-4 h-4" />
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-xs">{log.adminEmail}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${getActionBadgeColor(
                              log.action
                            )}`}
                          >
                            {log.action}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">Target: {log.targetType}/{log.targetId}</span>
                        </div>

                        <div className="text-xs text-slate-400 truncate max-w-xl">
                          {log.details || `Performed ${log.action} on ${log.targetId}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded JSON State Diff */}
                  {isExpanded && (
                    <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3 animate-fadeIn text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Previous State (Old Value)
                          </span>
                          <pre className="text-[11px] text-rose-300 font-mono overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(log.oldValue, null, 2) || 'null'}
                          </pre>
                        </div>

                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            New State (New Value)
                          </span>
                          <pre className="text-[11px] text-emerald-300 font-mono overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(log.newValue, null, 2) || 'null'}
                          </pre>
                        </div>
                      </div>

                      {log.userAgent && (
                        <div className="text-[10px] text-slate-500 font-mono">
                          Client User-Agent: {log.userAgent}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
