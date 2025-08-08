"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { X, DollarSign, Calendar, CheckCircle } from "lucide-react";
import {
  Invoice,
  InvoiceStatus,
  UpdateInvoiceStatusRequest,
  RecordPaymentRequest,
} from "../types/invoice";
import {
  getInvoiceStatusLabel,
  getInvoiceStatusBadgeVariant,
  formatCurrency,
} from "@/app/helpers/getLabel";

interface PaymentActionsProps {
  invoice: Invoice;
  onStatusUpdate: (invoiceId: string, status: InvoiceStatus) => Promise<void>;
  onPaymentRecord: (
    invoiceId: string,
    payment: RecordPaymentRequest
  ) => Promise<void>;
  className?: string;
}

export const PaymentActions = ({
  invoice,
  onStatusUpdate,
  onPaymentRecord,
  className,
}: PaymentActionsProps) => {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Optimistic state for status to immediately reflect UI changes
  const [optimisticStatus, setOptimisticStatus] = useState(invoice.status);
  const isOptimisticRef = useRef(false);

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState(invoice.totalAmount);
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const handleStatusUpdate = async (newStatus: InvoiceStatus) => {
    if (!invoice.id) {
      setError("Missing invoice ID");
      return;
    }
    const prevStatus = optimisticStatus;
    // Start optimistic update
    setError(null);
    setIsLoading(true);
    isOptimisticRef.current = true;
    setOptimisticStatus(newStatus);
    // Close immediately for a snappy feel
    setShowStatusModal(false);

    try {
      await onStatusUpdate(invoice.id, newStatus);
    } catch (err) {
      // Rollback on failure
      setOptimisticStatus(prevStatus);
      setError((err as Error).message || "Failed to update status");
      // Re-open to let the user retry/change
      setShowStatusModal(true);
    } finally {
      isOptimisticRef.current = false;
      setIsLoading(false);
    }
  };

  const handlePaymentRecord = async () => {
    if (!paymentAmount || paymentAmount <= 0) {
      setError("Payment amount is required and must be greater than 0");
      return;
    }

    if (!paymentDate) {
      setError("Payment date is required");
      return;
    }

    if (!invoice.id) {
      setError("Missing invoice ID");
      return;
    }

    const prevStatus = optimisticStatus;
    setIsLoading(true);
    setError(null);
    isOptimisticRef.current = true;
    // Optimistically mark as Paid only if payment covers total
    if (paymentAmount >= invoice.totalAmount) {
      setOptimisticStatus(InvoiceStatus.Paid);
    }
    setShowPaymentModal(false);

    try {
      await onPaymentRecord(invoice.id, {
        amount: paymentAmount,
        paymentDate: new Date(paymentDate).toISOString(),
      });
    } catch (err) {
      // Rollback on failure
      setOptimisticStatus(prevStatus);
      setError((err as Error).message || "Failed to record payment");
      // Re-open so the user can adjust/retry
      setShowPaymentModal(true);
    } finally {
      isOptimisticRef.current = false;
      setIsLoading(false);
    }
  };

  // Keep optimistic status in sync with prop when not mid-optimistic update
  useEffect(() => {
    if (!isOptimisticRef.current) {
      setOptimisticStatus(invoice.status);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice.status]);

  const statusOptions = [
    { value: InvoiceStatus.Draft, label: "Draft", disabled: false },
    { value: InvoiceStatus.Sent, label: "Sent", disabled: false },
    { value: InvoiceStatus.Paid, label: "Paid", disabled: false },
    { value: InvoiceStatus.Overdue, label: "Overdue", disabled: false },
    { value: InvoiceStatus.Cancelled, label: "Cancelled", disabled: false },
  ].filter((option) => option.value !== optimisticStatus);

  return (
    <div className={`flex gap-2 ${className || ""}`}>
      {/* Quick Status Actions */}
      {optimisticStatus !== InvoiceStatus.Paid && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowPaymentModal(true)}
          className="flex items-center gap-1"
        >
          <DollarSign className="w-3 h-3" />
          Record Payment
        </Button>
      )}

      <Button
        size="sm"
        variant="outline"
        onClick={() => setShowStatusModal(true)}
        className="flex items-center gap-1"
      >
        <Badge
          variant={getInvoiceStatusBadgeVariant(optimisticStatus) as any}
          className="text-xs"
        >
          {getInvoiceStatusLabel(optimisticStatus)}
        </Badge>
        Change Status
      </Button>

      {/* Status Update Modal */}
      <Dialog.Root open={showStatusModal} onOpenChange={setShowStatusModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[90vh] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded bg-white dark:bg-gray-900 p-6 shadow-lg z-50 focus:outline-none">
            <VisuallyHidden asChild>
              <Dialog.Title>Update Invoice Status</Dialog.Title>
            </VisuallyHidden>
            <VisuallyHidden asChild>
              <Dialog.Description>
                Change the status of this invoice
              </Dialog.Description>
            </VisuallyHidden>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Update Invoice Status</h3>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Current status:{" "}
                  <Badge
                    variant={
                      getInvoiceStatusBadgeVariant(optimisticStatus) as any
                    }
                  >
                    {getInvoiceStatusLabel(optimisticStatus)}
                  </Badge>
                </p>

                <div className="space-y-2">
                  {statusOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleStatusUpdate(option.value)}
                      disabled={isLoading || option.disabled}
                    >
                      <Badge
                        variant={
                          getInvoiceStatusBadgeVariant(option.value) as any
                        }
                        className="mr-2"
                      >
                        {option.label}
                      </Badge>
                      {option.value === InvoiceStatus.Paid && "Mark as Paid"}
                      {option.value === InvoiceStatus.Sent && "Mark as Sent"}
                      {option.value === InvoiceStatus.Draft && "Move to Draft"}
                      {option.value === InvoiceStatus.Overdue &&
                        "Mark as Overdue"}
                      {option.value === InvoiceStatus.Cancelled &&
                        "Cancel Invoice"}
                    </Button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-2">
                  {error}
                </div>
              )}
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

      {/* Payment Recording Modal */}
      <Dialog.Root open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[90vh] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded bg-white dark:bg-gray-900 p-6 shadow-lg z-50 focus:outline-none">
            <VisuallyHidden asChild>
              <Dialog.Title>Record Payment</Dialog.Title>
            </VisuallyHidden>
            <VisuallyHidden asChild>
              <Dialog.Description>
                Record a payment for this invoice
              </Dialog.Description>
            </VisuallyHidden>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold">Record Payment</h3>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Invoice Total
                </p>
                <p className="font-semibold text-lg">
                  {formatCurrency(invoice.totalAmount)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Payment Amount
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  placeholder="Payment amount"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Payment Date
                </label>
                <Input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-2">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handlePaymentRecord}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Recording..." : "Record Payment"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentModal(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
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
    </div>
  );
};
