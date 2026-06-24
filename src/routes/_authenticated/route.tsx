import { createFileRoute, Outlet, redirect, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Sparkles, Moon, Sun, LogOut, MessageSquare, FileText, BookOpen, Settings, Menu } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthedShell,
});

const NAV = [
  { to: "/", label: "Workspace", icon: MessageSquare, exact: true },
  { to: "/meetings", label: "Meetings", icon: FileText, exact: false },
  { to: "/research", label: "Research", icon: BookOpen, exact: false },
  { to: "/settings", label: "Settings", icon: Settings, exact: false },
] as const;

function AuthedShell() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => setMounted(true), []);

  // Close mobile drawer on navigation
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");

  const NavList = ({ onItemClick }: { onItemClick?: () => void }) => (
    <nav className="flex-1 space-y-1 p-3">
      {NAV.map((item) => {
        const active = pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onItemClick}
            className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
              active ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            }`}
          >
            <item.icon className="h-4 w-4" /> {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const BottomControls = () => (
    <div className="border-t p-3 space-y-2">
      <Button variant="ghost" size="sm" className="w-full justify-start" onClick={toggleTheme}>
        {mounted && resolvedTheme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
        {mounted ? (resolvedTheme === "dark" ? "Light mode" : "Dark mode") : "Theme"}
      </Button>
      <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={signOut}>
        <LogOut className="mr-2 h-4 w-4" /> Sign out
      </Button>
    </div>
  );

  const Brand = () => (
    <div className="flex items-center gap-2 border-b px-5 py-4">
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-brand-foreground">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="leading-tight">
        <div className="text-sm font-semibold">Velocity</div>
        <div className="text-xs text-muted-foreground">AI Workspace</div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 flex-col border-r bg-sidebar md:flex">
        <Brand />
        <NavList />
        <BottomControls />
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        {/* Mobile header */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/95 backdrop-blur px-4 py-3 md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 flex flex-col">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <Brand />
              <NavList onItemClick={() => setMobileOpen(false)} />
              <BottomControls />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand" />
            <span className="font-semibold">Velocity</span>
          </div>
          <div className="w-9" />
        </header>

        <div className="flex-1 min-h-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
