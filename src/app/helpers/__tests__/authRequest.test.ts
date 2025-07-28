import { authRequest } from "../authRequest";
import { cookies } from "next/headers";

// Mock next/headers
jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

describe("authRequest", () => {
  const mockCookies = {
    get: jest.fn(),
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    global.fetch = jest.fn();
    (cookies as jest.Mock).mockReturnValue(mockCookies);
  });

  it("sends request with auth token", async () => {
    const mockToken = "mock-token";
    mockCookies.get.mockReturnValue({ value: mockToken });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ data: "test" })),
      status: 200,
      headers: new Headers({ "content-length": "123" }),
    } as Response);

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:5267/api/test-endpoint",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${mockToken}`,
          "Content-Type": "application/json",
        }),
      })
    );
  });

  it("returns null for 204 response", async () => {
    mockCookies.get.mockReturnValue({ value: "mock-token" });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 204,
      text: () => Promise.resolve(""),
      headers: new Headers({ "content-length": "0" }),
    } as Response);

    const result = await authRequest("test-endpoint");
    expect(result).toBeNull();
  });

  it("throws error for non-ok response", async () => {
    mockCookies.get.mockReturnValue({ value: "mock-token" });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: () => Promise.resolve(JSON.stringify({ message: "Bad Request" })),
      json: () => Promise.resolve({ message: "Bad Request" }),
      headers: new Headers({ "content-length": "123" }),
    } as unknown as Response);

    await expect(authRequest("test-endpoint")).rejects.toThrow("Bad Request");
  });

  it("includes custom options in request", async () => {
    const mockToken = "mock-token";
    mockCookies.get.mockReturnValue({ value: mockToken });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ data: "test" })),
      status: 200,
      headers: new Headers({ "content-length": "123" }),
    } as Response);

    const customOptions = {
      method: "POST",
      body: JSON.stringify({ test: "data" }),
    };

    await authRequest("test-endpoint", customOptions);

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:5267/api/test-endpoint",
      expect.objectContaining({
        ...customOptions,
        headers: expect.objectContaining({
          Authorization: `Bearer ${mockToken}`,
          "Content-Type": "application/json",
        }),
      })
    );
  });
});
