import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const [loadCount, customerCount, carrierCount, activeLoads] =
    await Promise.all([
      prisma.load.count(),
      prisma.customer.count(),
      prisma.carrier.count(),
      prisma.load.count({
        where: { status: { in: ["BOOKED", "DISPATCHED", "IN_TRANSIT"] } },
      }),
    ]);

  const stats = [
    { label: "Active loads", value: activeLoads, href: "/loads" },
    { label: "Total loads", value: loadCount, href: "/loads" },
    { label: "Customers", value: customerCount, href: "/customers" },
    { label: "Carriers", value: carrierCount, href: "/carriers" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-zinc-600">Overview of your operation.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-lg border border-zinc-200 bg-white p-4 hover:border-zinc-400"
          >
            <div className="text-3xl font-semibold">{s.value}</div>
            <div className="text-sm text-zinc-600">{s.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
