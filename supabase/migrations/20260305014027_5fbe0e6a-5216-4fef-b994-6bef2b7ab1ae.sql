
-- 1. Allow authenticated users to insert their own accounts
CREATE POLICY "Users can create own accounts"
ON public.accounts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Create function to auto-create accounts when onboarding completes
CREATE OR REPLACE FUNCTION public.create_accounts_on_onboarding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only fire when onboarding_completed changes from false to true
  IF OLD.onboarding_completed = false AND NEW.onboarding_completed = true THEN
    IF NEW.preferred_account_type IN ('checking', 'both') THEN
      INSERT INTO public.accounts (user_id, account_type)
      VALUES (NEW.user_id, 'checking'::account_type);
    END IF;

    IF NEW.preferred_account_type IN ('savings', 'both') THEN
      INSERT INTO public.accounts (user_id, account_type)
      VALUES (NEW.user_id, 'savings'::account_type);
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 3. Attach trigger to profiles table
CREATE TRIGGER on_onboarding_complete
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_accounts_on_onboarding();
