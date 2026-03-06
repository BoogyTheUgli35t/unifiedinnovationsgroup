
-- Fix ALL RLS policies: drop RESTRICTIVE and recreate as PERMISSIVE

-- ============ ACCOUNTS ============
DROP POLICY IF EXISTS "Users can view own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Admins can view all accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can create own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Admins can update accounts" ON public.accounts;

CREATE POLICY "Users can view own accounts" ON public.accounts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all accounts" ON public.accounts FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Users can create own accounts" ON public.accounts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update accounts" ON public.accounts FOR UPDATE TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- ============ AUDIT_LOGS ============
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.audit_logs;

CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Authenticated users can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid());

-- ============ CONTACT_SUBMISSIONS ============
DROP POLICY IF EXISTS "Admins can view submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can update submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Anyone can submit contact form with data" ON public.contact_submissions;

CREATE POLICY "Admins can view submissions" ON public.contact_submissions FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admins can update submissions" ON public.contact_submissions FOR UPDATE TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Anyone can submit contact form" ON public.contact_submissions FOR INSERT TO anon, authenticated WITH CHECK (email IS NOT NULL AND name IS NOT NULL AND subject IS NOT NULL AND message IS NOT NULL);

-- ============ CRYPTO_HOLDINGS ============
DROP POLICY IF EXISTS "Users can view own crypto" ON public.crypto_holdings;
DROP POLICY IF EXISTS "Admins can view all crypto" ON public.crypto_holdings;

CREATE POLICY "Users can view own crypto" ON public.crypto_holdings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all crypto" ON public.crypto_holdings FOR SELECT TO authenticated USING (is_admin(auth.uid()));

-- ============ FRAUD_ALERTS ============
DROP POLICY IF EXISTS "Users can view own alerts" ON public.fraud_alerts;
DROP POLICY IF EXISTS "Admins can view all alerts" ON public.fraud_alerts;
DROP POLICY IF EXISTS "Admins can update alerts" ON public.fraud_alerts;

CREATE POLICY "Users can view own alerts" ON public.fraud_alerts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all alerts" ON public.fraud_alerts FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admins can update alerts" ON public.fraud_alerts FOR UPDATE TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- ============ KYC_DOCUMENTS ============
DROP POLICY IF EXISTS "Users can view own documents" ON public.kyc_documents;
DROP POLICY IF EXISTS "Admins can view all documents" ON public.kyc_documents;
DROP POLICY IF EXISTS "Users can insert own kyc documents" ON public.kyc_documents;
DROP POLICY IF EXISTS "Admins can update documents" ON public.kyc_documents;

CREATE POLICY "Users can view own documents" ON public.kyc_documents FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all documents" ON public.kyc_documents FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Users can insert own kyc documents" ON public.kyc_documents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update documents" ON public.kyc_documents FOR UPDATE TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- ============ PROFILES ============
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update profiles" ON public.profiles FOR UPDATE TO authenticated USING (is_admin(auth.uid()));

-- ============ SUPPORT_TICKETS ============
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can insert own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can update tickets" ON public.support_tickets;

CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all tickets" ON public.support_tickets FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Users can insert own tickets" ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update tickets" ON public.support_tickets FOR UPDATE TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- ============ TRANSACTIONS ============
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can update transactions" ON public.transactions;

CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions" ON public.transactions FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update transactions" ON public.transactions FOR UPDATE TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- ============ USER_ROLES ============
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- ============ STORAGE: kyc-documents ============
CREATE POLICY "Users can upload own kyc files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can view own kyc files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Admins can view all kyc files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'kyc-documents' AND is_admin(auth.uid()));
