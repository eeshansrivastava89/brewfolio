import type {
	ContributionWeek,
	GitHubActivityItem,
	GitHubActivityTotals,
	GitHubData,
	ProjectCommit,
	ProjectGitHubData,
} from './types'

interface GraphQLActivityData {
	contributionCalendar: {
		weeks: ContributionWeek[]
	}
	commitContributionsByRepository: Array<{
		repository: { name: string; url: string }
		contributions: { totalCount: number }
	}>
	pullRequestContributions: {
		totalCount: number
		nodes: Array<{
			pullRequest: { title: string | null; url: string; repository: { name: string } }
		}>
	}
	issueContributions: {
		totalCount: number
		nodes: Array<{
			issue: { title: string | null; url: string; repository: { name: string } }
		}>
	}
}

interface GraphQLRepoNode {
	name: string
	url: string
	createdAt: string
}

interface GitHubEvent {
	type: string
	repo: { name: string }
	payload: {
		commits?: Array<{ message: string; url: string }>
		pull_request?: { title: string | null; html_url: string }
		issue?: { title: string | null; html_url: string }
		ref_type?: string
	}
}

function parseGraphQLActivity(
	data: GraphQLActivityData,
	newRepos: GraphQLRepoNode[],
): { activity: GitHubActivityItem[]; totals: GitHubActivityTotals } {
	const activity: GitHubActivityItem[] = []

	for (const { repository, contributions } of data.commitContributionsByRepository) {
		const count = contributions.totalCount
		if (count === 0) continue
		activity.push({
			category: 'commit',
			repo: repository.name,
			message: `${count} commit${count === 1 ? '' : 's'}`,
			url: repository.url,
		})
	}

	for (const repo of newRepos) {
		activity.push({
			category: 'repo',
			repo: repo.name,
			message: 'Created repository',
			url: repo.url,
		})
	}

	for (const { issue } of data.issueContributions.nodes) {
		activity.push({
			category: 'issue',
			repo: issue.repository.name,
			message: (issue.title ?? '').slice(0, 72),
			url: issue.url,
		})
	}

	for (const { pullRequest } of data.pullRequestContributions.nodes) {
		activity.push({
			category: 'pr',
			repo: pullRequest.repository.name,
			message: (pullRequest.title ?? '').slice(0, 72),
			url: pullRequest.url,
		})
	}

	return {
		activity,
		totals: {
			commits: data.commitContributionsByRepository.reduce(
				(sum, row) => sum + row.contributions.totalCount,
				0,
			),
			issues: data.issueContributions.totalCount,
			prs: data.pullRequestContributions.totalCount,
			repos: newRepos.length,
		},
	}
}

function parseEvents(events: GitHubEvent[]): {
	activity: GitHubActivityItem[]
	totals: GitHubActivityTotals
} {
	const allItems: GitHubActivityItem[] = []
	const seen = new Set<string>()

	for (const event of events) {
		const repo = event.repo?.name ?? ''
		const repoShort = repo.includes('/') ? repo.split('/')[1] : repo

		switch (event.type) {
			case 'PushEvent': {
				const commits = event.payload.commits ?? []
				if (commits.length === 0) break
				const first = commits[0]
				const msg = (first.message ?? '').split('\n')[0].slice(0, 72)
				const suffix = commits.length > 1 ? ` (+${commits.length - 1} more)` : ''
				const sha = first.url.split('/').pop() ?? ''
				const url = sha
					? `https://github.com/${repo}/commit/${sha}`
					: `https://github.com/${repo}`
				allItems.push({
					category: 'commit',
					repo: repoShort,
					message: msg + suffix,
					url,
				})
				break
			}
			case 'CreateEvent': {
				if ((event.payload.ref_type ?? 'branch') === 'repository') {
					allItems.push({
						category: 'repo',
						repo: repoShort,
						message: 'Created repository',
						url: `https://github.com/${repo}`,
					})
				}
				break
			}
			case 'IssuesEvent':
			case 'IssueCommentEvent': {
				const issue = event.payload.issue
				if (!issue?.html_url) break
				const key = `issue:${issue.html_url}`
				if (seen.has(key)) break
				seen.add(key)
				allItems.push({
					category: 'issue',
					repo: repoShort,
					message: (issue.title ?? '').slice(0, 72),
					url: issue.html_url,
				})
				break
			}
			case 'PullRequestEvent': {
				const pr = event.payload.pull_request
				if (!pr?.html_url) break
				const key = `pr:${pr.html_url}`
				if (seen.has(key)) break
				seen.add(key)
				allItems.push({
					category: 'pr',
					repo: repoShort,
					message: (pr.title ?? '').slice(0, 72),
					url: pr.html_url,
				})
				break
			}
		}
	}

	return {
		activity: allItems,
		totals: {
			commits: allItems.filter((item) => item.category === 'commit').length,
			issues: allItems.filter((item) => item.category === 'issue').length,
			prs: allItems.filter((item) => item.category === 'pr').length,
			repos: new Set(
				allItems.filter((item) => item.category === 'repo').map((item) => item.repo),
			).size,
		},
	}
}

const githubCache = new Map<string, Promise<GitHubData>>()

export function getGitHubData({
	username,
	token,
}: {
	username: string
	token?: string
}): Promise<GitHubData> {
	const key = `${username}:${token ? 'gql' : 'rest'}`
	if (!githubCache.has(key)) {
		githubCache.set(key, fetchGitHubData({ username, token }))
	}
	return githubCache.get(key)!
}

