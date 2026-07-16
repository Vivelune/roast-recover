"use client";
import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ImageGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const validImages = images.length > 0 ? images : ["/placeholder.png"];
  const active = validImages[activeIndex];

  function go(dir: number) {
    setDirection(dir);
    setActiveIndex((i) =>
      (i + dir + validImages.length) % validImages.length
    );
  }

  return (
    <div className="space-y-3.5">
      {/* Main image container */}
      <div className="relative bg-steam rounded-2xl aspect-square overflow-hidden group border border-gray-150">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeIndex}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={active}
              alt={`${alt} — image ${activeIndex + 1}`}
              fill
              className="object-cover"
              priority={activeIndex === 0}
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Overlays */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm border border-gray-150"
            >
              <ChevronLeft size={15} className="text-char" />
            </button>
            <button
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm border border-gray-150"
            >
              <ChevronRight size={15} className="text-char" />
            </button>
          </>
        )}

        {/* Image index counter tag */}
        {validImages.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-char/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
            {activeIndex + 1} / {validImages.length}
          </div>
        )}
      </div>

      {/* Slide Thumbnails list */}
      {validImages.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
          {validImages.map((img, i) => (
            <button
              key={img}
              onClick={() => { setDirection(i > activeIndex ? 1 : -1); setActiveIndex(i); }}
              className={`relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                i === activeIndex
                  ? "border-ember scale-[0.96]"
                  : "border-transparent hover:border-gray-300"
              }`}
            >
              <Image src={img} alt={`Thumbnail ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}