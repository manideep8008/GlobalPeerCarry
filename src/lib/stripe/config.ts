// Platform configuration for payments
export const PLATFORM_FEE_PERCENT = 10; // 10% platform fee
export const STRIPE_CURRENCY = "usd";

// Calculate platform fee from total amount in cents
export function calculatePlatformFee(amountCents: number): number {
  return Math.round(amountCents * (PLATFORM_FEE_PERCENT / 100));
}

// Calculate carrier payout (total - platform fee)
export function calculateCarrierPayout(amountCents: number): number {
  return amountCents - calculatePlatformFee(amountCents);
}

// Convert dollars to cents
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

// Convert cents to dollars
export function centsToDollars(cents: number): number {
  return cents / 100;
}

// Format cents as currency string
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: STRIPE_CURRENCY.toUpperCase(),
  }).format(centsToDollars(cents));
}

// Get success URL for checkout
export function getCheckoutSuccessUrl(parcelId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/bookings/${parcelId}?payment=success`;
}

// Get cancel URL for checkout
export function getCheckoutCancelUrl(parcelId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/bookings/${parcelId}?payment=cancelled`;
}
