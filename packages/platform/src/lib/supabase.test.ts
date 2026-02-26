import { describe, it, expectTypeOf } from 'vitest'
import type { Database } from '../types/database.types'
import type { ProjectState } from '@Animatica/engine'

describe('Database Types', () => {
  it('should enforce ProjectState type on films.project_json', () => {
    type FilmRow = Database['public']['Tables']['films']['Row']

    // Verify that the project_json column is typed as ProjectState | null
    expectTypeOf<FilmRow['project_json']>().toEqualTypeOf<ProjectState | null>()
  })

  it('should have correct Enums', () => {
    type FilmVisibility = Database['public']['Enums']['film_visibility']
    expectTypeOf<FilmVisibility>().toEqualTypeOf<'public' | 'unlisted' | 'private' | 'draft'>()
  })
})
