import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import Auction from "@/models/Auction";
import { AuctionCard } from "@/components/auction/auction-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getFeaturedAuctions() {
  try {
    await dbConnect();
    const auctions = await Auction.find({
      status: { $in: ["live", "registration_open", "scheduled"] },
      isFeatured: true,
    })
      .sort({ endDate: 1 })
      .limit(4)
      .populate("productId", "images brand model condition")
      .lean();
    return JSON.parse(JSON.stringify(auctions));
  } catch (err) {
    console.error("Failed to fetch featured auctions:", err);
    return [];
  }
}

export default async function HomePage() {
  const featured = await getFeaturedAuctions();

  const steps = [
    {
      title: "Register & Verify",
      desc: "Sign up with your mobile or email, complete OTP verification and KYC.",
    },
    {
      title: "Pay Participation & EMD",
      desc: "Pay the participation fee and refundable EMD via UPI/IMPS/NEFT.",
    },
    {
      title: "Place Your Bids",
      desc: "Bid in real-time. Get notified when you're outbid.",
    },
    {
      title: "Win & Pay Balance",
      desc: "If you win, pay the balance and receive your product. Losing EMDs are refunded.",
    },
  ];

  return (
    <div>
      <section className="bg-gradient-to-b from-primary/10 to-background">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Bid. Win. Secure Great Deals.
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Participate in live forward auctions for verified products. Transparent
              rules, secure bidding, and fast EMD refunds.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/auctions" className={cn(buttonVariants({ size: "lg" }))}>
                Browse Auctions
              </Link>
              <Link
                href="/how-it-works"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Featured Auctions</h2>
          <Link
            href="/auctions"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all auctions &rarr;
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((auction: any) => (
              <AuctionCard key={auction._id} auction={auction} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
            No featured auctions right now. Check back soon!
          </div>
        )}
      </section>

      <section className="bg-muted/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center text-2xl font-bold">How It Works</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  {i + 1}
                </div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
