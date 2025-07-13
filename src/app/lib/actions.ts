"use server";

import { authRequest } from "@/app/utils/authRequest";
import { Client } from "@/app/clients/types/client";
import { revalidatePath } from "next/cache";
import { Job } from "@/app/jobs/types/job";

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

export async function getJobs(): Promise<Job[]> {
  return await authRequest("Jobs");
}

// Add JobDto type for API payloads
export type JobDto = Omit<Job, "id"> & { completedAt: string | null };

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
