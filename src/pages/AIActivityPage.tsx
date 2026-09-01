import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Info, CheckCircle2, AlertTriangle, XCircle, Cpu, Clock } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { AgentLogEntry } from '@/types';

const typeConfig = {
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50', ring: 'ring-blue-200' },
  success: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', ring: 'ring-emerald-200' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', ring: 'ring-amber-200' },
  error: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', ring: 'ring-red-200' },
};

type FilterType = 'All' | 'info' | 'success' | 'warning' | 'error';

export function AIActivityPage() {
  const { agentLogs } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('All');

  const sortedLogs = useMemo(() => {
    let logs = [...agentLogs];
    if (filter !== 'All') {
      logs = logs.filter((l) => l.type === filter);
    }
    return logs;
  }, [agentLogs, filter]);

  const groupedByClaim = useMemo(() => {
    const groups = new Map<string, AgentLogEntry[]>();
    sortedLogs.forEach((log) => {
      const existing = groups.get(log.claimId) || [];
      existing.push(log);
      groups.set(log.claimId, existing);
    });
    return Array.from(groups.entries()).sort((a, b) => {
      const lastA = a[1][a[1].length - 1];
      const lastB = b[1][b[1].length - 1];
      return lastB.timestamp.localeCompare(lastA.timestamp);
    });
  }, [sortedLogs]);

  const filters: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'All' },
    { label: 'Info', value: 'info' },
    { label: 'Success', value: 'success' },
    { label: 'Warning', value: 'warning' },
    { label: 'Error', value: 'error' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Activity Log</h1>
        <p className="mt-1 text-sm text-gray-500">Real-time AI agent workflow activity and decision processing log.</p>
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
        </span>
        AI Agent Active — {agentLogs.length} events logged
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              filter === f.value
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Agent log timeline */}
      <div className="space-y-4">
        {groupedByClaim.map(([claimId, logs]) => (
          <div key={claimId} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-5 py-3">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-blue-500" />
                <span className="font-mono text-sm font-semibold text-blue-600">{claimId}</span>
              </div>
              <button
                onClick={() => navigate(`/claims/${claimId}`)}
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                View Claim →
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {logs.map((log) => {
                const cfg = typeConfig[log.type];
                return (
                  <div key={log.id} className="flex items-start gap-3 px-5 py-3 transition hover:bg-gray-50/50">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.bg} ring-1 ring-inset ${cfg.ring}`}>
                      <cfg.icon className={`h-4 w-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{log.message}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      {log.timestamp}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {groupedByClaim.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <Activity className="h-10 w-10 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">No activity logs match your filter.</p>
        </div>
      )}
    </div>
  );
}
