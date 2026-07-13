import Link from "next/link";
import { ShieldCheck, Building2, PackageCheck, ArrowRight, Factory, FileCheck2, Ship } from "lucide-react";
import FadeIn from "@/components/FadeIn";
import AnimatedCounter from "@/components/AnimatedCounter";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import TestimonialCard from "@/components/TestimonialCard";

export default async function HomePage() {
  const testimonials = await prisma.testimonial.findMany({
    where: { active: true },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
    take: 6,
  });
  return (
    <div>
      {/* HERO */}
      <section className="relative bg-steam overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-ember/5" />
        <div className="absolute top-40 -left-32 w-72 h-72 rounded-full bg-ash/5" />

        <div className="max-w-6xl mx-auto px-8 py-28 grid md:grid-cols-2 gap-12 items-center relative">
          <div>
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.15em] text-ember font-medium mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-ember inline-block" />
                Certified equipment &amp; packaging
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 className="font-display font-semibold text-5xl leading-[1.08] text-char mb-5">
                Direct from source.<br />Built for your café.
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-ash text-[15px] leading-relaxed mb-8 max-w-md">
                Espresso machines, grinders, cups and bags — sourced from certified
                factories and shipped to your café, without the distributor markup
                in between.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div className="flex gap-3">
                <Link
                  href="/equipment"
                  className="group bg-ember hover:bg-ember-dark text-white px-6 py-3 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                >
                  Shop equipment
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/packaging"
                  className="bg-white border border-gray-200 text-char px-6 py-3 rounded-md text-sm font-medium hover:border-gray-300 transition-colors"
                >
                  Shop packaging
                </Link>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.15} y={24}>
          <div className="relative bg-white/70 border border-white rounded-2xl aspect-square shadow-sm overflow-hidden">
  <Image
    src="/landingpage.png"
    alt="Commercial espresso machine"
    fill
    className="object-cover rounded-2xl"
  />
