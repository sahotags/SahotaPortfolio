export type UserRole = 'Owner / Appointor' | 'Trustee / Editor' | 'Family Beneficiary';

export interface FamilyUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  mfaEnabled: boolean;
  mfaSecret?: string;
  phone?: string;
  preferredMfaMethod?: 'SMS' | 'EMAIL' | 'TOTP';
  lastActive: string;
  permissions: {
    canEditProperties: boolean;
    canEditInvestments: boolean;
    canManageUsers: boolean;
    canViewTaxReports: boolean;
    canUploadDocuments: boolean;
    canViewCorporateKeys: boolean;
  };
}

export type PropertyStatus = 'Sold' | 'Held' | 'In progress';

export interface PropertyItem {
  id: string;
  name: string;
  status: PropertyStatus;
  totalCosts: number;
  totalIncome: number;
  grossProfit: number;
  marginPercentage: number;
  country: 'NZ' | 'AU' | 'India';
  acquisitionDate?: string;
  saleDate?: string;
  entityOwner: string; // e.g. "Sahota Family Trust", "Personal", "Sahota Trading"
  notes?: string;
  documentIds?: string[];
  lastUpdated?: string;
}

export interface ManagedInvestment {
  id: string;
  name: string;
  category: 'GLPE' | 'GHIF' | 'CMC' | 'Other';
  netContributions: number;
  latestValue: number;
  totalGain: number;
  gainPercentage: number;
  accountNumber?: string;
  hin?: string;
  institution?: string;
  lastUpdated: string;
  history: Array<{
    date: string;
    value: number;
    contribution: number;
    notes?: string;
  }>;
}

export interface MonthlyLedgerEntry {
  id: string;
  month: string; // e.g., "May 2022"
  netFlow: number | null;
  glpeValue: number | null;
  ghifValue: number | null;
  cmcValue: number | null;
  totalValue: number;
  returnAmount: number | null;
  returnPercentage: number | null;
  comments?: string;
}

export interface CorporateEntity {
  id: string;
  name: string;
  type: 'Trust' | 'Trustee Company' | 'Operating Company' | 'Bucket Company';
  acn?: string;
  abn?: string;
  tfn?: string;
  corporateKey?: string;
  anzsicCode?: string;
  bankAccount?: string;
  chessHin?: string;
  establishedDate?: string;
  settlor?: string;
  settlementSum?: string;
  directors: string[];
  shareholders: string[];
  appointors?: string[];
  flags?: string[];
  documents: string[];
  notes?: string;
}

export interface ScheduledPayment {
  id: string;
  title: string;
  amount: number;
  frequency: 'Annual' | 'Quarterly' | 'Monthly';
  dueDate: string;
  entity: string;
  category: 'Tax / Duty' | 'Insurance' | 'ASIC Fee' | 'Compliance' | 'Other';
  status: 'Pending' | 'Paid' | 'Scheduled';
}

export interface DocumentItem {
  id: string;
  title: string;
  entityType: 'Trust' | 'Company' | 'Property' | 'Managed' | 'Tax';
  entityName: string;
  category: 'ASIC Certificate' | 'Trust Deed' | 'ATO / TFN' | 'Director ID' | 'Duties Assessment' | 'CHESS Notice' | 'Share Certificate' | 'Tax Report' | 'Other';
  fileType: 'pdf' | 'jpg' | 'png' | 'doc' | 'docx' | 'xlsx' | 'gdrive';
  uploadDate: string;
  uploadedBy: string;
  size: string;
  isOfficial: boolean;
  sourceType?: 'LOCAL' | 'GOOGLE_DRIVE' | 'OFFICIAL';
  googleDriveUrl?: string;
  fileDataUrl?: string;
  fileUrl?: string;
  ocrText?: string;
  keyInfo?: Record<string, string>;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userEmail: string;
  userName: string;
  userRole: UserRole;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ROLE_CHANGE' | 'MFA_TOGGLE' | 'DOC_ATTACH' | 'TAX_REPORT_GENERATE' | 'SECURITY_ALERT';
  targetEntity: string;
  description: string;
  details?: {
    field?: string;
    oldValue?: string | number | boolean;
    newValue?: string | number | boolean;
  };
  ipAddress: string;
}

export interface TaxReportSummary {
  financialYear: string;
  generatedDate: string;
  generatedBy: string;
  totalPropertyCGT: number;
  cgtDiscountAmount: number;
  netTaxableCapitalGains: number;
  managedFundIncome: number;
  trustDistributions: number;
  frankedDividends: number;
  frankingCredits: number;
  deductibleOutgoings: number;
  estimatedTaxPayable: number;
  propertyBreakdown: Array<{
    property: string;
    costBase: number;
    salePrice: number;
    grossProfit: number;
    discountEligible: boolean;
    taxableGain: number;
  }>;
}
