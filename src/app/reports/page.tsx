import { BarChart3 } from "lucide-react";
import { ComingSoon } from "@/components/ComingSoon";

export default function ReportsPage() {
  return (
    <ComingSoon
      icon={BarChart3}
      title="Reports"
      description="Volume, margin, and on-time performance across your operation."
    />
  );
}
