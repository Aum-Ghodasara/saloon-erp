"use client";

import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { saveReview } from "../lib/db";

const AVATARS = [
  { id: "av-1", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80", gender: "F" },
  { id: "av-2", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80", gender: "M" },
  { id: "av-3", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80", gender: "F" },
  { id: "av-4", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80", gender: "M" }
];

const ARTISANS = [
  "Marcus Thorne",
  "Elena Rostova",
  "Julian Vance"
];

export default function LeaveReview() {
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState(null);
  
  // Rating factors
  const [staffRating, setStaffRating] = useState(5); // Stylist Skill
  const [serviceRating, setServiceRating] = useState(5); // Service Care
  const [salonRating, setSalonRating] = useState(5); // Salon Vibe
  const [cleanlinessRating, setCleanlinessRating] = useState(5); // Cleanliness
  
  const [selectedArtisan, setSelectedArtisan] = useState(ARTISANS[0]);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].url);
  const [comment, setComment] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if customer is logged in to auto-fill details
    const role = localStorage.getItem("bsmart_role");
    const name = localStorage.getItem("bsmart_user");
    if (role === "customer" && name) {
      setUserRole(role);
      setUserName(name);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userName.trim() || !comment.trim()) return;

    const newReview = {
      id: `rev-${Date.now()}`,
      name: userName,
      avatar: selectedAvatar,
      artisan: selectedArtisan, // stylist being rated
      staffRating, // star score for stylist
      serviceRating,
      salonRating,
      cleanlinessRating,
      comment,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      reply: ""
    };

    const res = await saveReview(newReview);
    if (res.success) {
      // Trigger update on Clientele component by dispatching custom event
      window.dispatchEvent(new Event("bsmart_reviews_updated"));
      
      setSuccess(true);
      setComment("");
    } else {
      alert("Failed to submit review: " + (res.error || "Unknown error"));
    }
  };

  // Helper component to render clickable stars
  const StarSelector = ({ value, onChange, label }) => {
  const [hoverValue, setHoverValue] = useState(0);

  return (
    <div className="flex justify-between items-center bg-cream/2 p-3 border border-cream/5">
      <span className="text-xs uppercase tracking-wider font-semibold text-cream-dim">
        {label}
      </span>

      <div
        className="flex gap-1.5"
        onMouseLeave={() => setHoverValue(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const active = star <= (hoverValue || value);

          return (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverValue(star)}
              onClick={() => onChange(star)}
              className="cursor-pointer transition-transform duration-200 hover:scale-125"
            >
              <Star
                size={18}
                className={`transition-all duration-200 ${
                  active
                    ? "text-terracotta fill-terracotta"
                    : "text-gray-500"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

  return (
    <section className="bg-obsidian pb-[120px] relative border-b border-cream/5">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 flex justify-center">
        <div className="w-full max-w-[650px] bg-charcoal/30 border border-cream/8 p-8 sm:p-10 backdrop-blur-md">
          <div className="text-center mb-8 flex flex-col gap-2">
            <span className="text-terracotta-light text-[11px] font-semibold tracking-[0.25em] uppercase">Share Your Experience</span>
            <h2 className="font-display text-2xl sm:text-3xl font-medium tracking-wide uppercase text-cream">Leave A Review</h2>
            <div className="w-10 h-[1px] bg-cream opacity-20 mx-auto mt-2" />
          </div>

          {success ? (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-8 text-center flex flex-col items-center gap-3 border border-emerald-500/20 bg-emerald-500/5"
            >
              <div className="w-12 h-12 rounded-full border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Star size={20} className="fill-emerald-400" />
              </div>
              <h3 className="font-display text-lg font-bold text-cream uppercase">Review Submitted</h3>
              <p className="text-xs text-cream-dim max-w-[280px]">Thank you for your rating! Your comments have been shared and will display in testimonials shortly.</p>
              <button 
                onClick={() => setSuccess(false)}
                className="mt-4 bg-cream text-obsidian px-5 py-2 font-semibold text-[10px] uppercase tracking-wider border border-cream transition-colors hover:bg-transparent hover:text-cream cursor-pointer"
              >
                Submit Another Review
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              {/* Avatar Selector */}
              <div className="flex flex-col gap-2 bg-cream/2 p-4 border border-cream/5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-gray mb-1">Select Guest Portrait Profile</label>
                <div className="flex gap-4 justify-center">
                  {AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setSelectedAvatar(av.url)}
                      className={`relative w-12 h-12 rounded-full overflow-hidden border-2 cursor-pointer transition-all ${
                        selectedAvatar === av.url ? "border-terracotta scale-110" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={av.url} alt="Profile Avatar" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Stylist Selector Dropdown */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-gray">Select Stylist Rated</label>
                <select 
                  value={selectedArtisan}
                  onChange={(e) => setSelectedArtisan(e.target.value)}
                  className="bg-cream/3 border border-cream/8 p-3 px-4 text-cream font-body text-sm outline-none transition-colors focus:border-terracotta [&>option]:bg-charcoal"
                >
                  {ARTISANS.map((art) => (
                    <option key={art} value={art}>
                      {art}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ratings grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <StarSelector label="Stylist Skill" value={staffRating} onChange={setStaffRating} />
                <StarSelector label="Service Care" value={serviceRating} onChange={setServiceRating} />
                <StarSelector label="Salon Vibe" value={salonRating} onChange={setSalonRating} />
                <StarSelector label="Cleanliness" value={cleanlinessRating} onChange={setCleanlinessRating} />
              </div>

              {/* Author name input */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-gray">Client Name</label>
                <input 
                  type="text" 
                  required
                  disabled={userRole === "customer"}
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="E.g. Aum Patel"
                  className="bg-cream/3 border border-cream/8 p-3.5 text-cream font-body text-sm outline-none transition-colors focus:border-terracotta disabled:opacity-70 disabled:cursor-not-allowed"
                />
                {userRole === "customer" && (
                  <span className="text-[9px] text-emerald-400 uppercase tracking-widest font-semibold mt-0.5">✓ Authenticated customer profile</span>
                )}
              </div>

              {/* Comment text */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-gray">Your Comments</label>
                <textarea 
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about your service, haircut precision, or general salon vibes..."
                  className="bg-cream/3 border border-cream/8 p-3.5 text-cream font-body text-sm outline-none transition-colors focus:border-terracotta resize-none"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-cream text-obsidian font-body text-xs font-bold tracking-widest uppercase py-4 border border-cream mt-2 transition-all duration-300 hover:bg-transparent hover:text-cream cursor-pointer"
              >
                Submit Review
              </button>
            </form>
          )}

        </div>
      </div>
    </section>
  );
}
