import type { Project } from './types'

export { type Project } from './types'

export interface ProjectTag {
	name: string
}

export const STATUS_CONFIG: Record<Project['status'], { label: string; dotColor: string; bgColor: string; textColor: string }> = {
	live: { label: 'Live', dotColor: 'bg-emerald-500', bgColor: 'bg-emerald-100 dark:bg-emerald-500/20', textColor: 'text-emerald-700 dark:text-emerald-300' },
	'in-progress': { label: 'In Progress', dotColor: 'bg-amber-500', bgColor: 'bg-amber-100 dark:bg-amber-500/20', textColor: 'text-amber-700 dark:text-amber-300' },
	'coming-soon': { label: 'Coming Soon', dotColor: 'bg-gray-400', bgColor: 'bg-gray-100 dark:bg-gray-500/20', textColor: 'text-gray-600 dark:text-gray-400' }
}

export function getProjectsByStatus(items: Project[], status: Project['status']): Project[] {
	return items.filter((p) => p.status === status)
}

export function getLiveProjects(items: Project[]): Project[] {
	return getProjectsByStatus(items, 'live')
}

export function getProjectsByTag(items: Project[], tagName: string): Project[] {
	return items.filter((p) => p.tags.some((t) => t.name === tagName))
}