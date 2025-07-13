"use client";
import { useState } from "react";
import { Button } from "@/app/components/ui/button";

interface JobActionsProps {
  onEdit: () => void;
  onDelete: () => Promise<void>;
  disabled?: boolean;
}

export const JobActions = ({ onEdit, onDelete, disabled }: JobActionsProps) => {
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
      setError(err.message || "Failed to delete job");
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
      >
        Edit
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={() => setShowConfirm(true)}
        disabled={disabled || isDeleting}
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </Button>
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded shadow-lg w-80">
            <h2 className="font-semibold mb-2">Delete Job?</h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this job? This action cannot be
              undone.
            </p>
            {error && <div className="text-red-500 text-xs mb-2">{error}</div>}
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
