import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { MessageSquare, Send, Bot, User } from 'lucide-react';

interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
}

export default function Messages() {
  const { session } = useAuth();
  const [tickets, setTickets] = useState<Tables<'support_tickets'>[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    supabase.from('support_tickets').select('*').eq('user_id', session.user.id).order('updated_at', { ascending: false }).then(({ data }) => {
      setTickets(data || []);
    });
  }, [session?.user?.id]);

  useEffect(() => {
    if (!selectedTicket) return;
    const loadMessages = async () => {
      const { data } = await supabase.from('ticket_messages').select('*').eq('ticket_id', selectedTicket).order('created_at', { ascending: true });
      setMessages((data as any) || []);
    };
    loadMessages();

    // Realtime subscription
    const channel = supabase.channel(`ticket-${selectedTicket}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket_messages', filter: `ticket_id=eq.${selectedTicket}` }, (payload) => {
        setMessages(prev => [...prev, payload.new as TicketMessage]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedTicket]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket || !session?.user?.id) return;
    setSending(true);
    const { error } = await supabase.from('ticket_messages').insert({
      ticket_id: selectedTicket,
      sender_id: session.user.id,
      message: newMessage.trim(),
      is_admin: false,
    } as any);
    if (!error) setNewMessage('');
    setSending(false);
  };

  const selectedTicketData = tickets.find(t => t.id === selectedTicket);

  return (
    <DashboardLayout title="Messages" description="Direct communication with support">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-200px)] min-h-[500px]">
        {/* Ticket List */}
        <Card className="md:col-span-1 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Conversations</CardTitle>
            <CardDescription className="text-xs">Select a support ticket to message</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-2 p-3">
            {tickets.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No tickets yet. Submit one in Support.</p>
            ) : tickets.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTicket(t.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedTicket === t.id ? 'bg-primary/10 border-primary/30' : 'hover:bg-muted'}`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">{t.subject}</p>
                  <Badge variant="outline" className="text-xs ml-2 shrink-0">{t.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-mono">{t.ticket_number}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Message Thread */}
        <Card className="md:col-span-2 flex flex-col">
          {!selectedTicket ? (
            <CardContent className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Select a ticket to view messages</p>
              </div>
            </CardContent>
          ) : (
            <>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base">{selectedTicketData?.subject}</CardTitle>
                <CardDescription className="text-xs">{selectedTicketData?.ticket_number} · {selectedTicketData?.status}</CardDescription>
              </CardHeader>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Initial ticket description as first message */}
                <div className="flex gap-2 justify-end">
                  <div className="max-w-[75%] rounded-xl px-3 py-2 text-sm bg-primary text-primary-foreground">
                    {selectedTicketData?.description}
                  </div>
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1 shrink-0">
                    <User className="h-3 w-3 text-primary" />
                  </div>
                </div>

                {messages.map(m => (
                  <div key={m.id} className={`flex gap-2 ${m.is_admin ? 'justify-start' : 'justify-end'}`}>
                    {m.is_admin && (
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center mt-1 shrink-0">
                        <Bot className="h-3 w-3 text-primary" />
                      </div>
                    )}
                    <div className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${m.is_admin ? 'bg-muted text-foreground' : 'bg-primary text-primary-foreground'}`}>
                      {m.message}
                      <p className={`text-xs mt-1 ${m.is_admin ? 'text-muted-foreground' : 'text-primary-foreground/70'}`}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {!m.is_admin && (
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1 shrink-0">
                        <User className="h-3 w-3 text-primary" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-3 border-t">
                <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    disabled={sending}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
