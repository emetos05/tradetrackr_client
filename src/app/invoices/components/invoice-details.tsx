"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { X, Calendar, DollarSign, FileText, AlertTriangle } from "lucide-react";
import { Client } from "@/app/clients/types/client";
import { Job } from "@/app/jobs/types/job";
import { Invoice, InvoiceStatus, RecordPaymentRequest } from "../types/invoice";
import { Badge } from "@/app/components/ui/badge";
import { PaymentActions } from "./payment-actions";
import { updateInvoiceStatus, recordInvoicePayment } from "@/app/lib/actions";
import {
  getInvoiceStatusLabel,
  getInvoiceStatusBadgeVariant,
  getClientName,
  getJobTitle,
  formatCurrency,
  isInvoiceOverdue,
  getDaysUntilDue,
} from "../../helpers/getLabel";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

interface InvoiceDetailsProps {
  invoice: Invoice;
  clients: Client[];
  jobs: Job[];
  isOpen: boolean;
  onClose: () => void;
  onInvoiceUpdate?: () => void;
  onInvoiceOptimisticUpdate?: (
    invoiceId: string,
    patch: Partial<Invoice>
  ) => void;
}

export const InvoiceDetails = ({
  invoice,
  clients,
  jobs,
  isOpen,
  onClose,
  onInvoiceUpdate,
  onInvoiceOptimisticUpdate,
}: InvoiceDetailsProps) => {
  const isOverdue = isInvoiceOverdue(invoice.dueDate, invoice.status);
  const daysUntilDue = getDaysUntilDue(invoice.dueDate);

  const handleStatusUpdate = async (
    invoiceId: string,
    status: InvoiceStatus
  ) => {
    // Optimistic: update status immediately across views
    onInvoiceOptimisticUpdate?.(invoiceId, {
      status,
      // Clear payment date if moving away from Paid
      ...(status !== InvoiceStatus.Paid ? { paymentDate: undefined } : {}),
    });
    try {
      await updateInvoiceStatus(invoiceId, status);
    } finally {
      // Reload to sync derived fields (isPaid, totals, etc.)
      onInvoiceUpdate?.();
    }
  };

  const handlePaymentRecord = async (
    invoiceId: string,
    payment: RecordPaymentRequest
  ) => {
    // Optimistic: if payment covers total, mark as Paid and set payment date
    const willBePaid = payment.amount >= invoice.totalAmount;
    onInvoiceOptimisticUpdate?.(invoiceId, {
      ...(willBePaid ? { status: InvoiceStatus.Paid } : {}),
      paymentDate: payment.paymentDate,
    });
    try {
      await recordInvoicePayment(invoiceId, payment);
    } finally {
      // Reload to ensure full consistency
      onInvoiceUpdate?.();
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[90vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded bg-white dark:bg-gray-900 p-6 shadow-lg z-50 focus:outline-none">
          <VisuallyHidden asChild>
            <Dialog.Title>Invoice Details</Dialog.Title>
          </VisuallyHidden>
          <VisuallyHidden asChild>
            <Dialog.Description>
              View detailed invoice information
            </Dialog.Description>
          </VisuallyHidden>

          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DocumentTextIcon className="w-6 h-6 text-blue-500" />
                <div>
                  <h2 className="text-xl font-semibold">Invoice Details</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {getClientName(clients, invoice.clientId)}
                  </p>
                </div>
              </div>
              <Badge
                variant={
                  getInvoiceStatusBadgeVariant(invoice.status) || "default"
                }
              >
                {getInvoiceStatusLabel(invoice.status)}
              </Badge>
            </div>

            {/* Overdue Alert */}
            {isOverdue && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <div className="text-sm">
                  <p className="font-medium text-red-700 dark:text-red-300">
                    Overdue Invoice
                  </p>
                  <p className="text-red-600 dark:text-red-400">
                    This invoice is {Math.abs(daysUntilDue)} days past due
                  </p>
                </div>
              </div>
            )}

            {/* Financial Summary */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Financial Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Subtotal:
                  </span>
                  <span className="font-medium">
                    {formatCurrency(invoice.amount)}
                  </span>
                </div>
                {invoice.taxRate > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Tax ({invoice.taxRate}%):
                    </span>
                    <span className="font-medium">
                      {formatCurrency(invoice.taxAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold border-t pt-2">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(invoice.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Client
                  </label>
                  <p className="mt-1">
                    {getClientName(clients, invoice.clientId)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Job
                  </label>
                  <p className="mt-1">
                    {getJobTitle(jobs, invoice.jobId) || "No job assigned"}
                  </p>
                </div>
              </div>

              {/* Date Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Issue Date
                  </label>
                  <p className="mt-1">
                    {invoice.issueDate
                      ? new Date(invoice.issueDate).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
                <div>
                  <label
                    className={`text-sm font-medium flex items-center gap-1 ${
                      isOverdue
                        ? "text-red-500"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    <Calendar className="w-3 h-3" />
                    Due Date
                  </label>
                  <p
                    className={`mt-1 ${
                      isOverdue
                        ? "text-red-600 dark:text-red-400 font-medium"
                        : ""
                    }`}
                  >
                    {invoice.dueDate
                      ? new Date(invoice.dueDate).toLocaleDateString()
                      : "-"}
                  </p>
                  {invoice.status !== InvoiceStatus.Paid && (
                    <p
                      className={`text-xs ${
                        isOverdue
                          ? "text-red-500"
                          : daysUntilDue <= 7
                          ? "text-yellow-600"
                          : "text-gray-500"
                      }`}
                    >
                      {isOverdue
                        ? `${Math.abs(daysUntilDue)} days overdue`
                        : `${daysUntilDue} days remaining`}
                    </p>
                  )}
                </div>
              </div>

              {/* Payment Date */}
              {invoice.paymentDate && (
                <div>
                  <label className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Payment Date
                  </label>
                  <p className="mt-1 text-green-700 dark:text-green-300">
                    {new Date(invoice.paymentDate).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* Notes */}
              {invoice.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Notes
                  </label>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                    {invoice.notes}
                  </div>
                </div>
              )}

              {/* Terms */}
              {invoice.terms && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Terms & Conditions
                  </label>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                    {invoice.terms}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Actions */}
            <div className="border-t pt-4">
              <PaymentActions
                invoice={invoice}
                onStatusUpdate={handleStatusUpdate}
                onPaymentRecord={handlePaymentRecord}
              />
            </div>
          </div>

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
  );
};
