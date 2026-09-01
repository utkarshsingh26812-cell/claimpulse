import type { RiskLevel, Decision, ClaimStatus, WarrantyStatus, StepStatus } from '@/types';
import { CheckCircle2, AlertTriangle, Clock, XCircle, Loader2 } from 'lucide-react';

export function RiskBadge({ level }: { level: RiskLevel }) {
  const styles: Record<RiskLevel, string> = {
    Low: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    Medium: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    High: 'bg-orange-50 text-orange-700 ring-orange-600/20',
    Critical: 'bg-red-50 text-red-700 ring-red-600/20',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[level]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${
        level === 'Low' ? 'bg-emerald-500' : level === 'Medium' ? 'bg-amber-500' : level === 'High' ? 'bg-orange-500' : 'bg-red-500'
      }`} />
      {level}
    </span>
  );
}

export function DecisionBadge({ decision }: { decision: Decision }) {
  const styles: Record<Decision, string> = {
    REPAIR: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    REPLACE: 'bg-violet-50 text-violet-700 ring-violet-600/20',
    REFUND: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    DENY: 'bg-red-50 text-red-700 ring-red-600/20',
    PENDING: 'bg-gray-50 text-gray-600 ring-gray-500/20',
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${styles[decision]}`}>
      {decision}
    </span>
  );
}

export function StatusBadge({ status }: { status: ClaimStatus }) {
  const styles: Record<ClaimStatus, string> = {
    Pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    Approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    Rejected: 'bg-red-50 text-red-700 ring-red-600/20',
    'Under Review': 'bg-blue-50 text-blue-700 ring-blue-600/20',
  };
  const icons: Record<ClaimStatus, typeof Clock> = {
    Pending: Clock,
    Approved: CheckCircle2,
    Rejected: XCircle,
    'Under Review': AlertTriangle,
  };
  const Icon = icons[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status]}`}>
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}

export function WarrantyBadge({ status }: { status: WarrantyStatus }) {
  const styles: Record<WarrantyStatus, string> = {
    Active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    Expired: 'bg-red-50 text-red-700 ring-red-600/20',
    'Expiring Soon': 'bg-amber-50 text-amber-700 ring-amber-600/20',
    Unknown: 'bg-gray-50 text-gray-600 ring-gray-500/20',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status]}`}>
      {status}
    </span>
  );
}

export function StepStatusIcon({ status }: { status: StepStatus }) {
  if (status === 'completed') return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
  if (status === 'processing') return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
  if (status === 'warning') return <AlertTriangle className="h-5 w-5 text-amber-500" />;
  return <Clock className="h-5 w-5 text-gray-300" />;
}
