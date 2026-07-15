import { prisma } from "@/lib/prisma";
import { advanceLoadStatus, revertLoadStatus, dispatchLoad } from "./actions";
import { LoadWizardForm } from "./LoadWizardForm";
import { InTransitBoard } from "./InTransitBoard";
import type { LoadStatus } from "@/generated/prisma/client";
import { tableWrapClass, theadClass, trClass } from "@/lib/ui";
import { EQUIPMENT_LABELS, MODE_LABELS } from "@/lib/loadOptions";
import {
  STATUS_STYLES,
  NEXT_STATUS_LABEL,
  PREV_STATUS_LABEL,
  formatDateTime,
} from "@/lib/loadStatus";

type Tab = "available" | "in-transit" | "completed";

const TAB_STATUSES: Record<Tab, LoadStatus[]> = {
  available: ["BOOKED"],
  "in-transit": [
    "DISPATCHED",
    "ON_ROUTE_TO_PICKUP",
    "AT_PICKUP",
    "IN_TRANSIT",
    "AT_DELIVERY",
  ],
  completed: ["DELIVERED", "INVOICED", "CANCELLED"],
};

const TAB_TITLES: Record<Tab, string> = {
  available: "Available",
  "in-transit": "In Transit",
  completed: "Completed",
};

const TAB_DESCRIPTIONS: Record<Tab, string> = {
  available: "Loads that haven't been dispatched to a carrier yet.",
  "in-transit": "Loads dispatched to a carrier and on the move.",
  completed: "Delivered and invoiced loads.",
};

function parseTab(value: string | string[] | undefined): Tab {
  if (value === "in-transit" || value === "completed") return value;
  return "available";
}

export default async function LoadsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const { tab: tabParam } = await searchParams;
  const tab = parseTab(tabParam);

  const [loads, customers, carriers] = await Promise.all([
    prisma.load.findMany({
      where: { status: { in: TAB_STATUSES[tab] } },
      include: { customer: true, carrier: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.customer.findMany({ orderBy: { name: "asc" } }),
    prisma.carrier.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">
          {tab === "available" ? "Available Loads" : `Loads · ${TAB_TITLES[tab]}`}
        </h1>
        <p className="text-zinc-400">
          {tab === "available" ? "Create your load" : TAB_DESCRIPTIONS[tab]}
        </p>
      </div>

      {tab === "available" &&
        (customers.length === 0 ? (
          <p className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-amber-300">
            Add a customer first before creating a load.
          </p>
        ) : (
          <div className="max-w-2xl">
            <LoadWizardForm customers={customers} carriers={carriers} />
          </div>
        ))}

      {tab === "available" && loads.length > 0 && carriers.length === 0 && (
        <p className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-amber-300">
          Add a carrier before you can dispatch these loads.
        </p>
      )}

      {tab === "in-transit" && <InTransitBoard loads={loads} />}

      {tab !== "in-transit" && (
      <div className={`${tableWrapClass} overflow-x-auto`}>
        <table className="w-full text-sm">
          <thead className={theadClass}>
            <tr>
              <th className="px-4 py-2">Load #</th>
              <th className="px-4 py-2">Ref #</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Equipment</th>
              <th className="px-4 py-2">Mode</th>
              <th className="px-4 py-2">Pickup</th>
              <th className="px-4 py-2">Delivery</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Carrier</th>
              <th className="px-4 py-2">Rate</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loads.map((load) => {
              const nextLabel = NEXT_STATUS_LABEL[load.status];
              const prevLabel = PREV_STATUS_LABEL[load.status];
              return (
                <tr key={load.id} className={trClass}>
                  <td className="px-4 py-2 font-medium whitespace-nowrap text-white">
                    {load.loadNumber}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-zinc-300">
                    {load.referenceNumber ?? "—"}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${STATUS_STYLES[load.status]}`}
                    >
                      {load.status.replaceAll("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-zinc-300">
                    {EQUIPMENT_LABELS[load.equipment]}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-zinc-300">
                    {MODE_LABELS[load.modeType]}
                  </td>
                  <td className="px-4 py-2 text-zinc-300">
                    <div>{load.pickupAddress}</div>
                    <div className="text-xs text-zinc-500">
                      {formatDateTime(load.pickupScheduledAt)}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-zinc-300">
                    <div>{load.deliveryAddress}</div>
                    <div className="text-xs text-zinc-500">
                      {formatDateTime(load.deliveryScheduledAt)}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-zinc-300">
                    {load.customer.name}
                  </td>
                  <td className="px-4 py-2 text-zinc-300">
                    {load.carrier?.name ?? "—"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-zinc-300">
                    ${load.customerRate.toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    {tab === "available" && carriers.length > 0 && (
                      <form
                        action={dispatchLoad.bind(null, load.id)}
                        className="flex items-center gap-1"
                      >
                        <select
                          name="carrierId"
                          required
                          defaultValue=""
                          className="glass-input rounded-md px-1 py-1 text-xs"
                        >
                          <option value="" disabled>
                            Assign carrier
                          </option>
                          {carriers.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                        <input
                          name="truckNumber"
                          placeholder="Truck #"
                          className="glass-input w-20 rounded-md px-1 py-1 text-xs"
                        />
                        <button
                          type="submit"
                          className="whitespace-nowrap text-xs text-indigo-300 hover:text-indigo-200"
                        >
                          Dispatch
                        </button>
                      </form>
                    )}
                    {tab !== "available" && (
                      <div className="flex flex-col items-start gap-1">
                        {nextLabel && (
                          <form
                            action={advanceLoadStatus.bind(null, load.id)}
                          >
                            <button
                              type="submit"
                              className="whitespace-nowrap text-xs text-indigo-300 hover:text-indigo-200"
                            >
                              {nextLabel}
                            </button>
                          </form>
                        )}
                        {prevLabel && (
                          <form
                            action={revertLoadStatus.bind(null, load.id)}
                          >
                            <button
                              type="submit"
                              className="whitespace-nowrap text-xs text-zinc-500 hover:text-zinc-300"
                            >
                              ← {prevLabel}
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {loads.length === 0 && (
              <tr>
                <td
                  colSpan={11}
                  className="px-4 py-6 text-center text-zinc-500"
                >
                  No loads in this view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
