import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, ArrowLeftRight, AlertTriangle, ShieldCheck, FileCheck, LifeBuoy } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, pendingTx: 0, alerts: 0, pendingKyc: 0, pendingDocs: 0, openTickets: 0 });
  const [txByType, setTxByType] = useState<{ name: string; count: number }[]>([]);
  const [kycByStatus, setKycByStatus] = useState<{ name: string; value: number }[]>([]);
  const [recentTx, setRecentTx] = useState<{ date: string; amount: number }[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const [usersRes, txRes, alertsRes, kycRes, docsRes, ticketsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('fraud_alerts').select('id', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('kyc_status', 'pending'),
        supabase.from('kyc_documents').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('support_tickets').select('id', { count: 'exact', head: true }).in('status', ['open', 'in_progress']),
      ]);
      setStats({
        users: usersRes.count ?? 0,
        pendingTx: txRes.count ?? 0,
        alerts: alertsRes.count ?? 0,
        pendingKyc: kycRes.count ?? 0,
        pendingDocs: docsRes.count ?? 0,
        openTickets: ticketsRes.count ?? 0,
      });

      // Transaction type breakdown
      const { data: allTx } = await supabase.from('transactions').select('type');
      if (allTx) {
        const counts: Record<string, number> = {};
        allTx.forEach(t => { counts[t.type] = (counts[t.type] || 0) + 1; });
        setTxByType(Object.entries(counts).map(([name, count]) => ({ name, count })));
      }

      // KYC status breakdown
      const { data: allProfiles } = await supabase.from('profiles').select('kyc_status');
      if (allProfiles) {
        const counts: Record<string, number> = {};
        allProfiles.forEach(p => { counts[p.kyc_status] = (counts[p.kyc_status] || 0) + 1; });
        setKycByStatus(Object.entries(counts).map(([name, value]) => ({ name: name.replace('_', ' '), value })));
      }

      // Recent transactions by day
      const { data: recent } = await supabase.from('transactions').select('created_at, amount').order('created_at', { ascending: false }).limit(50);
      if (recent) {
        const byDay: Record<string, number> = {};
        recent.forEach(t => {
          const day = new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          byDay[day] = (byDay[day] || 0) + Number(t.amount);
        });
        setRecentTx(Object.entries(byDay).reverse().map(([date, amount]) => ({ date, amount })));
      }
    };
    fetchAll();
  }, []);

  const cards = [
    { label: 'Total Users', value: stats.users, icon: Users, color: 'text-primary' },
    { label: 'Pending Transactions', value: stats.pendingTx, icon: ArrowLeftRight, color: 'text-yellow-500' },
    { label: 'Fraud Alerts', value: stats.alerts, icon: AlertTriangle, color: 'text-destructive' },
    { label: 'Pending KYC', value: stats.pendingKyc, icon: ShieldCheck, color: 'text-accent-foreground' },
    { label: 'Pending Documents', value: stats.pendingDocs, icon: FileCheck, color: 'text-blue-400' },
    { label: 'Open Tickets', value: stats.openTickets, icon: LifeBuoy, color: 'text-green-400' },
  ];

  const PIE_COLORS = ['hsl(43, 74%, 49%)', 'hsl(220, 38%, 25%)', 'hsl(0, 72%, 51%)', 'hsl(142, 76%, 36%)'];

  return (
    <AdminLayout title="Admin Dashboard" description="Platform overview and pending actions">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {cards.map((c) => (
            <Card key={c.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
                <c.icon className={`h-4 w-4 ${c.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{c.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Transaction Volume Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transaction Volume</CardTitle>
            </CardHeader>
            <CardContent>
              {recentTx.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={recentTx}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 30%, 20%)" />
                    <XAxis dataKey="date" tick={{ fill: 'hsl(220, 15%, 55%)', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'hsl(220, 15%, 55%)', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(220, 42%, 10%)', border: '1px solid hsl(220, 30%, 20%)', borderRadius: 8 }}
                      labelStyle={{ color: 'hsl(210, 20%, 95%)' }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
                    />
                    <Bar dataKey="amount" fill="hsl(43, 74%, 49%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-12">No transaction data yet</p>
              )}
            </CardContent>
          </Card>

          {/* KYC Status Pie */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">KYC Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {kycByStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={kycByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                      {kycByStatus.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(220, 42%, 10%)', border: '1px solid hsl(220, 30%, 20%)', borderRadius: 8 }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-12">No user data yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Transaction Type Breakdown */}
        {txByType.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transactions by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={txByType} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 30%, 20%)" />
                  <XAxis type="number" tick={{ fill: 'hsl(220, 15%, 55%)', fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(220, 15%, 55%)', fontSize: 12 }} width={100} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(220, 42%, 10%)', border: '1px solid hsl(220, 30%, 20%)', borderRadius: 8 }} />
                  <Bar dataKey="count" fill="hsl(220, 38%, 35%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
