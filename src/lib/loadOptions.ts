import type { Equipment, ModeType } from "@/generated/prisma/client";

export const EQUIPMENT_OPTIONS: { value: Equipment; label: string }[] = [
  { value: "SPRINTER", label: "Sprinter" },
  { value: "SMALL_STRAIGHT", label: "Small Straight" },
  { value: "LARGE_STRAIGHT", label: "Large Straight" },
  { value: "DRY_VAN", label: "Dry Van" },
  { value: "FLATBED", label: "Flatbed" },
];
export const EQUIPMENT_LABELS = Object.fromEntries(
  EQUIPMENT_OPTIONS.map((o) => [o.value, o.label]),
) as Record<Equipment, string>;

export const MODE_OPTIONS: { value: ModeType; label: string }[] = [
  { value: "GROUND", label: "Ground" },
  { value: "OCEAN", label: "Ocean" },
  { value: "CROSS_BORDER", label: "Cross Border" },
  { value: "AIR", label: "Air" },
];
export const MODE_LABELS = Object.fromEntries(
  MODE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<ModeType, string>;
