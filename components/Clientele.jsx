"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { getReviews } from "../lib/db";

const TESTIMONIALS_DEFAULT = [
  {
    id: "rev-default-1",
    name: "Rahul Patel",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    artisan: "Rohan Patel",
    comment:
      "I've been coming here for over a year now. Every haircut is clean, stylish, and exactly how I want it. The staff is friendly and the service is always excellent.",
    staffRating: 5,
    serviceRating: 5,
    salonRating: 5,
    cleanlinessRating: 5,
    date: "14 Jul 2026",
    reply:
      "Thank you, Rahul! We truly appreciate your trust and look forward to serving you again."
  },
  {
    id: "rev-default-2",
    name: "Priya Shah",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    artisan: "Neha Sharma",
    comment:
      "Absolutely loved the hair spa and haircut. The salon is clean, hygienic, and the team is very professional. Highly recommended!",
    staffRating: 5,
    serviceRating: 5,
    salonRating: 5,
    cleanlinessRating: 5,
    date: "12 Jul 2026",
    reply: ""
  },
  {
    id: "rev-default-3",
    name: "Aarav Mehta",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80",
    artisan: "Karan Joshi",
    comment:
      "The beard styling was done perfectly. They really understand face shape and grooming. Easily one of the best salons in town.",
    staffRating: 5,
    serviceRating: 5,
    salonRating: 5,
    cleanlinessRating: 5,
    date: "10 Jul 2026",
    reply: ""
  },
  {
    id: "rev-default-4",
    name: "Sneha Desai",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80",
    artisan: "Riya Patel",
    comment:
      "Booked my appointment online and everything was smooth. Loved the haircut and styling. The ambience is beautiful and relaxing.",
    staffRating: 5,
    serviceRating: 5,
    salonRating: 5,
    cleanlinessRating: 4,
    date: "08 Jul 2026",
    reply:
      "Thank you, Sneha! We're glad you enjoyed your visit. See you again soon."
  },
  {
    id: "rev-default-5",
    name: "Vivek Shah",
    avatar: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=120&auto=format&fit=crop&q=80",
    artisan: "Amit Solanki",
    comment:
      "Very professional staff and great attention to detail. The haircut and head massage were worth every rupee.",
    staffRating: 5,
    serviceRating: 5,
    salonRating: 5,
    cleanlinessRating: 5,
    date: "06 Jul 2026",
    reply: ""
  },
  {
    id: "rev-default-6",
    name: "Nisha Patel",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
    artisan: "Pooja Mehta",
    comment:
      "Wonderful experience from start to finish. The staff listened carefully to what I wanted and the results were amazing.",
    staffRating: 5,
    serviceRating: 5,
    salonRating: 5,
    cleanlinessRating: 5,
    date: "05 Jul 2026",
    reply:
      "Thank you, Nisha! It was a pleasure serving you."
  }
];


export default function Clientele() {
  const [reviews, setReviews] = useState([]);

  const loadReviews = async () => {
    try {
      const list = await getReviews();
      if (list && list.length > 0) {
        setReviews(list);
      } else {
        setReviews(TESTIMONIALS_DEFAULT);
      }
    } catch (e) {
      console.error("Failed to load reviews:", e);
      setReviews(TESTIMONIALS_DEFAULT);
    }
  };

  useEffect(() => {
    loadReviews();

    // Listen for reviews update event
    window.addEventListener("bsmart_reviews_updated", loadReviews);
    return () => window.removeEventListener("bsmart_reviews_updated", loadReviews);
  }, []);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section className="bg-obsidian py-[120px] relative border-b border-cream/5">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10">
        
        {/* Section Header */}
        <motion.div
          className="text-center mb-20 flex flex-col items-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <h2 className="font-display text-[32px] sm:text-[44px] font-normal leading-[1.2] tracking-[0.02em] text-cream max-w-[600px]">
            Hear It from Our<br />Clientele
          </h2>
        </motion.div>

        {/* Quote Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {reviews.map((t) => {
            // Compute average stars
            const avg = Math.round((t.staffRating + t.serviceRating + t.salonRating + t.cleanlinessRating) / 4);

            return (
              <motion.div
                key={t.id}
                className="bg-cream text-obsidian p-8 sm:p-10 flex flex-col justify-between min-h-[300px] shadow-lg transition-all duration-400 relative hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(154,66,45,0.15)] group"
                variants={cardVariants}
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <Quote className="text-obsidian opacity-90 transition-all duration-300 group-hover:text-terracotta group-hover:scale(1.1) group-hover:-rotate-[5deg]" size={28} fill="currentColor" />
                    {/* Average Stars */}
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={12} 
                          className={`${
                            star <= avg ? "text-terracotta fill-terracotta" : "text-obsidian/20"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-[15px] leading-[1.7] font-normal text-[#333] mb-5">
                    "{t.comment}"
                  </p>

                  {/* Admin Reply Block */}
                  {t.reply && (
                    <div className="bg-obsidian/5 border-l-2 border-terracotta p-3 mt-4 mb-6 rounded-r">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-terracotta mb-1">
                        Response from B Smart Salon
                      </div>
                      <p className="text-xs italic text-[#444] leading-relaxed">
                        "{t.reply}"
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <hr className="border-none border-t border-dotted border-obsidian/30 mb-5" />
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-3">
                      <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover border border-obsidian/10" />
                      <div className="flex flex-col text-left">
                        <span className="font-body italic text-[14px] font-medium text-[#1a1a1a] leading-none">{t.name}</span>
                        <span className="text-[8px] text-obsidian/50 mt-1 uppercase font-bold tracking-wider">
                          Rated {t.artisan?.split(" ")[0] || "Stylist"}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-obsidian/50 font-medium">{t.date}</span>
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
