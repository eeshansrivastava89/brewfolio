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
			description: 'Start here. This name appears in the notch, header, and browser tab.',
			validation: { isRequired: true },
		}),
		conceptsIntro: fields.text({
			label: 'Concepts intro',
			description:
				'Shown at the top of the Concepts pane on the homepage. Two short sentences work best: what the site is about, then how to use the concept filters.',
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
			description:
				'Without the @ sign. Used in the GitHub pane on the homepage and for contribution/activity data.',
		}),
	},
})

const writingSettings = singleton({
	label: 'Writing settings',
	path: 'src/data/writing-config',
	schema: {
		publicationName: fields.text({
			label: 'Publication name',
			description:
				'Shown in the Writing pane and the writing modal header. Usually the name of your publication or newsletter.',
		}),
		subscribeUrl: fields.url({
			label: 'Subscribe URL',
			description:
				'Used for the subscribe buttons in Writing. Add this after you know where readers should subscribe.',
		}),
	},
})

export default config({
	storage: { kind: 'local' },
	ui: {
		navigation: [
			'config',
			'github',
			'writingSettings',
			'projects',
			'writing',
			'notebooks',
			'concepts',
			'about',
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
