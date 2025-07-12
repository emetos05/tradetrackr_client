"use server";

import { authRequest } from "@/app/utils/authRequest";
import { Client } from "@/app/clients/types/client";
import { revalidatePath } from "next/cache";

export async function getClients(): Promise<Client[]> {
  return await authRequest("Clients");
}

export async function createClient(client: Omit<Client, "id">): Promise<void> {
  await authRequest("Clients", {
    method: "POST",
    body: JSON.stringify(client),
  });
  revalidatePath("/clients");
}

export async function updateClient(id: string, client: Omit<Client, "id">): Promise<void> {
  await authRequest(`Clients/${id}`, {
    method: "PUT",
    body: JSON.stringify(client),
  });
  revalidatePath("/clients");
}

export async function deleteClient(id: string): Promise<void> {
  await authRequest(`Clients/${id}`, {
    method: "DELETE",
  });
  revalidatePath("/clients");
}
