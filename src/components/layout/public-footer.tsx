import Link from "next/link";

export function PublicFooter() {
  const links: { title: string; items: { label: string; href: string }[] }[] = [
    {
      title: "Company",
      items: [
        { label: "Home", href: "/" },
        { label: "Auctions", href: "/auctions" },
        { label: "How It Works", href: "/how-it-works" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Legal",
      items: [
        { label: "Terms & Conditions", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Refund Policy", href: "/refund-policy" },
        { label: "Auction Rules", href: "/auction-rules" },
      ],
    },
    {
      title: "Support",
      items: [
        { label: "FAQ", href: "/faq" },
        { label: "Register", href: "/register" },
        { label: "Login", href: "/login" },
      ],
    },
  ];

  return (
    <footer className="border-t-4 border-foreground bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div>
            <p className="font-mono-tag text-lg font-bold">BidVerse</p>
            <p className="mt-2 text-sm text-muted-foreground">
              India&apos;s trustworthy online forward auction platform.
            </p>
          </div>
          {links.map((group) => (
            <div key={group.title}>
              <p className="font-mono-tag text-xs font-bold tracking-widest text-secondary uppercase">
                {group.title}
              </p>
              <ul className="mt-3 space-y-2">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 border-t-2 border-border pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} BidVerse. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
