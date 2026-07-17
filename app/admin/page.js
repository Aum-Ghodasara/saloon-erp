"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Scissors, LogOut, DollarSign, Calendar, Users, 
  TrendingUp, Activity, Plus, RefreshCw, Check, X, 
  Trash2, ClipboardList, Shield, Award, UserCheck, Settings,
  Tag, MessageSquare, MonitorPlay, Timer, Play, Star
} from "lucide-react";
import GeomText from "../../components/GeomText";
import { 
  getBookings, saveBooking, updateBookingStatus, deleteBooking,
  getReviews, updateReviewReply, getCoupons, saveCoupon, deleteCoupon, signOutUser
} from "../../lib/db";

const SERVICES_DEFAULT = [
  { id: 1, name: "Precision Haircut", price: 65, dur: "45 mins" },
  { id: 2, name: "Signature Hot Shave", price: 50, dur: "45 mins" },
  { id: 3, name: "Beard Sculpting & Trim", price: 45, dur: "30 mins" },
  { id: 4, name: "The Ritual (Full Service)", price: 105, dur: "80 mins" }
];

const ARTISANS_DEFAULT = [
  { id: 1, name: "Marcus Thorne", role: "Master Stylist / Founder", baseRating: 4.9, cuts: 142 },
  { id: 2, name: "Elena Rostova", role: "Lead Artisan", baseRating: 4.8, cuts: 118 },
  { id: 3, name: "Julian Vance", role: "Senior Barber", baseRating: 4.7, cuts: 95 }
];

