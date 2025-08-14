"use client";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { useState, useRef, useEffect } from "react";
import { Job, JobStatus } from "../types/job";
import { Client } from "@/app/clients/types/client";
import { createJob, updateJob, JobDto } from "@/app/lib/actions";
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

// Utility to build JobDto payload for API
const buildJobPayload = (data: Omit<Job, "id">): JobDto => ({
  clientId: data.clientId,
  title: data.title,
  description: data.description,
  status: typeof data.status === "number" ? data.status : Number(data.status),
  createdAt: data.createdAt,
  completedAt: data.completedAt ? data.completedAt : null,
  hourlyRate: data.hourlyRate,
  hoursWorked: data.hoursWorked,
  materialCost: data.materialCost,
});

interface JobFormProps {
  initialJob?: Partial<Job>;
  clients: Client[];
  onSuccess?: () => void;
  onCancel?: () => void;
  title?: string;
}

export const JobForm = ({
  initialJob = {},
  clients,
  onSuccess,
  onCancel,
}: JobFormProps) => {
  const [form, setForm] = useState<JobFormData>({
    clientId: initialJob?.clientId || "",
    title: initialJob.title || "",
    description: initialJob.description || "",
    status: initialJob.status ?? JobStatus.NotStarted,
    createdAt: initialJob.createdAt ? initialJob.createdAt.slice(0, 10) : "",
    completedAt: initialJob.completedAt
      ? initialJob.completedAt.slice(0, 10)
      : "",
    hourlyRate: initialJob.hourlyRate ?? 0,
    hoursWorked: initialJob.hoursWorked ?? 0,
    materialCost: initialJob.materialCost ?? 0,
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

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
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
        createdAt: result.data.createdAt
          ? new Date(result.data.createdAt).toISOString()
          : "",
        completedAt: result.data.completedAt
          ? new Date(result.data.completedAt).toISOString()
          : "",
        hourlyRate: result.data.hourlyRate,
        hoursWorked: result.data.hoursWorked,
        materialCost: result.data.materialCost,
      };

      // Build API payload and make the call
      const jobPayload = buildJobPayload({
        ...payload,
        createdAt: payload.createdAt || new Date().toISOString(),
        completedAt: payload.completedAt || null,
      });

      if (initialJob?.id) {
        await updateJob(initialJob.id, jobPayload);
      } else {
        await createJob(jobPayload);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: Error | unknown) {
      setHasError((err as Error).message || "Error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {hasError && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-3">
          <p className="text-sm text-red-600 dark:text-red-400">{hasError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="clientId"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Client *
          </label>
          <select
            id="clientId"
            name="clientId"
            value={form.clientId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            required
            disabled={isLoading}
          >
            <option value="">Select a client...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {fieldErrors.clientId && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {fieldErrors.clientId}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Status *
          </label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={(e) =>
              setForm((f) => ({ ...f, status: Number(e.target.value) }))
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            required
            disabled={isLoading}
          >
            <option value={JobStatus.NotStarted}>Not Started</option>
            <option value={JobStatus.InProgress}>In Progress</option>
            <option value={JobStatus.Completed}>Completed</option>
            <option value={JobStatus.OnHold}>On Hold</option>
            <option value={JobStatus.Cancelled}>Cancelled</option>
          </select>
          {fieldErrors.status && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {fieldErrors.status}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Title *
          </label>
          <Input
            ref={titleInputRef}
            id="title"
            name="title"
            placeholder="e.g. Kitchen Remodel"
            value={form.title}
            onChange={handleChange}
            className={fieldErrors.title ? "border-red-500" : ""}
            required
            disabled={isLoading}
          />
          {fieldErrors.title && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {fieldErrors.title}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="hourlyRate"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Hourly Rate ($)
          </label>
          <Input
            id="hourlyRate"
            name="hourlyRate"
            type="number"
            min={0}
            step={0.01}
            placeholder="e.g. 50.00"
            value={form.hourlyRate || ""}
            onChange={handleNumberChange}
            className={fieldErrors.hourlyRate ? "border-red-500" : ""}
            required
            disabled={isLoading}
          />
          {fieldErrors.hourlyRate && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {fieldErrors.hourlyRate}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="hoursWorked"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Hours Worked
          </label>
          <Input
            id="hoursWorked"
            name="hoursWorked"
            type="number"
            min={0}
            step={0.5}
            placeholder="e.g. 40.0"
            value={form.hoursWorked || ""}
            onChange={handleNumberChange}
            className={fieldErrors.hoursWorked ? "border-red-500" : ""}
            required
            disabled={isLoading}
          />
          {fieldErrors.hoursWorked && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {fieldErrors.hoursWorked}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="materialCost"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Material Cost ($)
          </label>
          <Input
            id="materialCost"
            name="materialCost"
            type="number"
            min={0}
            step={0.01}
            placeholder="e.g. 500.00"
            value={form.materialCost || ""}
            onChange={handleNumberChange}
            className={fieldErrors.materialCost ? "border-red-500" : ""}
            required
            disabled={isLoading}
          />
          {fieldErrors.materialCost && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {fieldErrors.materialCost}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="createdAt"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Start Date *
          </label>
          <Input
            id="createdAt"
            name="createdAt"
            type="date"
            value={form.createdAt || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, createdAt: e.target.value }))
            }
            className={fieldErrors.createdAt ? "border-red-500" : ""}
            disabled={isLoading}
            required
          />
          {fieldErrors.createdAt && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {fieldErrors.createdAt}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="completedAt"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Completed Date
          </label>
          <Input
            id="completedAt"
            name="completedAt"
            type="date"
            value={form.completedAt || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, completedAt: e.target.value }))
            }
            className={fieldErrors.completedAt ? "border-red-500" : ""}
            disabled={isLoading}
          />
          {fieldErrors.completedAt && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {fieldErrors.completedAt}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Description *
        </label>
        <Textarea
          id="description"
          name="description"
          placeholder="e.g. Full kitchen remodel with new cabinets, countertops, and appliances"
          value={form.description}
          onChange={handleTextareaChange}
          className={fieldErrors.description ? "border-red-500" : ""}
          rows={3}
          required
          disabled={isLoading}
        />
        {fieldErrors.description && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {fieldErrors.description}
          </p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Saving..."
            : initialJob?.id
            ? "Update Job"
            : "Create Job"}
        </Button>
      </div>
    </form>
  );
};
