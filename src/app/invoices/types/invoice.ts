// InvoiceStatus enum matches API (0-4)
export enum InvoiceStatus {
  Draft = 0,
  Sent = 1,
  Paid = 2,
  Overdue = 3,
  Cancelled = 4,
}

// Invoice interface for frontend, matching API InvoiceDto
export interface Invoice {
  id?: string;
  clientId: string;
  jobId?: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  amount: number;
  taxAmount: number;
  taxRate: number;
  paymentDate?: string;
  notes?: string;
  terms?: string;
  // Read-only calculated properties from API
  totalAmount: number;
  isOverdue: boolean;
  isPaid: boolean;
  daysUntilDue: number;
}

// Form interfaces for creating/updating invoices
export interface CreateInvoiceRequest {
  clientId: string;
  jobId?: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  taxRate: number;
  notes?: string;
  terms?: string;
}

export interface UpdateInvoiceRequest extends CreateInvoiceRequest {
  status: InvoiceStatus;
}

export interface UpdateInvoiceStatusRequest {
  status: InvoiceStatus;
}

export interface RecordPaymentRequest {
  paymentDate: string;
  amount: number;
}
