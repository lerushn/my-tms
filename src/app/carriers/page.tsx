import { prisma } from "@/lib/prisma";
import { createCarrier } from "./actions";
import {
  cardClass,
  inputClass,
  primaryButtonClass,
  tableWrapClass,
  theadClass,
  trClass,
} from "@/lib/ui";

export default async function CarriersPage() {
  const carriers = await prisma.carrier.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Carriers</h1>
        <p className="text-zinc-400">
          Trucking companies you dispatch loads to and pay for hauling.
        </p>
      </div>

      <form
        action={createCarrier}
        className={`grid max-w-xl grid-cols-2 gap-3 ${cardClass}`}
      >
        <input
          name="name"
          placeholder="Carrier name*"
          required
          className={`col-span-2 ${inputClass}`}
        />
        <input name="mcNumber" placeholder="MC number" className={inputClass} />
        <input
          name="dotNumber"
          placeholder="DOT number"
          className={inputClass}
        />
        <input
          name="contact"
          placeholder="Contact person"
          className={inputClass}
        />
        <input name="phone" placeholder="Phone" className={inputClass} />
        <input
          name="email"
          type="email"
          placeholder="Email"
          className={`col-span-2 ${inputClass}`}
        />
        <button type="submit" className={`col-span-2 ${primaryButtonClass}`}>
          Add carrier
        </button>
      </form>

      <div className={tableWrapClass}>
        <table className="w-full text-sm">
          <thead className={theadClass}>
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
              <tr key={c.id} className={trClass}>
                <td className="px-4 py-2 font-medium text-white">{c.name}</td>
                <td className="px-4 py-2 text-zinc-300">
                  {c.mcNumber ?? "—"}
                </td>
                <td className="px-4 py-2 text-zinc-300">
                  {c.dotNumber ?? "—"}
                </td>
                <td className="px-4 py-2 text-zinc-300">{c.phone ?? "—"}</td>
                <td className="px-4 py-2 text-zinc-300">{c.email ?? "—"}</td>
              </tr>
            ))}
            {carriers.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-zinc-500"
                >
                  No carriers yet. Add your first one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
