-- 1. إنشاء جدول الأذكار
create table azkar (
  id uuid default gen_random_uuid() primary key,
  category text not null, -- 'صباح' / 'مساء'
  content text not null,
  count integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. إنشاء جدول المفضلة
create table favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  type text not null check (type in ('ذكر', 'آية')),
  ref_id text not null, -- معرف الذكر أو رقم الآية
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, type, ref_id)
);

-- 3. تفعيل الحماية (RLS)
alter table azkar enable row level security;
alter table favorites enable row level security;

-- 4. سياسات الوصول لجدول الأذكار
-- السماح للقراءة للجميع
create policy "الأذكار قابلة للقراءة للجميع" on azkar
  for select using (true);

-- 5. سياسات الوصول لجدول المفضلة
-- المستخدم يرى مفضلته فقط
create policy "المستخدم يرى مفضلته فقط" on favorites
  for select using (auth.uid() = user_id);

-- المستخدم يضيف لمفضلته فقط
create policy "المستخدم يضيف لمفضلته فقط" on favorites
  for insert with check (auth.uid() = user_id);

-- المستخدم يحذف من مفضلته فقط
create policy "المستخدم يحذف من مفضلته فقط" on favorites
  for delete using (auth.uid() = user_id);

-- 6. إضافة بيانات أولية للأذكار (اختياري)
insert into azkar (category, content, count) values
('صباح', 'أصبحنا وأصبح الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له', 1),
('صباح', 'اللهم بك أصبحنا، وبك أمسينا، وبك نحيا، وبك نموت، وإليك النشور', 1),
('مساء', 'أمسينا وأمسى الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له', 1),
('مساء', 'اللهم بك أمسينا، وبك أصبحنا، وبك نحيا، وبك نموت، وإليك المصير', 1);
