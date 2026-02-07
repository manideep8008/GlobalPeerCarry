import { createClient } from "@supabase/supabase-js";
import { getResend, EMAIL_FROM } from "@/lib/email/resend";
import { getEmailTemplate } from "@/lib/email/templates";
import type { NotificationType, NotificationPreferences } from "@/types";

// Admin client for server-side operations
function getSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

interface EmailData {
  userName: string;
  userEmail: string;
  parcelTitle?: string;
  pin?: string;
  bookingId?: string;
  reason?: string;
  senderName?: string;
  carrierName?: string;
}

export async function sendNotification(
  payload: NotificationPayload,
  emailData?: EmailData
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseAdmin();

  try {
    // 1. Insert notification into database
    const { data: notification, error: insertError } = await supabase
      .from("notifications")
      .insert({
        user_id: payload.userId,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to insert notification:", insertError);
      return { success: false, error: insertError.message };
    }

    // 2. Check user email preferences
    let shouldSendEmail = true;
    const { data: preferences } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", payload.userId)
      .single();

    if (preferences) {
      const prefKey = getEmailPreferenceKey(payload.type);
      if (prefKey && preferences[prefKey] === false) {
        shouldSendEmail = false;
      }
    }

    // 3. Send email if enabled and Resend is configured
    const resend = getResend();
    if (shouldSendEmail && resend && emailData) {
      try {
        const template = getEmailTemplate(payload.type, {
          userName: emailData.userName,
          parcelTitle: emailData.parcelTitle,
          pin: emailData.pin,
          bookingId: emailData.bookingId,
          reason: emailData.reason,
          senderName: emailData.senderName,
          carrierName: emailData.carrierName,
        });

        await resend.emails.send({
          from: EMAIL_FROM,
          to: emailData.userEmail,
          subject: template.subject,
          html: template.html,
          text: template.text,
        });

        // Update notification to mark email as sent
        await supabase
          .from("notifications")
          .update({ email_sent: true })
          .eq("id", notification.id);

        console.log(`Email sent to ${emailData.userEmail} for ${payload.type}`);
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
        // Don't fail the whole operation if email fails
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Notification error:", error);
    return { success: false, error: "Failed to send notification" };
  }
}

function getEmailPreferenceKey(
  type: NotificationType
): keyof Omit<
  NotificationPreferences,
  "id" | "user_id" | "created_at" | "updated_at"
> | null {
  const mapping: Record<NotificationType, string> = {
    payment_confirmed: "email_payment_confirmed",
    booking_accepted: "email_booking_accepted",
    booking_rejected: "email_booking_rejected",
    delivery_confirmed: "email_delivery_confirmed",
    in_transit: "email_in_transit",
    new_message: "email_new_message",
    kyc_approved: "email_kyc_updates",
    kyc_rejected: "email_kyc_updates",
  };
  return mapping[type] as keyof Omit<
    NotificationPreferences,
    "id" | "user_id" | "created_at" | "updated_at"
  >;
}

// Convenience functions for specific notification types

export async function notifyPaymentConfirmed(
  carrierId: string,
  carrierName: string,
  carrierEmail: string,
  parcelTitle: string,
  senderName: string,
  bookingId: string
) {
  return sendNotification(
    {
      userId: carrierId,
      type: "payment_confirmed",
      title: "New Paid Booking!",
      body: `${senderName} has paid for booking: ${parcelTitle}`,
      data: { bookingId, senderName },
    },
    {
      userName: carrierName,
      userEmail: carrierEmail,
      parcelTitle,
      senderName,
      bookingId,
    }
  );
}

export async function notifyBookingAccepted(
  senderId: string,
  senderName: string,
  senderEmail: string,
  parcelTitle: string,
  carrierName: string,
  pin: string,
  bookingId: string
) {
  return sendNotification(
    {
      userId: senderId,
      type: "booking_accepted",
      title: "Booking Accepted!",
      body: `${carrierName} accepted your booking for ${parcelTitle}. Your PIN: ${pin}`,
      data: { bookingId, carrierName, pin },
    },
    {
      userName: senderName,
      userEmail: senderEmail,
      parcelTitle,
      carrierName,
      pin,
      bookingId,
    }
  );
}

export async function notifyBookingRejected(
  senderId: string,
  senderName: string,
  senderEmail: string,
  parcelTitle: string,
  bookingId: string
) {
  return sendNotification(
    {
      userId: senderId,
      type: "booking_rejected",
      title: "Booking Not Accepted",
      body: `Your booking for ${parcelTitle} was not accepted. Refund processed.`,
      data: { bookingId },
    },
    {
      userName: senderName,
      userEmail: senderEmail,
      parcelTitle,
      bookingId,
    }
  );
}

export async function notifyDeliveryConfirmed(
  senderId: string,
  senderName: string,
  senderEmail: string,
  parcelTitle: string,
  bookingId: string
) {
  return sendNotification(
    {
      userId: senderId,
      type: "delivery_confirmed",
      title: "Delivery Complete!",
      body: `Your parcel ${parcelTitle} has been delivered.`,
      data: { bookingId },
    },
    {
      userName: senderName,
      userEmail: senderEmail,
      parcelTitle,
      bookingId,
    }
  );
}

export async function notifyInTransit(
  senderId: string,
  senderName: string,
  senderEmail: string,
  parcelTitle: string,
  carrierName: string,
  bookingId: string
) {
  return sendNotification(
    {
      userId: senderId,
      type: "in_transit",
      title: "Parcel In Transit",
      body: `Your parcel ${parcelTitle} is on the way with ${carrierName}.`,
      data: { bookingId, carrierName },
    },
    {
      userName: senderName,
      userEmail: senderEmail,
      parcelTitle,
      carrierName,
      bookingId,
    }
  );
}

export async function notifyNewMessage(
  receiverId: string,
  receiverName: string,
  receiverEmail: string,
  senderName: string
) {
  return sendNotification(
    {
      userId: receiverId,
      type: "new_message",
      title: "New Message",
      body: `You have a new message from ${senderName}`,
      data: { senderName },
    },
    {
      userName: receiverName,
      userEmail: receiverEmail,
      senderName,
    }
  );
}

export async function notifyKycApproved(
  userId: string,
  userName: string,
  userEmail: string
) {
  return sendNotification(
    {
      userId,
      type: "kyc_approved",
      title: "Identity Verified!",
      body: "Your identity documents have been verified.",
      data: {},
    },
    {
      userName,
      userEmail,
    }
  );
}

export async function notifyKycRejected(
  userId: string,
  userName: string,
  userEmail: string,
  reason?: string
) {
  return sendNotification(
    {
      userId,
      type: "kyc_rejected",
      title: "Verification Update",
      body: reason
        ? `Identity verification unsuccessful: ${reason}`
        : "Identity verification unsuccessful. Please submit new documents.",
      data: { reason },
    },
    {
      userName,
      userEmail,
      reason,
    }
  );
}
