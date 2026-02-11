import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ActionReasonModal } from '@/components/admin/ActionReasonModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { Check, X } from 'lucide-react';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<Tables<'transactions'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; txId: string; action: 'approve' | 'decline' }>({
    open: false, txId: '', action: 'approve',
  });
  const [actionLoading, setActionLoading] = useState(false);
  const { logAction } = useAuditLog();
  const { toast } = useToast();

  const fetchTransactions = async () => {
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    setTransactions(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchTransactions(); }, []);

  const handleAction = async (reason: string) => {
    setActionLoading(true);
    const newStatus = modal.action === 'approve' ? 'approved' : 'declined';

    const { error } = await supabase
      .from('transactions')
      .update({ status: newStatus })
      .eq('id', modal.txId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      await logAction({
        actionType: `transaction_${newStatus}`,
        targetType: 'transaction',
        targetId: modal.txId,
        reason,
        newValue: { status: newStatus },
      });
      toast({ title: 'Success', description: `Transaction ${newStatus}` });
      fetchTransactions();
    }
    setActionLoading(false);
    setModal({ open: false, txId: '', action: 'approve' });
  };

  return (
    <AdminLayout title="Transactions" description="Review and manage all transactions">
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Counterparty</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-sm">{new Date(t.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="capitalize">{t.type}</TableCell>
                    <TableCell className="font-mono">${Number(t.amount).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={t.status === 'pending' ? 'secondary' : t.status === 'approved' ? 'default' : 'destructive'}>
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{t.counterparty || '—'}</TableCell>
                    <TableCell>
                      {t.status === 'pending' && (
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => setModal({ open: true, txId: t.id, action: 'approve' })}>
                            <Check className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setModal({ open: true, txId: t.id, action: 'decline' })}>
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ActionReasonModal
        open={modal.open}
        onOpenChange={(o) => setModal((p) => ({ ...p, open: o }))}
        title={modal.action === 'approve' ? 'Approve Transaction' : 'Decline Transaction'}
        description="A reason is required for all transaction decisions."
        actionLabel={modal.action === 'approve' ? 'Approve' : 'Decline'}
        variant={modal.action === 'approve' ? 'default' : 'destructive'}
        onConfirm={handleAction}
        isLoading={actionLoading}
      />
    </AdminLayout>
  );
}
