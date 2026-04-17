import { config, collection, singleton, fields } from '@keystatic/core'

export default config({
	storage: {
		kind: 'local'
	},
	ui: {
		navigation: ['notebooks', 'projects', 'concepts', 'about', 'timeline', 'impact', 'siteConfig']
	},
	collections: {
		writing: collection({
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
		}),
		notebooks: collection({
			label: 'Notebooks',
			slugField: 'id',
			path: 'src/data/notebooks/*',
			schema: {
				id: fields.slug({
					name: { label: 'Notebook ID' }
				}),
				title: fields.text({ label: 'Title', validation: { isRequired: true } }),
				project: fields.relationship({
					label: 'Project',
					collection: 'projects',
					validation: { isRequired: true }
				}),
				github_url: fields.url({ label: 'GitHub URL' }),
				description: fields.text({ label: 'Description', multiline: true }),
				date: fields.date({ label: 'Date', defaultValue: { kind: 'today' } })
			}
		}),
		projects: collection({
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
				repo: fields.url({ label: 'GitHub repo URL' }),
				analysis_url: fields.url({ label: 'Analysis URL' }),
				tags: fields.array(
					fields.object({ name: fields.text({ label: 'Tag name' }) }),
					{ label: 'Tags', itemLabel: (props) => props.fields.name.value || 'Tag' }
				),
				related_writing: fields.array(
					fields.text({ label: 'Slug' }),
					{ label: 'Related writing slugs', itemLabel: (props) => props.value || 'Slug' }
				)
			}
		})
	},
	singletons: {
		sections: singleton({
			label: 'Sections',
			path: 'src/data/sections',
			schema: {
				sections: fields.array(
					fields.object({
						discriminant: fields.select({
							label: 'Type',
							options: [
								{ label: 'Metrics Grid', value: 'metrics-grid' },
								{ label: 'Results List', value: 'results-list' },
								{ label: 'Notebook', value: 'notebook' },
								{ label: 'GitHub Timeline', value: 'github-timeline' }
							],
							defaultValue: 'metrics-grid'
						}),
						value: fields.dynamic({
							choose: fields.fields().discriminant,
							options: {
								'metrics-grid': fields.fields({
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
								'results-list': fields.fields({
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
								notebook: fields.fields({
									title: fields.text({ label: 'Title' }),
									notebookId: fields.text({ label: 'Notebook ID', validation: { isRequired: true } })
								}),
								'github-timeline': fields.fields({
									title: fields.text({ label: 'Title' })
								})
							}
						})
					}),
					{ label: 'Sections', itemLabel: (props) => `${props.fields.discriminant.value} — ${props.fields.value.value?.title || props.fields.discriminant.value}` }
				)
			}
		}),
		concepts: singleton({
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
		}),
		timeline: singleton({
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
		}),
		siteConfig: singleton({
			label: 'Site Config',
			path: 'src/data/site-config',
			schema: {
				city: fields.text({ label: 'City', defaultValue: 'Seattle' }),
				country: fields.text({ label: 'Country (optional)', defaultValue: 'United States' }),
				conceptsIntro: fields.text({
					label: 'Concepts pane intro',
					multiline: true,
					defaultValue: 'I build data science apps with AI. Click a concept to filter the grid by topic.'
				})
			}
		}),
		about: singleton({
			label: 'About',
			path: 'src/data/about',
			schema: {
				bio: fields.text({ label: 'Bio', multiline: true, validation: { isRequired: true } }),
				thisSite: fields.text({ label: 'This Site', multiline: true, validation: { isRequired: true } })
			}
		}),
		impact: singleton({
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
	}
})

export { fields }