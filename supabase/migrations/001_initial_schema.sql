-- Animatica Database Migration v001
-- Run this in Supabase SQL Editor to set up the complete schema

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE film_visibility AS ENUM ('public', 'unlisted', 'private', 'draft');
CREATE TYPE content_rating AS ENUM ('G', 'PG', 'T', 'M');
CREATE TYPE creator_role AS ENUM ('director', 'writer', 'animator', 'producer', 'sound_designer', 'asset_creator', 'voice_actor');
CREATE TYPE asset_category AS ENUM ('character', 'prop', 'environment', 'sprite', 'animation_clip', 'sound_pack', 'template');
CREATE TYPE asset_pricing AS ENUM ('free', 'purchase', 'rental', 'royalty');
CREATE TYPE notification_type AS ENUM ('donation_received', 'comment_received', 'like_received', 'follow_received', 'collab_invite', 'collab_accepted', 'asset_purchased', 'asset_review', 'fund_payout', 'film_published', 'episode_released');

-- ============================================
-- UTILITY FUNCTIONS
-- ============================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PROFILES
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  website TEXT,
  wallet_address TEXT UNIQUE,
  total_films INTEGER DEFAULT 0,
  total_views BIGINT DEFAULT 0,
  total_earned_wei TEXT DEFAULT '0',
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  creator_weight INTEGER DEFAULT 0,
  preferred_language TEXT DEFAULT 'en',
  preferred_role TEXT DEFAULT 'director',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_wallet ON profiles(wallet_address) WHERE wallet_address IS NOT NULL;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Creator'),
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || LEFT(NEW.id::text, 8)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SERIES
-- ============================================
CREATE TABLE public.series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  thumbnail_url TEXT,
  slug TEXT UNIQUE NOT NULL,
  genre TEXT,
  tags TEXT[] DEFAULT '{}',
  episode_count INTEGER DEFAULT 0,
  subscriber_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_series_owner ON series(owner_id);

-- ============================================
-- FILMS
-- ============================================
CREATE TABLE public.films (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  slug TEXT UNIQUE NOT NULL,
  thumbnail_url TEXT,
  video_url TEXT,
  project_json JSONB,
  duration_seconds INTEGER DEFAULT 0,
  rating content_rating DEFAULT 'G',
  visibility film_visibility DEFAULT 'draft',
  tags TEXT[] DEFAULT '{}',
  genre TEXT,
  language TEXT DEFAULT 'en',
  series_id UUID REFERENCES series(id) ON DELETE SET NULL,
  episode_number INTEGER,
  season_number INTEGER DEFAULT 1,
  view_count BIGINT DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  donation_total_wei TEXT DEFAULT '0',
  avg_retention_pct DECIMAL(5,2) DEFAULT 0,
  chain_film_id BIGINT UNIQUE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_films_owner ON films(owner_id);
CREATE INDEX idx_films_series ON films(series_id);
CREATE INDEX idx_films_visibility ON films(visibility) WHERE visibility = 'public';
CREATE INDEX idx_films_published ON films(published_at DESC) WHERE visibility = 'public';
CREATE INDEX idx_films_tags ON films USING GIN(tags);

ALTER TABLE films ADD COLUMN fts tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(description, '')), 'B')
  ) STORED;
CREATE INDEX idx_films_fts ON films USING GIN(fts);

