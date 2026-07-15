import type { LoadStatus } from "@/generated/prisma/client";

export const STATUS_STYLES: Record<LoadStatus, string> = {
  BOOKED: "bg-zinc-500/15 text-zinc-300",
  DISPATCHED: "bg-blue-500/15 text-blue-300",
  ON_ROUTE_TO_PICKUP: "bg-sky-500/15 text-sky-300",
  AT_PICKUP: "bg-indigo-500/15 text-indigo-300",
  IN_TRANSIT: "bg-amber-500/15 text-amber-300",
  AT_DELIVERY: "bg-orange-500/15 text-orange-300",
  DELIVERED: "bg-green-500/15 text-green-300",
  INVOICED: "bg-purple-500/15 text-purple-300",
  CANCELLED: "bg-red-500/15 text-red-300",
};

export const NEXT_STATUS_LABEL: Partial<Record<LoadStatus, string>> = {
  DISPATCHED: "Mark on route to pickup",
  ON_ROUTE_TO_PICKUP: "Mark at pickup",
  AT_PICKUP: "Mark in transit",
  IN_TRANSIT: "Mark at delivery",
  AT_DELIVERY: "Mark completed",
  DELIVERED: "Mark invoiced",
};

export const PREV_STATUS_LABEL: Partial<Record<LoadStatus, string>> = {
  DISPATCHED: "Back to booked",
  ON_ROUTE_TO_PICKUP: "Back to dispatched",
  AT_PICKUP: "Back to on route to pickup",
  IN_TRANSIT: "Back to at pickup",
  AT_DELIVERY: "Back to in transit",
  DELIVERED: "Back to at delivery",
  INVOICED: "Back to delivered",
};

// Statuses in the in-transit pipeline where the truck is still heading to
// (or sitting at) pickup, vs. already loaded and heading to delivery.
export const HEADING_TO_PICKUP_STATUSES: LoadStatus[] = [
  "DISPATCHED",
  "ON_ROUTE_TO_PICKUP",
  "AT_PICKUP",
];

export function formatDateTime(d: Date) {
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
