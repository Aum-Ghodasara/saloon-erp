"use client";

import React from "react";
import { motion } from "framer-motion";

export default function Contact({ onBookClick }) {
  return (
    <footer 
      id="contact" 
      className="relative w-full py-[120px] pb-20 bg-cover bg-center border-t border-cream/5 overflow-hidden"
      style={{ 
        backgroundImage: "linear-gradient(rgba(8, 8, 8, 0.72) 0%, rgba(8, 8, 8, 0.82) 100%), url('/barbershop_floor.png')" 
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 mb-16">
          
          {/* Column 1: Address & Statement Links */}
          <motion.div 
            className="flex flex-col justify-between gap-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-col gap-4">
              <p className="font-body text-[13px] leading-[1.8] tracking-[0.08em] text-cream uppercase">
                F-5,6, Iskon Temple Radha mohan Complex, nr. Kaka Pan Parlour, Mota Bazaar, Vallabh Vidyanagar, Anand, Gujarat 388120
              </p>
            </div>
            
            <div className="flex flex-col gap-3 mt-6">
              <a href="#accessibility" className="font-body text-[11px] font-medium tracking-[0.1em] text-cream-dim uppercase transition-all duration-300 hover:text-terracotta-light hover:translate-x-1 block w-fit">Accessibility Statement</a>
              <a href="#terms" className="font-body text-[11px] font-medium tracking-[0.1em] text-cream-dim uppercase transition-all duration-300 hover:text-terracotta-light hover:translate-x-1 block w-fit">Terms & Conditions</a>
              <a href="#privacy" className="font-body text-[11px] font-medium tracking-[0.1em] text-cream-dim uppercase transition-all duration-300 hover:text-terracotta-light hover:translate-x-1 block w-fit">Privacy Policy</a>
              <a href="#refund" className="font-body text-[11px] font-medium tracking-[0.1em] text-cream-dim uppercase transition-all duration-300 hover:text-terracotta-light hover:translate-x-1 block w-fit">Refund Policy</a>
            </div>
          </motion.div>

          {/* Column 2: Phone/Email & Copyright Info */}
          <motion.div 
            className="flex flex-col justify-between gap-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <div className="flex flex-col gap-4">
              <p className="font-body text-[13px] leading-[1.8] tracking-[0.08em] text-cream uppercase">
                +91 7433825559<br />
                <a href="mailto:info@mysite.com" className="font-body text-[11px] font-medium tracking-[0.1em] text-cream-dim uppercase transition-all duration-300 hover:text-terracotta-light hover:translate-x-1 block w-fit lowercase">
                  info@mysite.com
                </a>
              </p>
            </div>

            <div className="flex flex-col gap-3 mt-6">
              <p className="font-body text-[13px] leading-[1.8] tracking-[0.08em] text-cream uppercase" style={{ fontSize: "11px", color: "var(--color-gray)" }}>
                &copy; 2026 by B Smart Salon.
              </p>
            </div>
          </motion.div>

          {/* Column 3: Large Call To Action Split Box */}
          <motion.div 
            className="flex flex-col justify-center gap-8 md:col-span-1"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div 
              className="flex w-full border border-cream cursor-pointer transition-all duration-400 bg-obsidian/40 self-start hover:-translate-y-1 hover:border-terracotta-light hover:shadow-[0_12px_30px_rgba(154,66,45,0.25)] group"
              onClick={onBookClick}
            >
              <div className="flex-[1.3] p-6 flex items-center border-r border-cream transition-all duration-400 group-hover:border-terracotta-light">
                <span className="font-body text-[11px] font-medium leading-[1.5] tracking-[0.12em] text-cream uppercase">
                  Experience the sharpest cuts in the city
                </span>
              </div>
              
              <div className="flex-1 bg-cream text-obsidian p-6 flex items-center justify-center text-center transition-all duration-400 group-hover:bg-terracotta group-hover:text-cream">
                <span className="font-body text-[11px] font-bold leading-[1.4] tracking-[0.12em] text-center uppercase">
                  Book your session
                </span>
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </footer>
  );
}
