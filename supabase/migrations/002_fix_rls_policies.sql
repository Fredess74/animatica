-- Fix insecure RLS policies to prevent mass assignment of sensitive fields

-- PROFILES
DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  NEW.id IS NOT DISTINCT FROM OLD.id AND
  NEW.total_films IS NOT DISTINCT FROM OLD.total_films AND
  NEW.total_views IS NOT DISTINCT FROM OLD.total_views AND
  NEW.total_earned_wei IS NOT DISTINCT FROM OLD.total_earned_wei AND
  NEW.follower_count IS NOT DISTINCT FROM OLD.follower_count AND
  NEW.following_count IS NOT DISTINCT FROM OLD.following_count AND
  NEW.creator_weight IS NOT DISTINCT FROM OLD.creator_weight
);

-- SERIES
DROP POLICY IF EXISTS "series_update" ON series;
CREATE POLICY "series_update" ON series FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (
  owner_id = auth.uid() AND
  NEW.id IS NOT DISTINCT FROM OLD.id AND
  NEW.owner_id IS NOT DISTINCT FROM OLD.owner_id AND
  NEW.episode_count IS NOT DISTINCT FROM OLD.episode_count AND
  NEW.subscriber_count IS NOT DISTINCT FROM OLD.subscriber_count
);

-- FILMS
DROP POLICY IF EXISTS "films_update" ON films;
CREATE POLICY "films_update" ON films FOR UPDATE
USING (
  owner_id = auth.uid()
  OR EXISTS (SELECT 1 FROM film_creators WHERE film_id = id AND user_id = auth.uid())
)
WITH CHECK (
  (
    owner_id = auth.uid()
    OR EXISTS (SELECT 1 FROM film_creators WHERE film_id = id AND user_id = auth.uid())
  ) AND
  NEW.id IS NOT DISTINCT FROM OLD.id AND
  NEW.owner_id IS NOT DISTINCT FROM OLD.owner_id AND
  NEW.view_count IS NOT DISTINCT FROM OLD.view_count AND
  NEW.like_count IS NOT DISTINCT FROM OLD.like_count AND
  NEW.comment_count IS NOT DISTINCT FROM OLD.comment_count AND
  NEW.donation_total_wei IS NOT DISTINCT FROM OLD.donation_total_wei AND
  NEW.avg_retention_pct IS NOT DISTINCT FROM OLD.avg_retention_pct AND
  NEW.chain_film_id IS NOT DISTINCT FROM OLD.chain_film_id
);

-- ASSETS
DROP POLICY IF EXISTS "assets_update" ON assets;
CREATE POLICY "assets_update" ON assets FOR UPDATE
USING (creator_id = auth.uid())
WITH CHECK (
  creator_id = auth.uid() AND
  NEW.id IS NOT DISTINCT FROM OLD.id AND
  NEW.creator_id IS NOT DISTINCT FROM OLD.creator_id AND
  NEW.download_count IS NOT DISTINCT FROM OLD.download_count AND
  NEW.usage_count IS NOT DISTINCT FROM OLD.usage_count AND
  NEW.rating_avg IS NOT DISTINCT FROM OLD.rating_avg AND
  NEW.rating_count IS NOT DISTINCT FROM OLD.rating_count AND
  NEW.revenue_total_wei IS NOT DISTINCT FROM OLD.revenue_total_wei AND
  NEW.chain_asset_id IS NOT DISTINCT FROM OLD.chain_asset_id AND
  NEW.is_approved IS NOT DISTINCT FROM OLD.is_approved
);

-- COMMENTS
DROP POLICY IF EXISTS "comments_update" ON comments;
CREATE POLICY "comments_update" ON comments FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND
  NEW.id IS NOT DISTINCT FROM OLD.id AND
  NEW.user_id IS NOT DISTINCT FROM OLD.user_id AND
  NEW.film_id IS NOT DISTINCT FROM OLD.film_id AND
  NEW.like_count IS NOT DISTINCT FROM OLD.like_count AND
  NEW.reply_count IS NOT DISTINCT FROM OLD.reply_count
);

-- NOTIFICATIONS
DROP POLICY IF EXISTS "notifications_update" ON notifications;
CREATE POLICY "notifications_update" ON notifications FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid() AND
  NEW.id IS NOT DISTINCT FROM OLD.id AND
  NEW.user_id IS NOT DISTINCT FROM OLD.user_id AND
  NEW.type IS NOT DISTINCT FROM OLD.type AND
  NEW.title IS NOT DISTINCT FROM OLD.title AND
  NEW.body IS NOT DISTINCT FROM OLD.body AND
  NEW.film_id IS NOT DISTINCT FROM OLD.film_id AND
  NEW.actor_id IS NOT DISTINCT FROM OLD.actor_id AND
  NEW.created_at IS NOT DISTINCT FROM OLD.created_at
);
