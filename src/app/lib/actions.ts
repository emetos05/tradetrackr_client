"use server";

import { authRequest } from "@/app/utils/authRequest";
import { Client } from "@/app/clients/types/client";
import { revalidatePath } from "next/cache";

export async function getClients(): Promise<Client[]> {
  return await authRequest("clients");
}
