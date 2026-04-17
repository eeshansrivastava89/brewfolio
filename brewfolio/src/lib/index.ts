export * from './types'
export * from './projects'

export async function fetchNotebookFromGitHub(githubUrl: string): Promise<string> {
	const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)\.ipynb/)
	if (!match) throw new Error('Invalid GitHub notebook URL format')
	const [, owner, repo, branch, path] = match
	const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}.ipynb`
	const response = await fetch(rawUrl)
	if (!response.ok) throw new Error(`Failed to fetch notebook: ${response.statusText}`)
	return response.text()
}

export function formatDate(dateStr: string): string {
	return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function slugify(text: string): string {
	return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}