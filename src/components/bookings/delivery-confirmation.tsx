"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

interface DeliveryConfirmationProps {
  parcelId: string;
}

export function DeliveryConfirmation({ parcelId }: DeliveryConfirmationProps) {
  const router = useRouter();
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleConfirm = async () => {
    const fullPin = pin.join("");
    if (fullPin.length !== 4) {
      setError("Please enter the complete 4-digit PIN");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Hash the entered PIN
    const encoder = new TextEncoder();
    const data = encoder.encode(fullPin);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPin = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const supabase = createClient();

    // Verify PIN by comparing hashes
    const { data: parcel } = await supabase
      .from("parcels")
      .select("verification_pin")
      .eq("id", parcelId)
      .single();

    if (!parcel || parcel.verification_pin !== hashedPin) {
      setError("Incorrect PIN. Please try again.");
      setIsSubmitting(false);
      setPin(["", "", "", ""]);
      inputRefs.current[0]?.focus();
      return;
    }

    // Update parcel status
    const { error: updateError } = await supabase
      .from("parcels")
      .update({
        status: "delivered",
        escrow_status: "released",
      })
      .eq("id", parcelId);

    if (updateError) {
      setError(updateError.message);
      setIsSubmitting(false);
      return;
    }

    toast.success("Delivery confirmed! Payment has been released.");
    setIsSubmitting(false);
    router.refresh();
  };

  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lock className="h-5 w-5 text-green-700" />
          Confirm Delivery
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          Enter the 4-digit PIN provided by the sender to confirm delivery and
          release the payment.
        </p>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex justify-center gap-3">
          {pin.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="h-14 w-14 text-center text-2xl font-bold"
            />
          ))}
        </div>

        <Button
          onClick={handleConfirm}
          disabled={isSubmitting || pin.join("").length !== 4}
          className="w-full bg-green-700 hover:bg-green-800"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="mr-2 h-4 w-4" />
          )}
          Confirm Delivery
        </Button>
      </CardContent>
    </Card>
  );
}
