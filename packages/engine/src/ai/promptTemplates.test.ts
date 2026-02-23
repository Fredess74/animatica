import { describe, expect, it } from 'vitest'

import { getAiPrompt, PROMPT_STYLES } from './promptTemplates'

describe('AI Prompt Templates', () => {
  it('should return a non-empty string', () => {
    const prompt = getAiPrompt('A cowboy walks into a saloon', 'Fantasy')
    expect(typeof prompt).toBe('string')
    expect(prompt.length).toBeGreaterThan(0)
  })

  it('should include the user idea in the prompt', () => {
    const idea = 'A giant robot fights a dragon'
    const prompt = getAiPrompt(idea, 'Cyberpunk')
    expect(prompt).toContain(idea)
    expect(prompt).toContain('USER IDEA:')
  })

  it('should include the schema definition', () => {
    const prompt = getAiPrompt('test', 'Noir')
    expect(prompt).toContain('SCHEMA:')
    expect(prompt).toContain('"project":')
    expect(prompt).toContain('"actors":')
  })

  it('should include style-specific context', () => {
    const noirPrompt = getAiPrompt('Detective story', 'Noir')
    expect(noirPrompt).toContain('Noir')
    expect(noirPrompt).toContain('Low key, harsh shadows')
    expect(noirPrompt).toContain('Heavy rain')

    const animePrompt = getAiPrompt('School life', 'Anime')
    expect(animePrompt).toContain('Anime')
    expect(animePrompt).toContain('Cel-shaded')
    expect(animePrompt).toContain('Cherry blossoms')
  })

  it('should support all defined styles', () => {
    PROMPT_STYLES.forEach((style) => {
      const prompt = getAiPrompt('Generic scene', style)
      expect(prompt).toContain(`STYLE: ${style}`)
    })
  })
})
