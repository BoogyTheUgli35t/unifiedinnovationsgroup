-- =====================================================
-- FIX: Convert ALL RLS policies from RESTRICTIVE to PERMISSIVE
-- =====================================================

-- ACCOUNTS
DROP POLICY IF EXISTS "Users can view own accounts" ON accounts;
DROP POLICY IF EXISTS "Admins can view all accounts" ON accounts;
DROP POLICY IF EXISTS "Users can create own accounts" ON accounts;
DROP POLICY IF EXISTS "Admins can update accounts" ON accounts;

CREATE POLICY "Users can view own accounts" ON accounts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all accounts" ON accounts FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Users can create own accounts" ON accounts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update accounts" ON accounts FOR UPDATE TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update profiles" ON profiles FOR UPDATE TO authenticated USING (is_admin(auth.uid()));

-- TRANSACTIONS
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can update transactions" ON transactions;

CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions" ON transactions FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update transactions" ON transactions FOR UPDATE TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- KYC DOCUMENTS
DROP POLICY IF EXISTS "Users can view own documents" ON kyc_documents;
DROP POLICY IF EXISTS "Admins can view all documents" ON kyc_documents;
DROP POLICY IF EXISTS "Users can insert own kyc documents" ON kyc_documents;
DROP POLICY IF EXISTS "Admins can update documents" ON kyc_documents;

CREATE POLICY "Users can view own documents" ON kyc_documents FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all documents" ON kyc_documents FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Users can insert own kyc documents" ON kyc_documents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update documents" ON kyc_documents FOR UPDATE TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- SUPPORT TICKETS
DROP POLICY IF EXISTS "Users can view own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can insert own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can update own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admins can update tickets" ON support_tickets;

CREATE POLICY "Users can view own tickets" ON support_tickets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all tickets" ON support_tickets FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Users can insert own tickets" ON support_tickets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tickets" ON support_tickets FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update tickets" ON support_tickets FOR UPDATE TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Authenticated can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated can insert notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (user_id IS NOT NULL);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- AUDIT LOGS
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON audit_logs;

CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Authenticated users can insert audit logs" ON audit_logs FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid());

-- FRAUD ALERTS
DROP POLICY IF EXISTS "Users can view own alerts" ON fraud_alerts;
DROP POLICY IF EXISTS "Admins can view all alerts" ON fraud_alerts;
DROP POLICY IF EXISTS "Admins can update alerts" ON fraud_alerts;

CREATE POLICY "Users can view own alerts" ON fraud_alerts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all alerts" ON fraud_alerts FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admins can update alerts" ON fraud_alerts FOR UPDATE TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- CRYPTO HOLDINGS
DROP POLICY IF EXISTS "Users can view own crypto" ON crypto_holdings;
DROP POLICY IF EXISTS "Admins can view all crypto" ON crypto_holdings;

CREATE POLICY "Users can view own crypto" ON crypto_holdings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all crypto" ON crypto_holdings FOR SELECT TO authenticated USING (is_admin(auth.uid()));

-- CONTACT SUBMISSIONS
DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_submissions;
DROP POLICY IF EXISTS "Admins can view submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Admins can update submissions" ON contact_submissions;

CREATE POLICY "Anyone can submit contact form" ON contact_submissions FOR INSERT TO public WITH CHECK (email IS NOT NULL AND name IS NOT NULL AND subject IS NOT NULL AND message IS NOT NULL);
CREATE POLICY "Admins can view submissions" ON contact_submissions FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admins can update submissions" ON contact_submissions FOR UPDATE TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- USER ROLES
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;

CREATE POLICY "Users can view own roles" ON user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON user_roles FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- =====================================================
-- ENSURE TRIGGERS EXIST
-- =====================================================

CREATE SEQUENCE IF NOT EXISTS account_seq START 1000;
CREATE SEQUENCE IF NOT EXISTS ticket_seq START 1000;

DROP TRIGGER IF EXISTS set_account_number ON accounts;
CREATE TRIGGER set_account_number BEFORE INSERT ON accounts FOR EACH ROW EXECUTE FUNCTION generate_account_number();

DROP TRIGGER IF EXISTS set_ticket_number ON support_tickets;
CREATE TRIGGER set_ticket_number BEFORE INSERT ON support_tickets FOR EACH ROW EXECUTE FUNCTION generate_ticket_number();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON support_tickets;
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS validate_ssn ON profiles;
CREATE TRIGGER validate_ssn BEFORE INSERT OR UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION validate_ssn_last_four();

DROP TRIGGER IF EXISTS on_kyc_status_change ON kyc_documents;
CREATE TRIGGER on_kyc_status_change AFTER UPDATE ON kyc_documents FOR EACH ROW EXECUTE FUNCTION notify_kyc_status_change();

DROP TRIGGER IF EXISTS on_transaction_status_change ON transactions;
CREATE TRIGGER on_transaction_status_change AFTER UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION notify_transaction_status_change();

DROP TRIGGER IF EXISTS on_onboarding_complete ON profiles;
CREATE TRIGGER on_onboarding_complete AFTER UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION create_accounts_on_onboarding();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();