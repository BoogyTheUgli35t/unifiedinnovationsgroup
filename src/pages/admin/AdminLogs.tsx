import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Search } from 'lucide-react';

export default function AdminLogs() {
  const [logs, setLogs] = useState<Tables<'audit_logs'>[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      setLogs(data ?? []);
      setLoading(false);
    };
    fetchLogs();
  }, []);

  const filtered = logs.filter(
    (l) =>
      l.action_type.toLowerCase().includes(search.toLowerCase()) ||
      l.reason.toLowerCase().includes(search.toLowerCase()) ||
      l.target_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Audit Logs" description="Immutable record of all admin actions">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Actor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="text-sm whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-sm">{l.action_type}</TableCell>
                    <TableCell className="text-sm">{l.target_type}{l.target_id ? ` / ${l.target_id.slice(0, 8)}...` : ''}</TableCell>
                    <TableCell className="text-sm max-w-xs truncate">{l.reason}</TableCell>
                    <TableCell className="font-mono text-xs">{l.actor_id.slice(0, 8)}...</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No logs found</TableCell>
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
