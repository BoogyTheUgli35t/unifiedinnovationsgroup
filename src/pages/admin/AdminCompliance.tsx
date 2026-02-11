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
import { FileText, Check, X } from 'lucide-react';

export default function AdminCompliance() {
  const [docs, setDocs] = useState<Tables<'kyc_documents'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; docId: string; action: 'approve' | 'reject' }>({
    open: false, docId: '', action: 'approve',
  });
  const [actionLoading, setActionLoading] = useState(false);
  const { logAction } = useAuditLog();
  const { toast } = useToast();

  const fetchDocs = async () => {
    const { data } = await supabase.from('kyc_documents').select('*').order('created_at', { ascending: false });
    setDocs(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleAction = async (reason: string) => {
    setActionLoading(true);
    const newStatus = modal.action === 'approve' ? 'approved' : 'rejected';

    const { error } = await supabase
      .from('kyc_documents')
      .update({ status: newStatus, rejection_reason: modal.action === 'reject' ? reason : null })
      .eq('id', modal.docId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      await logAction({
        actionType: `kyc_${newStatus}`,
        targetType: 'kyc_document',
        targetId: modal.docId,
        reason,
        newValue: { status: newStatus },
      });
      toast({ title: 'Success', description: `Document ${newStatus}` });
      fetchDocs();
    }
    setActionLoading(false);
    setModal({ open: false, docId: '', action: 'approve' });
  };

  return (
    <AdminLayout title="Compliance" description="KYC document review queue">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-muted-foreground col-span-full text-center py-8">Loading...</p>
        ) : docs.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-8">No documents to review</p>
        ) : (
          docs.map((doc) => (
            <Card key={doc.id}>
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <CardTitle className="text-sm capitalize">{doc.document_type.replace('_', ' ')}</CardTitle>
                  <p className="text-xs text-muted-foreground">{new Date(doc.created_at).toLocaleDateString()}</p>
                </div>
                <Badge variant={doc.status === 'pending' ? 'secondary' : doc.status === 'approved' ? 'default' : 'destructive'}>
                  {doc.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3 truncate">User: {doc.user_id}</p>
                {doc.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={() => setModal({ open: true, docId: doc.id, action: 'approve' })}>
                      <Check className="mr-1 h-3 w-3" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" className="flex-1" onClick={() => setModal({ open: true, docId: doc.id, action: 'reject' })}>
                      <X className="mr-1 h-3 w-3" /> Reject
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
        title={modal.action === 'approve' ? 'Approve Document' : 'Reject Document'}
        description="A reason is required for all compliance decisions."
        actionLabel={modal.action === 'approve' ? 'Approve' : 'Reject'}
        variant={modal.action === 'approve' ? 'default' : 'destructive'}
        onConfirm={handleAction}
        isLoading={actionLoading}
      />
    </AdminLayout>
  );
}
