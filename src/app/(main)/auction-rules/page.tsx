import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const sections = [
  {
    title: "1. Forward Auction Mechanics",
    body: "All auctions on BidVerse are forward auctions in which the price starts at a reserve price and rises as participants place competing bids. The bidder offering the highest amount within the auction duration wins the lot.",
  },
  {
    title: "2. Reserve Price",
    body: "Each auction has a reserve price, which is the minimum amount that must be met for the auction to result in a sale. If the highest bid does not meet the reserve price, the auction may close without a winner. Bids below the reserve price are not accepted.",
  },
  {
    title: "3. Bid Increments",
    body: "Bids must increase by at least the minimum bid increment specified for each auction. Increments may vary by lot. Bids that do not meet the minimum increment are rejected by the system.",
  },
  {
    title: "4. Server Time is Authoritative",
    body: "The official time for all auctions is the BidVerse server time. The acceptance, validity, and closing of bids are determined solely by our server-authoritative engine. Your device clock, network latency, or local time has no bearing on bid timing.",
  },
  {
    title: "5. Eligibility Requirements",
    body: "To participate, you must have a verified account and have paid both the participation fee and the required Earnest Money Deposit (EMD). Accounts that are not fully verified and eligible cannot place bids. Eligibility is confirmed before you can participate.",
  },
  {
    title: "6. Highest Valid Bid Wins",
    body: "At auction closure, the highest valid bid that meets the reserve price wins the lot. A bid is valid only if placed by an eligible bidder through the official platform within the auction duration and meeting the minimum increment.",
  },
  {
    title: "7. No Shill Bidding",
    body: "Shill bidding, bid manipulation, fake bidding, collusion, and any attempt to artificially inflate prices are strictly prohibited. BidVerse monitors bidding activity and reserves the right to void invalid bids and suspend offending accounts.",
  },
  {
    title: "8. Winner Obligations & Payment Deadline",
    body: "The winning bidder must pay the outstanding balance (winning bid minus EMD) within the payment deadline specified after auction closure. You will receive clear instructions and a deadline once you win. Payment may be made via supported methods.",
  },
  {
    title: "9. Default Consequences",
    body: "If a winning bidder fails to meet the payment deadline, they are considered in default. The default may result in forfeiture of the EMD, suspension or termination of the account, and being barred from future auctions on the platform.",
  },
  {
    title: "10. Re-Auction Policy",
    body: "In the event of a winner defaulting, the lot may be re-auctioned at our discretion. The defaulting bidder's EMD may be used to cover any shortfall between the original winning bid and the final settled price of the re-auction.",
  },
];

export default function AuctionRulesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Auction Rules
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          The rules governing all forward auctions on BidVerse.
        </p>
      </div>

      <Separator className="mx-auto mt-10 max-w-3xl" />

      <div className="mx-auto mt-12 max-w-4xl space-y-6">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="text-base">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {section.body}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