async function fetchGitHubData({
	username,
	token,
}: {
	username: string
	token?: string
}): Promise<GitHubData> {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		'User-Agent': 'brewfolio-theme',
		...(token ? { Authorization: `Bearer ${token}` } : {}),
	}

	const to = new Date()
	const from = new Date(to.getTime() - 26 * 7 * 24 * 60 * 60 * 1000)

	if (token) {
		const query = `
			query ActivityData($username: String!, $from: DateTime!, $to: DateTime!) {
				user(login: $username) {
					contributionsCollection(from: $from, to: $to) {
						contributionCalendar {
							weeks {
								contributionDays {
									date
									contributionCount
								}
							}
						}
						commitContributionsByRepository(maxRepositories: 20) {
							repository { name url }
							contributions(first: 1) { totalCount }
						}
						pullRequestContributions(first: 10) {
							totalCount
							nodes {
								pullRequest {
									title
									url
									repository { name }
								}
							}
						}
						issueContributions(first: 10) {
							totalCount
							nodes {
								issue {
									title
									url
									repository { name }
								}
							}
						}
					}
					repositories(first: 10, orderBy: { field: CREATED_AT, direction: DESC }) {
						nodes { name url createdAt }
					}
				}
			}
		`

		type GraphQLResult = {
			user: {
				contributionsCollection: GraphQLActivityData
				repositories: { nodes: GraphQLRepoNode[] }
			}
		}

		const response = await fetch('https://api.github.com/graphql', {
			method: 'POST',
			headers,
			body: JSON.stringify({
				query,
				variables: { username, from: from.toISOString(), to: to.toISOString() },
			}),
		})

		if (!response.ok) {
			throw new Error(
				`[github] GraphQL request failed: ${response.status} ${response.statusText}`,
			)
		}

		const { data, errors } = (await response.json()) as {
			data: GraphQLResult
			errors?: Array<{ message: string }>
		}

		if (errors?.length) {
			throw new Error(`[github] GraphQL error: ${errors[0].message}`)
		}

		const collection = data.user.contributionsCollection
		const weeks = collection.contributionCalendar.weeks
		const newRepos = data.user.repositories.nodes.filter(
			(repo) => new Date(repo.createdAt) >= from,
		)
		const { activity, totals } = parseGraphQLActivity(collection, newRepos)
		return { weeks, recentActivity: activity, activityTotals: totals }
	}

	const events: GitHubEvent[] = []
	let nextUrl: string | null = `https://api.github.com/users/${username}/events?per_page=100`
	while (nextUrl) {
		const response = await fetch(nextUrl, { headers })
		if (!response.ok) {
			throw new Error(
				`[github] Events API request failed: ${response.status} ${response.statusText}`,
			)
		}
		const page = (await response.json()) as GitHubEvent[]
		events.push(...page)
		const link = response.headers.get('Link') ?? ''
		const next = link.match(/<([^>]+)>;\s*rel="next"/)
		nextUrl = next ? next[1] : null
	}

	const { activity, totals } = parseEvents(events)
	return { weeks: [], recentActivity: activity, activityTotals: totals }
}

function parseRepoOwner(repoUrl: string): { owner: string; repo: string } | null {
	try {
		const url = new URL(repoUrl)
		if (url.hostname !== 'github.com') return null
		const [, owner, repo] = url.pathname.split('/')
		if (!owner || !repo) return null
		return { owner, repo: repo.replace(/\.git$/, '') }
	} catch {
		return null
	}
}

const projectCache = new Map<string, Promise<ProjectGitHubData | null>>()

export function getProjectGitHubData(
	repoUrl: string,
	token?: string,
): Promise<ProjectGitHubData | null> {
	const key = `${repoUrl}:${token ? '1' : '0'}`
	if (!projectCache.has(key)) {
		projectCache.set(key, fetchProjectGitHubData(repoUrl, token))
	}
	return projectCache.get(key)!
}

async function fetchProjectGitHubData(
	repoUrl: string,
	token?: string,
): Promise<ProjectGitHubData | null> {
	const parsed = parseRepoOwner(repoUrl)
	if (!parsed) return null

	const { owner, repo } = parsed
	const headers: Record<string, string> = {
		'User-Agent': 'brewfolio-theme',
		Accept: 'application/vnd.github.v3+json',
		...(token ? { Authorization: `Bearer ${token}` } : {}),
	}

	try {
		const [repoResponse, pullsResponse, commitsResponse] = await Promise.all([
			fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
			fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=100`, {
				headers,
			}),
			fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=15`, {
				headers,
			}),
		])

		if (!repoResponse.ok) return null

		const repoData = (await repoResponse.json()) as Record<string, unknown>
		const openPRs = pullsResponse.ok
			? ((await pullsResponse.json()) as unknown[]).length
			: 0
		const rawCommits = commitsResponse.ok
			? ((await commitsResponse.json()) as Array<Record<string, unknown>>)
			: []

		const totalIssues = (repoData.open_issues_count as number) ?? 0
		const openIssues = Math.max(0, totalIssues - openPRs)

		const recentCommits: ProjectCommit[] = rawCommits.map((commitRow) => {
			const commit = commitRow.commit as Record<string, unknown>
			const author = commit?.author as Record<string, unknown>
			return {
				sha: String(commitRow.sha ?? '').slice(0, 7),
				message: String(commit?.message ?? '')
					.split('\n')[0]
					.slice(0, 80),
				date: String(author?.date ?? ''),
				url: String(commitRow.html_url ?? ''),
			}
		})

		return {
			openIssues,
			openPRs,
			visibility:
				(repoData.visibility as string) ??
				(repoData.private ? 'private' : 'public'),
			recentCommits,
			syncedAt: new Date().toISOString(),
		}
	} catch {
		return null
	}
}
