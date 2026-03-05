import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { Send, ArrowDownLeft, ArrowUpRight, Clock } from 'lucide-react';

export default function Transfers() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Tables<'transactions'>[]>([]);
  const [accounts, setAccounts] = useState<Tables<'accounts'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Transfer form state
  const [fromAccount, setFromAccount] = useState('');
  const [transferType, setTransferType] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [counterparty, setCounterparty] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!session?.user?.id) return;

    const loadData = async () => {
      try {
        const [txRes, acctRes] = await Promise.all([
          supabase.from('transactions').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(50),
          supabase.from('accounts').select('*').eq('user_id', session.user.id).eq('status', 'active'),
        ]);

        setTransactions(txRes.data || []);
        setAccounts(acctRes.data || []);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [session?.user?.id]);

  const handleTransfer = async () => {
    if (!fromAccount || !transferType || !amount || !session?.user?.id) {
      toast({ title: 'Missing fields', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({ title: 'Invalid amount', description: 'Please enter a valid positive amount.', variant: 'destructive' });
      return;
    }

    const selectedAccount = accounts.find(a => a.id === fromAccount);
    if (!selectedAccount) return;

    if ((transferType === 'withdrawal' || transferType === 'transfer') && numAmount > Number(selectedAccount.balance)) {
      toast({ title: 'Insufficient funds', description: 'You do not have enough balance for this transaction.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('transactions').insert({
        user_id: session.user.id,
        account_id: fromAccount,
        type: transferType as Tables<'transactions'>['type'],
        amount: numAmount,
        counterparty: counterparty || null,
        description: description || null,
        requires_approval: numAmount >= 10000,
        status: numAmount >= 10000 ? 'pending' : 'pending',
      });

      if (error) throw error;

      toast({ title: 'Transaction submitted', description: numAmount >= 10000 ? 'Your transaction requires admin approval.' : 'Your transaction has been submitted for processing.' });

      // Reset form
      setAmount('');
      setCounterparty('');
      setDescription('');
      setTransferType('');

      // Reload transactions
      const { data } = await supabase.from('transactions').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(50);
      setTransactions(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <DashboardLayout title="Transfers" description="Send money and view transaction history">
      <Tabs defaultValue="new" className="space-y-6">
        <TabsList>
          <TabsTrigger value="new">New Transaction</TabsTrigger>
          <TabsTrigger value="history">History ({transactions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                New Transaction
              </CardTitle>
              <CardDescription>Submit a deposit, withdrawal, or transfer. Transactions over $10,000 require admin approval.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From Account</Label>
                  <Select value={fromAccount} onValueChange={setFromAccount}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          <span className="capitalize">{a.account_type}</span> — ${Number(a.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Transaction Type</Label>
                  <Select value={transferType} onValueChange={setTransferType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deposit">Deposit</SelectItem>
                      <SelectItem value="withdrawal">Withdrawal</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount (USD)</Label>
                  <Input type="number" placeholder="0.00" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Recipient / Counterparty</Label>
                  <Input placeholder="e.g. John Doe, Bank Name" value={counterparty} onChange={(e) => setCounterparty(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Input placeholder="What's this transaction for?" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              <Button onClick={handleTransfer} disabled={submitting || !fromAccount || !transferType || !amount} className="w-full">
                {submitting ? 'Submitting...' : 'Submit Transaction'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          {loading ? (
            <div className="text-center text-muted-foreground py-8">Loading...</div>
          ) : transactions.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p>No transactions yet. Submit your first transaction above.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => {
                const isOutgoing = tx.type === 'withdrawal' || tx.type === 'transfer' || tx.type === 'crypto_buy';
                return (
                  <Card key={tx.id}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          {isOutgoing ? (
                            <ArrowUpRight className="h-5 w-5 text-destructive" />
                          ) : (
                            <ArrowDownLeft className="h-5 w-5 text-green-500" />
                          )}
                          <div>
                            <p className="font-medium capitalize">{tx.type.replace('_', ' ')}</p>
                            <p className="text-xs text-muted-foreground">
                              {tx.counterparty && <span>{tx.counterparty} · </span>}
                              {tx.description || 'No description'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{new Date(tx.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-lg ${isOutgoing ? 'text-destructive' : 'text-green-500'}`}>
                            {isOutgoing ? '-' : '+'}${Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(tx.status)}`}>
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
