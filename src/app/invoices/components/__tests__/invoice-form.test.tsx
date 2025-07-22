import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { InvoiceForm } from "../invoice-form";
import { Invoice, InvoiceStatus } from "../../types/invoice";
import userEvent from "@testing-library/user-event";

const mockOnSubmit = jest.fn();
const mockOnCancel = jest.fn();

const mockInvoice: Partial<Invoice> = {
  clientId: "1",
  jobId: "1",
  amount: 500,
  status: InvoiceStatus.Draft,
  issueDate: new Date().toISOString(),
  dueDate: new Date(Date.now() + 86400000).toISOString(),
};

const mockClients = [
  {
    id: "1",
    name: "Test Client",
    email: "test@example.com",
    phone: "1234567890",
    address: "123 Test St",
    createdAt: new Date().toISOString(),
  },
];

const mockJobs = [
  {
    id: "1",
    clientId: "1",
    title: "Test Job",
    description: "Test Description",
    status: 0,
    createdAt: new Date().toISOString(),
    completedAt: null,
    hourlyRate: 50,
    hoursWorked: 10,
    materialCost: 100,
  },
];

jest.mock("@/app/lib/actions", () => ({
  createInvoice: jest.fn(),
  updateInvoice: jest.fn(),
}));

describe("InvoiceForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders form fields correctly", () => {
    render(
      <InvoiceForm
        clients={mockClients}
        jobs={mockJobs}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Check if form fields are rendered
    expect(screen.getByLabelText(/client/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
  });

  it("populates form fields when editing an existing invoice", () => {
    render(
      <InvoiceForm
        initialInvoice={mockInvoice}
        clients={mockClients}
        jobs={mockJobs}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(
      screen.getByDisplayValue(mockInvoice.amount!.toString())
    ).toBeInTheDocument();
  });

  it("validates required fields", async () => {
    render(
      <InvoiceForm
        clients={mockClients}
        jobs={mockJobs}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByRole("button", { name: /save/i });

    await userEvent.click(submitButton);

    // First check for invalid fields using HTML5 validation attributes
    const clientSelect = screen.getByRole("combobox", { name: /client/i });
    const issueDateInput = screen.getByLabelText(/issue date/i);
    const dueDateInput = screen.getByLabelText(/due date/i);
    const amountInput = screen.getByLabelText(/amount/i);

    expect(clientSelect).toBeInvalid();
    expect(issueDateInput).toBeInvalid();
    expect(dueDateInput).toBeInvalid();
    expect(amountInput).toBeInvalid();
  });

  it("calls onCancel when cancel button is clicked", () => {
    render(
      <InvoiceForm
        clients={mockClients}
        jobs={mockJobs}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });
});
