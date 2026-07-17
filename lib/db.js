import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export function isSupabaseConfigured() {
  return !!supabase;
}

// ----------------------------------------------------
// BOOKINGS MANAGEMENT
// ----------------------------------------------------

export async function getBookings() {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Map database names back to camelCase frontend expectations if needed,
      // but let's map them dynamically so they match existing codebase structure
      return (data || []).map(b => ({
        id: b.id,
        name: b.name,
        email: b.email,
        phone: b.phone,
        birthday: b.birthday,
        service: b.service,
        price: Number(b.price),
        discount: Number(b.discount),
        couponCode: b.coupon_code || 'None',
        artisan: b.artisan,
        date: b.date,
        time: b.time,
        type: b.type,
        status: b.status,
        token: b.token || undefined
      }));
    } catch (err) {
      console.error("Supabase getBookings error, falling back to local storage:", err);
    }
  }

  // Local storage fallback
  try {
    const saved = localStorage.getItem("bsmart_bookings");
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function saveBooking(booking) {
  if (isSupabaseConfigured()) {
    try {
      // Get current authenticated user id to link the booking
      let user_id = null;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) user_id = user.id;
      } catch (_) {}

      const dbBooking = {
        id: booking.id,
        name: booking.name,
        email: booking.email,
        phone: booking.phone,
        birthday: booking.birthday,
        service: booking.service,
        price: booking.price,
        discount: booking.discount,
        coupon_code: booking.couponCode,
        artisan: booking.artisan,
        date: booking.date,
        time: booking.time,
        type: booking.type,
        status: booking.status,
        token: booking.token || null,
        user_id
      };

      const { error } = await supabase.from('bookings').insert(dbBooking);
      if (error) throw error;

      // If user is authenticated, also ensure their birthday is updated in profiles
      if (user_id && booking.birthday && booking.birthday !== "Not Provided") {
        await supabase
          .from('profiles')
          .update({ birthday: booking.birthday })
          .eq('id', user_id);
      }

      return { success: true };
    } catch (err) {
      console.error("Supabase saveBooking error, falling back to local storage:", err);
    }
  }

  // Local storage fallback
  try {
    const existing = localStorage.getItem("bsmart_bookings");
    const list = existing ? JSON.parse(existing) : [];
    list.push(booking);
    localStorage.setItem("bsmart_bookings", JSON.stringify(list));
    return { success: true };
  } catch (err) {
    console.error("Local storage booking write failed:", err);
    return { success: false, error: err.message };
  }
}

export async function updateBookingStatus(id, status) {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error("Supabase updateBookingStatus error, falling back to local storage:", err);
    }
  }

  // Local storage fallback
  try {
    const saved = localStorage.getItem("bsmart_bookings");
    if (saved) {
      const list = JSON.parse(saved);
      const updated = list.map((b) => {
        if (b.id === id) {
          return { ...b, status };
        }
        return b;
      });
      localStorage.setItem("bsmart_bookings", JSON.stringify(updated));
      return { success: true };
    }
  } catch (e) {
    console.error(e);
  }
  return { success: false };
}

export async function deleteBooking(id) {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error("Supabase deleteBooking error, falling back to local storage:", err);
    }
  }

  // Local storage fallback
  try {
    const saved = localStorage.getItem("bsmart_bookings");
    if (saved) {
      const list = JSON.parse(saved).filter((b) => b.id !== id);
      localStorage.setItem("bsmart_bookings", JSON.stringify(list));
      return { success: true };
    }
  } catch (e) {
    console.error(e);
  }
  return { success: false };
}

// ----------------------------------------------------
// BIRTHDAY CHECK ENGINE (One-Time Birthday logic)
// ----------------------------------------------------