export default function AdminDashboard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("bookings"); // "bookings", "walkin", "queue", "reviews", "coupons", "staff", "services"
  
  // Walk-in form states
  const [walkinName, setWalkinName] = useState("");
  const [walkinPhone, setWalkinPhone] = useState("");
  const [walkinService, setWalkinService] = useState(SERVICES_DEFAULT[0]);
  const [walkinArtisan, setWalkinArtisan] = useState(ARTISANS_DEFAULT[0].name);
  const [walkinTime, setWalkinTime] = useState("12:00 PM");

  // Services state (editable)
  const [services, setServices] = useState(SERVICES_DEFAULT);

  // Review reply states
  const [replyText, setReplyText] = useState({});

  // Now serving state
  const [nowServingToken, setNowServingToken] = useState("None");

  // Admin Custom Coupons builder states
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [couponTypeInput, setCouponTypeInput] = useState("flat");
  const [couponValueInput, setCouponValueInput] = useState("");
  const [activeCoupons, setActiveCoupons] = useState([]);

  // Authentication check
  useEffect(() => {
    const role = localStorage.getItem("bsmart_role");
    if (role !== "admin") {
      router.push("/login");
    } else {
      setIsAdmin(true);
    }

    // Load dashboard data from Supabase / LocalStorage
    const loadDashboardData = async () => {
      const [bookingsList, reviewsList, couponsList] = await Promise.all([
        getBookings(),
        getReviews(),
        getCoupons()
      ]);
      setBookings(bookingsList);
      setReviews(reviewsList);
      setActiveCoupons(couponsList);
    };

    if (role === "admin") {
      loadDashboardData();
    }

    // Initialize Now Serving Token from localStorage if exists
    const serving = localStorage.getItem("bsmart_now_serving");
    if (serving) {
      setNowServingToken(serving);
    }
  }, [router]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center text-cream">
        <div className="flex flex-col items-center gap-4 text-center p-8 bg-charcoal/30 border border-cream/5 rounded">
          <Shield size={48} className="text-terracotta animate-pulse" />
          <h2 className="font-display text-xl font-bold uppercase tracking-wider">Verifying Administrator Access</h2>
          <p className="text-sm text-gray max-w-[280px]">Checking security session details...</p>
        </div>
      </div>
    );
  }

  // Update database for bookings (state and DB)
  const updateBookingsDB = async (updatedList) => {
    setBookings(updatedList);
    localStorage.setItem("bsmart_bookings", JSON.stringify(updatedList));
  };

  // Update database for reviews (state and event dispatch)
  const updateReviewsDB = async (updatedList) => {
    setReviews(updatedList);
    localStorage.setItem("bsmart_reviews", JSON.stringify(updatedList));
    window.dispatchEvent(new Event("bsmart_reviews_updated"));
  };

  // Status updates
  const handleStatusChange = async (id, newStatus) => {
    const targetBooking = bookings.find((b) => b.id === id);
    
    if ((newStatus === "Completed" || newStatus === "Serving") && targetBooking?.token) {
      setNowServingToken(targetBooking.token);
      localStorage.setItem("bsmart_now_serving", targetBooking.token);
    }

    const list = bookings.map((b) => {
      if (b.id === id) {
        return { ...b, status: newStatus };
      }
      return b;
    });
    setBookings(list);

    // Save to Supabase / LocalStorage
    await updateBookingStatus(id, newStatus);

    // Send confirmation email on status changes
    if (targetBooking && targetBooking.email && targetBooking.email !== "walkin@bsmart.com") {
      fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: targetBooking.email,
          name: targetBooking.name,
          bookingId: targetBooking.id,
          service: targetBooking.service,
          artisan: targetBooking.artisan,
          date: targetBooking.date,
          time: targetBooking.time,
          price: targetBooking.price,
          status: newStatus,
          trackingOrigin: window.location.origin
        })
      }).catch((err) => console.error("Failed to send status update email:", err));
    }
  };

  // Delete booking
  const handleDeleteBooking = async (id) => {
    if (window.confirm("Are you sure you want to delete this booking record?")) {
      const list = bookings.filter((b) => b.id !== id);
      setBookings(list);
      await deleteBooking(id);
    }
  };

  // Add Walk-in booking
  const handleAddWalkin = async (e) => {
    e.preventDefault();
    if (!walkinName || !walkinPhone) return;

    // Generate Token number sequentially (e.g. T-101, T-102...)
    const tokenNum = `T-${101 + bookings.filter(b => b.type === "Walk-in").length}`;

    const newBooking = {
      id: `b-${Date.now()}`,
      name: walkinName,
      email: "walkin@bsmart.com",
      phone: walkinPhone,
      birthday: "Not Provided",
      service: walkinService.name,
      price: walkinService.price,
      artisan: walkinArtisan,
      date: "Jul 11", // default today
      time: walkinTime,
      type: "Walk-in",
      status: "Confirmed", // Starts in the live queue
      token: tokenNum
    };

    const list = [...bookings, newBooking];
    setBookings(list);
    await saveBooking(newBooking);
    
    // Reset Form
    setWalkinName("");
    setWalkinPhone("");
    setActiveTab("queue"); // Direct redirect to live queue board
  };

  // Create Custom Coupon code
  const handleAddCoupon = async (e) => {
    e.preventDefault();
    if (!couponCodeInput || !couponValueInput) return;
    const code = couponCodeInput.trim().toUpperCase();

    // Check if code duplicate
    if (activeCoupons.some((c) => c.code === code)) {
      alert("A promo coupon with this code already exists!");
      return;
    }

    const newCoupon = {
      code,
      type: couponTypeInput,
      value: parseInt(couponValueInput, 10) || 0
    };

    const list = [...activeCoupons, newCoupon];
    setActiveCoupons(list);
    await saveCoupon(newCoupon);

    setCouponCodeInput("");
    setCouponValueInput("");
  };

  // Revoke Custom Coupon code
  const handleDeleteCoupon = async (code) => {
    if (window.confirm("Are you sure you want to revoke this coupon code?")) {
      const list = activeCoupons.filter((c) => c.code !== code);
      setActiveCoupons(list);
      await deleteCoupon(code);
    }
  };

  // Post Admin Review reply
  const handlePostReply = async (reviewId) => {
    const text = replyText[reviewId];
    if (!text || !text.trim()) return;

    const list = reviews.map((r) => {
      if (r.id === reviewId) {
        return { ...r, reply: text };
      }
      return r;
    });
    setReviews(list);
    await updateReviewReply(reviewId, text);
    
    setReplyText({ ...replyText, [reviewId]: "" }); // clear field
  };

  // Edit service price
  const handlePriceChange = (id, newPrice) => {
    const list = services.map((s) => {
      if (s.id === id) {
        return { ...s, price: parseInt(newPrice, 10) || 0 };
      }
      return s;
    });
    setServices(list);
  };

  const handleLogout = async () => {
    localStorage.removeItem("bsmart_role");
    localStorage.removeItem("bsmart_user");
    localStorage.removeItem("bsmart_user_id");
    await signOutUser();
    router.push("/");
  };

  // Metrics Calculations (For Today: Jul 11)
  const todayDateStr = "Jul 11";
  const todayBookings = bookings.filter((b) => b.date === todayDateStr);

  const revenue = todayBookings
    .filter((b) => b.status === "Completed" || b.status === "Confirmed")
    .reduce((sum, b) => sum + (Number(b.price) || 0), 0);

  const walkinsCount = todayBookings.filter((b) => b.type === "Walk-in").length;
  const onlineCount = todayBookings.filter((b) => b.type === "Online").length;
  const cancelledCount = todayBookings.filter((b) => b.status === "Cancelled").length;
  const noshowCount = todayBookings.filter((b) => b.status === "No Show").length;

  // Active Pending Queue (Confirmed Bookings for Today)
  const pendingQueue = todayBookings
    .filter((b) => b.status === "Confirmed")
    .sort((a, b) => a.time.localeCompare(b.time));

  // Serve Next Queue item
  const handleServeNext = () => {
    const nextInLine = pendingQueue[0];
    if (nextInLine) {
      handleStatusChange(nextInLine.id, "Completed");
    }
  };

  // Coupon usage calculations
  const couponStats = bookings
    .filter((b) => b.couponCode && b.couponCode !== "None")
    .reduce((acc, b) => {
      if (!acc[b.couponCode]) {
        acc[b.couponCode] = { count: 0, discount: 0 };
      }
      acc[b.couponCode].count += 1;
      acc[b.couponCode].discount += (Number(b.discount) || 0);
      return acc;
    }, {});

  // Chart Data calculations:
  // 1. Staff Performance (Cuts completed today)
  const staffCuts = {
    "Marcus Thorne": bookings.filter((b) => b.artisan === "Marcus Thorne" && b.status === "Completed").length,
    "Elena Rostova": bookings.filter((b) => b.artisan === "Elena Rostova" && b.status === "Completed").length,
    "Julian Vance": bookings.filter((b) => b.artisan === "Julian Vance" && b.status === "Completed").length,
  };

  // 2. Popular Services share (Completed bookings)
  const servicePopularity = {
    "Precision Haircut": bookings.filter((b) => b.service === "Precision Haircut" && b.status === "Completed").length,
    "Signature Hot Shave": bookings.filter((b) => b.service === "Signature Hot Shave" && b.status === "Completed").length,
    "Beard Sculpting & Trim": bookings.filter((b) => b.service === "Beard Sculpting & Trim" && b.status === "Completed").length,
    "The Ritual (Full Service)": bookings.filter((b) => b.service === "The Ritual (Full Service)" && b.status === "Completed").length,
  };

  // Dynamic Stylist Rating calculation helper
  const getStylistRating = (stylistName) => {
    const stylistReviews = reviews.filter((r) => r.artisan === stylistName);
    if (stylistReviews.length === 0) {
      // Find the fallback rating from default static mappings
      const match = ARTISANS_DEFAULT.find(a => a.name === stylistName);
      return `${match ? match.baseRating : 4.8}/5 (No active reviews)`;
    }
    const sum = stylistReviews.reduce((s, r) => s + r.staffRating, 0);
    const avg = (sum / stylistReviews.length).toFixed(1);
    return `${avg}/5 (${stylistReviews.length} reviews)`;
  };

  return (
    <div className="min-h-screen bg-obsidian text-cream font-body flex">
      {/* Background radial highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(154,66,45,0.03)_0%,rgba(8,8,8,1)_85%)] z-0 pointer-events-none" />

      {/* Sidebar Panel */}
      <aside className="w-[280px] shrink-0 border-r border-cream/8 bg-charcoal/40 backdrop-blur-md p-8 flex flex-col justify-between z-10">
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
            <Scissors className="text-cream rotate-[-45deg]" size={20} />
            <GeomText text="B" size="13px" strokeWidth={8} animate={false} />
            <GeomText text="SMART" size="13px" strokeWidth={8} animate={false} />
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            <button 
              onClick={() => setActiveTab("bookings")}
              className={`w-full text-left p-3.5 text-xs font-semibold tracking-wider uppercase flex items-center gap-3 transition-colors cursor-pointer border ${
                activeTab === "bookings" 
                  ? "bg-cream text-obsidian border-cream" 
                  : "border-transparent text-cream-dim hover:text-cream hover:bg-cream/3"
              }`}
            >
              <ClipboardList size={16} />
              Bookings Queue
            </button>

            <button 
              onClick={() => setActiveTab("walkin")}
              className={`w-full text-left p-3.5 text-xs font-semibold tracking-wider uppercase flex items-center gap-3 transition-colors cursor-pointer border ${
                activeTab === "walkin" 
                  ? "bg-cream text-obsidian border-cream" 
                  : "border-transparent text-cream-dim hover:text-cream hover:bg-cream/3"
              }`}
            >
              <Plus size={16} />
              Register Walk-In
            </button>

            <button 
              onClick={() => setActiveTab("queue")}
              className={`w-full text-left p-3.5 text-xs font-semibold tracking-wider uppercase flex items-center gap-3 transition-colors cursor-pointer border ${
                activeTab === "queue" 
                  ? "bg-cream text-obsidian border-cream" 
                  : "border-transparent text-cream-dim hover:text-cream hover:bg-cream/3"
              }`}
            >
              <MonitorPlay size={16} />
              Queue Board
            </button>

            <button 
              onClick={() => setActiveTab("reviews")}
              className={`w-full text-left p-3.5 text-xs font-semibold tracking-wider uppercase flex items-center gap-3 transition-colors cursor-pointer border ${
                activeTab === "reviews" 
                  ? "bg-cream text-obsidian border-cream" 
                  : "border-transparent text-cream-dim hover:text-cream hover:bg-cream/3"
              }`}
            >
              <MessageSquare size={16} />
              Reviews Reply Center
            </button>

            <button 
              onClick={() => setActiveTab("coupons")}
              className={`w-full text-left p-3.5 text-xs font-semibold tracking-wider uppercase flex items-center gap-3 transition-colors cursor-pointer border ${
                activeTab === "coupons" 
                  ? "bg-cream text-obsidian border-cream" 
                  : "border-transparent text-cream-dim hover:text-cream hover:bg-cream/3"
              }`}
            >
              <Tag size={16} />
              Coupons Manager
            </button>

            <button 
              onClick={() => setActiveTab("staff")}
              className={`w-full text-left p-3.5 text-xs font-semibold tracking-wider uppercase flex items-center gap-3 transition-colors cursor-pointer border ${
                activeTab === "staff" 
                  ? "bg-cream text-obsidian border-cream" 
                  : "border-transparent text-cream-dim hover:text-cream hover:bg-cream/3"
              }`}
            >
              <Award size={16} />
              Staff Registry
            </button>

            <button 
              onClick={() => setActiveTab("services")}
              className={`w-full text-left p-3.5 text-xs font-semibold tracking-wider uppercase flex items-center gap-3 transition-colors cursor-pointer border ${
                activeTab === "services" 
                  ? "bg-cream text-obsidian border-cream" 
                  : "border-transparent text-cream-dim hover:text-cream hover:bg-cream/3"
              }`}
            >
              <Settings size={16} />
              Services Manager
            </button>
          </nav>
        </div>

        {/* User profile logout */}
        <div className="flex flex-col gap-4 border-t border-cream/8 pt-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-terracotta/20 border border-terracotta/40 flex items-center justify-center text-terracotta-light">
              <Shield size={14} />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-gray uppercase tracking-wider">Role: Admin</div>
              <div className="text-xs font-bold text-cream">Salon Admin</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-cream-dim hover:text-terracotta transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            Log Out Portal
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-grow p-10 overflow-y-auto z-10 flex flex-col gap-8">
        
        {/* Header */}
        <header className="flex justify-between items-center">
          <div>
            <h1 className="font-display text-[28px] font-medium tracking-wide uppercase text-cream">Administrative Console</h1>
            <p className="text-xs text-gray uppercase tracking-widest mt-1">Real-time operations & campaigns manager</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-cream">Today's Date</div>
            <div className="text-xs font-bold text-terracotta-light tracking-wide uppercase">Saturday, Jul 11</div>
          </div>
        </header>

        {/* Today's Metrics Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-charcoal/30 border border-cream/5 p-5 flex flex-col gap-2">
            <div className="text-gray text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign size={12} className="text-terracotta-light" />
              Today's Revenue
            </div>
            <div className="text-2xl font-bold font-display text-cream">${revenue}</div>
          </div>

          <div className="bg-charcoal/30 border border-cream/5 p-5 flex flex-col gap-2">
            <div className="text-gray text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={12} className="text-terracotta-light" />
              Total Bookings
            </div>
            <div className="text-2xl font-bold font-display text-cream">{todayBookings.length}</div>
          </div>

          <div className="bg-charcoal/30 border border-cream/5 p-5 flex flex-col gap-2">
            <div className="text-gray text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Users size={12} className="text-terracotta-light" />
              Walk-Ins
            </div>
            <div className="text-2xl font-bold font-display text-cream">{walkinsCount}</div>
          </div>

          <div className="bg-charcoal/30 border border-cream/5 p-5 flex flex-col gap-2">
            <div className="text-gray text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp size={12} className="text-terracotta-light" />
              Online Appts
            </div>
            <div className="text-2xl font-bold font-display text-cream">{onlineCount}</div>
          </div>

          <div className="bg-charcoal/30 border border-cream/5 p-5 flex flex-col gap-2">
            <div className="text-gray text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <X size={12} className="text-terracotta-light" />
              Cancelled
            </div>
            <div className="text-2xl font-bold font-display text-cream">{cancelledCount}</div>
          </div>

          <div className="bg-charcoal/30 border border-cream/5 p-5 flex flex-col gap-2">
            <div className="text-gray text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Activity size={12} className="text-terracotta-light" />
              No Shows
            </div>
            <div className="text-2xl font-bold font-display text-cream">{noshowCount}</div>
          </div>
        </section>

        {/* Bookings tab */}
        {activeTab === "bookings" && (
          <div className="flex flex-col gap-8">
            {/* Charts Row */}
            <section className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              
              {/* Card 1: Monthly Revenue Graph */}
              <div className="bg-charcoal/30 border border-cream/5 p-6 flex flex-col gap-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray">Monthly Revenue ($)</h3>
                <div className="h-[120px] w-full flex items-end">
                  <svg className="w-full h-full" viewBox="0 0 200 100">
                    <line x1="0" y1="20" x2="200" y2="20" stroke="rgba(249,246,240,0.03)" strokeWidth="1" />
                    <line x1="0" y1="50" x2="200" y2="50" stroke="rgba(249,246,240,0.03)" strokeWidth="1" />
                    <line x1="0" y1="80" x2="200" y2="80" stroke="rgba(249,246,240,0.03)" strokeWidth="1" />
                    <path d="M 10 90 Q 40 85 70 70 T 130 45 T 190 20" fill="none" stroke="var(--color-terracotta)" strokeWidth="2.5" />
                    <path d="M 10 90 Q 40 85 70 70 T 130 45 T 190 20 L 190 95 L 10 95 Z" fill="rgba(154,66,45,0.08)" />
                    <circle cx="10" cy="90" r="3" fill="#fff" />
                    <circle cx="70" cy="70" r="3" fill="#fff" />
                    <circle cx="130" cy="45" r="3" fill="#fff" />
                    <circle cx="190" cy="20" r="3" fill="var(--color-terracotta-light)" />
                  </svg>
                </div>
                <div className="flex justify-between text-[9px] text-gray uppercase tracking-widest font-semibold px-2">
                  <span>May: $8k</span>
                  <span>Jun: $12k</span>
                  <span>Jul: $16k</span>
                </div>
              </div>

              {/* Card 2: Staff Output */}
              <div className="bg-charcoal/30 border border-cream/5 p-6 flex flex-col gap-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray">Staff Output Today</h3>
                <div className="flex flex-col gap-3 justify-center flex-grow">
                  {Object.entries(staffCuts).map(([name, cuts]) => {
                    const maxCuts = 5;
                    const percent = Math.min(100, (cuts / maxCuts) * 100);
                    return (
                      <div key={name} className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-[11px] font-semibold text-cream-dim">
                          <span>{name.split(" ")[0]}</span>
                          <span className="text-terracotta-light">{cuts} cuts</span>
                        </div>
                        <div className="w-full h-1.5 bg-cream/5">
                          <div className="h-full bg-terracotta transition-all duration-500" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card 3: Popular Services */}
              <div className="bg-charcoal/30 border border-cream/5 p-6 flex flex-col gap-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray">Service Breakdown</h3>
                <div className="flex flex-col gap-3 justify-center flex-grow">
                  {Object.entries(servicePopularity).map(([srv, count]) => {
                    const maxSrv = 4;
                    const percent = Math.min(100, (count / maxSrv) * 100);
                    return (
                      <div key={srv} className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-[10px] font-semibold text-cream-dim">
                          <span className="truncate max-w-[130px]">{srv}</span>
                          <span className="text-terracotta-light">{count}</span>
                        </div>
                        <div className="w-full h-1.5 bg-cream/5">
                          <div className="h-full bg-cream/60 transition-all duration-500" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card 4: Customer growth */}
              <div className="bg-charcoal/30 border border-cream/5 p-6 flex flex-col gap-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray">Customer Growth (Cumulative)</h3>
                <div className="h-[120px] w-full flex items-end">
                  <svg className="w-full h-full" viewBox="0 0 200 100">
                    <path d="M 10 95 C 40 80 80 50 120 40 S 170 15 190 5 L 190 95 Z" fill="rgba(249,246,240,0.04)" stroke="rgba(249,246,240,0.5)" strokeWidth="1.5" />
                    <circle cx="190" cy="5" r="3" fill="var(--color-terracotta)" />
                  </svg>
                </div>
                <div className="flex justify-between text-[9px] text-gray uppercase tracking-widest font-semibold px-2">
                  <span>Wk 1</span>
                  <span>Wk 2</span>
                  <span>Wk 3</span>
                  <span>Wk 4</span>
                </div>
              </div>

            </section>

            {/* Live Booking Queue List */}
            <section className="bg-charcoal/30 border border-cream/5">
              <div className="p-6 border-b border-cream/5 flex justify-between items-center">
                <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-cream">Client Bookings Queue</h3>
                <span className="text-[10px] bg-terracotta/10 border border-terracotta/20 text-terracotta-light px-2.5 py-1 uppercase font-bold tracking-wider">
                  Active database logs
                </span>
              </div>

              {bookings.length === 0 ? (
                <div className="p-16 text-center text-gray flex flex-col items-center gap-3">
                  <ClipboardList size={36} />
                  <p className="text-sm uppercase tracking-wider">No appointment logs found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-cream/5 text-gray uppercase tracking-widest font-bold bg-cream/1">
                        <th className="p-4 pl-6">Client Details</th>
                        <th className="p-4">Birthday</th>
                        <th className="p-4">Service & Cost</th>
                        <th className="p-4">Stylist</th>
                        <th className="p-4">Date/Time</th>
                        <th className="p-4">Platform</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right pr-6">Management Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cream/5">
                      {bookings.map((b) => (
                        <tr key={b.id} className="hover:bg-cream/1 transition-colors">
                          <td className="p-4 pl-6">
                            <div className="font-semibold text-cream text-[13px]">{b.name}</div>
                            <div className="text-[10px] text-gray mt-0.5">{b.phone} | {b.email}</div>
                            {b.token && (
                              <span className="text-[9px] bg-terracotta/15 text-terracotta-light border border-terracotta/20 px-1.5 py-0.5 mt-1 inline-block font-semibold">
                                Token: {b.token}
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-cream-dim font-medium">{b.birthday || "Not Provided"}</td>
                          <td className="p-4">
                            <div className="text-cream">{b.service}</div>
                            <div className="text-[11px] text-terracotta-light font-semibold mt-0.5">${b.price}</div>
                          </td>
                          <td className="p-4 text-cream-dim">{b.artisan}</td>
                          <td className="p-4">
                            <div className="text-cream">{b.date}</div>
                            <div className="text-gray text-[10px] mt-0.5">{b.time}</div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                              b.type === "Walk-in" ? "bg-cream/10 text-cream border border-cream/20" : "bg-terracotta/15 text-terracotta-light border border-terracotta/20"
                            }`}>
                              {b.type}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                              b.status === "Confirmed" ? "bg-amber-500/10 text-amber-400" :
                              b.status === "Completed" ? "bg-emerald-500/10 text-emerald-400" :
                              b.status === "Cancelled" ? "bg-red-500/10 text-red-400" : "bg-gray-500/10 text-gray"
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="p-4 text-right pr-6 flex justify-end gap-2 items-center min-h-[64px]">
                            {b.status === "Confirmed" && (
                              <>
                                <button 
                                  onClick={() => handleStatusChange(b.id, "Completed")}
                                  className="p-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer"
                                  title="Mark Completed"
                                >
                                  <Check size={13} />
                                </button>
                                <button 
                                  onClick={() => handleStatusChange(b.id, "No Show")}
                                  className="p-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-colors cursor-pointer"
                                  title="Mark No Show"
                                >
                                  <X size={13} />
                                </button>
                              </>
                            )}
                            {b.status !== "Cancelled" && b.status !== "Completed" && (
                              <button 
                                onClick={() => handleStatusChange(b.id, "Cancelled")}
                                className="p-1.5 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                                title="Cancel Booking"
                              >
                                <X size={13} />
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteBooking(b.id)}
                              className="p-1.5 bg-cream/5 text-gray hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}

        {/* Register Walk-in Tab */}
        {activeTab === "walkin" && (
          <section className="bg-charcoal/30 border border-cream/5 p-10 max-w-[600px] flex flex-col gap-6">
            <div>
              <h3 className="font-display text-lg font-bold uppercase tracking-wider text-cream">Add Walk-In Client</h3>
              <p className="text-xs text-gray mt-1">Book a queue position for today's session</p>
            </div>
            
            <form onSubmit={handleAddWalkin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-gray">Client Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="E.g. John Doe"
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  className="bg-cream/3 border border-cream/8 p-3 px-4 text-cream font-body text-sm outline-none transition-colors focus:border-terracotta"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-gray">Phone Number</label>
                <input 
                  type="tel" 
                  required
                  placeholder="E.g. +91 9999999999"
                  value={walkinPhone}
                  onChange={(e) => setWalkinPhone(e.target.value)}
                  className="bg-cream/3 border border-cream/8 p-3 px-4 text-cream font-body text-sm outline-none transition-colors focus:border-terracotta"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-gray">Select Service</label>
                  <select 
                    value={walkinService.id}
                    onChange={(e) => {
                      const srv = services.find((s) => s.id === parseInt(e.target.value, 10));
                      if (srv) setWalkinService(srv);
                    }}
                    className="bg-cream/3 border border-cream/8 p-3 px-4 text-cream font-body text-sm outline-none transition-colors focus:border-terracotta [&>option]:bg-charcoal"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (${s.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-gray">Assign Stylist</label>
                  <select 
                    value={walkinArtisan}
                    onChange={(e) => setWalkinArtisan(e.target.value)}
                    className="bg-cream/3 border border-cream/8 p-3 px-4 text-cream font-body text-sm outline-none transition-colors focus:border-terracotta [&>option]:bg-charcoal"
                  >
                    {ARTISANS_DEFAULT.map((a) => (
                      <option key={a.id} value={a.name}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-gray">Preferred Time Slot</label>
                <input 
                  type="text" 
                  placeholder="E.g. 12:00 PM"
                  value={walkinTime}
                  onChange={(e) => setWalkinTime(e.target.value)}
                  className="bg-cream/3 border border-cream/8 p-3 px-4 text-cream font-body text-sm outline-none transition-colors focus:border-terracotta"
                />
              </div>

              <button 
                type="submit" 
                className="bg-cream text-obsidian font-body text-xs font-bold tracking-widest uppercase py-4 border border-cream mt-4 transition-all duration-300 hover:bg-transparent hover:text-cream cursor-pointer"
              >
                Log Walk-In & Generate Token
              </button>
            </form>
          </section>
        )}

        {/* Live Queue Board Tab */}
        {activeTab === "queue" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Column 1: Now Serving Signboard */}
            <div className="bg-charcoal/30 border border-cream/5 p-8 flex flex-col gap-6 items-center text-center justify-center min-h-[300px]">
              <div className="text-gray text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                <MonitorPlay size={16} className="text-terracotta-light" />
                Live Display Board
              </div>
              <div className="border border-cream/10 p-8 w-full bg-obsidian/60 relative">
                <div className="text-[10px] text-gray uppercase tracking-widest font-semibold mb-2">Now Serving</div>
                <div className="text-5xl font-bold font-display text-terracotta-light animate-pulse tracking-wide">
                  {nowServingToken}
                </div>
              </div>
              <button 
                onClick={handleServeNext}
                disabled={pendingQueue.length === 0}
                className="w-full bg-cream text-obsidian font-body text-xs font-bold tracking-widest uppercase py-3.5 border border-cream transition-colors hover:bg-transparent hover:text-cream disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                Serve Next Client
              </button>
            </div>

            {/* Column 2 & 3: Walk-in Queue position list */}
            <div className="lg:col-span-2 bg-charcoal/30 border border-cream/5 p-8 flex flex-col gap-6">
              <div>
                <h3 className="font-display text-lg font-bold uppercase tracking-wider text-cream">Queue Position Tracker</h3>
                <p className="text-xs text-gray mt-1">Live walk-ins and estimated wait time status</p>
              </div>

              {pendingQueue.filter(b => b.type === "Walk-in").length === 0 ? (
                <div className="p-16 text-center text-gray flex flex-col items-center gap-2">
                  <Timer size={32} />
                  <p className="text-xs uppercase tracking-wider">No active walk-in tokens waiting</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {pendingQueue.filter(b => b.type === "Walk-in").map((b, idx) => {
                    const waitTime = idx * 30; // 30 minutes wait estimate per person ahead
                    return (
                      <div key={b.id} className="flex justify-between items-center bg-cream/1 border border-cream/8 p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-terracotta/10 border border-terracotta/25 flex flex-col items-center justify-center text-terracotta-light font-display font-semibold rounded">
                            <span className="text-[8px] text-gray uppercase tracking-tighter">Token</span>
                            <span className="text-sm font-bold mt-[-2px]">{b.token}</span>
                          </div>
                          <div>
                            <div className="text-[13px] font-bold text-cream">{b.name}</div>
                            <div className="text-[10px] text-gray mt-0.5">Stylist: {b.artisan} | Service: {b.service}</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[13px] font-bold text-cream">
                            {idx === 0 ? "Next in Line" : `${idx + 1} position`}
                          </div>
                          <div className="text-[10px] text-terracotta-light font-semibold mt-0.5">
                            Est: ~{waitTime === 0 ? 5 : waitTime} mins wait
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reviews Reply Center Tab */}
        {activeTab === "reviews" && (
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="font-display text-lg font-bold uppercase tracking-wider text-cream">Reviews & Customer Feedback</h3>
              <p className="text-xs text-gray mt-1">Read visitor ratings and draft replies to clientele testimonials</p>
            </div>

            <div className="flex flex-col gap-6">
              {reviews.length === 0 ? (
                <div className="bg-charcoal/30 border border-cream/5 p-16 text-center text-gray flex flex-col items-center gap-3">
                  <MessageSquare size={36} className="text-gray/50" />
                  <p className="text-sm uppercase tracking-wider font-semibold">No visitor reviews logged yet</p>
                  <p className="text-xs text-gray/40 max-w-[280px]">Reviews submitted by clients on the front-end will display here for administrator replies.</p>
                </div>
              ) : (
                reviews.map((r) => {
                  const avg = Math.round((r.staffRating + r.serviceRating + r.salonRating + r.cleanlinessRating) / 4);
                  return (
                    <div key={r.id} className="bg-charcoal/30 border border-cream/5 p-6 flex flex-col gap-4">
                      {/* Header */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <img src={r.avatar} alt={r.name} className="w-10 h-10 rounded-full object-cover border border-cream/10" />
                          <div>
                            <span className="text-sm font-bold text-cream leading-none">{r.name}</span>
                            <div className="text-[9px] text-terracotta-light uppercase font-bold tracking-wider mt-1">
                              Reviewed Stylist: {r.artisan || "None"}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-4 items-center">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                size={12} 
                                className={`${
                                  star <= avg ? "text-terracotta fill-terracotta" : "text-cream/10"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] bg-cream/5 border border-cream/10 px-2 py-0.5 text-gray font-bold">
                            Avg: {avg}/5
                          </span>
                        </div>
                      </div>

                      {/* Breakdown */}
                      <div className="grid grid-cols-4 gap-2 bg-cream/1 p-3 text-[10px] text-cream-dim border border-cream/5">
                        <div>Stylist Skill: <strong className="text-cream">{r.staffRating}/5</strong></div>
                        <div>Service Care: <strong className="text-cream">{r.serviceRating}/5</strong></div>
                        <div>Salon Vibe: <strong className="text-cream">{r.salonRating}/5</strong></div>
                        <div>Cleanliness: <strong className="text-cream">{r.cleanlinessRating}/5</strong></div>
                      </div>

                      {/* Comment */}
                      <p className="text-xs text-cream-dim leading-relaxed">
                        "{r.comment}"
                      </p>

                      {/* Existing response */}
                      {r.reply ? (
                        <div className="bg-obsidian/40 border-l border-terracotta p-4 rounded text-xs">
                          <div className="text-[9px] font-bold text-terracotta uppercase tracking-wider mb-1">Your Response</div>
                          <p className="text-cream-dim italic font-medium">"{r.reply}"</p>
                        </div>
                      ) : (
                        // Reply form
                        <div className="flex gap-3 mt-2">
                          <input 
                            type="text" 
                            placeholder="Draft reply response to this client..."
                            value={replyText[r.id] || ""}
                            onChange={(e) => setReplyText({ ...replyText, [r.id]: e.target.value })}
                            className="bg-cream/3 border border-cream/8 p-3 text-cream font-body text-xs outline-none focus:border-terracotta flex-grow"
                          />
                          <button 
                            onClick={() => handlePostReply(r.id)}
                            className="bg-cream text-obsidian px-5 font-semibold text-[11px] uppercase tracking-wider hover:bg-terracotta hover:text-cream transition-colors cursor-pointer"
                          >
                            Send Response
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Coupons Manager tab */}
        {activeTab === "coupons" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Column 1: Generate Coupon Form */}
            <div className="bg-charcoal/30 border border-cream/5 p-8 flex flex-col gap-6">
              <div>
                <h3 className="font-display text-lg font-bold uppercase tracking-wider text-cream">Create Promo Coupon</h3>
                <p className="text-xs text-gray mt-1 font-medium">Generate brand new discounts for booking campaigns</p>
              </div>

              <form onSubmit={handleAddCoupon} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-gray">Coupon Code</label>
                  <input 
                    type="text" 
                    required
                    placeholder="E.g. VIP50"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    className="bg-cream/3 border border-cream/8 p-3 px-4 text-cream font-body text-sm outline-none transition-colors focus:border-terracotta uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-gray">Discount Type</label>
                    <select
                      value={couponTypeInput}
                      onChange={(e) => setCouponTypeInput(e.target.value)}
                      className="bg-cream/3 border border-cream/8 p-3 px-4 text-cream font-body text-sm outline-none transition-colors focus:border-terracotta [&>option]:bg-charcoal"
                    >
                      <option value="flat">Flat Dollar ($)</option>
                      <option value="percent">Percentage (%)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-gray">Value</label>
                    <input 
                      type="number" 
                      required
                      placeholder="E.g. 50"
                      value={couponValueInput}
                      onChange={(e) => setCouponValueInput(e.target.value)}
                      className="bg-cream/3 border border-cream/8 p-3 px-4 text-cream font-body text-sm outline-none transition-colors focus:border-terracotta"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="bg-cream text-obsidian font-body text-xs font-bold tracking-widest uppercase py-4 border border-cream mt-2 transition-colors hover:bg-transparent hover:text-cream cursor-pointer"
                >
                  Generate Coupon
                </button>
              </form>
            </div>

            {/* Column 2 & 3: Active coupons list & usage */}
            <div className="xl:col-span-2 flex flex-col gap-6">
              
              {/* Campaign stats summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-charcoal/30 border border-cream/5 p-5">
                  <div className="text-[10px] text-gray font-bold uppercase tracking-wider mb-1">Total Redeemed Count</div>
                  <div className="text-2xl font-bold text-cream">
                    {bookings.filter(b => b.couponCode && b.couponCode !== "None").length} times
                  </div>
                </div>
                <div className="bg-charcoal/30 border border-cream/5 p-5">
                  <div className="text-[10px] text-gray font-bold uppercase tracking-wider mb-1">Total Discount Costs</div>
                  <div className="text-2xl font-bold text-emerald-400">
                    -${bookings.reduce((sum, b) => sum + (Number(b.discount) || 0), 0)}
                  </div>
                </div>
              </div>

              {/* Coupons list */}
              <div className="bg-charcoal/30 border border-cream/5">
                <div className="p-5 border-b border-cream/5 font-display text-sm font-semibold uppercase tracking-wider text-cream">
                  Active Campaigns Codes
                </div>
                {activeCoupons.length === 0 ? (
                  <div className="p-8 text-center text-gray text-xs uppercase font-medium">No coupons active</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-cream/5 text-gray uppercase tracking-widest font-bold bg-cream/1">
                          <th className="p-4 pl-6">Code</th>
                          <th className="p-4">Type</th>
                          <th className="p-4">Value</th>
                          <th className="p-4">Redemptions</th>
                          <th className="p-4 text-right pr-6">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cream/5">
                        {activeCoupons.map((c) => (
                          <tr key={c.code} className="hover:bg-cream/1 transition-colors">
                            <td className="p-4 pl-6 font-bold text-cream uppercase">{c.code}</td>
                            <td className="p-4 text-cream-dim uppercase">{c.type}</td>
                            <td className="p-4 font-semibold text-terracotta-light">
                              {c.type === "flat" ? `$${c.value}` : `${c.value}%`}
                            </td>
                            <td className="p-4 text-cream-dim">
                              {couponStats[c.code]?.count || 0} times
                            </td>
                            <td className="p-4 text-right pr-6">
                              <button 
                                onClick={() => handleDeleteCoupon(c.code)}
                                className="p-1.5 bg-cream/5 text-gray hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                                title="Revoke Coupon"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Staff registry */}
        {activeTab === "staff" && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ARTISANS_DEFAULT.map((a) => (
              <div key={a.id} className="bg-charcoal/30 border border-cream/5 p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-display text-lg font-medium text-cream">{a.name}</h3>
                    <p className="text-[10px] text-terracotta-light uppercase tracking-wider font-semibold mt-0.5">{a.role}</p>
                  </div>
                  <span className="text-xs bg-cream/5 border border-cream/10 px-2 py-0.5 text-gray font-bold rounded">
                    ★ {getStylistRating(a.name)}
                  </span>
                </div>
                <div className="border-t border-cream/5 pt-4 flex flex-col gap-2 text-xs">
                  <div className="flex justify-between text-cream-dim">
                    <span>Cuts Completed Today</span>
                    <span className="font-bold text-cream">
                      {bookings.filter((b) => b.artisan === a.name && b.status === "Completed").length}
                    </span>
                  </div>
                  <div className="flex justify-between text-cream-dim">
                    <span>Lifetime Bookings</span>
                    <span className="font-bold text-cream">{a.cuts}</span>
                  </div>
                  <div className="flex justify-between text-cream-dim">
                    <span>Active Shift</span>
                    <span className="font-bold text-emerald-400">9:00 AM - 6:00 PM (Lunch: 1-2 PM)</span>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Services manager */}
        {activeTab === "services" && (
          <section className="bg-charcoal/30 border border-cream/5 p-8 flex flex-col gap-6">
            <div>
              <h3 className="font-display text-lg font-bold uppercase tracking-wider text-cream">Salon Services Manager</h3>
              <p className="text-xs text-gray mt-1">Configure pricing scales for active salon services</p>
            </div>
            
            <div className="flex flex-col gap-4">
              {services.map((s) => (
                <div key={s.id} className="flex justify-between items-center bg-cream/1 p-4 border border-cream/8">
                  <div>
                    <span className="text-[13px] font-semibold text-cream uppercase tracking-wider">{s.name}</span>
                    <div className="text-[11px] text-gray mt-0.5">Duration: {s.dur}</div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray uppercase font-semibold">Price ($)</span>
                    <input 
                      type="number"
                      value={s.price}
                      onChange={(e) => handlePriceChange(s.id, e.target.value)}
                      className="w-20 bg-cream/5 border border-cream/10 p-2 text-center text-cream font-body text-sm font-semibold outline-none focus:border-terracotta"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
