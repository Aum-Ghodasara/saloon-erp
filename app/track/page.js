"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Scissors, Calendar, Clock, User, DollarSign, 
  CheckCircle, ArrowLeft, XCircle, AlertCircle, 
  Sparkles, ShieldCheck, MapPin, Phone, HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GeomText from "../../components/GeomText";
import { getBookings, updateBookingStatus } from "../../lib/db";

function TrackStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingIdParam = searchParams.get("id") || "";

  const [searchId, setSearchId] = useState(bookingIdParam);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [conciergeMsg, setConciergeMsg] = useState("");

  // Load and watch booking details
  useEffect(() => {
    const idToLookup = bookingIdParam || searchId;
    if (!idToLookup) {
      setLoading(false);
      setBooking(null);
      return;
    }

    setLoading(true);
    setErrorMsg("");

    // Look up booking in database (Supabase / LocalStorage)
    const fetchBookingDetails = async () => {
      try {
        const list = await getBookings();
        const match = list.find((b) => b.id.toLowerCase() === idToLookup.toLowerCase().trim());
        if (match) {
          setBooking(match);
        } else {
          setBooking(null);
          if (bookingIdParam) {
            setErrorMsg(`Booking reference "${idToLookup}" was not found.`);
          }
        }
      } catch (err) {
        console.error("Error reading bookings:", err);
        setErrorMsg("Failed to access booking database.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingIdParam, searchId]);

  // Cancel handler
  const handleCancel = async () => {
    if (!booking) return;
    if (window.confirm("Are you sure you want to cancel this appointment session?")) {
      try {
        const res = await updateBookingStatus(booking.id, "Cancelled");
        if (res.success) {
          // Update local status
          setBooking({ ...booking, status: "Cancelled" });
          setConciergeMsg("Your appointment was cancelled. We hope to see you again soon!");

          // Notify API that booking status changed to Cancelled (optional logging/mail)
          fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: booking.email,
              name: booking.name,
              bookingId: booking.id,
              service: booking.service,
              artisan: booking.artisan,
              date: booking.date,
              time: booking.time,
              price: booking.price,
              status: "Cancelled",
              trackingOrigin: window.location.origin
            })
          }).catch((err) => console.error("Failed to send cancellation notification:", err));
        }
      } catch (err) {
        console.error("Cancel error:", err);
      }
    }
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      router.push(`/track?id=${searchId.trim()}`);
    }
  };

  // Determine stage active classes
  const getStageStatus = (stage) => {
    if (!booking) return "waiting";
    const status = booking.status; // "Confirmed" (Placed), "Serving" (Active), "Completed", "Cancelled", "No Show"

    if (status === "Cancelled" || status === "No Show") {
      return "failed";
    }

    if (stage === 1) {
      return "completed"; // Booking is always placed
    }
    if (stage === 2) {
      if (status === "Completed") return "completed";
      if (status === "Serving") return "active";
      return "waiting";
    }
    if (stage === 3) {
      if (status === "Completed") return "completed";
      return "waiting";
    }
    return "waiting";
  };

  return (
    <div className="relative min-h-screen w-full bg-obsidian text-cream flex flex-col justify-between py-12 px-6 overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(154,66,45,0.06)_0%,rgba(8,8,8,0.98)_80%)] z-0 pointer-events-none" />
      <div className="noise-overlay" />

      {/* Header */}
      <header className="relative w-full max-w-[800px] mx-auto flex items-center justify-between z-10 mb-8">
        <button 
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-xs font-semibold tracking-wider text-cream-dim uppercase transition-colors hover:text-cream cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back to Salon
        </button>

        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
          <Scissors className="text-cream rotate-[-45deg]" size={14} />
          <GeomText text="B" size="10px" strokeWidth={8} color="#f9f6f0" animate={false} />
          <GeomText text="SMART" size="10px" strokeWidth={8} color="#f9f6f0" animate={false} />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative w-full max-w-[650px] mx-auto bg-charcoal/40 border border-cream/8 backdrop-blur-md p-8 sm:p-10 flex flex-col shadow-[0_24px_64px_rgba(0,0,0,0.6)] z-10 flex-grow mb-8">
        
        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <Scissors size={40} className="text-terracotta rotate-[-45deg] animate-spin" />
            <h3 className="font-display text-lg uppercase tracking-wider text-cream-dim">Retrieving Grooming Record...</h3>
          </div>
        ) : !booking ? (
          /* Search / Reference Not Found State */
          <div className="flex flex-col gap-6 py-6">
            <div className="text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-cream/3 border border-cream/8 flex items-center justify-center text-cream">
                <Scissors size={20} className="rotate-[-45deg] text-terracotta-light" />
              </div>
              <h2 className="font-display text-2xl font-bold uppercase tracking-wider mt-2">Track Appointment</h2>
              <p className="text-xs text-gray uppercase tracking-widest max-w-[400px] leading-relaxed mx-auto">
                Check status, manage scheduling or cancel your active salon session in real-time.
              </p>
            </div>

            {errorMsg && (
              <div className="flex items-start gap-3 bg-terracotta/10 border border-terracotta/30 p-4 text-cream text-sm">
                <AlertCircle size={18} className="text-terracotta-light shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleManualSearch} className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold tracking-wider text-gray uppercase">
                  Booking Reference ID
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    required
                    placeholder="E.g. b-1721151624890" 
                    className="bg-cream/3 border border-cream/8 p-3.5 px-4 text-cream font-body text-[14px] outline-none transition-colors duration-300 focus:border-terracotta flex-grow"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                  />
                  <button 
                    type="submit"
                    className="bg-cream text-obsidian px-6 font-semibold text-xs uppercase tracking-wider transition-colors hover:bg-terracotta hover:text-cream cursor-pointer"
                  >
                    Locate
                  </button>
                </div>
              </div>
            </form>

            <div className="border-t border-cream/8 pt-6 flex flex-col gap-3 text-xs text-cream-dim leading-relaxed">
              <span className="text-terracotta-light font-bold uppercase tracking-wider text-[10px]">How tracking works:</span>
              <p>When you finish booking an artisan session, we email you a receipt with a tracking link. Use that direct link or enter the booking ID above to see live updates as the admin updates your queue status from "Confirmed" to "Serving" and finally "Completed".</p>
            </div>
          </div>
        ) : (
          /* Booking Details & Progression State */
          <div className="flex flex-col gap-8">
            
            {/* Header & Status Ribbon */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-cream/8 pb-6">
              <div>
                <span className="text-[10px] font-bold text-terracotta-light uppercase tracking-[0.2em]">Live Tracking Session</span>
                <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-cream mt-1">Ref: {booking.id}</h2>
              </div>
              
              {/* Dynamic Status Badge */}
              <div className="self-start sm:self-center">
                {booking.status === "Confirmed" && (
                  <span className="bg-amber-500/10 border border-amber-500/35 text-amber-300 font-semibold px-3.5 py-1.5 text-xs uppercase tracking-widest rounded flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    Confirmed
                  </span>
                )}
                {booking.status === "Serving" && (
                  <span className="bg-terracotta/20 border border-terracotta-light text-terracotta-light font-semibold px-3.5 py-1.5 text-xs uppercase tracking-widest rounded flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    In Service
                  </span>
                )}
                {booking.status === "Completed" && (
                  <span className="bg-emerald-500/10 border border-emerald-500/35 text-emerald-300 font-semibold px-3.5 py-1.5 text-xs uppercase tracking-widest rounded flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-400" />
                    Completed
                  </span>
                )}
                {booking.status === "Cancelled" && (
                  <span className="bg-cream/5 border border-cream/10 text-gray font-semibold px-3.5 py-1.5 text-xs uppercase tracking-widest rounded flex items-center gap-2">
                    <XCircle size={14} className="text-gray" />
                    Cancelled
                  </span>
                )}
                {booking.status === "No Show" && (
                  <span className="bg-red-500/10 border border-red-500/35 text-red-400 font-semibold px-3.5 py-1.5 text-xs uppercase tracking-widest rounded flex items-center gap-2">
                    <XCircle size={14} className="text-red-400" />
                    No Show
                  </span>
                )}
              </div>
            </div>

            {/* Notification alert / Concierge messages */}
            {conciergeMsg && (
              <div className="bg-cream/3 border border-cream/8 p-4 text-cream-dim text-xs flex gap-3 items-center animate-[fadeIn_0.3s_ease]">
                <Sparkles size={16} className="text-terracotta-light shrink-0" />
                <span>{conciergeMsg}</span>
              </div>
            )}

            {/* Tracking Progression Timeline */}
            {booking.status !== "Cancelled" && booking.status !== "No Show" && (
              <div className="flex flex-col gap-4 py-2">
                <h4 className="text-[11px] font-bold text-gray uppercase tracking-widest">Progress Timeline</h4>
                <div className="grid grid-cols-3 gap-2 relative">
                  
                  {/* Timeline Horizontal connecting line */}
                  <div className="absolute top-[17px] left-[15%] right-[15%] h-[2px] bg-cream/10 z-0" />
                  
                  {/* Timeline progress overlay */}
                  <div 
                    className="absolute top-[17px] left-[15%] h-[2px] bg-terracotta-light z-0 transition-all duration-700 ease-out" 
                    style={{
                      width: booking.status === "Completed" ? "70%" : booking.status === "Serving" ? "35%" : "0%"
                    }}
                  />

                  {/* Step 1: Confirmed */}
                  <div className="flex flex-col items-center text-center z-10">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border text-xs font-semibold ${
                      getStageStatus(1) === "completed" 
                        ? "bg-terracotta text-cream border-terracotta-light" 
                        : "bg-obsidian border-cream/10 text-gray"
                    }`}>
                      1
                    </div>
                    <span className="text-[11px] mt-2 font-medium tracking-wide uppercase">Confirmed</span>
                    <span className="text-[9px] text-gray uppercase tracking-wider mt-0.5">Booking Placed</span>
                  </div>

                  {/* Step 2: Serving */}
                  <div className="flex flex-col items-center text-center z-10">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border text-xs font-semibold transition-colors duration-500 ${
                      getStageStatus(2) === "completed" 
                        ? "bg-terracotta text-cream border-terracotta-light" 
                        : getStageStatus(2) === "active" 
                        ? "bg-amber-500/10 text-amber-300 border-amber-400 animate-pulse" 
                        : "bg-obsidian border-cream/10 text-gray"
                    }`}>
                      2
                    </div>
                    <span className={`text-[11px] mt-2 font-medium tracking-wide uppercase ${getStageStatus(2) === "active" ? "text-amber-300" : ""}`}>Active Session</span>
                    <span className="text-[9px] text-gray uppercase tracking-wider mt-0.5">Styling Now</span>
                  </div>

                  {/* Step 3: Completed */}
                  <div className="flex flex-col items-center text-center z-10">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border text-xs font-semibold ${
                      getStageStatus(3) === "completed" 
                        ? "bg-terracotta text-cream border-terracotta-light" 
                        : "bg-obsidian border-cream/10 text-gray"
                    }`}>
                      3
                    </div>
                    <span className="text-[11px] mt-2 font-medium tracking-wide uppercase">Groomed</span>
                    <span className="text-[9px] text-gray uppercase tracking-wider mt-0.5">Completed</span>
                  </div>

                </div>
              </div>
            )}

            {/* Custom Status Descriptions */}
            <div className="bg-cream/2 border border-cream/5 p-4 text-xs text-cream-dim leading-relaxed">
              {booking.status === "Confirmed" && (
                <p><strong>Appointment Confirmed:</strong> We have locked your slot with <strong>{booking.artisan}</strong>. Please arrive 5-10 minutes prior to your schedule. Show this tracking page or your email receipt at check-in.</p>
              )}
              {booking.status === "Serving" && (
                <p><strong>You are in the Chair!</strong> <strong>{booking.artisan}</strong> is currently serving you. We hope you are enjoying your premium grooming session. Sit back, relax, and savor the ritual.</p>
              )}
              {booking.status === "Completed" && (
                <p><strong>Grooming Complete:</strong> We hope you had an exceptional grooming experience! Your session has been finalized. We'd appreciate it if you could <span className="text-terracotta-light cursor-pointer underline hover:text-cream" onClick={() => router.push("/customer")}>leave us a review</span> in your dashboard.</p>
              )}
              {booking.status === "Cancelled" && (
                <p><strong>Cancelled:</strong> This session has been marked as cancelled. If this is a mistake or you wish to schedule a new experience, please tap "Book New Session" below.</p>
              )}
              {booking.status === "No Show" && (
                <p><strong>No Show:</strong> The appointment was marked as a no-show because you were unable to attend the scheduled slot. Contact support if you need to discuss or request options.</p>
              )}
            </div>

            {/* Booking Specifics */}
            <div className="flex flex-col gap-3">
              <h4 className="text-[11px] font-bold text-gray uppercase tracking-widest">Appointment Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-cream/2 border border-cream/5 p-5">
                
                <div className="flex items-center gap-3">
                  <User size={16} className="text-terracotta-light shrink-0" />
                  <div>
                    <span className="text-[9px] text-gray uppercase tracking-wider block">Customer Name</span>
                    <span className="text-xs font-semibold text-cream">{booking.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Scissors size={16} className="text-terracotta-light shrink-0" />
                  <div>
                    <span className="text-[9px] text-gray uppercase tracking-wider block">Selected Service</span>
                    <span className="text-xs font-semibold text-cream">{booking.service}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User size={16} className="text-terracotta-light shrink-0" />
                  <div>
                    <span className="text-[9px] text-gray uppercase tracking-wider block">Artisan Stylist</span>
                    <span className="text-xs font-semibold text-cream">{booking.artisan}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-terracotta-light shrink-0" />
                  <div>
                    <span className="text-[9px] text-gray uppercase tracking-wider block">Scheduled Date</span>
                    <span className="text-xs font-semibold text-cream">{booking.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-terracotta-light shrink-0" />
                  <div>
                    <span className="text-[9px] text-gray uppercase tracking-wider block">Time Slot</span>
                    <span className="text-xs font-semibold text-cream">{booking.time}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DollarSign size={16} className="text-terracotta-light shrink-0" />
                  <div>
                    <span className="text-[9px] text-gray uppercase tracking-wider block">Amount Settled</span>
                    <span className="text-xs font-bold text-terracotta-light">${booking.price}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Actions Panel */}
            <div className="flex flex-col sm:flex-row gap-3 border-t border-cream/8 pt-6 justify-between items-center">
              
              <button 
                onClick={() => router.push(booking.status === "Cancelled" ? "/" : `/track` /* reset tracking */)}
                className="text-xs font-semibold tracking-wider text-cream-dim uppercase hover:text-cream transition-colors cursor-pointer"
              >
                Track Another ID
              </button>

              <div className="flex gap-2">
                {/* Cancel Button - Only if Confirmed */}
                {booking.status === "Confirmed" && (
                  <button 
                    onClick={handleCancel}
                    className="bg-transparent border border-terracotta/35 text-terracotta-light px-5 py-2.5 font-semibold text-[11px] uppercase tracking-wider hover:bg-terracotta/10 hover:border-terracotta transition-all cursor-pointer"
                  >
                    Cancel Session
                  </button>
                )}

                {/* Redirect / Book Button */}
                <button 
                  onClick={() => router.push("/")}
                  className="bg-cream text-obsidian px-5 py-2.5 font-semibold text-[11px] uppercase tracking-wider hover:bg-terracotta hover:text-cream transition-all cursor-pointer"
                >
                  {booking.status === "Cancelled" || booking.status === "Completed" ? "Book New Session" : "Go to Main Lobby"}
                </button>
              </div>

            </div>

          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="relative w-full max-w-[800px] mx-auto text-center z-10">
        <p className="text-[9px] text-gray uppercase tracking-[0.2em]">
          B-Smart Salon &bull; Platinum Elite Grooming Space &bull; Live Tracker System
        </p>
      </footer>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-obsidian flex items-center justify-center text-cream">
        <div className="flex flex-col items-center gap-4 text-center p-8 bg-charcoal/30 border border-cream/5 rounded animate-pulse">
          <Scissors size={48} className="text-terracotta rotate-[-45deg] animate-spin" />
          <h2 className="font-display text-xl font-bold uppercase tracking-wider">Loading Tracking Console...</h2>
        </div>
      </div>
    }>
      <TrackStatusContent />
    </Suspense>
  );
}
