// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { render, cleanup } from '@testing-library/react'
import { SpeakerRenderer } from './SpeakerRenderer'
import { SpeakerActor } from '../../types'

// Mock PositionalAudio from @react-three/drei
vi.mock('@react-three/drei', () => ({
  PositionalAudio: ({ url }: { url: string }) => <div data-testid="positional-audio" data-url={url} />
}))

describe('SpeakerRenderer', () => {
  const baseActor: SpeakerActor = {
    id: 'speaker-1',
    name: 'Speaker',
    type: 'speaker',
    visible: true,
    transform: {
      position: [1, 2, 3],
      rotation: [0, Math.PI, 0],
      scale: [1, 1, 1],
    },
    properties: {
      volume: 1,
      loop: false,
      spatial: true,
      audioUrl: 'http://example.com/audio.mp3',
    },
  }

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders nothing when visible is false', () => {
    const { container } = render(<SpeakerRenderer actor={{ ...baseActor, visible: false }} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders helper mesh when showHelper is true', () => {
    // We expect a mesh with data-testid="speaker-helper"
    // Since we are not in Canvas, <mesh> renders as <mesh> element.
    // getByTestId works if the element has data-testid attribute.
    const { getByTestId } = render(<SpeakerRenderer actor={baseActor} showHelper={true} />)
    expect(getByTestId('speaker-helper')).toBeDefined()
  })

  it('does not render helper mesh when showHelper is false', () => {
    const { queryByTestId } = render(<SpeakerRenderer actor={baseActor} showHelper={false} />)
    expect(queryByTestId('speaker-helper')).toBeNull()
  })

  it('renders PositionalAudio when audioUrl is present', () => {
    const { getByTestId } = render(<SpeakerRenderer actor={baseActor} />)
    const audio = getByTestId('positional-audio')
    expect(audio).toBeDefined()
    expect(audio.getAttribute('data-url')).toBe('http://example.com/audio.mp3')
  })

  it('does not render PositionalAudio when audioUrl is missing', () => {
     const noAudioActor = { ...baseActor, properties: { ...baseActor.properties, audioUrl: undefined } }
    const { queryByTestId } = render(<SpeakerRenderer actor={noAudioActor} />)
    expect(queryByTestId('positional-audio')).toBeNull()
  })

  it('forwards ref', () => {
    const ref = React.createRef<any>()
    render(<SpeakerRenderer actor={baseActor} ref={ref} />)
    // In JSDOM, <group> is rendered as an HTML element. The ref should point to it.
    expect(ref.current).toBeDefined()
    // Check if it's an element
    expect(ref.current.tagName).toMatch(/GROUP/i)
  })
})
