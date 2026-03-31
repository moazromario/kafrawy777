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

// Bootstrap Admin
async function bootstrapAdmin() {
  try {
    const { data: existing } = await supabase.from('admins').select('id').eq('username', 'superadmin').single();
    if (!existing) {
      console.log('Bootstrapping default super admin...');
      await supabase.from('admins').insert({
        username: 'superadmin',
        password_hash: 'Mdhg0109022901@#$',
        role: 'super_admin'
      });
    }
  } catch (err) {
    console.error('Error bootstrapping admin:', err);
  }
}

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

// --- Admin Middleware ---
const adminAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const adminId = req.headers['x-admin-id'];
  if (!adminId) return res.status(401).json({ error: "غير مصرح لك بالدخول" });
  
  const { data: admin } = await supabase.from('admins').select('*').eq('id', adminId).single();
  if (!admin) return res.status(401).json({ error: "غير مصرح لك بالدخول" });
  
  (req as any).admin = admin;
  next();
};

const superAdminOnly = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if ((req as any).admin.role !== 'super_admin') {
    return res.status(403).json({ error: "هذه الصلاحية للمدير العام فقط" });
  }
  next();
};

const logAudit = async (adminId: string, action: string, type: string, id: string, oldVal: any = null, newVal: any = null) => {
  await supabase.from('audit_logs').insert({
    admin_id: adminId,
    action,
    entity_type: type,
    entity_id: id,
    old_value: oldVal,
    new_value: newVal
  });
};

// --- Admin Endpoints ---

// Admin Login
app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const { data: admin, error } = await supabase.from('admins').select('*').eq('username', username).single();
    
    if (error) {
      console.error('Login Error (Supabase):', error);
      if (error.code === 'PGRST116') { // Record not found
         return res.status(401).json({ error: "اسم المستخدم غير موجود. تأكد من تشغيل كود SQL وإعادة تشغيل السيرفر." });
      }
      return res.status(500).json({ error: `خطأ في قاعدة البيانات: ${error.message}` });
    }

    const success = admin && admin.password_hash === password;
    
    try {
      await supabase.from('admin_login_attempts').insert({
        username,
        ip_address: req.ip,
        success
      });
    } catch (e) {
      console.error('Failed to log attempt:', e);
    }

    if (!success) return res.status(401).json({ error: "كلمة المرور غير صحيحة" });
    
    res.json({ admin });
  } catch (err: any) {
    console.error('Unexpected Login Error:', err);
    res.status(500).json({ error: "حدث خطأ غير متوقع أثناء تسجيل الدخول" });
  }
});

// Admin Stats
app.get("/api/admin/stats", adminAuth, async (req, res) => {
  const [bookings, revenue, users, items] = await Promise.all([
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('payments').select('amount').eq('status', 'completed').eq('type', 'payment'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('booking_items').select('*', { count: 'exact', head: true })
  ]);

  const totalRevenue = revenue.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  res.json({
    totalBookings: bookings.count,
    totalRevenue,
    totalUsers: users.count,
    totalItems: items.count
  });
});

// User Management
app.get("/api/admin/users", adminAuth, async (req, res) => {
  const { data } = await supabase.from('profiles').select('*, wallets(balance)').order('created_at', { ascending: false });
  res.json(data);
});

app.patch("/api/admin/users/:id", adminAuth, async (req, res) => {
  const { is_active, role } = req.body;
  const { data: oldUser } = await supabase.from('profiles').select('*').eq('id', req.params.id).single();
  
  const { data, error } = await supabase.from('profiles').update({ is_active, role }).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  
  await logAudit((req as any).admin.id, 'UPDATE_USER', 'profile', req.params.id, oldUser, data);
  res.json(data);
});

// Booking Management
app.get("/api/admin/bookings", adminAuth, async (req, res) => {
  const { data } = await supabase.from('bookings').select('*, profiles(full_name), booking_items(title)').order('created_at', { ascending: false });
  res.json(data);
});

app.patch("/api/admin/bookings/:id", adminAuth, async (req, res) => {
  const { status } = req.body;
  const { data: oldBooking } = await supabase.from('bookings').select('*').eq('id', req.params.id).single();
  
  const { data, error } = await supabase.from('bookings').update({ status }).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  
  await logAudit((req as any).admin.id, 'UPDATE_BOOKING', 'booking', req.params.id, oldBooking, data);
  res.json(data);
});

// Payment Management
app.get("/api/admin/payments", adminAuth, async (req, res) => {
  const { data } = await supabase.from('payments').select('*, profiles(full_name)').order('created_at', { ascending: false });
  res.json(data);
});

app.patch("/api/admin/payments/:id", adminAuth, async (req, res) => {
  const { status } = req.body;
  const { data: payment } = await supabase.from('payments').select('*').eq('id', req.params.id).single();
  
  if (status === 'completed' && payment.status !== 'completed') {
    if (payment.type === 'deposit') {
      await supabase.rpc('increment_wallet_balance', { user_id_param: payment.user_id, amount_param: payment.amount });
    }
  }

  const { data, error } = await supabase.from('payments').update({ status }).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  
  await logAudit((req as any).admin.id, 'UPDATE_PAYMENT', 'payment', req.params.id, payment, data);
  res.json(data);
});

// Booking Items Management
app.get("/api/admin/items", adminAuth, async (req, res) => {
  const { data } = await supabase.from('booking_items').select('*').order('created_at', { ascending: false });
  res.json(data);
});

app.post("/api/admin/items", adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('booking_items').insert(req.body).select().single();
  if (error) return res.status(400).json({ error: error.message });
  
  await logAudit((req as any).admin.id, 'CREATE_ITEM', 'booking_item', data.id, null, data);
  res.json(data);
});

app.patch("/api/admin/items/:id", adminAuth, async (req, res) => {
  const { data: oldItem } = await supabase.from('booking_items').select('*').eq('id', req.params.id).single();
  const { data, error } = await supabase.from('booking_items').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  
  await logAudit((req as any).admin.id, 'UPDATE_ITEM', 'booking_item', req.params.id, oldItem, data);
  res.json(data);
});

// App Settings
app.get("/api/admin/settings", adminAuth, async (req, res) => {
  const { data } = await supabase.from('app_settings').select('*');
  res.json(data);
});

app.post("/api/admin/settings", adminAuth, superAdminOnly, async (req, res) => {
  const { key, value } = req.body;
  const { data, error } = await supabase.from('app_settings').upsert({ key, value, updated_at: new Date() }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  
  await logAudit((req as any).admin.id, 'UPDATE_SETTINGS', 'app_setting', key, null, value);
  res.json(data);
});

// Audit Logs
app.get("/api/admin/audit", adminAuth, superAdminOnly, async (req, res) => {
  const { data } = await supabase.from('audit_logs').select('*, admins(username)').order('created_at', { ascending: false });
  res.json(data);
});

// Vite Integration
async function startServer() {
  await bootstrapAdmin();
  
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
