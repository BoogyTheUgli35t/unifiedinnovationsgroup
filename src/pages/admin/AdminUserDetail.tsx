import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ActionReasonModal } from '@/components/admin/ActionReasonModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { ShieldAlert, ShieldCheck, Check, X, FileText, ExternalLink, Download } from 'lucide-react';

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Tables<'profiles'> | null>(null);
  const [accounts, setAccounts] = useState<Tables<'accounts'>[]>([]);
  const [transactions, setTransactions] = useState<Tables<'transactions'>[]>([]);
  const [kycDocs, setKycDocs] = useState<Tables<'kyc_documents'>[]>([]);
  const [freezeOpen, setFreezeOpen] = useState(false);
  const [kycModal, setKycModal] = useState<{ open: boolean; docId: string; action: 'approve' | 'reject' }>({ open: false, docId: '', action: 'approve' });
  const [statusModal, setStatusModal] = useState<{ open: boolean; newStatus: string }>({ open: false, newStatus: '' });
  const [kycStatusModal, setKycStatusModal] = useState<{ open: boolean; newStatus: string }>({ open: false, newStatus: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const { logAction } = useAuditLog();
  const { toast } = useToast();

  const loadData = async () => {
    if (!id) return;
    const [pRes, aRes, tRes, dRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', id).single(),
      supabase.from('accounts').select('*').eq('user_id', id),
      supabase.from('transactions').select('*').eq('user_id', id).order('created_at', { ascending: false }).limit(20),
      supabase.from('kyc_documents').select('*').eq('user_id', id).order('created_at', { ascending: false }),
    ]);
    setProfile(pRes.data);
    setAccounts(aRes.data ?? []);
    setTransactions(tRes.data ?? []);
    setKycDocs(dRes.data ?? []);
  };

  useEffect(() => { loadData(); }, [id]);

  const isFrozen = profile?.account_status === 'frozen';

  const handleToggleFreeze = async (reason: string) => {
    if (!profile || !id) return;
    setActionLoading(true);
    const newStatus = isFrozen ? 'active' : 'frozen';
    const { error } = await supabase.from('profiles').update({ account_status: newStatus }).eq('user_id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      await logAction({ actionType: isFrozen ? 'account_unfrozen' : 'account_frozen', targetType: 'profile', targetId: id, reason, oldValue: { account_status: profile.account_status }, newValue: { account_status: newStatus } });
      setProfile({ ...profile, account_status: newStatus });
      toast({ title: 'Success', description: `Account ${newStatus}` });
    }
    setActionLoading(false);
    setFreezeOpen(false);
  };

  const handleUpdateAccountStatus = async (reason: string) => {
    if (!profile || !id) return;
    setActionLoading(true);
    const { error } = await supabase.from('profiles').update({ account_status: statusModal.newStatus as Tables<'profiles'>['account_status'] }).eq('user_id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      await logAction({ actionType: 'account_status_changed', targetType: 'profile', targetId: id, reason, oldValue: { account_status: profile.account_status }, newValue: { account_status: statusModal.newStatus } });
      setProfile({ ...profile, account_status: statusModal.newStatus as Tables<'profiles'>['account_status'] });
      toast({ title: 'Success', description: `Account status updated to ${statusModal.newStatus}` });
    }
    setActionLoading(false);
    setStatusModal({ open: false, newStatus: '' });
  };

  const handleUpdateKycStatus = async (reason: string) => {
    if (!profile || !id) return;
    setActionLoading(true);
    const { error } = await supabase.from('profiles').update({ kyc_status: kycStatusModal.newStatus as Tables<'profiles'>['kyc_status'] }).eq('user_id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      await logAction({ actionType: 'kyc_status_changed', targetType: 'profile', targetId: id, reason, oldValue: { kyc_status: profile.kyc_status }, newValue: { kyc_status: kycStatusModal.newStatus } });
      setProfile({ ...profile, kyc_status: kycStatusModal.newStatus as Tables<'profiles'>['kyc_status'] });
      toast({ title: 'Success', description: `KYC status updated to ${kycStatusModal.newStatus}` });
    }
    setActionLoading(false);
    setKycStatusModal({ open: false, newStatus: '' });
  };

  const handleKycDocAction = async (reason: string) => {
    setActionLoading(true);
    const newStatus = kycModal.action === 'approve' ? 'approved' : 'rejected';
    const { error } = await supabase.from('kyc_documents').update({ status: newStatus, rejection_reason: kycModal.action === 'reject' ? reason : null, reviewed_at: new Date().toISOString(), reviewed_by: (await supabase.auth.getUser()).data.user?.id }).eq('id', kycModal.docId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      await logAction({ actionType: `kyc_doc_${newStatus}`, targetType: 'kyc_document', targetId: kycModal.docId, reason, newValue: { status: newStatus } });
      toast({ title: 'Success', description: `Document ${newStatus}` });
      loadData();
    }
    setActionLoading(false);
    setKycModal({ open: false, docId: '', action: 'approve' });
  };

  const viewDocument = async (fileUrl: string) => {
    const { data, error } = await supabase.storage.from('kyc-documents').createSignedUrl(fileUrl, 300);
    if (error || !data?.signedUrl) {
      toast({ title: 'Error', description: 'Could not load document. ' + (error?.message || ''), variant: 'destructive' });
      return;
    }
    window.open(data.signedUrl, '_blank');
  };

  if (!profile) {
    return <AdminLayout title="User Detail"><p className="text-muted-foreground">Loading...</p></AdminLayout>;
  }

  return (
    <AdminLayout title={profile.full_name || profile.email} description="User detail view">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Info */}
        <Card className="md:col-span-1">
          <CardHeader><CardTitle className="text-lg">Profile</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div><span className="text-muted-foreground">Email:</span> {profile.email}</div>
            <div><span className="text-muted-foreground">Name:</span> {profile.full_name || '—'}</div>
            <div><span className="text-muted-foreground">Phone:</span> {profile.phone || '—'}</div>
            <div><span className="text-muted-foreground">DOB:</span> {profile.date_of_birth || '—'}</div>
            <div><span className="text-muted-foreground">Address:</span> {[profile.address_line1, profile.city, profile.state, profile.zip_code].filter(Boolean).join(', ') || '—'}</div>
            <div><span className="text-muted-foreground">Employment:</span> {profile.employment_status || '—'}</div>
            <div><span className="text-muted-foreground">Income:</span> {profile.annual_income_range?.replace('_', '-') || '—'}</div>

            <div className="pt-2 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Account Status:</span>
                <Badge variant={isFrozen ? 'destructive' : 'default'}>{profile.account_status}</Badge>
              </div>
              <Select onValueChange={(v) => setStatusModal({ open: true, newStatus: v })} value="">
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Change status..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="frozen">Frozen</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending_verification">Pending Verification</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">KYC:</span>
                <Badge variant="outline">{profile.kyc_status}</Badge>
              </div>
              <Select onValueChange={(v) => setKycStatusModal({ open: true, newStatus: v })} value="">
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Change KYC status..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4">
              <Button variant={isFrozen ? 'default' : 'destructive'} size="sm" className="w-full" onClick={() => setFreezeOpen(true)}>
                {isFrozen ? <ShieldCheck className="mr-2 h-4 w-4" /> : <ShieldAlert className="mr-2 h-4 w-4" />}
                {isFrozen ? 'Unfreeze Account' : 'Freeze Account'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Accounts + KYC Docs */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Accounts ({accounts.length})</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Number</TableHead><TableHead>Type</TableHead><TableHead>Balance</TableHead><TableHead>Routing</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {accounts.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-mono text-sm">{a.account_number}</TableCell>
                      <TableCell className="capitalize">{a.account_type}</TableCell>
                      <TableCell>${Number(a.balance).toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-xs">{(a as any).routing_number || '—'}</TableCell>
                      <TableCell><Badge variant="outline">{a.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                  {accounts.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No accounts</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* KYC Documents with View */}
          <Card>
            <CardHeader><CardTitle className="text-lg">KYC Documents ({kycDocs.length})</CardTitle></CardHeader>
            <CardContent>
              {kycDocs.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No documents submitted</p>
              ) : (
                <div className="space-y-3">
                  {kycDocs.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium capitalize">{doc.document_type.replace('_', ' ')}</p>
                          <p className="text-xs text-muted-foreground">{new Date(doc.created_at).toLocaleDateString()}</p>
                          {doc.rejection_reason && (
                            <p className="text-xs text-destructive mt-1">Reason: {doc.rejection_reason}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => viewDocument(doc.file_url)}>
                          <ExternalLink className="mr-1 h-3 w-3" /> View
                        </Button>
                        <Badge variant={doc.status === 'pending' ? 'secondary' : doc.status === 'approved' ? 'default' : 'destructive'}>{doc.status}</Badge>
                        {doc.status === 'pending' && (
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setKycModal({ open: true, docId: doc.id, action: 'approve' })}>
                              <Check className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setKycModal({ open: true, docId: doc.id, action: 'reject' })}>
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Transactions */}
      <Card className="mt-6">
        <CardHeader><CardTitle className="text-lg">Recent Transactions</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Description</TableHead></TableRow></TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="text-sm">{new Date(t.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="capitalize">{t.type}</TableCell>
                  <TableCell>${Number(t.amount).toLocaleString()}</TableCell>
                  <TableCell><Badge variant="outline">{t.status}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{t.description || '—'}</TableCell>
                </TableRow>
              ))}
              {transactions.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No transactions</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modals */}
      <ActionReasonModal open={freezeOpen} onOpenChange={setFreezeOpen} title={isFrozen ? 'Unfreeze Account' : 'Freeze Account'} description={`This will ${isFrozen ? 'unfreeze' : 'freeze'} the account for ${profile.email}.`} actionLabel={isFrozen ? 'Unfreeze' : 'Freeze'} variant={isFrozen ? 'default' : 'destructive'} onConfirm={handleToggleFreeze} isLoading={actionLoading} />
      <ActionReasonModal open={statusModal.open} onOpenChange={(o) => setStatusModal(p => ({ ...p, open: o }))} title="Change Account Status" description={`Changing account status to "${statusModal.newStatus}".`} actionLabel="Update Status" onConfirm={handleUpdateAccountStatus} isLoading={actionLoading} />
      <ActionReasonModal open={kycStatusModal.open} onOpenChange={(o) => setKycStatusModal(p => ({ ...p, open: o }))} title="Change KYC Status" description={`Changing KYC status to "${kycStatusModal.newStatus}".`} actionLabel="Update KYC" onConfirm={handleUpdateKycStatus} isLoading={actionLoading} />
      <ActionReasonModal open={kycModal.open} onOpenChange={(o) => setKycModal(p => ({ ...p, open: o }))} title={kycModal.action === 'approve' ? 'Approve Document' : 'Reject Document'} description="Provide a reason for this compliance decision." actionLabel={kycModal.action === 'approve' ? 'Approve' : 'Reject'} variant={kycModal.action === 'approve' ? 'default' : 'destructive'} onConfirm={handleKycDocAction} isLoading={actionLoading} />
    </AdminLayout>
  );
}
