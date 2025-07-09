import { Client } from "./types/client";
import { ClientForm } from "./components/client-form";
import { Button } from "@/app/components/ui/button";
import { Suspense } from "react";
import { getClients } from "@/app/lib/actions";

const ClientsList = async () => {
  let clients: Client[] = [];
  let error: string | null = null;

  try {
    clients = await getClients();
  } catch (err: any) {
    if (err instanceof Error) {
      error = err.message;
    } else {
      error = "An unknown error occurred.";
    }
  }
  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded mb-4 border border-red-200">
        <strong>Error:</strong> {error}
      </div>
    );
  }
  if (!clients.length)
    return <div className="text-gray-500">No clients found.</div>;
  return (
    <ul className="divide-y">
      {clients.map((client) => (
        <li
          key={client.id}
          className="py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
        >
          <div>
            <div className="font-medium">{client.name}</div>
            <div className="text-sm text-gray-500">
              {client.email} | {client.phone}
            </div>
            <div className="text-xs text-gray-400">{client.address}</div>
          </div>
          {/* Edit/Delete actions will be added here */}
        </li>
      ))}
    </ul>
  );
};

export default async function ClientsPage() {
  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">Clients</h1>
      <p className="mb-4 text-gray-600">Manage your clients here.</p>
      <Suspense fallback={<div>Loading clients...</div>}>
        <ClientsList />
      </Suspense>
      {/* Add ClientForm for creating new clients here */}
    </main>
  );
}

export const metadata = {
  title: "Clients",
  description: "Manage your clients for jobs and invoices.",
};
