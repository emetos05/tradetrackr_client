"use client";
import { useState } from "react";
import { Client } from "../types/client";
import { ClientForm } from "./client-form";
import { ClientActions } from "./client-actions";
import { Button } from "@/app/components/ui/button";
import {
  createClient,
  updateClient,
  deleteClient,
  getClients,
} from "@/app/lib/actions";
import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { X } from "lucide-react";
import { UsersIcon } from "@heroicons/react/24/outline";
import { ClientDetails } from "./client-details";

interface ClientsListClientProps {
  initialClients: Client[];
}

export const ClientsListClient = ({
  initialClients,
}: ClientsListClientProps) => {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [showForm, setShowForm] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const reload = async () => {
    const latest = await getClients();
    setClients(latest);
  };

  // Debounced search
  const filtered = clients.filter((client) => {
    const q = search.toLowerCase();
    return (
      client.name.toLowerCase().includes(q) ||
      client.email.toLowerCase().includes(q) ||
      client.phone.toLowerCase().includes(q) ||
      client.address.toLowerCase().includes(q)
    );
  });

  const handleCreate = async (data: Omit<Client, "id">) => {
    setLoading(true);
    setError(null);
    try {
      await createClient(data);
      await reload();
      setShowForm(false);
      setEditClient(null);
    } catch (err: any) {
      setError(err.message || "Failed to create client");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string, data: Omit<Client, "id">) => {
    setLoading(true);
    setError(null);
    try {
      await updateClient(id, data);
      await reload();
      setEditClient(null);
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || "Failed to update client");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteClient(id);
      await reload();
    } catch (err: any) {
      setError(err.message || "Failed to delete client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-2 py-1 w-full sm:w-64"
        />
        <Button
          type="button"
          onClick={() => {
            setShowForm(true);
            setEditClient(null);
          }}
        >
          Add Client
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
                  {editClient ? "Edit Client" : "Add New Client"}
                </Dialog.Title>
              </VisuallyHidden>
              <VisuallyHidden asChild>
                <Dialog.Description>
                  {editClient
                    ? "Edit the client details."
                    : "Create a new client."}
                </Dialog.Description>
              </VisuallyHidden>
              <ClientForm
                initialClient={editClient || {}}
                onSubmit={async (data) => {
                  if (editClient && editClient.id) {
                    await handleEdit(editClient.id, data);
                  } else {
                    await handleCreate(data);
                  }
                }}
                onCancel={() => {
                  setShowForm(false);
                  setEditClient(null);
                }}
                title={editClient ? "Edit Client" : "Add New Client"}
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
            No clients found.
          </li>
        ) : (
          filtered.map((client) => (
            <li
              key={client.id}
              className="group bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-shadow sm:max-w-4xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
              tabIndex={0}
              aria-label={`View details for client ${client.name}`}
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold flex items-center gap-2">
                  <UsersIcon className="w-5 h-5 text-blue-500" /> {client.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  Email: {client.email} | Phone: {client.phone}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  Address: {client.address}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Created:{" "}
                  {client.createdAt ? client.createdAt.slice(0, 10) : "-"}
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <ClientActions
                  onDetails={() => setSelectedClient(client)}
                  onEdit={() => {
                    setEditClient(client);
                    setShowForm(true);
                  }}
                  onDelete={async () => {
                    if (client.id) {
                      await handleDelete(client.id);
                    }
                  }}
                  disabled={!client.id}
                />
              </div>
            </li>
          ))
        )}
      </ul>
      {loading && <div className="text-blue-500 mt-2">Loading...</div>}
      {selectedClient && (
        <ClientDetails
          client={selectedClient}
          isOpen={!!selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  );
};
