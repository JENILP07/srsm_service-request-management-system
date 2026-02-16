"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ perspective: "1000px" }}> {/* Add perspective container */}
      <motion.div
        key={pathname}
        initial={{ opacity: 0, rotateY: -5, y: 15 }} // Start slightly rotated and down
        animate={{ opacity: 1, rotateY: 0, y: 0 }} // Animate to flat and centered
        exit={{ opacity: 0, rotateY: 5, y: -15 }} // Exit slightly rotated the other way
        transition={{ 
            duration: 0.5, 
            ease: [0.22, 1, 0.36, 1] // Custom cubic-bezier for smooth motion
        }}
        className="w-full transform-style-3d" // Ensure 3D transforms are preserved
      >
        {children}
      </motion.div>
    </div>
  );
}
