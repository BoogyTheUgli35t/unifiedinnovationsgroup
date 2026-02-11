import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export default function AdminCrypto() {
  const [holdings, setHoldings] = useState<Tables<'crypto_holdings'>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('crypto_holdings').select('*').order('created_at', { ascending: false });
      setHoldings(data ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <AdminLayout title="Crypto Overview" description="Platform-wide crypto holdings">
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Avg Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holdings.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="font-mono text-xs">{h.user_id.slice(0, 8)}...</TableCell>
                    <TableCell className="font-bold">{h.symbol}</TableCell>
                    <TableCell>{h.name}</TableCell>
                    <TableCell>{Number(h.quantity).toLocaleString()}</TableCell>
                    <TableCell>${Number(h.average_cost).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                {holdings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No crypto holdings</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
