import { config, collection, singleton, fields } from '@keystatic/core'

// ─── Collections ────────────────────────────────────────────────────────────

export const writing = collection({
	label: 'Writing manifest',
	slugField: 'slug',
	path: 'src/data/writing/*',
	schema: {
		slug: fields.slug({
			name: {
				label: 'Slug',
				description:
					'Auto-generated from your publication feed. This slug is used for relationships and the /writing/<slug> route.',
			},
		}),
		title: fields.text({
			label: 'Post title',
			description: 'Auto-generated from the publication feed metadata.',
		}),
		pubDate: fields.text({
			label: 'Published date',
			description: 'Auto-generated from the publication feed metadata.',
		}),
		substack_url: fields.url({
			label: 'Post URL',
			description: 'Auto-generated source URL for the article.',
		}),
		description: fields.text({
			label: 'Card description',
			description: 'Auto-generated archive summary and article deck.',
			multiline: true,
		})
	}
})

export const notebooks = collection({
	label: 'Analysis notebooks',
	slugField: 'id',
	path: 'src/data/notebooks/*',
	schema: {
		id: fields.slug({ name: { label: 'Notebook ID' } }),
		title: fields.text({ label: 'Notebook title', validation: { isRequired: true } }),
		project: fields.relationship({
			label: 'Project',
			collection: 'projects',
			validation: { isRequired: true }
		}),
		github_url: fields.url({
			label: 'Notebook URL',
			description: 'Paste the GitHub URL for the .ipynb file.'
		}),
		description: fields.text({
			label: 'Card description',
			description: 'Shown in the analysis list and at the top of the notebook page.',
			multiline: true
		}),
		date: fields.date({ label: 'Published date', defaultValue: { kind: 'today' } }),
		summary_status: fields.select({
			label: 'Summary status',
			description: 'Choose a result to show the summary card on the notebook page.',
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
			label: 'Summary headline',
			description: 'The main takeaway shown at the top of the summary card.',
			multiline: true
		}),
		summary_methodology: fields.text({
			label: 'How you got the result',
			description: 'A short explanation of the method, test, or workflow.',
			multiline: true
		}),
		summary_warnings: fields.array(
			fields.text({ label: 'Note' }),
			{ label: 'Things to watch', itemLabel: (props: any) => props.value || 'Note' }
		),
		summary_metrics: fields.array(
			fields.object({
				label: fields.text({ label: 'Metric label', validation: { isRequired: true } }),
				value: fields.text({ label: 'Metric value', validation: { isRequired: true } }),
				delta: fields.text({ label: 'Change', description: 'For example +12% or -5%.' }),
				delta_direction: fields.select({
					label: 'Change direction',
					options: [
						{ label: 'Up', value: 'up' },
						{ label: 'Down', value: 'down' },
						{ label: 'Neutral', value: 'neutral' }
					],
					defaultValue: 'neutral'
				}),
				context: fields.text({ label: 'Context', description: 'For example “vs baseline”.' })
			}),
			{ label: 'Summary metrics', itemLabel: (props: any) => props.fields.label.value || 'Metric' }
		)
	}
})

