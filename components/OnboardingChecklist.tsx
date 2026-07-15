"use client";
import { useState } from "react";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type OnboardingProgress = {
  addressAdded: boolean;
  equipmentDeclared: boolean;
  firstPackagingBrowse: boolean;
  firstOrder: boolean;
  profileComplete: boolean;
  completedAt: Date | null;
};

const STEPS = [
  {
    key: "addressAdded" as const,
    label: "Add your first shipping address",
    description: "So we know where to send your orders.",
    href: "/account/addresses",
    cta: "Add address",
  },
  {
    key: "equipmentDeclared" as const,
    label: "Tell us what equipment you have",
    description:
      "Populates your equipment registry — even for machines you didn't buy from us.",
    href: "/account/equipment/declare",
    cta: "Add equipment",
  },
  {
    key: "firstPackagingBrowse" as const,
    label: "Browse packaging for your café",
    description: "Find the cups, lids, and bags that match your setup.",
    href: "/packaging",
    cta: "Browse packaging",
  },
  {
    key: "firstOrder" as const,
    label: "Place your first order",
    description: "Equipment deposit or packaging — whichever you need first.",
    href: "/packaging",
    cta: "Shop now",
  },
  {
    key: "profileComplete" as const,
    label: "Set up your company account",
    description:
      "Add your café name for consolidated billing and team access.",
    href: "/account/company",
    cta: "Set up company",
  },
];

export default function OnboardingChecklist({
  progress,
}: {
  progress: OnboardingProgress;
}) {
  const [collapsed, setCollapsed] = useState(false);

  if (progress.completedAt) return null;

  const completedCount = STEPS.filter((s) => progress[s.key]).length;
  const pct = Math.round((completedCount / STEPS.length) * 100);

  return (
    <div className="border border-ember/20 bg-steam/30 rounded-xl mb-8 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-char">
              Getting started —{" "}
              <span className="text-ember">
                {completedCount}/{STEPS.length} complete
              </span>
            </p>
            {/* Progress bar */}
            <div className="w-48 bg-gray-200 rounded-full h-1.5 mt-1.5">
              <div
                className="bg-ember h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
        {collapsed ? (
          <ChevronDown size={16} className="text-ash flex-shrink-0" />
        ) : (
          <ChevronUp size={16} className="text-ash flex-shrink-0" />
        )}
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 space-y-2.5">
              {STEPS.map((step, i) => {
                const done = progress[step.key];
                const isNext = !done && STEPS.slice(0, i).every((s) => progress[s.key]);

                return (
                  <div
                    key={step.key}
                    className={`flex items-start gap-3 rounded-lg px-3 py-2.5 ${
                      isNext
                        ? "bg-white border border-ember/20"
                        : done
                        ? "opacity-60"
                        : ""
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {done ? (
                        <CheckCircle2 size={17} className="text-ember" />
                      ) : (
                        <Circle size={17} className="text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          done ? "line-through text-ash" : "text-char"
                        }`}
                      >
                        {step.label}
                      </p>
                      {!done && (
                        <p className="text-xs text-ash mt-0.5">
                          {step.description}
                        </p>
                      )}
                    </div>
                    {isNext && !done && (
                      <Link
                        href={step.href}
                        className="flex-shrink-0 flex items-center gap-1 text-xs text-ember font-medium hover:underline"
                      >
                        {step.cta} <ArrowRight size={12} />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}