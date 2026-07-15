"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

const SERVICES_DATA = [
  {
    id: 1,
    num: "01",
    name: "Classic Haircut",
    price: "₹399",
    duration: "40 MINS",
    description:
      "A professional haircut tailored to your face shape and personal style. Includes consultation, shampoo wash, precision cutting using scissors and clippers, neck cleanup, and premium hair styling for a fresh and polished look."
  },
  {
    id: 2,
    num: "02",
    name: "Royal Beard Grooming",
    price: "₹299",
    duration: "30 MINS",
    description:
      "Expert beard trimming and shaping with precise neckline and cheek line detailing. Includes beard wash, hot towel treatment, premium beard oil application, and styling to give your beard a sharp and well-maintained appearance."
  },
  {
    id: 3,
    num: "03",
    name: "Hair Spa & Head Massage",
    price: "₹899",
    duration: "60 MINS",
    description:
      "A nourishing hair spa treatment designed to repair damaged hair and relax your scalp. Includes cleansing shampoo, deep conditioning mask, steam therapy, and a soothing head massage for healthier, shinier hair."
  },
  {
    id: 4,
    num: "04",
    name: "Premium Grooming Package",
    price: "₹1,499",
    duration: "90 MINS",
    description:
      "Our complete grooming experience featuring a classic haircut, beard styling, relaxing head massage, facial cleanup, shampoo wash, premium styling products, and hot towel treatment. Perfect for weddings, parties, and special occasions."
  }
];

export default function Services() {
  const [activeIndex, setActiveIndex] = useState(0);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section id="services" className="bg-obsidian py-[120px] relative">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10">

        {/* Section Header */}
        <motion.div
          className="mb-20 flex flex-col gap-3"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <span className="text-terracotta-light text-[12px] font-semibold tracking-[0.3em] uppercase">
            Meticulous Craftsmanship
          </span>
          <h2 className="font-display text-[32px] sm:text-[42px] font-medium tracking-[0.05em] text-cream uppercase">
            Menu & Services
          </h2>
        </motion.div>

        {/* Services List */}
        <motion.div
          className="flex flex-col"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {SERVICES_DATA.map((service, index) => {
            const isActive = activeIndex === index;

            return (
              <motion.div
                key={service.id}
                className="border-b border-cream/10 py-10 cursor-pointer relative transition-all duration-400 hover:bg-terracotta/3 hover:px-5 first:border-t group"
                variants={itemVariants}
                onClick={() => setActiveIndex(isActive ? -1 : index)}
              >
                {/* Main Row */}
                <div className="flex justify-between items-center gap-5">
                  <div className="flex items-center gap-6">
                    <span className="font-display text-[18px] text-cream/30 font-light transition-colors duration-300 group-hover:text-terracotta-light">
                      {service.num}
                    </span>
                    <h3 className="font-display text-[20px] sm:text-[28px] font-medium tracking-[0.02em] text-cream transition-all duration-400 group-hover:text-terracotta-light group-hover:translate-x-2">
                      {service.name}
                    </h3>
                  </div>
                  <span className="font-display text-[18px] sm:text-[24px] font-semibold text-cream transition-all duration-400 group-hover:text-terracotta-light group-hover:-translate-x-2">
                    {service.price}
                  </span>
                </div>

                {/* Details Drawer */}
                <div
                  className={`transition-all duration-500 overflow-hidden ${isActive ? "max-h-[220px] opacity-100 mt-6" : "max-h-0 opacity-0"
                    }`}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-10 pl-9 md:pl-[54px]">
                    <p className="text-[13px] md:text-[15px] leading-[1.7] text-cream-dim max-w-[700px]">
                      {service.description}
                    </p>
                    <div className="text-[13px] font-medium tracking-[0.1em] text-gray uppercase whitespace-nowrap">
                      <Clock size={14} className="inline-block mr-1.5 align-middle" />
                      <span className="align-middle">{service.duration}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
