"use client";
import { useState } from "react";
import { Invoice, InvoiceStatus } from "../types/invoice";
import {
  getInvoiceStatusLabel,
  getInvoiceStatusBadgeVariant,
  getClientName,
  getJobTitle,
  formatCurrency,
  isInvoiceOverdue,
  getDaysUntilDue,
} from "../../helpers/getLabel";
import { Client } from "@/app/clients/types/client";
import { Job } from "@/app/jobs/types/job";
import { InvoiceForm } from "./invoice-form";
import { InvoiceActions } from "./invoice-actions";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { deleteInvoice, getInvoices } from "@/app/lib/actions";
import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { X, AlertTriangle, Calendar, DollarSign } from "lucide-react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { InvoiceDetails } from "./invoice-details";

interface InvoicesListClientProps {
  initialInvoices: Invoice[];
  clients: Client[];
  jobs: Job[];
}

export const InvoicesListClient = ({
  initialInvoices,
  clients,
  jobs,
}: InvoicesListClientProps) => {
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
    return latest;
  };

  const filtered = invoices.filter((invoice) => {
    const q = search.toLowerCase();
    return (
      getClientName(clients, invoice.clientId).toLowerCase().includes(q) ||
      getJobTitle(jobs, invoice.jobId).toLowerCase().includes(q) ||
      getInvoiceStatusLabel(invoice.status).toLowerCase().includes(q) ||
      invoice.amount.toString().includes(q) ||
      invoice.totalAmount.toString().includes(q) ||
      (invoice.notes && invoice.notes.toLowerCase().includes(q)) ||
      (invoice.terms && invoice.terms.toLowerCase().includes(q))
    );
  });

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

  // Apply optimistic patch across list and details selection
  const applyOptimisticPatch = (invoiceId: string, patch: Partial<Invoice>) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === invoiceId ? { ...inv, ...patch } : inv))
    );
    setSelectedInvoice((prev) =>
      prev && prev.id === invoiceId ? { ...prev, ...patch } : prev
    );
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
                invoice={editInvoice || {}}
                clients={clients}
                jobs={jobs}
                onSuccess={async () => {
                  // The form handles the data submission internally
                  // We just need to reload the list and close the form
                  await reload();
                  setShowForm(false);
                  setEditInvoice(null);
                }}
                onCancel={() => {
                  setShowForm(false);
                  setEditInvoice(null);
                }}
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
          filtered.map((invoice) => {
            const isOverdue = isInvoiceOverdue(invoice.dueDate, invoice.status);
            const daysUntilDue = getDaysUntilDue(invoice.dueDate);

            return (
              <li
                key={invoice.id}
                className={`group bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-shadow sm:max-w-4xl flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-4 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 ${
                  isOverdue ? "border-l-4 border-l-red-500" : ""
                }`}
                tabIndex={0}
                aria-label={`View details for invoice ${invoice.id}`}
              >
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Header with client and status */}
                  <div className="flex items-center justify-between">
                    <div className="font-semibold flex items-center gap-2">
                      <DocumentTextIcon className="w-5 h-5 text-yellow-500" />
                      <span>{getClientName(clients, invoice.clientId)}</span>
                      {isOverdue && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <Badge
                      variant={
                        getInvoiceStatusBadgeVariant(invoice.status) as
                          | "default"
                          | "secondary"
                          | "destructive"
                          | "outline"
                      }
                    >
                      {getInvoiceStatusLabel(invoice.status)}
                    </Badge>
                  </div>

                  {/* Job Information */}
                  {invoice.jobId && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <span className="font-medium">Job:</span>
                      <span>{getJobTitle(jobs, invoice.jobId)}</span>
                    </div>
                  )}

                  {/* Financial Information */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-medium">Amount:</span>
                      <span>{formatCurrency(invoice.amount)}</span>
                    </div>
                    {invoice.taxRate > 0 && (
                      <div className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Tax:</span>
                        <span className="ml-1">
                          {formatCurrency(invoice.taxAmount)} ({invoice.taxRate}
                          %)
                        </span>
                      </div>
                    )}
                    <div className="text-gray-900 dark:text-gray-100 font-semibold">
                      <span className="font-medium">Total:</span>
                      <span className="ml-1">
                        {formatCurrency(invoice.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Date Information */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        Issued:{" "}
                        {invoice.issueDate
                          ? new Date(invoice.issueDate).toLocaleDateString()
                          : "-"}
                      </span>
                    </div>
                    <div
                      className={`flex items-center gap-1 ${
                        isOverdue ? "text-red-500 font-medium" : ""
                      }`}
                    >
                      <Calendar className="w-3 h-3" />
                      <span>
                        Due:{" "}
                        {invoice.dueDate
                          ? new Date(invoice.dueDate).toLocaleDateString()
                          : "-"}
                      </span>
                      {invoice.status !== InvoiceStatus.Paid && (
                        <span
                          className={`ml-1 ${
                            isOverdue
                              ? "text-red-500"
                              : daysUntilDue <= 7
                              ? "text-yellow-600"
                              : ""
                          }`}
                        >
                          (
                          {isOverdue
                            ? `${Math.abs(daysUntilDue)} days overdue`
                            : `${daysUntilDue} days remaining`}
                          )
                        </span>
                      )}
                    </div>
                    {invoice.paymentDate && (
                      <div className="text-green-600 dark:text-green-400 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        <span>
                          Paid:{" "}
                          {invoice.paymentDate
                            ? new Date(invoice.paymentDate).toLocaleDateString()
                            : "-"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Notes Preview */}
                  {invoice.notes && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-medium">Notes:</span>
                      <span className="ml-1">
                        {invoice.notes.length > 100
                          ? `${invoice.notes.substring(0, 100)}...`
                          : invoice.notes}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 items-start">
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
            );
          })
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
          onInvoiceUpdate={async () => {
            const latest = await reload();
            // Update the selected invoice with fresh data
            const updatedInvoice = latest.find(
              (inv) => inv.id === selectedInvoice.id
            );
            if (updatedInvoice) {
              setSelectedInvoice(updatedInvoice);
            }
          }}
          onInvoiceOptimisticUpdate={applyOptimisticPatch}
        />
      )}
    </div>
  );
};
