export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  TRIPS: "/trips",
  NEW_TRIP: "/trips/new",
  BOOKINGS: "/bookings",
  MESSAGES: "/messages",
  PROFILE: "/profile",
} as const;

export const PARCEL_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  in_transit: "In Transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ESCROW_STATUS_LABELS: Record<string, string> = {
  awaiting_payment: "Awaiting Payment",
  held: "Payment Held",
  released: "Payment Released",
  refunded: "Refunded",
};

export const ESCROW_STATUS_COLORS: Record<string, string> = {
  awaiting_payment: "bg-amber-100 text-amber-800",
  held: "bg-blue-100 text-blue-800",
  released: "bg-green-100 text-green-800",
  refunded: "bg-red-100 text-red-800",
};

export const PARCEL_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-blue-100 text-blue-800",
  in_transit: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export const SAFETY_CHECKLIST_ITEMS = [
  "I confirm this parcel contains no prohibited or illegal items",
  "I agree to meet in a public place for handoff",
  "I understand the escrow protection terms",
  "I have verified the other party's profile",
];