CREATE OR REPLACE FUNCTION generate_film_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'))
                || '-' || LEFT(NEW.id::text, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER film_slug_trigger
  BEFORE INSERT ON films
  FOR EACH ROW EXECUTE FUNCTION generate_film_slug();

CREATE TRIGGER films_updated_at
  BEFORE UPDATE ON films
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ============================================
-- FILM_CREATORS
-- ============================================
CREATE TABLE public.film_creators (
  film_id UUID REFERENCES films(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role creator_role NOT NULL,
  revenue_share_bps INTEGER NOT NULL DEFAULT 10000,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  PRIMARY KEY (film_id, user_id, role),
  CONSTRAINT valid_share CHECK (revenue_share_bps >= 0 AND revenue_share_bps <= 10000)
);

CREATE INDEX idx_film_creators_user ON film_creators(user_id);

-- ============================================
-- VIEWS
-- ============================================
CREATE TABLE public.views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  film_id UUID NOT NULL REFERENCES films(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  watched_seconds INTEGER DEFAULT 0,
  total_seconds INTEGER NOT NULL,
  retention_pct DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN total_seconds > 0
    THEN LEAST((watched_seconds::decimal / total_seconds) * 100, 100)
    ELSE 0 END
  ) STORED,
  source TEXT,
  device TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_views_film ON views(film_id);
CREATE INDEX idx_views_created ON views(created_at DESC);

CREATE OR REPLACE FUNCTION update_film_view_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE films SET
    view_count = view_count + 1,
    avg_retention_pct = (SELECT AVG(retention_pct) FROM views WHERE film_id = NEW.film_id)
  WHERE id = NEW.film_id;
  UPDATE profiles SET total_views = total_views + 1
  WHERE id = (SELECT owner_id FROM films WHERE id = NEW.film_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_view_created
  AFTER INSERT ON views
  FOR EACH ROW EXECUTE FUNCTION update_film_view_stats();

-- ============================================
-- DONATIONS
-- ============================================
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  film_id UUID NOT NULL REFERENCES films(id) ON DELETE CASCADE,
  amount_wei TEXT NOT NULL,
  amount_usd DECIMAL(12,2),
  currency TEXT DEFAULT 'ETH',
  tx_hash TEXT UNIQUE NOT NULL,
  chain TEXT DEFAULT 'base',
  block_number BIGINT,
  creator_amount_wei TEXT NOT NULL,
  fund_amount_wei TEXT NOT NULL,
  platform_amount_wei TEXT NOT NULL,
  stripe_payment_id TEXT UNIQUE,
  is_fiat BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_donations_film ON donations(film_id);
CREATE INDEX idx_donations_donor ON donations(donor_id);

-- ============================================
-- COMMENTS
-- ============================================
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  film_id UUID NOT NULL REFERENCES films(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN DEFAULT FALSE,
  like_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_film ON comments(film_id);
CREATE INDEX idx_comments_parent ON comments(parent_id) WHERE parent_id IS NOT NULL;

-- ============================================
-- LIKES
-- ============================================
CREATE TABLE public.likes (
  film_id UUID REFERENCES films(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (film_id, user_id)
);

CREATE OR REPLACE FUNCTION update_film_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE films SET like_count = like_count + 1 WHERE id = NEW.film_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE films SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.film_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_like_change
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION update_film_like_count();

-- ============================================
-- FOLLOWS
-- ============================================
CREATE TABLE public.follows (
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET follower_count = follower_count + 1 WHERE id = NEW.following_id;
    UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET follower_count = GREATEST(follower_count - 1, 0) WHERE id = OLD.following_id;
    UPDATE profiles SET following_count = GREATEST(following_count - 1, 0) WHERE id = OLD.follower_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_follow_change
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- ============================================
-- ASSETS (Marketplace)
-- ============================================
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  category asset_category NOT NULL,
  tags TEXT[] DEFAULT '{}',
  file_url TEXT NOT NULL,
  preview_url TEXT,
  thumbnail_url TEXT,
  file_size_bytes BIGINT,
  polygon_count INTEGER,
  file_format TEXT,
  pricing_model asset_pricing DEFAULT 'free',
  price_cents INTEGER DEFAULT 0,
  royalty_bps INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  rating_avg DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  revenue_total_wei TEXT DEFAULT '0',
  is_approved BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  chain_asset_id BIGINT UNIQUE,
  fts tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(description, '')), 'B')
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assets_creator ON assets(creator_id);
CREATE INDEX idx_assets_category ON assets(category);
CREATE INDEX idx_assets_fts ON assets USING GIN(fts);

-- ============================================
-- ASSET_PURCHASES
-- ============================================
CREATE TABLE public.asset_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  price_paid_cents INTEGER NOT NULL,
  tx_hash TEXT,
  rental_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(asset_id, buyer_id)
);

-- ============================================
-- ASSET_REVIEWS
-- ============================================
CREATE TABLE public.asset_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  body TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(asset_id, user_id)
);

CREATE OR REPLACE FUNCTION update_asset_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE assets SET
    rating_avg = (SELECT AVG(rating) FROM asset_reviews WHERE asset_id = COALESCE(NEW.asset_id, OLD.asset_id)),
    rating_count = (SELECT COUNT(*) FROM asset_reviews WHERE asset_id = COALESCE(NEW.asset_id, OLD.asset_id))
  WHERE id = COALESCE(NEW.asset_id, OLD.asset_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON asset_reviews
  FOR EACH ROW EXECUTE FUNCTION update_asset_rating();

-- ============================================
-- FILM_ASSETS (junction)
-- ============================================
CREATE TABLE public.film_assets (
  film_id UUID REFERENCES films(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  PRIMARY KEY (film_id, asset_id)
);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  film_id UUID REFERENCES films(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE NOT is_read;

-- ============================================
-- COLLAB_SESSIONS
-- ============================================
CREATE TABLE public.collab_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  film_id UUID NOT NULL REFERENCES films(id) ON DELETE CASCADE,
  yjs_state BYTEA,
  active_users UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_collab_sessions_film ON collab_sessions(film_id);

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE films ENABLE ROW LEVEL SECURITY;
ALTER TABLE film_creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE views ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Films
CREATE POLICY "films_select" ON films FOR SELECT USING (
  visibility = 'public' OR owner_id = auth.uid()
  OR EXISTS (SELECT 1 FROM film_creators WHERE film_id = id AND user_id = auth.uid())
);
CREATE POLICY "films_insert" ON films FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "films_update" ON films FOR UPDATE USING (
  owner_id = auth.uid()
  OR EXISTS (SELECT 1 FROM film_creators WHERE film_id = id AND user_id = auth.uid())
);
CREATE POLICY "films_delete" ON films FOR DELETE USING (owner_id = auth.uid());

-- Comments
CREATE POLICY "comments_select" ON comments FOR SELECT USING (
  EXISTS (SELECT 1 FROM films WHERE id = film_id AND visibility = 'public')
);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_update" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "comments_delete" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Likes
CREATE POLICY "likes_select" ON likes FOR SELECT USING (true);
CREATE POLICY "likes_insert" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete" ON likes FOR DELETE USING (auth.uid() = user_id);

-- Follows
CREATE POLICY "follows_select" ON follows FOR SELECT USING (true);
CREATE POLICY "follows_insert" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_delete" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- Assets
CREATE POLICY "assets_select" ON assets FOR SELECT USING (is_active = true OR creator_id = auth.uid());
CREATE POLICY "assets_insert" ON assets FOR INSERT WITH CHECK (creator_id = auth.uid());
CREATE POLICY "assets_update" ON assets FOR UPDATE USING (creator_id = auth.uid());

-- Notifications
CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- Donations (public read)
CREATE POLICY "donations_select" ON donations FOR SELECT USING (true);

-- Views (public insert)
CREATE POLICY "views_insert" ON views FOR INSERT WITH CHECK (true);

-- Series
CREATE POLICY "series_select" ON series FOR SELECT USING (true);
CREATE POLICY "series_insert" ON series FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "series_update" ON series FOR UPDATE USING (owner_id = auth.uid());

-- Film creators
CREATE POLICY "film_creators_select" ON film_creators FOR SELECT USING (true);

-- Asset purchases
CREATE POLICY "asset_purchases_select" ON asset_purchases FOR SELECT USING (buyer_id = auth.uid());

-- Asset reviews
CREATE POLICY "asset_reviews_select" ON asset_reviews FOR SELECT USING (true);
CREATE POLICY "asset_reviews_insert" ON asset_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Collab sessions
CREATE POLICY "collab_select" ON collab_sessions FOR SELECT USING (
  EXISTS (SELECT 1 FROM films WHERE id = film_id AND (
    owner_id = auth.uid()
    OR EXISTS (SELECT 1 FROM film_creators WHERE film_id = collab_sessions.film_id AND user_id = auth.uid())
  ))
);
