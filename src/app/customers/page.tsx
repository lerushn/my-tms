import { prisma } from "@/lib/prisma";
import { createCustomer } from "./actions";
import {
  cardClass,
  inputClass,
  primaryButtonClass,
  tableWrapClass,
  theadClass,
  trClass,
} from "@/lib/ui";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Customers</h1>
        <p className="text-zinc-400">
          Shippers you move freight for and bill on each load.
        </p>
      </div>

      <form
        action={createCustomer}
        className={`grid max-w-xl grid-cols-2 gap-3 ${cardClass}`}
      >
        <input
          name="name"
          placeholder="Company name*"
          required
          className={`col-span-2 ${inputClass}`}
        />
        <input name="contact" placeholder="Contact person" className={inputClass} />
        <input name="phone" placeholder="Phone" className={inputClass} />
        <input
          name="email"
          type="email"
          placeholder="Email"
          className={`col-span-2 ${inputClass}`}
        />
        <button type="submit" className={`col-span-2 ${primaryButtonClass}`}>
          Add customer
        </button>
      </form>

      <div className={tableWrapClass}>
        <table className="w-full text-sm">
          <thead className={theadClass}>
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Contact</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Email</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className={trClass}>
                <td className="px-4 py-2 font-medium text-white">{c.name}</td>
                <td className="px-4 py-2 text-zinc-300">
                  {c.contact ?? "—"}
                </td>
                <td className="px-4 py-2 text-zinc-300">{c.phone ?? "—"}</td>
                <td className="px-4 py-2 text-zinc-300">{c.email ?? "—"}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-zinc-500"
                >
                  No customers yet. Add your first one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
