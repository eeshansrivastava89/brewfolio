import { config, collection, singleton, fields } from '@keystatic/core'

// ─── Collections ────────────────────────────────────────────────────────────

export const writing = collection({
	label: 'Writing (auto from Substack)',
	slugField: 'slug',
	path: 'src/data/writing/*',
	schema: {
		slug: fields.slug({ name: { label: 'Slug' } }),
		title: fields.text({ label: 'Title' }),
		pubDate: fields.text({ label: 'Published date (YYYY-MM-DD)' }),
		substack_url: fields.url({ label: 'Substack URL' }),
		description: fields.text({ label: 'Description', multiline: true })
	}
})

export const notebooks = collection({
	label: 'Notebooks',
	slugField: 'id',
	path: 'src/data/notebooks/*',
	schema: {
		id: fields.slug({ name: { label: 'Notebook ID' } }),
		title: fields.text({ label: 'Title', validation: { isRequired: true } }),
		project: fields.relationship({
			label: 'Project',
			collection: 'projects',
			validation: { isRequired: true }
		}),
		github_url: fields.url({
			label: 'GitHub URL',
			description: 'Blob, raw, or raw.githubusercontent URL for the .ipynb file.'
		}),
		description: fields.text({
			label: 'Description',
			description: 'Shown on the catalog card and notebook header.',
			multiline: true
		}),
		date: fields.date({ label: 'Date', defaultValue: { kind: 'today' } }),
		summary_status: fields.select({
			label: 'Experiment status',
			description: 'Set to anything other than "None" to show the summary card.',
			options: [
				{ label: 'None', value: 'none' },
				{ label: 'Significant', value: 'significant' },
				{ label: 'Not significant', value: 'not_significant' },
				{ label: 'Inconclusive', value: 'inconclusive' },
				{ label: 'Error', value: 'error' }
			],
			defaultValue: 'none'
		}),
		summary_decision: fields.text({
			label: 'Decision',
			description: 'Key finding or recommendation shown prominently in the summary card.',
			multiline: true
		}),
		summary_methodology: fields.text({
			label: 'Methodology',
			description: 'Brief description of the methods used.',
			multiline: true
		}),
		summary_warnings: fields.array(
			fields.text({ label: 'Warning' }),
			{ label: 'Warnings', itemLabel: (props) => props.value || 'Warning' }
		),
		summary_metrics: fields.array(
			fields.object({
				label: fields.text({ label: 'Metric name', validation: { isRequired: true } }),
				value: fields.text({ label: 'Value', validation: { isRequired: true } }),
				delta: fields.text({ label: 'Delta', description: 'For example +12% or -5%.' }),
				delta_direction: fields.select({
					label: 'Direction',
					options: [
						{ label: 'Up', value: 'up' },
						{ label: 'Down', value: 'down' },
						{ label: 'Neutral', value: 'neutral' }
					],
					defaultValue: 'neutral'
				}),
				context: fields.text({ label: 'Context', description: 'For example vs baseline.' })
			}),
			{ label: 'Metrics', itemLabel: (props) => props.fields.label.value || 'Metric' }
		)
	}
})

