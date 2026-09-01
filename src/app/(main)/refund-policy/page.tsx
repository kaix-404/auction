import {
  IndianRupee,
  RotateCcw,
  Scale,
  ShieldAlert,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const sections = [
  {
    icon: IndianRupee,
    title: "Participation Fee is Non-Refundable",
    body: "The participation fee is a one-time platform fee that covers the administrative and operational costs of conducting and facilitating auctions. This fee is non-refundable and is not returned whether you win, lose, or choose not to bid, under any circumstances.",
  },
  {
    icon: RotateCcw,
    title: "EMD Refund for Unsuccessful Bidders",
    body: "The Earnest Money Deposit (EMD) is fully refundable to unsuccessful bidders. Once an auction closes and a winner is determined, the EMD for all losing bidders is refunded within 7 business days of auction closure (the standard service level, or SLA). Refunds are processed to the original payment method.",
  },
  {
    icon: Scale,
    title: "EMD Adjusted Against Winning Bid",
    body: "For the winning bidder, the EMD is not refunded separately. Instead, it is adjusted against the final winning bid amount, reducing the balance the winner is required to pay to complete the purchase.",
  },
  {
    icon: ShieldAlert,
    title: "Forfeiture on Winner Default",
    body: "If a winning bidder fails to pay the outstanding balance within the specified payment deadline, the bidder is considered in default. In such cases, the EMD may be forfeited to cover costs and losses incurred due to the default, per the published Auction Rules and Terms & Conditions.",
  },
  {
    icon: RotateCcw,
    title: "Exceptions & Dispute Process",
    body: "Refunds are processed automatically for unsuccessful bidders. To request an exception, dispute a refund, or raise a concern about a forfeiture, contact our support team at support@bidverse.example with your account details and auction reference within 30 days. Each request is reviewed on its merits by our support team.",
  },
];

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Refund Policy
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Understanding what is refundable, what is not, and how refunds are
          processed.
        </p>
      </div>

      <Separator className="mx-auto mt-10 max-w-3xl" />

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title} className="flex flex-col">
              <CardHeader>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <CardTitle className="text-base">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {section.body}
                </p>
              </CardContent>
            </Card>
          );
        })}
        <Card className="flex flex-col border-dashed">
          <CardHeader>
            <CardTitle className="text-base">
              Refund Timeline Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">
                  Unsuccessful bidders:
                </span>{" "}
                EMD refunded within 7 business days.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Winning bidder:
                </span>{" "}
                EMD adjusted against the winning bid.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Defaulting winner:
                </span>{" "}
                EMD may be forfeited per published terms.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
