import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export default function AdminTickets() {
  const [tickets, setTickets] = useState<Tables<'support_tickets'>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
      setTickets(data ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  const priorityColor = (p: string) => {
    switch (p) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <AdminLayout title="Support Tickets" description="Manage customer support requests">
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket #</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-sm">{t.ticket_number}</TableCell>
                    <TableCell>{t.subject}</TableCell>
                    <TableCell><Badge variant={priorityColor(t.priority)}>{t.priority}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{t.status}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {tickets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No tickets</TableCell>
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
