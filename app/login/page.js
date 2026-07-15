"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Scissors, Lock, User, ArrowLeft, AlertCircle } from "lucide-react";
import GeomText from "../../components/GeomText";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate database lookup latency
    setTimeout(() => {
      if (username === "admin" && password === "admin1234") {
        localStorage.setItem("bsmart_role", "admin");
        localStorage.setItem("bsmart_user", "Salon Admin");
        router.push("/admin");
      } else if (username === "aum" && password === "aum1234") {
        localStorage.setItem("bsmart_role", "customer");
        localStorage.setItem("bsmart_user", "Aum Patel");
        router.push("/");
      } else {
        setError("Invalid username or password. Please try again.");
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-obsidian py-12 px-6 overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(154,66,45,0.08)_0%,rgba(8,8,8,0.95)_75%)] z-0 pointer-events-none" />

      {/* Back button */}
      <button 
        onClick={() => router.push("/")}
        className="absolute top-8 left-8 flex items-center gap-2 text-xs font-semibold tracking-wider text-cream-dim uppercase transition-colors hover:text-cream cursor-pointer z-10"
      >
        <ArrowLeft size={16} />
        Back to Salon
      </button>

      {/* Login Card */}
      <div className="relative w-full max-w-[450px] bg-charcoal/40 border border-cream/8 backdrop-blur-md p-10 flex flex-col items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10">
        
        {/* Header Icon & Brand */}
        <div className="flex flex-col items-center gap-4 mb-8 text-center">
          <div className="w-14 h-14 rounded-full bg-cream/3 border border-cream/8 flex items-center justify-center text-cream">
            <Scissors size={24} className="rotate-[-45deg]" />
          </div>
          <div className="flex items-center justify-center gap-[0.1em] mt-1.5">
            <GeomText text="B" size="14px" strokeWidth={8} animate={false} />
            <GeomText text="SMART" size="14px" strokeWidth={8} animate={false} />
            <GeomText text="SALON" size="14px" strokeWidth={8} animate={false} />
          </div>
          <span className="text-[10px] tracking-[0.25em] text-gray uppercase">
            Authentication Gateway
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="w-full flex items-start gap-3 bg-terracotta/10 border border-terracotta/30 p-4 text-cream text-sm mb-6 animate-[fadeIn_0.3s_ease]">
            <AlertCircle size={18} className="text-terracotta-light shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Info Help Tip */}
        <div className="w-full bg-cream/2 border border-cream/5 p-3 text-[11px] text-cream-dim tracking-wide mb-6">
          <strong className="text-terracotta-light">Demo Logins:</strong>
          <div className="mt-1 flex justify-between">
            <span>Admin: <code className="text-cream">admin</code> / <code className="text-cream">admin1234</code></span>
            <span>Client: <code className="text-cream">aum</code> / <code className="text-cream">aum1234</code></span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          {/* Username field */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold tracking-wider text-gray uppercase">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray">
                <User size={16} />
              </span>
              <input 
                type="text" 
                required
                disabled={isLoading}
                placeholder="Enter username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-cream/3 border border-cream/8 p-3.5 pl-11 text-cream font-body text-sm outline-none transition-colors focus:border-terracotta disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold tracking-wider text-gray uppercase">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray">
                <Lock size={16} />
              </span>
              <input 
                type="password" 
                required
                disabled={isLoading}
                placeholder="Enter password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-cream/3 border border-cream/8 p-3.5 pl-11 text-cream font-body text-sm outline-none transition-colors focus:border-terracotta disabled:opacity-50"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-cream text-obsidian font-body text-xs font-bold tracking-widest uppercase py-4 border border-cream mt-4 transition-all duration-300 hover:bg-transparent hover:text-cream disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? "Validating..." : "Sign In"}
          </button>
        </form>

      </div>
    </div>
  );
}
