import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: "By creating an account, paying any fee, or placing a bid on BidVerse, you agree to these Terms & Conditions and any additional policies referenced herein. If you do not agree, you must not use the platform.",
  },
  {
    title: "2. Eligibility",
    body: "You must be at least 18 years of age and legally capable of entering into binding contracts to use BidVerse. You must complete account verification, including OTP verification and KYC, before you can participate in any auction. BidVerse reserves the right to reject or terminate any account at its sole discretion.",
  },
  {
    title: "3. Account Responsibilities",
    body: "You are solely responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Notify us immediately of any unauthorized use. You must provide accurate, current, and complete information and keep it up to date.",
  },
  {
    title: "4. Participation Fees",
    body: "A non-refundable participation fee is required to become eligible for bidding. This fee covers the administrative and operational costs of conducting auctions and is not returned under any circumstances, regardless of whether you win or lose.",
  },
  {
    title: "5. Earnest Money Deposit (EMD)",
    body: "An EMD is charged in addition to the participation fee to demonstrate serious intent to purchase. The EMD is refundable to unsuccessful bidders within 7 days of auction closure. For winning bidders, the EMD is adjusted against the final winning bid amount.",
  },
  {
    title: "6. Auction Rules",
    body: "All auctions are forward auctions conducted in real time. Bids are recorded by our server-authoritative engine, and the server time is the official time for determining bid validity and auction closure. The highest valid bid at closing wins. Shill bidding is strictly prohibited. Full details are available in the Auction Rules.",
  },
  {
    title: "7. Winning Obligations",
    body: "If you win an auction, you are obligated to pay the remaining balance (winning bid minus EMD) within the specified payment deadline. Failure to do so constitutes default and may result in EMD forfeiture and suspension of your account.",
  },
  {
    title: "8. Prohibited Conduct",
    body: "You agree not to engage in any conduct that is fraudulent, unlawful, or harmful, including shill bidding, bid manipulation, payment fraud, resale of placements, automated bidding, harassment of other users, or any attempt to interfere with the integrity of the auction system.",
  },
  {
    title: "9. Limitation of Liability",
    body: "To the maximum extent permitted by law, BidVerse shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, revenue, data, or goodwill arising from your use of the platform, participation in auctions, or reliance on any auction information.",
  },
  {
    title: "10. Governing Law",
    body: "These Terms & Conditions shall be governed by and construed in accordance with the laws applicable in your jurisdiction. Any disputes arising out of or relating to these terms shall be subject to the exclusive jurisdiction of the competent courts, unless otherwise required by law.",
  },
  {
    title: "11. Changes to These Terms",
    body: "We may update these Terms & Conditions from time to time. Any changes will be posted on this page with a revised effective date. Continued use of BidVerse after changes take effect constitutes acceptance of the revised terms.",
  },
  {
    title: "12. Contact",
    body: "For questions or concerns regarding these Terms & Conditions, contact us at support@bidverse.example.",
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Terms & Conditions
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Please read these terms carefully before using BidVerse.
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
