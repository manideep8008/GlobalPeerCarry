import type { NotificationType } from "@/types";

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface TemplateData {
  userName: string;
  parcelTitle?: string;
  pin?: string;
  bookingId?: string;
  reason?: string;
  senderName?: string;
  carrierName?: string;
}

const baseStyles = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: #ffffff;
`;

const buttonStyles = `
  display: inline-block;
  padding: 12px 24px;
  background-color: #1e293b;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  margin: 16px 0;
`;

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export function getEmailTemplate(
  type: NotificationType,
  data: TemplateData
): EmailTemplate {
  const templates: Record<NotificationType, () => EmailTemplate> = {
    payment_confirmed: () => ({
      subject: `New Paid Booking: ${data.parcelTitle}`,
      html: `
        <div style="${baseStyles}">
          <h2 style="color: #1e293b; margin-bottom: 16px;">New Booking Request!</h2>
          <p style="color: #475569; line-height: 1.6;">Hi ${data.userName},</p>
          <p style="color: #475569; line-height: 1.6;">You have a new paid booking request for <strong>${data.parcelTitle}</strong>.</p>
          <p style="color: #475569; line-height: 1.6;">${data.senderName} has already paid. Review and accept the booking to get started.</p>
          <a href="${appUrl}/bookings/${data.bookingId}" style="${buttonStyles}">
            View Booking
          </a>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 24px;">Thanks,<br>The GlobalCarry Team</p>
        </div>
      `,
      text: `Hi ${data.userName}, You have a new paid booking for ${data.parcelTitle}. View it at ${appUrl}/bookings/${data.bookingId}`,
    }),

    booking_accepted: () => ({
      subject: `Booking Accepted: ${data.parcelTitle}`,
      html: `
        <div style="${baseStyles}">
          <h2 style="color: #1e293b; margin-bottom: 16px;">Your Booking Was Accepted!</h2>
          <p style="color: #475569; line-height: 1.6;">Hi ${data.userName},</p>
          <p style="color: #475569; line-height: 1.6;">Great news! ${data.carrierName} has accepted your booking for <strong>${data.parcelTitle}</strong>.</p>
          <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #bbf7d0;">
            <h3 style="margin: 0 0 8px 0; color: #166534;">Your Delivery PIN</h3>
            <p style="font-size: 32px; font-weight: bold; letter-spacing: 4px; margin: 0; color: #166534;">${data.pin}</p>
            <p style="font-size: 12px; color: #166534; margin-top: 8px;">Share this PIN with the carrier at delivery to release payment.</p>
          </div>
          <a href="${appUrl}/bookings/${data.bookingId}" style="${buttonStyles}">
            View Booking Details
          </a>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 24px;">Thanks,<br>The GlobalCarry Team</p>
        </div>
      `,
      text: `Hi ${data.userName}, ${data.carrierName} accepted your booking for ${data.parcelTitle}. Your delivery PIN is: ${data.pin}. View details at ${appUrl}/bookings/${data.bookingId}`,
    }),

    booking_rejected: () => ({
      subject: `Booking Update: ${data.parcelTitle}`,
      html: `
        <div style="${baseStyles}">
          <h2 style="color: #1e293b; margin-bottom: 16px;">Booking Not Accepted</h2>
          <p style="color: #475569; line-height: 1.6;">Hi ${data.userName},</p>
          <p style="color: #475569; line-height: 1.6;">Unfortunately, the carrier was unable to accept your booking for <strong>${data.parcelTitle}</strong>.</p>
          <p style="color: #475569; line-height: 1.6;">Your payment has been automatically refunded. It should appear in your account within 5-10 business days.</p>
          <a href="${appUrl}/trips" style="${buttonStyles}">
            Find Another Carrier
          </a>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 24px;">Thanks,<br>The GlobalCarry Team</p>
        </div>
      `,
      text: `Hi ${data.userName}, Your booking for ${data.parcelTitle} was not accepted. A refund has been processed. Find another carrier at ${appUrl}/trips`,
    }),

    delivery_confirmed: () => ({
      subject: `Delivery Complete: ${data.parcelTitle}`,
      html: `
        <div style="${baseStyles}">
          <h2 style="color: #1e293b; margin-bottom: 16px;">Your Parcel Was Delivered!</h2>
          <p style="color: #475569; line-height: 1.6;">Hi ${data.userName},</p>
          <p style="color: #475569; line-height: 1.6;">Great news! Your parcel <strong>${data.parcelTitle}</strong> has been successfully delivered.</p>
          <p style="color: #475569; line-height: 1.6;">The carrier has confirmed delivery using your PIN.</p>
          <a href="${appUrl}/bookings/${data.bookingId}" style="${buttonStyles}">
            Leave a Review
          </a>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 24px;">Thanks for using GlobalCarry!</p>
        </div>
      `,
      text: `Hi ${data.userName}, Your parcel ${data.parcelTitle} has been delivered! Leave a review at ${appUrl}/bookings/${data.bookingId}`,
    }),

    in_transit: () => ({
      subject: `Your Parcel is On The Way: ${data.parcelTitle}`,
      html: `
        <div style="${baseStyles}">
          <h2 style="color: #1e293b; margin-bottom: 16px;">Your Parcel is In Transit!</h2>
          <p style="color: #475569; line-height: 1.6;">Hi ${data.userName},</p>
          <p style="color: #475569; line-height: 1.6;">Your parcel <strong>${data.parcelTitle}</strong> is now on its way.</p>
          <p style="color: #475569; line-height: 1.6;">${data.carrierName} has picked up your parcel and is traveling to the destination.</p>
          <a href="${appUrl}/bookings/${data.bookingId}" style="${buttonStyles}">
            Track Booking
          </a>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 24px;">Thanks,<br>The GlobalCarry Team</p>
        </div>
      `,
      text: `Hi ${data.userName}, Your parcel ${data.parcelTitle} is now in transit with ${data.carrierName}. Track it at ${appUrl}/bookings/${data.bookingId}`,
    }),

    new_message: () => ({
      subject: `New Message from ${data.senderName}`,
      html: `
        <div style="${baseStyles}">
          <h2 style="color: #1e293b; margin-bottom: 16px;">You Have a New Message</h2>
          <p style="color: #475569; line-height: 1.6;">Hi ${data.userName},</p>
          <p style="color: #475569; line-height: 1.6;"><strong>${data.senderName}</strong> sent you a message.</p>
          <a href="${appUrl}/messages" style="${buttonStyles}">
            Read Message
          </a>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 24px;">Thanks,<br>The GlobalCarry Team</p>
        </div>
      `,
      text: `Hi ${data.userName}, You have a new message from ${data.senderName}. Read it at ${appUrl}/messages`,
    }),

    kyc_approved: () => ({
      subject: "Your Identity Has Been Verified",
      html: `
        <div style="${baseStyles}">
          <h2 style="color: #1e293b; margin-bottom: 16px;">Identity Verification Approved!</h2>
          <p style="color: #475569; line-height: 1.6;">Hi ${data.userName},</p>
          <p style="color: #475569; line-height: 1.6;">Congratulations! Your identity documents have been verified.</p>
          <p style="color: #475569; line-height: 1.6;">You now have a verified badge on your profile, which helps build trust with other users.</p>
          <a href="${appUrl}/profile" style="${buttonStyles}">
            View Your Profile
          </a>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 24px;">Thanks,<br>The GlobalCarry Team</p>
        </div>
      `,
      text: `Hi ${data.userName}, Your identity has been verified! View your profile at ${appUrl}/profile`,
    }),

    kyc_rejected: () => ({
      subject: "Identity Verification Update",
      html: `
        <div style="${baseStyles}">
          <h2 style="color: #1e293b; margin-bottom: 16px;">Identity Verification Update</h2>
          <p style="color: #475569; line-height: 1.6;">Hi ${data.userName},</p>
          <p style="color: #475569; line-height: 1.6;">We were unable to verify your identity documents.</p>
          ${data.reason ? `<p style="color: #475569; line-height: 1.6;"><strong>Reason:</strong> ${data.reason}</p>` : ""}
          <p style="color: #475569; line-height: 1.6;">Please submit new documents to complete verification.</p>
          <a href="${appUrl}/profile" style="${buttonStyles}">
            Submit New Documents
          </a>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 24px;">Thanks,<br>The GlobalCarry Team</p>
        </div>
      `,
      text: `Hi ${data.userName}, We could not verify your documents. ${data.reason || ""} Please submit new documents at ${appUrl}/profile`,
    }),
  };

  return templates[type]();
}
