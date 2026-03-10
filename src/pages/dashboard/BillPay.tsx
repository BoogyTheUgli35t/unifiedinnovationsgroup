import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Plus, Pause, Play, Trash2, Receipt } from 'lucide-react';

interface ScheduledTransfer {
  id: string;
  user_id: string;
  account_id: string;
  type: string;
  amount: number;
  counterparty: string | null;
  description: string | null;
  frequency: string;
  next_run_date: string;
  end_date: string | null;
  beneficiary_name: string | null;
  beneficiary_account: string | null;
  beneficiary_routing: string | null;
  beneficiary_swift: string | null;
  transfer_method: string | null;
  status: string;
  last_run_at: string | null;
  created_at: string;
}

export default function BillPay() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [scheduled, setScheduled] = useState<ScheduledTransfer[]>([]);
  const [accounts, setAccounts] = useState<Tables<'accounts'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [fromAccount, setFromAccount] = useState('');
  const [payeeName, setPayeeName] = useState('');
  const [payeeAccount, setPayeeAccount] = useState('');
  const [payeeRouting, setPayeeRouting] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('once');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadData = async () => {
    if (!session?.user?.id) return;
    const [sRes, aRes] = await Promise.all([
      supabase.from('scheduled_transfers').select('*').eq('user_id', session.user.id).order('next_run_date', { ascending: true }),
      supabase.from('accounts').select('*').eq('user_id', session.user.id).eq('status', 'active'),
    ]);
    setScheduled((sRes.data as any) || []);
    setAccounts(aRes.data || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [session?.user?.id]);

  const handleSubmit = async () => {
    if (!fromAccount || !payeeName || !amount || !startDate || !session?.user?.id) {
      toast({ title: 'Missing fields', variant: 'destructive' });
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({ title: 'Invalid amount', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('scheduled_transfers').insert({
        user_id: session.user.id,
        account_id: fromAccount,
        type: 'transfer',
        amount: numAmount,
        counterparty: payeeName,
        description: description || null,
        frequency,
        next_run_date: startDate,
        end_date: endDate || null,
        beneficiary_name: payeeName,
        beneficiary_account: payeeAccount || null,
        beneficiary_routing: payeeRouting || null,
        transfer_method: payeeRouting ? 'domestic' : 'internal',
      } as any);
      if (error) throw error;
      toast({ title: 'Payment scheduled', description: frequency === 'once' ? 'One-time payment scheduled.' : `Recurring ${frequency} payment set up.` });
      setPayeeName(''); setPayeeAccount(''); setPayeeRouting('');
      setAmount(''); setDescription(''); setStartDate(''); setEndDate('');
      setFrequency('once');
      loadData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    const { error } = await supabase.from('scheduled_transfers').update({ status: newStatus } as any).eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else loadData();
  };

  const cancelTransfer = async (id: string) => {
    const { error } = await supabase.from('scheduled_transfers').update({ status: 'cancelled' } as any).eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Payment cancelled' }); loadData(); }
  };

  const frequencyLabel = (f: string) => {
    const map: Record<string, string> = { once: 'One-time', weekly: 'Weekly', biweekly: 'Bi-weekly', monthly: 'Monthly', quarterly: 'Quarterly' };
    return map[f] || f;
  };

  return (
    <DashboardLayout title="Bill Pay" description="Schedule one-time and recurring payments">
      <Tabs defaultValue="schedule" className="space-y-6">
        <TabsList>
          <TabsTrigger value="schedule"><Plus className="h-4 w-4 mr-1" /> New Payment</TabsTrigger>
          <TabsTrigger value="upcoming"><Calendar className="h-4 w-4 mr-1" /> Scheduled ({scheduled.filter(s => s.status !== 'cancelled').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5" /> Schedule a Payment</CardTitle>
              <CardDescription>Set up a one-time or recurring bill payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pay From</Label>
                  <Select value={fromAccount} onValueChange={setFromAccount}>
                    <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                    <SelectContent>
                      {accounts.map(a => (
                        <SelectItem key={a.id} value={a.id}>
                          <span className="capitalize">{a.account_type}</span> — ${Number(a.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">One-time</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Payee Name *</Label>
                  <Input value={payeeName} onChange={(e) => setPayeeName(e.target.value)} placeholder="e.g. Electric Company, Landlord" />
                </div>
                <div className="space-y-2">
                  <Label>Amount (USD) *</Label>
                  <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" min="0.01" step="0.01" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Payee Account Number</Label>
                  <Input value={payeeAccount} onChange={(e) => setPayeeAccount(e.target.value)} placeholder="Account number (optional)" />
                </div>
                <div className="space-y-2">
                  <Label>Routing Number</Label>
                  <Input value={payeeRouting} onChange={(e) => setPayeeRouting(e.target.value.replace(/\D/g, ''))} placeholder="9-digit routing" maxLength={9} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{frequency === 'once' ? 'Payment Date *' : 'Start Date *'}</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                {frequency !== 'once' && (
                  <div className="space-y-2">
                    <Label>End Date (optional)</Label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Memo (optional)</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Payment reference or note" />
              </div>

              <Button onClick={handleSubmit} disabled={submitting || !fromAccount || !payeeName || !amount || !startDate} className="w-full">
                {submitting ? 'Scheduling...' : `Schedule ${frequencyLabel(frequency)} Payment`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : scheduled.filter(s => s.status !== 'cancelled').length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2" />
                <p>No scheduled payments yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {scheduled.filter(s => s.status !== 'cancelled').map((s) => (
                <Card key={s.id}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{s.counterparty || s.beneficiary_name}</p>
                          <Badge variant={s.status === 'active' ? 'default' : 'secondary'}>{s.status}</Badge>
                          <Badge variant="outline">{frequencyLabel(s.frequency)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <Clock className="inline h-3 w-3 mr-1" />
                          Next: {new Date(s.next_run_date).toLocaleDateString()}
                          {s.end_date && ` · Ends: ${new Date(s.end_date).toLocaleDateString()}`}
                        </p>
                        {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-lg">${Number(s.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                        <div className="flex gap-1">
                          {s.frequency !== 'once' && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleStatus(s.id, s.status)}>
                              {s.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => cancelTransfer(s.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
