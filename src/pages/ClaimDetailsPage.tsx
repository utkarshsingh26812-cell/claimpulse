import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Package, Calendar, Store, Shield, FileText, Cpu, AlertTriangle,
  CheckCircle2, XCircle, Loader2, Clock, Wrench, History, Search, Layers,
  Sparkles, ClipboardCheck, Download, Send, Truck, FileCheck, ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { RiskBadge, DecisionBadge, StatusBadge, WarrantyBadge, StepStatusIcon } from '@/components/Badges';
import { ProgressBar } from '@/components/Charts';
import type { Decision } from '@/types';

const stepIcons = [FileText, Shield, Cpu, Search, History, AlertTriangle, Layers, Sparkles];

export function ClaimDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getClaim, approveClaim, rejectClaim, modifyClaim } = useApp();
  const claim = id ? getClaim(id) : undefined;

  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [reviewMode, setReviewMode] = useState<'none' | 'approve' | 'modify' | 'reject'>('none');
  const [modifiedDecision, setModifiedDecision] = useState<Decision>('REPAIR');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  // Animate AI steps on mount
  useEffect(() => {
    if (!claim) return;
    setAnalysisStarted(true);
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i <= claim.aiSteps.length; i++) {
      const t = setTimeout(() => setVisibleSteps(i), i * 500);
      timers.push(t);
    }
    timersRef.current = timers;
    return () => timers.forEach(clearTimeout);
  }, [claim?.id]);

  if (!claim) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <p className="text-gray-500">Claim not found.</p>
        <button onClick={() => navigate('/claims')} className="mt-4 text-sm font-medium text-blue-600">Back to Claims</button>
      </div>
    );
  }

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const formatDateTime = (iso: string) => new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const isPending = claim.status === 'Pending' || claim.status === 'Under Review';
  const isApproved = claim.status === 'Approved';

  const handleApprove = () => {
    if (!claim) return;
    approveClaim(claim.id, claim.aiRecommendation, reviewerNotes || 'AI recommendation approved by reviewer.');
    setReviewMode('none');
    setReviewerNotes('');
  };

  const handleModify = () => {
    if (!claim) return;
    modifyClaim(claim.id, modifiedDecision, reviewerNotes);
    setReviewMode('none');
    setReviewerNotes('');
  };

  const handleReject = () => {
    if (!claim) return;
    rejectClaim(claim.id, reviewerNotes || 'Claim rejected by reviewer.');
    setReviewMode('none');
    setReviewerNotes('');
  };

  const decisionColors: Record<Decision, string> = {
    REPAIR: 'from-blue-500 to-blue-600',
    REPLACE: 'from-violet-500 to-violet-600',
    REFUND: 'from-emerald-500 to-emerald-600',
    DENY: 'from-red-500 to-red-600',
    PENDING: 'from-gray-400 to-gray-500',
  };

  const infoSections = [
    {
      title: 'Customer Information', icon: User, items: [
        { label: 'Name', value: claim.customer },
        { label: 'Email', value: claim.email },
      ]
    },
    {
      title: 'Product Information', icon: Package, items: [
        { label: 'Product', value: claim.product },
        { label: 'Serial Number', value: claim.serialNumber },
        { label: 'Batch', value: claim.batchNumber },
      ]
    },
    {
      title: 'Purchase Information', icon: Calendar, items: [
        { label: 'Purchase Date', value: formatDate(claim.purchaseDate) },
        { label: 'Retailer', value: claim.retailer },
        { label: 'Claim Type', value: claim.claimType },
      ]
    },
    {
      title: 'Warranty Information', icon: Shield, items: [
        { label: 'Status', value: claim.warrantyStatus, badge: true },
        { label: 'Warranty Period', value: `${claim.warrantyMonths} months` },
        { label: 'Expiry Date', value: formatDate(claim.warrantyExpiry) },
      ]
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/claims')} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{claim.id}</h1>
              <StatusBadge status={claim.status} />
            </div>
            <p className="mt-0.5 text-sm text-gray-500">{claim.customer} • {claim.product}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RiskBadge level={claim.riskLevel} />
          <DecisionBadge decision={claim.finalDecision || claim.aiRecommendation} />
        </div>
      </div>

      {/* AI-assisted label */}
      <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">
        <Sparkles className="h-4 w-4" />
        AI-assisted decision • Human approval required
      </div>

      {/* Info sections */}
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {infoSections.map((section) => (
          <div key={section.title} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <section.icon className="h-4 w-4 text-blue-500" />
              {section.title}
            </h3>
            <dl className="mt-3 space-y-2">
              {section.items.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <dt className="text-gray-500">{item.label}</dt>
                  <dd className="font-medium text-gray-900">
                    {item.badge ? <WarrantyBadge status={claim.warrantyStatus} /> : item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      {/* Problem description + evidence */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            Problem Description
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">{claim.problemDescription}</p>
          <div className="mt-4 flex items-center gap-4 rounded-lg bg-gray-50 px-4 py-3">
            <div>
              <p className="text-xs text-gray-400">Diagnostic Code</p>
              <p className="font-mono font-semibold text-gray-900">{claim.diagnosticCode}</p>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div>
              <p className="text-xs text-gray-400">Fault Classification</p>
              <p className="text-sm font-medium text-gray-900">{claim.faultClassification}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <FileText className="h-4 w-4 text-blue-500" />
            Evidence
          </h3>
          <div className="mt-3 space-y-2">
            {claim.evidence.map((ev, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                <FileText className="h-4 w-4 text-gray-400" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-gray-700">{ev.name}</p>
                  <p className="text-xs text-gray-400">{ev.type}</p>
                </div>
              </div>
            ))}
            {claim.evidence.length === 0 && (
              <p className="text-sm text-gray-400">No evidence uploaded.</p>
            )}
          </div>
        </div>
      </div>

      {/* AI Analysis - Step by step workflow */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 px-5 py-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <Cpu className="h-5 w-5 text-blue-500" />
            AI Analysis Workflow
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">8-step automated analysis with evidence-based decision making.</p>
        </div>

        <div className="p-5">
          {!analysisStarted && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <span className="ml-2 text-sm text-gray-500">Initializing AI analysis...</span>
            </div>
          )}

          <div className="space-y-3">
            {claim.aiSteps.slice(0, visibleSteps).map((step, i) => {
              const Icon = stepIcons[i] || Cpu;
              return (
                <div
                  key={step.id}
                  className="flex items-start gap-4 rounded-lg border border-gray-100 p-4 transition-all duration-300 hover:border-gray-200 hover:shadow-sm"
                  style={{ animation: 'fadeInUp 0.4s ease-out' }}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                    <Icon className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-400">Step {step.id}</span>
                        <h4 className="text-sm font-semibold text-gray-900">{step.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {step.timestamp && <span className="text-xs text-gray-400">{step.timestamp}</span>}
                        <StepStatusIcon status={step.status} />
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{step.description}</p>
                    {step.detail && (
                      <p className={`mt-2 text-sm ${
                        step.status === 'warning' ? 'text-amber-600' :
                        step.status === 'completed' ? 'text-gray-600' : 'text-blue-600'
                      }`}>
                        {step.detail}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {visibleSteps >= claim.aiSteps.length && (
            <div className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-emerald-50 py-3 text-sm font-medium text-emerald-700" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
              <CheckCircle2 className="h-4 w-4" />
              AI Analysis Complete
            </div>
          )}
        </div>
      </div>

      {/* AI Decision */}
      {visibleSteps >= claim.aiSteps.length && (
        <div className="grid gap-4 lg:grid-cols-3" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
          {/* Decision card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-500">AI Decision</h3>
            <div className={`mt-4 flex items-center gap-3 rounded-xl bg-gradient-to-br ${decisionColors[claim.aiRecommendation]} p-5`}>
              <Sparkles className="h-8 w-8 text-white" />
              <div>
                <p className="text-3xl font-bold text-white">{claim.aiRecommendation}</p>
                <p className="text-sm text-white/80">Recommended Action</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-gray-500">Confidence Score</span>
                  <span className="font-semibold text-gray-900">{claim.confidenceScore}%</span>
                </div>
                <ProgressBar value={claim.confidenceScore} color="bg-blue-500" />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-gray-500">Risk Score</span>
                  <span className="font-semibold text-gray-900">{claim.riskScore}/100</span>
                </div>
                <ProgressBar value={claim.riskScore} color={claim.riskScore > 70 ? 'bg-red-500' : claim.riskScore > 35 ? 'bg-amber-500' : 'bg-emerald-500'} />
              </div>
            </div>
          </div>

          {/* Analysis details */}
          <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-500">Analysis Summary</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-400">Warranty Validity</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{claim.warrantyStatus}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-400">Fault Classification</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{claim.faultClassification}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-400">Similar Historical Claims</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{claim.similarClaims} claims found</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-400">Potential Batch Issue</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{claim.potentialBatchIssue ? 'Yes — flagged for review' : 'No patterns detected'}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500">Supporting Evidence</p>
              <ul className="mt-2 space-y-1.5">
                {claim.supportingEvidence.map((ev, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    {ev}
                  </li>
                ))}
              </ul>
            </div>

            {claim.fraudIndicators.length > 0 && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  Fraud Indicators ({claim.fraudIndicators.length})
                </p>
                <ul className="mt-2 space-y-1">
                  {claim.fraudIndicators.map((fi, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-red-600">
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      {fi}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 rounded-lg bg-blue-50 p-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                <Sparkles className="h-4 w-4" />
                Reason for Recommendation
              </p>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">{claim.reasonForRecommendation}</p>
            </div>
          </div>
        </div>
      )}

      {/* Human Review Section */}
      {visibleSteps >= claim.aiSteps.length && isPending && (
        <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-sm" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
              <ClipboardCheck className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-amber-900">Human Approval Required</h2>
              <p className="text-sm text-amber-700">AI recommendation: {claim.aiRecommendation} • A human reviewer must approve the final decision.</p>
            </div>
          </div>

          {reviewMode === 'none' && (
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => setReviewMode('approve')}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve Recommendation
              </button>
              <button
                onClick={() => { setReviewMode('modify'); setModifiedDecision(claim.aiRecommendation); }}
                className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-5 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
              >
                <Wrench className="h-4 w-4" />
                Modify Decision
              </button>
              <button
                onClick={() => setReviewMode('reject')}
                className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50"
              >
                <XCircle className="h-4 w-4" />
                Reject Recommendation
              </button>
            </div>
          )}

          {reviewMode !== 'none' && (
            <div className="mt-5 space-y-4 rounded-xl border border-amber-200 bg-white p-5">
              {reviewMode === 'modify' && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Select Modified Decision</label>
                  <div className="flex flex-wrap gap-2">
                    {(['REPAIR', 'REPLACE', 'REFUND', 'DENY'] as Decision[]).map((d) => (
                      <button
                        key={d}
                        onClick={() => setModifiedDecision(d)}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                          modifiedDecision === d
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Reviewer Notes</label>
                <textarea
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  rows={3}
                  placeholder="Add notes explaining your decision..."
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                {reviewMode === 'approve' && (
                  <button onClick={handleApprove} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
                    <CheckCircle2 className="h-4 w-4" /> Confirm Approval
                  </button>
                )}
                {reviewMode === 'modify' && (
                  <button onClick={handleModify} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                    <CheckCircle2 className="h-4 w-4" /> Confirm Modified Decision
                  </button>
                )}
                {reviewMode === 'reject' && (
                  <button onClick={handleReject} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700">
                    <XCircle className="h-4 w-4" /> Confirm Rejection
                  </button>
                )}
                <button onClick={() => setReviewMode('none')} className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reviewer notes for completed claims */}
      {claim.reviewerNotes && !isPending && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <ClipboardCheck className="h-4 w-4 text-blue-500" />
            Reviewer Notes
          </h3>
          <p className="mt-2 text-sm text-gray-600">{claim.reviewerNotes}</p>
        </div>
      )}

      {/* Return Authorization */}
      {isApproved && claim.returnAuth && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
          <div className="border-b border-gray-100 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 px-5 py-4">
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <Truck className="h-5 w-5 text-emerald-500" />
              Return Authorization
            </h2>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                <FileCheck className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-emerald-600">Authorization Number</p>
                <p className="text-xl font-bold text-gray-900">{claim.returnAuth.authNumber}</p>
              </div>
              <DecisionBadge decision={claim.returnAuth.approvedAction} />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-400">Customer</p>
                <p className="text-sm font-medium text-gray-900">{claim.customer}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-400">Product</p>
                <p className="text-sm font-medium text-gray-900 truncate">{claim.product}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-400">Serial Number</p>
                <p className="text-sm font-medium text-gray-900">{claim.serialNumber}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-400">Approved Action</p>
                <p className="text-sm font-medium text-gray-900">{claim.returnAuth.approvedAction}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-400">Date</p>
                <p className="text-sm font-medium text-gray-900">{formatDateTime(claim.returnAuth.date)}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-400">Shipping Label</p>
                <p className="text-sm font-medium text-gray-900">{claim.returnAuth.shippingLabel}</p>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-400">Reason</p>
              <p className="mt-1 text-sm text-gray-700">{claim.returnAuth.reason}</p>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                <Truck className="h-4 w-4" />
                Generate Return Label
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                <Download className="h-4 w-4" />
                Download Authorization
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                <Send className="h-4 w-4" />
                Send Customer Notification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
