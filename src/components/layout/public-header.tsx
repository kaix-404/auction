"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Gavel, User } from "lucide-react";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/auctions", label: "Auctions" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Gavel className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight">BidVerse</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                pathname === link.href && "text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              <User className="mr-1 h-4 w-4" />
              My Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                Login
              </Link>
              <Link href="/register" className={cn(buttonVariants({ size: "sm" }))}>
                Register
              </Link>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {open && (
        <div className="border-t bg-background md:hidden">
          <nav className="flex flex-col gap-1 p-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              {user ? (
                <Link
                  href="/dashboard"
                  className={cn(buttonVariants())}
                  onClick={() => setOpen(false)}
                >
                  My Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={cn(buttonVariants({ variant: "outline" }))}
                    onClick={() => setOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className={cn(buttonVariants())}
                    onClick={() => setOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
