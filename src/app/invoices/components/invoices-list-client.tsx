"use client";
import { useState } from "react";
import { Invoice, InvoiceStatus } from "../types/invoice";
import { Client } from "@/app/clients/types/client";
import { Job } from "@/app/jobs/types/job";
import { InvoiceForm } from "./invoice-form";
import { InvoiceActions } from "./invoice-actions";
import { Button } from "@/app/components/ui/button";
import {
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoices,
} from "@/app/lib/actions";

type InvoicesListClientProps = {
  initialInvoices: Invoice[];
  clients: Client[];
  jobs: Job[];
};

const getStatusLabel = (status: InvoiceStatus) => {
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

export function InvoicesListClient({
  initialInvoices,
  clients,
  jobs,
}: InvoicesListClientProps) {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [showForm, setShowForm] = useState(false);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.name : "Unknown Client";
  };
  const getJobTitle = (jobId?: string) => {
    if (!jobId) return "";
    const job = jobs.find((j) => j.id === jobId);
    return job ? job.title : "Unknown Job";
  };

  const reload = async () => {
    const latest = await getInvoices();
    setInvoices(latest);
  };

  const filtered = invoices.filter((invoice) => {
    const q = search.toLowerCase();
    return (
      getClientName(invoice.clientId).toLowerCase().includes(q) ||
      getJobTitle(invoice.jobId).toLowerCase().includes(q) ||
      getStatusLabel(invoice.status).toLowerCase().includes(q) ||
      invoice.amount.toString().includes(q)
    );
  });

  const handleCreate = async (data: Omit<Invoice, "id">) => {
    setLoading(true);
    setError(null);
    try {
      await createInvoice({
        ...data,
        issueDate: new Date(data.issueDate).toISOString(),
        dueDate: new Date(data.dueDate).toISOString(),
      });
      await reload();
      setShowForm(false);
      setEditInvoice(null);
    } catch (err: any) {
      setError(err.message || "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string, data: Omit<Invoice, "id">) => {
    setLoading(true);
    setError(null);
    try {
      await updateInvoice(id, {
        ...data,
        issueDate: new Date(data.issueDate).toISOString(),
        dueDate: new Date(data.dueDate).toISOString(),
      });
      await reload();
      setShowForm(false);
      setEditInvoice(null);
    } catch (err: any) {
      setError(err.message || "Failed to update invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteInvoice(id);
      await reload();
    } catch (err: any) {
      setError(err.message || "Failed to delete invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Search invoices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-2 py-1 w-64"
        />
        <Button
          onClick={() => {
            setShowForm(true);
            setEditInvoice(null);
          }}
        >
          New Invoice
        </Button>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded shadow-lg w-full max-w-md relative">
            <InvoiceForm
              initialInvoice={editInvoice || {}}
              clients={clients}
              jobs={jobs}
              onSubmit={async (data) => {
                if (editInvoice && editInvoice.id) {
                  await handleEdit(editInvoice.id, data);
                } else {
                  await handleCreate(data);
                }
              }}
              onCancel={() => {
                setShowForm(false);
                setEditInvoice(null);
              }}
            />
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              onClick={() => {
                setShowForm(false);
                setEditInvoice(null);
              }}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {filtered.length === 0 ? (
          <li className="py-4 text-center text-gray-500">No invoices found.</li>
        ) : (
          filtered.map((invoice) => (
            <li
              key={invoice.id}
              className="py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
            >
              <div>
                <div className="font-semibold">
                  {getClientName(invoice.clientId)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Job: {getJobTitle(invoice.jobId)} | Status:{" "}
                  {getStatusLabel(invoice.status)} | Amount: ${invoice.amount}
                </div>
                <div className="text-xs text-gray-400">
                  Issued:{" "}
                  {invoice.issueDate ? invoice.issueDate.slice(0, 10) : "-"} |
                  Due: {invoice.dueDate ? invoice.dueDate.slice(0, 10) : "-"}
                </div>
              </div>
              <InvoiceActions
                onEdit={() => {
                  setEditInvoice(invoice);
                  setShowForm(true);
                }}
                onDelete={async () => {
                  if (invoice.id) {
                    await handleDelete(invoice.id);
                  }
                }}
                disabled={!invoice.id}
              />
            </li>
          ))
        )}
      </ul>
      {loading && <div className="text-blue-500 mt-2">Loading...</div>}
    </div>
  );
}
