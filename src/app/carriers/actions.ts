"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCarrier(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    throw new Error("Carrier name is required");
  }

  await prisma.carrier.create({
    data: {
      name,
      mcNumber: String(formData.get("mcNumber") ?? "") || null,
      dotNumber: String(formData.get("dotNumber") ?? "") || null,
      contact: String(formData.get("contact") ?? "") || null,
      phone: String(formData.get("phone") ?? "") || null,
      email: String(formData.get("email") ?? "") || null,
    },
  });

  revalidatePath("/carriers");
}
