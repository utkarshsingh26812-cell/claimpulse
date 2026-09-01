export type Decision = 'REPAIR' | 'REPLACE' | 'REFUND' | 'DENY' | 'PENDING';
export type ClaimStatus = 'Pending' | 'Approved' | 'Rejected' | 'Under Review';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type WarrantyStatus = 'Active' | 'Expired' | 'Expiring Soon' | 'Unknown';
export type ClaimType = 'Warranty' | 'Return' | 'Damage' | 'Defective';
export type StepStatus = 'completed' | 'processing' | 'warning' | 'pending';

export interface AIStep {
  id: number;
  title: string;
  description: string;
  status: StepStatus;
  detail?: string;
  timestamp?: string;
}

export interface Evidence {
  type: string;
  name: string;
  uploadedAt: string;
}

export interface Claim {
  id: string;
  customer: string;
  email: string;
  product: string;
  serialNumber: string;
  purchaseDate: string;
  retailer: string;
  claimType: ClaimType;
  problemDescription: string;
  diagnosticCode: string;
  batchNumber: string;
  warrantyStatus: WarrantyStatus;
  warrantyMonths: number;
  warrantyExpiry: string;
  fault: string;
  riskLevel: RiskLevel;
  aiRecommendation: Decision;
  status: ClaimStatus;
  createdAt: string;
  confidenceScore: number;
  faultClassification: string;
  riskScore: number;
  similarClaims: number;
  potentialBatchIssue: boolean;
  fraudIndicators: string[];
  supportingEvidence: string[];
  reasonForRecommendation: string;
  evidence: Evidence[];
  aiSteps: AIStep[];
  finalDecision?: Decision;
  reviewerNotes?: string;
  returnAuth?: ReturnAuthorization;
}

export interface ReturnAuthorization {
  authNumber: string;
  approvedAction: Decision;
  reason: string;
  date: string;
  shippingLabel: string;
  status: 'Generated' | 'Pending';
}

export interface BatchInfo {
  batchNumber: string;
  product: string;
  totalClaims: number;
  totalUnits: number;
  failureRate: number;
  commonFault: string;
  riskLevel: RiskLevel;
  recallRecommendation: string;
  similarFailures: number;
}

export interface AgentLogEntry {
  id: string;
  claimId: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface User {
  email: string;
  name: string;
  role: string;
}
