// Search types matching the API GlobalSearchRequest/Response structure
export interface GlobalSearchRequest {
  query: string;
  entityTypes?: SearchEntity[];
  maxResults?: number;
}

export interface GlobalSearchResponse {
  query: string;
  totalResults: number;
  results: SearchResults;
}

export interface SearchResults {
  clients?: ClientSearchResultItem[];
  jobs?: JobSearchResultItem[];
  invoices?: InvoiceSearchResultItem[];
}

export interface SearchResultItem<T = unknown> {
  item: T;
  entityType: SearchEntity;
  matchedFields?: string[];
  highlight?: string;
}

export interface ClientSearchResultItem extends SearchResultItem {
  item: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    createdAt: string;
  };
}

export interface JobSearchResultItem extends SearchResultItem {
  item: {
    id: string;
    clientId: string;
    title: string;
    description?: string;
    status: number;
    createdAt: string;
    completedAt?: string;
    hourlyRate: number;
    hoursWorked: number;
    materialCost: number;
  };
}

export interface InvoiceSearchResultItem extends SearchResultItem {
  item: {
    id: string;
    jobId: string;
    clientId: string;
    issueDate: string;
    dueDate: string;
    amount: number;
    taxAmount: number;
    taxRate: number;
    paymentDate?: string;
    notes?: string;
    terms?: string;
    status: number;
    totalAmount: number;
    isOverdue: boolean;
    isPaid: boolean;
    daysUntilDue: number;
  };
}

export enum SearchEntity {
  Clients = 0,
  Jobs = 1,
  Invoices = 2,
}

// Legacy types for compatibility
export interface SearchResult {
  type: "client" | "job" | "invoice";
  id: string;
  name: string;
  href: string;
  description?: string;
  highlight?: string;
  score?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  query: string;
  executionTime: number;
}

export interface SearchRequest {
  query: string;
  types?: SearchType[];
  limit?: number;
}

export type SearchType = "client" | "job" | "invoice";

// Client-side search cache entry
export interface SearchCacheEntry {
  results: SearchResult[];
  timestamp: number;
  query: string;
}
