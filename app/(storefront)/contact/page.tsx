import ContactForm from "@/components/ContactForm";
import { Mail, Clock, MessageSquare } from "lucide-react";

export default function ContactPage() {
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
            
            <div className="flex items-start gap-4 p-5 rounded-xl bg-steam/40 border border-gray-100/50">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-ember shadow-sm flex-shrink-0">
                <MessageSquare size={18} />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-char text-sm">Volume orders</p>
                <p className="text-ash text-xs sm:text-sm leading-relaxed">
                  Ordering 3+ machines or need custom specifications? Ask us
                  about volume pricing and lead time commitments.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-xl bg-steam/40 border border-gray-100/50">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-ember shadow-sm flex-shrink-0">
                <Mail size={18} />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-char text-sm">Email us directly</p>
                <a
                  href="mailto:ritual@roastandrecover.com"
                  className="inline-block text-ember text-xs sm:text-sm font-medium hover:text-ember-dark hover:underline transition-colors mt-0.5"
                >
                  ritual@roastandrecover.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-xl bg-steam/40 border border-gray-100/50 sm:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-ember shadow-sm flex-shrink-0">
                <Clock size={18} />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-char text-sm">Response time</p>
                <p className="text-ash text-xs sm:text-sm leading-relaxed">
                  Within 1 business day. We&apos;re based across US and Asia
                  Pacific time zones.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Contact Form Container */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-xl shadow-gray-500/5">
          <ContactForm />
        </div>

      </div>
    </div>
  );
}