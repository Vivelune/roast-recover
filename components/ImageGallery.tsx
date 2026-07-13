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

  const validImages =
    images.length > 0 ? images : ["/placeholder.png"];
  const active = validImages[activeIndex];

  function go(dir: number) {
    setDirection(dir);
    setActiveIndex((i) =>
      (i + dir + validImages.length) % validImages.length
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative bg-steam rounded-2xl aspect-square overflow-hidden group">
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

        {/* Prev / next arrows */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* Image counter */}
        {validImages.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/40 text-white text-xs px-2 py-1 rounded-full">
            {activeIndex + 1} / {validImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {validImages.map((img, i) => (
            <button
              key={img}
              onClick={() => { setDirection(i > activeIndex ? 1 : -1); setActiveIndex(i); }}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                i === activeIndex
                  ? "border-ember"
                  : "border-transparent hover:border-ash/40"
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