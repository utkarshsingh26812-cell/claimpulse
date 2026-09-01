import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, AlertTriangle, TrendingUp, TrendingDown, ArrowRight, ShieldAlert } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { mockBatches } from '@/data/mockData';
import { RiskBadge } from '@/components/Badges';
import { ProgressBar } from '@/components/Charts';

export function BatchIntelligencePage() {
  const { claims } = useApp();
  const navigate = useNavigate();

  const highRiskBatches = useMemo(
    () => mockBatches.filter((b) => b.riskLevel === 'High' || b.riskLevel === 'Critical'),
    []
  );

  const sortedBatches = useMemo(
    () => [...mockBatches].sort((a, b) => b.failureRate - a.failureRate),
    []
  );

  const recallBatches = mockBatches.filter((b) => b.failureRate > 2 || b.riskLevel === 'High');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Batch Intelligence</h1>
        <p className="mt-1 text-sm text-gray-500">Detect product batch failure patterns and potential recall situations.</p>
      </div>

      {/* Recall alert */}
      {recallBatches.length > 0 && (
        <div className="rounded-xl border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100">
              <ShieldAlert className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-orange-900">Potential Product Recall Detected</h2>
              <p className="mt-1 text-sm text-orange-700">
                {recallBatches.length} batches show abnormal failure rates exceeding the 2% threshold. Immediate review recommended.
              </p>
              <div className="mt-3 space-y-2">
                {recallBatches.map((b) => (
                  <div key={b.batchNumber} className="flex items-center gap-2 text-sm text-orange-800">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-semibold">{b.batchNumber}</span>
                    <span>— {b.similarFailures} similar {b.commonFault.toLowerCase()}</span>
                    <span>— Failure rate: {b.failureRate}%</span>
                    <span className="font-semibold">Risk: {b.riskLevel.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
            <Layers className="h-5 w-5 text-blue-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">{mockBatches.length}</p>
          <p className="text-xs text-gray-500">Active Batches</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">{recallBatches.length}</p>
          <p className="text-xs text-gray-500">Recall Alerts</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
            <TrendingDown className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {(mockBatches.reduce((sum, b) => sum + b.failureRate, 0) / mockBatches.length).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500">Avg Failure Rate</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
            <TrendingUp className="h-5 w-5 text-red-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {mockBatches.reduce((sum, b) => sum + b.totalClaims, 0)}
          </p>
          <p className="text-xs text-gray-500">Total Batch Claims</p>
        </div>
      </div>

      {/* Batch table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">Product Batches</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Batch Number</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Product</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Total Claims</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Total Units</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Failure Rate</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Common Fault</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Risk</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sortedBatches.map((batch) => (
                <tr key={batch.batchNumber} className="transition hover:bg-blue-50/30">
                  <td className="px-5 py-3 font-mono font-medium text-blue-600">{batch.batchNumber}</td>
                  <td className="px-5 py-3 text-gray-700 max-w-[160px] truncate">{batch.product}</td>
                  <td className="px-5 py-3 text-gray-600">{batch.totalClaims}</td>
                  <td className="px-5 py-3 text-gray-600">{batch.totalUnits.toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20">
                        <ProgressBar value={batch.failureRate * 10} color={batch.failureRate > 2 ? 'bg-red-500' : batch.failureRate > 0.5 ? 'bg-amber-500' : 'bg-emerald-500'} />
                      </div>
                      <span className="font-medium text-gray-900">{batch.failureRate}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-600 max-w-[160px] truncate">{batch.commonFault}</td>
                  <td className="px-5 py-3"><RiskBadge level={batch.riskLevel} /></td>
                  <td className="px-5 py-3 text-gray-600 max-w-[200px] truncate">{batch.recallRecommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed batch cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        {highRiskBatches.map((batch) => (
          <div key={batch.batchNumber} className="rounded-xl border border-orange-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-mono font-bold text-gray-900">{batch.batchNumber}</h3>
                <p className="text-sm text-gray-500">{batch.product}</p>
              </div>
              <RiskBadge level={batch.riskLevel} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">{batch.similarFailures}</p>
                <p className="text-xs text-gray-400">Similar Failures</p>
              </div>
              <div className="rounded-lg bg-red-50 p-3 text-center">
                <p className="text-2xl font-bold text-red-600">{batch.failureRate}%</p>
                <p className="text-xs text-gray-400">Failure Rate</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">{batch.totalClaims}</p>
                <p className="text-xs text-gray-400">Total Claims</p>
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-orange-50 p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-orange-700">
                <AlertTriangle className="h-4 w-4" />
                Recall Recommendation
              </p>
              <p className="mt-1 text-sm text-gray-700">{batch.recallRecommendation}</p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">Common fault: <span className="font-medium text-gray-700">{batch.commonFault}</span></span>
              <button
                onClick={() => navigate('/claims')}
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View Related Claims
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
