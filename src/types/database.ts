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

export interface Profile {
  id: string;
  full_name: string;
  bio: string;
  avatar_url: string;
  kyc_status: KycStatus;
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
    };
    Enums: {
      kyc_status: KycStatus;
      parcel_status: ParcelStatus;
      escrow_status: EscrowStatus;
    };
  };
};
