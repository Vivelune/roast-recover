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
    description: "Populates your equipment registry—even for third-party machines.",
    href: "/account/equipment/declare",
    cta: "Add equipment",
  },
  {
    key: "firstPackagingBrowse" as const,
    label: "Browse packaging for your café",
    description: "Find cups, lids, and bags matched to your brand.",
    href: "/packaging",
    cta: "Browse",
  },
  {
    key: "firstOrder" as const,
    label: "Place your first order",
    description: "Secure your initial equipment deposit or packaging orders.",
    href: "/packaging",
    cta: "Shop now",
  },
  {
    key: "profileComplete" as const,
    label: "Set up your company profile",
    description: "Add your business info for tax declarations and billing.",
    href: "/account/company",
    cta: "Configure",
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
    <div className="border border-gray-150 bg-[#FBFBFA] rounded-xl mb-8 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Trigger Area */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-steam/10 transition-colors"
      >
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-xs font-bold text-ash uppercase tracking-wider mb-1">
            Getting Started
          </p>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-char whitespace-nowrap">
              {completedCount} of {STEPS.length} complete
            </span>
            <div className="flex-1 bg-gray-200/80 rounded-full h-1.5 max-w-xs">
              <div
                className="bg-ember h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
        <div className="p-1 rounded-md hover:bg-steam/40 transition-colors">
          {collapsed ? (
            <ChevronDown size={16} className="text-ash" />
          ) : (
            <ChevronUp size={16} className="text-ash" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden border-t border-gray-100 bg-white"
          >
            <div className="p-4 sm:p-5 space-y-2.5">
              {STEPS.map((step, i) => {
                const done = progress[step.key];
                const isNext = !done && STEPS.slice(0, i).every((s) => progress[s.key]);

                return (
                  <div
                    key={step.key}
                    className={`flex items-start gap-3 rounded-lg p-3 transition-all duration-200 ${
                      isNext
                        ? "bg-steam/30 border border-gray-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
                        : done
                        ? "opacity-50"
                        : "border border-transparent"
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {done ? (
                        <CheckCircle2 size={18} className="text-ember fill-ember/5" />
                      ) : (
                        <Circle size={18} className="text-gray-300" />
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
                        <p className="text-xs text-ash mt-0.5 leading-relaxed">
                          {step.description}
                        </p>
                      )}
                    </div>

                    {isNext && !done && (
                      <Link
                        href={step.href}
                        className="flex-shrink-0 flex items-center gap-1 text-xs text-char font-bold hover:text-ember transition-colors bg-white px-2.5 py-1 rounded-md border border-gray-200 shadow-sm"
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