export const projects = collection({
	label: 'Projects',
	slugField: 'id',
	path: 'src/data/projects/*',
	schema: {
		id: fields.slug({ name: { label: 'ID' } }),
		name: fields.text({ label: 'Name', validation: { isRequired: true } }),
		url: fields.url({ label: 'Live URL' }),
		status: fields.select({
			label: 'Status',
			options: [
				{ label: 'Live', value: 'live' },
				{ label: 'In Progress', value: 'in-progress' },
				{ label: 'Coming Soon', value: 'coming-soon' }
			],
			defaultValue: 'live'
		}),
		external: fields.checkbox({ label: 'External link', defaultValue: true }),
		description: fields.text({ label: 'Description', validation: { isRequired: true }, multiline: true }),
		shortDescription: fields.text({ label: 'Short Description' }),
		image: fields.text({ label: 'Image path' }),
		repo: fields.url({
			label: 'GitHub repo URL',
			description: 'Used to populate the project drawer with live repo stats and recent commits.'
		}),
		analysis_url: fields.url({ label: 'Analysis URL' }),
		tags: fields.array(
			fields.object({ name: fields.text({ label: 'Tag name' }) }),
			{ label: 'Tags', itemLabel: (props) => props.fields.name.value || 'Tag' }
		),
		related_writing: fields.array(
			fields.text({ label: 'Slug' }),
			{ label: 'Related writing slugs', itemLabel: (props) => props.value || 'Slug' }
		),
		overview: fields.text({
			label: 'What is it?',
			description: 'A paragraph or two describing the project.',
			multiline: true
		}),
		architecture: fields.text({
			label: 'Architecture / Tech Stack',
			description: 'How it is built and the main implementation decisions.',
			multiline: true
		}),
		nextActions: fields.text({
			label: 'Next actions / Updates',
			description: 'What is being worked on or planned next.',
			multiline: true
		})
	}
})

// ─── Singletons ─────────────────────────────────────────────────────────────

export const sections = singleton({
	label: 'Sections',
	path: 'src/data/sections',
	schema: {
		sections: fields.array(
			fields.conditional(
				fields.select({
					label: 'Type',
					options: [
						{ label: 'Metrics Grid', value: 'metrics-grid' },
						{ label: 'Results List', value: 'results-list' },
						{ label: 'Notebook', value: 'notebook' },
						{ label: 'GitHub Timeline', value: 'github-timeline' }
					],
					defaultValue: 'metrics-grid'
				}),
				{
					'metrics-grid': fields.object({
						title: fields.text({ label: 'Title' }),
						metrics: fields.array(
							fields.object({
								label: fields.text({ label: 'Label', validation: { isRequired: true } }),
								value: fields.text({ label: 'Value', validation: { isRequired: true } }),
								delta: fields.text({ label: 'Delta (e.g. +2.1%)' }),
								delta_direction: fields.select({
									label: 'Delta direction',
									options: [
										{ label: 'Up', value: 'up' },
										{ label: 'Down', value: 'down' },
										{ label: 'Neutral', value: 'neutral' }
									],
									defaultValue: 'neutral'
								}),
								context: fields.text({ label: 'Context line below value' })
							}),
							{ label: 'Metrics', itemLabel: (props) => props.fields.label.value || 'Metric' }
						)
					}),
					'results-list': fields.object({
						title: fields.text({ label: 'Title' }),
						items: fields.array(
							fields.object({
								title: fields.text({ label: 'Title', validation: { isRequired: true } }),
								href: fields.url({ label: 'Link URL' }),
								meta: fields.text({ label: 'Meta subtitle' })
							}),
							{ label: 'Items', itemLabel: (props) => props.fields.title.value || 'Item' }
						)
					}),
					notebook: fields.object({
						title: fields.text({ label: 'Title' }),
						notebookId: fields.text({ label: 'Notebook ID', validation: { isRequired: true } })
					}),
					'github-timeline': fields.object({
						title: fields.text({ label: 'Title' })
					})
				}
			),
			{ label: 'Sections', itemLabel: (props) => props.value.discriminant }
		)
	}
})

export const concepts = singleton({
	label: 'Concepts',
	path: 'src/data/concepts',
	schema: {
		concepts: fields.array(
			fields.object({
				slug: fields.text({ label: 'Slug', validation: { isRequired: true } }),
				name: fields.text({ label: 'Name', validation: { isRequired: true } }),
				description: fields.text({ label: 'Description' }),
				projects: fields.array(
					fields.relationship({ label: 'Project', collection: 'projects' }),
					{ label: 'Projects', itemLabel: (props) => props.value || 'Project' }
				),
				writing: fields.array(
					fields.relationship({ label: 'Essay', collection: 'writing' }),
					{ label: 'Writing', itemLabel: (props) => props.value || 'Essay' }
				),
				notebooks: fields.array(
					fields.relationship({ label: 'Notebook', collection: 'notebooks' }),
					{ label: 'Notebooks', itemLabel: (props) => props.value || 'Notebook' }
				)
			}),
			{ label: 'Concepts', itemLabel: (props) => props.fields.name.value || 'Concept' }
		)
	}
})

