// src/services/api.ts
import { supabase } from '../lib/supabase';

// ... existing code ...

export const fetchWallet = async (userId: string) => {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // Ignore not found error
  return data || { balance: 0 };
};

export const fetchUserOrders = async (userId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      profiles:user_id (full_name, phone)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const fetchBookingItems = async () => {
  const { data, error } = await supabase.from('booking_items').select('*');
  if (error) throw error;
  return data;
};

export const fetchWalletBalance = async (userId: string) => {
  const { data, error } = await supabase.from('wallets').select('balance').eq('user_id', userId).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || { balance: 0 };
};

export const depositWallet = async (userId: string, amount: number, transactionRef: string) => {
  const { data: wallet, error: walletError } = await supabase.rpc('increment_wallet_balance', { 
    user_id_param: userId, 
    amount_param: amount 
  });

  if (walletError) {
    // Fallback if RPC doesn't exist
    const { data: currentWallet } = await supabase.from('wallets').select('balance').eq('user_id', userId).single();
    if (currentWallet) {
      await supabase.from('wallets').update({ balance: currentWallet.balance + amount }).eq('user_id', userId);
    } else {
      await supabase.from('wallets').insert({ user_id: userId, balance: amount });
    }
  }

  const { error: paymentError } = await supabase.from("payments").insert({
    user_id: userId,
    amount,
    method: 'vodafone_cash',
    type: 'deposit',
    status: 'completed',
    transaction_ref: transactionRef
  });

  if (paymentError) throw paymentError;

  return { success: true, balance: wallet || amount };
};

export const createBooking = async (bookingData: any) => {
  const { userId, entityType, entityId, startDate, endDate, totalPrice, paymentMethod, pickup, dropoff } = bookingData;

  // Handle Payment
  if (paymentMethod === 'wallet') {
    const { data: wallet } = await supabase.from("wallets").select("balance").eq("user_id", userId).single();
    if (!wallet || wallet.balance < totalPrice) {
      throw new Error("رصيد المحفظة غير كافٍ");
    }
    const { error: walletError } = await supabase.rpc('decrement_wallet_balance', { 
      user_id_param: userId, 
      amount_param: totalPrice 
    });
    
    if (walletError) {
      await supabase.from('wallets').update({ balance: wallet.balance - totalPrice }).eq('user_id', userId);
    }
  }

  // Create Booking
  const { data: booking, error: bookingError } = await supabase.from("bookings").insert({
    user_id: userId,
    entity_type: entityType,
    entity_id: entityId,
    start_date: startDate,
    end_date: endDate,
    total_price: totalPrice,
    status: 'pending',
    payment_status: paymentMethod === 'wallet' ? 'paid' : 'unpaid',
    pickup_location: pickup,
    dropoff_location: dropoff
  }).select().single();

  if (bookingError) throw bookingError;

  // Record Payment
  await supabase.from("payments").insert({
    user_id: userId,
    booking_id: booking.id,
    amount: totalPrice,
    method: paymentMethod,
    type: 'payment',
    status: paymentMethod === 'wallet' ? 'completed' : 'pending'
  });

  // Notify Admin/Captain
  await supabase.from("notifications").insert({
    user_id: userId,
    title: "حجز جديد",
    message: `تم إنشاء حجز جديد لـ ${entityType}`
  });

  return booking;
};

export const fetchDirectory = async () => {
  const [services, vehicles, projects] = await Promise.all([
    supabase.from("services").select("*").eq("is_active", true),
    supabase.from("vehicles").select("*, profiles(full_name)").eq("status", "available"),
    supabase.from("projects").select("*")
  ]);
  return {
    services: services.data || [],
    vehicles: vehicles.data || [],
    projects: projects.data || []
  };
};

export const fetchCaptainOrders = async (captainId: string) => {
  const { data, error } = await supabase.from("bookings")
    .select("*, profiles(full_name, phone)")
    .eq("captain_id", captainId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const { data, error } = await supabase.from("bookings").update({ status }).eq("id", orderId).select().single();
  if (error) throw error;
  
  // Notify User
  await supabase.from("notifications").insert({
    user_id: data.user_id,
    title: "تحديث حالة الطلب",
    message: `حالة طلبك الآن: ${status}`
  });

  return data;
};

// --- Admin API ---
const getAdminId = () => {
  const admin = JSON.parse(localStorage.getItem('admin_user') || '{}');
  return admin.id;
};

export const adminLogin = async (credentials: any) => {
  const { username, password } = credentials;
  const { data: admin, error } = await supabase.from('admins').select('*').eq('username', username).single();
  if (error || !admin || admin.password_hash !== password) {
    throw new Error("بيانات الدخول غير صحيحة");
  }
  return { admin };
};

export const fetchAdminStats = async () => {
  const [bookings, revenue, users, captains] = await Promise.all([
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('payments').select('amount').eq('status', 'completed').eq('type', 'payment'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'captain')
  ]);
  const totalRevenue = revenue.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  return {
    totalBookings: bookings.count,
    totalRevenue,
    totalUsers: users.count,
    totalCaptains: captains.count
  };
};

export const fetchAdminUsers = async () => {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) throw error;
  return data;
};

export const updateAdminUser = async (id: string, data: any) => {
  const { data: updated, error } = await supabase.from('profiles').update(data).eq('id', id).select().single();
  if (error) throw error;
  return updated;
};

export const fetchAdminBookings = async () => {
  const { data, error } = await supabase.from('bookings').select('*, profiles(full_name)');
  if (error) throw error;
  return data;
};

export const updateAdminBooking = async (id: string, data: any) => {
  const { data: updated, error } = await supabase.from('bookings').update(data).eq('id', id).select().single();
  if (error) throw error;
  return updated;
};

export const fetchAdminPayments = async () => {
  const { data, error } = await supabase.from('payments').select('*, profiles(full_name)');
  if (error) throw error;
  return data;
};

export const updateAdminPayment = async (id: string, data: any) => {
  const { data: updated, error } = await supabase.from('payments').update(data).eq('id', id).select().single();
  if (error) throw error;
  return updated;
};

export const fetchAdminItems = async () => {
  const { data, error } = await supabase.from('booking_items').select('*');
  if (error) throw error;
  return data;
};

export const createAdminItem = async (data: any) => {
  const { data: created, error } = await supabase.from('booking_items').insert(data).select().single();
  if (error) throw error;
  return created;
};

export const updateAdminItem = async (id: string, data: any) => {
  const { data: updated, error } = await supabase.from('booking_items').update(data).eq('id', id).select().single();
  if (error) throw error;
  return updated;
};

export const fetchAdminSettings = async () => {
  const { data, error } = await supabase.from('settings').select('*');
  if (error) throw error;
  return data;
};

export const updateAdminSettings = async (data: any) => {
  // Assuming settings is a single row or key-value pair. Adjust as needed.
  const { data: updated, error } = await supabase.from('settings').upsert(data).select();
  if (error) throw error;
  return updated;
};

export const fetchAdminAuditLogs = async () => {
  const { data, error } = await supabase.from('audit_logs').select('*, admins(username)');
  if (error) throw error;
  return data;
};

