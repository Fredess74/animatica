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
      profiles: {
        Row: {
          id: string
          display_name: string
          username: string
          avatar_url: string | null
          bio: string | null
          website: string | null
          wallet_address: string | null
          total_films: number | null
          total_views: number | null
          total_earned_wei: string | null
          follower_count: number | null
          following_count: number | null
          creator_weight: number | null
          preferred_language: string | null
          preferred_role: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          display_name: string
          username: string
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          wallet_address?: string | null
          total_films?: number | null
          total_views?: number | null
          total_earned_wei?: string | null
          follower_count?: number | null
          following_count?: number | null
          creator_weight?: number | null
          preferred_language?: string | null
          preferred_role?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          display_name?: string
          username?: string
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          wallet_address?: string | null
          total_films?: number | null
          total_views?: number | null
          total_earned_wei?: string | null
          follower_count?: number | null
          following_count?: number | null
          creator_weight?: number | null
          preferred_language?: string | null
          preferred_role?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      series: {
        Row: {
          id: string
          owner_id: string
          title: string
          description: string | null
          thumbnail_url: string | null
          slug: string
          genre: string | null
          tags: string[] | null
          episode_count: number | null
          subscriber_count: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          description?: string | null
          thumbnail_url?: string | null
          slug: string
          genre?: string | null
          tags?: string[] | null
          episode_count?: number | null
          subscriber_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          description?: string | null
          thumbnail_url?: string | null
          slug?: string
          genre?: string | null
          tags?: string[] | null
          episode_count?: number | null
          subscriber_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "series_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      films: {
        Row: {
          id: string
          owner_id: string
          title: string
          description: string | null
          slug: string
          thumbnail_url: string | null
          video_url: string | null
          project_json: Json | null
          duration_seconds: number | null
          rating: Database["public"]["Enums"]["content_rating"] | null
          visibility: Database["public"]["Enums"]["film_visibility"] | null
          tags: string[] | null
          genre: string | null
          language: string | null
          series_id: string | null
          episode_number: number | null
          season_number: number | null
          view_count: number | null
          like_count: number | null
          comment_count: number | null
          donation_total_wei: string | null
          avg_retention_pct: number | null
          chain_film_id: number | null
          published_at: string | null
          created_at: string | null
          updated_at: string | null
          fts: unknown | null
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          description?: string | null
          slug: string
          thumbnail_url?: string | null
          video_url?: string | null
          project_json?: Json | null
          duration_seconds?: number | null
          rating?: Database["public"]["Enums"]["content_rating"] | null
          visibility?: Database["public"]["Enums"]["film_visibility"] | null
          tags?: string[] | null
          genre?: string | null
          language?: string | null
          series_id?: string | null
          episode_number?: number | null
          season_number?: number | null
          view_count?: number | null
          like_count?: number | null
          comment_count?: number | null
          donation_total_wei?: string | null
          avg_retention_pct?: number | null
          chain_film_id?: number | null
          published_at?: string | null
          created_at?: string | null
          updated_at?: string | null
          fts?: unknown | null
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          description?: string | null
          slug?: string
          thumbnail_url?: string | null
          video_url?: string | null
          project_json?: Json | null
          duration_seconds?: number | null
          rating?: Database["public"]["Enums"]["content_rating"] | null
          visibility?: Database["public"]["Enums"]["film_visibility"] | null
          tags?: string[] | null
          genre?: string | null
          language?: string | null
          series_id?: string | null
          episode_number?: number | null
          season_number?: number | null
          view_count?: number | null
          like_count?: number | null
          comment_count?: number | null
          donation_total_wei?: string | null
          avg_retention_pct?: number | null
          chain_film_id?: number | null
          published_at?: string | null
          created_at?: string | null
          updated_at?: string | null
          fts?: unknown | null
        }
        Relationships: [
          {
            foreignKeyName: "films_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "films_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          }
        ]
      }
      film_creators: {
        Row: {
          film_id: string
          user_id: string
          role: Database["public"]["Enums"]["creator_role"]
          revenue_share_bps: number
          invited_at: string | null
          accepted_at: string | null
        }
        Insert: {
          film_id: string
          user_id: string
          role: Database["public"]["Enums"]["creator_role"]
          revenue_share_bps?: number
          invited_at?: string | null
          accepted_at?: string | null
        }
        Update: {
          film_id?: string
          user_id?: string
          role?: Database["public"]["Enums"]["creator_role"]
          revenue_share_bps?: number
          invited_at?: string | null
          accepted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "film_creators_film_id_fkey"
            columns: ["film_id"]
            isOneToOne: false
            referencedRelation: "films"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "film_creators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      views: {
        Row: {
          id: string
          film_id: string
          user_id: string | null
          session_id: string
          watched_seconds: number | null
          total_seconds: number
          retention_pct: number | null
          source: string | null
          device: string | null
          country: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          film_id: string
          user_id?: string | null
          session_id: string
          watched_seconds?: number | null
          total_seconds: number
          retention_pct?: never
          source?: string | null
          device?: string | null
          country?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          film_id?: string
          user_id?: string | null
          session_id?: string
          watched_seconds?: number | null
          total_seconds?: number
          retention_pct?: never
          source?: string | null
          device?: string | null
          country?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "views_film_id_fkey"
            columns: ["film_id"]
            isOneToOne: false
            referencedRelation: "films"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      donations: {
        Row: {
          id: string
          donor_id: string | null
          film_id: string
          amount_wei: string
          amount_usd: number | null
          currency: string | null
          tx_hash: string
          chain: string | null
          block_number: number | null
          creator_amount_wei: string
          fund_amount_wei: string
          platform_amount_wei: string
          stripe_payment_id: string | null
          is_fiat: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          donor_id?: string | null
          film_id: string
          amount_wei: string
          amount_usd?: number | null
          currency?: string | null
          tx_hash: string
          chain?: string | null
          block_number?: number | null
          creator_amount_wei: string
          fund_amount_wei: string
          platform_amount_wei: string
          stripe_payment_id?: string | null
          is_fiat?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          donor_id?: string | null
          film_id?: string
          amount_wei?: string
          amount_usd?: number | null
          currency?: string | null
          tx_hash?: string
          chain?: string | null
          block_number?: number | null
          creator_amount_wei?: string
          fund_amount_wei?: string
          platform_amount_wei?: string
          stripe_payment_id?: string | null
          is_fiat?: boolean | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_film_id_fkey"
            columns: ["film_id"]
            isOneToOne: false
            referencedRelation: "films"
            referencedColumns: ["id"]
          }
        ]
      }
      comments: {
        Row: {
          id: string
          film_id: string
          user_id: string
          parent_id: string | null
          body: string
          is_edited: boolean | null
          is_hidden: boolean | null
          like_count: number | null
          reply_count: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          film_id: string
          user_id: string
          parent_id?: string | null
          body: string
          is_edited?: boolean | null
          is_hidden?: boolean | null
          like_count?: number | null
          reply_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          film_id?: string
          user_id?: string
          parent_id?: string | null
          body?: string
          is_edited?: boolean | null
          is_hidden?: boolean | null
          like_count?: number | null
          reply_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_film_id_fkey"
            columns: ["film_id"]
            isOneToOne: false
            referencedRelation: "films"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      likes: {
        Row: {
          film_id: string
          user_id: string
          created_at: string | null
        }
        Insert: {
          film_id: string
          user_id: string
          created_at?: string | null
        }
        Update: {
          film_id?: string
          user_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "likes_film_id_fkey"
            columns: ["film_id"]
            isOneToOne: false
            referencedRelation: "films"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      follows: {
        Row: {
          follower_id: string
          following_id: string
          created_at: string | null
        }
        Insert: {
          follower_id: string
          following_id: string
          created_at?: string | null
        }
        Update: {
          follower_id?: string
          following_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      assets: {
        Row: {
          id: string
          creator_id: string
          name: string
          description: string | null
          category: Database["public"]["Enums"]["asset_category"]
          tags: string[] | null
          file_url: string
          preview_url: string | null
          thumbnail_url: string | null
          file_size_bytes: number | null
          polygon_count: number | null
          file_format: string | null
          pricing_model: Database["public"]["Enums"]["asset_pricing"] | null
          price_cents: number | null
          royalty_bps: number | null
          download_count: number | null
          usage_count: number | null
          rating_avg: number | null
          rating_count: number | null
          revenue_total_wei: string | null
          is_approved: boolean | null
          is_active: boolean | null
          chain_asset_id: number | null
          created_at: string | null
          updated_at: string | null
          fts: unknown | null
        }
        Insert: {
          id?: string
          creator_id: string
          name: string
          description?: string | null
          category: Database["public"]["Enums"]["asset_category"]
          tags?: string[] | null
          file_url: string
          preview_url?: string | null
          thumbnail_url?: string | null
          file_size_bytes?: number | null
          polygon_count?: number | null
          file_format?: string | null
          pricing_model?: Database["public"]["Enums"]["asset_pricing"] | null
          price_cents?: number | null
          royalty_bps?: number | null
          download_count?: number | null
          usage_count?: number | null
          rating_avg?: number | null
          rating_count?: number | null
          revenue_total_wei?: string | null
          is_approved?: boolean | null
          is_active?: boolean | null
          chain_asset_id?: number | null
          created_at?: string | null
          updated_at?: string | null
          fts?: unknown | null
        }
        Update: {
          id?: string
          creator_id?: string
          name?: string
          description?: string | null
          category?: Database["public"]["Enums"]["asset_category"]
          tags?: string[] | null
          file_url?: string
          preview_url?: string | null
          thumbnail_url?: string | null
          file_size_bytes?: number | null
          polygon_count?: number | null
          file_format?: string | null
          pricing_model?: Database["public"]["Enums"]["asset_pricing"] | null
          price_cents?: number | null
          royalty_bps?: number | null
          download_count?: number | null
          usage_count?: number | null
          rating_avg?: number | null
          rating_count?: number | null
          revenue_total_wei?: string | null
          is_approved?: boolean | null
          is_active?: boolean | null
          chain_asset_id?: number | null
          created_at?: string | null
          updated_at?: string | null
          fts?: unknown | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      asset_purchases: {
        Row: {
          id: string
          asset_id: string
          buyer_id: string
          price_paid_cents: number
          tx_hash: string | null
          rental_expires_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          asset_id: string
          buyer_id: string
          price_paid_cents: number
          tx_hash?: string | null
          rental_expires_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          asset_id?: string
          buyer_id?: string
          price_paid_cents?: number
          tx_hash?: string | null
          rental_expires_at?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_purchases_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_purchases_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      asset_reviews: {
        Row: {
          id: string
          asset_id: string
          user_id: string
          rating: number
          body: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          asset_id: string
          user_id: string
          rating: number
          body?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          asset_id?: string
          user_id?: string
          rating?: number
          body?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_reviews_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      film_assets: {
        Row: {
          film_id: string
          asset_id: string
        }
        Insert: {
          film_id: string
          asset_id: string
        }
        Update: {
          film_id?: string
          asset_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "film_assets_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "film_assets_film_id_fkey"
            columns: ["film_id"]
            isOneToOne: false
            referencedRelation: "films"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: Database["public"]["Enums"]["notification_type"]
          title: string
          body: string | null
          film_id: string | null
          actor_id: string | null
          is_read: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: Database["public"]["Enums"]["notification_type"]
          title: string
          body?: string | null
          film_id?: string | null
          actor_id?: string | null
          is_read?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: Database["public"]["Enums"]["notification_type"]
          title?: string
          body?: string | null
          film_id?: string | null
          actor_id?: string | null
          is_read?: boolean | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_film_id_fkey"
            columns: ["film_id"]
            isOneToOne: false
            referencedRelation: "films"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      collab_sessions: {
        Row: {
          id: string
          film_id: string
          yjs_state: string | null
          active_users: string[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          film_id: string
          yjs_state?: string | null
          active_users?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          film_id?: string
          yjs_state?: string | null
          active_users?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collab_sessions_film_id_fkey"
            columns: ["film_id"]
            isOneToOne: true
            referencedRelation: "films"
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
      film_visibility: "public" | "unlisted" | "private" | "draft"
      content_rating: "G" | "PG" | "T" | "M"
      creator_role: "director" | "writer" | "animator" | "producer" | "sound_designer" | "asset_creator" | "voice_actor"
      asset_category: "character" | "prop" | "environment" | "sprite" | "animation_clip" | "sound_pack" | "template"
      asset_pricing: "free" | "purchase" | "rental" | "royalty"
      notification_type: "donation_received" | "comment_received" | "like_received" | "follow_received" | "collab_invite" | "collab_accepted" | "asset_purchased" | "asset_review" | "fund_payout" | "film_published" | "episode_released"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
