// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { TimelinePanel } from './TimelinePanel'

afterEach(() => {
  cleanup()
})

describe('TimelinePanel', () => {
  it('renders transport controls', () => {
    render(<TimelinePanel selectedActorId={null} />)
    expect(screen.getByTitle('Play')).toBeTruthy()
    expect(screen.getByTitle('Stop')).toBeTruthy()
    expect(screen.getByTitle('Add Keyframe')).toBeTruthy()
  })

  it('toggles play/pause state', () => {
    render(<TimelinePanel selectedActorId={null} />)
    const playBtn = screen.getByTitle('Play')

    fireEvent.click(playBtn)
    // Should show Pause button now
    expect(screen.getByTitle('Pause')).toBeTruthy()
    // Play button should be gone
    expect(screen.queryByTitle('Play')).toBeNull()

    const pauseBtn = screen.getByTitle('Pause')
    fireEvent.click(pauseBtn)
    // Should show Play button again
    expect(screen.getByTitle('Play')).toBeTruthy()
  })

  it('stops playback and resets state', () => {
    render(<TimelinePanel selectedActorId={null} />)
    const playBtn = screen.getByTitle('Play')
    const stopBtn = screen.getByTitle('Stop')

    // Start playing
    fireEvent.click(playBtn)
    expect(screen.getByTitle('Pause')).toBeTruthy()

    // Stop
    fireEvent.click(stopBtn)
    expect(screen.getByTitle('Play')).toBeTruthy()
  })

  it('updates duration display when select changes', () => {
    render(<TimelinePanel selectedActorId={null} />)
    // Default is 10s. The component formats it as 00:00:10 -> no, see previous thought.
    // 10s -> 00:10:00
    expect(screen.getByText('00:10:00')).toBeTruthy()

    // Change select to 30s
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: '30' } })

    // 30s -> 00:30:00
    expect(screen.getByText('00:30:00')).toBeTruthy()
  })

  it('shows selected actor track when actor is selected', () => {
    render(<TimelinePanel selectedActorId="actor_1" />)
    expect(screen.getByText('Selected Actor')).toBeTruthy()
    expect(screen.queryByText('Select an actor to see its tracks')).toBeNull()
  })

  it('shows empty state when no actor selected', () => {
    render(<TimelinePanel selectedActorId={null} />)
    expect(screen.getByText('Select an actor to see its tracks')).toBeTruthy()
    expect(screen.queryByText('Selected Actor')).toBeNull()
  })
})
