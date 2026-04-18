import {
	fetchIpynb,
	getGitHubData,
	getProjectGitHubData,
	renderNotebook,
	type NotebookEntry,
	type NotebookSummary,
} from 'brewfolio'
import { reader } from './content'

type SearchEntry = {
	type: 'concept' | 'project' | 'writing' | 'analysis'
	title: string
	desc: string
	slug?: string
	href?: string
}

type PortfolioConfig = {
	siteTitle?: string
	conceptsIntro?: string
	city?: string
	country?: string
} | null

type HeaderLocation = {
	cityName: string
	latitude: number
	longitude: number
	timezone: string
}

const geocodeCache = new Map<string, Promise<HeaderLocation | null>>()

export async function getPortfolioData() {
	const [
		projectEntries,
		writingEntries,
		notebookEntries,
		conceptsData,
		config,
		github,
		writingSettings,
		aboutData,
		timelineData,
		impactData,
		secrets,
	] = await Promise.all([
		reader.collections.projects.all(),
		reader.collections.writing.all(),
		reader.collections.notebooks.all(),
		reader.singletons.concepts.read(),
		reader.singletons.config.read(),
		reader.singletons.github.read(),
		reader.singletons.writingSettings.read(),
		reader.singletons.about.read(),
		reader.singletons.timeline.read(),
		reader.singletons.impact.read(),
		reader.singletons.secrets?.read?.() ?? Promise.resolve(null),
	])

	const token = secrets?.githubToken?.trim() || undefined

	const projects = projectEntries.map((entry) => ({
		id: entry.slug,
		name: entry.entry.name,
		url: entry.entry.url || undefined,
		status: entry.entry.status,
		external: entry.entry.external,
		description: entry.entry.description,
		shortDescription: entry.entry.shortDescription || undefined,
		image: entry.entry.image || undefined,
		repo: entry.entry.repo || undefined,
		analysis_url: entry.entry.analysis_url || undefined,
		tags: entry.entry.tags?.map((tag: any) => ({ name: tag.name })) ?? [],
		related_writing: entry.entry.related_writing ?? [],
		overview: entry.entry.overview || undefined,
		architecture: entry.entry.architecture || undefined,
		nextActions: entry.entry.nextActions || undefined,
	}))

	const writing = writingEntries
		.map((entry) => ({
			slug: entry.slug,
			title: entry.entry.title,
			pubDate: entry.entry.pubDate,
			substack_url: entry.entry.substack_url || '',
			description: entry.entry.description || '',
		}))
		.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())

	const notebooks = (
		await Promise.all(
			notebookEntries.map(async (entry) => buildNotebookEntry(entry.slug, entry.entry)),
		)
	).sort((a, b) => b.date.getTime() - a.date.getTime())

	const concepts = (conceptsData?.concepts ?? []).map((concept: any) => ({
		slug: concept.slug,
		name: concept.name,
		description: concept.description || '',
		projects: normalizeRelationships(concept.projects),
		writing: normalizeRelationships(concept.writing),
		notebooks: normalizeRelationships(concept.notebooks),
	}))

	const conceptLabelsBySlug = new Map<string, string[]>()
	for (const concept of concepts) {
		for (const writingSlug of concept.writing) {
			const existing = conceptLabelsBySlug.get(writingSlug)
			if (existing) {
				existing.push(concept.name)
			} else {
				conceptLabelsBySlug.set(writingSlug, [concept.name])
			}
		}
	}

	const projectGitHubPairs = await Promise.all(
		projects.map(async (project) => [
			project.id,
			project.repo ? await getProjectGitHubData(project.repo, token) : null,
		] as const),
	)
	const projectGitHubData = new Map(projectGitHubPairs)

	let githubData = null
	if (github?.handle?.trim()) {
		try {
			githubData = await getGitHubData({
				username: github.handle.trim(),
				token,
			})
		} catch {
			githubData = null
		}
	}

	const searchData: SearchEntry[] = [
		...concepts.map((concept) => ({
			type: 'concept' as const,
			title: concept.name,
			desc: concept.description || '',
			slug: concept.slug,
		})),
		...projects.map((project) => ({
			type: 'project' as const,
			title: project.name,
			desc: project.shortDescription || project.description,
			slug: project.id,
		})),
		...writing.map((post) => ({
			type: 'writing' as const,
			title: post.title,
			desc: post.description || '',
			href: '/writing/' + post.slug,
		})),
		...notebooks.map((notebook) => ({
			type: 'analysis' as const,
			title: notebook.title,
			desc: notebook.description || '',
			href: '/analysis/' + notebook.id,
		})),
	]

	return {
		projects,
		projectGitHubData,
		writing,
		notebooks,
		concepts,
		conceptLabelsBySlug,
		config,
		github,
		githubData,
		writingSettings,
		aboutData,
		timelineData,
		impactData,
		searchData,
	}
}

