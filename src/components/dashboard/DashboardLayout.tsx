import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from './DashboardSidebar';
import { NotificationBell } from './NotificationBell';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function DashboardLayout({ children, title, description }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar />
        <main className="flex-1 flex flex-col">
          <header className="border-b bg-background sticky top-0 z-10">
            <div className="flex items-center justify-between h-16 px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                {title && (
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                    {description && <p className="text-sm text-muted-foreground">{description}</p>}
                  </div>
                )}
              </div>
              <NotificationBell />
            </div>
          </header>
          <div className="flex-1 overflow-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
