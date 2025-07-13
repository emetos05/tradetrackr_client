"use client";
import { Button } from "@/app/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Job, JobStatus } from "../types/job";
import { z } from "zod";

const jobSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  status: z.nativeEnum(JobStatus),
  createdAt: z.string().optional(),
  completedAt: z.string().optional(),
  hourlyRate: z.coerce.number().min(0, "Hourly rate required"),
  hoursWorked: z.coerce.number().min(0, "Hours worked required"),
  materialCost: z.coerce.number().min(0, "Material cost required"),
});

type JobFormData = z.infer<typeof jobSchema>;

interface JobFormProps {
  initial?: Partial<Job>;
  onSubmit: (job: Omit<Job, "id">) => Promise<void>;
  onCancel?: () => void;
  title?: string;
  clientOptions: { id: string; name: string }[];
}

export const JobForm = ({
  initial = {},
  onSubmit,
  onCancel,
  title = "Job Details",
  clientOptions,
}: JobFormProps) => {
  const [form, setForm] = useState<JobFormData>({
    clientId: initial.clientId || (clientOptions[0]?.id ?? ""),
    title: initial.title || "",
    description: initial.description || "",
    status: initial.status ?? JobStatus.NotStarted,
    createdAt: initial.createdAt || new Date().toISOString(),
    completedAt: initial.completedAt || undefined,
    hourlyRate: initial.hourlyRate ?? 0,
    hoursWorked: initial.hoursWorked ?? 0,
    materialCost: initial.materialCost ?? 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof JobFormData, string>>
  >({});
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleInputRef.current?.focus();
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: Number(e.target.value) });
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const toISODateTime = (date: string) => {
    if (!date) return undefined;
    // If already ISO, return as is
    if (date.length > 10) return date;
    // Convert YYYY-MM-DD to ISO string (midnight UTC)
    return new Date(date).toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setHasError(null);
    setFieldErrors({});
    const result = jobSchema.safeParse(form);
    if (!result.success) {
      const errors: Partial<Record<keyof JobFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof JobFormData;
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
        title: result.data.title,
        description: result.data.description,
        status: result.data.status,
        createdAt: toISODateTime(result.data.createdAt || ""),
        completedAt: result.data.completedAt
          ? toISODateTime(result.data.completedAt)
          : undefined,
        hourlyRate: result.data.hourlyRate,
        hoursWorked: result.data.hoursWorked,
        materialCost: result.data.materialCost,
      };
      await onSubmit(payload as Omit<Job, "id">);
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
      aria-labelledby="job-form-title"
    >
      <h2
        id="job-form-title"
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
          {clientOptions.map((c) => (
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
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
        >
          Title
        </label>
        <input
          ref={titleInputRef}
          id="title"
          name="title"
          placeholder="e.g. Kitchen Remodel"
          value={form.title}
          onChange={handleChange}
          className={`input input-bordered w-full ${
            fieldErrors.title
              ? "ring-2 ring-red-500"
              : "focus:ring-2 focus:ring-blue-500"
          }`}
          required
          disabled={isLoading}
          aria-invalid={!!fieldErrors.title}
          aria-describedby={fieldErrors.title ? "title-error" : undefined}
        />
        {fieldErrors.title && (
          <div id="title-error" className="text-red-500 text-xs mt-1">
            {fieldErrors.title}
          </div>
        )}
      </div>
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
        >
          Description
        </label>
        <input
          id="description"
          name="description"
          placeholder="e.g. Full kitchen remodel with new cabinets"
          value={form.description}
          onChange={handleChange}
          className={`input input-bordered w-full ${
            fieldErrors.description
              ? "ring-2 ring-red-500"
              : "focus:ring-2 focus:ring-blue-500"
          }`}
          required
          disabled={isLoading}
          aria-invalid={!!fieldErrors.description}
          aria-describedby={
            fieldErrors.description ? "description-error" : undefined
          }
        />
        {fieldErrors.description && (
          <div id="description-error" className="text-red-500 text-xs mt-1">
            {fieldErrors.description}
          </div>
        )}
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
          required
          disabled={isLoading}
          aria-invalid={!!fieldErrors.status}
          aria-describedby={fieldErrors.status ? "status-error" : undefined}
        >
          <option value={JobStatus.NotStarted}>Not Started</option>
          <option value={JobStatus.InProgress}>In Progress</option>
          <option value={JobStatus.Completed}>Completed</option>
          <option value={JobStatus.OnHold}>On Hold</option>
          <option value={JobStatus.Cancelled}>Cancelled</option>
        </select>
        {fieldErrors.status && (
          <div id="status-error" className="text-red-500 text-xs mt-1">
            {fieldErrors.status}
          </div>
        )}
      </div>
      <div>
        <label
          htmlFor="createdAt"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
        >
          Start Date
        </label>
        <input
          id="createdAt"
          name="createdAt"
          type="date"
          value={form.createdAt?.slice(0, 10) || ""}
          onChange={(e) =>
            setForm((f) => ({ ...f, createdAt: e.target.value }))
          }
          disabled={isLoading}
          className={`input input-bordered w-full ${
            fieldErrors.createdAt
              ? "ring-2 ring-red-500"
              : "focus:ring-2 focus:ring-blue-500"
          }`}
          required
          aria-invalid={!!fieldErrors.createdAt}
          aria-describedby={
            fieldErrors.createdAt ? "createdAt-error" : undefined
          }
        />
        {fieldErrors.createdAt && (
          <div id="createdAt-error" className="text-red-500 text-xs mt-1">
            {fieldErrors.createdAt}
          </div>
        )}
      </div>
      <div>
        <label
          htmlFor="completedAt"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
        >
          End Date
        </label>
        <input
          id="completedAt"
          name="completedAt"
          type="date"
          value={form.completedAt?.slice(0, 10) || ""}
          onChange={(e) =>
            setForm((f) => ({ ...f, completedAt: e.target.value }))
          }
          disabled={isLoading}
          className={`input input-bordered w-full ${
            fieldErrors.completedAt
              ? "ring-2 ring-red-500"
              : "focus:ring-2 focus:ring-blue-500"
          }`}
          aria-invalid={!!fieldErrors.completedAt}
          aria-describedby={
            fieldErrors.completedAt ? "completedAt-error" : undefined
          }
        />
        {fieldErrors.completedAt && (
          <div id="completedAt-error" className="text-red-500 text-xs mt-1">
            {fieldErrors.completedAt}
          </div>
        )}
      </div>
      <div>
        <label
          htmlFor="hourlyRate"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
        >
          Hourly Rate ($/hr)
        </label>
        <input
          id="hourlyRate"
          name="hourlyRate"
          type="number"
          min={0}
          step={0.01}
          placeholder="e.g. 50"
          value={form.hourlyRate}
          onChange={handleNumberChange}
          className={`input input-bordered w-full ${
            fieldErrors.hourlyRate
              ? "ring-2 ring-red-500"
              : "focus:ring-2 focus:ring-blue-500"
          }`}
          required
          disabled={isLoading}
          aria-invalid={!!fieldErrors.hourlyRate}
          aria-describedby={
            fieldErrors.hourlyRate ? "hourlyRate-error" : undefined
          }
        />
        {fieldErrors.hourlyRate && (
          <div id="hourlyRate-error" className="text-red-500 text-xs mt-1">
            {fieldErrors.hourlyRate}
          </div>
        )}
      </div>
      <div>
        <label
          htmlFor="hoursWorked"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
        >
          Hours Worked (hrs)
        </label>
        <input
          id="hoursWorked"
          name="hoursWorked"
          type="number"
          min={0}
          step={0.5}
          placeholder="e.g. 40"
          value={form.hoursWorked}
          onChange={handleNumberChange}
          className={`input input-bordered w-full ${
            fieldErrors.hoursWorked
              ? "ring-2 ring-red-500"
              : "focus:ring-2 focus:ring-blue-500"
          }`}
          required
          disabled={isLoading}
          aria-invalid={!!fieldErrors.hoursWorked}
          aria-describedby={
            fieldErrors.hoursWorked ? "hoursWorked-error" : undefined
          }
        />
        {fieldErrors.hoursWorked && (
          <div id="hoursWorked-error" className="text-red-500 text-xs mt-1">
            {fieldErrors.hoursWorked}
          </div>
        )}
      </div>
      <div>
        <label
          htmlFor="materialCost"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
        >
          Material Cost ($)
        </label>
        <input
          id="materialCost"
          name="materialCost"
          type="number"
          min={0}
          step={0.01}
          placeholder="e.g. 500"
          value={form.materialCost}
          onChange={handleNumberChange}
          className={`input input-bordered w-full ${
            fieldErrors.materialCost
              ? "ring-2 ring-red-500"
              : "focus:ring-2 focus:ring-blue-500"
          }`}
          required
          disabled={isLoading}
          aria-invalid={!!fieldErrors.materialCost}
          aria-describedby={
            fieldErrors.materialCost ? "materialCost-error" : undefined
          }
        />
        {fieldErrors.materialCost && (
          <div id="materialCost-error" className="text-red-500 text-xs mt-1">
            {fieldErrors.materialCost}
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
          aria-label="Save job"
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
