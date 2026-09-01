"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const faqs = [
  {
    question: "What is a forward auction?",
    answer:
      "A forward auction is where the price starts low (at a reserve price) and rises as bidders place competing bids. The highest bidder at closing wins the item. BidVerse operates exclusively forward auctions.",
  },
  {
    question: "How do I register to participate?",
    answer:
      "Sign up with your mobile number or email, complete OTP verification, and finish KYC. Once your account is verified, you can proceed to pay the participation fee and EMD to become eligible for bidding.",
  },
  {
    question: "What is an EMD?",
    answer:
      "EMD stands for Earnest Money Deposit. It is a refundable security deposit that demonstrates your serious intent to purchase. It is required in addition to the participation fee to place bids.",
  },
  {
    question: "Is the EMD refundable?",
    answer:
      "Yes. The EMD is fully refundable to unsuccessful bidders within 7 business days of auction closure. For winners, the EMD is adjusted against their final winning bid instead of being refunded.",
  },
  {
    question: "What is the participation fee?",
    answer:
      "The participation fee is a one-time, non-refundable platform fee that covers the cost of conducting the auction. It is payable along with the EMD and is not returned whether you win or lose.",
  },
  {
    question: "How does bidding work?",
    answer:
      "Bidding happens in real time. You place bids that must meet the minimum increment above the current bid. The system tracks every bid on a server-authoritative basis, so the server time is the official record.",
  },
  {
    question: "How is the winner decided?",
    answer:
      "When the auction countdown ends, the highest valid bid that meets the reserve price wins. The winning bidder is notified instantly and must pay the outstanding balance within the payment deadline.",
  },
  {
    question: "What payment methods can I use?",
    answer:
      "You can pay the participation fee, EMD, and any balance via UPI, IMPS, NEFT, or bank transfer. These methods are supported for deposits, EMDs, and settlement.",
  },
  {
    question: "Do you have a payment gateway?",
    answer:
      "No. BidVerse does not use a third-party online payment gateway. Payments are made directly via UPI, IMPS, NEFT, or bank transfer, and our team verifies each payment before your account becomes eligible.",
  },
  {
    question: "What is the refund timeline?",
    answer:
      "For unsuccessful bidders, the EMD is refunded within 7 business days of auction closure. Please note that the participation fee is non-refundable under all circumstances.",
  },
  {
    question: "How is shipping handled?",
    answer:
      "Once the winning bidder has completed payment of the balance, the item is shipped to the delivery address on file. Shipping details and timelines are communicated after settlement.",
  },
  {
    question: "How can I get support?",
    answer:
      "You can reach our support team at support@bidverse.example, or through the contact page on this site. We're happy to help with registration, payments, bidding, or refunds.",
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Frequently Asked Questions
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Answers to the most common questions about bidding on BidVerse.
        </p>
      </div>

      <Separator className="mx-auto mt-10 max-w-3xl" />

      <div className="mx-auto mt-12 max-w-3xl divide-y divide-border rounded-xl ring-1 ring-foreground/10">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={faq.question}>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                aria-expanded={isOpen}
              >
                <span className="font-semibold">{faq.question}</span>
                <ChevronDown
                  className={`size-5 shrink-0 text-muted-foreground transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-6 pb-5">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
