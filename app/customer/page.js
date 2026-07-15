"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Scissors, LogOut, Calendar, Clock, Award, Star, 
  MapPin, Phone, ShieldCheck, Gift, Check, Trash2, HelpCircle 
} from "lucide-react";
import GeomText from "../../components/GeomText";

export default function CustomerDashboard() {
  const router = useRouter();
  const [isCustomer, setIsCustomer] = useState(false);
  const [customerName, setCustomerName] = useState("Aum Patel");
  const [bookings, setBookings] = useState([]);
  const [conciergeMsg, setConciergeMsg] = useState("");

  // Check login authentication
  useEffect(() => {
    const role = localStorage.getItem("bsmart_role");
    const name = localStorage.getItem("bsmart_user");
    
    if (role !== "customer") {
      router.push("/login");
    } else {
      setIsCustomer(true);
      if (name) {
        setCustomerName(name);
      }
    }

    // Load user bookings
    const saved = localStorage.getItem("bsmart_bookings");
    if (saved) {
      const list = JSON.parse(saved);
      // Filter bookings matching customer name (case insensitive)
      const userBookings = list.filter(
        (b) => b.name.toLowerCase().includes("aum")
      );
      setBookings(userBookings);
    }
  }, [router]);

  if (!isCustomer) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center text-cream">
        <div className="flex flex-col items-center gap-4 text-center p-8 bg-charcoal/30 border border-cream/5 rounded animate-pulse">
          <Scissors size={48} className="text-terracotta rotate-[-45deg] animate-spin" />
          <h2 className="font-display text-xl font-bold uppercase tracking-wider">Loading Customer Lounge</h2>
        </div>
      </div>
    );
  }

  // Cancel Booking handler
  const handleCancelBooking = (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this appointment session?")) {
      // 1. Update localStorage database
      let allBookings = [];
      try {
        const saved = localStorage.getItem("bsmart_bookings");
        if (saved) allBookings = JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }

      const updatedAll = allBookings.map((b) => {
        if (b.id === bookingId) {
          return { ...b, status: "Cancelled" };
        }
        return b;
      });
      localStorage.setItem("bsmart_bookings", JSON.stringify(updatedAll));

      // 2. Update local state
      const updatedUser = bookings.map((b) => {
        if (b.id === bookingId) {
          return { ...b, status: "Cancelled" };
        }
        return b;
      });
      setBookings(updatedUser);
      setConciergeMsg("Appointment cancelled successfully. Let us know if you want to reschedule!");
    }
  };

  const handleReschedule = () => {
    setConciergeMsg("Our salon concierge has been notified. We will call you in 5 minutes to adjust your slot!");
  };

  const handleLogout = () => {
    localStorage.removeItem("bsmart_role");
    localStorage.removeItem("bsmart_user");
    router.push("/");
  };

  // Group bookings
  const upcoming = bookings.filter((b) => b.status === "Confirmed");
  const past = bookings.filter((b) => b.status === "Completed" || b.status === "Cancelled" || b.status === "No Show");

  return (
    <div className="min-h-screen bg-obsidian text-cream font-body relative pb-16">
      {/* Background soft highlights */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(154,66,45,0.04)_0%,rgba(8,8,8,1)_85%)] z-0 pointer-events-none" />

      {/* Top Lounge Bar */}
      <header className="border-b border-cream/8 bg-charcoal/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
            <Scissors className="text-cream rotate-[-45deg]" size={16} />
            <GeomText text="B" size="11px" strokeWidth={8} animate={false} />
            <GeomText text="SMART" size="11px" strokeWidth={8} animate={false} />
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-cream-dim hover:text-terracotta transition-colors cursor-pointer"
          >
            <LogOut size={13} />
            Exit Lounge
          </button>
        </div>
      </header>

      {/* Hero Welcome banner */}
      <section className="max-w-[1200px] mx-auto px-6 sm:px-10 mt-12 z-10 relative">
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold text-terracotta-light uppercase tracking-[0.25em]">Exclusive Grooming Lounge</span>
          <h1 className="font-display text-3xl sm:text-4xl font-normal text-cream uppercase tracking-wide">
            Welcome Back, <span className="font-semibold text-cream">{customerName}</span>
          </h1>
          <p className="text-xs text-gray uppercase tracking-widest mt-1">Platinum Elite Membership profile</p>
        </div>
      </section>

      {/* Layout Content panels */}
      <main className="max-w-[1200px] mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10 z-10 relative">
        
        {/* Left Column: Membership Card, Loyalty balance, Birthday greetings */}
        <div className="flex flex-col gap-6">
          
          {/* Elite Circle Card */}
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-charcoal border border-amber-500/25 p-8 relative overflow-hidden group shadow-xl">
            {/* Geometric accents */}
            <div className="absolute top-[-30px] right-[-30px] w-24 h-24 rounded-full bg-amber-500/5 blur-xl pointer-events-none" />
            
            <div className="flex justify-between items-start mb-10">
              <div>
                <span className="text-[9px] bg-amber-500/10 border border-amber-500/35 text-amber-300 font-bold px-2 py-0.5 uppercase tracking-wider rounded">
                  Elite Circle
                </span>
                <h3 className="font-display text-lg font-bold text-cream uppercase tracking-wider mt-2.5">B Smart Loyalty</h3>
              </div>
              <Award className="text-amber-400 animate-pulse" size={24} />
            </div>

            <div className="flex flex-col gap-0.5 mb-6">
              <div className="text-[10px] text-gray uppercase tracking-widest font-semibold">Membership Id</div>
              <div className="text-xs font-bold text-cream-dim tracking-widest">BS-98845-AUM</div>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <div className="text-[9px] text-gray uppercase tracking-widest font-semibold">Tier Level</div>
                <div className="text-sm font-semibold text-cream">Platinum Client</div>
              </div>
              
              <div className="text-right">
                <span className="text-[9px] text-gray uppercase tracking-widest font-semibold block mb-0.5">Barcode</span>
                <div className="h-6 w-20 flex gap-0.5 items-end opacity-50">
                  <div className="h-full w-[2px] bg-cream" />
                  <div className="h-full w-[4px] bg-cream" />
                  <div className="h-full w-[1px] bg-cream" />
                  <div className="h-full w-[3px] bg-cream" />
                  <div className="h-full w-[1px] bg-cream" />
                  <div className="h-full w-[2px] bg-cream" />
                  <div className="h-full w-[4px] bg-cream" />
                </div>
              </div>
            </div>
          </div>

          {/* Loyalty Balance progress */}
          <div className="bg-charcoal/30 border border-cream/5 p-6 flex items-center gap-6">
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-cream/5" strokeWidth="2.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-terracotta" strokeDasharray="75, 100" strokeWidth="2.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute text-xs font-bold text-cream font-display">150</div>
            </div>
            <div>
              <div className="text-[10px] text-gray font-bold uppercase tracking-wider">Loyalty Balance</div>
              <div className="text-sm font-bold text-cream mt-0.5">150 / 200 Points</div>
              <div className="text-[9px] text-cream-dim mt-1">Get 50 more points for a free Beard Sculpting!</div>
            </div>
          </div>

          {/* Birthday Greetings Card */}
          <div className="bg-charcoal/30 border border-cream/5 p-6 flex gap-4 items-start">
            <div className="p-3 bg-terracotta/10 border border-terracotta/20 text-terracotta-light rounded">
              <Gift size={20} />
            </div>
            <div>
              <div className="text-[10px] text-gray font-bold uppercase tracking-wider">Birthday Celebration</div>
              <div className="text-xs text-cream mt-1 font-semibold">Special lounge gift unlocked!</div>
              <p className="text-[11px] text-cream-dim mt-1.5 leading-relaxed">
                Enjoy a complimentary hot-stone scalp massage on your next booking around your birthday. Promo Code: <strong className="text-terracotta-light">AUMBAY</strong>
              </p>
            </div>
          </div>

        </div>

        {/* Center/Right Column: Bookings details and past ledger */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Notifications/Feedback Banner */}
          {conciergeMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs font-semibold text-emerald-400 tracking-wide">
              {conciergeMsg}
            </div>
          )}

          {/* Upcoming appointments list */}
          <div className="bg-charcoal/30 border border-cream/5 p-8 flex flex-col gap-6">
            <div>
              <h3 className="font-display text-lg font-bold uppercase tracking-wider text-cream">Upcoming Sessions</h3>
              <p className="text-xs text-gray mt-1 font-medium">Your upcoming salon treatments</p>
            </div>

            {upcoming.length === 0 ? (
              <div className="p-12 text-center border border-cream/8 border-dashed bg-cream/1 text-gray flex flex-col items-center gap-2">
                <Calendar size={28} />
                <p className="text-xs uppercase tracking-wider">No upcoming appointments scheduled</p>
                <button 
                  onClick={() => router.push("/")}
                  className="mt-4 bg-cream text-obsidian px-5 py-2 font-semibold text-[10px] uppercase tracking-wider hover:bg-terracotta hover:text-cream transition-colors cursor-pointer"
                >
                  Book Session Now
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {upcoming.map((b) => (
                  <div key={b.id} className="border border-cream/8 p-5 bg-cream/1 flex justify-between items-center max-[640px]:flex-col max-[640px]:items-start max-[640px]:gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-terracotta/10 border border-terracotta/20 flex items-center justify-center text-terracotta-light rounded">
                        <Scissors size={18} />
                      </div>
                      <div>
                        <span className="text-[14px] font-bold text-cream">{b.service}</span>
                        <div className="text-[11px] text-gray mt-1 flex items-center gap-4 flex-wrap">
                          <span className="flex items-center gap-1.5"><Clock size={12} /> {b.time}</span>
                          <span>Stylist: {b.artisan}</span>
                          <span className="text-terracotta-light font-semibold">${b.price}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={handleReschedule}
                        className="bg-cream/5 border border-cream/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-cream-dim hover:text-cream hover:bg-cream/10 cursor-pointer"
                      >
                        Reschedule
                      </button>
                      <button 
                        onClick={() => handleCancelBooking(b.id)}
                        className="bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Rituals list */}
          <div className="bg-charcoal/30 border border-cream/5 p-8 flex flex-col gap-6">
            <div>
              <h3 className="font-display text-lg font-bold uppercase tracking-wider text-cream">Past Sessions & Rituals</h3>
              <p className="text-xs text-gray mt-1 font-medium">History of your cuts and service experiences</p>
            </div>

            {past.length === 0 ? (
              <div className="text-xs text-gray uppercase tracking-wider">No history recorded</div>
            ) : (
              <div className="flex flex-col gap-3">
                {past.map((b) => (
                  <div key={b.id} className="flex justify-between items-center bg-cream/1 border border-cream/8 p-4 text-xs">
                    <div>
                      <div className="font-semibold text-cream">{b.service}</div>
                      <div className="text-[10px] text-gray mt-0.5">Date: {b.date} | Stylist: {b.artisan}</div>
                    </div>

                    <div className="text-right">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        b.status === "Completed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        b.status === "Cancelled" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-gray-500/10 text-gray border border-cream/10"
                      }`}>
                        {b.status}
                      </span>
                      <div className="text-[10px] text-cream font-semibold mt-1">${b.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Exclusive Unlocked Coupons */}
          <div className="bg-charcoal/30 border border-cream/5 p-8 flex flex-col gap-6">
            <div>
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-cream">Your Exclusive Lounge Offers</h3>
              <p className="text-[11px] text-gray mt-0.5 font-medium">Apply these codes at checkout during booking</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-cream/8 p-4 bg-cream/2 flex justify-between items-center">
                <div>
                  <div className="text-[11px] font-bold text-cream tracking-wide uppercase">LOUNGE25</div>
                  <div className="text-[10px] text-gray mt-0.5">25% off next Ritual appointment</div>
                </div>
                <span className="text-[10px] text-terracotta font-semibold uppercase tracking-wider">Copy</span>
              </div>

              <div className="border border-cream/8 p-4 bg-cream/2 flex justify-between items-center">
                <div>
                  <div className="text-[11px] font-bold text-cream tracking-wide uppercase">SHARP10</div>
                  <div className="text-[10px] text-gray mt-0.5">Flat $10 off any Shave or Trim</div>
                </div>
                <span className="text-[10px] text-terracotta font-semibold uppercase tracking-wider">Copy</span>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
