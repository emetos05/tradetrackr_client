// JobStatus enum matches API (0-4)
export enum JobStatus {
  NotStarted = 0,
  InProgress = 1,
  Completed = 2,
  OnHold = 3,
  Cancelled = 4,
}

// Job interface for frontend, matching API JobDto
export interface Job {
  id?: string;
  clientId: string;
  title: string;
  description: string;
  status: JobStatus;
  createdAt: string;
  completedAt: string | null;
  hourlyRate: number;
  hoursWorked: number;
  materialCost: number;
} 