import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, ArrowUpRight, ArrowDownLeft, Send, Download, ShoppingCart, DollarSign } from 'lucide-react';

const CRYPTO_ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin', price: 67432.50 },
  { symbol: 'ETH', name: 'Ethereum', price: 3521.80 },
  { symbol: 'SOL', name: 'Solana', price: 142.65 },
  { symbol: 'ADA', name: 'Cardano', price: 0.62 },
  { symbol: 'USDC', name: 'USD Coin', price: 1.00 },
  { symbol: 'XRP', name: 'Ripple', price: 2.18 },
  { symbol: 'DOGE', name: 'Dogecoin', price: 0.185 },
  { symbol: 'LINK', name: 'Chainlink', price: 18.42 },
];

export default function Crypto() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [holdings, setHoldings] = useState<Tables<'crypto_holdings'>[]>([]);
  const [accounts, setAccounts] = useState<Tables<'accounts'>[]>([]);
  const [transactions, setTransactions] = useState<Tables<'transactions'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Trade form
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [selectedAsset, setSelectedAsset] = useState('');
  const [amount, setAmount] = useState('');
  const [fromAccount, setFromAccount] = useState('');

  // Send/Receive
  const [sendAsset, setSendAsset] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');

  useEffect(() => {
    if (!session?.user?.id) return;
    const load = async () => {
      const [hRes, aRes, tRes] = await Promise.all([
        supabase.from('crypto_holdings').select('*').eq('user_id', session.user.id),
        supabase.from('accounts').select('*').eq('user_id', session.user.id).eq('status', 'active'),
        supabase.from('transactions').select('*').eq('user_id', session.user.id).in('type', ['crypto_buy', 'crypto_sell']).order('created_at', { ascending: false }).limit(20),
      ]);
      setHoldings(hRes.data || []);
      setAccounts(aRes.data || []);
      setTransactions(tRes.data || []);
      setLoading(false);
    };
    load();
  }, [session?.user?.id]);

  const totalValue = holdings.reduce((sum, h) => {
    const asset = CRYPTO_ASSETS.find(a => a.symbol === h.symbol);
    return sum + (Number(h.quantity) * (asset?.price || Number(h.average_cost)));
  }, 0);

  const handleTrade = async () => {
    if (!selectedAsset || !amount || !fromAccount || !session?.user?.id) {
      toast({ title: 'Missing fields', variant: 'destructive' });
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({ title: 'Invalid amount', variant: 'destructive' });
      return;
    }

    const asset = CRYPTO_ASSETS.find(a => a.symbol === selectedAsset);
    if (!asset) return;

    const totalCost = numAmount * asset.price;
    const account = accounts.find(a => a.id === fromAccount);

    if (tradeType === 'buy' && account && totalCost > Number(account.balance)) {
      toast({ title: 'Insufficient funds', description: `You need $${totalCost.toLocaleString()} but only have $${Number(account.balance).toLocaleString()}`, variant: 'destructive' });
      return;
    }

    if (tradeType === 'sell') {
      const holding = holdings.find(h => h.symbol === selectedAsset);
      if (!holding || Number(holding.quantity) < numAmount) {
        toast({ title: 'Insufficient holdings', variant: 'destructive' });
        return;
      }
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('transactions').insert({
        user_id: session.user.id,
        account_id: fromAccount,
        type: tradeType === 'buy' ? 'crypto_buy' : 'crypto_sell',
        amount: totalCost,
        counterparty: `${asset.name} (${asset.symbol})`,
        description: `${tradeType === 'buy' ? 'Bought' : 'Sold'} ${numAmount} ${asset.symbol} @ $${asset.price.toLocaleString()}`,
        requires_approval: totalCost >= 10000,
        status: 'pending',
      });
      if (error) throw error;
      toast({ title: `${tradeType === 'buy' ? 'Buy' : 'Sell'} order submitted`, description: totalCost >= 10000 ? 'Requires admin approval.' : 'Processing your order.' });
      setAmount('');
      setSelectedAsset('');
      // Refresh transactions
      const { data } = await supabase.from('transactions').select('*').eq('user_id', session.user.id).in('type', ['crypto_buy', 'crypto_sell']).order('created_at', { ascending: false }).limit(20);
      setTransactions(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSend = async () => {
    if (!sendAsset || !sendAmount || !recipientAddress || !session?.user?.id) {
      toast({ title: 'Missing fields', variant: 'destructive' });
      return;
    }
    const holding = holdings.find(h => h.symbol === sendAsset);
    if (!holding || Number(holding.quantity) < parseFloat(sendAmount)) {
      toast({ title: 'Insufficient holdings', variant: 'destructive' });
      return;
    }
    const cryptoAccount = accounts.find(a => a.account_type === 'crypto');
    if (!cryptoAccount) {
      toast({ title: 'No crypto account', description: 'Please open a crypto account first.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const asset = CRYPTO_ASSETS.find(a => a.symbol === sendAsset);
      const value = parseFloat(sendAmount) * (asset?.price || 0);
      const { error } = await supabase.from('transactions').insert({
        user_id: session.user.id,
        account_id: cryptoAccount.id,
        type: 'crypto_sell',
        amount: value,
        counterparty: recipientAddress,
        description: `Sent ${sendAmount} ${sendAsset} to ${recipientAddress.slice(0, 8)}...`,
        requires_approval: value >= 10000,
        status: 'pending',
      });
      if (error) throw error;
      toast({ title: 'Send submitted', description: 'Your crypto transfer is being processed.' });
      setSendAmount('');
      setRecipientAddress('');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPrice = CRYPTO_ASSETS.find(a => a.symbol === selectedAsset)?.price || 0;
  const estimatedTotal = parseFloat(amount || '0') * selectedPrice;

  return (
    <DashboardLayout title="Crypto Portfolio" description="Buy, sell, send, and receive cryptocurrency">
      <div className="space-y-6">
        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Portfolio Value</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Assets Held</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{holdings.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Recent Trades</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{transactions.length}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="trade" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="trade"><ShoppingCart className="h-4 w-4 mr-1" /> Buy / Sell</TabsTrigger>
            <TabsTrigger value="send"><Send className="h-4 w-4 mr-1" /> Send</TabsTrigger>
            <TabsTrigger value="receive"><Download className="h-4 w-4 mr-1" /> Receive</TabsTrigger>
            <TabsTrigger value="holdings"><TrendingUp className="h-4 w-4 mr-1" /> Holdings</TabsTrigger>
          </TabsList>

          {/* Buy / Sell Tab */}
          <TabsContent value="trade">
            <Card>
              <CardHeader>
                <CardTitle>Trade Crypto</CardTitle>
                <CardDescription>Buy or sell cryptocurrency with your linked accounts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button variant={tradeType === 'buy' ? 'default' : 'outline'} onClick={() => setTradeType('buy')} className="flex-1">
                    <ArrowDownLeft className="mr-2 h-4 w-4" /> Buy
                  </Button>
                  <Button variant={tradeType === 'sell' ? 'default' : 'outline'} onClick={() => setTradeType('sell')} className="flex-1">
                    <ArrowUpRight className="mr-2 h-4 w-4" /> Sell
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Asset</Label>
                    <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                      <SelectTrigger><SelectValue placeholder="Select crypto" /></SelectTrigger>
                      <SelectContent>
                        {CRYPTO_ASSETS.map(a => (
                          <SelectItem key={a.symbol} value={a.symbol}>
                            {a.name} ({a.symbol}) — ${a.price.toLocaleString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{tradeType === 'buy' ? 'Pay From' : 'Deposit To'}</Label>
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
                </div>

                <div className="space-y-2">
                  <Label>Quantity ({selectedAsset || 'coins'})</Label>
                  <Input type="number" placeholder="0.00" min="0.0001" step="0.0001" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>

                {selectedAsset && amount && (
                  <div className="rounded-lg bg-muted p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Price per {selectedAsset}:</span>
                      <span>${selectedPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Estimated Total:</span>
                      <span>${estimatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                )}

                <Button onClick={handleTrade} disabled={submitting || !selectedAsset || !amount || !fromAccount} className="w-full">
                  {submitting ? 'Processing...' : `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${selectedAsset || 'Crypto'}`}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Send Tab */}
          <TabsContent value="send">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Send className="h-5 w-5" /> Send Crypto</CardTitle>
                <CardDescription>Transfer cryptocurrency to an external wallet address</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Asset to Send</Label>
                  <Select value={sendAsset} onValueChange={setSendAsset}>
                    <SelectTrigger><SelectValue placeholder="Select asset" /></SelectTrigger>
                    <SelectContent>
                      {holdings.map(h => (
                        <SelectItem key={h.symbol} value={h.symbol}>
                          {h.name} ({h.symbol}) — {Number(h.quantity).toLocaleString()} available
                        </SelectItem>
                      ))}
                      {holdings.length === 0 && (
                        <SelectItem value="_none" disabled>No holdings available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input type="number" placeholder="0.00" value={sendAmount} onChange={(e) => setSendAmount(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Recipient Wallet Address</Label>
                  <Input placeholder="0x... or bc1..." value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)} />
                </div>
                <Button onClick={handleSend} disabled={submitting || !sendAsset || !sendAmount || !recipientAddress} className="w-full">
                  {submitting ? 'Sending...' : 'Send Crypto'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Receive Tab */}
          <TabsContent value="receive">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Download className="h-5 w-5" /> Receive Crypto</CardTitle>
                <CardDescription>Share your wallet address to receive cryptocurrency</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {accounts.filter(a => a.account_type === 'crypto').length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <p>Please open a crypto account first to receive cryptocurrency.</p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-lg bg-muted p-6 text-center space-y-3">
                      <p className="text-sm text-muted-foreground">Your UIG Crypto Wallet Address</p>
                      <p className="font-mono text-sm break-all bg-background p-3 rounded border">
                        {`0x${session?.user?.id?.replace(/-/g, '').slice(0, 40)}`}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(`0x${session?.user?.id?.replace(/-/g, '').slice(0, 40)}`);
                          toast({ title: 'Copied!', description: 'Wallet address copied to clipboard.' });
                        }}
                      >
                        Copy Address
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• Share this address with the sender</p>
                      <p>• Supported assets: BTC, ETH, SOL, ADA, USDC, XRP, DOGE, LINK</p>
                      <p>• Deposits will appear after network confirmation</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Holdings Tab */}
          <TabsContent value="holdings">
            {loading ? (
              <div className="text-center text-muted-foreground py-8">Loading...</div>
            ) : holdings.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                  <p>No crypto holdings yet. Use the Buy tab to get started!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {holdings.map((h) => {
                  const asset = CRYPTO_ASSETS.find(a => a.symbol === h.symbol);
                  const currentPrice = asset?.price || Number(h.average_cost);
                  const currentValue = Number(h.quantity) * currentPrice;
                  const costBasis = Number(h.quantity) * Number(h.average_cost);
                  const pnl = currentValue - costBasis;
                  const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

                  return (
                    <Card key={h.id}>
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="font-bold text-sm text-primary">{h.symbol.slice(0, 2)}</span>
                            </div>
                            <div>
                              <p className="font-semibold">{h.name}</p>
                              <p className="text-sm text-muted-foreground">{Number(h.quantity).toLocaleString()} {h.symbol}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                            <p className={`text-sm font-medium ${pnl >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                              {pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Recent Crypto Transactions */}
                {transactions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Recent Crypto Trades</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {transactions.slice(0, 5).map(tx => (
                          <div key={tx.id} className="flex items-center justify-between p-2 rounded border">
                            <div className="flex items-center gap-2">
                              {tx.type === 'crypto_buy' ? <ArrowDownLeft className="h-4 w-4 text-green-500" /> : <ArrowUpRight className="h-4 w-4 text-destructive" />}
                              <div>
                                <p className="text-sm font-medium">{tx.counterparty}</p>
                                <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold">${Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                              <Badge variant="outline" className="text-xs">{tx.status}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
