import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { LifeBuoy, Plus, Clock, CheckCircle } from 'lucide-react';

export default function SupportTickets() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Tables<'support_tickets'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');

  const fetchTickets = async () => {
    if (!session?.user?.id) return;
    const { data } = await supabase.from('support_tickets').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
    setTickets(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchTickets(); }, [session?.user?.id]);

  const handleSubmit = async () => {
    if (!subject || !description || !session?.user?.id) {
      toast({ title: 'Missing fields', description: 'Please fill in subject and description.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const ticketNum = 'TKT-' + Date.now().toString().slice(-10);
    const { error } = await supabase.from('support_tickets').insert({
      user_id: session.user.id,
      subject,
      description,
      priority: priority as Tables<'support_tickets'>['priority'],
      ticket_number: ticketNum,
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Ticket submitted', description: 'Our team will get back to you soon.' });
      setSubject('');
      setDescription('');
      setPriority('medium');
      fetchTickets();
    }
    setSubmitting(false);
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      open: { variant: 'secondary', label: 'Open' },
      in_progress: { variant: 'default', label: 'In Progress' },
      resolved: { variant: 'outline', label: 'Resolved' },
      closed: { variant: 'outline', label: 'Closed' },
    };
    const c = map[status] || { variant: 'outline' as const, label: status };
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  return (
    <DashboardLayout title="Support" description="Submit and track support tickets">
      <Tabs defaultValue="new" className="space-y-6">
        <TabsList>
          <TabsTrigger value="new">New Ticket</TabsTrigger>
          <TabsTrigger value="my">My Tickets ({tickets.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> Submit a Ticket</CardTitle>
              <CardDescription>Describe your issue and our team will assist you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief description of your issue" />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide details about your issue..." rows={5} />
              </div>
              <Button onClick={handleSubmit} disabled={submitting || !subject || !description} className="w-full">
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : tickets.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <LifeBuoy className="h-8 w-8 mx-auto mb-2" />
                <p>No support tickets yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {tickets.map((t) => (
                <Card key={t.id}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{t.subject}</p>
                          {statusBadge(t.status)}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{t.description}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="font-mono">{t.ticket_number}</span>
                          <span>{new Date(t.created_at).toLocaleDateString()}</span>
                          <Badge variant="outline" className="text-xs capitalize">{t.priority}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
