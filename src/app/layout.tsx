import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AuthProvider } from "@/components/auth-provider";
import { SocketProvider } from "@/components/socket-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BidVerse - Online Forward Auction Platform",
  description:
    "Participate in live forward auctions. Bid, win, and secure great deals.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-background font-sans text-foreground">
        <Providers>
          <AuthProvider>
            <SocketProvider>{children}</SocketProvider>
          </AuthProvider>
        </Providers>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