export async function checkBirthdayByEmail(email) {
  if (!email) return null;
  const targetEmail = email.trim().toLowerCase();

  if (isSupabaseConfigured()) {
    try {
      // 1. Check in profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('birthday')
        .eq('email', targetEmail)
        .not('birthday', 'is', null)
        .maybeSingle();

      if (profile && profile.birthday) {
        return profile.birthday;
      }

      // 2. Check in bookings table (for guest/previous bookings)
      const { data: booking } = await supabase
        .from('bookings')
        .select('birthday')
        .eq('email', targetEmail)
        .not('birthday', 'eq', 'Not Provided')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (booking && booking.birthday) {
        return booking.birthday;
      }
    } catch (err) {
      console.error("Supabase checkBirthdayByEmail error, checking local storage:", err);
    }
  }

  // Local storage check fallback
  try {
    // Check local storage bookings
    const savedBookings = localStorage.getItem("bsmart_bookings");
    if (savedBookings) {
      const list = JSON.parse(savedBookings);
      const match = list
        .filter((b) => b.email.toLowerCase() === targetEmail && b.birthday && b.birthday !== "Not Provided")
        .sort((a, b) => b.id.localeCompare(a.id))[0]; // latest first

      if (match) {
        return match.birthday;
      }
    }
  } catch (e) {
    console.error(e);
  }
  return null;
}

// ----------------------------------------------------
// REVIEWS MANAGEMENT
// ----------------------------------------------------

export async function getReviews() {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(r => ({
        id: r.id,
        name: r.name,
        avatar: r.avatar,
        artisan: r.artisan,
        staffRating: r.staff_rating,
        serviceRating: r.service_rating,
        salonRating: r.salon_rating,
        cleanlinessRating: r.cleanliness_rating,
        comment: r.comment,
        date: r.date,
        reply: r.reply || ""
      }));
    } catch (err) {
      console.error("Supabase getReviews error, falling back to local storage:", err);
    }
  }

  // Local storage fallback
  try {
    const saved = localStorage.getItem("bsmart_reviews");
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function saveReview(review) {
  if (isSupabaseConfigured()) {
    try {
      const dbReview = {
        name: review.name,
        avatar: review.avatar,
        artisan: review.artisan,
        staff_rating: review.staffRating,
        service_rating: review.serviceRating,
        salon_rating: review.salonRating,
        cleanliness_rating: review.cleanlinessRating,
        comment: review.comment,
        date: review.date,
        reply: review.reply || ""
      };

      if (review.id && !review.id.startsWith("rev-")) {
        dbReview.id = review.id; // use existing uuid if valid
      }

      const { error } = await supabase.from('reviews').insert(dbReview);
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error("Supabase saveReview error, falling back to local storage:", err);
    }
  }

  // Local storage fallback
  try {
    const existing = localStorage.getItem("bsmart_reviews");
    const list = existing ? JSON.parse(existing) : [];
    list.push(review);
    localStorage.setItem("bsmart_reviews", JSON.stringify(list));
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

export async function updateReviewReply(id, reply) {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ reply })
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error("Supabase updateReviewReply error, falling back to local storage:", err);
    }
  }

  // Local storage fallback
  try {
    const saved = localStorage.getItem("bsmart_reviews");
    if (saved) {
      const list = JSON.parse(saved);
      const updated = list.map((r) => {
        if (r.id === id) {
          return { ...r, reply };
        }
        return r;
      });
      localStorage.setItem("bsmart_reviews", JSON.stringify(updated));
      return { success: true };
    }
  } catch (e) {
    console.error(e);
  }
  return { success: false };
}

// ----------------------------------------------------
// COUPONS MANAGEMENT
// ----------------------------------------------------

export async function getCoupons() {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(c => ({
        code: c.code,
        type: c.type,
        value: Number(c.value)
      }));
    } catch (err) {
      console.error("Supabase getCoupons error, falling back to local storage:", err);
    }
  }

  // Local storage fallback
  try {
    const saved = localStorage.getItem("bsmart_coupons");
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function saveCoupon(coupon) {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('coupons')
        .insert({
          code: coupon.code,
          type: coupon.type,
          value: coupon.value
        });
      
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error("Supabase saveCoupon error, falling back to local storage:", err);
    }
  }

  // Local storage fallback
  try {
    const saved = localStorage.getItem("bsmart_coupons");
    const list = saved ? JSON.parse(saved) : [];
    list.push(coupon);
    localStorage.setItem("bsmart_coupons", JSON.stringify(list));
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: e.message };
  }
}

