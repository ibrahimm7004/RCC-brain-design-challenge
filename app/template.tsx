// app/template.tsx
"use client";

import { motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }} // Start invisible and slightly down
      animate={{ opacity: 1, y: 0 }}   // Animate to visible and original position
      transition={{
        duration: 0.5,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}