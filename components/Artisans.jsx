"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const ARTISANS_DATA = [
  {
    id: 1,
    name: "Marcus Thorne",
    role: "Master Stylist & Founder",
    image: "/artisan_marcus.png",
    bio: "With over 15 years of experience styling in London and New York, Marcus specializes in high-precision structural shapes and custom classic styles. He designs haircuts to complement natural hair flow and bone structure."
  },
  {
    id: 2,
    name: "Elena Rostova",
    role: "Lead Artisan",
    image: "/artisan_elena.png",
    bio: "Elena's meticulous detailing and eye for modern textured crops have earned her a loyal following. She is also our resident straight razor shave specialist, delivering the ultimate skin treatment and hot towel rituals."
  },
  {
    id: 3,
    name: "Julian Vance",
    role: "Senior Barber",
    image: "/artisan_julian.png",
    bio: "Julian brings a contemporary streetwear aesthetic to classic grooming, mastering skin fades, hair design, and progressive styling. He is dedicated to hair art, sharp line geometry, and styling education."
  }
];

export default function Artisans() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section id="artisans" className="bg-charcoal py-[120px] border-t border-b border-cream/5">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10">
        
        {/* Section Header */}
        <motion.div
          className="mb-20 text-center flex flex-col items-center gap-3"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <span className="text-terracotta-light text-[12px] font-semibold tracking-[0.3em] uppercase">
            Meet the Masters
          </span>
          <h2 className="font-display text-[32px] sm:text-[42px] font-medium tracking-[0.05em] text-cream uppercase">
            Our Artisans
          </h2>
        </motion.div>

        {/* Artisans Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {ARTISANS_DATA.map((artisan) => (
            <motion.div
              key={artisan.id}
              className="flex flex-col bg-obsidian border border-cream/5 overflow-hidden transition-all duration-400 h-full hover:-translate-y-2 hover:border-terracotta/30 hover:shadow-[0_12px_30px_rgba(0,0,0,0.3)] group"
              variants={cardVariants}
            >
              {/* Image Container */}
              <div className="relative w-full aspect-[4/5] overflow-hidden after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:to-obsidian/80 after:z-10 after:opacity-60 after:transition-opacity after:duration-300 group-hover:after:opacity-90">
                <Image
                  src={artisan.image}
                  alt={artisan.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.06]"
                />
              </div>

              {/* Info Container */}
              <div className="p-7 flex flex-col gap-3 flex-grow">
                <span className="text-[11px] font-semibold tracking-[0.15em] text-terracotta-light uppercase">
                  {artisan.role}
                </span>
                <h3 className="font-display text-2xl font-medium tracking-[0.02em] text-cream">
                  {artisan.name}
                </h3>
                <p className="text-sm leading-relaxed text-cream-dim">
                  {artisan.bio}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
