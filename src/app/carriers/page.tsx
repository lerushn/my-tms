import { prisma } from "@/lib/prisma";
import { createCarrier } from "./actions";

export default async function CarriersPage() {
  const carriers = await prisma.carrier.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Carriers</h1>
        <p className="text-zinc-600">
          Trucking companies you dispatch loads to and pay for hauling.
        </p>
      </div>

      <form
        action={createCarrier}
        className="grid max-w-xl grid-cols-2 gap-3 rounded-lg border border-zinc-200 bg-white p-4"
      >
        <input
          name="name"
          placeholder="Carrier name*"
          required
          className="col-span-2 rounded border border-zinc-300 px-3 py-2"
        />
        <input
          name="mcNumber"
          placeholder="MC number"
          className="rounded border border-zinc-300 px-3 py-2"
        />
        <input
          name="dotNumber"
          placeholder="DOT number"
          className="rounded border border-zinc-300 px-3 py-2"
        />
        <input
          name="contact"
          placeholder="Contact person"
          className="rounded border border-zinc-300 px-3 py-2"
        />
        <input
          name="phone"
          placeholder="Phone"
          className="rounded border border-zinc-300 px-3 py-2"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="col-span-2 rounded border border-zinc-300 px-3 py-2"
        />
        <button
          type="submit"
          className="col-span-2 rounded bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700"
        >
          Add carrier
        </button>
      </form>

      <table className="w-full overflow-hidden rounded-lg border border-zinc-200 bg-white text-sm">
        <thead className="bg-zinc-100 text-left text-zinc-600">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">MC #</th>
            <th className="px-4 py-2">DOT #</th>
            <th className="px-4 py-2">Phone</th>
            <th className="px-4 py-2">Email</th>
          </tr>
        </thead>
        <tbody>
          {carriers.map((c) => (
            <tr key={c.id} className="border-t border-zinc-100">
              <td className="px-4 py-2 font-medium">{c.name}</td>
              <td className="px-4 py-2">{c.mcNumber ?? "—"}</td>
              <td className="px-4 py-2">{c.dotNumber ?? "—"}</td>
              <td className="px-4 py-2">{c.phone ?? "—"}</td>
              <td className="px-4 py-2">{c.email ?? "—"}</td>
            </tr>
          ))}
          {carriers.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-zinc-500">
                No carriers yet. Add your first one above.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
