
-- Create kyc-documents storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', false);

-- Allow authenticated users to upload their own documents
CREATE POLICY "Users can upload own kyc docs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'kyc-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own documents
CREATE POLICY "Users can view own kyc docs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow admins to view all kyc documents
CREATE POLICY "Admins can view all kyc docs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc-documents'
  AND public.is_admin(auth.uid())
);

-- Allow users to INSERT kyc_documents records
CREATE POLICY "Users can insert own kyc documents"
ON public.kyc_documents
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to INSERT transactions
CREATE POLICY "Users can insert own transactions"
ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to INSERT support tickets
CREATE POLICY "Users can insert own tickets"
ON public.support_tickets
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
