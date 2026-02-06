"use client";

import { Badge } from "@/components/ui/badge";
import { ESCROW_STATUS_LABELS, ESCROW_STATUS_COLORS } from "@/lib/constants";
import type { EscrowStatus } from "@/types/database";
import { CreditCard, Clock, CheckCircle, RefreshCcw } from "lucide-react";

interface PaymentStatusBadgeProps {
  status: EscrowStatus;
  showIcon?: boolean;
  className?: string;
}

const statusIcons: Record<EscrowStatus, React.ReactNode> = {
  awaiting_payment: <Clock className="h-3 w-3" />,
  held: <CreditCard className="h-3 w-3" />,
  released: <CheckCircle className="h-3 w-3" />,
  refunded: <RefreshCcw className="h-3 w-3" />,
};

export function PaymentStatusBadge({
  status,
  showIcon = true,
  className,
}: PaymentStatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={`${ESCROW_STATUS_COLORS[status]} ${className || ""}`}
    >
      {showIcon && <span className="mr-1">{statusIcons[status]}</span>}
      {ESCROW_STATUS_LABELS[status]}
    </Badge>
  );
}
