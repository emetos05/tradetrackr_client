"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Client } from "@/app/clients/types/client";
import { Job } from "@/app/jobs/types/job";
import { Invoice } from "../types/invoice";
import {
  getInvoiceStatusLabel,
  getClientName,
  getJobTitle,
} from "../../helpers/getLabel";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

interface InvoiceDetailsProps {
  invoice: Invoice;
  clients: Client[];
  jobs: Job[];
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceDetails = ({
  invoice,
  clients,
  jobs,
  isOpen,
  onClose,
}: InvoiceDetailsProps) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[90vh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded bg-white dark:bg-gray-900 p-6 shadow-lg z-50 focus:outline-none">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <DocumentTextIcon className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold">
                Invoice For:{" "}
                <span className="text-base text-gray-600 dark:text-gray-400">
                  {getJobTitle(jobs, invoice.jobId) || "Unknown Job"}
                </span>
              </h2>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">
                  Client
                </label>
                <p className="font-medium">
                  {getClientName(clients, invoice.clientId)}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">
                  Job
                </label>
                <p className="font-medium">
                  {getJobTitle(jobs, invoice.jobId)}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">
                  Amount
                </label>
                <p className="font-medium">${invoice.amount.toFixed(2)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">
                  Status
                </label>
                <p className="font-medium">
                  {getInvoiceStatusLabel(invoice.status)}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">
                  Issued
                </label>
                <p className="font-medium">
                  {invoice.issueDate ? invoice.issueDate.slice(0, 10) : "-"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">
                  Due
                </label>
                <p className="font-medium">
                  {invoice.dueDate ? invoice.dueDate.slice(0, 10) : "-"}
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
