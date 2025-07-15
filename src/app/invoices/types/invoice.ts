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
} 