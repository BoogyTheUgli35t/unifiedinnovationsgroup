import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export default function Settings() {
  const { user } = useAuth();

  return (
    <DashboardLayout
      title="Settings"
      description="Manage your profile and security"
    >
      <div className="space-y-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your personal account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-foreground font-medium">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <p className="text-foreground font-medium">{user?.full_name || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p className="text-foreground font-medium">{user?.phone || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                <p className="text-foreground font-medium">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
            <CardDescription>Your current verification and account status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Account Status</label>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`h-2 w-2 rounded-full ${
                    user?.account_status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></span>
                  <p className="text-foreground font-medium capitalize">{user?.account_status}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">KYC Status</label>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`h-2 w-2 rounded-full ${
                    user?.kyc_status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></span>
                  <p className="text-foreground font-medium capitalize">{user?.kyc_status?.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Security settings and authentication</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Additional security settings and password management will be available soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
