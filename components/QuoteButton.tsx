"use client";
import { useState } from "react";
import { FileQuestion, X } from "lucide-react";
import ContactForm from "./ContactForm";
import { motion, AnimatePresence } from "framer-motion";

export default function QuoteButton({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full h-11 border border-ember text-ember hover:bg-ember/5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
      >
        <FileQuestion size={14} className="stroke-[2.5]" /> Request a custom quote
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-char/40 backdrop-blur-sm z-40"
            />

            {/* Bottom-up sliding Modal drawer */}
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed bottom-0 left-0 right-0 md:bottom-1/2 md:top-auto md:left-1/2 md:-translate-x-1/2 md:translate-y-1/2 md:w-[480px] z-50 bg-white rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden border border-gray-150"
            >
              <div className="flex items-center justify-between px-5 py-4.5 border-b border-gray-150 bg-[#FBFBFA]">
                <p className="font-bold text-char text-xs uppercase tracking-wider">
                  Request Commercial Quote
                </p>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 hover:bg-steam rounded-lg transition-colors text-ash hover:text-char"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-5 overflow-y-auto max-h-[80vh] md:max-h-[500px]">
                <ContactForm productId={productId} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}