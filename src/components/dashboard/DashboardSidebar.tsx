import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  TrendingUp,
  DollarSign,
  Send,
  FileCheck,
  Settings,
  LogOut,
  ShieldCheck,
  LifeBuoy,
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

const dashboardItems = [
  { title: 'Overview', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Accounts', url: '/dashboard/accounts', icon: CreditCard },
  { title: 'Crypto', url: '/dashboard/crypto', icon: TrendingUp },
  { title: 'Investments', url: '/dashboard/investments', icon: DollarSign },
  { title: 'Transfers', url: '/dashboard/transfers', icon: Send },
  { title: 'Bill Pay', url: '/dashboard/bill-pay', icon: FileCheck },
  { title: 'Statements', url: '/dashboard/statements', icon: FileCheck },
  { title: 'Documents', url: '/dashboard/documents', icon: FileCheck },
  { title: 'Messages', url: '/dashboard/messages', icon: LifeBuoy },
  { title: 'Support', url: '/dashboard/support', icon: LifeBuoy },
  { title: 'Settings', url: '/dashboard/settings', icon: Settings },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { user, isAdmin, logout } = useAuth();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dashboardItems.map((item) => (
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

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/admin"
                      className="hover:bg-destructive/10 text-destructive"
                      activeClassName="bg-destructive/20 text-destructive font-medium"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      {!collapsed && <span>Admin Portal</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {!collapsed && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <div className="space-y-2 px-2">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs font-medium text-muted-foreground">Logged in as</p>
                  <p className="text-sm font-semibold truncate">{user?.full_name || user?.email}</p>
                </div>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
