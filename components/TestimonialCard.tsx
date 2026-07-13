import { Quote } from "lucide-react";
import Image from "next/image";

type TestimonialProps = {
  name: string;
  role: string;
  company: string;
  location?: string | null;
  quote: string;
  avatarUrl?: string | null;
  featured?: boolean;
};

export default function TestimonialCard({
  name,
  role,
  company,
  location,
  quote,
  avatarUrl,
  featured,
}: TestimonialProps) {
  return (
    <div
      className={`relative flex flex-col h-full rounded-2xl p-7 overflow-hidden ${
        featured
          ? "bg-char text-white"
          : "bg-white border border-border"
      }`}
    >
      {/* Large decorative quote mark — the signature typographic element */}
      <span
        className={`absolute -top-2 -left-1 font-display text-[120px] leading-none select-none pointer-events-none ${
          featured ? "text-white/5" : "text-char/5"
        }`}
        aria-hidden="true"
      >
        "
      </span>

      {/* Quote text */}
      <p
        className={`relative text-[15px] leading-relaxed flex-1 mb-6 ${
          featured ? "text-white/90" : "text-ash"
        }`}
      >
        {quote}
      </p>

      {/* Attribution */}
      <div className="flex items-center gap-3 relative">
        {avatarUrl ? (
          <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
            <Image src={avatarUrl} alt={name} fill className="object-cover" />
          </div>
        ) : (
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
              featured ? "bg-white/15 text-white" : "bg-steam text-char"
            }`}
          >
            {name.charAt(0)}
          </div>
        )}
        <div>
          <p
            className={`text-sm font-medium ${
              featured ? "text-white" : "text-char"
            }`}
          >
            {name}
          </p>
          <p
            className={`text-xs ${
              featured ? "text-white/60" : "text-ash"
            }`}
          >
            {role}, {company}
            {location && ` · ${location}`}
          </p>
        </div>
      </div>
    </div>
  );
}