export const timeline = singleton({
	label: 'Timeline',
	path: 'src/data/timeline',
	schema: {
		timeline: fields.array(
			fields.object({
				timespan: fields.text({ label: 'Timespan' }),
				title: fields.text({ label: 'Title', validation: { isRequired: true } }),
				company: fields.text({ label: 'Company' }),
				description: fields.text({ label: 'Description', multiline: true }),
				logo: fields.text({ label: 'Logo filename' }),
				type: fields.select({
					label: 'Type',
					options: [
						{ label: 'Work', value: 'work' },
						{ label: 'Education', value: 'education' }
					],
					defaultValue: 'work'
				})
			}),
			{ label: 'Timeline entries', itemLabel: (props) => props.fields.title.value || 'Entry' }
		)
	}
})

export const siteConfig = singleton({
	label: 'Site Config',
	path: 'src/data/site-config',
	schema: {
		city: fields.text({ label: 'City', defaultValue: 'Seattle' }),
		country: fields.text({ label: 'Country (optional)', defaultValue: 'United States' }),
		conceptsIntro: fields.text({
			label: 'Concepts pane intro',
			multiline: true,
			defaultValue: 'I build data science apps with AI. Click a concept to filter the grid by topic.'
		}),
		githubHandle: fields.text({ label: 'GitHub handle (e.g. octocat)' })
	}
})

export const about = singleton({
	label: 'About',
	path: 'src/data/about',
	schema: {
		bio: fields.text({ label: 'Bio', multiline: true, validation: { isRequired: true } }),
		thisSite: fields.text({ label: 'This Site', multiline: true, validation: { isRequired: true } })
	}
})

export const impact = singleton({
	label: 'Impact',
	path: 'src/data/impact',
	schema: {
		impact: fields.array(
			fields.object({
				title: fields.text({ label: 'Title', validation: { isRequired: true } }),
				icon: fields.text({ label: 'Icon (e.g. lucide:award)' }),
				visible: fields.checkbox({ label: 'Visible', defaultValue: true }),
				items: fields.array(
					fields.object({
						text: fields.text({ label: 'Text', validation: { isRequired: true } }),
						meta: fields.text({ label: 'Meta (subtitle)' }),
						link: fields.url({ label: 'Link' })
					}),
					{ label: 'Items', itemLabel: (props) => props.fields.text.value || 'Item' }
				)
			}),
			{ label: 'Impact sections', itemLabel: (props) => props.fields.title.value || 'Section' }
		)
	}
})

export const secrets = singleton({
	label: 'Secrets',
	path: 'src/data/secrets',
	schema: {
		githubToken: fields.text({
			label: 'GitHub token (classic PAT with read:user + repo)',
			multiline: false,
			description: 'Used by GitHubPane to fetch contribution data. Keep this in .env for real deployments — this field is for local-dev convenience only.'
		})
	}
})

// ─── Bundles ────────────────────────────────────────────────────────────────

export const collections = { writing, notebooks, projects }

export const singletons = {
	sections,
	concepts,
	timeline,
	siteConfig,
	about,
	impact,
	secrets
}

export const keystaticConfig = config({
	storage: { kind: 'local' },
	ui: {
		navigation: ['notebooks', 'projects', 'concepts', 'about', 'timeline', 'impact', 'siteConfig', 'sections', 'secrets']
	},
	collections,
	singletons
})

export default keystaticConfig

export { fields }
