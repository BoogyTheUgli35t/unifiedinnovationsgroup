import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { CreditCard, TrendingUp, Send, FileCheck, ArrowRight, AlertTriangle } from 'lucide-react';

interface AccountBalance {
  id: string;
  account_type: string;
  balance: number;
  currency: string;
}

export default function DashboardIndex() {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<AccountBalance[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [recentTxCount, setRecentTxCount] = useState(0);
  const [kycDocCount, setKycDocCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;

    const loadData = async () => {
      try {
        const [acctRes, txRes, kycRes] = await Promise.all([
          supabase.from('accounts').select('id, account_type, balance, currency').eq('user_id', session.user.id),
          supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('user_id', session.user.id),
          supabase.from('kyc_documents').select('id', { count: 'exact', head: true }).eq('user_id', session.user.id),
        ]);

        const accts = acctRes.data || [];
        setAccounts(accts);
        setTotalBalance(accts.reduce((sum, a) => sum + Number(a.balance), 0));
        setRecentTxCount(txRes.count ?? 0);
        setKycDocCount(kycRes.count ?? 0);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [session?.user?.id]);

  const quickActions = [
    { label: 'View Accounts', icon: CreditCard, path: '/dashboard/accounts', color: 'text-blue-500' },
    { label: 'Transfer Funds', icon: Send, path: '/dashboard/transfers', color: 'text-green-500' },
    { label: 'Crypto Portfolio', icon: TrendingUp, path: '/dashboard/crypto', color: 'text-orange-500' },
    { label: 'Upload Documents', icon: FileCheck, path: '/dashboard/documents', color: 'text-purple-500' },
  ];

  return (
    <DashboardLayout title={`Welcome, ${user?.full_name?.split(' ')[0] || 'User'}`} description="Your financial dashboard overview">
      <div className="space-y-6">
        {/* Verification Banner */}
        {user?.kyc_status !== 'approved' && (
          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardContent className="pt-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium">Complete your verification</p>
                  <p className="text-sm text-muted-foreground">Upload identity documents to unlock full account features</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/documents')}>
                Upload Documents <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Balance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{accounts.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{recentTxCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>KYC Documents</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{kycDocCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Account Balances */}
        {!loading && accounts.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your Accounts</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/accounts')}>
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {accounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate('/dashboard/accounts')}>
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <span className="font-medium capitalize">{account.account_type}</span>
                    </div>
                    <span className="font-bold">{account.currency} {Number(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map((action) => (
                <Button key={action.label} variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate(action.path)}>
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex justify-between md:flex-col md:gap-1">
                <span className="text-sm text-muted-foreground">Account Status</span>
                <span className="font-medium capitalize">{user?.account_status?.replace('_', ' ') || 'active'}</span>
              </div>
              <div className="flex justify-between md:flex-col md:gap-1">
                <span className="text-sm text-muted-foreground">KYC Status</span>
                <span className="font-medium capitalize">{user?.kyc_status?.replace('_', ' ') || 'not started'}</span>
              </div>
              <div className="flex justify-between md:flex-col md:gap-1">
                <span className="text-sm text-muted-foreground">Member Since</span>
                <span className="font-medium">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
