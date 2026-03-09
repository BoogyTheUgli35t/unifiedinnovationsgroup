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
import { Send, ArrowDownLeft, ArrowUpRight, Clock, Globe } from 'lucide-react';

export default function Transfers() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Tables<'transactions'>[]>([]);
  const [accounts, setAccounts] = useState<Tables<'accounts'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [fromAccount, setFromAccount] = useState('');
  const [transferType, setTransferType] = useState('');
  const [transferMethod, setTransferMethod] = useState('internal');
  const [amount, setAmount] = useState('');
  const [counterparty, setCounterparty] = useState('');
  const [description, setDescription] = useState('');

  // Banking details
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [beneficiaryAccount, setBeneficiaryAccount] = useState('');
  const [beneficiaryRouting, setBeneficiaryRouting] = useState('');
  const [beneficiarySwift, setBeneficiarySwift] = useState('');
  const [beneficiaryAddress, setBeneficiaryAddress] = useState('');

  useEffect(() => {
    if (!session?.user?.id) return;
    const loadData = async () => {
      const [txRes, acctRes] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(50),
        supabase.from('accounts').select('*').eq('user_id', session.user.id).eq('status', 'active'),
      ]);
      setTransactions(txRes.data || []);
      setAccounts(acctRes.data || []);
      setLoading(false);
    };
    loadData();
  }, [session?.user?.id]);

  const resetForm = () => {
    setAmount(''); setCounterparty(''); setDescription(''); setTransferType('');
    setBeneficiaryName(''); setBeneficiaryAccount(''); setBeneficiaryRouting('');
    setBeneficiarySwift(''); setBeneficiaryAddress(''); setTransferMethod('internal');
  };

  const handleTransfer = async () => {
    if (!fromAccount || !transferType || !amount || !session?.user?.id) {
      toast({ title: 'Missing fields', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({ title: 'Invalid amount', variant: 'destructive' });
      return;
    }

    const selectedAccount = accounts.find(a => a.id === fromAccount);
    if (!selectedAccount) return;

    if ((transferType === 'withdrawal' || transferType === 'transfer') && numAmount > Number(selectedAccount.balance)) {
      toast({ title: 'Insufficient funds', variant: 'destructive' });
      return;
    }

    // Validate banking details for external transfers
    if (transferMethod === 'domestic' && (!beneficiaryAccount || !beneficiaryRouting)) {
      toast({ title: 'Missing banking details', description: 'Account number and routing number are required for domestic transfers.', variant: 'destructive' });
      return;
    }
    if (transferMethod === 'international' && (!beneficiaryAccount || !beneficiarySwift)) {
      toast({ title: 'Missing banking details', description: 'Account number and SWIFT/BIC code are required for international transfers.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('transactions').insert({
        user_id: session.user.id,
        account_id: fromAccount,
        type: transferType as any,
        amount: numAmount,
        counterparty: counterparty || beneficiaryName || null,
        description: description || null,
        requires_approval: numAmount >= 10000,
        status: 'pending',
        beneficiary_name: beneficiaryName || null,
        beneficiary_account: beneficiaryAccount || null,
        beneficiary_routing: beneficiaryRouting || null,
        beneficiary_swift: beneficiarySwift || null,
        beneficiary_address: beneficiaryAddress || null,
        transfer_method: transferMethod,
      } as any);

      if (error) throw error;
      toast({ title: 'Transaction submitted', description: numAmount >= 10000 ? 'Your transaction requires admin approval.' : 'Your transaction has been submitted for processing.' });
      resetForm();

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

  const showBankingDetails = transferType === 'transfer' && transferMethod !== 'internal';

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
              <CardTitle className="flex items-center gap-2"><Send className="h-5 w-5" /> New Transaction</CardTitle>
              <CardDescription>Submit a deposit, withdrawal, or transfer. Transactions over $10,000 require admin approval.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From Account</Label>
                  <Select value={fromAccount} onValueChange={setFromAccount}>
                    <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
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
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deposit">Deposit</SelectItem>
                      <SelectItem value="withdrawal">Withdrawal</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {transferType === 'transfer' && (
                <div className="space-y-2">
                  <Label>Transfer Method</Label>
                  <Select value={transferMethod} onValueChange={setTransferMethod}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">Internal (Between my accounts)</SelectItem>
                      <SelectItem value="domestic">Domestic Wire (ACH / Routing Number)</SelectItem>
                      <SelectItem value="international">International Wire (SWIFT/BIC)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount (USD)</Label>
                  <Input type="number" placeholder="0.00" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{showBankingDetails ? 'Beneficiary Name' : 'Recipient / Counterparty'}</Label>
                  <Input placeholder={showBankingDetails ? 'Full legal name' : 'e.g. John Doe, Bank Name'} value={showBankingDetails ? beneficiaryName : counterparty} onChange={(e) => showBankingDetails ? setBeneficiaryName(e.target.value) : setCounterparty(e.target.value)} />
                </div>
              </div>

              {/* Banking Details for Wire Transfers */}
              {showBankingDetails && (
                <Card className="border-dashed">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {transferMethod === 'domestic' ? 'Domestic Wire Details' : 'International Wire Details'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Beneficiary Account Number *</Label>
                        <Input placeholder="Account number" value={beneficiaryAccount} onChange={(e) => setBeneficiaryAccount(e.target.value)} />
                      </div>
                      {transferMethod === 'domestic' ? (
                        <div className="space-y-2">
                          <Label>Routing Number (ABA) *</Label>
                          <Input placeholder="9-digit routing number" maxLength={9} value={beneficiaryRouting} onChange={(e) => setBeneficiaryRouting(e.target.value.replace(/\D/g, ''))} />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label>SWIFT/BIC Code *</Label>
                          <Input placeholder="e.g. CHASUS33" maxLength={11} value={beneficiarySwift} onChange={(e) => setBeneficiarySwift(e.target.value.toUpperCase())} />
                        </div>
                      )}
                    </div>
                    {transferMethod === 'international' && (
                      <div className="space-y-2">
                        <Label>Beneficiary Routing / IBAN</Label>
                        <Input placeholder="Routing or IBAN number" value={beneficiaryRouting} onChange={(e) => setBeneficiaryRouting(e.target.value)} />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Beneficiary Address</Label>
                      <Input placeholder="Full address (street, city, state/country, zip)" value={beneficiaryAddress} onChange={(e) => setBeneficiaryAddress(e.target.value)} />
                    </div>
                  </CardContent>
                </Card>
              )}

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
                <p>No transactions yet.</p>
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
                          {isOutgoing ? <ArrowUpRight className="h-5 w-5 text-destructive" /> : <ArrowDownLeft className="h-5 w-5 text-green-500" />}
                          <div>
                            <p className="font-medium capitalize">{tx.type.replace('_', ' ')}</p>
                            <p className="text-xs text-muted-foreground">
                              {tx.counterparty && <span>{tx.counterparty} · </span>}
                              {tx.description || 'No description'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(tx.created_at).toLocaleString()}
                              {(tx as any).transfer_method && (tx as any).transfer_method !== 'internal' && (
                                <span className="ml-2 text-primary">· {(tx as any).transfer_method === 'domestic' ? 'Domestic Wire' : 'International Wire'}</span>
                              )}
                            </p>
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
