import { prisma } from "@/lib/prisma";
import {
  createLoad,
  advanceLoadStatus,
  revertLoadStatus,
  dispatchLoad,
} from "./actions";
import type { Equipment, LoadStatus, ModeType } from "@/generated/prisma/client";
import {
  cardClass,
  inputClass,
  primaryButtonClass,
  tableWrapClass,
  theadClass,
  trClass,
} from "@/lib/ui";

const STATUS_STYLES: Record<LoadStatus, string> = {
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

const NEXT_STATUS_LABEL: Partial<Record<LoadStatus, string>> = {
  DISPATCHED: "Mark on route to pickup",
  ON_ROUTE_TO_PICKUP: "Mark at pickup",
  AT_PICKUP: "Mark in transit",
  IN_TRANSIT: "Mark at delivery",
  AT_DELIVERY: "Mark completed",
  DELIVERED: "Mark invoiced",
};

const PREV_STATUS_LABEL: Partial<Record<LoadStatus, string>> = {
  DISPATCHED: "Back to booked",
  ON_ROUTE_TO_PICKUP: "Back to dispatched",
  AT_PICKUP: "Back to on route to pickup",
  IN_TRANSIT: "Back to at pickup",
  AT_DELIVERY: "Back to in transit",
  DELIVERED: "Back to at delivery",
  INVOICED: "Back to delivered",
};

const EQUIPMENT_OPTIONS: { value: Equipment; label: string }[] = [
  { value: "SPRINTER", label: "Sprinter" },
  { value: "SMALL_STRAIGHT", label: "Small Straight" },
  { value: "LARGE_STRAIGHT", label: "Large Straight" },
  { value: "DRY_VAN", label: "Dry Van" },
  { value: "FLATBED", label: "Flatbed" },
];
const EQUIPMENT_LABELS = Object.fromEntries(
  EQUIPMENT_OPTIONS.map((o) => [o.value, o.label]),
) as Record<Equipment, string>;

const MODE_OPTIONS: { value: ModeType; label: string }[] = [
  { value: "GROUND", label: "Ground" },
  { value: "OCEAN", label: "Ocean" },
  { value: "CROSS_BORDER", label: "Cross Border" },
  { value: "AIR", label: "Air" },
];
const MODE_LABELS = Object.fromEntries(
  MODE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<ModeType, string>;

function formatDateTime(d: Date) {
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

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
          Loads · {TAB_TITLES[tab]}
        </h1>
        <p className="text-zinc-400">{TAB_DESCRIPTIONS[tab]}</p>
      </div>

      {tab === "available" &&
        (customers.length === 0 ? (
          <p className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-amber-300">
            Add a customer first before creating a load.
          </p>
        ) : (
          <form
            action={createLoad}
            className={`grid max-w-2xl grid-cols-2 gap-3 ${cardClass}`}
          >
            <input
              name="referenceNumber"
              placeholder="Reference # (customer's PO/ref #, optional)"
              className={`col-span-2 ${inputClass}`}
            />

            <select
              name="customerId"
              required
              className={`col-span-2 ${inputClass}`}
            >
              <option value="">Customer*</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select name="carrierId" className={`col-span-2 ${inputClass}`}>
              <option value="">Carrier (assign now or later)</option>
              {carriers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <input
              name="pickupAddress"
              placeholder="Pickup address*"
              required
              className={`col-span-2 ${inputClass}`}
            />
            <input
              name="deliveryAddress"
              placeholder="Delivery address*"
              required
              className={`col-span-2 ${inputClass}`}
            />

            <label className="flex flex-col gap-1 text-sm text-zinc-400">
              Pickup scheduled time*
              <input
                name="pickupScheduledAt"
                type="datetime-local"
                required
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-zinc-400">
              Delivery scheduled time*
              <input
                name="deliveryScheduledAt"
                type="datetime-local"
                required
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-zinc-400">
              Equipment*
              <select
                name="equipment"
                required
                defaultValue=""
                className={inputClass}
              >
                <option value="" disabled>
                  Select equipment
                </option>
                {EQUIPMENT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm text-zinc-400">
              Mode*
              <select
                name="modeType"
                required
                defaultValue=""
                className={inputClass}
              >
                <option value="" disabled>
                  Select mode
                </option>
                {MODE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <input
              name="pieces"
              type="number"
              placeholder="Pieces"
              className={inputClass}
            />
            <input
              name="weight"
              type="number"
              placeholder="Weight (lbs)"
              className={inputClass}
            />
            <input
              name="commodity"
              placeholder="Commodity"
              className={`col-span-2 ${inputClass}`}
            />

            <label className="flex flex-col gap-1 text-sm text-zinc-400">
              Customer rate ($)*
              <input
                name="customerRate"
                type="number"
                step="0.01"
                required
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-zinc-400">
              Carrier rate ($)
              <input
                name="carrierRate"
                type="number"
                step="0.01"
                className={inputClass}
              />
            </label>

            <textarea
              name="notes"
              placeholder="Notes"
              className={`col-span-2 ${inputClass}`}
            />

            <button type="submit" className={`col-span-2 ${primaryButtonClass}`}>
              Create load
            </button>
          </form>
        ))}

      {tab === "available" && loads.length > 0 && carriers.length === 0 && (
        <p className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-amber-300">
          Add a carrier before you can dispatch these loads.
        </p>
      )}

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
    </div>
  );
}
