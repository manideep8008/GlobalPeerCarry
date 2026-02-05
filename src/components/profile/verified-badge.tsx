import { ShieldCheck, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { KycStatus } from "@/types";

interface VerifiedBadgeProps {
  status: KycStatus;
}

export function VerifiedBadge({ status }: VerifiedBadgeProps) {
  if (status === "verified") {
    return (
      <Badge variant="secondary" className="gap-1 bg-blue-50 text-blue-700">
        <ShieldCheck className="h-3 w-3" />
        Verified
      </Badge>
    );
  }

  if (status === "pending") {
    return (
      <Badge variant="secondary" className="gap-1 bg-yellow-50 text-yellow-700">
        <Clock className="h-3 w-3" />
        Pending
      </Badge>
    );
  }

  return null;
}
