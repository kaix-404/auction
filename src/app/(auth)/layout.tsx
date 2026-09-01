import Link from "next/link";
import { Gavel } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-muted/40">
      <header className="flex h-16 items-center border-b bg-background px-6">
        <Link href="/" className="flex items-center gap-2">
          <Gavel className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">BidVerse</span>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
