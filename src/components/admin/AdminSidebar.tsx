import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  TrendingUp,
  ShieldCheck,
  Wallet,
  ScrollText,
  LifeBuoy,
  AlertTriangle,
  LogOut,
  ArrowLeft,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

const adminItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Users', url: '/admin/users', icon: Users },
  { title: 'Transactions', url: '/admin/transactions', icon: ArrowLeftRight },
  { title: 'Crypto', url: '/admin/crypto', icon: TrendingUp },
  { title: 'Compliance', url: '/admin/compliance', icon: ShieldCheck },
  { title: 'Funding', url: '/admin/funding', icon: Wallet },
  { title: 'Audit Logs', url: '/admin/logs', icon: ScrollText },
  { title: 'Tickets', url: '/admin/tickets', icon: LifeBuoy },
  { title: 'Alerts', url: '/admin/alerts', icon: AlertTriangle },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { user, logout } = useAuth();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Admin branding */}
        {!collapsed && (
          <div className="px-4 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-destructive/20 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Admin Portal</p>
                <p className="text-[10px] text-muted-foreground">Institutional Management</p>
              </div>
            </div>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-muted/50"
                      activeClassName="bg-muted text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <div className="space-y-2 px-2">
                <NavLink to="/dashboard" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground px-2 py-1.5">
                  <ArrowLeft className="h-3 w-3" />
                  Back to Dashboard
                </NavLink>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs font-medium text-muted-foreground">Admin</p>
                  <p className="text-sm font-semibold truncate">{user?.full_name || user?.email}</p>
                </div>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
