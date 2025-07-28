"use server";
import { cookies } from "next/headers";

const API_URL = process.env.API_BASE_URL;

export async function authRequest(endpoint: string, options: RequestInit = {}) {
  try {
    const accessToken = cookies().get("access_token")?.value;

    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      ...options,
    });

    if (!res.ok) {
      let message = `Request failed: ${res.status}`;
      try {
        const data = await res.json();
        message = data.message || message;
      } catch {}
      throw new Error(message);
    }
    // Fix: Only parse JSON if there is content
    const contentLength = res.headers.get("content-length");
    if (res.status === 204 || contentLength === "0") {
      return null;
    }
    const text = await res.text();
    if (!text) {
      return null;
    }
    return JSON.parse(text);
  } catch (error: Error | unknown) {
    // console.error("Error in authRequest:", error);
    throw new Error(
      (error as Error).message ||
        "An error occurred while making the API request."
    );
  }
}
