import { describe, it, expect } from 'vitest';
import { PLATFORM_VERSION } from './index';
import type { Profile, ProfileInsert } from './index';

describe('Platform', () => {
  it('should export version', () => {
    expect(PLATFORM_VERSION).toBe('0.0.0');
  });

  it('should have valid types', () => {
    // Check Row type
    const profile: Partial<Profile> = {
      username: 'test_user',
      display_name: 'Test User'
    };
    expect(profile.username).toBe('test_user');

    // Check Insert type (required fields)
    const newProfile: ProfileInsert = {
      id: 'uuid-123',
      username: 'new_user',
      display_name: 'New User'
    };
    expect(newProfile.id).toBe('uuid-123');
  });
});
