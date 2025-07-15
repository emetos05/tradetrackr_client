"use client";
import { Button } from "@/app/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Client } from "../types/client";
import { z } from "zod";

const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
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
  title = "Client Details",
}: ClientFormProps) => {
  const [form, setForm] = useState<ClientFormData>({
    name: initialClient.name || "",
    email: initialClient.email || "",
    phone: initialClient.phone || "",
    address: initialClient.address || "",
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
      await onSubmit(result.data);
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
      aria-labelledby="client-form-title"
    >
      <h2
        id="client-form-title"
        className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100"
      >
        {title}
      </h2>
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
        >
          Name
        </label>
        <input
          ref={nameInputRef}
          id="name"
          name="name"
          placeholder="e.g. Jane Doe"
          value={form.name}
          onChange={handleChange}
          className={`input input-bordered w-full ${
            fieldErrors.name
              ? "ring-2 ring-red-500"
              : "focus:ring-2 focus:ring-blue-500"
          }`}
          required
          disabled={isLoading}
          aria-invalid={!!fieldErrors.name}
          aria-describedby={fieldErrors.name ? "name-error" : undefined}
        />
        {fieldErrors.name && (
          <div id="name-error" className="text-red-500 text-xs mt-1">
            {fieldErrors.name}
          </div>
        )}
      </div>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          placeholder="e.g. jane@example.com"
          value={form.email}
          onChange={handleChange}
          className={`input input-bordered w-full ${
            fieldErrors.email
              ? "ring-2 ring-red-500"
              : "focus:ring-2 focus:ring-blue-500"
          }`}
          required
          type="email"
          disabled={isLoading}
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
        />
        {fieldErrors.email && (
          <div id="email-error" className="text-red-500 text-xs mt-1">
            {fieldErrors.email}
          </div>
        )}
      </div>
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
        >
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          placeholder="e.g. (555) 123-4567"
          value={form.phone}
          onChange={handleChange}
          className={`input input-bordered w-full ${
            fieldErrors.phone
              ? "ring-2 ring-red-500"
              : "focus:ring-2 focus:ring-blue-500"
          }`}
          required
          disabled={isLoading}
          aria-invalid={!!fieldErrors.phone}
          aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
        />
        {fieldErrors.phone && (
          <div id="phone-error" className="text-red-500 text-xs mt-1">
            {fieldErrors.phone}
          </div>
        )}
      </div>
      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
        >
          Address
        </label>
        <input
          id="address"
          name="address"
          placeholder="e.g. 123 Main St, City, Country"
          value={form.address}
          onChange={handleChange}
          className={`input input-bordered w-full ${
            fieldErrors.address
              ? "ring-2 ring-red-500"
              : "focus:ring-2 focus:ring-blue-500"
          }`}
          required
          disabled={isLoading}
          aria-invalid={!!fieldErrors.address}
          aria-describedby={fieldErrors.address ? "address-error" : undefined}
        />
        {fieldErrors.address && (
          <div id="address-error" className="text-red-500 text-xs mt-1">
            {fieldErrors.address}
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
          aria-label="Save client"
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
