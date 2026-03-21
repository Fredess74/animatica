import { describe, expect, it } from 'vitest'
import {
  createDanceClip,
  createIdleClip,
  createJumpClip,
  createRunClip,
  createSitClip,
  createTalkClip,
  createWalkClip,
  createWaveClip,
} from './CharacterAnimator'

describe('Character animation quality coverage', () => {
  it('provides non-empty clips for all supported animation states', () => {
    const clips = [
      createIdleClip(),
      createWalkClip(),
      createRunClip(),
      createTalkClip(),
      createWaveClip(),
      createDanceClip(),
      createSitClip(),
      createJumpClip(),
    ]

    expect(clips).toHaveLength(8)
    for (const clip of clips) {
      expect(clip.duration).toBeGreaterThan(0)
      expect(clip.tracks.length).toBeGreaterThan(0)
    }
  })
})
