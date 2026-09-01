import { useMemo } from 'react';
import { TrendingUp, Clock, CheckCircle2, AlertTriangle, BarChart3, PieChart, Activity } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { BarChart, DonutChart, LineChart, ProgressBar } from '@/components/Charts';

export function AnalyticsPage() {
  const { claims } = useApp();

  const decisionData = useMemo(() => {
    const counts = { REPAIR: 0, REPLACE: 0, REFUND: 0, DENY: 0, PENDING: 0 };
    claims.forEach((c) => {
      const d = c.finalDecision || c.aiRecommendation;
      counts[d] = (counts[d] || 0) + 1;
    });
    return counts;
  }, [claims]);

  const productData = useMemo(() => {
    const map = new Map<string, number>();
    claims.forEach((c) => {
      const shortName = c.product.length > 20 ? c.product.slice(0, 20) + '...' : c.product;
      map.set(shortName, (map.get(shortName) || 0) + 1);
    });
    return Array.from(map.entries()).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [claims]);

  const approvalRate = useMemo(() => {
    const approved = claims.filter((c) => c.status === 'Approved').length;
    const decided = claims.filter((c) => c.status === 'Approved' || c.status === 'Rejected').length;
    return decided > 0 ? Math.round((approved / decided) * 100) : 0;
  }, [claims]);

  const faultCategories = useMemo(() => {
    const map = new Map<string, number>();
    claims.forEach((c) => {
      const category = c.faultClassification.split('—')[0].trim() || 'Other';
      map.set(category, (map.get(category) || 0) + 1);
    });
    return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
  }, [claims]);

  const highRiskCount = useMemo(() => claims.filter((c) => c.riskLevel === 'High' || c.riskLevel === 'Critical').length, [claims]);

  const monthlyData = useMemo(() => {
    const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
    return months.map((label, i) => ({
      label,
      value: Math.floor(Math.random() * 15) + 5 + i * 2,
    }));
  }, []);

  const recallTrend = useMemo(() => {
    const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
    return months.map((label, i) => ({
      label,
      value: Math.floor(Math.random() * 3) + (i > 4 ? 2 : 0),
    }));
  }, []);

  const avgConfidence = useMemo(() => {
    return Math.round(claims.reduce((sum, c) => sum + c.confidenceScore, 0) / claims.length);
  }, [claims]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">Warranty claim trends, decision breakdowns, and risk insights.</p>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">{approvalRate}%</p>
          <p className="text-xs text-gray-500">Warranty Approval Rate</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">3.2 days</p>
          <p className="text-xs text-gray-500">Avg Processing Time</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">{highRiskCount}</p>
          <p className="text-xs text-gray-500">High-Risk Claims</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50">
            <Activity className="h-5 w-5 text-cyan-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">{avgConfidence}%</p>
          <p className="text-xs text-gray-500">Avg AI Confidence</p>
        </div>
      </div>

      {/* Charts grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Claims by Decision */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <PieChart className="h-5 w-5 text-blue-500" />
            Claims by Decision
          </h2>
          <div className="mt-4 flex justify-center">
            <DonutChart
              data={[
                { label: 'Repair', value: decisionData.REPAIR, color: '#3b82f6' },
                { label: 'Replace', value: decisionData.REPLACE, color: '#8b5cf6' },
                { label: 'Refund', value: decisionData.REFUND, color: '#10b981' },
                { label: 'Deny', value: decisionData.DENY, color: '#ef4444' },
                { label: 'Pending', value: decisionData.PENDING, color: '#9ca3af' },
              ]}
            />
          </div>
        </div>

        {/* Claims by Product */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Claims by Product
          </h2>
          <div className="mt-6">
            <BarChart
              data={productData.map((p, i) => ({
                ...p,
                color: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'][i],
              }))}
              height={180}
            />
          </div>
        </div>

        {/* Monthly claim volume */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Monthly Claim Volume
          </h2>
          <div className="mt-6">
            <LineChart data={monthlyData} height={140} />
          </div>
        </div>

        {/* Potential recall trends */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Potential Recall Trends
          </h2>
          <div className="mt-6">
            <LineChart data={recallTrend} height={140} />
          </div>
        </div>

        {/* Fault categories */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Fault Categories
          </h2>
          <div className="mt-6">
            <BarChart
              data={faultCategories.map((f, i) => ({
                ...f,
                color: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'][i % 6],
              }))}
              height={180}
            />
          </div>
        </div>

        {/* Risk distribution */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <Activity className="h-5 w-5 text-blue-500" />
            Risk Distribution
          </h2>
          <div className="mt-6 space-y-4">
            {([
              { label: 'Low Risk', value: claims.filter((c) => c.riskLevel === 'Low').length, color: 'bg-emerald-500' },
              { label: 'Medium Risk', value: claims.filter((c) => c.riskLevel === 'Medium').length, color: 'bg-amber-500' },
              { label: 'High Risk', value: claims.filter((c) => c.riskLevel === 'High').length, color: 'bg-orange-500' },
              { label: 'Critical Risk', value: claims.filter((c) => c.riskLevel === 'Critical').length, color: 'bg-red-500' },
            ] as const).map((r) => {
              const pct = claims.length > 0 ? (r.value / claims.length) * 100 : 0;
              return (
                <div key={r.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-600">{r.label}</span>
                    <span className="font-semibold text-gray-900">{r.value} ({Math.round(pct)}%)</span>
                  </div>
                  <ProgressBar value={pct} color={r.color} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
