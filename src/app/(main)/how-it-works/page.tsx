import {
  ShieldCheck,
  CreditCard,
  BadgeCheck,
  Gavel,
  Trophy,
  Wallet,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const steps = [
  {
    icon: ShieldCheck,
    title: "Register & Verify",
    description:
      "Create your BidVerse account using your mobile number or email. Complete OTP verification and KYC (Know Your Customer) to unlock participation.",
  },
  {
    icon: CreditCard,
    title: "Pay Participation Fee & EMD",
    description:
      "Pay the one-time participation fee along with a fully refundable Earnest Money Deposit (EMD) via UPI, IMPS, NEFT, or bank transfer.",
  },
  {
    icon: BadgeCheck,
    title: "Get Verified & Become Eligible",
    description:
      "Our admin verifies your payments. Once confirmed, your account becomes eligible to place bids on live auctions.",
  },
  {
    icon: Gavel,
    title: "Place Bids in Real-Time",
    description:
      "Bid live against other participants. Our server-authoritative engine tracks every bid in real time with no shill bidding or artificial inflation.",
  },
  {
    icon: Trophy,
    title: "Auction Closes, Highest Bid Wins",
    description:
      "When the countdown ends, the highest valid bid at closing time wins the auction. You will be notified instantly if you are the winner.",
  },
  {
    icon: Wallet,
    title: "Pay Balance & Get EMD Refunded",
    description:
      "The winner pays the remaining balance to complete the purchase. Unsuccessful bidders receive their EMD refunded within 7 days.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          How It Works
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A transparent, step-by-step guide to bidding and winning on BidVerse.
        </p>
      </div>

      <Separator className="mx-auto mt-10 max-w-3xl" />

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <Card key={step.title} className="flex flex-col">
              <CardHeader>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="text-sm font-bold text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 rounded-xl bg-muted/40 p-6 sm:p-8">
        <h2 className="text-xl font-semibold">Important Notes</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>
            Participation fees are non-refundable and cover the cost of
            conducting the auction.
          </li>
          <li>
            The EMD (Earnest Money Deposit) is fully refundable to unsuccessful
            bidders within 7 days of auction closure.
          </li>
          <li>
            For winners, the EMD is adjusted against the final winning bid.
          </li>
          <li>
            All bids are final and binding once placed. Please review the{" "}
            <a href="/auction-rules" className="text-primary underline">
              Auction Rules
            </a>{" "}
            before participating.
          </li>
        </ul>
      </div>
    </div>
  );
}
