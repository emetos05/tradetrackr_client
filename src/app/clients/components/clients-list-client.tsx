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
      const updated = await getClients();
      setClients(updated);
      setShowForm(false);
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
      const updated = await getClients();
      setClients(updated);
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
      const updated = await getClients();
      setClients(updated);
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
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded shadow-lg w-full max-w-md relative">
            <ClientForm
              initial={editClient || {}}
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
            />
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              onClick={() => {
                setShowForm(false);
                setEditClient(null);
              }}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {filtered.length === 0 ? (
          <li className="py-4 text-center text-gray-500">No clients found.</li>
        ) : (
          filtered.map((client) => (
            <li
              key={client.id}
              className="py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
            >
              <div>
                <div className="font-semibold">{client.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {client.email} | {client.phone} | {client.address}
                </div>
              </div>
              <ClientActions
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
            </li>
          ))
        )}
      </ul>
      {loading && <div className="text-blue-500 mt-2">Loading...</div>}
    </div>
  );
};
