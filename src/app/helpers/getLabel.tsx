import { JobStatus } from "../jobs/types/job";
import { InvoiceStatus } from "../invoices/types/invoice";
import { Client } from "@/app/clients/types/client";
import { Job } from "@/app/jobs/types/job";

// Helper to get job status label
export const getJobStatusLabel = (status: JobStatus) => {
  switch (status) {
    case JobStatus.NotStarted:
      return "Not Started";
    case JobStatus.InProgress:
      return "In Progress";
    case JobStatus.Completed:
      return "Completed";
    case JobStatus.OnHold:
      return "On Hold";
    case JobStatus.Cancelled:
      return "Cancelled";
    default:
      return "Unknown";
  }
};

// Helper to get invoice status label
export const getInvoiceStatusLabel = (status: InvoiceStatus) => {
  switch (status) {
    case InvoiceStatus.Draft:
      return "Draft";
    case InvoiceStatus.Sent:
      return "Sent";
    case InvoiceStatus.Paid:
      return "Paid";
    case InvoiceStatus.Overdue:
      return "Overdue";
    case InvoiceStatus.Cancelled:
      return "Cancelled";
    default:
      return "Unknown";
  }
};

// Helper to get client name by ID
export const getClientName = (clients: Client[], clientId: string) => {
  if (!clientId) return "Unknown Client";
  const client = clients.find((c) => c.id === clientId);
  return client ? client.name : "Unknown Client";
};

// Helper to get job title by ID
export const getJobTitle = (jobs: Job[], jobId?: string) => {
  if (!jobId) return "";
  const job = jobs.find((j) => j.id === jobId);
  return job ? job.title : "Unknown Job";
};
