import { Button } from "@/app/components/ui/button";
import { useState } from "react";
import { Client } from "../types/client";

interface ClientFormProps {
  initial?: Partial<Client>;
  onSubmit: (client: Omit<Client, "id">) => Promise<void>;
  onCancel?: () => void;
}

export const ClientForm = ({
  initial = {},
  onSubmit,
  onCancel,
}: ClientFormProps) => {
  const [form, setForm] = useState<Omit<Client, "id">>({
    name: initial.name || "",
    email: initial.email || "",
    phone: initial.phone || "",
    address: initial.address || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setHasError(null);
    try {
      await onSubmit(form);
    } catch (err: any) {
      setHasError(err.message || "Error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={handleChange}
        className="input input-bordered w-full"
        required
      />
      <input
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        className="input input-bordered w-full"
        required
        type="email"
      />
      <input
        name="phone"
        placeholder="Phone"
        value={form.phone}
        onChange={handleChange}
        className="input input-bordered w-full"
        required
      />
      <input
        name="address"
        placeholder="Address"
        value={form.address}
        onChange={handleChange}
        className="input input-bordered w-full"
        required
      />
      {hasError && <div className="text-red-500 text-sm">{hasError}</div>}
      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save"}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};
