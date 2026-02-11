import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ActionReasonModal } from '@/components/admin/ActionReasonModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useToast } from '@/hooks/use-toast';

export default function AdminFunding() {
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { logAction } = useAuditLog();
  const { toast } = useToast();

  const handleAdjust = async (reason: string) => {
    if (!accountId || !amount) return;
    setActionLoading(true);

    // Get current balance
    const { data: account, error: fetchErr } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', accountId)
      .single();

    if (fetchErr || !account) {
      toast({ title: 'Error', description: 'Account not found', variant: 'destructive' });
      setActionLoading(false);
      return;
    }

    const delta = adjustType === 'credit' ? Number(amount) : -Number(amount);
    const newBalance = Number(account.balance) + delta;

    const { error } = await supabase
      .from('accounts')
      .update({ balance: newBalance })
      .eq('id', accountId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      await logAction({
        actionType: 'balance_adjusted',
        targetType: 'account',
        targetId: accountId,
        reason,
        oldValue: { balance: account.balance },
        newValue: { balance: newBalance, adjustment: delta },
      });
      toast({ title: 'Success', description: `Balance adjusted by ${delta > 0 ? '+' : ''}$${delta.toLocaleString()}` });
      setAccountId('');
      setAmount('');
    }
    setActionLoading(false);
    setConfirmOpen(false);
  };

  return (
    <AdminLayout title="Funding" description="Balance adjustments (credits & debits)">
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Adjust Account Balance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Account ID</Label>
            <Input placeholder="Enter account UUID" value={accountId} onChange={(e) => setAccountId(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={adjustType} onValueChange={(v) => setAdjustType(v as 'credit' | 'debit')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="credit">Credit (+)</SelectItem>
                <SelectItem value="debit">Debit (−)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Amount ($)</Label>
            <Input type="number" min="0.01" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <Button onClick={() => setConfirmOpen(true)} disabled={!accountId || !amount || Number(amount) <= 0} className="w-full">
            Submit Adjustment
          </Button>
        </CardContent>
      </Card>

      <ActionReasonModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm Balance Adjustment"
        description={`${adjustType === 'credit' ? 'Credit' : 'Debit'} $${Number(amount).toLocaleString()} to account ${accountId.slice(0, 8)}...`}
        actionLabel="Confirm Adjustment"
        onConfirm={handleAdjust}
        isLoading={actionLoading}
      />
    </AdminLayout>
  );
}
