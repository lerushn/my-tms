import { prisma } from "@/lib/prisma";
import { createCustomer } from "./actions";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Customers</h1>
        <p className="text-zinc-600">
          Shippers you move freight for and bill on each load.
        </p>
      </div>

      <form
        action={createCustomer}
        className="grid max-w-xl grid-cols-2 gap-3 rounded-lg border border-zinc-200 bg-white p-4"
      >
        <input
          name="name"
          placeholder="Company name*"
          required
          className="col-span-2 rounded border border-zinc-300 px-3 py-2"
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
          Add customer
        </button>
      </form>

      <table className="w-full overflow-hidden rounded-lg border border-zinc-200 bg-white text-sm">
        <thead className="bg-zinc-100 text-left text-zinc-600">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Contact</th>
            <th className="px-4 py-2">Phone</th>
            <th className="px-4 py-2">Email</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id} className="border-t border-zinc-100">
              <td className="px-4 py-2 font-medium">{c.name}</td>
              <td className="px-4 py-2">{c.contact ?? "—"}</td>
              <td className="px-4 py-2">{c.phone ?? "—"}</td>
              <td className="px-4 py-2">{c.email ?? "—"}</td>
            </tr>
          ))}
          {customers.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-zinc-500">
                No customers yet. Add your first one above.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
