import { marked } from 'marked'
import Prism from 'prismjs'
import 'prismjs/components/prism-bash.js'
import 'prismjs/components/prism-javascript.js'
import 'prismjs/components/prism-json.js'
import 'prismjs/components/prism-python.js'
import 'prismjs/components/prism-r.js'
import 'prismjs/components/prism-sql.js'
import 'prismjs/components/prism-typescript.js'

export interface NotebookSummaryMetric {
	label: string
	value: string
	delta?: string
	delta_direction?: 'up' | 'down' | 'neutral'
	context?: string
}

export interface NotebookSummary {
	status: 'significant' | 'not_significant' | 'inconclusive' | 'error'
	decision: string
	metrics: NotebookSummaryMetric[]
	warnings?: string[]
	methodology?: string
	generated_at?: string
}

export interface NotebookEntry {
	id: string
	title: string
	project: string
	github_url: string
	description: string
	date: Date
	html: string
	summary: NotebookSummary | null
}

export interface IpynbCell {
	cell_type: 'markdown' | 'code' | 'raw'
	source: string | string[]
	outputs?: IpynbOutput[]
}

export interface IpynbOutput {
	output_type: 'stream' | 'display_data' | 'execute_result' | 'error'
	text?: string | string[]
	data?: Record<string, string | string[]>
	traceback?: string[]
}

export interface Ipynb {
	cells: IpynbCell[]
	metadata?: {
		kernelspec?: { language?: string }
	}
}

function joinSource(source: string | string[] | undefined): string {
	if (source === undefined) return ''
	return Array.isArray(source) ? source.join('') : source
}

export function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
}

function stripAnsi(text: string): string {
	return text.replace(/\x1b\[[0-9;]*m/g, '')
}

function highlightCode(code: string, language: string): string {
	const grammar = Prism.languages[language]
	if (grammar) {
		return Prism.highlight(code, grammar, language)
	}
	return escapeHtml(code)
}

function renderOutput(output: IpynbOutput): string {
	if (output.output_type === 'stream') {
		return `<pre class="nb-output nb-stream">${escapeHtml(joinSource(output.text))}</pre>`
	}
	if (output.output_type === 'error') {
		const traceback = (output.traceback || [])
			.map((line) => escapeHtml(stripAnsi(line)))
			.join('\n')
		return `<pre class="nb-output nb-error">${traceback}</pre>`
	}
	if (
		output.output_type === 'display_data' ||
		output.output_type === 'execute_result'
	) {
		const data = output.data || {}
		if (data['text/html']) {
			return `<div class="nb-output nb-html">${joinSource(data['text/html'])}</div>`
		}
		if (data['image/png']) {
			const base64 = joinSource(data['image/png']).trim()
			return `<div class="nb-output nb-image"><img alt="output" src="data:image/png;base64,${base64}"></div>`
		}
		if (data['image/jpeg']) {
			const base64 = joinSource(data['image/jpeg']).trim()
			return `<div class="nb-output nb-image"><img alt="output" src="data:image/jpeg;base64,${base64}"></div>`
		}
		if (data['image/svg+xml']) {
			return `<div class="nb-output nb-image">${joinSource(data['image/svg+xml'])}</div>`
		}
		if (data['text/plain']) {
			return `<pre class="nb-output nb-text">${escapeHtml(
				joinSource(data['text/plain']),
			)}</pre>`
		}
	}
	return ''
}

export function renderNotebook(ipynb: Ipynb): string {
	const language = ipynb.metadata?.kernelspec?.language || 'python'
	const cells = ipynb.cells.map((cell) => {
		if (cell.cell_type === 'markdown') {
			const markdown = joinSource(cell.source)
			const html = marked.parse(markdown, { async: false }) as string
			return `<div class="nb-cell nb-markdown">${html}</div>`
		}
		if (cell.cell_type === 'code') {
			const code = joinSource(cell.source)
			const highlighted = highlightCode(code, language)
			const codeBlock = `<pre class="nb-input language-${language}"><code class="language-${language}">${highlighted}</code></pre>`
			const outputs = (cell.outputs || []).map(renderOutput).join('')
			return `<div class="nb-cell nb-code">${codeBlock}${
				outputs ? `<div class="nb-outputs">${outputs}</div>` : ''
			}</div>`
		}
		return `<pre class="nb-cell nb-raw">${escapeHtml(joinSource(cell.source))}</pre>`
	})
	return `<div class="notebook">${cells.join('\n')}</div>`
}
