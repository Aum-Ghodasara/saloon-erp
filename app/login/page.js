"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Scissors, Lock, User, ArrowLeft, AlertCircle, Phone, Calendar, Mail } from "lucide-react";
import GeomText from "../../components/GeomText";
import { signInUser, signInWithGoogle, signUpUser } from "../../lib/db";

export default function LoginPage() {
  const router = useRouter();
  
  // View states
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Sign In inputs
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Sign Up inputs
  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    phone: "",
    birthday: "",
    password: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Sign up flow
        const registerRes = await signUpUser(
          signUpData.email,
          signUpData.password,
          signUpData.name,
          signUpData.phone,
          signUpData.birthday
        );

        if (registerRes.success) {
          // Auto login after sign up
          const result = await signInUser(signUpData.email, signUpData.password);
          localStorage.setItem("bsmart_role", result.role);
          localStorage.setItem("bsmart_user", result.name);
          if (result.user?.id) {
            localStorage.setItem("bsmart_user_id", result.user.id);
          }
          router.push("/");
        } else {
          throw new Error(registerRes.error || "Failed to create account.");
        }
      } else {
        // Sign in flow
        const result = await signInUser(username, password);
        
        // Store to local storage so existing pages function normally
        localStorage.setItem("bsmart_role", result.role);
        localStorage.setItem("bsmart_user", result.name);
        if (result.user?.id) {
          localStorage.setItem("bsmart_user_id", result.user.id);
        }
        
        // Route based on role
        if (result.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please check your credentials.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || "Failed to initialize Google login.");
      setIsLoading(false);
    }
  };

  const toggleView = () => {
    setError("");
    setIsSignUp(!isSignUp);
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
      <div className="relative w-full max-w-[450px] bg-charcoal/40 border border-cream/8 backdrop-blur-md p-10 flex flex-col items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10 my-8">
        
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
            {isSignUp ? "Registration Center" : "Authentication Gateway"}
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="w-full flex items-start gap-3 bg-terracotta/10 border border-terracotta/30 p-4 text-cream text-sm mb-6 animate-[fadeIn_0.3s_ease]">
            <AlertCircle size={18} className="text-terracotta-light shrink-0 mt-0.5" />
            <span className="break-all">{error}</span>
          </div>
        )}

        {/* Credentials Info Help Tip (only in Sign In view) */}
        {!isSignUp && (
          <div className="w-full bg-cream/2 border border-cream/5 p-3 text-[11px] text-cream-dim tracking-wide mb-6">
            <strong className="text-terracotta-light">Demo Logins:</strong>
            <div className="mt-1 flex justify-between">
              <span>Admin: <code className="text-cream">admin</code> / <code className="text-cream">admin1234</code></span>
              <span>Client: <code className="text-cream">aum</code> / <code className="text-cream">aum1234</code></span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          {!isSignUp ? (
            /* SIGN IN VIEW FIELDS */
            <>
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
                    placeholder="Enter username or email" 
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
            </>
          ) : (
            /* SIGN UP VIEW FIELDS */
            <>
              {/* Full Name */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold tracking-wider text-gray uppercase">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray">
                    <User size={16} />
                  </span>
                  <input 
                    type="text" 
                    required
                    disabled={isLoading}
                    placeholder="E.g. Aum Patel" 
                    value={signUpData.name}
                    onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                    className="w-full bg-cream/3 border border-cream/8 p-3.5 pl-11 text-cream font-body text-sm outline-none transition-colors focus:border-terracotta disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold tracking-wider text-gray uppercase">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray">
                    <Mail size={16} />
                  </span>
                  <input 
                    type="email" 
                    required
                    disabled={isLoading}
                    placeholder="E.g. aum@example.com" 
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    className="w-full bg-cream/3 border border-cream/8 p-3.5 pl-11 text-cream font-body text-sm outline-none transition-colors focus:border-terracotta disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold tracking-wider text-gray uppercase">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray">
                    <Phone size={16} />
                  </span>
                  <input 
                    type="tel" 
                    required
                    disabled={isLoading}
                    placeholder="E.g. +91 9999999999" 
                    value={signUpData.phone}
                    onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                    className="w-full bg-cream/3 border border-cream/8 p-3.5 pl-11 text-cream font-body text-sm outline-none transition-colors focus:border-terracotta disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Birthday (Asked only once upon registration!) */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold tracking-wider text-gray uppercase">
                  Birthday
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray">
                    <Calendar size={16} />
                  </span>
                  <input 
                    type="date" 
                    required
                    disabled={isLoading}
                    value={signUpData.birthday}
                    onChange={(e) => setSignUpData({ ...signUpData, birthday: e.target.value })}
                    className="w-full bg-cream/3 border border-cream/8 p-3.5 pl-11 text-cream font-body text-sm outline-none transition-colors focus:border-terracotta disabled:opacity-50 [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>
              </div>

              {/* Password */}
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
                    placeholder="Create password (min 6 chars)" 
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    className="w-full bg-cream/3 border border-cream/8 p-3.5 pl-11 text-cream font-body text-sm outline-none transition-colors focus:border-terracotta disabled:opacity-50"
                  />
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-cream text-obsidian font-body text-xs font-bold tracking-widest uppercase py-4 border border-cream mt-4 transition-all duration-300 hover:bg-transparent hover:text-cream disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? "Processing..." : isSignUp ? "Register Profile" : "Sign In"}
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-cream/8"></div>
            <span className="flex-shrink mx-4 text-gray text-[10px] uppercase tracking-wider font-semibold">Or</span>
            <div className="flex-grow border-t border-cream/8"></div>
          </div>

          <button 
            type="button" 
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-transparent border border-cream/15 text-cream font-body text-xs font-bold tracking-widest uppercase py-4 transition-all duration-300 hover:bg-cream/5 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
          >
            <svg width="16" height="16" className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Google OAuth Link
          </button>
        </form>

        {/* View Toggle */}
        <div className="mt-8 text-center text-xs">
          <button 
            type="button" 
            onClick={toggleView}
            className="text-cream-dim hover:text-terracotta-light uppercase font-semibold tracking-wider underline cursor-pointer"
          >
            {isSignUp ? "Already registered? Sign In" : "Don't have an account? Sign Up"}
          </button>
        </div>

      </div>
    </div>
  );
}
