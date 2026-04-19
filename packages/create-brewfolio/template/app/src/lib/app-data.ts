import {
	extractToc,
	fetchIpynb,
	getGitHubData,
	renderNotebook,
	resolveHeaderConfig,
	type GitHubData,
	type NotebookEntry,
	type NotebookSummary,
	type SectionConfig,
} from 'brewfolio'
import { reader } from './content'

type AppNotebookSource = {
	title?: string
	contextLabel?: string
	github_url?: string
	description?: string
	date?: string
	summary_status?: string
	summary_decision?: string
	summary_methodology?: string
	summary_warnings?: string[]
	summary_metrics?: Array<{
		label: string
		value: string
		delta?: string
		delta_direction?: 'up' | 'down' | 'neutral'
		context?: string
	}>
}

export async function getAppData() {
	const [sectionsData, notebookEntries, config, secrets] = await Promise.all([
		reader.singletons.sections.read(),
		reader.collections.notebooks.all(),
		reader.singletons.config.read(),
		reader.singletons.secrets.read(),
	])

	const siteTitle = config?.siteTitle?.trim() || ''
	const githubHandle = config?.githubHandle?.trim() || ''
	const githubToken = secrets?.githubToken?.trim() || undefined

	let githubData: GitHubData | null = null
	if (githubHandle) {
		try {
			githubData = await getGitHubData({
				username: githubHandle,
				token: githubToken,
			})
		} catch {
			githubData = null
		}
	}

	const headerConfig = await resolveHeaderConfig({
		siteName: siteTitle,
		city: config?.city?.trim() || '',
		country: config?.country?.trim() || '',
	})

	const notebooks = (
		await Promise.all(
			notebookEntries.map(async (entry) => buildAppNotebookEntry(entry.slug, entry.entry)),
		)
	).sort((a, b) => b.date.getTime() - a.date.getTime())

	const sections = normalizeAppSections(sectionsData?.sections ?? [])
	const notebookSummaries = notebooks.map((entry) => ({ id: entry.id, title: entry.title }))

	return {
		config,
		siteTitle,
		headerConfig,
		githubData,
		sections,
		notebooks,
		notebookSummaries,
	}
}

async function buildAppNotebookEntry(id: string, entry: AppNotebookSource): Promise<NotebookEntry> {
	let html = ''
	if (entry.github_url) {
		try {
			const ipynb = await fetchIpynb(entry.github_url)
			html = renderNotebook(ipynb)
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			html =
				'<div class="nb-error-banner">Could not load notebook content from GitHub: ' +
				escapeHtml(message) +
				'. <a href="' +
				escapeHtml(entry.github_url) +
				'" target="_blank" rel="noopener noreferrer">View on GitHub →</a></div>'
		}
	} else {
		html = '<div class="nb-error-banner">Add a GitHub URL in Keystatic to render this notebook.</div>'
	}

	const metrics = (entry.summary_metrics ?? []).map((metric) => ({
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
					status: entry.summary_status as NotebookSummary['status'],
					decision: entry.summary_decision ?? '',
					metrics,
					warnings: entry.summary_warnings ?? [],
					methodology: entry.summary_methodology || undefined,
				}
			: null

	return {
		id,
		title: entry.title || id,
		project: entry.contextLabel?.trim() || 'Analysis',
		github_url: entry.github_url || '',
		description: entry.description || '',
		date: entry.date ? new Date(entry.date) : new Date(0),
		html,
		summary,
	}
}

function normalizeAppSections(rawSections: any[]): SectionConfig[] {
	if (!Array.isArray(rawSections)) return []

	return rawSections
		.map((section) => {
			if (!section || typeof section !== 'object') return null

			if (section.discriminant === 'notebook') {
				const relationship = section.value?.notebook
				const notebookId =
					typeof relationship === 'string'
						? relationship
						: relationship?.slug || ''

				return {
					discriminant: 'notebook' as const,
					value: {
						title: section.value?.title || '',
						notebookId,
					},
				}
			}

			return section as SectionConfig
		})
		.filter(Boolean) as SectionConfig[]
}

function escapeHtml(value: string): string {
	return String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
}

export function modalBreadcrumb(label: string, href: string): string {
	return (
		'<a href="' +
		escapeHtml(href) +
		'" class="modal-breadcrumb-btn" data-modal-link><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>' +
		escapeHtml(label) +
		'</a>'
	)
}

export { extractToc }
