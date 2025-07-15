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
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">Invoices</h1>
      <p className="mb-4 text-gray-600">Manage your invoices here.</p>
      <InvoicesListClient
        initialInvoices={invoices}
        clients={clients}
        jobs={jobs}
      />
    </main>
  );
}
