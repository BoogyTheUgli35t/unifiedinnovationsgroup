import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ActionReasonModal } from '@/components/admin/ActionReasonModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export default function AdminAlerts() {
  const [alerts, setAlerts] = useState<Tables<'fraud_alerts'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; alertId: string; action: 'resolve' | 'false_positive' }>({
    open: false, alertId: '', action: 'resolve',
  });
  const [actionLoading, setActionLoading] = useState(false);
  const { logAction } = useAuditLog();
  const { toast } = useToast();

  const fetchAlerts = async () => {
    const { data } = await supabase.from('fraud_alerts').select('*').order('created_at', { ascending: false });
    setAlerts(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchAlerts(); }, []);

  const handleAction = async (reason: string) => {
    setActionLoading(true);
    const newStatus = modal.action === 'resolve' ? 'resolved' : 'false_positive';

    const { error } = await supabase
      .from('fraud_alerts')
      .update({ status: newStatus, resolution_notes: reason })
      .eq('id', modal.alertId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      await logAction({
        actionType: `alert_${newStatus}`,
        targetType: 'fraud_alert',
        targetId: modal.alertId,
        reason,
        newValue: { status: newStatus },
      });
      toast({ title: 'Success', description: `Alert marked as ${newStatus.replace('_', ' ')}` });
      fetchAlerts();
    }
    setActionLoading(false);
    setModal({ open: false, alertId: '', action: 'resolve' });
  };

  const severityColor = (s: string) => {
    switch (s) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <AdminLayout title="Fraud Alerts" description="Monitor and resolve security alerts">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-muted-foreground col-span-full text-center py-8">Loading...</p>
        ) : alerts.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-8">No alerts</p>
        ) : (
          alerts.map((alert) => (
            <Card key={alert.id}>
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div className="flex-1">
                  <CardTitle className="text-sm">{alert.alert_type}</CardTitle>
                  <p className="text-xs text-muted-foreground">{new Date(alert.created_at).toLocaleString()}</p>
                </div>
                <Badge variant={severityColor(alert.severity)}>{alert.severity}</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{alert.description}</p>
                <Badge variant="outline" className="mb-3">{alert.status}</Badge>
                {(alert.status === 'new' || alert.status === 'investigating') && (
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={() => setModal({ open: true, alertId: alert.id, action: 'resolve' })}>
                      <CheckCircle className="mr-1 h-3 w-3" /> Resolve
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => setModal({ open: true, alertId: alert.id, action: 'false_positive' })}>
                      False Positive
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ActionReasonModal
        open={modal.open}
        onOpenChange={(o) => setModal((p) => ({ ...p, open: o }))}
        title={modal.action === 'resolve' ? 'Resolve Alert' : 'Mark as False Positive'}
        description="A reason is required for all alert resolutions."
        actionLabel={modal.action === 'resolve' ? 'Resolve' : 'Mark False Positive'}
        onConfirm={handleAction}
        isLoading={actionLoading}
      />
    </AdminLayout>
  );
}
