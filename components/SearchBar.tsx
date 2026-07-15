"use client";
import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    setQuery("");
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 text-ash hover:text-char transition-colors rounded-md"
        aria-label="Search"
      >
        <Search size={17} strokeWidth={1.75} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/30 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-50"
            >
              <form onSubmit={handleSearch}>
                <div className="relative bg-white rounded-xl shadow-xl border border-border overflow-hidden">
                  <Search
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-ash"
                  />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search equipment, packaging, materials..."
                    className="w-full pl-11 pr-12 py-4 text-sm text-char focus:outline-none"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="absolute right-12 top-1/2 -translate-y-1/2 text-ash hover:text-char"
                    >
                      <X size={15} />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-ember text-white text-xs px-3 py-1.5 rounded-md hover:bg-ember-dark transition-colors"
                  >
                    Search
                  </button>
                </div>
                <p className="text-xs text-white/70 text-center mt-2">
                  Press Esc to close
                </p>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}