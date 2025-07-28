"use client";
import { useState } from "react";
import { Invoice } from "../types/invoice";
import {
  getInvoiceStatusLabel,
  getClientName,
  getJobTitle,
} from "../../helpers/getLabel";
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
import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { X } from "lucide-react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { InvoiceDetails } from "./invoice-details";

type InvoicesListClientProps = {
  initialInvoices: Invoice[];
  clients: Client[];
  jobs: Job[];
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
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const reload = async () => {
    const latest = await getInvoices();
    setInvoices(latest);
  };

  const filtered = invoices.filter((invoice) => {
    const q = search.toLowerCase();
    return (
      getClientName(clients, invoice.clientId).toLowerCase().includes(q) ||
      getJobTitle(jobs, invoice.jobId).toLowerCase().includes(q) ||
      getInvoiceStatusLabel(invoice.status).toLowerCase().includes(q) ||
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
    } catch (err: Error | unknown) {
      setError((err as Error).message || "Failed to create invoice");
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
    } catch (err: Error | unknown) {
      setError((err as Error).message || "Failed to update invoice");
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
    } catch (err: Error | unknown) {
      setError((err as Error).message || "Failed to delete invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <input
          type="text"
          placeholder="Search invoices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-2 py-1 w-full sm:w-64"
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
        <Dialog.Root open={showForm} onOpenChange={setShowForm}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
            <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[90vh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded bg-white dark:bg-gray-900 p-6 shadow-lg z-50 focus:outline-none">
              <VisuallyHidden asChild>
                <Dialog.Title>
                  {editInvoice ? "Edit Invoice" : "Add New Invoice"}
                </Dialog.Title>
              </VisuallyHidden>
              <VisuallyHidden asChild>
                <Dialog.Description>
                  {editInvoice
                    ? "Edit the invoice details"
                    : "Create a new invoice"}
                </Dialog.Description>
              </VisuallyHidden>
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
                title={editInvoice ? "Edit Invoice" : "Add New Invoice"}
              />
              <Dialog.Close asChild>
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
      <ul className="grid gap-3 sm:gap-4">
        {filtered.length === 0 ? (
          <li className="py-4 text-center text-gray-500 bg-white dark:bg-gray-800 rounded shadow">
            No invoices found.
          </li>
        ) : (
          filtered.map((invoice) => (
            <li
              key={invoice.id}
              className="group bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-shadow sm:max-w-4xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
              tabIndex={0}
              aria-label={`View details for invoice ${invoice.id}`}
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold flex items-center gap-2">
                  <DocumentTextIcon className="w-5 h-5 text-yellow-500" />{" "}
                  {getClientName(clients, invoice.clientId)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  Job: {getJobTitle(jobs, invoice.jobId)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  Status: {getInvoiceStatusLabel(invoice.status)} | Amount: $
                  {invoice.amount}
                </div>
                <div className="text-xs text-gray-400">
                  Issued:{" "}
                  {invoice.issueDate ? invoice.issueDate.slice(0, 10) : "-"} |
                  Due: {invoice.dueDate ? invoice.dueDate.slice(0, 10) : "-"}
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <InvoiceActions
                  onDetails={() => setSelectedInvoice(invoice)}
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
              </div>
            </li>
          ))
        )}
      </ul>
      {loading && <div className="text-blue-500 mt-2">Loading...</div>}
      {selectedInvoice && (
        <InvoiceDetails
          invoice={selectedInvoice}
          clients={clients}
          jobs={jobs}
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}
