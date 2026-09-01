import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Image as ImageIcon, X, ArrowLeft, Loader2, CheckCircle2, User, Mail, Package, Calendar, Store, Wrench, AlertCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { Claim, ClaimType, Evidence } from '@/types';

interface UploadedFile {
  name: string;
  type: string;
  category: 'invoice' | 'product' | 'evidence';
}

export function CreateClaimPage() {
  const { addClaim, addAgentLog } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customer: '',
    email: '',
    product: '',
    serialNumber: '',
    purchaseDate: '',
    retailer: '',
    claimType: 'Warranty' as ClaimType,
    problemDescription: '',
    diagnosticCode: '',
    additionalEvidence: '',
  });

  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const updateForm = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleFiles = useCallback((fileList: FileList | null, category: 'invoice' | 'product' | 'evidence') => {
    if (!fileList) return;
    const newFiles = Array.from(fileList).map((f) => ({
      name: f.name,
      type: f.type || 'application/octet-stream',
      category,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent, category: string) => {
    e.preventDefault();
    setDragOver(category);
  };

  const handleDragLeave = () => {
    setDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, category: 'invoice' | 'product' | 'evidence') => {
    e.preventDefault();
    setDragOver(null);
    handleFiles(e.dataTransfer.files, category);
  };

  const claimTypes: ClaimType[] = ['Warranty', 'Return', 'Damage', 'Defective'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      const claimId = `CLM-2026-${String(Math.floor(Math.random() * 900) + 200).padStart(4, '0')}`;
      const purchaseDate = form.purchaseDate ? new Date(form.purchaseDate).toISOString() : new Date().toISOString();
      const warrantyMonths = 12;
      const warrantyExpiry = new Date(purchaseDate);
      warrantyExpiry.setMonth(warrantyExpiry.getMonth() + warrantyMonths);
      const now = new Date();
      const isExpired = warrantyExpiry < now;
      const monthsRemaining = Math.round((warrantyExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30));

      const warrantyStatus = isExpired ? 'Expired' : monthsRemaining < 2 ? 'Expiring Soon' : 'Active';

      const evidence: Evidence[] = files.map((f) => ({
        type: f.category === 'invoice' ? 'Invoice' : f.category === 'product' ? 'Photo' : 'Document',
        name: f.name,
        uploadedAt: now.toISOString(),
      }));

      // Simulate AI analysis
      const aiRecommendation = isExpired ? 'DENY' : form.diagnosticCode ? 'REPAIR' : 'REPLACE';
      const riskScore = isExpired ? 15 : Math.floor(Math.random() * 40) + 30;
      const riskLevel = riskScore > 70 ? 'High' : riskScore > 35 ? 'Medium' : 'Low';

      const newClaim: Claim = {
        id: claimId,
        customer: form.customer,
        email: form.email,
        product: form.product,
        serialNumber: form.serialNumber,
        purchaseDate,
        retailer: form.retailer,
        claimType: form.claimType,
        problemDescription: form.problemDescription,
        diagnosticCode: form.diagnosticCode || 'N/A',
        batchNumber: 'BATCH-2026-' + String.fromCharCode(65 + Math.floor(Math.random() * 5)),
        warrantyStatus,
        warrantyMonths,
        warrantyExpiry: warrantyExpiry.toISOString(),
        fault: form.diagnosticCode ? `${form.diagnosticCode} Component Failure` : 'General Defect',
        riskLevel,
        aiRecommendation,
        status: 'Pending',
        createdAt: now.toISOString(),
        confidenceScore: Math.floor(Math.random() * 20) + 75,
        faultClassification: 'Mechanical — Component Failure',
        riskScore,
        similarClaims: Math.floor(Math.random() * 10),
        potentialBatchIssue: false,
        fraudIndicators: [],
        supportingEvidence: ['Purchase invoice verified', 'Warranty status confirmed', 'Diagnostic data analyzed'],
        reasonForRecommendation: isExpired
          ? 'Product is outside warranty period. Claim cannot be processed under warranty.'
          : 'Product is within warranty. Reported fault is consistent with common failure patterns. Recommend ' + aiRecommendation.toLowerCase() + '.',
        evidence,
        aiSteps: [
          { id: 1, title: 'Verify Purchase', description: 'Invoice validation', status: 'completed', detail: 'Invoice received and verified.', timestamp: '14:32:10' },
          { id: 2, title: 'Check Warranty Eligibility', description: 'Warranty verification', status: 'completed', detail: `Warranty ${warrantyStatus.toLowerCase()}.`, timestamp: '14:32:12' },
          { id: 3, title: 'Analyze Reported Fault', description: 'Diagnostic analysis', status: 'completed', detail: 'Fault analyzed.', timestamp: '14:32:14' },
          { id: 4, title: 'Analyze Uploaded Evidence', description: 'Evidence review', status: 'completed', detail: 'Evidence reviewed.', timestamp: '14:32:16' },
          { id: 5, title: 'Compare Historical Claims', description: 'Pattern matching', status: 'completed', detail: 'No similar claims found.', timestamp: '14:32:18' },
          { id: 6, title: 'Detect Fraud Indicators', description: 'Fraud detection', status: 'completed', detail: 'No fraud indicators.', timestamp: '14:32:20' },
          { id: 7, title: 'Check Batch Failure Patterns', description: 'Batch analysis', status: 'completed', detail: 'No batch patterns.', timestamp: '14:32:22' },
          { id: 8, title: 'Generate Recommended Action', description: 'Decision synthesis', status: 'completed', detail: `Recommendation: ${aiRecommendation}.`, timestamp: '14:32:24' },
        ],
      };

      addClaim(newClaim);
      addAgentLog({ claimId, timestamp: now.toLocaleTimeString('en-GB'), message: `Claim received — ${claimId}`, type: 'info' });
      addAgentLog({ claimId, timestamp: now.toLocaleTimeString('en-GB'), message: `AI analysis complete — recommendation: ${aiRecommendation}`, type: 'success' });

      setSubmitting(false);
      setSubmitted(true);

      setTimeout(() => {
        navigate(`/claims/${claimId}`);
      }, 2500);
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-900">Claim Submitted Successfully</h2>
          <p className="mt-2 text-sm text-gray-500">AI analysis started...</p>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Redirecting to claim analysis...
          </div>
        </div>
      </div>
    );
  }

  const inputClass = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';
  const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';

  const UploadZone = ({ category, title, hint, icon: Icon }: { category: 'invoice' | 'product' | 'evidence'; title: string; hint: string; icon: typeof Upload }) => (
    <div
      onDragOver={(e) => handleDragOver(e, category)}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, category)}
      onClick={() => fileInputRefs.current[category]?.click()}
      className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition ${
        dragOver === category
          ? 'border-blue-400 bg-blue-50'
          : 'border-gray-200 bg-gray-50/50 hover:border-blue-300 hover:bg-blue-50/30'
      }`}
    >
      <input
        ref={(el) => { fileInputRefs.current[category] = el; }}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files, category)}
      />
      <Icon className={`mx-auto h-8 w-8 ${dragOver === category ? 'text-blue-500' : 'text-gray-400'}`} />
      <p className="mt-2 text-sm font-medium text-gray-700">{title}</p>
      <p className="mt-0.5 text-xs text-gray-400">{hint}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/claims')} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Claim</h1>
          <p className="mt-1 text-sm text-gray-500">Submit a new warranty or return claim for AI analysis.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <User className="h-4 w-4 text-blue-500" />
            Customer Information
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Customer Name</label>
              <input type="text" value={form.customer} onChange={(e) => updateForm('customer', e.target.value)} placeholder="e.g., Rahul Sharma" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="email" value={form.email} onChange={(e) => updateForm('email', e.target.value)} placeholder="customer@email.com" className={`${inputClass} pl-10`} required />
              </div>
            </div>
          </div>
        </div>

        {/* Product Information */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <Package className="h-4 w-4 text-blue-500" />
            Product Information
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Product Name</label>
              <input type="text" value={form.product} onChange={(e) => updateForm('product', e.target.value)} placeholder="e.g., AquaSmart Pro Washing Machine" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Serial Number</label>
              <input type="text" value={form.serialNumber} onChange={(e) => updateForm('serialNumber', e.target.value)} placeholder="e.g., WM-PRO-8847291" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Diagnostic / Error Code</label>
              <div className="relative">
                <Wrench className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="text" value={form.diagnosticCode} onChange={(e) => updateForm('diagnosticCode', e.target.value)} placeholder="e.g., E03" className={`${inputClass} pl-10`} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Claim Type</label>
              <select value={form.claimType} onChange={(e) => updateForm('claimType', e.target.value)} className={inputClass}>
                {claimTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Purchase Information */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <Calendar className="h-4 w-4 text-blue-500" />
            Purchase Information
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Purchase Date</label>
              <input type="date" value={form.purchaseDate} onChange={(e) => updateForm('purchaseDate', e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Retailer</label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="text" value={form.retailer} onChange={(e) => updateForm('retailer', e.target.value)} placeholder="e.g., Croma Electronics" className={`${inputClass} pl-10`} required />
              </div>
            </div>
          </div>
        </div>

        {/* Problem Description */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            Problem Description
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className={labelClass}>Describe the Issue</label>
              <textarea
                value={form.problemDescription}
                onChange={(e) => updateForm('problemDescription', e.target.value)}
                rows={4}
                placeholder="Describe the fault, when it occurs, and any error messages..."
                className={`${inputClass} resize-none`}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Additional Evidence (Optional)</label>
              <textarea
                value={form.additionalEvidence}
                onChange={(e) => updateForm('additionalEvidence', e.target.value)}
                rows={2}
                placeholder="Any additional context or evidence notes..."
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>
        </div>

        {/* Upload areas */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <Upload className="h-4 w-4 text-blue-500" />
            Evidence Upload
          </h2>
          <p className="mt-1 text-sm text-gray-500">Drag and drop files or click to browse. Upload invoices, product photos, and supporting evidence.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <UploadZone category="invoice" title="Upload Invoice" hint="PDF, JPG, PNG up to 10MB" icon={FileText} />
            <UploadZone category="product" title="Upload Product Image" hint="JPG, PNG, HEIC up to 10MB" icon={ImageIcon} />
            <UploadZone category="evidence" title="Additional Evidence" hint="Any file type up to 10MB" icon={Upload} />
          </div>

          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="flex-1 truncate text-sm text-gray-700">{file.name}</span>
                  <span className="text-xs text-gray-400 capitalize">{file.category}</span>
                  <button type="button" onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/claims')}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Submit & Start AI Analysis'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
