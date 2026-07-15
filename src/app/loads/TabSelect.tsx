"use client";

import { useRouter } from "next/navigation";

const TABS = [
  { value: "available", label: "Available" },
  { value: "in-transit", label: "In Transit" },
  { value: "completed", label: "Completed" },
] as const;

export function TabSelect({ current }: { current: string }) {
  const router = useRouter();

  return (
    <select
      value={current}
      onChange={(e) => router.push(`/loads?tab=${e.target.value}`)}
      className="rounded border border-zinc-300 bg-white px-3 py-2 font-medium"
    >
      {TABS.map((t) => (
        <option key={t.value} value={t.value}>
          {t.label}
        </option>
      ))}
    </select>
  );
}
