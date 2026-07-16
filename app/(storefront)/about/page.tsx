import FadeIn from "@/components/FadeIn";
import Link from "next/link";
import { ArrowRight, Globe, ShieldCheck, Zap } from "lucide-react";


export const metadata = {
  title: "About Roast & Recover",
  description:
    "We built the café equipment supplier we always wished existed. Direct sourcing, verified certifications, no middlemen.",
};


export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-steam">
        <div className="max-w-4xl mx-auto px-8 py-24">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.15em] text-ember font-medium mb-4">
              Our story
            </p>
            <h1 className="font-display font-semibold text-5xl text-char leading-[1.08] mb-6 max-w-2xl">
              We built the supplier we always wished existed.
            </h1>
            <p className="text-ash text-[16px] leading-relaxed max-w-2xl">
              Roast & Recover started from a simple observation: café owners in
              the US were paying 30–40% more for equipment than they needed to,
              and nobody was doing anything about it. The machinery was available
              at the source. The certifications were obtainable. The logistics
              were solvable. What was missing was someone willing to build the
              relationship between factory floor and café counter.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Why we exist */}
      <section className="max-w-4xl mx-auto px-8 py-20">
        <div className="grid md:grid-cols-2 gap-16">
          <FadeIn>
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-ember font-medium mb-4">
                The problem
              </p>
              <h2 className="font-display font-semibold text-2xl text-char mb-4">
                A $3,000 machine shouldn't cost $8,000.
              </h2>
              <p className="text-ash leading-relaxed mb-4">
                The commercial espresso equipment supply chain in the US
                involves an importer, a regional distributor, a local dealer,
                and a showroom — each adding margin before the machine reaches
                your café. By the time it gets to you, you've paid for
                infrastructure you never used and relationships you never
                needed.
              </p>
              <p className="text-ash leading-relaxed">
                The same machine, sourced directly from a certified
                manufacturing partner and shipped to your door, costs
                meaningfully less. That gap is what we exist to close.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-ember font-medium mb-4">
                Our approach
              </p>
              <h2 className="font-display font-semibold text-2xl text-char mb-4">
                Direct sourcing. Verified certification. One relationship.
              </h2>
              <p className="text-ash leading-relaxed mb-4">
                We work directly with manufacturing partners — primarily based
                in China, where most of the world's commercial espresso
                equipment is built — and source only models that carry current
                UL, NSF, or ETL certification for the US market.
              </p>
              <p className="text-ash leading-relaxed">
                We verify that certification before every shipment, act as the
                importer of record, and deliver to your door. No dealers.
                No showrooms. No layers.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Values */}
      <section className="bg-char">
        <div className="max-w-4xl mx-auto px-8 py-20">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.15em] text-ember font-medium mb-3">
              What we believe
            </p>
            <h2 className="font-display font-semibold text-3xl text-white mb-12">
              Three things that don't negotiate.
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <ShieldCheck size={20} />,
                title: "Certification is not optional",
                body: "Every machine we sell carries verified UL or NSF certification. We don't list a product until we have the documentation, and we re-verify before every shipment.",
              },
              {
                icon: <Globe size={20} />,
                title: "Transparency over sales",
                body: "We tell you which factory built your machine, what the certification number is, and what the deposit covers. If we don't know the answer to a question, we say so.",
              },
              {
                icon: <Zap size={20} />,
                title: "Operations over aesthetics",
                body: "We're not building a lifestyle brand. We're building the back-office infrastructure that lets café operators focus on coffee instead of procurement.",
              },
            ].map((v) => (
              <FadeIn key={v.title} delay={0.05}>
                <div>
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-ember mb-4">
                    {v.icon}
                  </div>
                  <p className="font-medium text-white mb-2">{v.title}</p>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {v.body}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-8 py-20 text-center">
        <FadeIn>
          <h2 className="font-display font-semibold text-3xl text-char mb-4">
            Ready to cut out the middleman?
          </h2>
          <p className="text-ash mb-8 max-w-md mx-auto">
            Browse our current equipment and packaging catalogue, or talk to us
            directly about what your café needs.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/equipment"
              className="bg-ember hover:bg-ember-dark text-white px-6 py-3 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-2"
            >
              Browse equipment <ArrowRight size={15} />
            </Link>
            <Link
              href="/contact"
              className="border border-border text-char px-6 py-3 rounded-md text-sm font-medium hover:border-ash/40 transition-colors"
            >
              Talk to us
            </Link>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}