-- Discord marketplace publish audit log

CREATE TABLE IF NOT EXISTS public.discord_publish_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.marketplace_listings (id) ON DELETE CASCADE,
  published_by uuid NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  webhook_key text NOT NULL DEFAULT 'marketplace',
  status text NOT NULL CHECK (status IN ('success', 'failed')),
  discord_message_id text,
  discord_channel_id text,
  request_payload jsonb NOT NULL DEFAULT '{}',
  response_payload jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX discord_publish_logs_listing_idx
  ON public.discord_publish_logs (listing_id, created_at DESC);

CREATE INDEX discord_publish_logs_status_idx
  ON public.discord_publish_logs (status, created_at DESC);

ALTER TABLE public.discord_publish_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY discord_publish_logs_admin_all
  ON public.discord_publish_logs
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
