import { config, fields, singleton } from '@keystatic/core'
import { secrets } from 'brewfolio/keystatic.config'

const appConfig = singleton({
	label: 'Config',
	path: 'src/data/site-config',
	schema: {
		siteTitle: fields.text({
			label: 'Site title',
			validation: { isRequired: true },
		}),
		githubHandle: fields.text({
			label: 'GitHub handle',
			description: 'Without the @ sign. Used by the GitHub timeline section.',
		}),
	},
})

const appSections = singleton({
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
						{ label: 'GitHub Timeline', value: 'github-timeline' },
					],
					defaultValue: 'metrics-grid',
				}),
				{
					'metrics-grid': fields.object({
						title: fields.text({ label: 'Title' }),
						metrics: fields.array(
							fields.object({
								label: fields.text({
									label: 'Label',
									validation: { isRequired: true },
								}),
								value: fields.text({
									label: 'Value',
									validation: { isRequired: true },
								}),
								delta: fields.text({ label: 'Delta' }),
								delta_direction: fields.select({
									label: 'Delta direction',
									options: [
										{ label: 'Up', value: 'up' },
										{ label: 'Down', value: 'down' },
										{ label: 'Neutral', value: 'neutral' },
									],
									defaultValue: 'neutral',
								}),
								context: fields.text({ label: 'Context' }),
							}),
							{
								label: 'Metrics',
								itemLabel: (props: any) =>
									props.fields.label.value || 'Metric',
							},
						),
					}),
					'results-list': fields.object({
						title: fields.text({ label: 'Title' }),
						items: fields.array(
							fields.object({
								title: fields.text({
									label: 'Title',
									validation: { isRequired: true },
								}),
								href: fields.url({ label: 'Link URL' }),
								meta: fields.text({ label: 'Meta subtitle' }),
							}),
							{
								label: 'Items',
								itemLabel: (props: any) =>
									props.fields.title.value || 'Item',
							},
						),
					}),
					'github-timeline': fields.object({
						title: fields.text({ label: 'Title' }),
					}),
				},
			),
			{
				label: 'Sections',
				itemLabel: (props: any) => props.value.discriminant,
			},
		),
	},
})

export default config({
	storage: { kind: 'local' },
	ui: {
		navigation: ['sections', 'config', 'secrets'],
	},
	singletons: {
		sections: appSections,
		secrets,
		config: appConfig,
	},
})
