"use client";
import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import * as Dialog from "@radix-ui/react-dialog";
import { Pencil, Trash2, X } from "lucide-react";

interface ClientActionsProps {
  onEdit: () => void;
  onDelete: () => Promise<void>;
  disabled?: boolean;
}

export const ClientActions = ({
  onEdit,
  onDelete,
  disabled,
}: ClientActionsProps) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await onDelete();
      setShowConfirm(false);
    } catch (err: any) {
      setError(err.message || "Failed to delete client");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="secondary"
        onClick={onEdit}
        disabled={disabled || isDeleting}
        className="flex items-center gap-1"
      >
        <Pencil className="w-4 h-4" /> Edit
      </Button>
      <Dialog.Root open={showConfirm} onOpenChange={setShowConfirm}>
        <Dialog.Trigger asChild>
          <Button
            type="button"
            variant="secondary"
            disabled={disabled || isDeleting}
            className="flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />{" "}
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[90vh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded bg-white dark:bg-gray-900 p-6 shadow-lg z-50 focus:outline-none">
            <h2 className="font-semibold mb-2">Delete Client?</h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this client? This action cannot be
              undone.
            </p>
            {error && <div className="text-red-500 text-xs mb-2">{error}</div>}
            <div className="flex gap-2 justify-end">
              <Dialog.Close asChild>
                <Button type="button" variant="secondary" disabled={isDeleting}>
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                type="button"
                variant="secondary"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />{" "}
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
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
