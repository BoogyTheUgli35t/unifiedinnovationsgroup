
-- 1. Auto-generate account numbers
CREATE OR REPLACE TRIGGER trg_generate_account_number
  BEFORE INSERT ON public.accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_account_number();

-- 2. Auto-generate ticket numbers
CREATE OR REPLACE TRIGGER trg_generate_ticket_number
  BEFORE INSERT ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_ticket_number();

-- 3. Auto-create accounts when onboarding completes
CREATE OR REPLACE TRIGGER trg_create_accounts_on_onboarding
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_accounts_on_onboarding();

-- 4. Notify user on KYC document status change
CREATE OR REPLACE TRIGGER trg_notify_kyc_status
  AFTER UPDATE ON public.kyc_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_kyc_status_change();

-- 5. Notify user on transaction status change
CREATE OR REPLACE TRIGGER trg_notify_transaction_status
  AFTER UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_transaction_status_change();

-- 6. Update updated_at on profiles
CREATE OR REPLACE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Update updated_at on support_tickets
CREATE OR REPLACE TRIGGER trg_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Update updated_at on crypto_holdings
CREATE OR REPLACE TRIGGER trg_crypto_updated_at
  BEFORE UPDATE ON public.crypto_holdings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Validate SSN format on profiles
CREATE OR REPLACE TRIGGER trg_validate_ssn
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_ssn_last_four();

-- 10. Add missing RLS policies for crypto_holdings
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'crypto_holdings' AND policyname = 'Users can insert own crypto') THEN
    CREATE POLICY "Users can insert own crypto" ON public.crypto_holdings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'crypto_holdings' AND policyname = 'Users can update own crypto') THEN
    CREATE POLICY "Users can update own crypto" ON public.crypto_holdings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'crypto_holdings' AND policyname = 'Admins can update all crypto') THEN
    CREATE POLICY "Admins can update all crypto" ON public.crypto_holdings FOR UPDATE TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'crypto_holdings' AND policyname = 'Admins can insert crypto') THEN
    CREATE POLICY "Admins can insert crypto" ON public.crypto_holdings FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
  END IF;
END $$;
