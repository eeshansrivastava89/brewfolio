/**
 * Content loading utilities for brewfolio.
 * These handle fetching content from the local data directory.
 */

export interface Project {
	id: string
	name: string
	url?: string
	status: 'live' | 'in-progress' | 'coming-soon'
	external: boolean
	description: string
	shortDescription?: string
	image?: string
	repo?: string
	analysis_url?: string
	tags: { name: string }[]
	related_writing: string[]
}

export interface Notebook {
	id: string
	title: string
	project: { slug: string }
	github_url?: string
	description?: string
	date: string
}

export interface WritingPost {
	slug: string
	title: string
	pubDate: string
	substack_url: string
	description: string
}

export interface Concept {
	slug: string
	name: string
	description?: string
	projects: { slug: string }[]
	writing: string[]
	notebooks: { slug: string }[]
}

export interface TimelineEntry {
	timespan?: string
	title: string
	company?: string
	description?: string
	logo?: string
	type: 'work' | 'education'
}

export interface ImpactSection {
	title: string
	icon?: string
	visible: boolean
	items: { text: string; meta?: string; link?: string }[]
}

export interface SiteConfig {
	city: string
	country: string
	conceptsIntro: string
}

export interface About {
	bio: string
	thisSite: string
}