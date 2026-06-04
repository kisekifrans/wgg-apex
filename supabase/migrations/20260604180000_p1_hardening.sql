-- P1: checkout refunded status for Stripe refund webhooks

ALTER TYPE public.stripe_checkout_status ADD VALUE IF NOT EXISTS 'refunded';
