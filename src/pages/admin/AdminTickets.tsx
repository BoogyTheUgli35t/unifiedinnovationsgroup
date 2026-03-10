import { useEffect, useState, useRef } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ActionReasonModal } from '@/components/admin/ActionReasonModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { MessageSquare, Send, X, Bot, User } from 'lucide-react';

interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
}

export default function AdminTickets() {
  const { session } = useAuth();
  const [tickets, setTickets] = useState<Tables<'support_tickets'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; ticketId: string; newStatus: string }>({ open: false, ticketId: '', newStatus: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const { logAction } = useAuditLog();
  const { toast } = useToast();

  // Messaging state
  const [chatTicketId, setChatTicketId] = useState<string | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchTickets = async () => {
    const { data } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
    setTickets(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchTickets(); }, []);

  // Load messages when chat opens
  useEffect(() => {
    if (!chatTicketId) return;
    const loadMessages = async () => {
      const { data } = await supabase.from('ticket_messages').select('*').eq('ticket_id', chatTicketId).order('created_at', { ascending: true });
      setMessages((data as any) || []);
    };
    loadMessages();

    const channel = supabase.channel(`admin-ticket-${chatTicketId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket_messages', filter: `ticket_id=eq.${chatTicketId}` }, (payload) => {
        setMessages(prev => [...prev, payload.new as TicketMessage]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [chatTicketId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatTicketId || !session?.user?.id) return;
    setSending(true);
    const { error } = await supabase.from('ticket_messages').insert({
      ticket_id: chatTicketId,
      sender_id: session.user.id,
      message: newMessage.trim(),
      is_admin: true,
    } as any);
    if (!error) setNewMessage('');
    setSending(false);
  };

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

  const chatTicket = tickets.find(t => t.id === chatTicketId);

  return (
    <AdminLayout title="Support Tickets" description="Manage customer support requests">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Table */}
        <Card className={chatTicketId ? 'lg:col-span-2' : 'lg:col-span-3'}>
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
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((t) => (
                    <TableRow key={t.id} className={chatTicketId === t.id ? 'bg-primary/5' : ''}>
                      <TableCell className="font-mono text-sm">{t.ticket_number}</TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">{t.subject}</TableCell>
                      <TableCell><Badge variant={priorityColor(t.priority)}>{t.priority}</Badge></TableCell>
                      <TableCell><Badge variant="outline">{t.status}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setChatTicketId(chatTicketId === t.id ? null : t.id)}>
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          {t.status !== 'closed' && (
                            <Select onValueChange={(v) => setModal({ open: true, ticketId: t.id, newStatus: v })} value="">
                              <SelectTrigger className="h-8 w-28 text-xs"><SelectValue placeholder="Update" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {tickets.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No tickets</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Chat Panel */}
        {chatTicketId && (
          <Card className="lg:col-span-1 flex flex-col h-[600px]">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">{chatTicket?.subject}</CardTitle>
                  <CardDescription className="text-xs">{chatTicket?.ticket_number}</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setChatTicketId(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
              {/* Original description */}
              <div className="flex gap-2 justify-start">
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center mt-1 shrink-0">
                  <User className="h-3 w-3" />
                </div>
                <div className="max-w-[85%] rounded-lg px-3 py-2 text-xs bg-muted">
                  <p className="font-medium mb-1">Original Request:</p>
                  {chatTicket?.description}
                </div>
              </div>

              {messages.map(m => (
                <div key={m.id} className={`flex gap-2 ${m.is_admin ? 'justify-end' : 'justify-start'}`}>
                  {!m.is_admin && (
                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center mt-1 shrink-0">
                      <User className="h-3 w-3" />
                    </div>
                  )}
                  <div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs ${m.is_admin ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {m.message}
                    <p className={`text-[10px] mt-1 ${m.is_admin ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {m.is_admin && (
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-1 shrink-0">
                      <Bot className="h-3 w-3 text-primary" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-3 border-t">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Reply to user..." disabled={sending} className="flex-1 text-sm h-8" />
                <Button type="submit" size="icon" className="h-8 w-8" disabled={sending || !newMessage.trim()}>
                  <Send className="h-3 w-3" />
                </Button>
              </form>
            </div>
          </Card>
        )}
      </div>

      <ActionReasonModal open={modal.open} onOpenChange={(o) => setModal(p => ({ ...p, open: o }))} title="Update Ticket Status" description={`Changing ticket status to "${modal.newStatus}".`} actionLabel="Update" onConfirm={handleStatusChange} isLoading={actionLoading} />
    </AdminLayout>
  );
}
