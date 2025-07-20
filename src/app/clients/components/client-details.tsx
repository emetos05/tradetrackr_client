"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Client } from "../types/client";
import { UsersIcon } from "@heroicons/react/24/outline";

interface ClientDetailsProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
}

export const ClientDetails = ({
  client,
  isOpen,
  onClose,
}: ClientDetailsProps) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[90vh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded bg-white dark:bg-gray-900 p-6 shadow-lg z-50 focus:outline-none">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <UsersIcon className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold">{client.name}</h2>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">
                  Email
                </label>
                <p className="font-medium">{client.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">
                  Phone
                </label>
                <p className="font-medium">{client.phone}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">
                  Address
                </label>
                <p className="font-medium">{client.address}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">
                  Created
                </label>
                <p className="font-medium">
                  {client.createdAt ? client.createdAt.slice(0, 10) : "-"}
                </p>
              </div>
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
  );
};
