"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import GeomText from "./GeomText";

export default function Transformation({ onBookClick }) {
  const sectionRef = useRef(null);

  // Track scroll position of this section in the viewport
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"]
  });

  // Transform parameters for the white frame card
  const frameScale = useTransform(scrollYProgress, [0, 0.85], [0.8, 1]);
  const frameRotate = useTransform(scrollYProgress, [0, 0.85], [-10, 0]);
  const frameY = useTransform(scrollYProgress, [0, 0.85], [120, 0]);
  const frameX = useTransform(scrollYProgress, [0, 0.85], [40, 0]);

  // Subtle opacity slide for background portrait
  const bgOpacity = useTransform(scrollYProgress, [0, 0.85], [0.1, 0.35]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-[90vh] min-h-[650px] bg-[#212121] overflow-hidden flex items-center max-[640px]:h-auto max-[640px]:py-[100px]"
    >
      {/* Background Silhouette */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full z-1"
        style={{ opacity: bgOpacity }}
      >
        <Image
          src="/transformation_haircut.png"
          alt="Haircut Silhouette"
          fill
          className="object-cover object-[center_30%] opacity-25 grayscale contrast-[1.1]"
        />
      </motion.div>

      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 sm:px-10 h-full flex flex-col justify-between py-20 max-[640px]:h-auto max-[640px]:static max-[640px]:gap-[60px]">
        {/* Texts in Top-Left */}
        <div className="max-w-[650px] flex flex-col gap-4">
          <motion.div
            className="flex flex-col gap-1.5"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="flex flex-col gap-3 items-start">
              <GeomText text="GET READY" size="34px" strokeWidth={5} color="#fff" />
              <GeomText text="FOR YOUR" size="34px" strokeWidth={5} color="#fff" />
              <GeomText text="TRANSFORMATION" size="46px" strokeWidth={5} color="#fff" />
            </div>
          </motion.div>

          <motion.p
            className="text-[11px] font-medium leading-[1.8] tracking-[0.15em] text-cream-dim uppercase opacity-80 max-w-[320px]"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.8 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Secure your appointment with one of our master barbers today.
          </motion.p>
        </div>

        {/* Floating White Frame Viewport overlay */}
        <motion.div
          className="absolute bottom-[12%] left-[45%] z-30 w-[300px] cursor-pointer max-[960px]:left-auto max-[960px]:right-[10%] max-[960px]:bottom-[10%] max-[640px]:relative max-[640px]:left-auto max-[640px]:right-auto max-[640px]:bottom-auto max-[640px]:mx-auto max-[640px]:w-[260px] group"
          style={{
            scale: frameScale,
            rotate: frameRotate,
            y: frameY,
            x: frameX
          }}
          onClick={onBookClick}
        >
          <div className="bg-cream p-3 pb-[18px] shadow-[0_20px_48px_rgba(0,0,0,0.4)] flex flex-col gap-4 transition-shadow duration-300 hover:shadow-[0_30px_60px_rgba(154,66,45,0.2)]">
            <div className="relative w-full aspect-square overflow-hidden">
              <Image
                src="/transformation_haircut.png"
                alt="Transformation Closeup"
                fill
                sizes="(max-width: 640px) 100vw, 300px"
                className="object-cover object-center transition-transform duration-600 ease-out group-hover:scale-[1.08]"
              />
            </div>
            <div className="text-center pt-1">
              <span className="font-body text-[11px] font-semibold tracking-[0.15em] text-obsidian uppercase relative inline-block">
                Reserve Your Chair
                <span className="absolute bottom-[-4px] left-0 w-full h-[1px] bg-terracotta scale-x-0 origin-center transition-transform duration-350 ease-out group-hover:scale-x-100" />
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
