"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Preferences {
  email_payment_confirmed: boolean;
  email_booking_accepted: boolean;
  email_booking_rejected: boolean;
  email_delivery_confirmed: boolean;
  email_in_transit: boolean;
  email_new_message: boolean;
  email_kyc_updates: boolean;
}

const PREFERENCE_LABELS: Record<
  keyof Preferences,
  { label: string; description: string }
> = {
  email_payment_confirmed: {
    label: "Payment Received",
    description: "When a sender pays for your trip",
  },
  email_booking_accepted: {
    label: "Booking Accepted",
    description: "When a carrier accepts your booking",
  },
  email_booking_rejected: {
    label: "Booking Rejected",
    description: "When a carrier rejects your booking",
  },
  email_delivery_confirmed: {
    label: "Delivery Confirmed",
    description: "When your parcel is delivered",
  },
  email_in_transit: {
    label: "In Transit Updates",
    description: "When your parcel starts traveling",
  },
  email_new_message: {
    label: "New Messages",
    description: "When you receive a new message",
  },
  email_kyc_updates: {
    label: "Identity Verification",
    description: "Updates about your verification status",
  },
};

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<Preferences>({
    email_payment_confirmed: true,
    email_booking_accepted: true,
    email_booking_rejected: true,
    email_delivery_confirmed: true,
    email_in_transit: true,
    email_new_message: false,
    email_kyc_updates: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const res = await fetch("/api/notifications/preferences");
        const data = await res.json();
        if (data.preferences) {
          setPreferences(data.preferences);
        }
      } catch (error) {
        console.error("Failed to fetch preferences:", error);
      }
      setLoading(false);
    };
    fetchPreferences();
  }, []);

  const handleToggle = async (key: keyof Preferences, value: boolean) => {
    setSaving(key);
    const oldValue = preferences[key];
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    try {
      const res = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });

      if (!res.ok) throw new Error("Failed to save");
      toast.success("Preferences updated");
    } catch {
      setPreferences({ ...preferences, [key]: oldValue }); // Revert
      toast.error("Failed to update preferences");
    }

    setSaving(null);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Notifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {(Object.keys(PREFERENCE_LABELS) as Array<keyof Preferences>).map(
          (key) => {
            const { label, description } = PREFERENCE_LABELS[key];
            return (
              <div
                key={key}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="space-y-0.5">
                  <Label htmlFor={key} className="font-medium">
                    {label}
                  </Label>
                  <p className="text-sm text-slate-500">{description}</p>
                </div>
                <Switch
                  id={key}
                  checked={preferences[key]}
                  onCheckedChange={(value) => handleToggle(key, value)}
                  disabled={saving === key}
                />
              </div>
            );
          }
        )}
      </CardContent>
    </Card>
  );
}
