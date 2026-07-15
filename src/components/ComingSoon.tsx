import type { LucideIcon } from "lucide-react";

export function ComingSoon({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
        <p className="text-zinc-400">{description}</p>
      </div>

      <div className="glass flex flex-col items-center gap-3 rounded-2xl px-6 py-20 text-center">
        <div className="accent-gradient flex h-12 w-12 items-center justify-center rounded-xl">
          <Icon size={22} className="text-white" strokeWidth={2} />
        </div>
        <p className="text-lg font-medium text-white">Coming soon</p>
        <p className="max-w-sm text-sm text-zinc-400">
          This section isn&apos;t built yet.
        </p>
      </div>
    </div>
  );
}
