"use client";
import { useState } from "react";
import { Job } from "../types/job";
import { getJobStatusLabel, getClientName } from "../../helpers/getLabel";
import { Client } from "@/app/clients/types/client";
import { JobForm } from "./job-form";
import { JobActions } from "./job-actions";
import { Button } from "@/app/components/ui/button";
import {
  createJob,
  updateJob,
  deleteJob,
  getJobs,
  JobDto,
} from "@/app/lib/actions";
import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { X } from "lucide-react";
import { BriefcaseIcon } from "@heroicons/react/24/outline";
import { JobDetails } from "./job-details";

interface JobsListClientProps {
  initialJobs: Job[];
  clients: Client[];
}

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

export const JobsListClient = ({
  initialJobs,
  clients,
}: JobsListClientProps) => {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [showForm, setShowForm] = useState(false);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const reload = async () => {
    const latest = await getJobs();
    setJobs(latest);
  };

  const filtered = jobs.filter((job) => {
    const q = search.toLowerCase();
    return (
      job.title.toLowerCase().includes(q) ||
      job.description.toLowerCase().includes(q) ||
      getJobStatusLabel(job.status).toLowerCase().includes(q)
    );
  });

  const handleCreate = async (data: Omit<Job, "id">) => {
    setLoading(true);
    setError(null);
    try {
      await createJob(
        buildJobPayload({
          ...data,
          createdAt: new Date(data.createdAt).toISOString(),
          completedAt: data.completedAt
            ? new Date(data.completedAt).toISOString()
            : null,
        })
      );
      await reload();
      setShowForm(false);
      setEditJob(null);
    } catch (err: Error | unknown) {
      setError((err as Error).message || "Failed to create job");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string, data: Omit<Job, "id">) => {
    setLoading(true);
    setError(null);
    try {
      await updateJob(
        id,
        buildJobPayload({
          ...data,
          createdAt: new Date(data.createdAt).toISOString(),
          completedAt: data.completedAt
            ? new Date(data.completedAt).toISOString()
            : null,
        })
      );
      await reload();
      setShowForm(false);
      setEditJob(null);
    } catch (err: Error | unknown) {
      setError((err as Error).message || "Failed to update job");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteJob(id);
      await reload();
    } catch (err: Error | unknown) {
      setError((err as Error).message || "Failed to delete job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <input
          type="text"
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-2 py-1 w-full sm:w-64"
        />
        <Button
          type="button"
          onClick={() => {
            setShowForm(true);
            setEditJob(null);
          }}
        >
          Add Job
        </Button>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {showForm && (
        <Dialog.Root open={showForm} onOpenChange={setShowForm}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
            <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[90vh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded bg-white dark:bg-gray-900 p-6 shadow-lg z-50 focus:outline-none">
              <VisuallyHidden asChild>
                <Dialog.Title>
                  {editJob ? "Edit Job" : "Add New Job"}
                </Dialog.Title>
              </VisuallyHidden>
              <VisuallyHidden asChild>
                <Dialog.Description>
                  {editJob ? "Edit the job details" : "Create a new job"}
                </Dialog.Description>
              </VisuallyHidden>
              <JobForm
                initialJob={editJob || {}}
                clients={clients}
                onSubmit={async (data) => {
                  if (editJob && editJob.id) {
                    await handleEdit(editJob.id, data);
                  } else {
                    await handleCreate(data);
                  }
                }}
                onCancel={() => {
                  setShowForm(false);
                  setEditJob(null);
                }}
                title={editJob ? "Edit Job" : "Add New Job"}
              />
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
      )}
      <ul className="grid gap-3 sm:gap-4">
        {filtered.length === 0 ? (
          <li className="py-4 text-center text-gray-500 bg-white dark:bg-gray-800 rounded shadow">
            No jobs found.
          </li>
        ) : (
          filtered.map((job) => (
            <li
              key={job.id}
              className="group bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-shadow sm:max-w-4xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
              tabIndex={0}
              aria-label={`View details for job ${job.title}`}
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold flex items-center gap-2">
                  <BriefcaseIcon className="w-5 h-5 text-green-500" />{" "}
                  {job.title}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  Client: {getClientName(clients, job.clientId)}
                  <div>Description: {job.description}</div>
                  <div>Status: {getJobStatusLabel(job.status)}</div>
                  <div>
                    Rate: ${job.hourlyRate}
                    /hr | Hours: {job.hoursWorked}hrs | Material Cost: $
                    {job.materialCost}
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Created: {job.createdAt ? job.createdAt.slice(0, 10) : "-"} |
                  Completed:{" "}
                  {job.completedAt ? job.completedAt.slice(0, 10) : "-"}
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <JobActions
                  onDetails={() => setSelectedJob(job)}
                  onEdit={() => {
                    setEditJob(job);
                    setShowForm(true);
                  }}
                  onDelete={async () => {
                    if (job.id) {
                      await handleDelete(job.id);
                    }
                  }}
                  disabled={!job.id}
                />
              </div>
            </li>
          ))
        )}
      </ul>
      {loading && <div className="text-blue-500 mt-2">Loading...</div>}
      {selectedJob && (
        <JobDetails
          job={selectedJob}
          clients={clients}
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
};
