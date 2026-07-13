"use client";
import { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import ContactForm from "./ContactForm";
import { motion, AnimatePresence } from "framer-motion";

export default function QuoteButton({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full border border-ember text-ember hover:bg-ember hover:text-white px-6 py-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
      >
        <MessageSquare size={15} /> Request a custom quote
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/40 z-40"
            />

            {/* Drawer */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 32 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed bottom-0 left-0 right-0 md:right-auto md:left-1/2 md:-translate-x-1/2 md:bottom-8 md:w-[480px] z-50 bg-white rounded-t-2xl md:rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <p className="font-medium text-char text-sm">
                  Request a quote
                </p>
                <button
                  onClick={() => setOpen(false)}
                  className="text-ash hover:text-char transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-5 overflow-y-auto max-h-[80vh]">
                <ContactForm productId={productId} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}