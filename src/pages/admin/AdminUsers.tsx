import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Search, Eye } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState<Tables<'profiles'>[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      setUsers(data ?? []);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (s: string) => {
    switch (s) {
      case 'active': return 'default';
      case 'frozen': return 'destructive';
      case 'suspended': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <AdminLayout title="User Management" description="View and manage platform users">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading users...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>KYC</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-mono text-sm">{u.email}</TableCell>
                    <TableCell>{u.full_name || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={statusColor(u.account_status)}>{u.account_status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{u.kyc_status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/admin/users/${u.user_id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No users found
                    </TableCell>
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
