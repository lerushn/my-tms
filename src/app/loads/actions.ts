"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type {
  Equipment,
  LoadStatus,
  ModeType,
} from "@/generated/prisma/client";

export async function createLoad(formData: FormData) {
  const customerId = String(formData.get("customerId") ?? "");
  if (!customerId) {
    throw new Error("Customer is required");
  }

  const carrierId = String(formData.get("carrierId") ?? "") || null;

  const loadCount = await prisma.load.count();
  const loadNumber = `L-${String(loadCount + 1).padStart(4, "0")}`;

  await prisma.load.create({
    data: {
      loadNumber,
      referenceNumber: String(formData.get("referenceNumber") ?? "") || null,
      customerId,
      carrierId,
      status: carrierId ? "DISPATCHED" : "BOOKED",
      pickupAddress: String(formData.get("pickupAddress") ?? ""),
      deliveryAddress: String(formData.get("deliveryAddress") ?? ""),
      pickupScheduledAt: new Date(String(formData.get("pickupScheduledAt"))),
      deliveryScheduledAt: new Date(
        String(formData.get("deliveryScheduledAt")),
      ),
      pieces: formData.get("pieces") ? Number(formData.get("pieces")) : null,
      weight: formData.get("weight")
        ? Number(formData.get("weight"))
        : null,
      commodity: String(formData.get("commodity") ?? "") || null,
      equipment: String(formData.get("equipment")) as Equipment,
      modeType: String(formData.get("modeType")) as ModeType,
      customerRate: Number(formData.get("customerRate") ?? 0),
      carrierRate: formData.get("carrierRate")
        ? Number(formData.get("carrierRate"))
        : null,
      notes: String(formData.get("notes") ?? "") || null,
    },
  });

  revalidatePath("/loads");
}

export async function dispatchLoad(loadId: string, formData: FormData) {
  const carrierId = String(formData.get("carrierId") ?? "");
  if (!carrierId) {
    throw new Error("Carrier is required to dispatch a load");
  }

  await prisma.load.update({
    where: { id: loadId },
    data: { carrierId, status: "DISPATCHED" },
  });

  revalidatePath("/loads");
}

const STATUS_ORDER: LoadStatus[] = [
  "BOOKED",
  "DISPATCHED",
  "ON_ROUTE_TO_PICKUP",
  "AT_PICKUP",
  "IN_TRANSIT",
  "AT_DELIVERY",
  "DELIVERED",
  "INVOICED",
];

// Every step here is a manual click today. ON_ROUTE_TO_PICKUP is the one
// that's meant to eventually flip automatically once we're tracking carrier
// GPS location (~5mi from the dispatch point), but until that's built it's
// just another manual advance like the rest.
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
