-- كفراوي - موديول الخدمات (Services Module)
-- SQL Schema (Production Ready)

-- 1. جدول مقدمي الخدمات (Service Providers)
CREATE TABLE IF NOT EXISTS service_providers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('صنايعية', 'مدرسين', 'محامين', 'محاسبين', 'أطباء')),
  title TEXT NOT NULL, -- مثلاً: سباك محترف، مدرس رياضيات
  description TEXT,
  location TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  avatar_url TEXT,
  rating NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id) -- كل مستخدم يمكنه إنشاء بروفايل مقدم خدمة واحد فقط
);

-- 2. جدول الخدمات الفرعية (Services)
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. جدول التقييمات (Reviews)
CREATE TABLE IF NOT EXISTS service_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(provider_id, user_id) -- المستخدم يقيم مقدم الخدمة مرة واحدة فقط
);

-- 4. جدول المفضلة (Favorites)
CREATE TABLE IF NOT EXISTS service_favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, provider_id)
);

-- 5. الفهارس (Indexes) لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_providers_category ON service_providers(category);
CREATE INDEX IF NOT EXISTS idx_providers_location ON service_providers(location);
CREATE INDEX IF NOT EXISTS idx_reviews_provider ON service_reviews(provider_id);
CREATE INDEX IF NOT EXISTS idx_services_provider ON services(provider_id);

-- 6. تفعيل الأمان (RLS)
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_favorites ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول (Policies)
-- الجميع يمكنه الرؤية
CREATE POLICY "الجميع يمكنه رؤية مقدمي الخدمات" ON service_providers FOR SELECT USING (true);
CREATE POLICY "الجميع يمكنه رؤية الخدمات" ON services FOR SELECT USING (true);
CREATE POLICY "الجميع يمكنه رؤية التقييمات" ON service_reviews FOR SELECT USING (true);

-- الإضافة والتعديل للمالك فقط
CREATE POLICY "المستخدم ينشئ بروفايل خاص به" ON service_providers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "المستخدم يعدل بروفايله فقط" ON service_providers FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "مقدم الخدمة يضيف خدماته" ON services FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM service_providers WHERE id = provider_id AND user_id = auth.uid())
);

CREATE POLICY "المستخدم يضيف تقييم" ON service_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "المستخدم يتحكم في مفضلته" ON service_favorites FOR ALL USING (auth.uid() = user_id);

-- 7. وظيفة (Function) لتحديث التقييم تلقائياً
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE service_providers
  SET 
    rating = (SELECT AVG(rating) FROM service_reviews WHERE provider_id = NEW.provider_id),
    review_count = (SELECT COUNT(*) FROM service_reviews WHERE provider_id = NEW.provider_id)
  WHERE id = NEW.provider_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger لتشغيل الوظيفة عند إضافة تقييم جديد
DROP TRIGGER IF EXISTS on_review_added ON service_reviews;
CREATE TRIGGER on_review_added
  AFTER INSERT OR UPDATE OR DELETE ON service_reviews
  FOR EACH ROW EXECUTE FUNCTION update_provider_rating();
