import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, ArrowLeftRight, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, pendingTx: 0, alerts: 0, pendingKyc: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [usersRes, txRes, alertsRes, kycRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('fraud_alerts').select('id', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('kyc_status', 'pending'),
      ]);
      setStats({
        users: usersRes.count ?? 0,
        pendingTx: txRes.count ?? 0,
        alerts: alertsRes.count ?? 0,
        pendingKyc: kycRes.count ?? 0,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Total Users', value: stats.users, icon: Users, color: 'text-primary' },
    { label: 'Pending Transactions', value: stats.pendingTx, icon: ArrowLeftRight, color: 'text-warning' },
    { label: 'Fraud Alerts', value: stats.alerts, icon: AlertTriangle, color: 'text-destructive' },
    { label: 'Pending KYC', value: stats.pendingKyc, icon: ShieldCheck, color: 'text-accent-foreground' },
  ];

  return (
    <AdminLayout title="Admin Dashboard" description="Platform overview and pending actions">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
    </AdminLayout>
  );
}
