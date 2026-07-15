"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import Services from "../components/Services";
import Artisans from "../components/Artisans";
import Transformation from "../components/Transformation";
import Clientele from "../components/Clientele";
import Contact from "../components/Contact";
import BookingModal from "../components/BookingModal";
import LeaveReview from "../components/LeaveReview";

const MOCK_BOOKINGS = [
  {
    id: "b-1",
    name: "Kai Sterling",
    email: "kai@example.com",
    phone: "+91 9876543210",
    service: "Precision Haircut",
    price: 65,
    artisan: "Marcus Thorne",
    date: "Jul 11",
    time: "10:00 AM",
    type: "Online",
    status: "Confirmed"
  },
  {
    id: "b-2",
    name: "Elian Dubois",
    email: "elian@example.com",
    phone: "+91 9821098210",
    service: "Signature Hot Shave",
    price: 50,
    artisan: "Elena Rostova",
    date: "Jul 11",
    time: "11:30 AM",
    type: "Online",
    status: "Confirmed"
  },
  {
    id: "b-3",
    name: "Aum Patel",
    email: "aum@example.com",
    phone: "+91 7433825559",
    service: "The Ritual (Full Service)",
    price: 105,
    artisan: "Marcus Thorne",
    date: "Jul 11",
    time: "1:00 PM",
    type: "Online",
    status: "Completed"
  },
  {
    id: "b-4",
    name: "David Miller",
    email: "david@example.com",
    phone: "+91 9909099090",
    service: "Beard Sculpting & Trim",
    price: 45,
    artisan: "Julian Vance",
    date: "Jul 11",
    time: "2:30 PM",
    type: "Walk-in",
    status: "Completed"
  },
  {
    id: "b-5",
    name: "Sarah Connor",
    email: "sarah@example.com",
    phone: "+91 8888888888",
    service: "Precision Haircut",
    price: 65,
    artisan: "Elena Rostova",
    date: "Jul 11",
    time: "4:00 PM",
    type: "Online",
    status: "Cancelled"
  },
  {
    id: "b-6",
    name: "James Smith",
    email: "james@example.com",
    phone: "+91 7777777777",
    service: "Signature Hot Shave",
    price: 50,
    artisan: "Julian Vance",
    date: "Jul 11",
    time: "5:30 PM",
    type: "Walk-in",
    status: "No Show"
  }
];

export default function Home() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const openBooking = () => setIsBookingOpen(true);
  const closeBooking = () => setIsBookingOpen(false);

  useEffect(() => {
    // Seed initial mock bookings if none exist
    if (!localStorage.getItem("bsmart_bookings")) {
      localStorage.setItem("bsmart_bookings", JSON.stringify(MOCK_BOOKINGS));
    }
    // Seed initial mock coupons if none exist
    const defaultCoupons = [
      { id: "cp-1", code: "WELCOME10", type: "flat", value: 10 },
      { id: "cp-2", code: "STUDENT15", type: "percent", value: 15 },
      { id: "cp-3", code: "FESTIVAL20", type: "percent", value: 20 },
      { id: "cp-4", code: "BFRND25", type: "flat", value: 25 }
    ];
    if (!localStorage.getItem("bsmart_coupons")) {
      localStorage.setItem("bsmart_coupons", JSON.stringify(defaultCoupons));
    }
  }, []);

  return (
    <>
      {/* Premium Glassmorphic Sticky Header */}
      <Navbar onBookClick={openBooking} />

      {/* Main Sections */}
      <main>
        {/* Full-screen Hero Section with Parallax Background */}
        <Hero />

        {/* Brand Philosophy and Story */}
        <About />

        {/* Expandable Interactive Service Menu */}
        <Services />

        {/* Master Stylist Team Showcase Grid */}
        <Artisans />

        {/* Transformation Scroll-Interactive Section */}
        <Transformation onBookClick={openBooking} />

        {/* Clientele Testimonial Cards Section */}
        <Clientele />

        {/* Customer Review Form */}
        <LeaveReview />

        {/* Opening Hours, Map, and Footer details */}
        <Contact onBookClick={openBooking} />
      </main>

      {/* Interactive Booking Stepper Flow */}
      <BookingModal isOpen={isBookingOpen} onClose={closeBooking} />
    </>
  );
}
