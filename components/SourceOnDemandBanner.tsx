// components/SourceOnDemandBanner.tsx
import Link from "next/link";
import { Search } from "lucide-react";

export default function SourceOnDemandBanner() {
  return (
    <div className="relative bg-char rounded-2xl p-7 sm:p-8 overflow-hidden mb-10 sm:mb-12">
      {/* Giant faint decorative mark — same signature move as TestimonialCard's quote mark */}
      <Search
        className="absolute -top-8 -right-8 text-white/5 pointer-events-none"
        size={180}
        strokeWidth={1}
        aria-hidden="true"
      />

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.15em] text-ember font-medium mb-3">
            Custom sourcing
          </p>
          <h3 className="font-display font-semibold text-xl sm:text-2xl text-white tracking-tight mb-2">
            Don't see what you need?
          </h3>
          <p className="text-white/60 text-sm leading-relaxed max-w-md">
            Our catalog is still growing. Tell us the equipment or packaging
            you're after and we'll source it direct from a certified factory —
            even if it isn't listed here yet.
          </p>
        </div>

        {/* Exact same highlighted-box treatment as the ROI calculator's savings box */}
        <div className="shrink-0 bg-ember/20 border border-ember/30 rounded-xl p-5 w-full sm:w-auto">
          <p className="text-white/50 text-xs uppercase tracking-wide mb-2 text-center sm:text-left">
            Any equipment, any packaging
          </p>
          <Link
            href="/contact?reason=custom"
            className="block w-full text-center bg-ember hover:bg-ember-dark text-white px-5 py-3 rounded-md text-sm font-medium transition-colors"
          >
            Request a custom source →
          </Link>
        </div>
      </div>
    </div>
  );
}