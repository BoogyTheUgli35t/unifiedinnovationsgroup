import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Eye, EyeOff, Send, ArrowDownLeft, ArrowUpRight, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Accounts() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<Tables<'accounts'>[]>([]);
  const [recentTx, setRecentTx] = useState<Tables<'transactions'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBalances, setShowBalances] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;

    const loadData = async () => {
      try {
        const [acctRes, txRes] = await Promise.all([
          supabase.from('accounts').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
          supabase.from('transactions').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(5),
        ]);

        if (acctRes.error) throw acctRes.error;
        setAccounts(acctRes.data || []);
        setRecentTx(txRes.data || []);
      } catch (error) {
        console.error('Error loading accounts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [session?.user?.id]);

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);

  const copyAccountNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    toast({ title: 'Copied', description: 'Account number copied to clipboard' });
  };

  const formatBalance = (balance: number) => {
    if (!showBalances) return '••••••';
    return `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  return (
    <DashboardLayout title="Accounts" description="Manage your financial accounts">
      {loading ? (
        <div className="text-center text-muted-foreground py-12">Loading accounts...</div>
      ) : accounts.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No accounts yet. Complete onboarding to set up your accounts.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Total Balance */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription>Total Balance</CardDescription>
                  <CardTitle className="text-4xl mt-1">{formatBalance(totalBalance)}</CardTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowBalances(!showBalances)}>
                  {showBalances ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button size="sm" onClick={() => navigate('/dashboard/transfers')}>
                  <Send className="mr-2 h-4 w-4" /> Transfer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            {accounts.map((account) => (
              <Card key={account.id} className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 ${account.account_type === 'checking' ? 'bg-blue-500' : account.account_type === 'savings' ? 'bg-green-500' : 'bg-purple-500'}`} />
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${account.account_type === 'checking' ? 'bg-blue-500/10' : 'bg-green-500/10'}`}>
                        <CreditCard className={`h-5 w-5 ${account.account_type === 'checking' ? 'text-blue-500' : 'text-green-500'}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg capitalize">{account.account_type} Account</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <CardDescription className="font-mono text-xs">{account.account_number}</CardDescription>
                          <button onClick={() => copyAccountNumber(account.account_number)} className="text-muted-foreground hover:text-foreground">
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <Badge variant={account.status === 'active' ? 'default' : 'destructive'}>
                      {account.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Available Balance</p>
                      <p className="text-3xl font-bold">{formatBalance(Number(account.balance))}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Currency: {account.currency}</span>
                      <span>Opened: {new Date(account.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Transactions</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/transfers')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentTx.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No transactions yet</p>
              ) : (
                <div className="space-y-3">
                  {recentTx.map((tx) => {
                    const isOutgoing = tx.type === 'withdrawal' || tx.type === 'transfer' || tx.type === 'crypto_buy';
                    return (
                      <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          {isOutgoing ? (
                            <ArrowUpRight className="h-4 w-4 text-destructive" />
                          ) : (
                            <ArrowDownLeft className="h-4 w-4 text-green-500" />
                          )}
                          <div>
                            <p className="text-sm font-medium capitalize">{tx.type.replace('_', ' ')}</p>
                            <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className={`font-semibold ${isOutgoing ? 'text-destructive' : 'text-green-500'}`}>
                          {isOutgoing ? '-' : '+'}${Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
