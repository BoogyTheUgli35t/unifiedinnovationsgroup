import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, BarChart3, DollarSign, PieChart, Shield, Zap, Globe, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const MODEL_PORTFOLIOS = [
  {
    id: 'conservative',
    name: 'UIG Conservative',
    risk: 'Low' as const,
    description: 'Capital preservation with steady income. Bonds, treasuries, and blue-chip dividends.',
    allocation: [
      { name: 'US Treasuries', value: 40, color: '#3b82f6' },
      { name: 'Corporate Bonds', value: 25, color: '#6366f1' },
      { name: 'Blue-Chip Stocks', value: 20, color: '#22c55e' },
      { name: 'Cash & Equivalents', value: 15, color: '#94a3b8' },
    ],
    ytdReturn: 5.8,
    annualReturn: 6.2,
    dailyChange: 0.12,
  },
  {
    id: 'balanced',
    name: 'UIG Balanced Growth',
    risk: 'Medium' as const,
    description: 'Diversified mix targeting long-term growth with moderate risk.',
    allocation: [
      { name: 'US Equities', value: 35, color: '#22c55e' },
      { name: 'International Equities', value: 20, color: '#f59e0b' },
      { name: 'Bonds', value: 25, color: '#3b82f6' },
      { name: 'Real Estate (REITs)', value: 10, color: '#ec4899' },
      { name: 'Crypto Index', value: 10, color: '#f97316' },
    ],
    ytdReturn: 12.4,
    annualReturn: 10.8,
    dailyChange: -0.34,
  },
  {
    id: 'aggressive',
    name: 'UIG Aggressive Alpha',
    risk: 'High' as const,
    description: 'Maximum growth through tech, emerging markets, and digital assets.',
    allocation: [
      { name: 'Growth Tech', value: 35, color: '#8b5cf6' },
      { name: 'Emerging Markets', value: 20, color: '#f59e0b' },
      { name: 'Crypto (BTC/ETH)', value: 20, color: '#f97316' },
      { name: 'Small-Cap', value: 15, color: '#22c55e' },
      { name: 'Commodities', value: 10, color: '#64748b' },
    ],
    ytdReturn: 22.6,
    annualReturn: 18.3,
    dailyChange: 1.45,
  },
];

const PERFORMANCE_DATA = [
  { month: 'Jul', conservative: 100, balanced: 100, aggressive: 100 },
  { month: 'Aug', conservative: 100.5, balanced: 101.2, aggressive: 102.1 },
  { month: 'Sep', conservative: 100.8, balanced: 100.8, aggressive: 99.5 },
  { month: 'Oct', conservative: 101.2, balanced: 102.5, aggressive: 104.3 },
  { month: 'Nov', conservative: 101.8, balanced: 104.1, aggressive: 108.7 },
  { month: 'Dec', conservative: 102.1, balanced: 105.8, aggressive: 112.4 },
  { month: 'Jan', conservative: 102.5, balanced: 107.2, aggressive: 115.1 },
  { month: 'Feb', conservative: 103.1, balanced: 109.5, aggressive: 118.9 },
  { month: 'Mar', conservative: 103.8, balanced: 112.4, aggressive: 122.6 },
];

