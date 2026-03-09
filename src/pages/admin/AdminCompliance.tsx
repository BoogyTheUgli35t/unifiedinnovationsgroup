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
import { FileText, Check, X, ExternalLink, User } from 'lucide-react';

export default function AdminCompliance() {
  const [docs, setDocs] = useState<(Tables<'kyc_documents'> & { profile_email?: string; profile_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; docId: string; action: 'approve' | 'reject' }>({
    open: false, docId: '', action: 'approve',
  });
  const [actionLoading, setActionLoading] = useState(false);
  const { logAction } = useAuditLog();
  const { toast } = useToast();

  const fetchDocs = async () => {
    const { data } = await supabase.from('kyc_documents').select('*').order('created_at', { ascending: false });
    if (data) {
      // Fetch profile info for each unique user
      const userIds = [...new Set(data.map(d => d.user_id))];
      const { data: profiles } = await supabase.from('profiles').select('user_id, email, full_name').in('user_id', userIds);
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      setDocs(data.map(d => ({
        ...d,
        profile_email: profileMap.get(d.user_id)?.email,
        profile_name: profileMap.get(d.user_id)?.full_name || undefined,
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchDocs(); }, []);

  const viewDocument = async (fileUrl: string) => {
    const { data, error } = await supabase.storage.from('kyc-documents').createSignedUrl(fileUrl, 300);
    if (error || !data?.signedUrl) {
      toast({ title: 'Error', description: 'Could not load document.', variant: 'destructive' });
      return;
    }
    window.open(data.signedUrl, '_blank');
  };

  const handleAction = async (reason: string) => {
    setActionLoading(true);
    const newStatus = modal.action === 'approve' ? 'approved' : 'rejected';
    const { error } = await supabase
      .from('kyc_documents')
      .update({ status: newStatus, rejection_reason: modal.action === 'reject' ? reason : null, reviewed_at: new Date().toISOString(), reviewed_by: (await supabase.auth.getUser()).data.user?.id })
      .eq('id', modal.docId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      await logAction({ actionType: `kyc_${newStatus}`, targetType: 'kyc_document', targetId: modal.docId, reason, newValue: { status: newStatus } });
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
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{doc.profile_name || doc.profile_email || doc.user_id.slice(0, 8)}</span>
                </div>
                
                <Button size="sm" variant="outline" className="w-full" onClick={() => viewDocument(doc.file_url)}>
                  <ExternalLink className="mr-1 h-3 w-3" /> View Document
                </Button>
                
                {doc.rejection_reason && (
                  <p className="text-xs text-destructive">Rejected: {doc.rejection_reason}</p>
                )}
                
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