</div>
          </FadeIn>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="max-w-6xl mx-auto px-8 py-14 grid grid-cols-1 md:grid-cols-3 gap-8">
        <FadeIn delay={0}><TrustItem icon={<ShieldCheck size={22} strokeWidth={1.5} />} title="UL & NSF certified" copy="Every machine, verified before it ships." /></FadeIn>
        <FadeIn delay={0.08}><TrustItem icon={<Building2 size={22} strokeWidth={1.5} />} title="US-based company" copy="Registered LLC, US support and warranty." /></FadeIn>
        <FadeIn delay={0.16}><TrustItem icon={<PackageCheck size={22} strokeWidth={1.5} />} title="Built to order" copy="No warehouse markup, sourced per order." /></FadeIn>
      </section>

      {/* WHY DIRECT SOURCING */}
      <section className="max-w-6xl mx-auto px-8 py-20 border-t border-gray-100">
        <FadeIn>
          <p className="text-xs uppercase tracking-[0.15em] text-ember font-medium mb-3">Why direct sourcing</p>
          <h2 className="font-display font-semibold text-3xl text-char mb-12 max-w-lg">
            Three layers of markup, removed.
          </h2>
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-10">
          <FadeIn delay={0}><Numbered n="01" title="Factory verified" copy="We work only with manufacturers whose models already carry UL or NSF certification — no shortcuts." /></FadeIn>
          <FadeIn delay={0.1}><Numbered n="02" title="No distributor markup" copy="Pricing reflects factory cost plus a transparent margin, not three resellers' worth of markup." /></FadeIn>
          <FadeIn delay={0.2}><Numbered n="03" title="Built per order" copy="We don't sit on warehouse inventory — your equipment is sourced when you order, keeping costs down." /></FadeIn>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-steam">
        <div className="max-w-6xl mx-auto px-8 py-20">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.15em] text-ember font-medium mb-3">How it works</p>
            <h2 className="font-display font-semibold text-3xl text-char mb-14 max-w-lg">
              From factory floor to your café.
            </h2>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-6 left-[16.5%] right-[16.5%] h-px bg-ash/20" />
            <FadeIn delay={0}><Step icon={<Factory size={20} />} step="Order placed" copy="Choose your equipment or packaging and pay a deposit to begin sourcing." /></FadeIn>
            <FadeIn delay={0.1}><Step icon={<FileCheck2 size={20} />} step="Sourced & verified" copy="Your order is built and certification is confirmed before it ships." /></FadeIn>
            <FadeIn delay={0.2}><Step icon={<Ship size={20} />} step="Shipped to your café" copy="Balance is due on completion, then it ships straight to your door." /></FadeIn>
          </div>
        </div>
      </section>

      {/* STATS BAND — graphite, deliberately the cool/software-coded color in a marketing context to feel like infrastructure */}
      <section className="bg-graphite">
        <div className="max-w-6xl mx-auto px-8 py-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <Stat value={0} suffix="%" label="distributor markup" />
          <Stat value={100} suffix="%" label="certified equipment" />
          <Stat value={21} suffix=" days" label="avg. lead time" />
          <Stat value={1} prefix="US " label="registered company" />
        </div>
      </section>

      {/* TESTIMONIAL SECTION */}
{testimonials.length > 0 && (
  <section className="max-w-6xl mx-auto px-8 py-20">
    <FadeIn>
      <div className="flex items-end justify-between mb-12">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-ember font-medium mb-3">
            From the field
          </p>
          <h2 className="font-display font-semibold text-3xl text-char max-w-md">
            What café operators say after switching.
          </h2>
        </div>
        <p className="text-ash text-sm max-w-xs text-right hidden md:block leading-relaxed">
          Real feedback from independent operators and growing café groups.
        </p>
      </div>
    </FadeIn>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {testimonials.map((t, i) => (
        <FadeIn key={t.id} delay={i * 0.06}>
          <TestimonialCard
            name={t.name}
            role={t.role}
            company={t.company}
            location={t.location}
            quote={t.quote}
            avatarUrl={t.avatarUrl}
            featured={t.featured}
          />
        </FadeIn>
      ))}
    </div>
  </section>
)}

      {/* CTA BAND */}
      <section className="bg-ember">
        <div className="max-w-6xl mx-auto px-8 py-16 flex flex-col md:flex-row items-center justify-between gap-6"> 
          <FadeIn>
            <h2 className="font-display font-semibold text-2xl text-white max-w-md">
              Ready to cut out the middlemen?
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <Link
              href="/equipment"
              className="bg-white text-ember px-6 py-3 rounded-md text-sm font-medium hover:bg-steam transition-colors inline-flex items-center gap-2"
            >
              Get started <ArrowRight size={15} />
            </Link>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}

function TrustItem({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <div className="text-ember">{icon}</div>
      <p className="font-medium text-char text-[15px]">{title}</p>
      <p className="text-ash text-sm leading-relaxed">{copy}</p>
    </div>
  );
}

function Numbered({ n, title, copy }: { n: string; title: string; copy: string }) {
  return (
    <div>
      <p className="font-display text-ember/40 text-3xl font-semibold mb-3">{n}</p>
      <p className="font-medium text-char text-[15px] mb-2">{title}</p>
      <p className="text-ash text-sm leading-relaxed">{copy}</p>
    </div>
  );
}

function Step({ icon, step, copy }: { icon: React.ReactNode; step: string; copy: string }) {
  return (
    <div className="relative bg-steam">
      <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-ember relative z-10 mb-4">
        {icon}
      </div>
      <p className="font-medium text-char text-[15px] mb-2">{step}</p>
      <p className="text-ash text-sm leading-relaxed">{copy}</p>
    </div>
  );
}

function Stat({ value, suffix = "", prefix = "", label }: { value: number; suffix?: string; prefix?: string; label: string }) {
  return (
    <div>
      <p className="font-display font-semibold text-3xl text-white mb-1">
        <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
      </p>
      <p className="text-gray-400 text-xs uppercase tracking-wide">{label}</p>
    </div>
  );
}