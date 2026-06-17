"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const NAMES = ["Filip Ciąder", "kilogrampaliwa"] as const;
const INTERVAL_MS = 2000;

export function RotatingBrand({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % NAMES.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <span className={`relative inline-block overflow-hidden ${className ?? ""}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={NAMES[index]}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="inline-block"
        >
          {NAMES[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
