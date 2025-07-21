import { Metadata } from "next";
import { getJobs, getClients } from "@/app/lib/actions";
import { JobsListClient } from "./components/jobs-list-client";

export const metadata: Metadata = {
  title: "Jobs",
  description: "Manage your jobs.",
};

export default async function JobsPage() {
  const [jobs, clients] = await Promise.all([getJobs(), getClients()]);
  // const jobs = await getJobs();

  return (
    <main className="flex flex-col items-center min-h-screen p-8 bg-white dark:bg-gray-900">
      <div className="w-full max-w-4xl flex flex-col">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Jobs
        </h1>
        <p className="mb-4 text-gray-600">Manage your jobs here.</p>
        <JobsListClient initialJobs={jobs} clients={clients} />
      </div>
    </main>
  );
}
