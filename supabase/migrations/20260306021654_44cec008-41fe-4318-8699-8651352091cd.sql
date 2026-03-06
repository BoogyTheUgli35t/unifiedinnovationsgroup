
-- ============================================================
-- 1. Fix ALL RLS policies: Drop RESTRICTIVE, recreate as PERMISSIVE
-- ============================================================

-- ACCOUNTS
DROP POLICY IF EXISTS "Users can view own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Admins can view all accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can create own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Admins can update accounts" ON public.accounts;

CREATE POLICY "Users can view own accounts" ON public.accounts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all accounts" ON public.accounts FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can create own accounts" ON public.accounts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update accounts" ON public.accounts FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

-- TRANSACTIONS
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can update transactions" ON public.transactions;

CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions" ON public.transactions FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update transactions" ON public.transactions FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- KYC_DOCUMENTS
DROP POLICY IF EXISTS "Users can view own documents" ON public.kyc_documents;
DROP POLICY IF EXISTS "Admins can view all documents" ON public.kyc_documents;
DROP POLICY IF EXISTS "Users can insert own kyc documents" ON public.kyc_documents;
DROP POLICY IF EXISTS "Admins can update documents" ON public.kyc_documents;

CREATE POLICY "Users can view own documents" ON public.kyc_documents FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all documents" ON public.kyc_documents FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can insert own kyc documents" ON public.kyc_documents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update documents" ON public.kyc_documents FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- FRAUD_ALERTS
DROP POLICY IF EXISTS "Users can view own alerts" ON public.fraud_alerts;
DROP POLICY IF EXISTS "Admins can view all alerts" ON public.fraud_alerts;
DROP POLICY IF EXISTS "Admins can update alerts" ON public.fraud_alerts;

CREATE POLICY "Users can view own alerts" ON public.fraud_alerts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all alerts" ON public.fraud_alerts FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update alerts" ON public.fraud_alerts FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- SUPPORT_TICKETS
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can insert own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can update tickets" ON public.support_tickets;

CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all tickets" ON public.support_tickets FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can insert own tickets" ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update tickets" ON public.support_tickets FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- CRYPTO_HOLDINGS
DROP POLICY IF EXISTS "Users can view own crypto" ON public.crypto_holdings;
DROP POLICY IF EXISTS "Admins can view all crypto" ON public.crypto_holdings;

CREATE POLICY "Users can view own crypto" ON public.crypto_holdings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all crypto" ON public.crypto_holdings FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

-- AUDIT_LOGS
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.audit_logs;

CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Authenticated users can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid());

-- CONTACT_SUBMISSIONS
DROP POLICY IF EXISTS "Admins can view submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can update submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;

CREATE POLICY "Admins can view submissions" ON public.contact_submissions FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update submissions" ON public.contact_submissions FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Anyone can submit contact form" ON public.contact_submissions FOR INSERT WITH CHECK ((email IS NOT NULL) AND (name IS NOT NULL) AND (subject IS NOT NULL) AND (message IS NOT NULL));

-- USER_ROLES
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ============================================================
-- 2. Create notifications table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  read boolean NOT NULL DEFAULT false,
  link text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============================================================
-- 3. Create trigger to auto-notify on KYC status change
-- ============================================================
CREATE OR REPLACE FUNCTION public.notify_kyc_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      NEW.user_id,
      CASE NEW.status
        WHEN 'approved' THEN 'Document Approved'
        WHEN 'rejected' THEN 'Document Rejected'
        ELSE 'Document Status Updated'
      END,
      CASE NEW.status
        WHEN 'approved' THEN 'Your ' || REPLACE(NEW.document_type::text, '_', ' ') || ' has been approved.'
        WHEN 'rejected' THEN 'Your ' || REPLACE(NEW.document_type::text, '_', ' ') || ' was rejected. ' || COALESCE(NEW.rejection_reason, '')
        ELSE 'Your document status changed to ' || NEW.status::text
      END,
      CASE NEW.status WHEN 'approved' THEN 'success' WHEN 'rejected' THEN 'error' ELSE 'info' END,
      '/dashboard/documents'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_kyc_status_change
  AFTER UPDATE ON public.kyc_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_kyc_status_change();

-- ============================================================
-- 4. Create trigger to auto-notify on transaction status change
-- ============================================================
CREATE OR REPLACE FUNCTION public.notify_transaction_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('approved', 'declined', 'completed') THEN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      NEW.user_id,
      CASE NEW.status
        WHEN 'approved' THEN 'Transaction Approved'
        WHEN 'declined' THEN 'Transaction Declined'
        WHEN 'completed' THEN 'Transaction Completed'
      END,
      NEW.type || ' of $' || NEW.amount::text || ' has been ' || NEW.status::text || '.',
      CASE NEW.status WHEN 'approved' THEN 'success' WHEN 'completed' THEN 'success' ELSE 'error' END,
      '/dashboard/transfers'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_transaction_status_change
  AFTER UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_transaction_status_change();
