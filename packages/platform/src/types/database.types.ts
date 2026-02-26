import type { ProjectState } from '@Animatica/engine'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      assets: {
        Row: {
          category: Database['public']['Enums']['asset_category']
          chain_asset_id: number | null
          created_at: string | null
          creator_id: string
          description: string | null
          download_count: number | null
          file_format: string | null
          file_size_bytes: number | null
          file_url: string
          fts: unknown | null
          id: string
          is_active: boolean | null
          is_approved: boolean | null
          name: string
          polygon_count: number | null
          preview_url: string | null
          price_cents: number | null
          pricing_model: Database['public']['Enums']['asset_pricing'] | null
          rating_avg: number | null
          rating_count: number | null
          revenue_total_wei: string | null
          royalty_bps: number | null
          tags: string[] | null
          thumbnail_url: string | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          category: Database['public']['Enums']['asset_category']
          chain_asset_id?: number | null
          created_at?: string | null
          creator_id: string
          description?: string | null
          download_count?: number | null
          file_format?: string | null
          file_size_bytes?: number | null
          file_url: string
          fts?: unknown | null
          id?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          name: string
          polygon_count?: number | null
          preview_url?: string | null
          price_cents?: number | null
          pricing_model?: Database['public']['Enums']['asset_pricing'] | null
          rating_avg?: number | null
          rating_count?: number | null
          revenue_total_wei?: string | null
          royalty_bps?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          category?: Database['public']['Enums']['asset_category']
          chain_asset_id?: number | null
          created_at?: string | null
          creator_id?: string
          description?: string | null
          download_count?: number | null
          file_format?: string | null
          file_size_bytes?: number | null
          file_url?: string
          fts?: unknown | null
          id?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          name?: string
          polygon_count?: number | null
          preview_url?: string | null
          price_cents?: number | null
          pricing_model?: Database['public']['Enums']['asset_pricing'] | null
          rating_avg?: number | null
          rating_count?: number | null
          revenue_total_wei?: string | null
          royalty_bps?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_creator_id_fkey"
            columns: ["creator_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      asset_purchases: {
        Row: {
          asset_id: string
          buyer_id: string
          created_at: string | null
          id: string
          price_paid_cents: number
          rental_expires_at: string | null
          tx_hash: string | null
        }
        Insert: {
          asset_id: string
          buyer_id: string
          created_at?: string | null
          id?: string
          price_paid_cents: number
          rental_expires_at?: string | null
          tx_hash?: string | null
        }
        Update: {
          asset_id?: string
          buyer_id?: string
          created_at?: string | null
          id?: string
          price_paid_cents?: number
          rental_expires_at?: string | null
          tx_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_purchases_asset_id_fkey"
            columns: ["asset_id"]
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_purchases_buyer_id_fkey"
            columns: ["buyer_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      asset_reviews: {
        Row: {
          asset_id: string
          body: string | null
          created_at: string | null
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          asset_id: string
          body?: string | null
          created_at?: string | null
          id?: string
          rating: number
          user_id: string
        }
        Update: {
          asset_id?: string
          body?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_reviews_asset_id_fkey"
            columns: ["asset_id"]
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_reviews_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      collab_sessions: {
        Row: {
          active_users: string[] | null
          created_at: string | null
          film_id: string
          id: string
          updated_at: string | null
          yjs_state: string | null
        }
        Insert: {
          active_users?: string[] | null
          created_at?: string | null
          film_id: string
          id?: string
          updated_at?: string | null
          yjs_state?: string | null
        }
        Update: {
          active_users?: string[] | null
          created_at?: string | null
          film_id?: string
          id?: string
          updated_at?: string | null
          yjs_state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collab_sessions_film_id_fkey"
            columns: ["film_id"]
            referencedRelation: "films"
            referencedColumns: ["id"]
          }
        ]
      }
      comments: {
        Row: {
          body: string
          created_at: string | null
          film_id: string
          id: string
          is_edited: boolean | null
          is_hidden: boolean | null
          like_count: number | null
          parent_id: string | null
          reply_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          film_id: string
          id?: string
          is_edited?: boolean | null
          is_hidden?: boolean | null
          like_count?: number | null
          parent_id?: string | null
          reply_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          film_id?: string
          id?: string
          is_edited?: boolean | null
          is_hidden?: boolean | null
          like_count?: number | null
          parent_id?: string | null
          reply_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_film_id_fkey"
            columns: ["film_id"]
            referencedRelation: "films"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      donations: {
        Row: {
          amount_usd: number | null
          amount_wei: string
          block_number: number | null
          chain: string | null
          created_at: string | null
          creator_amount_wei: string
          currency: string | null
          donor_id: string | null
          film_id: string
          fund_amount_wei: string
          id: string
          is_fiat: boolean | null
          platform_amount_wei: string
          stripe_payment_id: string | null
          tx_hash: string
        }
        Insert: {
          amount_usd?: number | null
          amount_wei: string
          block_number?: number | null
          chain?: string | null
          created_at?: string | null
          creator_amount_wei: string
          currency?: string | null
          donor_id?: string | null
          film_id: string
          fund_amount_wei: string
          id?: string
          is_fiat?: boolean | null
          platform_amount_wei: string
          stripe_payment_id?: string | null
          tx_hash: string
        }
        Update: {
          amount_usd?: number | null
          amount_wei?: string
          block_number?: number | null
          chain?: string | null
          created_at?: string | null
          creator_amount_wei?: string
          currency?: string | null
          donor_id?: string | null
          film_id?: string
          fund_amount_wei?: string
          id?: string
          is_fiat?: boolean | null
          platform_amount_wei?: string
          stripe_payment_id?: string | null
          tx_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_donor_id_fkey"
            columns: ["donor_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_film_id_fkey"
            columns: ["film_id"]
            referencedRelation: "films"
            referencedColumns: ["id"]
          }
        ]
      }
      film_assets: {
        Row: {
          asset_id: string
          film_id: string
        }
        Insert: {
          asset_id: string
          film_id: string
        }
        Update: {
          asset_id?: string
          film_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "film_assets_asset_id_fkey"
            columns: ["asset_id"]
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "film_assets_film_id_fkey"
            columns: ["film_id"]
            referencedRelation: "films"
            referencedColumns: ["id"]
          }
        ]
      }
      film_creators: {
        Row: {
          accepted_at: string | null
          film_id: string
          invited_at: string | null
          revenue_share_bps: number
          role: Database['public']['Enums']['creator_role']
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          film_id: string
          invited_at?: string | null
          revenue_share_bps?: number
          role: Database['public']['Enums']['creator_role']
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          film_id?: string
          invited_at?: string | null
          revenue_share_bps?: number
          role?: Database['public']['Enums']['creator_role']
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "film_creators_film_id_fkey"
            columns: ["film_id"]
            referencedRelation: "films"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "film_creators_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      films: {
        Row: {
          avg_retention_pct: number | null
          chain_film_id: number | null
          comment_count: number | null
          created_at: string | null
          description: string | null
          donation_total_wei: string | null
          duration_seconds: number | null
          episode_number: number | null
          fts: unknown | null
          genre: string | null
          id: string
          language: string | null
          like_count: number | null
          owner_id: string
          project_json: ProjectState | null
          published_at: string | null
          rating: Database['public']['Enums']['content_rating'] | null
          season_number: number | null
          series_id: string | null
          slug: string
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_url: string | null
          view_count: number | null
          visibility: Database['public']['Enums']['film_visibility'] | null
        }
        Insert: {
          avg_retention_pct?: number | null
          chain_film_id?: number | null
          comment_count?: number | null
          created_at?: string | null
          description?: string | null
          donation_total_wei?: string | null
          duration_seconds?: number | null
          episode_number?: number | null
          fts?: unknown | null
          genre?: string | null
          id?: string
          language?: string | null
          like_count?: number | null
          owner_id: string
          project_json?: ProjectState | null
          published_at?: string | null
          rating?: Database['public']['Enums']['content_rating'] | null
          season_number?: number | null
          series_id?: string | null
          slug?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_url?: string | null
          view_count?: number | null
          visibility?: Database['public']['Enums']['film_visibility'] | null
        }
        Update: {
          avg_retention_pct?: number | null
          chain_film_id?: number | null
          comment_count?: number | null
          created_at?: string | null
          description?: string | null
          donation_total_wei?: string | null
          duration_seconds?: number | null
          episode_number?: number | null
          fts?: unknown | null
          genre?: string | null
          id?: string
          language?: string | null
          like_count?: number | null
          owner_id?: string
          project_json?: ProjectState | null
          published_at?: string | null
          rating?: Database['public']['Enums']['content_rating'] | null
          season_number?: number | null
          series_id?: string | null
          slug?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
          view_count?: number | null
          visibility?: Database['public']['Enums']['film_visibility'] | null
        }
        Relationships: [
          {
            foreignKeyName: "films_owner_id_fkey"
            columns: ["owner_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "films_series_id_fkey"
            columns: ["series_id"]
            referencedRelation: "series"
            referencedColumns: ["id"]
          }
        ]
      }
      follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      likes: {
        Row: {
          created_at: string | null
          film_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          film_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          film_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_film_id_fkey"
            columns: ["film_id"]
            referencedRelation: "films"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          actor_id: string | null
          body: string | null
          created_at: string | null
          film_id: string | null
          id: string
          is_read: boolean | null
          title: string
          type: Database['public']['Enums']['notification_type']
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          body?: string | null
          created_at?: string | null
          film_id?: string | null
          id?: string
          is_read?: boolean | null
          title: string
          type: Database['public']['Enums']['notification_type']
          user_id: string
        }
        Update: {
          actor_id?: string | null
          body?: string | null
          created_at?: string | null
          film_id?: string | null
          id?: string
          is_read?: boolean | null
          title?: string
          type?: Database['public']['Enums']['notification_type']
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_film_id_fkey"
            columns: ["film_id"]
            referencedRelation: "films"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          creator_weight: number | null
          display_name: string
          follower_count: number | null
          following_count: number | null
          id: string
          preferred_language: string | null
          preferred_role: string | null
          total_earned_wei: string | null
          total_films: number | null
          total_views: number | null
          updated_at: string | null
          username: string
          wallet_address: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          creator_weight?: number | null
          display_name: string
          follower_count?: number | null
          following_count?: number | null
          id: string
          preferred_language?: string | null
          preferred_role?: string | null
          total_earned_wei?: string | null
          total_films?: number | null
          total_views?: number | null
          updated_at?: string | null
          username: string
          wallet_address?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          creator_weight?: number | null
          display_name?: string
          follower_count?: number | null
          following_count?: number | null
          id?: string
          preferred_language?: string | null
          preferred_role?: string | null
          total_earned_wei?: string | null
          total_films?: number | null
          total_views?: number | null
          updated_at?: string | null
          username?: string
          wallet_address?: string | null
          website?: string | null
        }
        Relationships: []
      }
      series: {
        Row: {
          created_at: string | null
          description: string | null
          episode_count: number | null
          genre: string | null
          id: string
          owner_id: string
          slug: string
          subscriber_count: number | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          episode_count?: number | null
          genre?: string | null
          id?: string
          owner_id: string
          slug: string
          subscriber_count?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          episode_count?: number | null
          genre?: string | null
          id?: string
          owner_id?: string
          slug?: string
          subscriber_count?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "series_owner_id_fkey"
            columns: ["owner_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      views: {
        Row: {
          country: string | null
          created_at: string | null
          device: string | null
          film_id: string
          id: string
          retention_pct: number | null
          session_id: string
          source: string | null
          total_seconds: number
          user_id: string | null
          watched_seconds: number | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          device?: string | null
          film_id: string
          id?: string
          retention_pct?: number | null
          session_id: string
          source?: string | null
          total_seconds: number
          user_id?: string | null
          watched_seconds?: number | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          device?: string | null
          film_id?: string
          id?: string
          retention_pct?: number | null
          session_id?: string
          source?: string | null
          total_seconds?: number
          user_id?: string | null
          watched_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "views_film_id_fkey"
            columns: ["film_id"]
            referencedRelation: "films"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "views_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      asset_category:
        | "character"
        | "prop"
        | "environment"
        | "sprite"
        | "animation_clip"
        | "sound_pack"
        | "template"
      asset_pricing: "free" | "purchase" | "rental" | "royalty"
      content_rating: "G" | "PG" | "T" | "M"
      creator_role:
        | "director"
        | "writer"
        | "animator"
        | "producer"
        | "sound_designer"
        | "asset_creator"
        | "voice_actor"
      film_visibility: "public" | "unlisted" | "private" | "draft"
      notification_type:
        | "donation_received"
        | "comment_received"
        | "like_received"
        | "follow_received"
        | "collab_invite"
        | "collab_accepted"
        | "asset_purchased"
        | "asset_review"
        | "fund_payout"
        | "film_published"
        | "episode_released"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
