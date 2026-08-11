// app/contact/page.tsx
import ContactForm from "@/components/ContactForm";
import { Mail, Clock, MessageSquare, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Contact Us — Get a Custom Quote",
  description:
    "Talk to us about equipment orders, volume pricing, or packaging needs. We respond within 1 business day.",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const defaultInterest = reason === "custom" ? "custom" : undefined;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

        {/* Info Column */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ember font-bold mb-3">
              Get in touch
            </p>
            <h1 className="font-display font-semibold text-3xl sm:text-4xl lg:text-5xl text-char mb-4 tracking-tight leading-tight">
              Talk to us before you buy.
            </h1>
            <p className="text-ash text-base sm:text-lg leading-relaxed">
              Most equipment decisions at this scale deserve a conversation first.
              Tell us what you need — we&apos;ll get back to you within 1 business day.
            </p>
          </div>

          {/* Feature Grid / Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <ContactFeatureCard
              icon={<MessageSquare size={18} />}
              title="Volume orders"
              copy="Ordering 3+ machines or need custom specifications? Ask us about volume pricing and lead time commitments."
              ctaLabel="Ask about volume pricing"
              href="/contact?reason=custom"
            />

            <ContactFeatureCard
              icon={<Mail size={18} />}
              title="Email us directly"
              copy="Prefer email? Reach out any time and we'll route it to the right person."
              ctaLabel="ritual@roastandrecover.com"
              href="mailto:ritual@roastandrecover.com"
            />

            <ContactFeatureCard
              icon={<Clock size={18} />}
              title="Response time"
              copy="Within 1 business day. We're based across US and Asia Pacific time zones."
              className="sm:col-span-2 lg:col-span-1"
            />
          </div>
        </div>

        {/* Contact Form Container */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-xl shadow-gray-500/5">
          <ContactForm defaultInterest={defaultInterest} />
        </div>

      </div>
    </div>
  );
}

function ContactFeatureCard({
  icon,
  title,
  copy,
  ctaLabel,
  href,
  className = "",
}: {
  icon: React.ReactNode;
  title: string;
  copy: string;
  ctaLabel?: string;
  href?: string;
  className?: string;
}) {
  const content = (
    <div
      className={`group relative flex items-start gap-4 p-5 rounded-xl bg-steam/40 border border-gray-100/50 overflow-hidden transition-all duration-300 ${
        href ? "hover:border-ember/30 hover:bg-white hover:shadow-lg hover:shadow-ember/[0.06] hover:-translate-y-0.5 cursor-pointer" : ""
      } ${className}`}
    >
      {/* Ember glow that fades in on hover */}
      {href && (
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-ember/0 group-hover:bg-ember/10 blur-xl transition-all duration-500 pointer-events-none" />
      )}

      <div
        className={`relative w-10 h-10 rounded-lg bg-white flex items-center justify-center text-ember shadow-sm flex-shrink-0 transition-all duration-300 ${
          href ? "group-hover:bg-ember group-hover:text-white group-hover:scale-110 group-hover:rotate-3" : ""
        }`}
      >
        {icon}
      </div>

      <div className="relative space-y-1">
        <p className="font-semibold text-char text-sm">{title}</p>
        <p className="text-ash text-xs sm:text-sm leading-relaxed">{copy}</p>
        {ctaLabel && (
          <span className="inline-flex items-center gap-1 text-ember text-xs sm:text-sm font-medium mt-1.5 transition-all duration-300 group-hover:gap-2">
            {ctaLabel}
            <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return href.startsWith("mailto:") ? (
      <a href={href}>{content}</a>
    ) : (
      <a href={href} className="block">{content}</a>
    );
  }

  return content;
}