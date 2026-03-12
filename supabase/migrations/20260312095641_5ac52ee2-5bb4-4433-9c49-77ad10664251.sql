
-- Verify triggers are in place by checking (this is a no-op select)
SELECT tgname FROM pg_trigger WHERE tgname IN (
  'trg_generate_account_number', 'trg_generate_ticket_number', 
  'on_auth_user_created', 'trg_create_accounts_on_onboarding',
  'trg_notify_kyc_status', 'trg_notify_transaction_status'
);
