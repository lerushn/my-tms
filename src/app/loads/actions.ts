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
      truckNumber: String(formData.get("truckNumber") ?? "") || null,
      status: carrierId ? "DISPATCHED" : "BOOKED",
      pickupAddress: String(formData.get("pickupAddress") ?? ""),
      shipperName: String(formData.get("shipperName") ?? "") || null,
      deliveryAddress: String(formData.get("deliveryAddress") ?? ""),
      receiverName: String(formData.get("receiverName") ?? "") || null,
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
  const truckNumber = String(formData.get("truckNumber") ?? "") || null;

  await prisma.load.update({
    where: { id: loadId },
    data: { carrierId, truckNumber, status: "DISPATCHED" },
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

export async function revertLoadStatus(loadId: string) {
  const load = await prisma.load.findUniqueOrThrow({ where: { id: loadId } });
  const currentIndex = STATUS_ORDER.indexOf(load.status);
  const prev = STATUS_ORDER[currentIndex - 1];
  if (currentIndex <= 0 || !prev) return;

  await prisma.load.update({
    where: { id: loadId },
    // Un-dispatching (back to BOOKED) also clears the carrier, since
    // "Available" means no carrier assigned yet.
    data: { status: prev, carrierId: prev === "BOOKED" ? null : undefined },
  });

  revalidatePath("/loads");
}
