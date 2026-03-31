-- 1. Profiles (Unified for User, Captain, Admin)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user', -- 'user', 'captain', 'admin', 'super_admin'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Wallets
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  balance DECIMAL(12,2) DEFAULT 0.00,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Vehicles (Kafrawi Go)
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  captain_id UUID REFERENCES profiles(id),
  model TEXT NOT NULL,
  plate_number TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL, -- 'car', 'bike', 'van'
  status TEXT DEFAULT 'available', -- 'available', 'busy', 'offline'
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Services (General Directory)
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  category TEXT NOT NULL, -- 'maintenance', 'cleaning', 'delivery', etc.
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Projects (Internal Projects)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  budget DECIMAL(12,2),
  status TEXT DEFAULT 'planned', -- 'planned', 'ongoing', 'completed'
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Bookings / Orders
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  captain_id UUID REFERENCES profiles(id), -- For Kafrawi Go trips
  entity_type TEXT NOT NULL, -- 'vehicle', 'service', 'project'
  entity_id UUID NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  total_price DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'ongoing', 'completed', 'cancelled'
  payment_status TEXT DEFAULT 'unpaid', -- 'unpaid', 'paid'
  pickup_location TEXT,
  dropoff_location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  booking_id UUID REFERENCES bookings(id),
  amount DECIMAL(12,2) NOT NULL,
  method TEXT NOT NULL, -- 'wallet', 'vodafone_cash'
  type TEXT NOT NULL, -- 'deposit', 'payment'
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  transaction_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Admin Credentials (Internal for specific login)
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --- Functions ---

-- Increment Wallet
CREATE OR REPLACE FUNCTION increment_wallet_balance(user_id_param UUID, amount_param DECIMAL)
RETURNS DECIMAL AS $$
DECLARE
  new_balance DECIMAL;
BEGIN
  UPDATE wallets 
  SET balance = balance + amount_param, updated_at = NOW()
  WHERE user_id = user_id_param
  RETURNING balance INTO new_balance;
  RETURN new_balance;
END;
$$ LANGUAGE plpgsql;

-- Decrement Wallet
CREATE OR REPLACE FUNCTION decrement_wallet_balance(user_id_param UUID, amount_param DECIMAL)
RETURNS DECIMAL AS $$
DECLARE
  new_balance DECIMAL;
BEGIN
  UPDATE wallets 
  SET balance = balance - amount_param, updated_at = NOW()
  WHERE user_id = user_id_param AND balance >= amount_param
  RETURNING balance INTO new_balance;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  RETURN new_balance;
END;
$$ LANGUAGE plpgsql;

-- --- Indexes ---
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_captain ON bookings(captain_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
