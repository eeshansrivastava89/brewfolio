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
	label: 'Site',
	path: 'src/data/site-config',
	schema: {
		siteTitle: fields.text({
			label: 'Site title',
			validation: { isRequired: true },
		}),
		conceptsIntro: fields.text({
			label: 'Concepts intro',
			description: 'Shown at the top of the Concepts pane on the homepage.',
			multiline: true,
		}),
		city: fields.text({
			label: 'City',
			description: 'Shown in the weather widget in the header.',
		}),
		country: fields.text({
			label: 'Country (optional)',
			description: 'Use this only if the city name is ambiguous.',
		}),
	},
})

const github = singleton({
	label: 'GitHub',
	path: 'src/data/github',
	schema: {
		handle: fields.text({
			label: 'GitHub handle',
			description: 'Without the @ sign. Used in the GitHub pane.',
		}),
	},
})

const writingSettings = singleton({
	label: 'Writing settings',
	path: 'src/data/writing-config',
	schema: {
		publicationName: fields.text({
			label: 'Publication name',
			description: 'Shown in the Writing pane and writing modal header.',
		}),
		subscribeUrl: fields.url({
			label: 'Subscribe URL',
			description: 'Used for the subscribe buttons in Writing.',
		}),
	},
})

export default config({
	storage: { kind: 'local' },
	ui: {
		navigation: [
			'config',
			'concepts',
			'about',
			'github',
			'projects',
			'writingSettings',
			'writing',
			'notebooks',
			'timeline',
			'impact',
			'secrets',
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
