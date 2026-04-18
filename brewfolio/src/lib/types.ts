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
	featuredNotebook?: string
	featuredNotebookTitle?: string
	tags: { name: string }[]
	relatedWriting: string[]
	relatedWritingItems?: { slug: string; title: string; href: string }[]
	overview?: string
	architecture?: string
	nextActions?: string
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
	projects: string[]
	writing: string[]
	notebooks: string[]
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
	siteTitle?: string
	city: string
	country?: string
	conceptsIntro: string
	githubHandle?: string
}

export interface About {
	bio: string
	thisSite: string
}

// ─── GitHub data types ───────────────────────────────────────────────────────

export interface ContributionDay {
	date: string
	contributionCount: number
}

export interface ContributionWeek {
	contributionDays: ContributionDay[]
}

export type GitHubActivityCategory = 'commit' | 'repo' | 'issue' | 'pr'

export interface GitHubActivityItem {
	category: GitHubActivityCategory
	repo: string
	message: string
	url: string
}

export interface ProjectCommit {
	sha: string
	message: string
	date: string
	url: string
}

export interface ProjectGitHubData {
	openIssues: number
	openPRs: number
	visibility: string
	recentCommits: ProjectCommit[]
	syncedAt: string
}

export interface GitHubActivityTotals {
	commits: number
	issues: number
	prs: number
	repos: number
}

export interface GitHubData {
	weeks: ContributionWeek[]
	recentActivity: GitHubActivityItem[]
	activityTotals: GitHubActivityTotals
}

// ─── Section config ─────────────────────────────────────────────────────────

export type SectionType = 'metrics-grid' | 'notebook' | 'github-timeline' | 'results-list'

export interface MetricItem {
	label: string
	value: string
	delta?: string
	delta_direction?: 'up' | 'down' | 'neutral'
	context?: string
}

export interface ResultItem {
	title: string
	href?: string
	meta?: string
}

/**
 * Discriminated shape produced by Keystatic's `fields.conditional`.
 * `discriminant` = the section type; `value` holds type-specific fields.
 * App page renderers switch on `discriminant`.
 */
export type SectionConfig =
	| { discriminant: 'notebook';        value: { title?: string; notebookId: string } }
	| { discriminant: 'metrics-grid';    value: { title?: string; metrics: MetricItem[] } }
	| { discriminant: 'github-timeline'; value: { title?: string } }
	| { discriminant: 'results-list';    value: { title?: string; items: ResultItem[] } }
