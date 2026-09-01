import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const sections = [
  {
    title: "1. Information We Collect",
    body: "We collect information you provide directly, including your name, email address, phone number, and physical address. When you participate in auctions, we also collect KYC documents, payment details, bid history, and transaction records necessary to process participation and settle auctions.",
  },
  {
    title: "2. How We Use Your Information",
    body: "Your information is used to create and manage your account, verify your identity and eligibility, process participation fees and EMDs, operate and settle auctions, facilitate communication about your bids and wins, provide customer support, and comply with applicable legal and regulatory obligations.",
  },
  {
    title: "3. KYC and Bank Data Protection",
    body: "KYC documents and bank/financial data are collected solely for identity verification and payment processing. We store this information securely, restrict access to authorized personnel only, and never use it for marketing. We do not sell or share your financial data with third parties except as required to process payments or as required by law.",
  },
  {
    title: "4. Data Security",
    body: "We implement appropriate technical and organizational measures to safeguard your personal and financial information against unauthorized access, alteration, disclosure, or destruction. These include encryption in transit and at rest, access controls, and regular security reviews. No method of transmission or storage is completely secure, and we cannot guarantee absolute security.",
  },
  {
    title: "5. Cookies and Tracking",
    body: "We use cookies and similar technologies to improve your experience, remember your preferences, keep you signed in, and analyze how the platform is used. You can control or disable cookies through your browser settings, though some features may not function properly without them.",
  },
  {
    title: "6. Sharing of Information",
    body: "We do not sell your personal information. We may share data with trusted service providers who assist us in operating the platform, processing payments, or providing verification services, and only to the extent necessary. We may also disclose information where required by law or to protect the rights, property, or safety of BidVerse, our users, or others.",
  },
  {
    title: "7. Data Retention",
    body: "We retain your personal information for as long as your account is active or as needed to provide services, comply with legal obligations, resolve disputes, and enforce our agreements. When information is no longer needed, we securely delete or anonymize it.",
  },
  {
    title: "8. Your Rights",
    body: "Subject to applicable law, you have the right to access, correct, update, or request deletion of your personal information. You may also object to or restrict certain processing and request a copy of the data we hold about you. To exercise these rights, contact us at support@bidverse.example.",
  },
  {
    title: "9. Children's Privacy",
    body: "BidVerse is not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us so we can take appropriate action.",
  },
  {
    title: "10. Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. When we do, the revised effective date will be posted at the top of this page. We encourage you to review this policy periodically to stay informed about how we protect your information.",
  },
  {
    title: "11. Contact Us",
    body: "If you have questions, concerns, or requests regarding this Privacy Policy or your personal information, please contact our support team at support@bidverse.example. We will respond to your inquiry in a timely manner.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          How we collect, use, and protect your information.
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
