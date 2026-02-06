"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingRequestSchema, type BookingRequestFormData } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SafetyChecklistModal } from "./safety-checklist-modal";
import { toast } from "sonner";
import { Loader2, Package, CreditCard } from "lucide-react";

interface BookingRequestFormProps {
  tripId: string;
  carrierId: string;
  maxWeight: number;
  pricePerKg: number;
}

export function BookingRequestForm({
  tripId,
  carrierId,
  maxWeight,
  pricePerKg,
}: BookingRequestFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showChecklist, setShowChecklist] = useState(false);
  const [pendingData, setPendingData] = useState<BookingRequestFormData | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<BookingRequestFormData>({
    resolver: zodResolver(bookingRequestSchema) as any,
  });

  const weightValue = watch("weight_kg");
  const totalPrice = weightValue ? (weightValue * pricePerKg).toFixed(2) : "0.00";

  const onSubmit = (data: BookingRequestFormData) => {
    if (data.weight_kg > maxWeight) {
      setError(`Maximum available weight is ${maxWeight} kg`);
      return;
    }
    setPendingData(data);
    setShowChecklist(true);
  };

  const handleConfirmBooking = async () => {
    if (!pendingData) return;

    setError(null);
    setIsProcessing(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in");
      setIsProcessing(false);
      return;
    }

    // Generate a 4-digit PIN
    const pin = Math.floor(1000 + Math.random() * 9000).toString();

    // Hash the PIN using SHA-256
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPin = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    const calculatedPrice = pendingData.weight_kg * pricePerKg;

    // Create the parcel first
    const { data: parcel, error: insertError } = await supabase
      .from("parcels")
      .insert({
        sender_id: user.id,
        trip_id: tripId,
        carrier_id: carrierId,
        title: pendingData.title,
        description: pendingData.description || "",
        weight_kg: pendingData.weight_kg,
        status: "pending",
        escrow_status: "awaiting_payment",
        verification_pin: hashedPin,
        sender_pin: pin,
        total_price: calculatedPrice,
      })
      .select()
      .single();

    if (insertError || !parcel) {
      setError(insertError?.message || "Failed to create booking");
      setIsProcessing(false);
      return;
    }

    // Now redirect to Stripe checkout for the SENDER to pay
    try {
      const response = await fetch(`/api/bookings/${parcel.id}/sender-checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create checkout session");
      }

      if (result.url) {
        // Save PIN to show after payment
        sessionStorage.setItem(`booking_pin_${parcel.id}`, pin);
        toast.info("Redirecting to payment...");
        window.location.href = result.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      // Delete the parcel since payment failed to initiate
      await supabase.from("parcels").delete().eq("id", parcel.id);
      setError(err instanceof Error ? err.message : "Failed to initiate payment");
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Request a Booking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Parcel Title</Label>
              <Input
                id="title"
                placeholder="e.g., Electronics, Documents, Clothes"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe your parcel..."
                {...register("description")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight_kg">
                Weight (kg) - Max: {maxWeight} kg
              </Label>
              <Input
                id="weight_kg"
                type="number"
                step="0.1"
                max={maxWeight}
                placeholder="e.g., 2.5"
                {...register("weight_kg")}
              />
              {errors.weight_kg && (
                <p className="text-xs text-red-500">
                  {errors.weight_kg.message}
                </p>
              )}
            </div>

            <div className="rounded-lg bg-slate-50 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">
                  Total ({weightValue || 0} kg × ${pricePerKg}/kg)
                </span>
                <span className="text-lg font-bold text-slate-900">
                  ${totalPrice}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Payment is held in escrow until delivery is confirmed
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-[var(--color-navy-800)] hover:bg-[var(--color-navy-900)]"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Continue to Safety Checklist
            </Button>
          </form>
        </CardContent>
      </Card>

      <SafetyChecklistModal
        open={showChecklist}
        onOpenChange={(open) => {
          if (!isProcessing) setShowChecklist(open);
        }}
        onConfirm={handleConfirmBooking}
        isProcessing={isProcessing}
        confirmButtonText={
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay ${totalPrice} & Book
          </>
        }
      />
    </>
  );
}
