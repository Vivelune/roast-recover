import ContactForm from "@/components/ContactForm";
import { Mail, Clock, MessageSquare } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto px-8 py-16">
      <div className="grid md:grid-cols-[1fr_400px] gap-16">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-ember font-medium mb-3">
            Get in touch
          </p>
          <h1 className="font-display font-semibold text-4xl text-char mb-4">
            Talk to us before you buy.
          </h1>
          <p className="text-ash text-[15px] leading-relaxed mb-10">
            Most equipment decisions at this scale deserve a conversation first.
            Tell us what you need — we'll get back to you within 1 business day.
          </p>

          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-steam flex items-center justify-center text-ember flex-shrink-0">
                <MessageSquare size={16} />
              </div>
              <div>
                <p className="font-medium text-char text-sm mb-0.5">Volume orders</p>
                <p className="text-ash text-sm leading-relaxed">
                  Ordering 3+ machines or need custom specifications? Ask us
                  about volume pricing and lead time commitments.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-steam flex items-center justify-center text-ember flex-shrink-0">
                <Mail size={16} />
              </div>
              <div>
                <p className="font-medium text-char text-sm mb-0.5">
                  Email us directly
                </p>
                <a
                  href="mailto:ritual@roastandrecover.com"
                  className="text-ember text-sm hover:underline"
                >
                  ritual@roastandrecover.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-steam flex items-center justify-center text-ember flex-shrink-0">
                <Clock size={16} />
              </div>
              <div>
                <p className="font-medium text-char text-sm mb-0.5">Response time</p>
                <p className="text-ash text-sm">
                  Within 1 business day. We're based across US and Asia
                  Pacific time zones.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}