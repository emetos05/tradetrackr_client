"use server";

import { authRequest } from "@/app/helpers/authRequest";
import { Client } from "@/app/clients/types/client";
import { revalidatePath } from "next/cache";
import { Job } from "@/app/jobs/types/job";
import { Invoice, InvoiceStatus } from "@/app/invoices/types/invoice";

export async function getClients(): Promise<Client[]> {
  return await authRequest("Clients");
}

export async function getClient(id: string): Promise<Client> {
  return await authRequest(`Clients/${id}`);
}

export async function createClient(client: Omit<Client, "id">): Promise<void> {
  await authRequest("Clients", {
    method: "POST",
    body: JSON.stringify(client),
  });
  revalidatePath("/clients");
}

export async function updateClient(
  id: string,
  client: Omit<Client, "id">
): Promise<void> {
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

export async function getJobs(): Promise<Job[]> {
  return await authRequest("Jobs");
}

export async function getJob(id: string): Promise<Job> {
  return await authRequest(`Jobs/${id}`);
}

// Add JobDto type for API payloads
export type JobDto = Omit<Job, "id">;

export async function createJob(job: JobDto): Promise<void> {
  await authRequest("Jobs", {
    method: "POST",
    body: JSON.stringify(job),
  });
  revalidatePath("/jobs");
}

export async function updateJob(id: string, job: JobDto): Promise<void> {
  await authRequest(`Jobs/${id}`, {
    method: "PUT",
    body: JSON.stringify(job),
  });
  revalidatePath("/jobs");
}

export async function deleteJob(id: string): Promise<void> {
  await authRequest(`Jobs/${id}`, {
    method: "DELETE",
  });
  revalidatePath("/jobs");
}

export async function getInvoices(): Promise<Invoice[]> {
  return await authRequest("Invoices");
}

export async function getInvoice(id: string): Promise<Invoice> {
  return await authRequest(`Invoices/${id}`);
}

export async function createInvoice(
  invoice: Omit<Invoice, "id">
): Promise<void> {
  await authRequest("Invoices", {
    method: "POST",
    body: JSON.stringify(invoice),
  });
  revalidatePath("/invoices");
}

export async function updateInvoice(
  id: string,
  invoice: Omit<Invoice, "id">
): Promise<void> {
  await authRequest(`Invoices/${id}`, {
    method: "PUT",
    body: JSON.stringify(invoice),
  });
  revalidatePath("/invoices");
}

export async function deleteInvoice(id: string): Promise<void> {
  await authRequest(`Invoices/${id}`, {
    method: "DELETE",
  });
  revalidatePath("/invoices");
}
