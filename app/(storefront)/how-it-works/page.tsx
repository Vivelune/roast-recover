import FadeIn from "@/components/FadeIn";
import { ShieldCheck, Factory, FileCheck2, Ship, PackageCheck, RefreshCw } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-20">
      <FadeIn>
        <p className="text-xs uppercase tracking-[0.15em] text-ember font-medium mb-3">How it works</p>
        <h1 className="font-display font-semibold text-4xl text-char mb-5 max-w-lg">
          We're not a warehouse. We're a sourcing partner.
        </h1>
        <p className="text-ash text-[15px] leading-relaxed mb-16 max-w-lg">
          Roast & Recover doesn't hold inventory and mark it up. We source equipment and packaging direct from certified factories, per order — which means lower cost, but a different process than buying off a shelf. Here's exactly how it works.
        </p>
      </FadeIn>

      <div className="space-y-12 mb-20">
        <FadeIn>
          <ProcessRow
            icon={<Factory size={20} />}
            title="Equipment is sourced per order"
            copy="We don't keep machines in a warehouse. When you order, a deposit secures your spot with our certified manufacturing partner — this is what lets us skip distributor markup."
          />
        </FadeIn>
        <FadeIn delay={0.08}>
          <ProcessRow
            icon={<ShieldCheck size={20} />}
            title="Certification is verified, not assumed"
            copy="Every equipment listing carries a UL or NSF certification we've verified directly — visible on the product page, not just taken on the factory's word."
          />
        </FadeIn>
        <FadeIn delay={0.16}>
          <ProcessRow
            icon={<FileCheck2 size={20} />}
            title="Balance is due when it's ready"
            copy="Once your equipment is built and certification is confirmed, we email a secure link for the remaining balance — nothing is charged in full upfront."
          />
        </FadeIn>
        <FadeIn delay={0.24}>
          <ProcessRow
            icon={<Ship size={20} />}
            title="Shipped straight to your café"
            copy="No middle warehouse stop. Equipment ships directly once the balance is paid, and your full order history stays in your account."
          />
        </FadeIn>
        <FadeIn delay={0.32}>
          <ProcessRow
            icon={<PackageCheck size={20} />}
            title="Packaging ships faster — no deposit needed"
            copy="Cups, lids and bags are simpler to source and ship — these are paid in full at checkout, with no build-to-order wait."
          />
        </FadeIn>
        <FadeIn delay={0.4}>
          <ProcessRow
            icon={<RefreshCw size={20} />}
            title="Set packaging to auto-reorder"
            copy="Once you've ordered packaging once, set it to a recurring schedule from your account so you never run out mid-shift."
          />
        </FadeIn>
      </div>
    </div>
  );
}

function ProcessRow({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return (
    <div className="flex gap-6">
      <div className="w-11 h-11 rounded-full bg-steam flex items-center justify-center text-ember shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-medium text-char text-base mb-1.5">{title}</p>
        <p className="text-ash text-[15px] leading-relaxed max-w-md">{copy}</p>
      </div>
    </div>
  );
}