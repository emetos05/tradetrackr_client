"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Invoice, InvoiceStatus } from "../types/invoice";
import { Client } from "@/app/clients/types/client";
import { Job } from "@/app/jobs/types/job";
import { createInvoice, updateInvoice } from "@/app/lib/actions";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";

interface InvoiceFormProps {
  invoice?: Partial<Invoice>;
  clients: Client[];
  jobs: Job[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

const invoiceFormSchema = z
  .object({
    clientId: z.string().min(1, "Client is required"),
    jobId: z.string().optional(),
    issueDate: z.string().min(1, "Issue date is required"),
    dueDate: z.string().min(1, "Due date is required"),
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    taxRate: z.number().min(0).max(100, "Tax rate must be between 0 and 100"),
    notes: z.string().optional(),
    terms: z.string().optional(),
  })
  .refine(
    (data) => {
      const issueDate = new Date(data.issueDate);
      const dueDate = new Date(data.dueDate);
      // Compare date strings directly since they are in 'YYYY-MM-DD' format
      return dueDate >= issueDate;
    },
    {
      message: "Due date must be on or after issue date",
      path: ["dueDate"],
    }
  );

type InvoiceFormData = z.infer<typeof invoiceFormSchema>;

export function InvoiceForm({
  invoice,
  clients,
  jobs,
  onSuccess,
  onCancel,
}: InvoiceFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<InvoiceFormData>({
    clientId: invoice?.clientId || "",
    jobId: invoice?.jobId || undefined,
    issueDate: invoice?.issueDate ? invoice?.issueDate.slice(0, 10) : "",
    dueDate: invoice?.dueDate ? invoice?.dueDate.slice(0, 10) : "",
    amount: invoice?.amount || 0,
    taxRate: invoice?.taxRate || 0,
    notes: invoice?.notes || "",
    terms: invoice?.terms || "",
  });

  // selectedClient variable removed as it's not used
  const availableJobs = jobs.filter((j) => j.clientId === formData.clientId);

  // Calculate tax and total amounts
  const calculatedAmounts = useMemo(() => {
    const subtotal = formData.amount || 0;
    const taxRate = formData.taxRate || 0;
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount;

    return {
      subtotal,
      taxAmount: Math.round(taxAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
    };
  }, [formData.amount, formData.taxRate]);

  const handleInputChange = (field: keyof InvoiceFormData, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when field is modified
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    try {
      invoiceFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const invoiceData: Omit<Invoice, "id"> = {
        clientId: formData.clientId,
        jobId: formData.jobId || "",
        status: invoice?.status || InvoiceStatus.Draft,
        issueDate: new Date(formData.issueDate).toISOString(),
        dueDate: new Date(formData.dueDate).toISOString(),
        amount: calculatedAmounts.subtotal,
        taxRate: formData.taxRate,
        taxAmount: calculatedAmounts.taxAmount,
        totalAmount: calculatedAmounts.totalAmount,
        notes: formData.notes || undefined,
        terms: formData.terms || undefined,
        // These will be calculated by the API
        isOverdue: false,
        isPaid: false,
        daysUntilDue: 0,
      };

      if (invoice?.id) {
        await updateInvoice(invoice.id, invoiceData);
      } else {
        await createInvoice(invoiceData);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/invoices");
        router.refresh();
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      setErrors({ submit: "Failed to save invoice. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-3">
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.submit}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client Selection */}
        <div>
          <label
            htmlFor="clientId"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Client *
          </label>
          <select
            id="clientId"
            value={formData.clientId}
            onChange={(e) => {
              const clientId = e.target.value;
              handleInputChange("clientId", clientId);
              // Reset job selection when client changes
              if (
                formData.jobId &&
                !jobs.some(
                  (j) => j.id === formData.jobId && j.clientId === clientId
                )
              ) {
                handleInputChange("jobId", undefined);
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            required
          >
            <option value="">Select a client...</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          {errors.clientId && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.clientId}
            </p>
          )}
        </div>

        {/* Job Selection */}
        <div>
          <label
            htmlFor="jobId"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Job *
          </label>
          <select
            id="jobId"
            value={formData.jobId || ""}
            onChange={(e) =>
              handleInputChange(
                "jobId",
                e.target.value ? e.target.value : undefined
              )
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            disabled={!formData.clientId}
          >
            <option value="">No job selected</option>
            {availableJobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
          {formData.clientId && availableJobs.length === 0 && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              No jobs available for selected client
            </p>
          )}
        </div>

        {/* Invoice Number - removed as it's not in the current Invoice schema */}

        {/* Amount */}
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Amount ($)
          </label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min={0}
            value={formData.amount || ""}
            onChange={(e) =>
              handleInputChange("amount", parseFloat(e.target.value) || 0)
            }
            placeholder="e.g. 0.00"
            className={errors.amount ? "border-red-500" : ""}
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.amount}
            </p>
          )}
        </div>

        {/* Issue Date */}
        <div>
          <label
            htmlFor="issueDate"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Issue Date *
          </label>
          <Input
            id="issueDate"
            type="date"
            value={formData.issueDate}
            onChange={(e) => handleInputChange("issueDate", e.target.value)}
            className={errors.issueDate ? "border-red-500" : ""}
          />
          {errors.issueDate && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.issueDate}
            </p>
          )}
        </div>

        {/* Due Date */}
        <div>
          <label
            htmlFor="dueDate"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Due Date *
          </label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleInputChange("dueDate", e.target.value)}
            className={errors.dueDate ? "border-red-500" : ""}
          />
          {errors.dueDate && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.dueDate}
            </p>
          )}
        </div>

        {/* Subtotal Amount - removed, use amount instead */}

        {/* Tax Rate */}
        <div>
          <label
            htmlFor="taxRate"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Tax Rate (%)
          </label>
          <Input
            id="taxRate"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={formData.taxRate || ""}
            onChange={(e) =>
              handleInputChange("taxRate", parseFloat(e.target.value) || 0)
            }
            placeholder="e.g. 0.00"
            className={errors.taxRate ? "border-red-500" : ""}
          />
          {errors.taxRate && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.taxRate}
            </p>
          )}
        </div>
      </div>

      {/* Calculated Amounts Display */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Amount Summary
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
            <span className="font-medium">
              ${calculatedAmounts.subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Tax ({formData.taxRate}%):
            </span>
            <span className="font-medium">
              ${calculatedAmounts.taxAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              Total:
            </span>
            <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
              ${calculatedAmounts.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Description - removed as it's not in current Invoice schema */}

      {/* Notes */}
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Notes
        </label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          placeholder="Internal notes (not visible to client)"
          rows={2}
        />
      </div>

      {/* Terms */}
      <div>
        <label
          htmlFor="terms"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Terms & Conditions
        </label>
        <Textarea
          id="terms"
          value={formData.terms}
          onChange={(e) => handleInputChange("terms", e.target.value)}
          placeholder="Payment terms and conditions"
          rows={3}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel || (() => router.back())}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Saving..."
            : invoice?.id
            ? "Update Invoice"
            : "Create Invoice"}
        </Button>
      </div>
    </form>
  );
}
