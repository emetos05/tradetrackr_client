import { render, screen } from "@testing-library/react";
import { ClientDetails } from "../client-details";
import { Client } from "../../types/client";

// Mock client data
const mockClient: Client = {
  id: "1",
  name: "Test Client",
  email: "test@example.com",
  phone: "1234567890",
  address: "123 Test St",
  createdAt: new Date().toISOString(),
};

const mockProps = {
  client: mockClient,
  isOpen: true,
  onClose: jest.fn(),
};

describe("ClientDetails", () => {
  it("renders client information correctly", () => {
    render(<ClientDetails {...mockProps} />);

    expect(screen.getByText(mockClient.name)).toBeInTheDocument();
    expect(screen.getByText(mockClient.email)).toBeInTheDocument();
    expect(screen.getByText(mockClient.phone)).toBeInTheDocument();
    expect(screen.getByText(mockClient.address)).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    render(<ClientDetails {...mockProps} />);

    const closeButton = screen.getByRole("button", { name: /close/i });
    closeButton.click();

    expect(mockProps.onClose).toHaveBeenCalled();
  });
});
