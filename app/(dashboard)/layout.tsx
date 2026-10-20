import { AppProvider } from "@/lib/context";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <div className="app-shell">
        <Sidebar />
        <div className="main-content">
          {children}
        </div>
        <MobileNav />
      </div>
    </AppProvider>
  );
}
