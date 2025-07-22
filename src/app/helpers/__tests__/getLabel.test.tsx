import {
  getJobStatusLabel,
  getInvoiceStatusLabel,
  getClientName,
  getJobTitle,
} from "../getLabel";
import { JobStatus } from "../../jobs/types/job";
import { InvoiceStatus } from "../../invoices/types/invoice";
import { Client } from "../../clients/types/client";
import { Job } from "../../jobs/types/job";

describe("getLabel helpers", () => {
  it("should get correct job status label", () => {
    expect(getJobStatusLabel(JobStatus.NotStarted)).toBe("Not Started");
    expect(getJobStatusLabel(JobStatus.InProgress)).toBe("In Progress");
    expect(getJobStatusLabel(JobStatus.Completed)).toBe("Completed");
    expect(getJobStatusLabel(JobStatus.OnHold)).toBe("On Hold");
    expect(getJobStatusLabel(JobStatus.Cancelled)).toBe("Cancelled");
    expect(getJobStatusLabel(99 as JobStatus)).toBe("Unknown");
  });

  it("should get correct invoice status label", () => {
    expect(getInvoiceStatusLabel(InvoiceStatus.Draft)).toBe("Draft");
    expect(getInvoiceStatusLabel(InvoiceStatus.Sent)).toBe("Sent");
    expect(getInvoiceStatusLabel(InvoiceStatus.Paid)).toBe("Paid");
    expect(getInvoiceStatusLabel(InvoiceStatus.Overdue)).toBe("Overdue");
    expect(getInvoiceStatusLabel(InvoiceStatus.Cancelled)).toBe("Cancelled");
    expect(getInvoiceStatusLabel(99 as InvoiceStatus)).toBe("Unknown");
  });

  it("should get correct client name", () => {
    const mockClients: Client[] = [
      { id: "1", name: "Test Client 1" } as Client,
      { id: "2", name: "Test Client 2" } as Client,
    ];

    expect(getClientName(mockClients, "1")).toBe("Test Client 1");
    expect(getClientName(mockClients, "2")).toBe("Test Client 2");
    expect(getClientName(mockClients, "3")).toBe("Unknown Client");
    expect(getClientName(mockClients, "")).toBe("Unknown Client");
  });

  it("should get correct job title", () => {
    const mockJobs: Job[] = [
      { id: "1", title: "Test Job 1" } as Job,
      { id: "2", title: "Test Job 2" } as Job,
    ];

    expect(getJobTitle(mockJobs, "1")).toBe("Test Job 1");
    expect(getJobTitle(mockJobs, "2")).toBe("Test Job 2");
    expect(getJobTitle(mockJobs, "3")).toBe("Unknown Job");
    expect(getJobTitle(mockJobs, undefined)).toBe("");
  });
});
