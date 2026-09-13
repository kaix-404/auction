import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AuthProvider } from "@/components/auth-provider";
import { SocketProvider } from "@/components/socket-provider";
import { Toaster } from "@/components/ui/sonner";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
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
    <html
      lang="en"
      className={`dark ${spaceGrotesk.variable} ${spaceMono.variable} h-full antialiased`}
    >
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
