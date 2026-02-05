import { Badge } from "@/components/ui/badge";
import { ESCROW_STATUS_LABELS, ESCROW_STATUS_COLORS } from "@/lib/constants";
import type { EscrowStatus } from "@/types";

interface EscrowStatusBadgeProps {
  status: EscrowStatus;
}

export function EscrowStatusBadge({ status }: EscrowStatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={ESCROW_STATUS_COLORS[status] || ""}
    >
      {ESCROW_STATUS_LABELS[status] || status}
    </Badge>
  );
}
