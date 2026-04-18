import { describe, expect, it } from 'vitest'

import {
  STATUS_CONFIG,
  getLiveProjects,
  getProjectsByStatus,
  getProjectsByTag,
} from '../../brewfolio/src/lib/projects'
import type { Project } from '../../brewfolio/src/lib/types'

const projects: Project[] = [
  {
    id: 'alpha',
    name: 'Alpha',
    url: '',
    status: 'live',
    external: true,
    description: 'Alpha desc',
    tags: [{ name: 'AI' }, { name: 'Notebook' }],
    relatedWriting: [],
  },
  {
    id: 'beta',
    name: 'Beta',
    url: '',
    status: 'in-progress',
    external: false,
    description: 'Beta desc',
    tags: [{ name: 'AI' }],
    relatedWriting: [],
  },
  {
    id: 'gamma',
    name: 'Gamma',
    url: '',
    status: 'coming-soon',
    external: false,
    description: 'Gamma desc',
    tags: [{ name: 'Game' }],
    relatedWriting: [],
  },
]

describe('projects helpers', () => {
  it('contains status presentation config for each project state', () => {
    expect(STATUS_CONFIG.live.label).toBe('Live')
    expect(STATUS_CONFIG['in-progress'].label).toBe('In Progress')
    expect(STATUS_CONFIG['coming-soon'].label).toBe('Coming Soon')
  })

  it('filters projects by status', () => {
    expect(getProjectsByStatus(projects, 'in-progress').map((project) => project.id)).toEqual([
      'beta',
    ])
  })

  it('returns live projects only', () => {
    expect(getLiveProjects(projects).map((project) => project.id)).toEqual(['alpha'])
  })

  it('filters projects by tag name', () => {
    expect(getProjectsByTag(projects, 'AI').map((project) => project.id)).toEqual([
      'alpha',
      'beta',
    ])
  })
})
