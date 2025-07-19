import { getClients } from "@/app/lib/actions";
import { ClientsListClient } from "./components/clients-list-client";

export const metadata = {
  title: "Clients",
  description: "Manage your clients.",
};

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <main className="flex flex-col items-center min-h-screen p-8 bg-white dark:bg-gray-900">
      <div className="w-full max-w-4xl flex flex-col">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Clients
        </h1>
        <p className="mb-4 text-gray-600">Manage your clients here.</p>
        <ClientsListClient initialClients={clients} />
      </div>
    </main>
  );
}
