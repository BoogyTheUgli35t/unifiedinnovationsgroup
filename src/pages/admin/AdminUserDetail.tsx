import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ActionReasonModal } from '@/components/admin/ActionReasonModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Tables<'profiles'> | null>(null);
  const [accounts, setAccounts] = useState<Tables<'accounts'>[]>([]);
  const [transactions, setTransactions] = useState<Tables<'transactions'>[]>([]);
  const [freezeOpen, setFreezeOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { logAction } = useAuditLog();
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const [pRes, aRes, tRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', id).single(),
        supabase.from('accounts').select('*').eq('user_id', id),
        supabase.from('transactions').select('*').eq('user_id', id).order('created_at', { ascending: false }).limit(20),
      ]);
      setProfile(pRes.data);
      setAccounts(aRes.data ?? []);
      setTransactions(tRes.data ?? []);
    };
    load();
  }, [id]);

  const isFrozen = profile?.account_status === 'frozen';

  const handleToggleFreeze = async (reason: string) => {
    if (!profile || !id) return;
    setActionLoading(true);
    const newStatus = isFrozen ? 'active' : 'frozen';

    const { error } = await supabase
      .from('profiles')
      .update({ account_status: newStatus })
      .eq('user_id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      await logAction({
        actionType: isFrozen ? 'account_unfrozen' : 'account_frozen',
        targetType: 'profile',
        targetId: id,
        reason,
        oldValue: { account_status: profile.account_status },
        newValue: { account_status: newStatus },
      });
      setProfile({ ...profile, account_status: newStatus });
      toast({ title: 'Success', description: `Account ${newStatus}` });
    }
    setActionLoading(false);
    setFreezeOpen(false);
  };

  if (!profile) {
    return (
      <AdminLayout title="User Detail">
        <p className="text-muted-foreground">Loading...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={profile.full_name || profile.email} description="User detail view">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Info */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div><span className="text-muted-foreground">Email:</span> {profile.email}</div>
            <div><span className="text-muted-foreground">Name:</span> {profile.full_name || '—'}</div>
            <div><span className="text-muted-foreground">Phone:</span> {profile.phone || '—'}</div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant={isFrozen ? 'destructive' : 'default'}>{profile.account_status}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">KYC:</span>
              <Badge variant="outline">{profile.kyc_status}</Badge>
            </div>
            <div className="pt-4">
              <Button
                variant={isFrozen ? 'default' : 'destructive'}
                size="sm"
                className="w-full"
                onClick={() => setFreezeOpen(true)}
              >
                {isFrozen ? <ShieldCheck className="mr-2 h-4 w-4" /> : <ShieldAlert className="mr-2 h-4 w-4" />}
                {isFrozen ? 'Unfreeze Account' : 'Freeze Account'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Accounts */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Accounts ({accounts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono text-sm">{a.account_number}</TableCell>
                    <TableCell className="capitalize">{a.account_type}</TableCell>
                    <TableCell>${Number(a.balance).toLocaleString()}</TableCell>
                    <TableCell><Badge variant="outline">{a.status}</Badge></TableCell>
                  </TableRow>
                ))}
                {accounts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">No accounts</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="text-sm">{new Date(t.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="capitalize">{t.type}</TableCell>
                  <TableCell>${Number(t.amount).toLocaleString()}</TableCell>
                  <TableCell><Badge variant="outline">{t.status}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{t.description || '—'}</TableCell>
                </TableRow>
              ))}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">No transactions</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ActionReasonModal
        open={freezeOpen}
        onOpenChange={setFreezeOpen}
        title={isFrozen ? 'Unfreeze Account' : 'Freeze Account'}
        description={`This will ${isFrozen ? 'unfreeze' : 'freeze'} the account for ${profile.email}. A reason is required.`}
        actionLabel={isFrozen ? 'Unfreeze' : 'Freeze'}
        variant={isFrozen ? 'default' : 'destructive'}
        onConfirm={handleToggleFreeze}
        isLoading={actionLoading}
      />
    </AdminLayout>
  );
}
