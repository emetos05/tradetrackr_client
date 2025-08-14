"use client";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { Client } from "../types/client";
import { z } from "zod";

const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  createdAt: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  initialClient?: Partial<Client>;
  onSubmit: (client: Omit<Client, "id">) => Promise<void>;
  onCancel?: () => void;
  title?: string;
}

export const ClientForm = ({
  initialClient = {},
  onSubmit,
  onCancel,
}: ClientFormProps) => {
  const [form, setForm] = useState<ClientFormData>({
    name: initialClient.name || "",
    email: initialClient.email || "",
    phone: initialClient.phone || "",
    address: initialClient.address || "",
    createdAt: initialClient.createdAt || new Date().toISOString(),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ClientFormData, string>>
  >({});
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  // Keyboard shortcuts: Enter to submit, Escape to cancel
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setHasError(null);
    setFieldErrors({});
    const result = clientSchema.safeParse(form);
    if (!result.success) {
      const errors: Partial<Record<keyof ClientFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof ClientFormData;
        errors[field] = err.message;
      });
      setFieldErrors(errors);
      setIsLoading(false);
      return;
    }
    try {
      // Only send API-required fields, convert dates to ISO
      const payload = {
        name: result.data.name,
        email: result.data.email,
        phone: result.data.phone,
        address: result.data.address,
        createdAt: result.data.createdAt
          ? new Date(result.data.createdAt).toISOString()
          : "",
      };
      await onSubmit(payload as Omit<Client, "id">);
    } catch (err: Error | unknown) {
      setHasError((err as Error).message || "Failed to create client");
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
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Name *
          </label>
          <Input
            ref={nameInputRef}
            id="name"
            name="name"
            placeholder="e.g. Jane Doe"
            value={form.name}
            onChange={handleChange}
            className={fieldErrors.name ? "border-red-500" : ""}
            required
            disabled={isLoading}
          />
          {fieldErrors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {fieldErrors.name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Email *
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="e.g. jane@example.com"
            value={form.email}
            onChange={handleChange}
            className={fieldErrors.email ? "border-red-500" : ""}
            required
            disabled={isLoading}
          />
          {fieldErrors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Phone *
          </label>
          <Input
            id="phone"
            name="phone"
            placeholder="e.g. (555) 123-4567"
            value={form.phone}
            onChange={handleChange}
            className={fieldErrors.phone ? "border-red-500" : ""}
            required
            disabled={isLoading}
          />
          {fieldErrors.phone && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {fieldErrors.phone}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Address *
          </label>
          <Input
            id="address"
            name="address"
            placeholder="e.g. 123 Main St, City, Country"
            value={form.address}
            onChange={handleChange}
            className={fieldErrors.address ? "border-red-500" : ""}
            required
            disabled={isLoading}
          />
          {fieldErrors.address && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {fieldErrors.address}
            </p>
          )}
        </div>
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
            : initialClient.id
            ? "Update Client"
            : "Create Client"}
        </Button>
      </div>
    </form>
  );
};
