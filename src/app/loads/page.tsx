import { prisma } from "@/lib/prisma";
import { createLoad, advanceLoadStatus } from "./actions";
import type { Equipment, LoadStatus, ModeType } from "@/generated/prisma/client";

const STATUS_STYLES: Record<LoadStatus, string> = {
  BOOKED: "bg-zinc-100 text-zinc-700",
  DISPATCHED: "bg-blue-100 text-blue-700",
  IN_TRANSIT: "bg-amber-100 text-amber-700",
  DELIVERED: "bg-green-100 text-green-700",
  INVOICED: "bg-purple-100 text-purple-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const NEXT_STATUS_LABEL: Partial<Record<LoadStatus, string>> = {
  BOOKED: "Mark dispatched",
  DISPATCHED: "Mark in transit",
  IN_TRANSIT: "Mark delivered",
  DELIVERED: "Mark invoiced",
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

export default async function LoadsPage() {
  const [loads, customers, carriers] = await Promise.all([
    prisma.load.findMany({
      include: { customer: true, carrier: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.customer.findMany({ orderBy: { name: "asc" } }),
    prisma.carrier.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Loads</h1>
        <p className="text-zinc-600">
          Every shipment moving from a pickup to a delivery address.
        </p>
      </div>

      {customers.length === 0 ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          Add a customer first before creating a load.
        </p>
      ) : (
        <form
          action={createLoad}
          className="grid max-w-2xl grid-cols-2 gap-3 rounded-lg border border-zinc-200 bg-white p-4"
        >
          <input
            name="referenceNumber"
            placeholder="Reference #*"
            required
            className="col-span-2 rounded border border-zinc-300 px-3 py-2"
          />

          <select
            name="customerId"
            required
            className="col-span-2 rounded border border-zinc-300 px-3 py-2"
          >
            <option value="">Customer*</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            name="carrierId"
            className="col-span-2 rounded border border-zinc-300 px-3 py-2"
          >
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
            className="col-span-2 rounded border border-zinc-300 px-3 py-2"
          />
          <input
            name="deliveryAddress"
            placeholder="Delivery address*"
            required
            className="col-span-2 rounded border border-zinc-300 px-3 py-2"
          />

          <label className="flex flex-col gap-1 text-sm text-zinc-600">
            Pickup scheduled time*
            <input
              name="pickupScheduledAt"
              type="datetime-local"
              required
              className="rounded border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-600">
            Delivery scheduled time*
            <input
              name="deliveryScheduledAt"
              type="datetime-local"
              required
              className="rounded border border-zinc-300 px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-zinc-600">
            Equipment*
            <select
              name="equipment"
              required
              defaultValue=""
              className="rounded border border-zinc-300 px-3 py-2"
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
          <label className="flex flex-col gap-1 text-sm text-zinc-600">
            Mode*
            <select
              name="modeType"
              required
              defaultValue=""
              className="rounded border border-zinc-300 px-3 py-2"
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
            className="rounded border border-zinc-300 px-3 py-2"
          />
          <input
            name="weight"
            type="number"
            placeholder="Weight (lbs)"
            className="rounded border border-zinc-300 px-3 py-2"
          />
          <input
            name="commodity"
            placeholder="Commodity"
            className="col-span-2 rounded border border-zinc-300 px-3 py-2"
          />

          <label className="flex flex-col gap-1 text-sm text-zinc-600">
            Customer rate ($)*
            <input
              name="customerRate"
              type="number"
              step="0.01"
              required
              className="rounded border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-600">
            Carrier rate ($)
            <input
              name="carrierRate"
              type="number"
              step="0.01"
              className="rounded border border-zinc-300 px-3 py-2"
            />
          </label>

          <textarea
            name="notes"
            placeholder="Notes"
            className="col-span-2 rounded border border-zinc-300 px-3 py-2"
          />

          <button
            type="submit"
            className="col-span-2 rounded bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700"
          >
            Create load
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-100 text-left text-zinc-600">
            <tr>
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
              return (
                <tr key={load.id} className="border-t border-zinc-100">
                  <td className="px-4 py-2 font-medium whitespace-nowrap">
                    {load.referenceNumber}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${STATUS_STYLES[load.status]}`}
                    >
                      {load.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {EQUIPMENT_LABELS[load.equipment]}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {MODE_LABELS[load.modeType]}
                  </td>
                  <td className="px-4 py-2">
                    <div>{load.pickupAddress}</div>
                    <div className="text-xs text-zinc-500">
                      {formatDateTime(load.pickupScheduledAt)}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div>{load.deliveryAddress}</div>
                    <div className="text-xs text-zinc-500">
                      {formatDateTime(load.deliveryScheduledAt)}
                    </div>
                  </td>
                  <td className="px-4 py-2">{load.customer.name}</td>
                  <td className="px-4 py-2">{load.carrier?.name ?? "—"}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    ${load.customerRate.toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    {nextLabel && (
                      <form action={advanceLoadStatus.bind(null, load.id)}>
                        <button
                          type="submit"
                          className="whitespace-nowrap text-xs text-blue-600 hover:underline"
                        >
                          {nextLabel}
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
            {loads.length === 0 && (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-6 text-center text-zinc-500"
                >
                  No loads yet. Create your first one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
