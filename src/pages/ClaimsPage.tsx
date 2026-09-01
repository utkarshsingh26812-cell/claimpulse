import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Plus, Filter, FileText } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { RiskBadge, DecisionBadge, StatusBadge, WarrantyBadge } from '@/components/Badges';
import type { RiskLevel } from '@/types';

type FilterType = 'All' | 'Pending' | 'Approved' | 'Rejected' | 'High Risk' | 'Potential Recall';

export function ClaimsPage() {
  const { claims } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [search, setSearch] = useState(initialQuery);
  const [filter, setFilter] = useState<FilterType>('All');

  const filtered = useMemo(() => {
    let result = [...claims];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) =>
        c.id.toLowerCase().includes(q) ||
        c.customer.toLowerCase().includes(q) ||
        c.product.toLowerCase().includes(q) ||
        c.fault.toLowerCase().includes(q) ||
        c.serialNumber.toLowerCase().includes(q)
      );
    }

    switch (filter) {
      case 'Pending':
        result = result.filter((c) => c.status === 'Pending' || c.status === 'Under Review');
        break;
      case 'Approved':
        result = result.filter((c) => c.status === 'Approved');
        break;
      case 'Rejected':
        result = result.filter((c) => c.status === 'Rejected');
        break;
      case 'High Risk':
        result = result.filter((c) => c.riskLevel === 'High' || c.riskLevel === 'Critical');
        break;
      case 'Potential Recall':
        result = result.filter((c) => c.potentialBatchIssue);
        break;
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [claims, search, filter]);

  const filterCounts = useMemo(() => {
    const counts = { All: claims.length, Pending: 0, Approved: 0, Rejected: 0, 'High Risk': 0, 'Potential Recall': 0 };
    claims.forEach((c) => {
      if (c.status === 'Pending' || c.status === 'Under Review') counts.Pending++;
      if (c.status === 'Approved') counts.Approved++;
      if (c.status === 'Rejected') counts.Rejected++;
      if (c.riskLevel === 'High' || c.riskLevel === 'Critical') counts['High Risk']++;
      if (c.potentialBatchIssue) counts['Potential Recall']++;
    });
    return counts;
  }, [claims]);

  const filters: FilterType[] = ['All', 'Pending', 'Approved', 'Rejected', 'High Risk', 'Potential Recall'];

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Claims</h1>
          <p className="mt-1 text-sm text-gray-500">All warranty and return claims with AI recommendations.</p>
        </div>
        <button
          onClick={() => navigate('/claims/new')}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Claim
        </button>
      </div>

      {/* Search + Filters */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, customer, product, fault..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f}
              <span className={`rounded-full px-1.5 py-0.5 text-xs ${filter === f ? 'bg-white/20' : 'bg-gray-100'}`}>
                {filterCounts[f]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Claims table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Claim ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Product</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Purchase Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Warranty</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Fault</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Risk</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">AI Rec.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center">
                    <FileText className="mx-auto h-10 w-10 text-gray-300" />
                    <p className="mt-2 text-sm text-gray-500">No claims match your filters.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((claim) => (
                  <tr
                    key={claim.id}
                    onClick={() => navigate(`/claims/${claim.id}`)}
                    className="cursor-pointer transition hover:bg-blue-50/30"
                  >
                    <td className="px-4 py-3 font-medium text-blue-600">{claim.id}</td>
                    <td className="px-4 py-3 text-gray-700">{claim.customer}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate">{claim.product}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(claim.purchaseDate)}</td>
                    <td className="px-4 py-3"><WarrantyBadge status={claim.warrantyStatus} /></td>
                    <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate">{claim.fault}</td>
                    <td className="px-4 py-3"><RiskBadge level={claim.riskLevel} /></td>
                    <td className="px-4 py-3"><DecisionBadge decision={claim.finalDecision || claim.aiRecommendation} /></td>
                    <td className="px-4 py-3"><StatusBadge status={claim.status} /></td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(claim.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
