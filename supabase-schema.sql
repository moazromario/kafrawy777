-- Create Products Table
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  condition TEXT NOT NULL,
  location TEXT NOT NULL,
  image_url TEXT,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Orders Table
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS) for Products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Anyone can view products
CREATE POLICY "Products are viewable by everyone." 
  ON products FOR SELECT 
  USING (true);

-- Only authenticated users can insert their own products
CREATE POLICY "Users can insert their own products." 
  ON products FOR INSERT 
  WITH CHECK (auth.uid() = seller_id);

-- Users can update their own products
CREATE POLICY "Users can update their own products." 
  ON products FOR UPDATE 
  USING (auth.uid() = seller_id);

-- Users can delete their own products
CREATE POLICY "Users can delete their own products." 
  ON products FOR DELETE 
  USING (auth.uid() = seller_id);

-- Set up Row Level Security (RLS) for Orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Buyers can view their own orders, sellers can view orders for their products
CREATE POLICY "Users can view their own orders or orders for their products." 
  ON orders FOR SELECT 
  USING (
    auth.uid() = buyer_id OR 
    auth.uid() IN (SELECT seller_id FROM products WHERE id = product_id)
  );

-- Authenticated users can create orders
CREATE POLICY "Authenticated users can create orders." 
  ON orders FOR INSERT 
  WITH CHECK (auth.uid() = buyer_id);

-- Set up Storage for Product Images
-- Note: You need to create a bucket named 'product-images' in the Supabase Dashboard first.
-- Then run these policies:

-- CREATE POLICY "Avatar images are publicly accessible."
--   ON storage.objects FOR SELECT
--   USING ( bucket_id = 'product-images' );

-- CREATE POLICY "Anyone can upload an avatar."
--   ON storage.objects FOR INSERT
--   WITH CHECK ( bucket_id = 'product-images' );