export const projects = collection({
	label: 'Projects',
	slugField: 'id',
	path: 'src/data/projects/*',
	schema: {
		id: fields.slug({
			name: {
				label: 'Project ID',
				description:
					'Create projects first. Notebooks and concepts can link back to this project later.',
			},
		}),
		name: fields.text({ label: 'Project name', validation: { isRequired: true } }),
		url: fields.url({ label: 'Project URL' }),
		status: fields.select({
			label: 'Status',
			options: [
				{ label: 'Live', value: 'live' },
				{ label: 'In Progress', value: 'in-progress' },
				{ label: 'Coming Soon', value: 'coming-soon' }
			],
			defaultValue: 'live'
		}),
		external: fields.checkbox({
			label: 'Open project URL in a new tab',
			defaultValue: true,
		}),
		description: fields.text({
			label: 'Full description',
			description: 'Used in the drawer and as fallback copy on the home card.',
			validation: { isRequired: true },
			multiline: true,
		}),
		shortDescription: fields.text({
			label: 'Home card description',
			description: 'Shorter copy for the project tile on the dashboard.',
		}),
		image: fields.text({ label: 'Image path' }),
		repo: fields.url({
			label: 'GitHub repo URL',
			description: 'Used for repo stats and recent commits in the project drawer.'
		}),
		featuredNotebook: fields.relationship({
			label: 'Featured analysis notebook',
			collection: 'notebooks',
			description:
				'Optional. Pick the analysis page that should open from the project drawer. If blank, brewfolio will use the first notebook already linked back to this project.',
		}),
		tags: fields.array(
			fields.object({ name: fields.text({ label: 'Tag' }) }),
			{ label: 'Tags', itemLabel: (props: any) => props.fields.name.value || 'Tag' }
		),
		relatedWriting: fields.array(
			fields.relationship({
				label: 'Post',
				collection: 'writing',
			}),
			{
				label: 'Related writing',
				description:
					'Optional supporting essays or notes to surface alongside this project.',
				itemLabel: (props: any) => props.value || 'Post',
			}
		),
		overview: fields.text({
			label: 'Drawer overview',
			description: 'The “What is it?” section in the project drawer.',
			multiline: true
		}),
		architecture: fields.text({
			label: 'How it is built',
			description: 'Tech stack and the main implementation decisions.',
			multiline: true
		}),
		nextActions: fields.text({
			label: 'What is next',
			description: 'What you are shipping, testing, or exploring next.',
			multiline: true
		})
	}
})

// ─── Singletons ─────────────────────────────────────────────────────────────

export const sections = singleton({
	label: 'Homepage',
	path: 'src/data/sections',
	schema: {
		sections: fields.array(
			fields.conditional(
				fields.select({
					label: 'Block type',
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
						title: fields.text({ label: 'Block title' }),
						metrics: fields.array(
							fields.object({
								label: fields.text({ label: 'Metric label', validation: { isRequired: true } }),
								value: fields.text({ label: 'Metric value', validation: { isRequired: true } }),
								delta: fields.text({ label: 'Change', description: 'For example +2.1%.' }),
								delta_direction: fields.select({
									label: 'Change direction',
									options: [
										{ label: 'Up', value: 'up' },
										{ label: 'Down', value: 'down' },
										{ label: 'Neutral', value: 'neutral' }
									],
									defaultValue: 'neutral'
								}),
								context: fields.text({ label: 'Context line' })
							}),
							{ label: 'Metrics', itemLabel: (props: any) => props.fields.label.value || 'Metric' }
						)
					}),
					'results-list': fields.object({
						title: fields.text({ label: 'Block title' }),
						items: fields.array(
							fields.object({
								title: fields.text({ label: 'Row title', validation: { isRequired: true } }),
								href: fields.url({ label: 'Link URL' }),
								meta: fields.text({ label: 'Row subtitle' })
							}),
							{ label: 'Rows', itemLabel: (props: any) => props.fields.title.value || 'Row' }
						)
					}),
					notebook: fields.object({
						title: fields.text({ label: 'Block title' }),
						notebookId: fields.text({
							label: 'Notebook ID',
							description: 'Must match a notebook entry.',
							validation: { isRequired: true }
						})
					}),
					'github-timeline': fields.object({
						title: fields.text({ label: 'Block title' })
					})
				}
			),
			{ label: 'Blocks', itemLabel: (props: any) => props.value.discriminant }
		)
	}
})

