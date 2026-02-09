import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export default function Crypto() {
  const { session } = useAuth();
  const [holdings, setHoldings] = useState<Tables<'crypto_holdings'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    if (!session?.user?.id) return;

    const loadHoldings = async () => {
      try {
        const { data, error } = await supabase
          .from('crypto_holdings')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setHoldings(data || []);

        const total = (data || []).reduce((sum, h) => sum + (Number(h.quantity) * Number(h.average_cost)), 0);
        setTotalValue(total);
      } catch (error) {
        console.error('Error loading crypto holdings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHoldings();
  }, [session?.user?.id]);

  return (
    <DashboardLayout
      title="Crypto Portfolio"
      description="Monitor your cryptocurrency holdings"
    >
      <div className="space-y-6">
        {holdings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Total Portfolio Value</CardTitle>
              <CardDescription>Combined value of all holdings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center text-muted-foreground">Loading holdings...</div>
        ) : holdings.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No crypto holdings yet. Contact support to set up your first crypto account.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {holdings.map((holding) => {
              const value = Number(holding.quantity) * Number(holding.average_cost);
              return (
                <Card key={holding.id}>
                  <CardHeader>
                    <CardTitle>{holding.name}</CardTitle>
                    <CardDescription>{holding.symbol}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Quantity:</span>
                        <span className="font-medium">{Number(holding.quantity).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg Cost:</span>
                        <span className="font-medium">${Number(holding.average_cost).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="pt-2 border-t flex justify-between">
                        <span className="font-medium">Total Value:</span>
                        <span className="font-bold text-lg">${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