export async function deleteCoupon(code) {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('code', code);
      
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error("Supabase deleteCoupon error, falling back to local storage:", err);
    }
  }

  // Local storage fallback
  try {
    const saved = localStorage.getItem("bsmart_coupons");
    if (saved) {
      const list = JSON.parse(saved).filter((c) => c.code !== code);
      localStorage.setItem("bsmart_coupons", JSON.stringify(list));
      return { success: true };
    }
  } catch (e) {
    console.error(e);
  }
  return { success: false };
}

// ----------------------------------------------------
// AUTHENTICATION MANAGEMENT
// ----------------------------------------------------

export async function signUpUser(email, password, name, phone, birthday, role = "customer") {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured." };
  }

  try {
    // Create user in Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone }
      }
    });

    if (error) throw error;

    if (data?.user) {
      // Create user profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: email.trim().toLowerCase(),
          name,
          phone,
          birthday: birthday || null,
          role
        });

      if (profileError) throw profileError;
    }

    return { success: true, user: data?.user };
  } catch (err) {
    console.error("Supabase signUpUser error:", err);
    return { success: false, error: err.message };
  }
}

export async function signInUser(loginInput, password) {
  const normalizedInput = loginInput.trim();

  // If local mock configuration or Supabase is not connected
  if (!isSupabaseConfigured()) {
    if (normalizedInput === "admin" && password === "admin1234") {
      return { 
        success: true,
        user: { email: "admin@bsmart.com" }, 
        role: "admin", 
        name: "Salon Admin" 
      };
    } else if (normalizedInput === "aum" && password === "aum1234") {
      return { 
        success: true,
        user: { email: "aum@bsmart.com" }, 
        role: "customer", 
        name: "Aum Patel" 
      };
    }
    throw new Error("Invalid username or password.");
  }

  // Supabase Authenticator
  const email = normalizedInput.includes("@") ? normalizedInput : `${normalizedInput}@bsmart.com`;

  try {
    let { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    // Auto-register demo logins on the first attempt if they are not yet registered
    if (error && error.message.includes("Invalid login credentials") && (normalizedInput === "admin" || normalizedInput === "aum")) {
      const isDemoAdmin = normalizedInput === "admin";
      const registerRes = await signUpUser(
        email, 
        password, 
        isDemoAdmin ? "Salon Admin" : "Aum Patel",
        isDemoAdmin ? "1234567890" : "9999999999",
        isDemoAdmin ? "" : "1995-05-15",
        isDemoAdmin ? "admin" : "customer"
      );

      if (registerRes.success) {
        // Retry sign-in
        const retry = await supabase.auth.signInWithPassword({ email, password });
        data = retry.data;
        error = retry.error;
      }
    }

    if (error) throw error;

    // Fetch user profile info
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileErr && profileErr.code !== 'PGRST116') {
      console.warn("Could not retrieve profile metadata:", profileErr);
    }

    return {
      success: true,
      user: data.user,
      role: profile?.role || "customer",
      name: profile?.name || data.user.email,
      birthday: profile?.birthday || null,
      phone: profile?.phone || ""
    };
  } catch (err) {
    console.error("Supabase signInUser error:", err);
    throw err;
  }
}

export async function signOutUser() {
  if (isSupabaseConfigured()) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Supabase signOut error:", err);
    }
  }
}

export async function getCurrentUserProfile() {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return null;

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileErr) throw profileErr;
    return profile;
  } catch (err) {
    console.error("Supabase getCurrentUserProfile error:", err);
    return null;
  }
}

export async function signInWithGoogle() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Google Sign-In requires active Supabase keys.");
  }
  
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error("signInWithGoogle error:", err);
    throw err;
  }
}
