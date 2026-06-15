"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * `reducedMotion="user"` makes every Framer Motion animation in the tree
 * resolve instantly for visitors with `prefers-reduced-motion: reduce`,
 * without each animated component needing its own check.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
