import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle2, XCircle, AlertTriangle, Timer, TrendingUp, ArrowRight, Plus } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { RiskBadge, DecisionBadge, StatusBadge } from '@/components/Badges';
import { BarChart, DonutChart, ProgressBar } from '@/components/Charts';

export function DashboardPage() {
  const { claims } = useApp();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const total = claims.length;
    const pending = claims.filter((c) => c.status === 'Pending' || c.status === 'Under Review').length;
    const approved = claims.filter((c) => c.status === 'Approved').length;
    const rejected = claims.filter((c) => c.status === 'Rejected').length;
    const recallAlerts = claims.filter((c) => c.potentialBatchIssue).length;
    const avgProcessing = '3.2 days';

    return { total, pending, approved, rejected, recallAlerts, avgProcessing };
  }, [claims]);

  const decisionStats = useMemo(() => {
    const counts = { REPAIR: 0, REPLACE: 0, REFUND: 0, DENY: 0, PENDING: 0 };
    claims.forEach((c) => {
      const d = c.finalDecision || c.aiRecommendation;
      counts[d] = (counts[d] || 0) + 1;
    });
    return counts;
  }, [claims]);

  const riskDistribution = useMemo(() => {
    const counts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    claims.forEach((c) => { counts[c.riskLevel]++; });
    return counts;
  }, [claims]);

  const recentClaims = useMemo(() => {
    return [...claims].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);
  }, [claims]);

  const statCards = [
    { label: 'Total Claims', value: stats.total, icon: FileText, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-600' },
    { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', text: 'text-amber-600' },
    { label: 'Approved', value: stats.approved, icon: CheckCircle2, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'from-red-500 to-red-600', bg: 'bg-red-50', text: 'text-red-600' },
    { label: 'Recall Alerts', value: stats.recallAlerts, icon: AlertTriangle, color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50', text: 'text-orange-600' },
    { label: 'Avg Processing', value: stats.avgProcessing, icon: Timer, color: 'from-cyan-500 to-cyan-600', bg: 'bg-cyan-50', text: 'text-cyan-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Overview of warranty claims and AI analysis activity.</p>
        </div>
        <button
          onClick={() => navigate('/claims/new')}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Claim
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.text}`} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="mt-0.5 text-xs font-medium text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recall alert banner */}
      {stats.recallAlerts > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-orange-900">Potential Product Recall Detected</h3>
            <p className="mt-0.5 text-sm text-orange-700">
              {stats.recallAlerts} claims flagged with potential batch-level issues. Review Batch Intelligence for details.
            </p>
          </div>
          <button
            onClick={() => navigate('/batch')}
            className="inline-flex items-center gap-1 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-700"
          >
            View Batches
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent claims */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-base font-semibold text-gray-900">Recent Claims</h2>
              <button onClick={() => navigate('/claims')} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                View all
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500">Claim ID</th>
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500">Customer</th>
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500">Product</th>
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500">Risk</th>
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500">AI Rec.</th>
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentClaims.map((claim) => (
                    <tr
                      key={claim.id}
                      onClick={() => navigate(`/claims/${claim.id}`)}
                      className="cursor-pointer transition hover:bg-blue-50/30"
                    >
                      <td className="px-5 py-3 font-medium text-blue-600">{claim.id}</td>
                      <td className="px-5 py-3 text-gray-700">{claim.customer}</td>
                      <td className="px-5 py-3 text-gray-600 max-w-[160px] truncate">{claim.product}</td>
                      <td className="px-5 py-3"><RiskBadge level={claim.riskLevel} /></td>
                      <td className="px-5 py-3"><DecisionBadge decision={claim.finalDecision || claim.aiRecommendation} /></td>
                      <td className="px-5 py-3"><StatusBadge status={claim.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Decision statistics */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">Decision Statistics</h2>
            <div className="mt-4">
              <DonutChart
                data={[
                  { label: 'Repair', value: decisionStats.REPAIR, color: '#3b82f6' },
                  { label: 'Replace', value: decisionStats.REPLACE, color: '#8b5cf6' },
                  { label: 'Refund', value: decisionStats.REFUND, color: '#10b981' },
                  { label: 'Deny', value: decisionStats.DENY, color: '#ef4444' },
                  { label: 'Pending', value: decisionStats.PENDING, color: '#9ca3af' },
                ]}
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">Claim Risk Overview</h2>
            <div className="mt-4 space-y-3">
              {([
                { label: 'Low', value: riskDistribution.Low, color: 'bg-emerald-500' },
                { label: 'Medium', value: riskDistribution.Medium, color: 'bg-amber-500' },
                { label: 'High', value: riskDistribution.High, color: 'bg-orange-500' },
                { label: 'Critical', value: riskDistribution.Critical, color: 'bg-red-500' },
              ] as const).map((r) => {
                const pct = claims.length > 0 ? (r.value / claims.length) * 100 : 0;
                return (
                  <div key={r.label}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-600">{r.label} Risk</span>
                      <span className="font-semibold text-gray-900">{r.value}</span>
                    </div>
                    <ProgressBar value={pct} color={r.color} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
