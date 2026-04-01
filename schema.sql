-- KafrawyGo Professional Database Schema for Supabase (PostgreSQL)
-- Optimized for Real-time, Auth, and Security

-- 0. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 0. Cleanup (Optional but recommended for fresh setup)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS ride_offers CASCADE;
DROP TABLE IF EXISTS rides CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 1. Custom Types (Enums)
-- We use a check to avoid errors if types already exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_type') THEN
        CREATE TYPE service_type AS ENUM ('ride', 'delivery', 'shipping', 'tuktuk');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'driver_status') THEN
        CREATE TYPE driver_status AS ENUM ('online', 'offline', 'busy');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ride_status') THEN
        CREATE TYPE ride_status AS ENUM ('searching', 'matched', 'arrived', 'active', 'completed', 'cancelled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'offer_status') THEN
        CREATE TYPE offer_status AS ENUM ('pending', 'accepted', 'rejected', 'expired');
    END IF;
END $$;

-- 2. Profiles Table (Links to Supabase Auth)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT UNIQUE,
    photo_url TEXT,
    rating DECIMAL(3,2) DEFAULT 5.0,
    is_driver BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Drivers Table
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    car_model TEXT NOT NULL,
    car_plate TEXT NOT NULL,
    car_color TEXT,
    service_type service_type DEFAULT 'ride',
    status driver_status DEFAULT 'offline',
    total_trips INTEGER DEFAULT 0,
    current_lat DECIMAL(10, 8),
    current_lng DECIMAL(11, 8),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Rides Table
CREATE TABLE rides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    driver_id UUID REFERENCES drivers(id),
    service_type service_type NOT NULL,
    
    -- Location Data
    pickup_address TEXT NOT NULL,
    pickup_lat DECIMAL(10, 8) NOT NULL,
    pickup_lng DECIMAL(11, 8) NOT NULL,
    destination_address TEXT NOT NULL,
    destination_lat DECIMAL(10, 8) NOT NULL,
    destination_lng DECIMAL(11, 8) NOT NULL,
    
    -- Ride Details
    status ride_status DEFAULT 'searching',
    suggested_price DECIMAL(10, 2),
    final_price DECIMAL(10, 2),
    distance_km DECIMAL(10, 2),
    duration_min INTEGER,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    matched_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 5. Ride Offers (Bidding System)
CREATE TABLE ride_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID REFERENCES rides(id) ON DELETE CASCADE NOT NULL,
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE NOT NULL,
    offered_price DECIMAL(10, 2) NOT NULL,
    status offer_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Messages (In-App Chat)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID REFERENCES rides(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES profiles(id) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 8. Basic RLS Policies
-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Rides
DROP POLICY IF EXISTS "Users can view their own rides." ON rides;
CREATE POLICY "Users can view their own rides." ON rides FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Drivers can view searching rides." ON rides;
CREATE POLICY "Drivers can view searching rides." ON rides FOR SELECT USING (status = 'searching');

-- 9. Enable Realtime
-- In Supabase Dashboard, go to Database -> Replication -> supabase_realtime and add these tables
-- Or use SQL:
-- alter publication supabase_realtime add table rides;
-- alter publication supabase_realtime add table drivers;
-- alter publication supabase_realtime add table ride_offers;
-- alter publication supabase_realtime add table messages;

-- 10. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_rides_user ON rides(user_id);
CREATE INDEX IF NOT EXISTS idx_rides_driver ON rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
-- 11. Community Tables
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    content TEXT NOT NULL,
    image_url TEXT,
    feeling TEXT,
    activity TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS story_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS live_streams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'live',
    viewers INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS live_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stream_id UUID REFERENCES live_streams(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, friend_id)
);

-- Enable RLS for Community Tables
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies for Community
CREATE POLICY "Public read access for community tables" ON posts FOR SELECT USING (true);
CREATE POLICY "Public read access for community tables" ON comments FOR SELECT USING (true);
CREATE POLICY "Public read access for community tables" ON likes FOR SELECT USING (true);
CREATE POLICY "Public read access for community tables" ON stories FOR SELECT USING (true);
CREATE POLICY "Public read access for community tables" ON story_comments FOR SELECT USING (true);
CREATE POLICY "Public read access for community tables" ON live_streams FOR SELECT USING (true);
CREATE POLICY "Public read access for community tables" ON live_messages FOR SELECT USING (true);
CREATE POLICY "Public read access for community tables" ON friendships FOR SELECT USING (true);

CREATE POLICY "Users can insert their own data" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can insert their own data" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can insert their own data" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can insert their own data" ON stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can insert their own data" ON story_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can insert their own data" ON live_streams FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can insert their own data" ON live_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can insert their own data" ON friendships FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own data" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own data" ON live_streams FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own data" ON friendships FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can delete their own data" ON posts FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own data" ON likes FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own data" ON friendships FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

