import { describe, it, expectTypeOf } from 'vitest';
import type { Database } from './database.types';

describe('Database Types', () => {
  it('should have the correct structure for Profiles', () => {
    type Profile = Database['public']['Tables']['profiles']['Row'];

    expectTypeOf<Profile>().toHaveProperty('id');
    expectTypeOf<Profile['id']>().toBeString();

    expectTypeOf<Profile>().toHaveProperty('username');
    expectTypeOf<Profile['username']>().toBeString();

    expectTypeOf<Profile>().toHaveProperty('created_at');
    expectTypeOf<Profile['created_at']>().toEqualTypeOf<string | null>();
  });

  it('should have the correct structure for Films', () => {
    type Film = Database['public']['Tables']['films']['Row'];

    expectTypeOf<Film>().toHaveProperty('id');
    expectTypeOf<Film['id']>().toBeString();

    expectTypeOf<Film>().toHaveProperty('title');
    expectTypeOf<Film['title']>().toBeString();

    expectTypeOf<Film>().toHaveProperty('visibility');
    expectTypeOf<Film['visibility']>().toEqualTypeOf<"public" | "unlisted" | "private" | "draft" | null>();
  });

  it('should have the correct structure for Enums', () => {
    type CreatorRole = Database['public']['Enums']['creator_role'];
    expectTypeOf<CreatorRole>().toEqualTypeOf<"director" | "writer" | "animator" | "producer" | "sound_designer" | "asset_creator" | "voice_actor">();
  });
});
