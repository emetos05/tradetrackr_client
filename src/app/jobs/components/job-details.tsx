"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Job } from "../types/job";
import { Client } from "@/app/clients/types/client";
import { getJobStatusLabel, getClientName } from "../../helpers/getLabel";
import { BriefcaseIcon } from "@heroicons/react/24/outline";

interface JobDetailsProps {
  job: Job;
  clients: Client[];
  isOpen: boolean;
  onClose: () => void;
}

export const JobDetails = ({
  job,
  clients,
  isOpen,
  onClose,
}: JobDetailsProps) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[90vh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded bg-white dark:bg-gray-900 p-6 shadow-lg z-50 focus:outline-none">
          <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Job Details
          </Dialog.Title>
          <Dialog.Description className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            View job information
          </Dialog.Description>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BriefcaseIcon className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold">{job.title}</h2>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">
                  Client
                </label>
                <p className="font-medium">
                  {getClientName(clients, job.clientId)}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">
                  Description
                </label>
                <p className="font-medium">{job.description}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">
                  Status
                </label>
                <p className="font-medium">{getJobStatusLabel(job.status)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">
                  Created
                </label>
                <p className="font-medium">
                  {job.createdAt ? job.createdAt.slice(0, 10) : "-"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">
                  Completed
                </label>
                <p className="font-medium">
                  {job.completedAt ? job.completedAt.slice(0, 10) : "-"}
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
