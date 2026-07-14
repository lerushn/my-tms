import { prisma } from "@/lib/prisma";
import { createLoad, advanceLoadStatus } from "./actions";
import type { LoadStatus } from "@/generated/prisma/client";

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

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
          Every shipment moving from an origin to a destination.
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
            name="originCity"
            placeholder="Origin city*"
            required
            className="rounded border border-zinc-300 px-3 py-2"
          />
          <input
            name="originState"
            placeholder="Origin state*"
            required
            maxLength={2}
            className="rounded border border-zinc-300 px-3 py-2"
          />
          <input
            name="destCity"
            placeholder="Destination city*"
            required
            className="rounded border border-zinc-300 px-3 py-2"
          />
          <input
            name="destState"
            placeholder="Destination state*"
            required
            maxLength={2}
            className="rounded border border-zinc-300 px-3 py-2"
          />

          <label className="flex flex-col gap-1 text-sm text-zinc-600">
            Pickup date*
            <input
              name="pickupDate"
              type="date"
              required
              className="rounded border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-600">
            Delivery date*
            <input
              name="deliveryDate"
              type="date"
              required
              className="rounded border border-zinc-300 px-3 py-2"
            />
          </label>

          <input
            name="commodity"
            placeholder="Commodity"
            className="rounded border border-zinc-300 px-3 py-2"
          />
          <input
            name="weight"
            type="number"
            placeholder="Weight (lbs)"
            className="rounded border border-zinc-300 px-3 py-2"
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

      <table className="w-full overflow-hidden rounded-lg border border-zinc-200 bg-white text-sm">
        <thead className="bg-zinc-100 text-left text-zinc-600">
          <tr>
            <th className="px-4 py-2">Load #</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Lane</th>
            <th className="px-4 py-2">Pickup</th>
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
                <td className="px-4 py-2 font-medium">
                  {load.referenceNumber}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[load.status]}`}
                  >
                    {load.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {load.originCity}, {load.originState} → {load.destCity},{" "}
                  {load.destState}
                </td>
                <td className="px-4 py-2">{formatDate(load.pickupDate)}</td>
                <td className="px-4 py-2">{load.customer.name}</td>
                <td className="px-4 py-2">{load.carrier?.name ?? "—"}</td>
                <td className="px-4 py-2">
                  ${load.customerRate.toLocaleString()}
                </td>
                <td className="px-4 py-2">
                  {nextLabel && (
                    <form
                      action={advanceLoadStatus.bind(null, load.id)}
                    >
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
              <td colSpan={8} className="px-4 py-6 text-center text-zinc-500">
                No loads yet. Create your first one above.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
