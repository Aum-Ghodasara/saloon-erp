"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import GeomText from "./GeomText";

export default function Hero() {
  const containerRef = useRef(null);

  // Optimized parallax offsets (smaller range for better GPU rendering)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.5], [0, -30]);

  const handleScrollDown = () => {
    const nextSection = document.getElementById("about");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section 
      ref={containerRef} 
      className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-terracotta"
    >
      {/* Background Image Wrapper with Parallax */}
      <motion.div 
        className="absolute top-0 left-0 w-full h-full z-10 will-change-transform"
        style={{ y: imageY, scale: imageScale }}
      >
        <Image
          src="/hero_grooming.png"
          alt="B Smart Salon Precision Cut"
          fill
          priority
          quality={75}
          className="object-cover object-[center_30%] opacity-85 contrast-[1.05] brightness-90"
        />
      </motion.div>

      {/* Dark Vignette Overlay for Text Contrast */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(154,66,45,0.1)_0%,rgba(8,8,8,0.4)_60%,rgba(8,8,8,0.85)_100%)] z-20 pointer-events-none" />

      {/* Content overlay */}
      <motion.div 
        className="relative z-30 w-full max-w-[1200px] px-10 flex flex-col items-center justify-center text-center gap-6 mt-15 will-change-transform-opacity max-[640px]:gap-4"
        style={{ opacity: textOpacity, y: textY }}
      >
        {/* Subtitle */}
        <motion.div 
          className="flex flex-col items-center gap-2 font-body text-sm font-medium tracking-[0.35em] text-cream uppercase opacity-90 max-[640px]:text-[11px] max-[640px]:tracking-[0.25em]"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        >
          <span>THE APEX OF</span>
          <span>URBAN GROOMING</span>
          <div className="w-10 h-[1px] bg-cream opacity-50" />
        </motion.div>

        {/* Brand Display Title (fluid em sizing via css classes) */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center gap-[0.15em] leading-none">
            <GeomText text="B" className="text-[9.5vw] min-[1440px]:text-[135px] max-[768px]:text-[11vw] max-[480px]:text-[12.5vw]" strokeWidth={5} color="#fff" />
            <GeomText text="SMART" className="text-[9.5vw] min-[1440px]:text-[135px] max-[768px]:text-[11vw] max-[480px]:text-[12.5vw]" strokeWidth={5} color="#fff" />
          </div>
          <div className="flex items-center justify-center gap-[0.15em] leading-none -mt-[0.1em]">
            <GeomText text="SALON" className="text-[9.5vw] min-[1440px]:text-[135px] max-[768px]:text-[11vw] max-[480px]:text-[12.5vw]" strokeWidth={5} color="#fff" />
          </div>
        </div>
      </motion.div>

      {/* Scroll Down Indicator */}
      <motion.div 
        className="absolute bottom-10 max-[640px]:bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3 cursor-pointer opacity-70 transition-opacity duration-300 hover:opacity-100"
        onClick={handleScrollDown}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-cream-dim">SCROLL DOWN</span>
        <div className="w-[1px] h-[50px] max-[640px]:h-[35px] bg-gradient-to-b from-cream to-transparent relative overflow-hidden">
          <span className="absolute top-0 left-0 w-full h-[30%] bg-terracotta-light animate-[heroScrollAnim_2.2s_infinite]" />
        </div>
      </motion.div>
    </section>
  );
}
