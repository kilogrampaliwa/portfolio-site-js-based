"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type RevealSectionProps = {
  id?: string;
  className: string;
  children: ReactNode;
};

/** A <section> that fades/slides into view once as the user scrolls to it. */
export function RevealSection({ id, className, children }: RevealSectionProps) {
  return (
    <motion.section
      id={id}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {children}
    </motion.section>
  );
}