const LEARN_ARTICLES = [
  {
    icon: Shield,
    title: 'Risk Management',
    summary: 'Learn how UIG portfolios are designed to manage downside risk while capturing upside potential.',
    content: `Risk management is the cornerstone of intelligent investing. At UIG, our portfolios use multiple layers of protection:

**Diversification**: By spreading investments across asset classes, geographies, and sectors, we reduce the impact of any single investment's decline.

**Rebalancing**: Our system automatically rebalances portfolios when allocations drift more than 5% from targets, locking in gains and buying undervalued assets.

**Stop-Loss Protocols**: For higher-risk portfolios, we implement trailing stop-losses to protect against sudden market downturns.

**Stress Testing**: Each portfolio is regularly stress-tested against historical crash scenarios (2008, 2020, etc.) to ensure resilience.`,
  },
  {
    icon: Globe,
    title: 'Global Diversification',
    summary: 'Why investing across geographies and asset classes reduces volatility and improves returns.',
    content: `Global diversification is one of the most powerful tools for reducing portfolio risk without sacrificing returns.

**Why Go Global?**
- Markets in different countries don't move in lockstep
- Emerging economies often grow faster than developed ones
- Currency diversification adds another layer of protection

**UIG's Approach:**
- US Equities for stability and innovation exposure
- European markets for value and dividends
- Asian markets for growth potential
- Frontier markets for asymmetric opportunities

**Key Insight**: Over the past 20 years, a globally diversified portfolio has outperformed a US-only portfolio with 30% less volatility.`,
  },
  {
    icon: DollarSign,
    title: 'Dollar-Cost Averaging',
    summary: 'How recurring investments smooth out market timing risk and build wealth consistently.',
    content: `Dollar-cost averaging (DCA) is the strategy of investing fixed amounts at regular intervals, regardless of market conditions.

**How It Works:**
- Invest $500 every month into your chosen portfolio
- When prices are high, you buy fewer shares
- When prices are low, you buy more shares
- Over time, your average cost per share tends to be lower

**The Math:**
If you invested $6,000 as a lump sum vs. $500/month over 12 months, DCA would have yielded 8-12% better risk-adjusted returns in volatile markets.

**UIG Auto-Invest**: Set up recurring investments from your checking account to automatically build your portfolio over time.`,
  },
  {
    icon: BarChart3,
    title: 'Tax-Efficient Investing',
    summary: 'Strategies to minimize your tax burden through smart asset location and harvesting.',
    content: `Tax efficiency can add 1-2% to your annual returns over time. Here's how UIG optimizes for taxes:

**Tax-Loss Harvesting**: When an investment drops in value, we sell it to realize the loss (which offsets gains) and immediately reinvest in a similar asset.

**Asset Location**: We place tax-inefficient investments (bonds, REITs) in tax-advantaged accounts and tax-efficient ones (growth stocks) in taxable accounts.

**Long-Term Holding**: By holding investments for over one year, you qualify for lower long-term capital gains rates (15-20% vs. up to 37%).

**Municipal Bonds**: For high-income investors, we include tax-free municipal bonds to boost after-tax yields.`,
  },
];

