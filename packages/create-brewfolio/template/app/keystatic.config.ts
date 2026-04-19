import { collection, config, fields, singleton } from '@keystatic/core'
import { secrets } from 'brewfolio/keystatic.config'

const appConfig = singleton({
	label: 'Site',
	path: 'src/data/site-config',
	schema: {
		siteTitle: fields.text({
			label: 'Site title',
			description: 'Start here. Shown in the header title box and page title.',
			validation: { isRequired: true },
		}),
		city: fields.text({
			label: 'City',
			description: 'Shown in the shared header weather widget. Leave blank to hide the weather and clock.',
		}),
		country: fields.text({
			label: 'Country (optional)',
			description: 'Helps disambiguate the city during geocoding.',
		}),
		githubHandle: fields.text({
			label: 'GitHub handle',
			description:
				'Without the @ sign. Add this before using a GitHub timeline block on the homepage.',
		}),
	},
})

const appSections = singleton({
	label: 'Homepage',
	path: 'src/data/sections',
	schema: {
		sections: fields.array(
			fields.conditional(
				fields.select({
					label: 'Block type',
					options: [
						{ label: 'Metrics', value: 'metrics-grid' },
						{ label: 'List', value: 'results-list' },
						{ label: 'Content area', value: 'content-area' },
						{ label: 'Notebook link', value: 'notebook' },
						{ label: 'GitHub timeline', value: 'github-timeline' },
					],
					defaultValue: 'metrics-grid',
				}),
				{
					'metrics-grid': fields.object({
						title: fields.text({ label: 'Block title' }),
						metrics: fields.array(
							fields.object({
								label: fields.text({
									label: 'Metric label',
									validation: { isRequired: true },
								}),
								value: fields.text({
									label: 'Metric value',
									validation: { isRequired: true },
								}),
								delta: fields.text({ label: 'Change' }),
								delta_direction: fields.select({
									label: 'Change direction',
									options: [
										{ label: 'Up', value: 'up' },
										{ label: 'Down', value: 'down' },
										{ label: 'Neutral', value: 'neutral' },
									],
									defaultValue: 'neutral',
								}),
								context: fields.text({ label: 'Context line' }),
							}),
							{
								label: 'Metrics',
								itemLabel: (props: any) =>
									props.fields.label.value || 'Metric',
							},
						),
					}),
					'results-list': fields.object({
						title: fields.text({ label: 'Block title' }),
						items: fields.array(
							fields.object({
								title: fields.text({
									label: 'Row title',
									validation: { isRequired: true },
								}),
								href: fields.url({ label: 'Link URL' }),
								meta: fields.text({ label: 'Row subtitle' }),
							}),
							{
								label: 'Rows',
								itemLabel: (props: any) =>
									props.fields.title.value || 'Row',
							},
						),
					}),
					'content-area': fields.object({
						title: fields.text({ label: 'Block title' }),
						tagline: fields.text({
							label: 'Tagline',
							description: 'Short guidance line shown above the main content area.',
							multiline: true,
						}),
						body: fields.text({
							label: 'Body copy',
							description: 'Optional supporting copy. Leave blank if you want the block to stay visually open.',
							multiline: true,
						}),
						minHeight: fields.text({
							label: 'Minimum height',
							description: 'Optional CSS size like 240px or 18rem.',
						}),
					}),
					notebook: fields.object({
						title: fields.text({ label: 'Block title' }),
						notebook: fields.relationship({
							label: 'Analysis notebook',
							description: 'Pick the notebook this block should open.',
							collection: 'notebooks',
							validation: { isRequired: true },
						}),
					}),
					'github-timeline': fields.object({
						title: fields.text({ label: 'Block title' }),
					}),
				},
			),
			{
				label: 'Blocks',
				description:
					'Build the homepage from top to bottom. Use metrics and lists for structured content, and a content area for the main app surface.',
				itemLabel: (props: any) => props.value.discriminant,
			},
		),
	},
})

const appNotebooks = collection({
	label: 'Analysis notebooks',
	slugField: 'id',
	path: 'src/data/notebooks/*',
	schema: {
		id: fields.slug({
			name: {
				label: 'Notebook slug',
				description:
					'Used in the file name, the /analysis/<slug> route, and notebook link blocks.',
			},
		}),
		title: fields.text({
			label: 'Notebook title',
			description: 'The visible page title for this analysis entry.',
			validation: { isRequired: true },
		}),
		contextLabel: fields.text({
			label: 'Context label',
			description: 'Shown as the eyebrow in the analysis archive and notebook page.',
		}),
		github_url: fields.url({
			label: 'Notebook URL',
			description: 'Paste the GitHub URL for the .ipynb file.',
		}),
		description: fields.text({
			label: 'Card description',
			description: 'Shown in the archive and under the notebook title.',
			multiline: true,
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
				{ label: 'Error', value: 'error' },
			],
			defaultValue: 'none',
		}),
		summary_decision: fields.text({
			label: 'Summary headline',
			description: 'The main takeaway shown at the top of the summary card.',
			multiline: true,
		}),
		summary_methodology: fields.text({
			label: 'How you got the result',
			description: 'A short explanation of the method, test, or workflow.',
			multiline: true,
		}),
		summary_warnings: fields.array(fields.text({ label: 'Note' }), {
			label: 'Things to watch',
			itemLabel: (props: any) => props.value || 'Note',
		}),
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
						{ label: 'Neutral', value: 'neutral' },
					],
					defaultValue: 'neutral',
				}),
				context: fields.text({ label: 'Context', description: 'For example “vs baseline”.' }),
			}),
			{
				label: 'Summary metrics',
				itemLabel: (props: any) => props.fields.label.value || 'Metric',
			},
		),
	},
})

export default config({
	storage: { kind: 'local' },
	ui: {
		navigation: ['config', 'sections', 'notebooks', 'secrets'],
	},
	collections: {
		notebooks: appNotebooks,
	},
	singletons: {
		sections: appSections,
		secrets,
		config: appConfig,
	},
})
