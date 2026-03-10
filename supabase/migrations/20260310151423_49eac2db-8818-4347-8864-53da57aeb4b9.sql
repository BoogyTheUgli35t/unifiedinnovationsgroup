
-- Recreate all missing triggers
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE TRIGGER generate_account_number_trigger
  BEFORE INSERT ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.generate_account_number();

CREATE OR REPLACE TRIGGER generate_ticket_number_trigger
  BEFORE INSERT ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.generate_ticket_number();

CREATE OR REPLACE TRIGGER create_accounts_on_onboarding_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_accounts_on_onboarding();

CREATE OR REPLACE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER validate_ssn_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_ssn_last_four();

CREATE OR REPLACE TRIGGER notify_transaction_status
  AFTER UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.notify_transaction_status_change();

CREATE OR REPLACE TRIGGER notify_kyc_status
  AFTER UPDATE ON public.kyc_documents
  FOR EACH ROW EXECUTE FUNCTION public.notify_kyc_status_change();

-- Ticket messages table for in-app messaging
CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  message text NOT NULL,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ticket messages" ON public.ticket_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.support_tickets WHERE id = ticket_id AND user_id = auth.uid())
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "Users can send ticket messages" ON public.ticket_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND (
      EXISTS (SELECT 1 FROM public.support_tickets WHERE id = ticket_id AND user_id = auth.uid())
      OR public.is_admin(auth.uid())
    )
  );

-- Scheduled/recurring transfers table
CREATE TABLE IF NOT EXISTS public.scheduled_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  account_id uuid NOT NULL REFERENCES public.accounts(id),
  type text NOT NULL DEFAULT 'transfer',
  amount numeric NOT NULL,
  counterparty text,
  description text,
  frequency text NOT NULL DEFAULT 'once',
  next_run_date date NOT NULL,
  end_date date,
  beneficiary_name text,
  beneficiary_account text,
  beneficiary_routing text,
  beneficiary_swift text,
  transfer_method text DEFAULT 'internal',
  status text NOT NULL DEFAULT 'active',
  last_run_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.scheduled_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scheduled transfers" ON public.scheduled_transfers
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create own scheduled transfers" ON public.scheduled_transfers
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduled transfers" ON public.scheduled_transfers
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scheduled transfers" ON public.scheduled_transfers
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all scheduled transfers" ON public.scheduled_transfers
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_messages;
