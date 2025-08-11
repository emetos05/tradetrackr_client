"use server";

import { authRequest } from "@/app/helpers/authRequest";
import { Client } from "@/app/clients/types/client";
import { revalidatePath } from "next/cache";
import { Job } from "@/app/jobs/types/job";
import { Invoice } from "@/app/invoices/types/invoice";
import {
  SearchResult,
  SearchType,
  GlobalSearchRequest,
  GlobalSearchResponse,
  SearchEntity,
} from "@/app/types/search";

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

export async function updateInvoiceStatus(
  id: string,
  status: number
): Promise<void> {
  await authRequest(`Invoices/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
}

export async function recordInvoicePayment(
  id: string,
  payment: { paymentDate: string; amount: number }
): Promise<void> {
  await authRequest(`Invoices/${id}/payment`, {
    method: "POST",
    body: JSON.stringify(payment),
  });
  // Revalidate all pages that might show invoice data
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  revalidatePath(`/invoices/${id}`);
}

// Global search functionality using API endpoint
export async function globalSearch(
  query: string,
  types?: SearchType[],
  limit = 20
): Promise<SearchResult[]> {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    // Convert SearchType to SearchEntity enum values
    const entityTypes = types?.map((type) => {
      switch (type) {
        case "client":
          return SearchEntity.Clients;
        case "job":
          return SearchEntity.Jobs;
        case "invoice":
          return SearchEntity.Invoices;
        default:
          return SearchEntity.Clients;
      }
    });

    const searchRequest: GlobalSearchRequest = {
      query: query.trim(),
      entityTypes,
      maxResults: limit,
    };

    const response: GlobalSearchResponse = await authRequest("Search", {
      method: "POST",
      body: JSON.stringify(searchRequest),
    });

    const results: SearchResult[] = [];

    // Transform clients
    if (response.results.clients) {
      response.results.clients.forEach((item) => {
        results.push({
          type: "client",
          id: item.item.id,
          name: item.item.name,
          href: `/clients/${item.item.id}`,
          description: item.item.email || undefined,
          highlight: item.highlight,
        });
      });
    }

    // Transform jobs
    if (response.results.jobs) {
      response.results.jobs.forEach((item) => {
        const description = item.item.description;
        results.push({
          type: "job",
          id: item.item.id,
          name: item.item.title,
          href: `/jobs/${item.item.id}`,
          description: description
            ? description.length > 50
              ? description.substring(0, 50) + "..."
              : description
            : undefined,
          highlight: item.highlight,
        });
      });
    }

    // Transform invoices
    if (response.results.invoices) {
      response.results.invoices.forEach((item) => {
        results.push({
          type: "invoice",
          id: item.item.id,
          name: `Invoice #${item.item.id.substring(0, 8)}`,
          href: `/invoices/${item.item.id}`,
          description: `$${item.item.totalAmount.toFixed(2)}`,
          highlight: item.highlight,
        });
      });
    }

    return results;
  } catch (error) {
    console.error("Global search API error:", error);
    console.error("Search query:", query);
    console.error("Search types:", types);

    // Check if this is a 401 authentication error
    if (error instanceof Error && error.message.includes("401")) {
      console.warn("Search API returned 401 - possible authentication issue");
    }

    // Return client-side fallback search results
    console.warn("Falling back to client-side search");
    return fallbackClientSearch(query);
  }
}

// Fallback client-side search for offline or API failure scenarios (kept for future use)
async function fallbackClientSearch(query: string): Promise<SearchResult[]> {
  console.warn("Using fallback client-side search");

  try {
    // Fetch all data concurrently
    const [clients, jobs, invoices] = await Promise.all([
      getClients(),
      getJobs(),
      getInvoices(),
    ]);

    const results: SearchResult[] = [];
    const searchTerm = query.toLowerCase();

    // Search clients
    clients.forEach((client) => {
      const searchableFields = [
        client.name,
        client.email,
        client.phone,
        client.address,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (searchableFields.includes(searchTerm)) {
        results.push({
          type: "client",
          id: client.id!,
          name: client.name,
          href: `/clients/${client.id}`,
          description: client.email,
        });
      }
    });

    // Search jobs
    jobs.forEach((job) => {
      const searchableFields = [job.title, job.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (searchableFields.includes(searchTerm)) {
        // Find the client name for this job
        const client = clients.find((c) => c.id === job.clientId);
        const clientName = client ? ` (${client.name})` : "";

        results.push({
          type: "job",
          id: job.id!,
          name: job.title + clientName,
          href: `/jobs/${job.id}`,
          description: job.description?.substring(0, 50) + "...",
        });
      }
    });

    // Search invoices
    invoices.forEach((invoice) => {
      // Find the client name for this invoice
      const client = clients.find((c) => c.id === invoice.clientId);
      const clientName = client ? client.name : "Unknown Client";
      const invoiceName = `Invoice #${invoice.id?.substring(
        0,
        8
      )} - ${clientName}`;

      const searchableFields = [
        invoiceName,
        clientName,
        invoice.amount?.toString(),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (searchableFields.includes(searchTerm)) {
        results.push({
          type: "invoice",
          id: invoice.id!,
          name: invoiceName,
          href: `/invoices/${invoice.id}`,
          description: `$${invoice.amount?.toFixed(2) || "0.00"}`,
        });
      }
    });

    // Sort results by relevance (exact matches first, then partial matches)
    return results
      .sort((a, b) => {
        const aExact = a.name.toLowerCase().includes(searchTerm);
        const bExact = b.name.toLowerCase().includes(searchTerm);

        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 20); // Limit to 20 results
  } catch (error) {
    console.error("Fallback search error:", error);
    return [];
  }
}
