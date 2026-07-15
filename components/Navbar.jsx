"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Scissors, User, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import GeomText from "./GeomText";

export default function Navbar({ onBookClick }) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    // Check auth session details in localStorage
    const role = localStorage.getItem("bsmart_role");
    const name = localStorage.getItem("bsmart_user");
    if (role) {
      setUserRole(role);
      setUserName(name || "");
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("bsmart_role");
    localStorage.removeItem("bsmart_user");
    setUserRole(null);
    setUserName("");
    router.push("/");
    router.refresh();
  };

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 flex items-center transition-all duration-400 ${
        scrolled 
          ? "bg-obsidian/85 backdrop-blur-md border-b border-cream/8 h-[70px]" 
          : "h-20"
      }`}
    >
      <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-10 flex justify-between items-center">
        {/* Logo Section */}
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <Scissors 
            className="text-cream transition-transform duration-500 rotate-[-45deg] group-hover:rotate-[-90deg] group-hover:scale-110" 
            size={20} 
          />
          <GeomText text="B" size="13px" strokeWidth={8} animate={false} />
          <GeomText text="SMART" size="13px" strokeWidth={8} animate={false} />
          <GeomText text="SALON" size="13px" strokeWidth={8} animate={false} />
        </div>

        {/* Desktop Navigation Links */}
        <ul className="hidden min-[961px]:flex items-center gap-8 list-none">
          <li>
            <a href="#about" className="text-[13px] font-medium tracking-[0.15em] text-cream-dim relative py-1.5 uppercase hover:text-cream group">
              About
              <span className="absolute bottom-0 left-1/2 w-0 h-[1px] bg-cream transition-all duration-350 group-hover:w-full group-hover:left-0" />
            </a>
          </li>
          <li>
            <a href="#services" className="text-[13px] font-medium tracking-[0.15em] text-cream-dim relative py-1.5 uppercase hover:text-cream group">
              Services
              <span className="absolute bottom-0 left-1/2 w-0 h-[1px] bg-cream transition-all duration-350 group-hover:w-full group-hover:left-0" />
            </a>
          </li>
          <li>
            <a href="#artisans" className="text-[13px] font-medium tracking-[0.15em] text-cream-dim relative py-1.5 uppercase hover:text-cream group">
              Our Artisans
              <span className="absolute bottom-0 left-1/2 w-0 h-[1px] bg-cream transition-all duration-350 group-hover:w-full group-hover:left-0" />
            </a>
          </li>
          <li>
            <a href="#contact" className="text-[13px] font-medium tracking-[0.15em] text-cream-dim relative py-1.5 uppercase hover:text-cream group">
              Contact
              <span className="absolute bottom-0 left-1/2 w-0 h-[1px] bg-cream transition-all duration-350 group-hover:w-full group-hover:left-0" />
            </a>
          </li>
        </ul>

        {/* Right Action Section */}
        <div className="flex items-center gap-4 sm:gap-6">
          {userRole ? (
            <div className="flex items-center gap-4">
              {/* Authenticated user session views */}
              {userRole === "admin" ? (
                <button 
                  onClick={() => router.push("/admin")}
                  className="flex items-center gap-1.5 text-[13px] font-semibold tracking-[0.1em] text-terracotta-light hover:text-cream transition-colors cursor-pointer"
                >
                  <LayoutDashboard size={16} />
                  <span>Admin Panel</span>
                </button>
              ) : (
                <button 
                  onClick={() => router.push("/customer")}
                  className="flex items-center gap-1.5 text-[13px] font-semibold tracking-[0.08em] text-cream hover:text-terracotta-light transition-colors cursor-pointer"
                  title="Go to Client Lounge"
                >
                  <User size={16} className="text-terracotta-light" />
                  <span>Hello, {userName.split(" ")[0]}</span>
                </button>
              )}

              {/* Universal Logout Button */}
              <button 
                onClick={handleLogout}
                className="text-cream-dim hover:text-terracotta transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut size={17} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => router.push("/login")}
              className="flex items-center gap-2 text-[13px] font-medium tracking-[0.1em] text-cream-dim transition-all duration-300 hover:text-cream hover:-translate-y-[1px] cursor-pointer"
            >
              <User size={18} />
              <span className="hidden min-[961px]:inline">Log In</span>
            </button>
          )}
          
          <button 
            className="bg-cream text-obsidian font-body text-[11px] sm:text-[13px] font-semibold tracking-[0.15em] uppercase px-4 sm:px-7 py-2 sm:py-3 border border-cream transition-all duration-400 shadow-md hover:bg-transparent hover:text-cream hover:border-cream hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(249,246,240,0.1)] cursor-pointer"
            onClick={onBookClick}
          >
            Book Now
          </button>

          <button 
            className="block min-[961px]:hidden text-cream cursor-pointer" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed top-20 left-0 w-full h-[calc(100vh-80px)] bg-obsidian/98 flex flex-col items-center justify-center gap-10 z-[99] backdrop-blur-lg"
        >
          <a href="#about" className="text-[20px] font-medium tracking-[0.15em] text-cream-dim py-1.5 uppercase hover:text-cream" onClick={() => setMobileMenuOpen(false)}>
            About
          </a>
          <a href="#services" className="text-[20px] font-medium tracking-[0.15em] text-cream-dim py-1.5 uppercase hover:text-cream" onClick={() => setMobileMenuOpen(false)}>
            Services
          </a>
          <a href="#artisans" className="text-[20px] font-medium tracking-[0.15em] text-cream-dim py-1.5 uppercase hover:text-cream" onClick={() => setMobileMenuOpen(false)}>
            Our Artisans
          </a>
          <a href="#contact" className="text-[20px] font-medium tracking-[0.15em] text-cream-dim py-1.5 uppercase hover:text-cream" onClick={() => setMobileMenuOpen(false)}>
            Contact
          </a>
          {userRole && (
            <button 
              onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
              className="text-[20px] font-medium tracking-[0.15em] text-terracotta py-1.5 uppercase hover:text-cream flex items-center gap-2 cursor-pointer"
            >
              <LogOut size={20} />
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
