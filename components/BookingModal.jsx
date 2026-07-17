"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Check, ArrowRight, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { checkBirthdayByEmail, saveBooking, getBookings, getCurrentUserProfile } from "../lib/db";

const SERVICES = [
  { id: 1, name: "Precision Haircut", price: "$65", dur: "45 mins" },
  { id: 2, name: "Signature Hot Shave", price: "$50", dur: "45 mins" },
  { id: 3, name: "Beard Sculpting & Trim", price: "$45", dur: "30 mins" },
  { id: 4, name: "The Ritual (Full Service)", price: "$105", dur: "80 mins" }
];

const ARTISANS = [
  { id: 1, name: "Marcus Thorne", role: "Master Stylist / Founder" },
  { id: 2, name: "Elena Rostova", role: "Lead Artisan / Shave Specialist" },
  { id: 3, name: "Julian Vance", role: "Senior Barber / Skin Fades" }
];

const DATES = [
  { day: "Sat", date: "Jul 11" },
  { day: "Sun", date: "Jul 12" },
  { day: "Mon", date: "Jul 13" },
  { day: "Tue", date: "Jul 14" },
  { day: "Wed", date: "Jul 15" }
];

// Helper: Convert "10:30 AM" to minutes from midnight
function timeStringToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (hours === 12) {
    hours = 0;
  }
  if (modifier === "PM") {
    hours += 12;
  }
  return hours * 60 + minutes;
}

// Helper: Convert minutes from midnight back to "10:30 AM"
function minutesToTimeString(minutes) {
  let hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const modifier = hours >= 12 ? "PM" : "AM";
  if (hours > 12) {
    hours -= 12;
  }
  if (hours === 0) {
    hours = 12;
  }
  const minStr = mins < 10 ? `0${mins}` : mins;
  return `${hours}:${minStr} ${modifier}`;
}

// Helper: Get duration in minutes for any service name
function getServiceDuration(serviceName) {
  const match = SERVICES.find((s) => s.name === serviceName);
  if (match) {
    return parseInt(match.dur.replace(" mins", ""), 10);
  }
  return 45; // Default fallback
}

