import type { Ipynb } from './notebook-renderer'

export function transformGithubUrl(url: string): string {
	if (url.startsWith('https://raw.githubusercontent.com/')) return url

	if (url.startsWith('https://github.com/')) {
		return url
			.replace('https://github.com/', 'https://raw.githubusercontent.com/')
			.replace('/blob/', '/')
	}

	return url
}

export async function fetchIpynb(githubUrl: string): Promise<Ipynb> {
	const rawUrl = transformGithubUrl(githubUrl)
	const response = await fetch(rawUrl)
	if (!response.ok) {
		throw new Error(
			`[notebooks] Failed to fetch notebook from GitHub: ${response.status} ${response.statusText}`,
		)
	}
	return (await response.json()) as Ipynb
}
