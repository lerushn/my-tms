import { Search } from "lucide-react";
import { ComingSoon } from "@/components/ComingSoon";

export default function SearchPage() {
  return (
    <ComingSoon
      icon={Search}
      title="Search"
      description="Look up loads, customers, and carriers from one place."
    />
  );
}
