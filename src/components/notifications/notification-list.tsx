"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Package,
  Truck,
  MessageSquare,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import type { Notification, NotificationType } from "@/types";

interface NotificationListProps {
  notifications: Notification[];
  onClose: () => void;
}

const NOTIFICATION_ICONS: Record<NotificationType, React.ElementType> = {
  payment_confirmed: CreditCard,
  booking_accepted: CheckCircle,
  booking_rejected: XCircle,
  delivery_confirmed: Package,
  in_transit: Truck,
  new_message: MessageSquare,
  kyc_approved: ShieldCheck,
  kyc_rejected: ShieldX,
};

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  payment_confirmed: "text-green-600 bg-green-50",
  booking_accepted: "text-blue-600 bg-blue-50",
  booking_rejected: "text-red-600 bg-red-50",
  delivery_confirmed: "text-green-600 bg-green-50",
  in_transit: "text-purple-600 bg-purple-50",
  new_message: "text-slate-600 bg-slate-50",
  kyc_approved: "text-green-600 bg-green-50",
  kyc_rejected: "text-red-600 bg-red-50",
};

function getNotificationLink(notification: Notification): string {
  const data = notification.data as Record<string, string>;

  switch (notification.type) {
    case "payment_confirmed":
    case "booking_accepted":
    case "booking_rejected":
    case "delivery_confirmed":
    case "in_transit":
      return data.bookingId ? `/bookings/${data.bookingId}` : "/bookings";
    case "new_message":
      return "/messages";
    case "kyc_approved":
    case "kyc_rejected":
      return "/profile";
    default:
      return "/dashboard";
  }
}

export function NotificationList({
  notifications,
  onClose,
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-slate-500">
        No notifications yet
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="divide-y">
        {notifications.map((notification) => {
          const Icon = NOTIFICATION_ICONS[notification.type];
          const colorClass = NOTIFICATION_COLORS[notification.type];

          return (
            <Link
              key={notification.id}
              href={getNotificationLink(notification)}
              onClick={onClose}
              className={`flex gap-3 p-3 transition-colors hover:bg-slate-50 ${
                !notification.is_read ? "bg-blue-50/50" : ""
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colorClass}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium">{notification.title}</p>
                <p className="truncate text-xs text-slate-500">
                  {notification.body}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {formatDistanceToNow(new Date(notification.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              {!notification.is_read && (
                <div className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
              )}
            </Link>
          );
        })}
      </div>
    </ScrollArea>
  );
}
