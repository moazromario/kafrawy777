import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://qbplkookkahsbqoflafy.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFicGxrb29ra2Foc2Jxb2ZsYWZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NTQ3NjIsImV4cCI6MjA5MDIzMDc2Mn0.docRw9nhwMSfw7Ol4T06pQAsRahWbqXLECJ0Bv0Uemw';

const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());

// API Routes
// 1. Booking Items
app.get("/api/booking-items", async (req, res) => {
  const { data, error } = await supabase.from("booking_items").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// 2. Wallet Balance
app.get("/api/wallet/:userId", async (req, res) => {
  const { userId } = req.params;
  const { data, error } = await supabase.from("wallets").select("balance").eq("user_id", userId).single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// 3. Deposit (Mock Vodafone Cash)
app.post("/api/wallet/deposit", async (req, res) => {
  const { userId, amount, transactionRef } = req.body;
  
  // Mock verification of Vodafone Cash transaction
  if (!transactionRef) return res.status(400).json({ error: "Reference required" });

  // Update wallet
  const { data: wallet, error: walletError } = await supabase.rpc('increment_wallet_balance', { 
    user_id_param: userId, 
    amount_param: amount 
  });

  if (walletError) return res.status(500).json({ error: walletError.message });

  // Record payment
  await supabase.from("payments").insert({
    user_id: userId,
    amount,
    method: 'vodafone_cash',
    type: 'deposit',
    status: 'completed',
    transaction_ref: transactionRef
  });

  res.json({ success: true, balance: wallet });
});

// 4. Create Booking
app.post("/api/bookings", async (req, res) => {
  const { userId, itemId, startDate, endDate, totalPrice, paymentMethod } = req.body;

  // 1. Check availability (simplified)
  const { data: existing } = await supabase.from("bookings")
    .select("*")
    .eq("item_id", itemId)
    .eq("status", "confirmed")
    .lt("start_date", endDate || startDate)
    .gt("end_date", startDate);

  if (existing && existing.length > 0) {
    return res.status(400).json({ error: "هذا الموعد غير متاح" });
  }

  // 2. Handle Payment
  if (paymentMethod === 'wallet') {
    const { data: wallet } = await supabase.from("wallets").select("balance").eq("user_id", userId).single();
    if (!wallet || wallet.balance < totalPrice) {
      return res.status(400).json({ error: "رصيد المحفظة غير كافٍ" });
    }

    // Deduct from wallet
    await supabase.rpc('decrement_wallet_balance', { 
      user_id_param: userId, 
      amount_param: totalPrice 
    });
  }

  // 3. Create Booking
  const { data: booking, error: bookingError } = await supabase.from("bookings").insert({
    user_id: userId,
    item_id: itemId,
    start_date: startDate,
    end_date: endDate,
    total_price: totalPrice,
    status: 'confirmed'
  }).select().single();

  if (bookingError) return res.status(500).json({ error: bookingError.message });

  // 4. Record Payment
  await supabase.from("payments").insert({
    user_id: userId,
    booking_id: booking.id,
    amount: totalPrice,
    method: paymentMethod,
    type: 'payment',
    status: 'completed'
  });

  res.json(booking);
});

// 5. Admin Stats
app.get("/api/admin/stats", async (req, res) => {
  const { data: bookings } = await supabase.from("bookings").select("total_price, created_at, status");
  const { data: users } = await supabase.from("profiles").select("count");
  
  // Aggregate stats
  const totalRevenue = bookings?.reduce((acc, b) => acc + (b.status === 'confirmed' ? b.total_price : 0), 0);
  
  res.json({
    totalBookings: bookings?.length || 0,
    totalRevenue,
    totalUsers: users?.length || 0,
    bookingsByDay: [] // Simplified for now
  });
});

// Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
