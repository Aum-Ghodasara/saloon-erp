"use client";

import React from "react";
import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="about" className="bg-obsidian py-[120px] relative">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center">
          
          {/* Left Column */}
          <motion.div 
            className="flex flex-col gap-5"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
          >
            <span className="text-terracotta-light text-[12px] font-semibold tracking-[0.3em] uppercase">
              Our Heritage
            </span>
            <h2 className="font-display text-[32px] sm:text-[42px] font-medium tracking-[0.05em] text-cream uppercase leading-[1.2]">
              A Sanctuary of Quiet Luxury
            </h2>
            <p className="text-base leading-[1.8] text-cream-dim mt-2.5">
              B Smart Salon was established to restore grooming as an intentional ritual rather than a routine errand. We combine standard-bearing classical barbering with contemporary structural design principles.
            </p>
            <p className="text-base leading-[1.8] text-cream-dim">
              Every service begins with a personal styling dialogue, analyzing your hair texture, growth pattern, and facial geometry. Here, we carve out confidence and craft styles that endure.
            </p>
          </motion.div>

          {/* Right Column */}
          <motion.div 
            className="flex flex-col gap-8 border-t md:border-t-0 md:border-l border-cream/8 pt-10 md:pt-0 pl-0 md:pl-[60px]"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <div className="flex flex-col gap-2">
              <h3 className="font-display text-[20px] font-medium tracking-[0.05em] text-cream uppercase">
                01. Precision
              </h3>
              <p className="text-[14px] leading-[1.6] text-gray">
                We view hair styling as a form of architecture. Every cut and shave is executed with microscopic focus and sharp structural lines.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="font-display text-[20px] font-medium tracking-[0.05em] text-cream uppercase">
                02. Intention
              </h3>
              <p className="text-[14px] leading-[1.6] text-gray">
                We refuse to rush. Our sessions are timed to ensure proper scalp preparation, warm towel therapy, and meticulous styling detailing.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="font-display text-[20px] font-medium tracking-[0.05em] text-cream uppercase">
                03. Sanctuary
              </h3>
              <p className="text-[14px] leading-[1.6] text-gray">
                An atmosphere designed for peace. Deep wood tones, soft leather seats, ambient soundscapes, and premium refreshments to put you at absolute ease.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
