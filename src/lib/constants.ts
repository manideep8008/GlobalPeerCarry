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
  ADMIN: "/admin",
  ADMIN_KYC: "/admin/kyc",
  ADMIN_REPORTS: "/admin/reports",
  ADMIN_USERS: "/admin/users",
  ADMIN_PAYMENTS: "/admin/payments",
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
  "I have reviewed the prohibited items list",
  "I agree to meet in a public place for handoff",
  "I understand the escrow protection terms",
  "I have verified the other party's profile",
];

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  passport: "Passport",
  national_id: "National ID",
  drivers_license: "Driver's License",
};

export const KYC_REVIEW_STATUS_LABELS: Record<string, string> = {
  pending: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
};

export const KYC_REVIEW_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export const REPORT_REASON_LABELS: Record<string, string> = {
  inappropriate_behavior: "Inappropriate Behavior",
  fraud_or_scam: "Fraud or Scam",
  prohibited_items: "Prohibited Items",
  harassment: "Harassment",
  fake_identity: "Fake Identity",
  no_show: "No Show",
  other: "Other",
};

export const REPORT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  reviewing: "Under Review",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

export const REPORT_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  reviewing: "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
  dismissed: "bg-slate-100 text-slate-800",
};

export const PAYMENT_TRANSACTION_TYPE_LABELS: Record<string, string> = {
  charge: "Payment",
  refund: "Refund",
  payout: "Payout",
};

export const PAYMENT_TRANSACTION_TYPE_COLORS: Record<string, string> = {
  charge: "bg-green-100 text-green-800",
  refund: "bg-red-100 text-red-800",
  payout: "bg-blue-100 text-blue-800",
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  succeeded: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
  processing: "bg-blue-100 text-blue-800",
};

export const PLATFORM_FEE_PERCENT = 10;

export const PROHIBITED_ITEMS = [
  {
    category: "Dangerous Goods",
    items: [
      "Explosives and fireworks",
      "Flammable liquids and gases",
      "Toxic or poisonous substances",
      "Radioactive materials",
      "Compressed gases",
    ],
  },
  {
    category: "Illegal Substances",
    items: [
      "Narcotics and illegal drugs",
      "Drug paraphernalia",
      "Counterfeit medications",
    ],
  },
  {
    category: "Weapons & Ammunition",
    items: [
      "Firearms and parts",
      "Ammunition",
      "Knives and bladed weapons (over legal limit)",
      "Tasers and stun guns",
    ],
  },
  {
    category: "Restricted Items",
    items: [
      "Live animals",
      "Perishable food without proper packaging",
      "Human remains or body parts",
      "Counterfeit or pirated goods",
      "Currency and negotiable instruments",
      "Stolen property",
    ],
  },
  {
    category: "Regulated Items (may require documentation)",
    items: [
      "Prescription medications",
      "Alcohol and tobacco",
      "Electronics with lithium batteries (over 100Wh)",
      "Culturally protected artifacts",
    ],
  },
];
