-- =============================================
-- FAMOUS WORLD - Complete Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  full_name TEXT,
  password_hash TEXT NOT NULL,
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  cover_url TEXT DEFAULT '',
  country TEXT DEFAULT '',
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  total_posts INTEGER DEFAULT 0,
  famous_coins INTEGER DEFAULT 50,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_color TEXT DEFAULT NULL,
  badge_type TEXT DEFAULT NULL,
  is_bot BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  is_special_account BOOLEAN DEFAULT FALSE,
  special_account_type TEXT DEFAULT NULL,
  telegram_id TEXT DEFAULT NULL,
  joined_date TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- POSTS TABLE
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  link TEXT NOT NULL,
  platform TEXT DEFAULT 'other',
  thumbnail_url TEXT DEFAULT '',
  title TEXT DEFAULT '',
  caption TEXT DEFAULT '',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_promoted BOOLEAN DEFAULT FALSE,
  promoted_coins_spent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FOLLOWS TABLE
CREATE TABLE IF NOT EXISTS public.follows (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  following_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- LIKES TABLE
CREATE TABLE IF NOT EXISTS public.likes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT DEFAULT '',
  media_url TEXT DEFAULT '',
  message_type TEXT DEFAULT 'text',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  from_user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  content TEXT DEFAULT '',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- COIN TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.coin_transactions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT DEFAULT '',
  post_id uuid REFERENCES public.posts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LIVE STREAMS TABLE
CREATE TABLE IF NOT EXISTS public.live_streams (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Live',
  viewers_count INTEGER DEFAULT 0,
  peak_viewers INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- VERIFICATION REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  badge_color TEXT DEFAULT 'blue',
  notes TEXT DEFAULT '',
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- SUPPORT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.support_messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  subject TEXT DEFAULT '',
  content TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CELEBRITY ACCOUNTS TABLE (pre-loaded)
CREATE TABLE IF NOT EXISTS public.celebrity_accounts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  category TEXT DEFAULT 'celebrity',
  avatar_url TEXT DEFAULT '',
  followers_estimate TEXT DEFAULT '',
  is_claimed BOOLEAN DEFAULT FALSE,
  claimed_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BOT COMMENTS POOL
CREATE TABLE IF NOT EXISTS public.bot_comments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  content TEXT NOT NULL,
  commenter_name TEXT NOT NULL,
  commenter_avatar TEXT DEFAULT '',
  is_celebrity BOOLEAN DEFAULT FALSE,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  device_info TEXT DEFAULT '',
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MULTIPLE ACCOUNT REPORTS
CREATE TABLE IF NOT EXISTS public.multiple_account_reports (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  device_fingerprint TEXT NOT NULL,
  user_ids TEXT[] DEFAULT '{}',
  reported_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INSERT SPECIAL ACCOUNTS
-- =============================================
INSERT INTO public.users (username, email, password_hash, full_name, is_special_account, special_account_type, is_verified, verification_color, is_admin, bio, avatar_url)
VALUES 
  ('famousworld', 'famousworld@famousworld.com', '$2b$12$placeholder_official', 'Famous World Official', TRUE, 'official', TRUE, 'gold', TRUE, 'The official Famous World account. Welcome to the world of fame! 🌍', ''),
  ('famousworldsupport', 'support@famousworld.com', '$2b$12$placeholder_support', 'Famous World Support', TRUE, 'support', TRUE, 'blue', FALSE, 'Official Famous World Support. Message us for help! 💬', '')
ON CONFLICT (username) DO NOTHING;

-- =============================================
-- INSERT BOT COMMENTS
-- =============================================
INSERT INTO public.bot_comments (content, commenter_name, commenter_avatar, is_celebrity, category) VALUES
  ('🔥 This is amazing!', 'Drake', '', TRUE, 'hype'),
  ('Love this so much! 💕', 'Beyoncé', '', TRUE, 'love'),
  ('Keep going! You got this 💪', 'Cristiano Ronaldo', '', TRUE, 'motivation'),
  ('Wow absolutely incredible 🤩', 'Taylor Swift', '', TRUE, 'hype'),
  ('This made my day! 😊', 'Selena Gomez', '', TRUE, 'positive'),
  ('Legendary! 👑', 'Jay-Z', '', TRUE, 'hype'),
  ('You are so talented!', 'Rihanna', '', TRUE, 'compliment'),
  ('The whole world needs to see this 🌍', 'Elon Musk', '', FALSE, 'viral'),
  ('Real one! ✅', 'Kanye West', '', TRUE, 'hype'),
  ('This hits different 🎯', 'Cardi B', '', TRUE, 'hype'),
  ('Amazing work! 🙌', 'user_12847', '', FALSE, 'general'),
  ('This is why I love this app 😍', 'user_39281', '', FALSE, 'general'),
  ('Following for more! 🔔', 'user_72938', '', FALSE, 'follow'),
  ('Pure talent right here 🎨', 'user_56127', '', FALSE, 'compliment'),
  ('Shared to all my friends!', 'user_83746', '', FALSE, 'share'),
  ('This is everything! ❤️‍🔥', 'user_29384', '', FALSE, 'love'),
  ('Keep posting more! 🙏', 'user_47291', '', FALSE, 'general'),
  ('You deserve way more followers', 'user_63847', '', FALSE, 'compliment'),
  ('Mind blown 🤯', 'user_91827', '', FALSE, 'hype'),
  ('Absolutely stunning 😮', 'user_34891', '', FALSE, 'compliment')
ON CONFLICT DO NOTHING;

-- =============================================
-- INSERT CELEBRITY ACCOUNTS (pre-loaded)
-- =============================================
INSERT INTO public.celebrity_accounts (username, full_name, category, followers_estimate) VALUES
  ('cristiano', 'Cristiano Ronaldo', 'sports', '600M+'),
  ('leomessi', 'Lionel Messi', 'sports', '500M+'),
  ('kimkardashian', 'Kim Kardashian', 'entertainment', '360M+'),
  ('selenagomez', 'Selena Gomez', 'music', '420M+'),
  ('beyonce', 'Beyoncé', 'music', '300M+'),
  ('taylorswift', 'Taylor Swift', 'music', '280M+'),
  ('justinbieber', 'Justin Bieber', 'music', '290M+'),
  ('arianagrande', 'Ariana Grande', 'music', '380M+'),
  ('therock', 'Dwayne Johnson', 'entertainment', '395M+'),
  ('kyliejenner', 'Kylie Jenner', 'entertainment', '400M+'),
  ('neymarjr', 'Neymar Jr', 'sports', '220M+'),
  ('priyankachopra', 'Priyanka Chopra', 'entertainment', '90M+'),
  ('elonmusk', 'Elon Musk', 'business', '200M+'),
  ('billgates', 'Bill Gates', 'business', '60M+'),
  ('shakira', 'Shakira', 'music', '85M+'),
  ('drake', 'Drake', 'music', '150M+'),
  ('rihanna', 'Rihanna', 'music', '150M+'),
  ('cardi_b', 'Cardi B', 'music', '160M+'),
  ('nickiminaj', 'Nicki Minaj', 'music', '220M+'),
  ('eminem', 'Eminem', 'music', '55M+'),
  ('chancetherappper', 'Chance The Rapper', 'music', '10M+'),
  ('lil_uzi_vert', 'Lil Uzi Vert', 'music', '20M+'),
  ('travisscott', 'Travis Scott', 'music', '50M+'),
  ('jayz', 'Jay-Z', 'music', '4M+'),
  ('kanyewest', 'Kanye West', 'music', '30M+'),
  ('naomicampbell', 'Naomi Campbell', 'fashion', '12M+'),
  ('davidbeckham', 'David Beckham', 'sports', '80M+'),
  ('victoriadavidson', 'Victoria Beckham', 'fashion', '30M+'),
  ('tomholland', 'Tom Holland', 'entertainment', '70M+'),
  ('zendaya', 'Zendaya', 'entertainment', '180M+'),
  ('charlidamelio', 'Charli D Amelio', 'social', '150M+'),
  ('khaby00', 'Khaby Lame', 'social', '160M+'),
  ('mrbeast', 'MrBeast', 'social', '300M+'),
  ('pewdiepie', 'PewDiePie', 'social', '110M+'),
  ('leonardodicaprio', 'Leonardo DiCaprio', 'entertainment', '10M+'),
  ('willsmith', 'Will Smith', 'entertainment', '70M+'),
  ('kevinhart', 'Kevin Hart', 'entertainment', '170M+'),
  ('oprah', 'Oprah Winfrey', 'media', '20M+'),
  ('ellendegeneres', 'Ellen DeGeneres', 'media', '90M+'),
  ('barackobama', 'Barack Obama', 'politics', '135M+')
ON CONFLICT (username) DO NOTHING;

-- =============================================
-- ROW LEVEL SECURITY (optional - enable later)
-- =============================================
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

