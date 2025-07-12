import { getClients } from "@/app/lib/actions";
import { ClientsListClient } from "./components/clients-list-client";

export const metadata = {
  title: "Clients",
  description: "Manage your clients.",
};

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">Clients</h1>
      <p className="mb-4 text-gray-600">Manage your clients here.</p>
      <ClientsListClient initialClients={clients} />
    </main>
  );
}
