-- Add Stripe payment fields to parcels
ALTER TABLE parcels ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
ALTER TABLE parcels ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE parcels ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE parcels ADD COLUMN IF NOT EXISTS payout_at TIMESTAMPTZ;

-- Payment transactions log table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  parcel_id UUID REFERENCES parcels(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('charge', 'refund', 'payout')),
  stripe_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own payment transactions
DROP POLICY IF EXISTS "Users can view own payment transactions" ON payment_transactions;
CREATE POLICY "Users can view own payment transactions"
  ON payment_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM parcels
      WHERE parcels.id = payment_transactions.parcel_id
      AND (parcels.sender_id = auth.uid() OR parcels.carrier_id = auth.uid())
    )
  );

-- Admins can view all payment transactions
DROP POLICY IF EXISTS "Admins can view all payment transactions" ON payment_transactions;
CREATE POLICY "Admins can view all payment transactions"
  ON payment_transactions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- System can insert payment transactions (via service role)
DROP POLICY IF EXISTS "System can insert payment transactions" ON payment_transactions;
CREATE POLICY "System can insert payment transactions"
  ON payment_transactions FOR INSERT
  WITH CHECK (true);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS payment_transactions_parcel_id_idx ON payment_transactions(parcel_id);
CREATE INDEX IF NOT EXISTS payment_transactions_stripe_id_idx ON payment_transactions(stripe_id);
CREATE INDEX IF NOT EXISTS payment_transactions_type_idx ON payment_transactions(type);
