import fs from 'node:fs'
import path from 'node:path'
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
const feedCache = new Map<string, Promise<FeedPost[]>>()

type FeedPost = {
	title: string
	link: string
	slug: string
	pubDate: Date
	description: string
	content: string
}

type WritingStubEntry = {
	slug: string
	entry: {
		title?: string
		pubDate?: string
		substack_url?: string
		description?: string
	}
}

type ResolvedWritingSettings = {
	publicationName: string
	publicationUrl: string
	subscribeUrl: string
} | null

const WRITING_MANIFEST_DIR = path.join(process.cwd(), 'src', 'data', 'writing')

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
	const resolvedWritingSettings = resolveWritingSettings(writingSettings)

	const rawProjects = projectEntries.map((entry) => ({
		id: entry.slug,
		name: entry.entry.name,
		url: entry.entry.url || undefined,
		status: entry.entry.status,
		external: entry.entry.external,
		description: entry.entry.description || entry.entry.shortDescription || '',
		image: entry.entry.image || undefined,
		repo: entry.entry.repo || undefined,
		featuredNotebook: normalizeSingleRelationship(entry.entry.featuredNotebook),
		tags: entry.entry.tags?.map((tag: any) => ({ name: tag.name })) ?? [],
		relatedWriting: normalizeRelationships(entry.entry.relatedWriting),
		overview: entry.entry.overview || undefined,
		architecture: entry.entry.architecture || undefined,
		nextActions: entry.entry.nextActions || undefined,
	}))

	const concepts = (conceptsData?.concepts ?? []).map((concept: any) => ({
		slug: concept.slug,
		name: concept.name,
		description: concept.description || '',
		projects: normalizeRelationships(concept.projects),
		writing: normalizeRelationships(concept.writing),
		notebooks: normalizeRelationships(concept.notebooks),
	}))

	const referencedWritingSlugs = new Set<string>()
	for (const project of rawProjects) {
		for (const slug of project.relatedWriting) referencedWritingSlugs.add(slug)
	}
	for (const concept of concepts) {
		for (const slug of concept.writing) referencedWritingSlugs.add(slug)
	}

	const writing = await resolveWritingPosts({
		publicationUrl: resolvedWritingSettings?.publicationUrl || '',
		existingEntries: writingEntries,
		referencedSlugs: referencedWritingSlugs,
	})

	const notebooks = (
		await Promise.all(
			notebookEntries.map(async (entry) => buildNotebookEntry(entry.slug, entry.entry)),
		)
	).sort((a, b) => b.date.getTime() - a.date.getTime())

	const notebooksByProject = notebooks.reduce((map, notebook) => {
		if (!notebook.project) return map
		const existing = map.get(notebook.project)
		if (existing) {
			existing.push(notebook.id)
		} else {
			map.set(notebook.project, [notebook.id])
		}
		return map
	}, new Map<string, string[]>())

	const notebookById = new Map(notebooks.map((notebook) => [notebook.id, notebook]))
	const writingBySlug = new Map(writing.map((post) => [post.slug, post]))

	const projects = rawProjects.map((project) => {
		const resolvedNotebookId =
			project.featuredNotebook || notebooksByProject.get(project.id)?.[0] || undefined

		return {
			...project,
			featuredNotebook: resolvedNotebookId,
			featuredNotebookTitle: resolvedNotebookId
				? notebookById.get(resolvedNotebookId)?.title
				: undefined,
			relatedWritingItems: project.relatedWriting
				.map((slug) => {
					const post = writingBySlug.get(slug)
					if (!post) return null
					return {
						slug,
						title: post.title,
						href: `/writing/${slug}`,
					}
				})
				.filter(Boolean),
		}
	})

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
			desc: project.description,
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
		writingSettings: resolvedWritingSettings,
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
			html = `<div class="nb-error-banner">Could not load notebook content from GitHub: ${escapeHtml(message)}. <a href="${escapeHtml(entry.github_url)}" target="_blank" rel="noopener noreferrer">View on GitHub →</a></div>`
		}
	} else {
		html = '<div class="nb-error-banner">Add a GitHub URL in Keystatic to render this notebook.</div>'
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

function normalizeSingleRelationship(value: any): string | undefined {
	if (typeof value === 'string' && value) return value
	if (value && typeof value.slug === 'string') return value.slug
	return undefined
}

function resolveWritingSettings(settings: any): ResolvedWritingSettings {
	const publicationName = String(settings?.publicationName || '').trim()
	const publicationUrl = derivePublicationBaseUrl(String(settings?.publicationUrl || '').trim())

	if (!publicationName && !publicationUrl) return null

	return {
		publicationName,
		publicationUrl,
		subscribeUrl: publicationUrl ? deriveSubscribeUrl(publicationUrl) : '',
	}
}

async function resolveWritingPosts({
	publicationUrl,
	existingEntries,
	referencedSlugs,
}: {
	publicationUrl: string
	existingEntries: WritingStubEntry[]
	referencedSlugs: Set<string>
}) {
	const existingBySlug = new Map(
		existingEntries.map((entry) => [
			entry.slug,
			{
				title: entry.entry.title || '',
				pubDate: entry.entry.pubDate || '',
				substack_url: entry.entry.substack_url || '',
				description: entry.entry.description || '',
			},
		]),
	)

	const livePosts = publicationUrl
		? await fetchPublicationPosts(publicationUrl)
		: []

	syncWritingManifest({
		posts: livePosts,
		existingBySlug,
		referencedSlugs,
		publicationUrl,
	})

	const writing = livePosts.map((post) => ({
		slug: post.slug,
		title: post.title,
		pubDate: post.pubDate,
		substack_url: post.link,
		description: post.description || '',
		contentHtml: post.content || '',
	}))

	for (const slug of referencedSlugs) {
		if (writing.some((post) => post.slug === slug)) continue
		const fallback = existingBySlug.get(slug)
		if (!fallback?.substack_url) continue

		writing.push({
			slug,
			title: fallback.title || humanizeSlug(slug),
			pubDate: fallback.pubDate || '',
			substack_url: fallback.substack_url,
			description: fallback.description || '',
			contentHtml: await resolveArticleContent(fallback.substack_url),
		})
	}

	return writing.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
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

function derivePublicationBaseUrl(url: string): string {
	try {
		const parsed = new URL(url)
		const pathname = parsed.pathname.replace(/\/$/, '')
		if (!pathname || pathname === '/feed' || pathname === '/subscribe' || pathname.startsWith('/p/')) {
			return parsed.origin
		}
		return `${parsed.origin}${pathname}`
	} catch {
		return ''
	}
}

function deriveFeedUrl(url: string): string | null {
	const baseUrl = derivePublicationBaseUrl(url)
	if (!baseUrl) return null
	return `${baseUrl}/feed`
}

function deriveSubscribeUrl(url: string): string {
	const baseUrl = derivePublicationBaseUrl(url)
	return baseUrl ? `${baseUrl}/subscribe` : ''
}

function humanizeSlug(slug: string): string {
	return slug
		.split(/[-_]/)
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ')
}

function serializeWritingStub(entry: {
	slug: string
	title: string
	pubDate: string
	substack_url: string
	description: string
}): string {
	return [
		`slug: ${JSON.stringify(entry.slug)}`,
		`title: ${JSON.stringify(entry.title)}`,
		`pubDate: ${JSON.stringify(entry.pubDate)}`,
		`substack_url: ${JSON.stringify(entry.substack_url)}`,
		`description: ${JSON.stringify(entry.description)}`,
		'',
	].join('\n')
}

function syncWritingManifest({
	posts,
	existingBySlug,
	referencedSlugs,
	publicationUrl,
}: {
	posts: FeedPost[]
	existingBySlug: Map<
		string,
		{
			title: string
			pubDate: string
			substack_url: string
			description: string
		}
	>
	referencedSlugs: Set<string>
	publicationUrl: string
}) {
	if (!publicationUrl || !posts.length) return

	const desiredEntries = new Map<string, string>()
	const liveSlugs = new Set<string>()

	for (const post of posts) {
		liveSlugs.add(post.slug)
		desiredEntries.set(
			post.slug,
			serializeWritingStub({
				slug: post.slug,
				title: post.title,
				pubDate: post.pubDate.toISOString().slice(0, 10),
				substack_url: post.link,
				description: post.description || '',
			}),
		)
	}

	for (const slug of referencedSlugs) {
		if (liveSlugs.has(slug)) continue
		const fallback = existingBySlug.get(slug)
		const fallbackUrl = fallback?.substack_url || `${publicationUrl}/p/${slug}`
		desiredEntries.set(
			slug,
			serializeWritingStub({
				slug,
				title: fallback?.title || `(Older essay) ${humanizeSlug(slug)}`,
				pubDate: fallback?.pubDate || '',
				substack_url: fallbackUrl,
				description:
					fallback?.description ||
					'Older publication entry — kept as a relationship stub because it is still linked elsewhere in the CMS.',
			}),
		)
	}

	try {
		fs.mkdirSync(WRITING_MANIFEST_DIR, { recursive: true })

		for (const [slug, content] of desiredEntries) {
			const filePath = path.join(WRITING_MANIFEST_DIR, `${slug}.yaml`)
			const existing = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : ''
			if (existing !== content) {
				fs.writeFileSync(filePath, content)
			}
		}

		for (const filename of fs.readdirSync(WRITING_MANIFEST_DIR)) {
			if (!filename.endsWith('.yaml')) continue
			const slug = filename.slice(0, -5)
			if (desiredEntries.has(slug)) continue
			fs.rmSync(path.join(WRITING_MANIFEST_DIR, filename), { force: true })
		}
	} catch (error) {
		console.warn('[brewfolio] Failed to sync writing manifest:', error)
	}
}

function deriveSlug(url: string): string {
	try {
		const pathname = new URL(url).pathname
		const match = pathname.match(/\/p\/(.+?)(?:\/|$)/)
		return match ? match[1] : pathname.replace(/^\//, '').replace(/\/$/, '')
	} catch {
		return url.replace(/[^a-z0-9-]/gi, '-').toLowerCase()
	}
}

function normalizeArticleUrl(url: string): string {
	try {
		const parsed = new URL(url)
		return `${parsed.origin}${parsed.pathname.replace(/\/$/, '')}`
	} catch {
		return url
	}
}

function stripHtml(html: string): string {
	return html.replace(/<[^>]*>/g, '')
}

function decodeHtml(html: string): string {
	const entities: Record<string, string> = {
		'&amp;': '&',
		'&lt;': '<',
		'&gt;': '>',
		'&quot;': '"',
		'&#39;': "'",
		'&apos;': "'",
	}

	return html.replace(/&[^;]+;/g, (entity) => {
		if (entities[entity]) return entities[entity]
		const numMatch = entity.match(/^&#(\d+);$/)
		if (numMatch) return String.fromCodePoint(Number(numMatch[1]))
		const hexMatch = entity.match(/^&#x([0-9a-fA-F]+);$/)
		if (hexMatch) return String.fromCodePoint(parseInt(hexMatch[1], 16))
		return entity
	})
}

function extractTag(content: string, tag: string): string {
	const regex = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i')
	const match = content.match(regex)
	if (!match) return ''

	let extracted = match[1].trim()
	const cdataMatch = extracted.match(/<!\[CDATA\[([\s\S]*?)\]\]>/)
	if (cdataMatch) extracted = cdataMatch[1]
	return extracted
}

function extractContentEncoded(content: string): string {
	const match = content.match(/<content:encoded[^>]*>([\s\S]*?)<\/content:encoded>/i)
	if (!match) return ''

	let extracted = match[1].trim()
	const cdataMatch = extracted.match(/<!\[CDATA\[([\s\S]*?)\]\]>/)
	if (cdataMatch) extracted = cdataMatch[1]
	return extracted
}

async function fetchFeedPosts(feedUrl: string): Promise<FeedPost[]> {
	const response = await fetch(feedUrl)
	if (!response.ok) {
		throw new Error(`Feed fetch failed: ${response.status}`)
	}

	const xmlText = await response.text()
	const items: FeedPost[] = []
	const itemRegex = /<item>([\s\S]*?)<\/item>/g
	let match: RegExpExecArray | null

	while ((match = itemRegex.exec(xmlText)) !== null) {
		const itemContent = match[1]
		const title = extractTag(itemContent, 'title')
		const link = extractTag(itemContent, 'link')
		const pubDateStr = extractTag(itemContent, 'pubDate')
		const description = extractTag(itemContent, 'description')
		const content = extractContentEncoded(itemContent)

		if (!title || !link || !pubDateStr) continue

		items.push({
			title: decodeHtml(title),
			link,
			slug: deriveSlug(link),
			pubDate: new Date(pubDateStr),
			description: decodeHtml(stripHtml(description || '')),
			content,
		})
	}

	return items
}

async function fetchPublicationPosts(publicationUrl: string): Promise<FeedPost[]> {
	const feedUrl = deriveFeedUrl(publicationUrl)
	if (!feedUrl) return []

	if (!feedCache.has(feedUrl)) {
		feedCache.set(feedUrl, fetchFeedPosts(feedUrl).catch(() => []))
	}

	const posts = await feedCache.get(feedUrl)!

	return await Promise.all(
		posts.map(async (post) => ({
			...post,
			content: post.content
				? normalizeArticleHtml(post.content)
				: normalizeArticleHtml(await fetchArticlePageContent(post.link)),
		})),
	)
}

async function fetchArticlePageContent(articleUrl: string): Promise<string> {
	try {
		const response = await fetch(articleUrl)
		if (!response.ok) return ''
		const html = await response.text()

		const jsonBodyMatch = html.match(/"body_html":"([\s\S]*?)","cover_image"/)
		if (jsonBodyMatch) {
			try {
				return JSON.parse(`"${jsonBodyMatch[1]}"`)
			} catch {
				// Fall through to DOM-like extraction.
			}
		}

		const bodyStart = html.indexOf('class="available-content"><div dir="auto" class="body markup">')
		if (bodyStart === -1) return ''
		const start = html.indexOf('<div dir="auto" class="body markup">', bodyStart)
		const end = html.indexOf('<div class="pencraft pc-display-flex pc-flexDirection-column pc-gap-32 pc-reset container"', start)
		if (start === -1 || end === -1 || end <= start) return ''
		return html
			.slice(start, end)
			.replace(/^<div dir="auto" class="body markup">/, '')
			.replace(/<\/div>\s*$/, '')
	} catch {
		return ''
	}
}

async function resolveArticleContent(articleUrl: string): Promise<string> {
	const feedUrl = deriveFeedUrl(articleUrl)
	if (feedUrl) {
		if (!feedCache.has(feedUrl)) {
			feedCache.set(feedUrl, fetchFeedPosts(feedUrl).catch(() => []))
		}

		const posts = await feedCache.get(feedUrl)!
		const normalizedUrl = normalizeArticleUrl(articleUrl)
		const match = posts.find((post) => normalizeArticleUrl(post.link) === normalizedUrl)
		if (match?.content) return normalizeArticleHtml(match.content)
	}

	return normalizeArticleHtml(await fetchArticlePageContent(articleUrl))
}

function normalizeArticleHtml(html: string): string {
	if (!html) return ''

	return html
		.replace(
			/<h1([^>]*)>([\s\S]*?)<div[^>]*header-anchor-parent[\s\S]*?<\/div>\s*<\/h1>/gi,
			(_match, attrs, content) => `<h2${attrs}>${content.trim()}</h2>`,
		)
		.replace(/<h1([^>]*)>/gi, '<h2$1>')
		.replace(/<\/h1>/gi, '</h2>')
}

export async function dashboardHeader(config: PortfolioConfig) {
	const siteName = config?.siteTitle || ''
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