export const concepts = singleton({
	label: 'Concepts',
	path: 'src/data/concepts',
	schema: {
		concepts: fields.array(
			fields.object({
				slug: fields.text({
					label: 'Slug',
					description:
						'Create projects, writing posts, and notebooks first. Concepts are the last curation step that ties those pieces together on the homepage.',
					validation: { isRequired: true },
				}),
				name: fields.text({ label: 'Concept name', validation: { isRequired: true } }),
				description: fields.text({
					label: 'Short description',
					description: 'Shown in the Concepts pane.',
				}),
				projects: fields.array(
					fields.relationship({ label: 'Project', collection: 'projects' }),
					{ label: 'Linked projects', itemLabel: (props: any) => props.value || 'Project' }
				),
				writing: fields.array(
					fields.relationship({ label: 'Post', collection: 'writing' }),
					{ label: 'Linked writing', itemLabel: (props: any) => props.value || 'Post' }
				),
				notebooks: fields.array(
					fields.relationship({ label: 'Notebook', collection: 'notebooks' }),
					{ label: 'Linked notebooks', itemLabel: (props: any) => props.value || 'Notebook' }
				)
			}),
			{ label: 'Concepts', itemLabel: (props: any) => props.fields.name.value || 'Concept' }
		)
	}
})

export const timeline = singleton({
	label: 'Experience & education',
	path: 'src/data/timeline',
	schema: {
		timeline: fields.array(
			fields.object({
				timespan: fields.text({ label: 'Date range' }),
				title: fields.text({ label: 'Role or degree', validation: { isRequired: true } }),
				company: fields.text({ label: 'Organization' }),
				description: fields.text({ label: 'Description', multiline: true }),
				logo: fields.text({ label: 'Logo filename' }),
				type: fields.select({
					label: 'Section',
					options: [
						{ label: 'Work', value: 'work' },
						{ label: 'Education', value: 'education' }
					],
					defaultValue: 'work'
				})
			}),
			{ label: 'Entries', itemLabel: (props: any) => props.fields.title.value || 'Entry' }
		)
	}
})

export const siteConfig = singleton({
	label: 'Site',
	path: 'src/data/site-config',
	schema: {
		city: fields.text({ label: 'City', defaultValue: 'Seattle' }),
		country: fields.text({ label: 'Country (optional)', defaultValue: 'United States' }),
		conceptsIntro: fields.text({
			label: 'Concepts intro',
			description: 'Shown at the top of the Concepts pane on the homepage.',
			multiline: true,
			defaultValue: 'I build data science apps with AI. Click a concept to filter the grid by topic.'
		}),
		githubHandle: fields.text({
			label: 'GitHub handle',
			description: 'Without the @ sign.',
		})
	}
})

export const about = singleton({
	label: 'About',
	path: 'src/data/about',
	schema: {
		bio: fields.text({
			label: 'Top bio',
			description:
				'The intro at the top of the About page. Write this after Site, Projects, Writing, and Notebooks are in place so the bio can describe the real work on the homepage.',
			multiline: true,
			validation: { isRequired: true }
		}),
		thisSite: fields.text({
			label: 'This site section',
			description: 'The “This Site” section on the About page.',
			multiline: true,
			validation: { isRequired: true }
		})
	}
})

export const impact = singleton({
	label: 'Recognition & links',
	path: 'src/data/impact',
	schema: {
		impact: fields.array(
			fields.object({
				title: fields.text({ label: 'Section title', validation: { isRequired: true } }),
				icon: fields.text({ label: 'Icon (optional)' }),
				visible: fields.checkbox({ label: 'Show this section', defaultValue: true }),
				items: fields.array(
					fields.object({
						text: fields.text({ label: 'Label', validation: { isRequired: true } }),
						meta: fields.text({ label: 'Subtext' }),
						link: fields.url({ label: 'Link URL' })
					}),
					{ label: 'Links', itemLabel: (props: any) => props.fields.text.value || 'Link' }
				)
			}),
			{ label: 'Sections', itemLabel: (props: any) => props.fields.title.value || 'Section' }
		)
	}
})

export const secrets = singleton({
	label: 'Secrets',
	path: 'src/data/secrets',
	schema: {
		githubToken: fields.text({
			label: 'GitHub token',
			multiline: false,
			description: 'Optional. Used to fetch GitHub activity while developing locally.'
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
		navigation: ['siteConfig', 'projects', 'writing', 'notebooks', 'concepts', 'about', 'timeline', 'impact', 'sections', 'secrets']
	},
	collections,
	singletons
})

export default keystaticConfig

export { fields }
