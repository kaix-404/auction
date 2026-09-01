"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      toast.success("Message sent", {
        description: "Thanks for reaching out. We'll get back to you shortly.",
      });
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      toast.error("Something went wrong", {
        description:
          "We couldn't send your message right now. Please try again or email us directly.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const contactItems = [
    {
      icon: Mail,
      label: "Email",
      value: "support@bidverse.example",
      href: "mailto:support@bidverse.example",
    },
    {
      icon: Phone,
      label: "Phone",
      value: "+91 98765 43210",
      href: "tel:+919876543210",
    },
    {
      icon: MapPin,
      label: "Address",
      value: "BidVerse Tower, MG Road, Bengaluru, Karnataka 560001",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Contact Us
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Have a question or need help? We're here for you.
        </p>
      </div>

      <Separator className="mx-auto mt-10 max-w-3xl" />

      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Send us a message</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="How can we help?"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message here..."
                  rows={5}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                <Send />
                {submitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {contactItems.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.label}>
                  <CardContent className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{item.label}</p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-sm text-muted-foreground hover:text-primary"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {item.value}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="rounded-xl bg-muted/40 p-6">
            <h2 className="text-lg font-semibold">Support Hours</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Our support team is available Monday to Saturday, 10:00 AM to
              6:00 PM IST. We aim to respond to all inquiries within one
              business day.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
