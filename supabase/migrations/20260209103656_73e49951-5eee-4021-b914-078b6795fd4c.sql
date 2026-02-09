-- Fix WARN 1, 2, 3: Set search_path for trigger functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (new.id, new.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user'::public.app_role);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.generate_account_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.account_number := 'ACC-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('account_seq')::text, 8, '0');
  RETURN new;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ticket_number := 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('ticket_seq')::text, 6, '0');
  RETURN new;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Fix WARN 4, 5: Replace permissive audit_logs and contact_submissions policies with restrictive checks
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated users can insert audit logs"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (actor_id = auth.uid());

DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;
CREATE POLICY "Anyone can submit contact form with data"
ON public.contact_submissions FOR INSERT
WITH CHECK (email IS NOT NULL AND name IS NOT NULL AND subject IS NOT NULL AND message IS NOT NULL);