// Simple local storage for user investment positions (simulated)
function useInvestmentPositions(userId: string | undefined) {
  const key = `uig_investments_${userId}`;
  const [positions, setPositions] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!userId) return;
    try {
      const saved = localStorage.getItem(key);
      if (saved) setPositions(JSON.parse(saved));
    } catch {}
  }, [userId, key]);

  const invest = (portfolioId: string, amount: number) => {
    const updated = { ...positions, [portfolioId]: (positions[portfolioId] || 0) + amount };
    setPositions(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const withdraw = (portfolioId: string, amount: number) => {
    const current = positions[portfolioId] || 0;
    const newVal = Math.max(0, current - amount);
    const updated = { ...positions, [portfolioId]: newVal };
    if (newVal === 0) delete updated[portfolioId];
    setPositions(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  return { positions, invest, withdraw };
}

function InvestDialog({ portfolio, accounts, onInvest }: {
  portfolio: typeof MODEL_PORTFOLIOS[0];
  accounts: Tables<'accounts'>[];
  onInvest: (portfolioId: string, amount: number, accountId: string) => Promise<void>;
}) {
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!amount || !accountId) return;
    setSubmitting(true);
    await onInvest(portfolio.id, parseFloat(amount), accountId);
    setSubmitting(false);
    setOpen(false);
    setAmount('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="sm">
          <Wallet className="h-4 w-4 mr-1" /> Invest Now
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invest in {portfolio.name}</DialogTitle>
          <DialogDescription>{portfolio.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Amount ($)</Label>
            <Input type="number" placeholder="1000" min="100" step="100" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Fund From</Label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
            >
              <option value="">Select account</option>
              {accounts.filter(a => ['checking', 'savings', 'investment'].includes(a.account_type)).map(a => (
                <option key={a.id} value={a.id}>
                  {a.account_type.charAt(0).toUpperCase() + a.account_type.slice(1)} — ${Number(a.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </option>
              ))}
            </select>
          </div>
          {amount && (
            <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Portfolio:</span><span>{portfolio.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Risk Level:</span><Badge variant={portfolio.risk === 'Low' ? 'secondary' : portfolio.risk === 'Medium' ? 'default' : 'destructive'} className="text-xs">{portfolio.risk}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Expected Annual Return:</span><span className="text-green-500">+{portfolio.annualReturn}%</span></div>
              <div className="flex justify-between font-bold pt-1 border-t"><span>Investment Amount:</span><span>${parseFloat(amount || '0').toLocaleString()}</span></div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting || !amount || !accountId}>
            {submitting ? 'Processing...' : 'Confirm Investment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Investments() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<Tables<'accounts'>[]>([]);
  const [loading, setLoading] = useState(true);
  const { positions, invest, withdraw } = useInvestmentPositions(session?.user?.id);

  const hasInvestmentAccount = accounts.some(a => a.account_type === 'investment');

  useEffect(() => {
    if (!session?.user?.id) return;
    supabase.from('accounts').select('*').eq('user_id', session.user.id).then(({ data }) => {
      setAccounts(data || []);
      setLoading(false);
    });
  }, [session?.user?.id]);

  const investmentAccount = accounts.find(a => a.account_type === 'investment');

  // Calculate total invested and simulated P&L
  const totalInvested = Object.values(positions).reduce((s, v) => s + v, 0);
  const simulatedValue = Object.entries(positions).reduce((sum, [pid, amt]) => {
    const portfolio = MODEL_PORTFOLIOS.find(p => p.id === pid);
    if (!portfolio) return sum + amt;
    const growth = 1 + (portfolio.ytdReturn / 100);
    return sum + (amt * growth);
  }, 0);
  const totalPnl = simulatedValue - totalInvested;
  const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  const handleInvest = async (portfolioId: string, amount: number, accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (!account || Number(account.balance) < amount) {
      toast({ title: 'Insufficient funds', variant: 'destructive' });
      return;
    }

    try {
      // Create a transaction record
      if (session?.user?.id) {
        await supabase.from('transactions').insert({
          user_id: session.user.id,
          account_id: accountId,
          type: 'withdrawal',
          amount: amount,
          counterparty: `UIG ${MODEL_PORTFOLIOS.find(p => p.id === portfolioId)?.name || 'Portfolio'}`,
          description: `Investment in ${MODEL_PORTFOLIOS.find(p => p.id === portfolioId)?.name}`,
          status: 'completed',
        });
      }
      invest(portfolioId, amount);
      toast({ title: '✅ Investment placed', description: `$${amount.toLocaleString()} invested in ${MODEL_PORTFOLIOS.find(p => p.id === portfolioId)?.name}` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout title="UIG Investment Hub" description="Managed portfolios and wealth building tools">
      <div className="space-y-6">
        {/* Hero Banner */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-green-500" />
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">UIG Investment Hub</CardTitle>
                <CardDescription>Professionally managed portfolios tailored to your goals</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Always show portfolio summary if user has invested */}
            {totalInvested > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm text-muted-foreground">Total Invested</p>
                  <p className="text-2xl font-bold">${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm text-muted-foreground">Current Value</p>
                  <p className="text-2xl font-bold">${simulatedValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm text-muted-foreground">Total Gain / Loss</p>
                  <div className="flex items-center gap-1 mt-1">
                    {totalPnl >= 0 ? <ArrowUpRight className="h-5 w-5 text-green-500" /> : <ArrowDownRight className="h-5 w-5 text-destructive" />}
                    <p className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                      ${Math.abs(totalPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm text-muted-foreground">Return</p>
                  <p className={`text-2xl font-bold ${totalPnlPercent >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                    {totalPnlPercent >= 0 ? '+' : ''}{totalPnlPercent.toFixed(2)}%
                  </p>
                </div>
              </div>
            ) : hasInvestmentAccount && investmentAccount ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm text-muted-foreground">Investment Balance</p>
                  <p className="text-2xl font-bold">${Number(investmentAccount.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm text-muted-foreground">Account Status</p>
                  <Badge variant="default" className="mt-1 capitalize">{investmentAccount.status}</Badge>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm text-muted-foreground">Account Number</p>
                  <p className="font-mono text-sm mt-1">{investmentAccount.account_number}</p>
                </div>
              </div>
            ) : !loading ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">Open an investment account to start building your portfolio.</p>
                <Button onClick={() => navigate('/dashboard/accounts')}>
                  Open Investment Account
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Active Positions */}
        {Object.keys(positions).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Active Positions</CardTitle>
              <CardDescription>Live portfolio performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(positions).map(([pid, invested]) => {
                  const portfolio = MODEL_PORTFOLIOS.find(p => p.id === pid);
                  if (!portfolio || invested <= 0) return null;
                  const currentVal = invested * (1 + portfolio.ytdReturn / 100);
                  const pnl = currentVal - invested;
                  const dailyPnl = invested * (portfolio.dailyChange / 100);

                  return (
                    <div key={pid} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                      <div>
                        <p className="font-semibold">{portfolio.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Invested: ${invested.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        <p className={`text-xs ${dailyPnl >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                          Today: {dailyPnl >= 0 ? '+' : ''}{dailyPnl.toFixed(2)} ({portfolio.dailyChange >= 0 ? '+' : ''}{portfolio.dailyChange}%)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">${currentVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                        <p className={`text-sm font-medium ${pnl >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                          {pnl >= 0 ? '▲' : '▼'} ${Math.abs(pnl).toLocaleString('en-US', { minimumFractionDigits: 2 })} ({portfolio.ytdReturn}%)
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="portfolios" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="portfolios"><PieChart className="h-4 w-4 mr-1" /> Portfolios</TabsTrigger>
            <TabsTrigger value="performance"><TrendingUp className="h-4 w-4 mr-1" /> Performance</TabsTrigger>
            <TabsTrigger value="learn"><Zap className="h-4 w-4 mr-1" /> Learn</TabsTrigger>
          </TabsList>

          {/* Model Portfolios */}
          <TabsContent value="portfolios">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {MODEL_PORTFOLIOS.map((portfolio) => {
                const userInvested = positions[portfolio.id] || 0;
                return (
                  <Card key={portfolio.name} className="relative overflow-hidden flex flex-col">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{portfolio.name}</CardTitle>
                        <Badge variant={portfolio.risk === 'Low' ? 'secondary' : portfolio.risk === 'Medium' ? 'default' : 'destructive'}>
                          {portfolio.risk} Risk
                        </Badge>
                      </div>
                      <CardDescription>{portfolio.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1 flex flex-col">
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPie>
                            <Pie data={portfolio.allocation} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                              {portfolio.allocation.map((entry, idx) => (
                                <Cell key={idx} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => `${value}%`} />
                          </RechartsPie>
                        </ResponsiveContainer>
                      </div>

                      <div className="space-y-1">
                        {portfolio.allocation.map((a) => (
                          <div key={a.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ background: a.color }} />
                              <span className="text-muted-foreground">{a.name}</span>
                            </div>
                            <span className="font-medium">{a.value}%</span>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground">YTD Return</p>
                          <p className={`text-lg font-bold ${portfolio.ytdReturn >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                            {portfolio.ytdReturn >= 0 ? '+' : ''}{portfolio.ytdReturn}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Annual Avg</p>
                          <p className="text-lg font-bold text-green-500">+{portfolio.annualReturn}%</p>
                        </div>
                      </div>

                      {userInvested > 0 && (
                        <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Your position:</span>
                            <span className="font-bold">${(userInvested * (1 + portfolio.ytdReturn / 100)).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">P&L:</span>
                            <span className="font-bold text-green-500">+${(userInvested * portfolio.ytdReturn / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      )}

                      <div className="mt-auto pt-2">
                        <InvestDialog portfolio={portfolio} accounts={accounts} onInvest={handleInvest} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Performance Chart */}
          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Performance Comparison</CardTitle>
                <CardDescription>Growth of $100 invested over the last 9 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={PERFORMANCE_DATA}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-muted-foreground" />
                      <YAxis className="text-muted-foreground" domain={['dataMin - 2', 'dataMax + 2']} />
                      <Tooltip
                        contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                      />
                      <Line type="monotone" dataKey="conservative" stroke="#3b82f6" strokeWidth={2} name="Conservative" dot={false} />
                      <Line type="monotone" dataKey="balanced" stroke="#22c55e" strokeWidth={2} name="Balanced" dot={false} />
                      <Line type="monotone" dataKey="aggressive" stroke="#f97316" strokeWidth={2} name="Aggressive" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-sm text-muted-foreground">Conservative</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-sm text-muted-foreground">Balanced</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500" /><span className="text-sm text-muted-foreground">Aggressive</span></div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learn Tab - Accordion */}
          <TabsContent value="learn">
            <Card>
              <CardHeader>
                <CardTitle>Investment Education</CardTitle>
                <CardDescription>Tap any topic to expand and learn more</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {LEARN_ARTICLES.map((item) => (
                    <AccordionItem key={item.title} value={item.title}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3 text-left">
                          <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                            <item.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-base">{item.title}</p>
                            <p className="text-sm text-muted-foreground font-normal">{item.summary}</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-12 pr-4 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                          {item.content}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
