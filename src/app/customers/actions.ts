"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCustomer(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    throw new Error("Customer name is required");
  }

  await prisma.customer.create({
    data: {
      name,
      contact: String(formData.get("contact") ?? "") || null,
      phone: String(formData.get("phone") ?? "") || null,
      email: String(formData.get("email") ?? "") || null,
    },
  });

  // Tells Next.js the /customers page's cached data is stale, so it
  // re-fetches the list and shows the new customer without a manual refresh.
  revalidatePath("/customers");
}
