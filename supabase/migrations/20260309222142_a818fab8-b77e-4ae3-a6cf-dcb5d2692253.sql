-- Add routing number and SWIFT/BIC to accounts table
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS routing_number text;
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS swift_bic text;

-- Add beneficiary fields to transactions for wire transfers  
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS beneficiary_name text;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS beneficiary_account text;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS beneficiary_routing text;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS beneficiary_swift text;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS beneficiary_address text;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS transfer_method text DEFAULT 'internal';

-- Generate routing numbers for existing accounts
UPDATE public.accounts SET routing_number = '021000021' WHERE routing_number IS NULL;

-- Add support_tickets user update policy so users can track their own tickets
CREATE POLICY "Users can update own tickets" ON public.support_tickets
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);