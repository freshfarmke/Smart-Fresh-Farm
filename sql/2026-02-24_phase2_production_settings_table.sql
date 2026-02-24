-- Production operations settings (key/value)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.production_operations_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prod_ops_settings_key ON public.production_operations_settings(key);

-- Trigger to update updated_at on change
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_on_prod_ops_settings ON public.production_operations_settings;
CREATE TRIGGER set_timestamp_on_prod_ops_settings
BEFORE UPDATE ON public.production_operations_settings
FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
