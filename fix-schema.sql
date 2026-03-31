-- 1. Drop existing tables to start fresh (WARNING: This will delete existing data in these tables)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. Create the Profiles table (Users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create the Posts table (Community)
CREATE TABLE posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create the Products table (Marketplace)
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  condition TEXT NOT NULL,
  location TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create the Jobs table
CREATE TABLE jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  employer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  salary_range TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Insert Mock Data (Profiles)
INSERT INTO profiles (id, full_name, avatar_url, bio)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'أحمد محمد', 'https://picsum.photos/seed/ahmed/100/100', 'مطور برمجيات من كفر البطيخ'),
  ('00000000-0000-0000-0000-000000000002', 'سارة محمود', 'https://picsum.photos/seed/sara/100/100', 'صاحبة مطعم');

-- 7. Insert Mock Data (Posts)
INSERT INTO posts (author_id, content, likes_count, comments_count)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'أجواء رائعة اليوم في كفر البطيخ! 🌞 هل من اقتراحات لأماكن خروج جديدة؟', 124, 45),
  ('00000000-0000-0000-0000-000000000002', 'تم افتتاح مطعمنا الجديد في شارع النبوي المهندس. خصم 20% بمناسبة الافتتاح لكل أهل كفراوي! 🍔🍟', 342, 89);

-- 8. Insert Mock Data (Jobs)
INSERT INTO jobs (employer_id, title, company, location, type, description, salary_range)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'مطور ويب (Frontend)', 'شركة كفراوي تك', 'كفر البطيخ - تقسيم المحافظة', 'دوام كامل', 'مطلوب مطور ويب خبرة سنتين', '8,000 - 12,000 ج.م'),
  ('00000000-0000-0000-0000-000000000002', 'كاشير ومندوب مبيعات', 'سوبر ماركت العائلة', 'دسوق - شارع الشركات', 'دوام جزئي', 'مطلوب كاشير للعمل فترة مسائية', '3,000 ج.م');

-- 9. Insert Mock Data (Products)
INSERT INTO products (seller_id, title, description, price, category, condition, location)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'ايفون 13 برو ماكس - 256 جيجا', 'استعمال خفيف جدا', 25000, 'إلكترونيات', 'مستعمل - كالجديد', 'دسوق'),
  ('00000000-0000-0000-0000-000000000002', 'طقم أنتريه خشب زان', 'طقم انتريه بحالة ممتازة', 4500, 'أثاث', 'مستعمل - جيد', 'كفر البطيخ');

-- 10. Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- 11. Create Policies (Allow public read access for now)
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Posts are viewable by everyone." ON posts FOR SELECT USING (true);
CREATE POLICY "Products are viewable by everyone." ON products FOR SELECT USING (true);
CREATE POLICY "Jobs are viewable by everyone." ON jobs FOR SELECT USING (true);
