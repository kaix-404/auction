"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  Gavel,
  CreditCard,
  Wallet,
  RotateCcw,
  Truck,
  BarChart,
  Shield,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";

const ADMIN_ROLES = [
  "super_admin",
  "operations_admin",
  "finance_admin",
  "compliance_admin",
  "support_admin",
];

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/auctions", label: "Auctions", icon: Gavel },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/emd", label: "EMD Ledger", icon: Wallet },
  { href: "/admin/refunds", label: "Refunds", icon: RotateCcw },
  { href: "/admin/orders", label: "Orders", icon: Truck },
  { href: "/admin/reports", label: "Reports", icon: BarChart },
  { href: "/admin/audit", label: "Audit Log", icon: Shield },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = user && ADMIN_ROLES.includes(user.role);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [loading, isAdmin, router]);

  if (loading || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading admin panel...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link href="/admin" className="flex items-center gap-2">
          <Gavel className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">BidVerse Admin</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <div className="mb-3 flex items-center gap-3 rounded-md bg-muted px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {(user?.profile?.firstName?.[0] || user?.email?.[0] || "A").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {user?.profile?.firstName || user?.email}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="mt-0.5">
                {user?.role?.replace("_", " ") || "Admin"}
              </Badge>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex h-16 items-center justify-between border-b bg-background px-4 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <Gavel className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">BidVerse Admin</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex">
        <aside className="hidden w-64 border-r bg-background lg:block">
          <div className="sticky top-0 h-screen">{SidebarContent}</div>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="absolute left-0 top-0 h-full w-64 bg-background shadow-xl">
              {SidebarContent}
            </aside>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
