"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { LoadStatus } from "@/generated/prisma/client";

export async function createLoad(formData: FormData) {
  const customerId = String(formData.get("customerId") ?? "");
  if (!customerId) {
    throw new Error("Customer is required");
  }

  const carrierId = String(formData.get("carrierId") ?? "") || null;

  const loadCount = await prisma.load.count();
  const referenceNumber = `L-${String(loadCount + 1).padStart(4, "0")}`;

  await prisma.load.create({
    data: {
      referenceNumber,
      customerId,
      carrierId,
      status: carrierId ? "DISPATCHED" : "BOOKED",
      originCity: String(formData.get("originCity") ?? ""),
      originState: String(formData.get("originState") ?? ""),
      destCity: String(formData.get("destCity") ?? ""),
      destState: String(formData.get("destState") ?? ""),
      pickupDate: new Date(String(formData.get("pickupDate"))),
      deliveryDate: new Date(String(formData.get("deliveryDate"))),
      commodity: String(formData.get("commodity") ?? "") || null,
      weight: formData.get("weight")
        ? Number(formData.get("weight"))
        : null,
      customerRate: Number(formData.get("customerRate") ?? 0),
      carrierRate: formData.get("carrierRate")
        ? Number(formData.get("carrierRate"))
        : null,
      notes: String(formData.get("notes") ?? "") || null,
    },
  });

  revalidatePath("/loads");
}

const STATUS_ORDER: LoadStatus[] = [
  "BOOKED",
  "DISPATCHED",
  "IN_TRANSIT",
  "DELIVERED",
  "INVOICED",
];

export async function advanceLoadStatus(loadId: string) {
  const load = await prisma.load.findUniqueOrThrow({ where: { id: loadId } });
  const currentIndex = STATUS_ORDER.indexOf(load.status);
  const next = STATUS_ORDER[currentIndex + 1];
  if (!next) return;

  await prisma.load.update({
    where: { id: loadId },
    data: { status: next },
  });

  revalidatePath("/loads");
}
