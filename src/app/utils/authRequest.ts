"use server";
import { cookies } from "next/headers";

// const API_URL = process.env.API_BASE_URL || "https://localhost:44395/api";
const API_URL = "http://localhost:5267/api/";

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
    return res.json();
  } catch (error: any) {
    console.error("Error in authRequest:", error);
    throw new Error(
      error.message || "An error occurred while making the request."
    );
  }
}
