import { describe, it, expect } from 'vitest';
import * as S from './schema';

describe('Database Schema Validation', () => {
  it('validates a correct Profile', () => {
    const data = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      display_name: 'Test User',
      username: 'testuser',
      // Defaults should be filled by Zod if missing in input, but here we provide full object for type check
      bio: 'A bio',
      total_films: 5,
      total_views: 100,
      total_earned_wei: '1000000',
      follower_count: 10,
      following_count: 5,
      creator_weight: 1,
      preferred_language: 'en',
      preferred_role: 'director',
    };
    const result = S.ProfileSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.username).toBe('testuser');
    }
  });

  it('validates Profile with defaults', () => {
    const data = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      display_name: 'New User',
      username: 'newuser',
    };
    const result = S.ProfileSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.bio).toBe('');
      expect(result.data.total_films).toBe(0);
    }
  });

  it('validates a correct Film', () => {
    const data = {
      id: '123e4567-e89b-12d3-a456-426614174001',
      owner_id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'My Movie',
      slug: 'my-movie',
      visibility: 'public',
      rating: 'PG',
      duration_seconds: 120,
      tags: ['animation', 'comedy'],
    };
    const result = S.FilmSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.visibility).toBe('public');
      expect(result.data.tags).toHaveLength(2);
    }
  });

  it('validates Film enums', () => {
    const data = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        owner_id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Bad Movie',
        slug: 'bad-movie',
        visibility: 'invalid_visibility', // Should fail
    };
    const result = S.FilmSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('validates Asset with correct category', () => {
    const data = {
      id: '123e4567-e89b-12d3-a456-426614174002',
      creator_id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Cool Prop',
      category: 'prop',
      file_url: 'https://example.com/prop.glb',
      pricing_model: 'free',
    };
    const result = S.AssetSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('validates AssetPurchase', () => {
    const data = {
      asset_id: '123e4567-e89b-12d3-a456-426614174002',
      buyer_id: '123e4567-e89b-12d3-a456-426614174003',
      price_paid_cents: 500,
    };
    const result = S.AssetPurchaseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('validates Notification', () => {
    const data = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        type: 'donation_received',
        title: 'You got money!',
        body: 'Someone donated 5 ETH',
    };
    const result = S.NotificationSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});
