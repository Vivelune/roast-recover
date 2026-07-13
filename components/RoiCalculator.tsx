"use client";
import { useState } from "react";

const MARKUP_RATE = 0.38; // 38% average distributor markup based on industry data
const RR_DISCOUNT = 0.38; // savings vs distributor

function formatUSD(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents);
}

export default function RoiCalculator() {
  const [machines, setMachines] = useState(2);
  const [machineSpend, setMachineSpend] = useState(8000);
  const [packagingSpend, setPackagingSpend] = useState(3600);

  const totalCurrentSpend = machines * machineSpend + packagingSpend;
  const distributorMarkup = totalCurrentSpend * MARKUP_RATE;
  const rrTotal = totalCurrentSpend - totalCurrentSpend * RR_DISCOUNT;
  const annualSaving = totalCurrentSpend - rrTotal;

  return (
    <div className="grid md:grid-cols-[1fr_auto_1fr] gap-8 items-start">
      {/* Inputs */}
      <div className="space-y-6">
        <Slider
          label="Machines per year"
          value={machines}
          min={1}
          max={20}
          step={1}
          onChange={setMachines}
          format={(v) => `${v} machine${v !== 1 ? "s" : ""}`}
          dark
        />
        <Slider
          label="Average machine price (distributor)"
          value={machineSpend}
          min={1000}
          max={20000}
          step={500}
          onChange={setMachineSpend}
          format={(v) => formatUSD(v)}
          dark
        />
        <Slider
          label="Annual packaging spend"
          value={packagingSpend}
          min={0}
          max={30000}
          step={500}
          onChange={setPackagingSpend}
          format={(v) => formatUSD(v)}
          dark
        />
      </div>

      {/* Divider */}
      <div className="hidden md:block w-px bg-white/10 self-stretch" />

      {/* Result */}
      <div className="space-y-5">
        <div>
          <p className="text-white/50 text-xs uppercase tracking-wide mb-1">
            Your current annual spend
          </p>
          <p className="font-display font-semibold text-3xl text-white">
            {formatUSD(totalCurrentSpend)}
          </p>
        </div>

        <div className="border-t border-white/10 pt-5">
          <p className="text-white/50 text-xs uppercase tracking-wide mb-1">
            Estimated distributor markup
          </p>
          <p className="font-display font-semibold text-2xl text-red-400">
            {formatUSD(distributorMarkup)} / year
          </p>
          <p className="text-white/40 text-xs mt-1">
            ~38% avg. markup across equipment and packaging categories
          </p>
        </div>

        <div className="bg-ember/20 border border-ember/30 rounded-xl p-5">
          <p className="text-ember text-xs uppercase tracking-wide mb-1">
            Estimated annual saving with R&R
          </p>
          <p className="font-display font-semibold text-4xl text-white">
            {formatUSD(annualSaving)}
          </p>
          <p className="text-white/60 text-xs mt-2">
            Based on typical 38% saving vs. distributor pricing.
            Actual savings depend on specific products and volumes.
          </p>
        </div>

        <a
          href="/contact"
          className="block w-full text-center bg-ember hover:bg-ember-dark text-white px-5 py-3 rounded-md text-sm font-medium transition-colors"
        >
          Get an exact quote for your order →
        </a>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  dark,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  dark?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className={`text-xs ${dark ? "text-white/60" : "text-ash"}`}>
          {label}
        </p>
        <p
          className={`text-sm font-medium tabular-nums ${
            dark ? "text-white" : "text-char"
          }`}
        >
          {format(value)}
        </p>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-ember"
        style={{ accentColor: "#B5481F" }}
      />
      <div
        className={`flex justify-between text-xs mt-1 ${
          dark ? "text-white/30" : "text-ash/60"
        }`}
      >
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}