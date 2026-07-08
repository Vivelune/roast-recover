"use client";
import { Check } from "lucide-react";

const STEPS = ["Review order", "Shipping", "Payment"];

export default function CheckoutSteps({ current }: { current: number }) {
  return (
    <div className="flex items-center mb-10">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  done
                    ? "bg-ember text-white"
                    : active
                    ? "bg-char text-white"
                    : "bg-gray-100 text-ash"
                }`}
              >
                {done ? <Check size={13} /> : n}
              </div>
              <span
                className={`text-sm ${
                  active ? "text-char font-medium" : "text-ash"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-10 h-px mx-3 ${
                  done ? "bg-ember" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}