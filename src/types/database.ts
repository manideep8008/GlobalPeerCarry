export type KycStatus = "none" | "pending" | "verified";
export type ParcelStatus =
  | "pending"
  | "accepted"
  | "in_transit"
  | "delivered"
  | "cancelled";
export type EscrowStatus =
  | "awaiting_payment"
  | "held"
  | "released"
  | "refunded";
export type KycReviewStatus = "pending" | "approved" | "rejected";
export type ReportStatus = "pending" | "reviewing" | "resolved" | "dismissed";
export type ReportReason =
  | "inappropriate_behavior"
  | "fraud_or_scam"
  | "prohibited_items"
  | "harassment"
  | "fake_identity"
  | "no_show"
  | "other";
export type DocumentType = "passport" | "national_id" | "drivers_license";

export interface Profile {
  id: string;
  full_name: string;
  bio: string;
  avatar_url: string;
  kyc_status: KycStatus;
  is_admin: boolean;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
}

export interface Trip {
  id: string;
  carrier_id: string;
  origin: string;
  destination: string;
  travel_date: string;
  total_weight_kg: number;
  available_weight_kg: number;
  price_per_kg: number;
  notes: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TripWithCarrier extends Trip {
  carrier: Profile;
}

export interface Parcel {
  id: string;
  sender_id: string;
  trip_id: string;
  carrier_id: string;
  title: string;
  description: string;
  weight_kg: number;
  status: ParcelStatus;
  escrow_status: EscrowStatus;
  verification_pin: string | null;
  sender_pin: string | null;
  total_price: number;
  stripe_payment_intent_id: string | null;
  stripe_session_id: string | null;
  paid_at: string | null;
  payout_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ParcelWithDetails extends Parcel {
  sender: Profile;
  carrier: Profile;
  trip: Trip;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface KycDocument {
  id: string;
  user_id: string;
  document_type: DocumentType;
  document_url: string;
  review_status: KycReviewStatus;
  reviewer_id: string | null;
  reviewer_notes: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  parcel_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface ReviewWithProfiles extends Review {
  reviewer: Profile;
  reviewee: Profile;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  parcel_id: string | null;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  admin_notes: string;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportWithProfiles extends Report {
  reporter: Profile;
  reported_user: Profile;
}

export interface UserBlock {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

export type PaymentTransactionType = "charge" | "refund" | "payout";

export interface PaymentTransaction {
  id: string;
  parcel_id: string;
  type: PaymentTransactionType;
  stripe_id: string;
  amount_cents: number;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface PaymentTransactionWithParcel extends PaymentTransaction {
  parcel: Parcel;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>;
      };
      trips: {
        Row: Trip;
        Insert: Omit<Trip, "id" | "created_at" | "updated_at" | "is_active">;
        Update: Partial<Omit<Trip, "id" | "carrier_id" | "created_at" | "updated_at">>;
      };
      parcels: {
        Row: Parcel;
        Insert: Omit<Parcel, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Parcel, "id" | "sender_id" | "trip_id" | "created_at" | "updated_at">>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, "id" | "created_at" | "is_read">;
        Update: Partial<Pick<Message, "is_read">>;
      };
      kyc_documents: {
        Row: KycDocument;
        Insert: Omit<KycDocument, "id" | "created_at" | "updated_at" | "reviewer_id" | "reviewer_notes"> & {
          reviewer_id?: string;
          reviewer_notes?: string;
        };
        Update: Partial<Pick<KycDocument, "review_status" | "reviewer_id" | "reviewer_notes">>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, "id" | "created_at">;
        Update: never;
      };
      reports: {
        Row: Report;
        Insert: Omit<Report, "id" | "created_at" | "updated_at" | "status" | "admin_notes" | "resolved_by">;
        Update: Partial<Pick<Report, "status" | "admin_notes" | "resolved_by">>;
      };
      user_blocks: {
        Row: UserBlock;
        Insert: Omit<UserBlock, "id" | "created_at">;
        Update: never;
      };
    };
    Enums: {
      kyc_status: KycStatus;
      parcel_status: ParcelStatus;
      escrow_status: EscrowStatus;
      kyc_review_status: KycReviewStatus;
      report_status: ReportStatus;
      report_reason: ReportReason;
    };
  };
};
