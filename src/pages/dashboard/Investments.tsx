import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Investments() {
  return (
    <DashboardLayout
      title="Investments"
      description="Manage your investment portfolio"
    >
      <Card>
        <CardHeader>
          <CardTitle>Investment Holdings</CardTitle>
          <CardDescription>Your investment portfolio will appear here</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-8">
          <p>No investment data available yet. Contact support to set up your investment account.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
