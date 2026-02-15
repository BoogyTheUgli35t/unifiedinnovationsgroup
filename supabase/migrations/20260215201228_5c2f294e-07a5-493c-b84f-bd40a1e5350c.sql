
-- Add onboarding fields to profiles table (Chase/Wells Fargo style)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS ssn_last_four text,
  ADD COLUMN IF NOT EXISTS address_line1 text,
  ADD COLUMN IF NOT EXISTS address_line2 text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS zip_code text,
  ADD COLUMN IF NOT EXISTS country text DEFAULT 'US',
  ADD COLUMN IF NOT EXISTS employment_status text,
  ADD COLUMN IF NOT EXISTS annual_income_range text,
  ADD COLUMN IF NOT EXISTS preferred_account_type text,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;

-- Add constraint to validate SSN last 4 format
CREATE OR REPLACE FUNCTION public.validate_ssn_last_four()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.ssn_last_four IS NOT NULL AND NEW.ssn_last_four !~ '^\d{4}$' THEN
    RAISE EXCEPTION 'SSN last four must be exactly 4 digits';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_ssn_before_insert_update
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_ssn_last_four();