export default function BookingModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedArtisan, setSelectedArtisan] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  
  // Details form
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", birthday: "" });
  
  // Coupons engine states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, type, value }
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  // Dynamic time slots state
  const [generatedSlots, setGeneratedSlots] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [hasBirthday, setHasBirthday] = useState(false);

  // Load active bookings on open
  useEffect(() => {
    if (isOpen) {
      getBookings().then((list) => {
        setAllBookings(list);
      });
      
      // Pre-populate logged-in user profile details
      const role = localStorage.getItem("bsmart_role");
      const name = localStorage.getItem("bsmart_user");
      if (role === "customer" && name) {
        getCurrentUserProfile().then((profile) => {
          if (profile) {
            setFormData({
              name: profile.name || name,
              email: profile.email || "",
              phone: profile.phone || "",
              birthday: profile.birthday || ""
            });
            if (profile.birthday) {
              setHasBirthday(true);
            }
          } else {
            setFormData((prev) => ({
              ...prev,
              name: name,
              email: name.toLowerCase().includes("aum") ? "aum@bsmart.com" : ""
            }));
          }
        });
      }
    }
  }, [isOpen]);

  // Dynamically check for birthday when email changes
  useEffect(() => {
    const email = formData.email.trim();
    if (email && email.includes("@") && email.includes(".")) {
      checkBirthdayByEmail(email).then((birthday) => {
        if (birthday && birthday !== "Not Provided") {
          setFormData((prev) => ({ ...prev, birthday }));
          setHasBirthday(true);
        } else {
          setHasBirthday(false);
        }
      });
    } else {
      setHasBirthday(false);
    }
  }, [formData.email]);

  // Dynamic slots recalculation hook
  useEffect(() => {
    if (!selectedService || !selectedArtisan || !selectedDate) {
      setGeneratedSlots([]);
      return;
    }

    // 1. Core Shift boundaries (9:00 AM - 6:00 PM)
    const shiftStart = 9 * 60; // 540 mins
    const shiftEnd = 18 * 60; // 1080 mins

    // 2. Lunch Break block (1:00 PM - 2:00 PM)
    const lunchStart = 13 * 60; // 780 mins
    const lunchEnd = 14 * 60; // 840 mins

    // Selected service duration
    const serviceDuration = parseInt(selectedService.dur.replace(" mins", ""), 10);

    // 3. Filter active bookings for overlaps from state
    const stylistBookings = allBookings.filter(
      (b) => b.date === selectedDate && b.artisan === selectedArtisan.name && b.status !== "Cancelled"
    );

    // Map existing bookings to active minute-ranges [start, end]
    const bookedRanges = stylistBookings.map((b) => {
      const start = timeStringToMinutes(b.time);
      const dur = getServiceDuration(b.service);
      return { start, end: start + dur };
    });

    const slots = [];
    let current = shiftStart;

    // 4. Time Generator loop packing consecutive slots
    while (current + serviceDuration <= shiftEnd) {
      // Check for overlap with lunch break
      const overlapLunch = current < lunchEnd && current + serviceDuration > lunchStart;

      // Check for overlap with existing appointments
      let overlapBooking = null;
      for (const range of bookedRanges) {
        if (current < range.end && current + serviceDuration > range.start) {
          overlapBooking = range;
          break;
        }
      }

      if (overlapLunch) {
        // Advance current time to the end of the lunch break
        current = lunchEnd;
      } else if (overlapBooking) {
        // Advance current time to the end of the overlapping booking
        current = overlapBooking.end;
      } else {
        // Valid slot! Save and increment by service duration
        slots.push(minutesToTimeString(current));
        current += serviceDuration;
      }
    }

    setGeneratedSlots(slots);
    setSelectedTime(null); // Clear selected slot when criteria shifts
  }, [selectedService, selectedArtisan, selectedDate, allBookings]);

  if (!isOpen) return null;

  // Coupon apply handler
  const handleApplyCoupon = () => {
    setCouponError("");
    setCouponSuccess("");

    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    // Load coupons list from localStorage
    let couponsList = [];
    try {
      const saved = localStorage.getItem("bsmart_coupons");
      if (saved) {
        couponsList = JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load coupons:", e);
    }

    const match = couponsList.find((c) => c.code.toUpperCase() === code);
    if (match) {
      setAppliedCoupon(match);
      setCouponSuccess(
        match.type === "flat"
          ? `Flat $${match.value} Off applied!`
          : `${match.value}% discount applied!`
      );
    } else {
      setCouponError("Invalid coupon code.");
      setAppliedCoupon(null);
    }
  };

  // Pricing calculations
  const basePrice = selectedService ? parseInt(selectedService.price.replace("$", ""), 10) : 0;
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "flat") {
      discount = appliedCoupon.value;
    } else if (appliedCoupon.type === "percent") {
      discount = Math.round((basePrice * appliedCoupon.value) / 100);
    }
  }
  const finalPrice = Math.max(0, basePrice - discount);

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else if (step === 4) {
      // Save new booking to database (local storage & Supabase)
      const newBooking = {
        id: `b-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        birthday: formData.birthday || "Not Provided",
        service: selectedService.name,
        price: finalPrice,
        discount: discount,
        couponCode: appliedCoupon ? appliedCoupon.code : "None",
        artisan: selectedArtisan.name,
        date: selectedDate,
        time: selectedTime,
        type: "Online",
        status: "Confirmed"
      };

      saveBooking(newBooking).then((res) => {
        if (!res.success) {
          console.error("Failed to save booking:", res.error);
        }
      });

      // Trigger asynchronous Gmail notification send
      fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: newBooking.email,
          name: newBooking.name,
          bookingId: newBooking.id,
          service: newBooking.service,
          artisan: newBooking.artisan,
          date: newBooking.date,
          time: newBooking.time,
          price: newBooking.price,
          status: newBooking.status,
          trackingOrigin: window.location.origin
        })
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.log("Booking confirmation email triggered successfully.", data);
        } else {
          console.error("Email notification API failed:", data.error);
        }
      })
      .catch((err) => {
        console.error("Network error trying to trigger email notification:", err);
      });

      setStep(5);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const isNextDisabled = () => {
    if (step === 1) return !selectedService;
    if (step === 2) return !selectedArtisan;
    if (step === 3) return !selectedDate || !selectedTime;
    if (step === 4) return !formData.name || !formData.email || !formData.phone;
    return false;
  };

  const handleClose = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedArtisan(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setFormData({ name: "", email: "", phone: "", birthday: "" });
    setCouponCode("");
    setAppliedCoupon(null);
    setCouponError("");
    setCouponSuccess("");
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-obsidian/85 backdrop-blur-md" onClick={handleClose}>
        
        {/* Modal Window */}
        <motion.div 
          className="bg-obsidian border border-cream/8 w-full max-w-[600px] max-h-[85vh] flex flex-col relative shadow-[0_24px_64px_rgba(0,0,0,0.5)] overflow-hidden max-[640px]:max-h-[95vh] max-[640px]:w-[95%]" 
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
        >
          {/* Header */}
          <div className="p-6 sm:px-8 border-b border-cream/8 flex justify-between items-center">
            <h3 className="font-display text-[20px] font-medium tracking-[0.05em] uppercase text-cream">Book Appointment</h3>
            <button onClick={handleClose} className="text-cream-dim transition-colors hover:text-cream hover:rotate-90 duration-300 cursor-pointer">
              <X size={20} />
            </button>
          </div>

          {/* Stepper Progress Bar */}
          {step <= 4 && (
            <div className="flex w-full h-[3px] bg-cream/5">
              <div 
                className="h-full bg-terracotta transition-all duration-400" 
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              />
            </div>
          )}

          {/* Body */}
          <div className="p-6 sm:p-8 overflow-y-auto flex-grow">
            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h4 className="font-display text-[18px] font-medium mb-5 text-cream">Select Service</h4>
                <div className="grid grid-cols-1 gap-3">
                  {SERVICES.map((s) => (
                    <div 
                      key={s.id} 
                      className={`border border-cream/8 p-4 cursor-pointer transition-all duration-300 flex justify-between items-center bg-cream/1 hover:border-terracotta/40 hover:bg-terracotta/3 ${
                        selectedService?.id === s.id ? "border-terracotta! bg-terracotta/10!" : ""
                      }`}
                      onClick={() => setSelectedService(s)}
                    >
                      <div>
                        <div className="text-[15px] font-medium text-cream">{s.name}</div>
                        <div className="text-[13px] text-gray">{s.dur}</div>
                      </div>
                      <div className="font-display text-[15px] font-semibold text-terracotta-light">{s.price}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h4 className="font-display text-[18px] font-medium mb-5 text-cream">Choose Stylist</h4>
                <div className="grid grid-cols-1 gap-3">
                  {ARTISANS.map((a) => (
                    <div 
                      key={a.id} 
                      className={`border border-cream/8 p-4 cursor-pointer transition-all duration-300 flex justify-between items-center bg-cream/1 hover:border-terracotta/40 hover:bg-terracotta/3 ${
                        selectedArtisan?.id === a.id ? "border-terracotta! bg-terracotta/10!" : ""
                      }`}
                      onClick={() => setSelectedArtisan(a)}
                    >
                      <div>
                        <div className="text-[15px] font-medium text-cream">{a.name}</div>
                        <div className="text-[13px] text-gray">{a.role}</div>
                      </div>
                      {selectedArtisan?.id === a.id && (
                        <div className="text-terracotta-light">
                          <Check size={18} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h4 className="font-display text-[18px] font-medium mb-5 text-cream">Date & Time</h4>
                <div className="flex flex-col gap-6">
                  <div>
                    <div className="text-[12px] font-semibold tracking-[0.1em] uppercase text-gray mb-2.5">Available Dates</div>
                    <div className="grid grid-cols-3 gap-2.5 max-[480px]:grid-cols-2">
                      {DATES.map((d, i) => (
                        <div 
                          key={i} 
                          className={`border border-cream/8 p-3 text-center cursor-pointer transition-all duration-300 bg-cream/1 text-[13px] font-medium hover:border-terracotta/40 ${
                            selectedDate === d.date ? "border-terracotta! bg-terracotta! text-cream!" : ""
                          }`}
                          onClick={() => setSelectedDate(d.date)}
                        >
                          <div className="text-[11px] opacity-70">{d.day}</div>
                          <div className="font-bold">{d.date}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2.5">
                      <div className="text-[12px] font-semibold tracking-[0.1em] uppercase text-gray">Smart Available Slots</div>
                      <span className="text-[10px] text-terracotta-light uppercase tracking-wider font-bold">
                        Duration: {selectedService?.dur}
                      </span>
                    </div>

                    {generatedSlots.length === 0 ? (
                      <div className="p-6 border border-cream/8 text-center text-xs text-gray uppercase tracking-wider bg-cream/1">
                        {!selectedDate ? "Please select a date first" : "No available slots on this day"}
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2.5 max-[480px]:grid-cols-2">
                        {generatedSlots.map((t, i) => (
                          <div 
                            key={i} 
                            className={`border border-cream/8 p-3 text-center cursor-pointer transition-all duration-300 bg-cream/1 text-[13px] font-medium hover:border-terracotta/40 ${
                              selectedTime === t ? "border-terracotta! bg-terracotta! text-cream!" : ""
                            }`}
                            onClick={() => setSelectedTime(t)}
                          >
                            {t}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h4 className="font-display text-[18px] font-medium mb-5 text-cream">Your Details & Checkout</h4>
                
                {/* Form fields */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-semibold tracking-[0.1em] uppercase text-gray">Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Enter your full name" 
                      className="bg-cream/3 border border-cream/8 p-3 px-4 text-cream font-body text-[14px] outline-none transition-colors duration-300 focus:border-terracotta"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-semibold tracking-[0.1em] uppercase text-gray">Email Address</label>
                      <input 
                        type="email" 
                        required
                        placeholder="name@example.com" 
                        className="bg-cream/3 border border-cream/8 p-3 px-4 text-cream font-body text-[14px] outline-none transition-colors duration-300 focus:border-terracotta"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-semibold tracking-[0.1em] uppercase text-gray">Phone Number</label>
                      <input 
                        type="tel" 
                        required
                        placeholder="+91 9999999999" 
                        className="bg-cream/3 border border-cream/8 p-3 px-4 text-cream font-body text-[14px] outline-none transition-colors duration-300 focus:border-terracotta"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Birthday Date Input */}
                  {!hasBirthday ? (
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-semibold tracking-[0.1em] uppercase text-gray">Birthday</label>
                      <input 
                        type="date" 
                        required
                        className="bg-cream/3 border border-cream/8 p-3 px-4 text-cream font-body text-[14px] outline-none transition-colors duration-300 focus:border-terracotta [&::-webkit-calendar-picker-indicator]:invert"
                        value={formData.birthday}
                        onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                      />
                    </div>
                  ) : (
                    <div className="bg-cream/2 border border-cream/5 p-4 flex items-center justify-between">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-gray uppercase tracking-wider">Birthday Status</span>
                        <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                          <Check size={13} />
                          Verified
                        </span>
                      </div>
                      <span className="text-[10px] text-gray uppercase tracking-widest bg-cream/3 px-2.5 py-1 border border-cream/5 animate-pulse">Already on File</span>
                    </div>
                  )}

                  {/* Coupon Validation Block */}
                  <div className="border-t border-cream/8 pt-4 mt-2">
                    <label className="text-[12px] font-semibold tracking-[0.1em] uppercase text-gray mb-2 block">Apply Promo Coupon</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="E.g. WELCOME10, STUDENT15, FESTIVAL20" 
                        className="bg-cream/3 border border-cream/8 p-3 px-4 text-cream font-body text-[14px] outline-none transition-colors duration-300 focus:border-terracotta flex-grow"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <button 
                        type="button"
                        onClick={handleApplyCoupon}
                        className="bg-cream text-obsidian px-5 font-semibold text-xs uppercase tracking-wider transition-colors hover:bg-terracotta hover:text-cream cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>

                    {/* Coupon Messages */}
                    {couponError && (
                      <div className="text-red-400 text-xs mt-2 tracking-wide font-medium">{couponError}</div>
                    )}
                    {couponSuccess && (
                      <div className="text-emerald-400 text-xs mt-2 tracking-wide font-medium">{couponSuccess}</div>
                    )}

                    {/* Price Breakdown */}
                    <div className="bg-cream/2 border border-cream/5 p-4 mt-4 flex flex-col gap-2 text-xs">
                      <div className="flex justify-between text-cream-dim">
                        <span>Original Service Cost:</span>
                        <span>{selectedService?.price}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-emerald-400">
                          <span>Discount Applied ({appliedCoupon?.code}):</span>
                          <span>-${discount}</span>
                        </div>
                      )}
                      <hr className="border-cream/8 my-1" />
                      <div className="flex justify-between text-sm font-bold text-cream">
                        <span>Total Checkout Price:</span>
                        <span className="text-terracotta-light">${finalPrice}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div 
                className="flex flex-col items-center justify-center text-center py-10 gap-5"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
              >
                <div className="w-20 h-20 rounded-full bg-terracotta/15 border-2 border-terracotta flex items-center justify-center text-terracotta mb-2.5">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                  >
                    <Check size={36} strokeWidth={3} />
                  </motion.div>
                </div>
                <h3 className="font-display text-[26px] font-medium text-cream">Booking Confirmed</h3>
                <p className="text-[15px] leading-[1.6] text-cream-dim max-w-[350px]">
                  Thank you, <strong>{formData.name}</strong>. Your session for <strong>{selectedService?.name}</strong> with <strong>{selectedArtisan?.name}</strong> is scheduled on <strong>{selectedDate} at {selectedTime}</strong>.
                </p>
                {discount > 0 && (
                  <p className="text-xs text-emerald-400 uppercase tracking-wider font-bold">
                    Promo code applied: {appliedCoupon?.code} (Saved ${discount}!)
                  </p>
                )}
                <button 
                  className="bg-cream text-obsidian font-body text-[13px] font-semibold tracking-[0.1em] uppercase px-6 py-3 border border-cream transition-all duration-300 hover:bg-transparent hover:text-cream cursor-pointer mt-5"
                  onClick={handleClose}
                >
                  Done
                </button>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          {step <= 4 && (
            <div className="p-6 sm:px-8 border-t border-cream/8 flex justify-between items-center bg-obsidian/50">
              <button 
                onClick={handleBack} 
                disabled={step === 1}
                className="text-[13px] font-semibold tracking-[0.1em] uppercase text-cream-dim transition-colors hover:text-cream disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                Back
              </button>

              <button 
                onClick={handleNext} 
                disabled={isNextDisabled()}
                className="bg-cream text-obsidian font-body text-[13px] font-semibold tracking-[0.1em] uppercase px-6 py-3 border border-cream transition-all duration-300 hover:bg-transparent hover:text-cream disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
              >
                {step === 4 ? "Confirm" : "Next"}
                {step < 4 && <ArrowRight size={16} />}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
