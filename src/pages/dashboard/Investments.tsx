import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, BarChart3, DollarSign, PieChart, ArrowUpRight, Shield, Zap, Globe } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';

// UIG Investment Hub - Model Portfolios
const MODEL_PORTFOLIOS = [
  {
    name: 'UIG Conservative',
    risk: 'Low',
    description: 'Capital preservation with steady income. Bonds, treasuries, and blue-chip dividends.',
    allocation: [
      { name: 'US Treasuries', value: 40, color: '#3b82f6' },
      { name: 'Corporate Bonds', value: 25, color: '#6366f1' },
      { name: 'Blue-Chip Stocks', value: 20, color: '#22c55e' },
      { name: 'Cash & Equivalents', value: 15, color: '#94a3b8' },
    ],
    ytdReturn: 5.8,
    annualReturn: 6.2,
  },
  {
    name: 'UIG Balanced Growth',
    risk: 'Medium',
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
  },
  {
    name: 'UIG Aggressive Alpha',
    risk: 'High',
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

export default function Investments() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Tables<'accounts'>[]>([]);
  const [loading, setLoading] = useState(true);
  const hasInvestmentAccount = accounts.some(a => a.account_type === 'investment');

  useEffect(() => {
    if (!session?.user?.id) return;
    supabase.from('accounts').select('*').eq('user_id', session.user.id).then(({ data }) => {
      setAccounts(data || []);
      setLoading(false);
    });
  }, [session?.user?.id]);

  const investmentAccount = accounts.find(a => a.account_type === 'investment');

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
          {hasInvestmentAccount && investmentAccount && (
            <CardContent>
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
            </CardContent>
          )}
          {!hasInvestmentAccount && !loading && (
            <CardContent>
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">Open an investment account to start building your portfolio.</p>
                <Button onClick={() => navigate('/dashboard/accounts')}>
                  Open Investment Account
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        <Tabs defaultValue="portfolios" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="portfolios"><PieChart className="h-4 w-4 mr-1" /> Portfolios</TabsTrigger>
            <TabsTrigger value="performance"><TrendingUp className="h-4 w-4 mr-1" /> Performance</TabsTrigger>
            <TabsTrigger value="learn"><Zap className="h-4 w-4 mr-1" /> Learn</TabsTrigger>
          </TabsList>

          {/* Model Portfolios */}
          <TabsContent value="portfolios">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {MODEL_PORTFOLIOS.map((portfolio) => (
                <Card key={portfolio.name} className="relative overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{portfolio.name}</CardTitle>
                      <Badge variant={portfolio.risk === 'Low' ? 'secondary' : portfolio.risk === 'Medium' ? 'default' : 'destructive'}>
                        {portfolio.risk} Risk
                      </Badge>
                    </div>
                    <CardDescription>{portfolio.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPie>
                          <Pie
                            data={portfolio.allocation}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={60}
                            paddingAngle={3}
                            dataKey="value"
                          >
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
                        <p className="text-lg font-bold text-green-500">+{portfolio.ytdReturn}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Annual Avg</p>
                        <p className="text-lg font-bold text-green-500">+{portfolio.annualReturn}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 30%, 18%)" />
                      <XAxis dataKey="month" stroke="hsl(220, 15%, 55%)" />
                      <YAxis stroke="hsl(220, 15%, 55%)" domain={['dataMin - 2', 'dataMax + 2']} />
                      <Tooltip
                        contentStyle={{ background: 'hsl(220, 42%, 10%)', border: '1px solid hsl(220, 30%, 18%)', borderRadius: '8px' }}
                        labelStyle={{ color: 'hsl(210, 20%, 95%)' }}
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

          {/* Learn Tab */}
          <TabsContent value="learn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: Shield, title: 'Risk Management', desc: 'Learn how UIG portfolios are designed to manage downside risk while capturing upside potential.' },
                { icon: Globe, title: 'Global Diversification', desc: 'Why investing across geographies and asset classes reduces volatility and improves returns.' },
                { icon: DollarSign, title: 'Dollar-Cost Averaging', desc: 'How recurring investments smooth out market timing risk and build wealth consistently.' },
                { icon: BarChart3, title: 'Tax-Efficient Investing', desc: 'Strategies to minimize your tax burden through smart asset location and harvesting.' },
              ].map((item) => (
                <Card key={item.title} className="hover:border-primary/30 transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-base">{item.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
