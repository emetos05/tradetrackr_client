import { render, screen, fireEvent } from "@testing-library/react";
import { JobsListClient } from "../jobs-list-client";
import { Job, JobStatus } from "../../types/job";
import { Client } from "@/app/clients/types/client";

// Mock job data
const mockJobs: Job[] = [
  {
    id: "1",
    title: "Test Job 1",
    description: "Test Description 1",
    status: JobStatus.NotStarted,
    clientId: "1",
    createdAt: new Date().toISOString(),
    completedAt: null,
    hourlyRate: 50,
    hoursWorked: 0,
    materialCost: 100,
  },
  {
    id: "2",
    title: "Test Job 2",
    description: "Test Description 2",
    status: JobStatus.InProgress,
    clientId: "2",
    createdAt: new Date().toISOString(),
    completedAt: null,
    hourlyRate: 75,
    hoursWorked: 4,
    materialCost: 200,
  },
];

// Mock client data
const mockClients: Client[] = [
  {
    id: "1",
    name: "Client 1",
    email: "client1@example.com",
    phone: "1234567890",
    address: "123 Test St",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Client 2",
    email: "client2@example.com",
    phone: "0987654321",
    address: "456 Test Ave",
    createdAt: new Date().toISOString(),
  },
];

// Mock the actions
jest.mock("@/app/lib/actions", () => ({
  getJobs: jest.fn(),
  createJob: jest.fn(),
  updateJob: jest.fn(),
  deleteJob: jest.fn(),
}));

describe("JobsListClient", () => {
  it("renders jobs list correctly", () => {
    const { container } = render(
      <JobsListClient initialJobs={mockJobs} clients={mockClients} />
    );

    // Check if job titles are rendered
    mockJobs.forEach((job) => {
      expect(screen.getByText(job.title)).toBeInTheDocument();
    });

    // Check if status text is rendered in the correct format
    expect(screen.getByText(/Status:\s+Not Started/)).toBeInTheDocument();
    expect(screen.getByText(/Status:\s+In Progress/)).toBeInTheDocument();
  });

  it("displays client names", () => {
    render(<JobsListClient initialJobs={mockJobs} clients={mockClients} />);

    // Check if client names are displayed
    mockClients.forEach((client) => {
      const jobsForClient = mockJobs.filter(
        (job) => job.clientId === client.id
      );
      if (jobsForClient.length > 0) {
        expect(
          screen.getByText(new RegExp(`Client:\\s+${client.name}`))
        ).toBeInTheDocument();
      }
    });
  });

  it("opens create job form when create button is clicked", async () => {
    render(<JobsListClient initialJobs={mockJobs} clients={mockClients} />);

    const createButton = screen.getByRole("button", { name: /add job/i });
    fireEvent.click(createButton);

    // Check if form dialog is opened
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });
});
