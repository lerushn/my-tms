"use client";

import { useState } from "react";
import { advanceLoadStatus, revertLoadStatus } from "./actions";
import { inputClass } from "@/lib/ui";
import { EQUIPMENT_LABELS, MODE_LABELS } from "@/lib/loadOptions";
import {
  STATUS_STYLES,
  NEXT_STATUS_LABEL,
  PREV_STATUS_LABEL,
  HEADING_TO_PICKUP_STATUSES,
  formatDateTime,
} from "@/lib/loadStatus";
import type {
  Equipment,
  LoadStatus,
  ModeType,
} from "@/generated/prisma/client";

type LoadRow = {
  id: string;
  loadNumber: string;
  referenceNumber: string | null;
  status: LoadStatus;
  pickupAddress: string;
  shipperName: string | null;
  deliveryAddress: string;
  receiverName: string | null;
  pickupScheduledAt: Date;
  deliveryScheduledAt: Date;
  equipment: Equipment;
  modeType: ModeType;
  truckNumber: string | null;
  customer: { name: string };
  carrier: { name: string } | null;
};

export function InTransitBoard({ loads }: { loads: LoadRow[] }) {
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [refFilter, setRefFilter] = useState("");
  const [loadNumFilter, setLoadNumFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");

  const filtered = loads.filter((load) => {
    if (
      refFilter &&
      !(load.referenceNumber ?? "")
        .toLowerCase()
        .includes(refFilter.toLowerCase())
    )
      return false;
    if (
      loadNumFilter &&
      !load.loadNumber.toLowerCase().includes(loadNumFilter.toLowerCase())
    )
      return false;
    if (
      customerFilter &&
      !load.customer.name.toLowerCase().includes(customerFilter.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="glass rounded-2xl">
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="flex w-full items-center justify-between px-5 py-3 text-sm font-medium text-white"
        >
          Filters
          <span className="text-zinc-400">{filtersOpen ? "−" : "+"}</span>
        </button>
        {filtersOpen && (
          <div className="grid grid-cols-1 gap-3 border-t border-white/10 px-5 py-4 sm:grid-cols-3">
            <input
              placeholder="Reference #"
              value={refFilter}
              onChange={(e) => setRefFilter(e.target.value)}
              className={inputClass}
            />
            <input
              placeholder="Load #"
              value={loadNumFilter}
              onChange={(e) => setLoadNumFilter(e.target.value)}
              className={inputClass}
            />
            <input
              placeholder="Customer name"
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className={inputClass}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map((load) => {
          const nextLabel = NEXT_STATUS_LABEL[load.status];
          const prevLabel = PREV_STATUS_LABEL[load.status];
          const headingToPickup = HEADING_TO_PICKUP_STATUSES.includes(
            load.status,
          );
          const nextStopLabel = headingToPickup ? "Next: Pickup" : "Next: Delivery";
          const nextStopTime = headingToPickup
            ? load.pickupScheduledAt
            : load.deliveryScheduledAt;

          return (
            <div
              key={load.id}
              className="glass grid grid-cols-[1.3fr_1.3fr_1fr_1.5fr_1fr_1.1fr_1fr] gap-4 rounded-2xl px-5 py-4 text-sm"
            >
              {/* Customer info */}
              <div className="flex flex-col justify-center">
                <div className="font-medium text-white">
                  {load.customer.name}
                </div>
                <div className="text-xs text-zinc-500">
                  Ref: {load.referenceNumber ?? "—"}
                </div>
              </div>

              {/* Carrier info */}
              <div className="flex flex-col justify-center">
                <div className="font-medium text-white">
                  {load.carrier?.name ?? "Unassigned"}
                </div>
                <div className="text-xs text-zinc-500">
                  Truck: {load.truckNumber ?? "—"}
                </div>
                <div className="text-xs text-zinc-500">
                  Load #: {load.loadNumber}
                </div>
              </div>

              {/* Status + actions */}
              <div className="flex flex-col items-start justify-center gap-1.5">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${STATUS_STYLES[load.status]}`}
                >
                  {load.status.replaceAll("_", " ")}
                </span>
                {nextLabel && (
                  <form action={advanceLoadStatus.bind(null, load.id)}>
                    <button
                      type="submit"
                      className="whitespace-nowrap text-xs text-indigo-300 hover:text-indigo-200"
                    >
                      {nextLabel}
                    </button>
                  </form>
                )}
                {prevLabel && (
                  <form action={revertLoadStatus.bind(null, load.id)}>
                    <button
                      type="submit"
                      className="whitespace-nowrap text-xs text-zinc-500 hover:text-zinc-300"
                    >
                      ← {prevLabel}
                    </button>
                  </form>
                )}
              </div>

              {/* Shipper / Receiver */}
              <div className="flex flex-col justify-center gap-2">
                <div>
                  <div className="text-white">
                    {load.shipperName || load.pickupAddress}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {formatDateTime(load.pickupScheduledAt)}
                  </div>
                </div>
                <div>
                  <div className="text-white">
                    {load.receiverName || load.deliveryAddress}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {formatDateTime(load.deliveryScheduledAt)}
                  </div>
                </div>
              </div>

              {/* Current location + speed */}
              <div className="flex flex-col justify-center text-zinc-500">
                <div>—</div>
                <div className="text-xs">Tracking coming soon</div>
              </div>

              {/* Next stop time / ETA */}
              <div className="flex flex-col justify-center">
                <div className="text-white">
                  {nextStopLabel}: {formatDateTime(nextStopTime)}
                </div>
                <div className="text-xs text-zinc-500">ETA: —</div>
              </div>

              {/* Miles left / equipment / mode */}
              <div className="flex flex-col justify-center text-zinc-300">
                <div className="text-xs text-zinc-500">— mi left</div>
                <div>{EQUIPMENT_LABELS[load.equipment]}</div>
                <div className="text-xs text-zinc-500">
                  {MODE_LABELS[load.modeType]}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="glass rounded-2xl px-5 py-10 text-center text-zinc-500">
            No loads in this view.
          </div>
        )}
      </div>
    </div>
  );
}
