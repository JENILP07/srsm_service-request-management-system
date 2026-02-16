"use client";

import React, { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * TiltWrapper: A container component that adds a 3D tilt effect to its children on hover.
 * Uses framer-motion for smooth, performant CSS transforms.
 */
interface TiltProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number; // How strong the tilt is (default: 15)
  perspective?: number; // CSS perspective value (default: 1000)
}

export function TiltWrapper({ children, className, intensity = 15, perspective = 1000 }: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth out the mouse movement values
  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  // Calculate rotation based on mouse position relative to center
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [intensity, -intensity]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-intensity, intensity]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    
    // Calculate normalized position (-0.5 to 0.5)
    const width = rect.width;
    const height = rect.height;
    const mouseXFromCenter = e.clientX - rect.left - width / 2;
    const mouseYFromCenter = e.clientY - rect.top - height / 2;

    x.set(mouseXFromCenter / width);
    y.set(mouseYFromCenter / height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        perspective: perspective,
        rotateX,
        rotateY,
      }}
    >
        {/* We transform the child slightly to pop it out */}
        <div style={{ transform: "translateZ(20px)" }}>
            {children}
        </div>
    </motion.div>
  );
}
