import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ActionReasonModal } from '@/components/admin/ActionReasonModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

export default function AdminTickets() {
  const [tickets, setTickets] = useState<Tables<'support_tickets'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; ticketId: string; newStatus: string }>({ open: false, ticketId: '', newStatus: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const { logAction } = useAuditLog();
  const { toast } = useToast();

  const fetchTickets = async () => {
    const { data } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
    setTickets(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleStatusChange = async (reason: string) => {
    setActionLoading(true);
    const updates: Record<string, any> = { status: modal.newStatus };
    if (modal.newStatus === 'resolved' || modal.newStatus === 'closed') {
      updates.resolved_at = new Date().toISOString();
    }
    const { error } = await supabase.from('support_tickets').update(updates).eq('id', modal.ticketId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      await logAction({ actionType: 'ticket_status_changed', targetType: 'support_ticket', targetId: modal.ticketId, reason, newValue: { status: modal.newStatus } });
      toast({ title: 'Success', description: `Ticket updated to ${modal.newStatus}` });
      fetchTickets();
    }
    setActionLoading(false);
    setModal({ open: false, ticketId: '', newStatus: '' });
  };

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
                  <TableHead>Description</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-sm">{t.ticket_number}</TableCell>
                    <TableCell className="font-medium">{t.subject}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{t.description}</TableCell>
                    <TableCell><Badge variant={priorityColor(t.priority)}>{t.priority}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{t.status}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {t.status !== 'closed' && (
                        <Select onValueChange={(v) => setModal({ open: true, ticketId: t.id, newStatus: v })} value="">
                          <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Update..." /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {tickets.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No tickets</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <ActionReasonModal open={modal.open} onOpenChange={(o) => setModal(p => ({ ...p, open: o }))} title="Update Ticket Status" description={`Changing ticket status to "${modal.newStatus}".`} actionLabel="Update" onConfirm={handleStatusChange} isLoading={actionLoading} />
    </AdminLayout>
  );
}
