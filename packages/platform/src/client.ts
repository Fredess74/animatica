import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import * as S from './schema';

// Helper to infer Insert types (input to Zod schema)
type SchemaInput<T extends z.ZodTypeAny> = z.input<T>;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: S.Profile;
        Insert: SchemaInput<typeof S.ProfileSchema>;
        Update: Partial<SchemaInput<typeof S.ProfileSchema>>;
      };
      series: {
        Row: S.Series;
        Insert: SchemaInput<typeof S.SeriesSchema>;
        Update: Partial<SchemaInput<typeof S.SeriesSchema>>;
      };
      films: {
        Row: S.Film;
        Insert: SchemaInput<typeof S.FilmSchema>;
        Update: Partial<SchemaInput<typeof S.FilmSchema>>;
      };
      film_creators: {
        Row: S.FilmCreator;
        Insert: SchemaInput<typeof S.FilmCreatorSchema>;
        Update: Partial<SchemaInput<typeof S.FilmCreatorSchema>>;
      };
      views: {
        Row: S.View;
        Insert: SchemaInput<typeof S.ViewSchema>;
        Update: Partial<SchemaInput<typeof S.ViewSchema>>;
      };
      donations: {
        Row: S.Donation;
        Insert: SchemaInput<typeof S.DonationSchema>;
        Update: Partial<SchemaInput<typeof S.DonationSchema>>;
      };
      comments: {
        Row: S.Comment;
        Insert: SchemaInput<typeof S.CommentSchema>;
        Update: Partial<SchemaInput<typeof S.CommentSchema>>;
      };
      likes: {
        Row: S.Like;
        Insert: SchemaInput<typeof S.LikeSchema>;
        Update: Partial<SchemaInput<typeof S.LikeSchema>>;
      };
      follows: {
        Row: S.Follow;
        Insert: SchemaInput<typeof S.FollowSchema>;
        Update: Partial<SchemaInput<typeof S.FollowSchema>>;
      };
      assets: {
        Row: S.Asset;
        Insert: SchemaInput<typeof S.AssetSchema>;
        Update: Partial<SchemaInput<typeof S.AssetSchema>>;
      };
      asset_purchases: {
        Row: S.AssetPurchase;
        Insert: SchemaInput<typeof S.AssetPurchaseSchema>;
        Update: Partial<SchemaInput<typeof S.AssetPurchaseSchema>>;
      };
      asset_reviews: {
        Row: S.AssetReview;
        Insert: SchemaInput<typeof S.AssetReviewSchema>;
        Update: Partial<SchemaInput<typeof S.AssetReviewSchema>>;
      };
      film_assets: {
        Row: S.FilmAsset;
        Insert: SchemaInput<typeof S.FilmAssetSchema>;
        Update: Partial<SchemaInput<typeof S.FilmAssetSchema>>;
      };
      notifications: {
        Row: S.Notification;
        Insert: SchemaInput<typeof S.NotificationSchema>;
        Update: Partial<SchemaInput<typeof S.NotificationSchema>>;
      };
      collab_sessions: {
        Row: S.CollabSession;
        Insert: SchemaInput<typeof S.CollabSessionSchema>;
        Update: Partial<SchemaInput<typeof S.CollabSessionSchema>>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      film_visibility: S.FilmVisibility;
      content_rating: S.ContentRating;
      creator_role: S.CreatorRole;
      asset_category: S.AssetCategory;
      asset_pricing: S.AssetPricing;
      notification_type: S.NotificationType;
    };
  };
};

export type TypedSupabaseClient = SupabaseClient<Database>;

export function createClient(supabaseUrl: string, supabaseKey: string): TypedSupabaseClient {
  return createSupabaseClient<Database>(supabaseUrl, supabaseKey);
}