async function buildNotebookEntry(id: string, entry: any): Promise<NotebookEntry> {
	let html = ''
	if (entry.github_url) {
		try {
			const ipynb = await fetchIpynb(entry.github_url)
			html = renderNotebook(ipynb)
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			html = `<p class="bf-empty-hint">Notebook failed to load from GitHub: ${escapeHtml(message)}</p>`
		}
	} else {
		html = '<p class="bf-empty-hint">Add a GitHub URL in Keystatic to render this notebook.</p>'
	}

	const metrics = (entry.summary_metrics ?? []).map((metric: any) => ({
		label: metric.label,
		value: metric.value,
		delta: metric.delta || undefined,
		delta_direction:
			metric.delta_direction === 'up' ||
			metric.delta_direction === 'down' ||
			metric.delta_direction === 'neutral'
				? metric.delta_direction
				: undefined,
		context: metric.context || undefined,
	}))

	const summary: NotebookSummary | null =
		entry.summary_status && entry.summary_status !== 'none'
			? {
					status: entry.summary_status,
					decision: entry.summary_decision ?? '',
					metrics,
					warnings: entry.summary_warnings ?? [],
					methodology: entry.summary_methodology || undefined,
				}
			: null

	return {
		id,
		title: entry.title,
		project:
			typeof entry.project === 'string'
				? entry.project
				: entry.project?.slug || '',
		github_url: entry.github_url || '',
		description: entry.description || '',
		date: entry.date ? new Date(entry.date) : new Date(0),
		html,
		summary,
	}
}

function normalizeRelationships(values: any): string[] {
	if (!Array.isArray(values)) return []
	return values
		.map((value) => {
			if (typeof value === 'string') return value
			if (value && typeof value.slug === 'string') return value.slug
			return ''
		})
		.filter(Boolean)
}

export function escapeHtml(value: string): string {
	return String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
}

export function modalBreadcrumb(label: string, href: string): string {
	return '<a href="' + escapeHtml(href) + '" class="modal-breadcrumb-btn" data-modal-link><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>' + escapeHtml(label) + '</a>'
}

export function substackTitlebar(name: string | null | undefined): string {
	if (!name) return ''
	return '<div class="modal-titlebar-title">from <strong>' + escapeHtml(name) + '</strong></div>'
}

export function subscribeButton(label: string, href: string | null | undefined): string {
	if (!href) return ''
	return '<a href="' + escapeHtml(href) + '" target="_blank" rel="noopener noreferrer" class="subscribe-btn"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="11" height="11"><path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"></path></svg>' + escapeHtml(label) + '</a>'
}

export function renderProse(markdown: string | null | undefined): string {
	const safeInput = escapeHtml(String(markdown ?? '').trim())
	if (!safeInput) return ''

	return safeInput
		.split(/\n\s*\n/)
		.map((paragraph) => '<p>' + renderInlineMarkdown(paragraph.replace(/\n/g, '<br />')) + '</p>')
		.join('')
}

export async function dashboardHeader(config: PortfolioConfig) {
	const siteName = config?.siteTitle || 'Portfolio'
	const city = config?.city?.trim()

	if (!city) {
		return {
			siteName,
			showClockWeather: false,
			cityName: '',
			timezone: undefined,
			latitude: undefined,
			longitude: undefined,
		}
	}

	const country = config?.country?.trim() || ''
	const cacheKey = `${city.toLowerCase()}::${country.toLowerCase()}`

	if (!geocodeCache.has(cacheKey)) {
		geocodeCache.set(cacheKey, resolveHeaderLocation(city, country))
	}

	const location = await geocodeCache.get(cacheKey)!

	if (!location) {
		return {
			siteName,
			showClockWeather: false,
			cityName: city,
			timezone: undefined,
			latitude: undefined,
			longitude: undefined,
		}
	}

	return {
		siteName,
		showClockWeather: true,
		cityName: location.cityName,
		timezone: location.timezone,
		latitude: location.latitude,
		longitude: location.longitude,
	}
}

async function resolveHeaderLocation(
	city: string,
	country: string,
): Promise<HeaderLocation | null> {
	try {
		const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=5&language=en&format=json`
		const response = await fetch(url)
		if (!response.ok) throw new Error(`Geocoding failed: ${response.status}`)
		const data = await response.json()
		const results = Array.isArray(data?.results) ? data.results : []
		const match = country
			? results.find((entry: any) => String(entry?.country || '').toLowerCase() === country.toLowerCase()) || results[0]
			: results[0]

		if (!match) throw new Error(`No geocoding match for "${city}"`)

		const latitude = Number(match.latitude)
		const longitude = Number(match.longitude)
		const timezone = String(match.timezone || '')
		if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !timezone) {
			return null
		}

		return {
			cityName: String(match.name || city),
			latitude,
			longitude,
			timezone,
		}
	} catch {
		return null
	}
}

function renderInlineMarkdown(value: string): string {
	return value
		.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label: string, href: string) => {
			const trimmedHref = href.trim()
			const lowerHref = trimmedHref.toLowerCase()
			if (
				lowerHref.startsWith('javascript:') ||
				lowerHref.startsWith('data:') ||
				lowerHref.startsWith('vbscript:')
			) {
				return escapeHtml(label)
			}

			const attrs = /^https?:\/\//i.test(trimmedHref)
				? ' target="_blank" rel="noopener noreferrer"'
				: ''
			return '<a href="' + escapeHtml(trimmedHref) + '"' + attrs + '>' + escapeHtml(label) + '</a>'
		})
		.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
		.replace(/\*([^*]+)\*/g, '<em>$1</em>')
}
