"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface PaymentSuccessHandlerProps {
  parcelId: string;
}

export function PaymentSuccessHandler({ parcelId }: PaymentSuccessHandlerProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing"
  );

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        const response = await fetch(`/api/bookings/${parcelId}/confirm-payment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          toast.success("Payment confirmed! Booking accepted.");
          // Remove query param and refresh
          setTimeout(() => {
            router.replace(`/bookings/${parcelId}`);
            router.refresh();
          }, 1500);
        } else {
          // If already confirmed, that's okay
          if (data.message?.includes("already")) {
            setStatus("success");
            router.replace(`/bookings/${parcelId}`);
            router.refresh();
          } else {
            throw new Error(data.error || "Failed to confirm payment");
          }
        }
      } catch (error) {
        console.error("Payment confirmation error:", error);
        setStatus("error");
        toast.error("Payment received. Status will update shortly.");
        // Still redirect - webhook will handle it
        setTimeout(() => {
          router.replace(`/bookings/${parcelId}`);
          router.refresh();
        }, 2000);
      }
    };

    confirmPayment();
  }, [parcelId, router]);

  if (status === "success") {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Payment successful! Booking confirmed.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-center gap-2 text-blue-700">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="font-medium">Confirming your payment...</span>
        </div>
      </CardContent>
    </Card>
  );
}
