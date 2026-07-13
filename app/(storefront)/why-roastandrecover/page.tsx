import FadeIn from "@/components/FadeIn";
import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import RoiCalculator from "@/components/RoiCalculator";

const comparisons = [
  {
    category: "Espresso machine (mid-tier commercial)",
    distributor: "$7,800 – $12,500",
    roastRecover: "$4,200 – $7,100",
    saving: "Up to 43%",
  },
  {
    category: "Commercial grinder",
    distributor: "$2,200 – $4,800",
    roastRecover: "$1,400 – $2,900",
    saving: "Up to 40%",
  },
  {
    category: "12oz hot cups (case of 1,000)",
    distributor: "$89 – $140",
    roastRecover: "$52 – $78",
    saving: "Up to 44%",
  },
  {
    category: "Packaging: lids (case of 1,000)",
    distributor: "$54 – $90",
    roastRecover: "$31 – $52",
    saving: "Up to 43%",
  },
];

const distributorProblems = [
  "2–4 layers of reseller markup baked into every price",
  "No transparency on factory of origin or certifications",
  "Minimum order quantities that force you to over-stock",
  "Separate vendors for equipment, packaging, and parts",
  "No visibility into lead times until after you order",
  "Sales reps incentivised to push high-margin SKUs, not best fit",
];

const rrAdvantages = [
  "Sourced direct from certified factories — you see the origin",
  "UL, NSF, and ETL certification verified per unit, not assumed",
  "No minimum quantities on packaging — order what you need",
  "One relationship for equipment, packaging, and maintenance",
  "Lead time stated on every product before you commit",
  "No sales commission structure — pricing is what it is",
];

export default function WhyUsPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-steam">
        <div className="max-w-4xl mx-auto px-8 py-20 text-center">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.15em] text-ember font-medium mb-4">
              The case for switching
            </p>
            <h1 className="font-display font-semibold text-5xl text-char leading-[1.08] mb-5">
              Your distributor is charging<br />you for their building.
            </h1>
            <p className="text-ash text-[15px] leading-relaxed max-w-2xl mx-auto mb-8">
              Every machine and every case of cups you've bought through a
              traditional distributor includes margin for an importer, a
              regional warehouse, a sales rep, and a showroom you've probably
              never visited. We removed all of that.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Comparison table */}
      <section className="max-w-5xl mx-auto px-8 py-20">
        <FadeIn>
          <h2 className="font-display font-semibold text-2xl text-char mb-2">
            Side-by-side pricing
          </h2>
          <p className="text-ash text-sm mb-8">
            Typical US distributor pricing vs. Roast & Recover direct pricing.
            Based on publicly available distributor catalogs and our current
            factory cost. Updated quarterly.
          </p>
        </FadeIn>

        <FadeIn delay={0.05}>
          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-steam/60">
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-ash uppercase tracking-wide">
                    Product
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-ash uppercase tracking-wide">
                    Typical distributor
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-ember uppercase tracking-wide">
                    Roast & Recover
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-ash uppercase tracking-wide">
                    You save
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row, i) => (
                  <tr
                    key={i}
                    className="border-t border-border hover:bg-steam/20 transition-colors"
                  >
                    <td className="px-5 py-4 text-char font-medium">
                      {row.category}
                    </td>
                    <td className="px-5 py-4 text-ash line-through">
                      {row.distributor}
                    </td>
                    <td className="px-5 py-4 text-char font-medium">
                      {row.roastRecover}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-green-700 bg-green-50 text-xs font-medium px-2.5 py-1 rounded-full">
                        {row.saving}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-ash mt-3">
            Prices shown are ranges. Exact pricing depends on model and
            quantity. Distributor prices sourced from public catalogs — actual
            negotiated prices may vary.
          </p>
        </FadeIn>
      </section>

      {/* ROI Calculator */}
      <section className="bg-char">
        <div className="max-w-5xl mx-auto px-8 py-20">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.15em] text-ember font-medium mb-3">
              Run the numbers
            </p>
            <h2 className="font-display font-semibold text-3xl text-white mb-2">
              What is your distributor costing you?
            </h2>
            <p className="text-white/60 text-sm mb-10">
              Enter your current spending and see the annual saving of buying direct.
            </p>
          </FadeIn>
          <RoiCalculator />
        </div>
      </section>

      {/* Head-to-head comparison */}
      <section className="max-w-5xl mx-auto px-8 py-20">
        <FadeIn>
          <h2 className="font-display font-semibold text-2xl text-char mb-10 text-center">
            What you're trading, and what you're gaining
          </h2>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-6">
          <FadeIn delay={0}>
            <div className="border border-border rounded-xl p-6">
              <p className="font-medium text-char mb-4 flex items-center gap-2">
                <span className="text-xs uppercase tracking-wide text-ash">
                  Traditional distributor
                </span>
              </p>
              <div className="space-y-3">
                {distributorProblems.map((p, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm">
                    <XCircle
                      size={16}
                      className="text-red-400 flex-shrink-0 mt-0.5"
                    />
                    <span className="text-ash">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.08}>
            <div className="border border-ember/30 bg-steam/30 rounded-xl p-6">
              <p className="font-medium text-char mb-4 flex items-center gap-2">
                <span className="text-xs uppercase tracking-wide text-ember">
                  Roast & Recover
                </span>
              </p>
              <div className="space-y-3">
                {rrAdvantages.map((a, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2
                      size={16}
                      className="text-ember flex-shrink-0 mt-0.5"
                    />
                    <span className="text-char">{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ember">
        <div className="max-w-5xl mx-auto px-8 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <FadeIn>
            <h2 className="font-display font-semibold text-2xl text-white max-w-md">
              Ready to see the exact price on what you need?
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="flex gap-3">
              <Link
                href="/equipment"
                className="bg-white text-ember px-6 py-3 rounded-md text-sm font-medium hover:bg-steam transition-colors inline-flex items-center gap-2"
              >
                Browse equipment <ArrowRight size={15} />
              </Link>
              <Link
                href="/contact"
                className="border border-white/40 text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Request a quote
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}