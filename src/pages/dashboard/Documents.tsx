import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { Upload, FileText, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

const DOC_TYPES = [
  { value: 'passport', label: 'Passport', desc: 'Government-issued passport (photo page)' },
  { value: 'drivers_license', label: "Driver's License", desc: 'Front and back of your license' },
  { value: 'utility_bill', label: 'Utility Bill', desc: 'Recent bill showing your name and address' },
  { value: 'bank_statement', label: 'Bank Statement', desc: 'Recent statement from another institution' },
] as const;

const STATUS_CONFIG = {
  pending: { icon: Clock, label: 'Pending Review', variant: 'secondary' as const, color: 'text-yellow-500' },
  approved: { icon: CheckCircle, label: 'Approved', variant: 'default' as const, color: 'text-green-500' },
  rejected: { icon: XCircle, label: 'Rejected', variant: 'destructive' as const, color: 'text-destructive' },
};

export default function Documents() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [docs, setDocs] = useState<Tables<'kyc_documents'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchDocs = useCallback(async () => {
    if (!session?.user?.id) return;
    const { data } = await supabase
      .from('kyc_documents')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    setDocs(data ?? []);
    setLoading(false);
  }, [session?.user?.id]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const handleUpload = async () => {
    if (!selectedFile || !docType || !session?.user?.id) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      toast({ title: 'File too large', description: 'Maximum file size is 10MB.', variant: 'destructive' });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast({ title: 'Invalid file type', description: 'Please upload a JPG, PNG, WebP, or PDF file.', variant: 'destructive' });
      return;
    }

    setUploading(true);

    const fileExt = selectedFile.name.split('.').pop();
    const filePath = `${session.user.id}/${docType}_${Date.now()}.${fileExt}`;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('kyc-documents')
      .upload(filePath, selectedFile);

    if (uploadError) {
      toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' });
      setUploading(false);
      return;
    }

    // Create document record
    const { error: insertError } = await supabase
      .from('kyc_documents')
      .insert({
        user_id: session.user.id,
        document_type: docType as Tables<'kyc_documents'>['document_type'],
        file_url: filePath,
        status: 'pending',
      });

    if (insertError) {
      toast({ title: 'Error', description: insertError.message, variant: 'destructive' });
    } else {
      toast({ title: 'Document uploaded', description: 'Your document has been submitted for review.' });
      setSelectedFile(null);
      setDocType('');
      fetchDocs();
    }
    setUploading(false);
  };

  return (
    <DashboardLayout title="Documents" description="Upload and manage your identity verification documents">
      <div className="space-y-6">
        {/* Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Document
            </CardTitle>
            <CardDescription>
              Submit identity documents for KYC verification. Accepted formats: JPG, PNG, WebP, PDF (max 10MB).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.map(dt => (
                    <SelectItem key={dt.value} value={dt.value}>
                      <div>
                        <span>{dt.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">— {dt.desc}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>File</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="kyc-file-input"
                />
                <label htmlFor="kyc-file-input" className="cursor-pointer space-y-2 block">
                  <FileText className="h-8 w-8 mx-auto text-muted-foreground" />
                  {selectedFile ? (
                    <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Click to select a file</p>
                  )}
                </label>
              </div>
            </div>

            <Button
              onClick={handleUpload}
              disabled={!docType || !selectedFile || uploading}
              className="w-full"
            >
              {uploading ? 'Uploading...' : 'Submit Document'}
            </Button>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>Submitted Documents</CardTitle>
            <CardDescription>Track the status of your verification documents</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-center py-6">Loading...</p>
            ) : docs.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <AlertTriangle className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">No documents submitted yet</p>
                <p className="text-xs text-muted-foreground">Upload a document above to begin verification</p>
              </div>
            ) : (
              <div className="space-y-3">
                {docs.map(doc => {
                  const config = STATUS_CONFIG[doc.status as keyof typeof STATUS_CONFIG];
                  const Icon = config.icon;
                  return (
                    <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${config.color}`} />
                        <div>
                          <p className="font-medium text-sm capitalize">
                            {doc.document_type.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={config.variant}>{config.label}</Badge>
                      </div>
                    </div>
                  );
                })}
                {docs.some(d => d.status === 'rejected' && d.rejection_reason) && (
                  <div className="mt-4 space-y-2">
                    {docs.filter(d => d.status === 'rejected' && d.rejection_reason).map(d => (
                      <div key={d.id} className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <p className="text-xs font-medium text-destructive">
                          {d.document_type.replace('_', ' ')} rejected:
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{d.rejection_reason}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
