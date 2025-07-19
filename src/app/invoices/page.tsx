import { getInvoices, getClients, getJobs } from "@/app/lib/actions";
import { InvoicesListClient } from "./components/invoices-list-client";

export const metadata = {
  title: "Invoices",
  description: "Manage your invoices.",
};

export default async function InvoicesPage() {
  const [invoices, clients, jobs] = await Promise.all([
    getInvoices(),
    getClients(),
    getJobs(),
  ]);

  return (
    <main className="flex flex-col items-center min-h-screen p-8 bg-white dark:bg-gray-900">
      <div className="w-full max-w-4xl flex flex-col">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Invoices
        </h1>
        <p className="mb-4 text-gray-600">Manage your invoices here.</p>
        <InvoicesListClient
          initialInvoices={invoices}
          clients={clients}
          jobs={jobs}
        />
      </div>
    </main>
  );
}
