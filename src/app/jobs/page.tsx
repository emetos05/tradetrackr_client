import { getJobs, getClients } from "@/app/lib/actions";
import { JobsListClient } from "./components/jobs-list-client";

export const metadata = {
  title: "Jobs",
  description: "Manage your jobs.",
};

export default async function JobsPage() {
  const [jobs, clients] = await Promise.all([getJobs(), getClients()]);
  // const jobs = await getJobs();

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">Jobs</h1>
      <p className="mb-4 text-gray-600">Manage your jobs here.</p>
      <JobsListClient initialJobs={jobs} clients={clients} />
    </main>
  );
}
