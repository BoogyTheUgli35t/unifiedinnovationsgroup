import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ActionReasonModal } from '@/components/admin/ActionReasonModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { Search } from 'lucide-react';

export default function AdminFunding() {
  const [accounts, setAccounts] = useState<(Tables<'accounts'> & { email?: string })[]>([]);
  const [search, setSearch] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { logAction } = useAuditLog();
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      const { data: accts } = await supabase.from('accounts').select('*').order('created_at', { ascending: false });
      if (accts) {
        // Enrich with user emails
        const userIds = [...new Set(accts.map(a => a.user_id))];
        const { data: profiles } = await supabase.from('profiles').select('user_id, email').in('user_id', userIds);
        const emailMap = new Map(profiles?.map(p => [p.user_id, p.email]));
        setAccounts(accts.map(a => ({ ...a, email: emailMap.get(a.user_id) })));
      }
    };
    load();
  }, []);

  const filtered = accounts.filter(a =>
    a.email?.toLowerCase().includes(search.toLowerCase()) ||
    a.account_number.toLowerCase().includes(search.toLowerCase()) ||
    a.account_type.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdjust = async (reason: string) => {
    if (!selectedAccount || !amount) return;
    setActionLoading(true);

    const { data: account, error: fetchErr } = await supabase.from('accounts').select('balance').eq('id', selectedAccount).single();
    if (fetchErr || !account) {
      toast({ title: 'Error', description: 'Account not found', variant: 'destructive' });
      setActionLoading(false);
      return;
    }

    const delta = adjustType === 'credit' ? Number(amount) : -Number(amount);
    const newBalance = Number(account.balance) + delta;

    const { error } = await supabase.from('accounts').update({ balance: newBalance }).eq('id', selectedAccount);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      await logAction({ actionType: 'balance_adjusted', targetType: 'account', targetId: selectedAccount, reason, oldValue: { balance: account.balance }, newValue: { balance: newBalance, adjustment: delta } });
      toast({ title: 'Success', description: `Balance adjusted by ${delta > 0 ? '+' : ''}$${delta.toLocaleString()}` });
      setSelectedAccount('');
      setAmount('');
      // Refresh
      const { data: refreshed } = await supabase.from('accounts').select('*').order('created_at', { ascending: false });
      if (refreshed) {
        const userIds = [...new Set(refreshed.map(a => a.user_id))];
        const { data: profiles } = await supabase.from('profiles').select('user_id, email').in('user_id', userIds);
        const emailMap = new Map(profiles?.map(p => [p.user_id, p.email]));
        setAccounts(refreshed.map(a => ({ ...a, email: emailMap.get(a.user_id) })));
      }
    }
    setActionLoading(false);
    setConfirmOpen(false);
  };

  const selectedAcct = accounts.find(a => a.id === selectedAccount);

  return (
    <AdminLayout title="Funding" description="Balance adjustments and account management">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Adjust Balance</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Account</Label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                <SelectContent>
                  {accounts.map(a => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.email?.split('@')[0]} — {a.account_type} (${Number(a.balance).toLocaleString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <Button onClick={() => setConfirmOpen(true)} disabled={!selectedAccount || !amount || Number(amount) <= 0} className="w-full">
              Submit Adjustment
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Accounts</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Number</TableHead><TableHead>Type</TableHead><TableHead>Balance</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.map(a => (
                  <TableRow key={a.id} className={selectedAccount === a.id ? 'bg-muted/50' : ''} onClick={() => setSelectedAccount(a.id)} style={{ cursor: 'pointer' }}>
                    <TableCell className="text-sm">{a.email || '—'}</TableCell>
                    <TableCell className="font-mono text-xs">{a.account_number}</TableCell>
                    <TableCell className="capitalize">{a.account_type}</TableCell>
                    <TableCell className="font-medium">${Number(a.balance).toLocaleString()}</TableCell>
                    <TableCell><Badge variant="outline">{a.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <ActionReasonModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm Balance Adjustment"
        description={`${adjustType === 'credit' ? 'Credit' : 'Debit'} $${Number(amount).toLocaleString()} to ${selectedAcct?.email || 'account'} (${selectedAcct?.account_type || ''})`}
        actionLabel="Confirm Adjustment"
        onConfirm={handleAdjust}
        isLoading={actionLoading}
      />
    </AdminLayout>
  );
}
