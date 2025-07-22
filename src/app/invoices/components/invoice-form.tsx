"use client";
import { Button } from "@/app/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Invoice, InvoiceStatus } from "../types/invoice";
import { Job } from "@/app/jobs/types/job";
import { Client } from "@/app/clients/types/client";
import { z } from "zod";

const invoiceSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  jobId: z.string().optional(),
  status: z.nativeEnum(InvoiceStatus),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  amount: z.coerce.number().min(0, "Amount is required"),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  initialInvoice?: Partial<Invoice>;
  clients: Client[];
  jobs: Job[];
  onSubmit: (data: Omit<Invoice, "id">) => Promise<void>;
  onCancel?: () => void;
  title?: string;
}

export const InvoiceForm = ({
  initialInvoice,
  clients,
  jobs,
  onSubmit,
  onCancel,
  title = "Invoice Details",
}: InvoiceFormProps) => {
  const [form, setForm] = useState<InvoiceFormData>({
    clientId: initialInvoice?.clientId || "",
    jobId: initialInvoice?.jobId || "",
    status: initialInvoice?.status ?? InvoiceStatus.Draft,
    issueDate: initialInvoice?.issueDate
      ? initialInvoice?.issueDate.slice(0, 10)
      : "",
    dueDate: initialInvoice?.dueDate
      ? initialInvoice?.dueDate.slice(0, 10)
      : "",
    amount: initialInvoice?.amount ?? 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof InvoiceFormData, string>>
  >({});
  const clientInputRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    clientInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !isLoading) {
        (document.activeElement as HTMLElement)?.blur();
      }
      if (e.key === "Escape" && onCancel) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isLoading, onCancel]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number(value) : value,
    }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: Number(e.target.value) });
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setHasError(null);
    setFieldErrors({});
    const result = invoiceSchema.safeParse({
      ...form,
      // Ensure empty strings are handled properly for validation
      amount: form.amount || undefined,
    });
    if (!result.success) {
      const errors: Partial<Record<keyof InvoiceFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof InvoiceFormData;
        errors[field] = err.message;
      });
      setFieldErrors(errors);
      setIsLoading(false);
      return;
    }
    try {
      // Only send API-required fields, convert dates to ISO
      const payload = {
        clientId: result.data.clientId,
        jobId: result.data.jobId,
        status: result.data.status,
        issueDate: result.data.issueDate
          ? new Date(result.data.issueDate).toISOString()
          : "",
        dueDate: result.data.dueDate
          ? new Date(result.data.dueDate).toISOString()
          : "",
        amount: result.data.amount,
      };
      await onSubmit(payload as Omit<Invoice, "id">);
    } catch (err: any) {
      setHasError(err.message || "Error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-md mx-auto"
      aria-labelledby="invoice-form-title"
    >
      <h2
        id="invoice-form-title"
        className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100"
      >
        {title}
      </h2>
      <div>
        <label
          htmlFor="clientId"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
        >
          Client
        </label>
        <select
          ref={clientInputRef}
          id="clientId"
          name="clientId"
          value={form.clientId}
          onChange={handleChange}
          className={`input input-bordered w-full ${
            fieldErrors.clientId
              ? "ring-2 ring-red-500"
              : "focus:ring-2 focus:ring-blue-500"
          }`}
          required
          disabled={isLoading}
          aria-invalid={!!fieldErrors.clientId}
          aria-describedby={fieldErrors.clientId ? "clientId-error" : undefined}
        >
          <option value="">Select a Client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {fieldErrors.clientId && (
          <div id="clientId-error" className="text-red-500 text-xs mt-1">
            {fieldErrors.clientId}
          </div>
        )}
      </div>
      <div>
        <label
          htmlFor="jobId"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
        >
          Job (optional)
        </label>
        <select
          id="jobId"
          name="jobId"
          value={form.jobId || ""}
          onChange={handleChange}
          className="input input-bordered w-full"
          disabled={isLoading}
        >
          <option value="">None</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
        >
          Status
        </label>
        <select
          id="status"
          name="status"
          value={form.status}
          onChange={(e) =>
            setForm((f) => ({ ...f, status: Number(e.target.value) }))
          }
          className={`input input-bordered w-full ${
            fieldErrors.status
              ? "ring-2 ring-red-500"
              : "focus:ring-2 focus:ring-blue-500"
          }`}
          disabled={isLoading}
          aria-invalid={!!fieldErrors.status}
          aria-describedby={fieldErrors.status ? "status-error" : undefined}
        >
          {Object.entries(InvoiceStatus)
            .filter(([k, v]) => !isNaN(Number(v)))
            .map(([k, v]) => (
              <option key={v} value={v}>
                {k}
              </option>
            ))}
        </select>
        {fieldErrors.status && (
          <div id="status-error" className="text-red-500 text-xs mt-1">
            {fieldErrors.status}
          </div>
        )}
      </div>
      <div>
        <label
          htmlFor="issueDate"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
        >
          Issue Date
        </label>
        <input
          type="date"
          id="issueDate"
          name="issueDate"
          value={form.issueDate || ""}
          onChange={(e) =>
            setForm((f) => ({ ...f, issueDate: e.target.value }))
          }
          className={`input input-bordered w-full ${
            fieldErrors.issueDate
              ? "ring-2 ring-red-500"
              : "focus:ring-2 focus:ring-blue-500"
          }`}
          required
          disabled={isLoading}
          aria-invalid={!!fieldErrors.issueDate}
          aria-describedby={
            fieldErrors.issueDate ? "issueDate-error" : undefined
          }
        />
        {fieldErrors.issueDate && (
          <div id="issueDate-error" className="text-red-500 text-xs mt-1">
            {fieldErrors.issueDate}
          </div>
        )}
      </div>
      <div>
        <label
          htmlFor="dueDate"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
        >
          Due Date
        </label>
        <input
          type="date"
          id="dueDate"
          name="dueDate"
          value={form.dueDate || ""}
          onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
          disabled={isLoading}
          className={`input input-bordered w-full ${
            fieldErrors.dueDate
              ? "ring-2 ring-red-500"
              : "focus:ring-2 focus:ring-blue-500"
          }`}
          required
          aria-invalid={!!fieldErrors.dueDate}
          aria-describedby={fieldErrors.dueDate ? "dueDate-error" : undefined}
        />
        {fieldErrors.dueDate && (
          <div id="dueDate-error" className="text-red-500 text-xs mt-1">
            {fieldErrors.dueDate}
          </div>
        )}
      </div>
      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
        >
          Amount ($)
        </label>
        <input
          type="number"
          id="amount"
          name="amount"
          min={0}
          step={0.01}
          placeholder="e.g. 20"
          value={form.amount || ""}
          onChange={handleNumberChange}
          className={`input input-bordered w-full ${
            fieldErrors.amount
              ? "ring-2 ring-red-500"
              : "focus:ring-2 focus:ring-blue-500"
          }`}
          required
          disabled={isLoading}
          aria-invalid={!!fieldErrors.amount}
          aria-describedby={fieldErrors.amount ? "amount-error" : undefined}
        />
        {fieldErrors.amount && (
          <div id="amount-error" className="text-red-500 text-xs mt-1">
            {fieldErrors.amount}
          </div>
        )}
      </div>
      {hasError && (
        <div
          className="text-red-600 text-sm font-medium bg-red-50 border border-red-200 rounded p-2"
          role="alert"
        >
          {hasError}
        </div>
      )}
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
          aria-label="Save invoice"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
              Saving...
            </span>
          ) : (
            "Save"
          )}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
            aria-label="Cancel"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};
