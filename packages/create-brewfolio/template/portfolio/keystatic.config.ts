import { config, fields, singleton } from '@keystatic/core'
import {
	about,
	concepts,
	impact,
	notebooks,
	projects,
	secrets,
	timeline,
	writing,
} from 'brewfolio/keystatic.config'

const portfolioConfig = singleton({
	label: 'Config',
	path: 'src/data/site-config',
	schema: {
		siteTitle: fields.text({
			label: 'Site title',
			validation: { isRequired: true },
		}),
		conceptsIntro: fields.text({
			label: 'Concepts intro',
			multiline: true,
		}),
		city: fields.text({
			label: 'City',
			description: 'Shown in the header weather widget. Coordinates and timezone are auto-resolved in code.',
		}),
		country: fields.text({
			label: 'Country (optional)',
			description: 'Helps disambiguate cities with the same name.',
		}),
	},
})

const github = singleton({
	label: 'GitHub',
	path: 'src/data/github',
	schema: {
		handle: fields.text({
			label: 'GitHub handle',
			description: 'Without the @ sign.',
		}),
	},
})

const writingSettings = singleton({
	label: 'Writing / Substack',
	path: 'src/data/writing-config',
	schema: {
		publicationName: fields.text({
			label: 'Publication name',
		}),
		subscribeUrl: fields.url({
			label: 'Subscribe URL',
		}),
	},
})

export default config({
	storage: { kind: 'local' },
	ui: {
		navigation: [
			'concepts',
			'github',
			'projects',
			'writingSettings',
			'writing',
			'notebooks',
			'about',
			'timeline',
			'impact',
			'secrets',
			'config',
		],
	},
	collections: {
		projects,
		writing,
		notebooks,
	},
	singletons: {
		concepts,
		github,
		about,
		timeline,
		impact,
		writingSettings,
		secrets,
		config: portfolioConfig,
	},
})
