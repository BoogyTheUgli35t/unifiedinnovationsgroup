import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Printer } from 'lucide-react';

export default function Statements() {
  const { session, user } = useAuth();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<Tables<'accounts'>[]>([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [transactions, setTransactions] = useState<Tables<'transactions'>[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;
    supabase.from('accounts').select('*').eq('user_id', session.user.id).eq('status', 'active').then(({ data }) => {
      setAccounts(data || []);
    });
  }, [session?.user?.id]);

  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return { value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) };
  });

  const generateStatement = async () => {
    if (!selectedAccount || !selectedMonth || !session?.user?.id) return;
    setGenerating(true);

    const [year, month] = selectedMonth.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

    const { data, error } = await supabase.from('transactions').select('*')
      .eq('account_id', selectedAccount)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: true });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setGenerating(false);
      return;
    }

    setTransactions(data || []);
    setGenerating(false);

    if ((data || []).length === 0) {
      toast({ title: 'No transactions', description: 'No transactions found for this period.' });
      return;
    }

    // Generate printable PDF statement
    const account = accounts.find(a => a.id === selectedAccount);
    const monthLabel = months.find(m => m.value === selectedMonth)?.label;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({ title: 'Pop-up blocked', description: 'Please allow pop-ups to generate statements.', variant: 'destructive' });
      return;
    }

    const totalDeposits = (data || []).filter(t => t.type === 'deposit').reduce((s, t) => s + Number(t.amount), 0);
    const totalWithdrawals = (data || []).filter(t => ['withdrawal', 'transfer', 'crypto_buy'].includes(t.type)).reduce((s, t) => s + Number(t.amount), 0);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>UIG Statement - ${monthLabel}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a2e; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #c5a03f; }
          .logo { font-size: 24px; font-weight: 700; color: #1a1a2e; }
          .logo span { color: #c5a03f; }
          .meta { text-align: right; color: #666; font-size: 12px; line-height: 1.6; }
          .summary { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin: 20px 0 30px; }
          .summary-box { background: #f8f9fa; padding: 15px; border-radius: 8px; }
          .summary-box label { font-size: 11px; text-transform: uppercase; color: #888; letter-spacing: 0.5px; }
          .summary-box .value { font-size: 20px; font-weight: 700; margin-top: 4px; }
          .section-title { font-size: 14px; font-weight: 600; margin: 20px 0 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #444; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { text-align: left; padding: 10px 8px; background: #1a1a2e; color: #fff; font-weight: 500; }
          td { padding: 10px 8px; border-bottom: 1px solid #eee; }
          tr:nth-child(even) { background: #fafafa; }
          .amount-in { color: #16a34a; font-weight: 600; }
          .amount-out { color: #dc2626; font-weight: 600; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 11px; color: #888; text-align: center; }
          .status { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 500; }
          .status-completed { background: #dcfce7; color: #16a34a; }
          .status-pending { background: #fef9c3; color: #ca8a04; }
          .status-approved { background: #dbeafe; color: #2563eb; }
          .status-declined { background: #fee2e2; color: #dc2626; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">Unified <span>Innovations</span> Group</div>
            <p style="color: #666; font-size: 12px; margin-top: 4px;">Account Statement</p>
          </div>
          <div class="meta">
            <p><strong>Statement Period:</strong> ${monthLabel}</p>
            <p><strong>Account:</strong> ${account?.account_number}</p>
            <p><strong>Type:</strong> ${account?.account_type?.charAt(0).toUpperCase()}${account?.account_type?.slice(1)}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div class="summary">
          <div class="summary-box">
            <label>Total Deposits</label>
            <div class="value amount-in">+$${totalDeposits.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
          <div class="summary-box">
            <label>Total Withdrawals</label>
            <div class="value amount-out">-$${totalWithdrawals.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
          <div class="summary-box">
            <label>Current Balance</label>
            <div class="value">$${Number(account?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div class="section-title">Transaction History</div>
        <table>
          <thead>
            <tr><th>Date</th><th>Type</th><th>Description</th><th>Status</th><th style="text-align:right">Amount</th></tr>
          </thead>
          <tbody>
            ${(data || []).map(tx => {
              const isOut = ['withdrawal', 'transfer', 'crypto_buy'].includes(tx.type);
              return `<tr>
                <td>${new Date(tx.created_at).toLocaleDateString()}</td>
                <td style="text-transform:capitalize">${tx.type.replace('_', ' ')}</td>
                <td>${tx.counterparty || tx.description || '—'}</td>
                <td><span class="status status-${tx.status}">${tx.status}</span></td>
                <td style="text-align:right" class="${isOut ? 'amount-out' : 'amount-in'}">${isOut ? '-' : '+'}$${Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Unified Innovations Group • Digital Banking Platform</p>
          <p>This statement was generated electronically and does not require a signature.</p>
          <p style="margin-top: 8px;">For questions, contact support@unifiedinnovations.com</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <DashboardLayout title="Statements" description="Generate and download account statements">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Account Statements</CardTitle>
          <CardDescription>Generate a printable PDF statement for any account and month</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Account</Label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                <SelectContent>
                  {accounts.map(a => (
                    <SelectItem key={a.id} value={a.id}>
                      <span className="capitalize">{a.account_type}</span> — {a.account_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Statement Period</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger><SelectValue placeholder="Select month" /></SelectTrigger>
                <SelectContent>
                  {months.map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={generateStatement} disabled={generating || !selectedAccount || !selectedMonth} className="w-full">
            <Printer className="mr-2 h-4 w-4" />
            {generating ? 'Generating...' : 'Generate & Print Statement'}
          </Button>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
