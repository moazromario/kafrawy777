-- Booking and Payment System Schema

-- 1. Profiles (Extended User Data)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Wallets
CREATE TABLE IF NOT EXISTS wallets (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  balance NUMERIC DEFAULT 0 CHECK (balance >= 0),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Booking Items (Services, Rooms, Events)
CREATE TABLE IF NOT EXISTS booking_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('service', 'room', 'event')),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  capacity INTEGER DEFAULT 1, -- For rooms/events
  image_url TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  item_id UUID REFERENCES booking_items(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE, -- Optional for services
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Payments & Transactions
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('vodafone_cash', 'wallet')),
  type TEXT NOT NULL CHECK (type IN ('deposit', 'payment')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  transaction_ref TEXT, -- For Vodafone Cash reference
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Mock Data

-- Insert Booking Items
INSERT INTO booking_items (type, title, description, price, capacity, location)
VALUES 
  ('room', 'جناح ملكي - فندق كليوباترا', 'إطلالة رائعة على النيل مع خدمة 5 نجوم', 2500, 2, 'كفر البطيخ - الكورنيش'),
  ('service', 'كشف منزلي - د. محمد علي', 'أخصائي باطنة وقلب', 300, 1, 'كفر البطيخ - حي الزهور'),
  ('event', 'تذكرة سينما - فيلم كيرة والجن', 'عرض الساعة 9 مساءً', 100, 50, 'سينما كفر البطيخ'),
  ('room', 'غرفة مزدوجة - فندق العائلة', 'غرفة مريحة للعائلات', 800, 4, 'كفر البطيخ - وسط المدينة'),
  ('service', 'صيانة تكييف - م. هاني', 'شحن فريون وتنظيف شامل', 450, 1, 'موقع العميل');

-- 7. Wallet Functions
CREATE OR REPLACE FUNCTION increment_wallet_balance(user_id_param UUID, amount_param NUMERIC)
RETURNS NUMERIC AS $$
DECLARE
  new_balance NUMERIC;
BEGIN
  INSERT INTO wallets (user_id, balance)
  VALUES (user_id_param, amount_param)
  ON CONFLICT (user_id) DO UPDATE
  SET balance = wallets.balance + amount_param,
      updated_at = now()
  RETURNING balance INTO new_balance;
  
  RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_wallet_balance(user_id_param UUID, amount_param NUMERIC)
RETURNS NUMERIC AS $$
DECLARE
  new_balance NUMERIC;
BEGIN
  UPDATE wallets
  SET balance = balance - amount_param,
      updated_at = now()
  WHERE user_id = user_id_param
  RETURNING balance INTO new_balance;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;
  
  RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Admin Management
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_login_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL,
  ip_address TEXT,
  success BOOLEAN NOT NULL,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. App Settings
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Update Profiles to include status
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Insert Default Super Admin (Password: Mdhg0109022901@#$)
INSERT INTO admins (username, password_hash, role)
VALUES ('superadmin', 'Mdhg0109022901@#$', 'super_admin')
ON CONFLICT (username) DO NOTHING;

-- Default Settings
INSERT INTO app_settings (key, value)
VALUES 
  ('general', '{"app_name": "كفراوي", "logo_url": "", "contact_email": "admin@kafrawy.com"}'),
  ('policies', '{"terms": "شروط الخدمة...", "privacy": "سياسة الخصوصية..."}')
ON CONFLICT (key) DO NOTHING;
