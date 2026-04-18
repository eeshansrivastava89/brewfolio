import { config, fields, singleton } from '@keystatic/core'

const gameConfig = singleton({
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
	},
})

const gameHome = singleton({
	label: 'Homepage',
	path: 'src/data/game-home',
	schema: {
		roundTitle: fields.text({
			label: 'Top heading',
			description:
				'Fill these fields in roughly the same order visitors see them: heading, score, timer, question, then leaderboard.',
			validation: { isRequired: true },
		}),
		subtitle: fields.text({
			label: 'Subtitle',
			description: 'Shown under the top heading.',
			multiline: true,
		}),
		scoreLabel: fields.text({
			label: 'Score label',
			description: 'For example “Your score”.',
			validation: { isRequired: true },
		}),
		scoreValue: fields.text({
			label: 'Current score',
			description: 'Digits only.',
			validation: { isRequired: true },
		}),
		previousScoreValue: fields.text({
			label: 'Previous score',
			description: 'Digits only. Used for the score change badge.',
			validation: { isRequired: true },
		}),
		timerVariant: fields.select({
			label: 'Timer mode',
			options: [
				{ label: 'Countdown', value: 'countdown' },
				{ label: 'Count up', value: 'countup' },
			],
			defaultValue: 'countdown',
		}),
		timerTotalMs: fields.text({
			label: 'Timer length in milliseconds',
			description: 'For example 30000 for 30 seconds.',
			validation: { isRequired: true },
		}),
		questionTitle: fields.text({
			label: 'Question heading',
			validation: { isRequired: true },
		}),
		questionPrompt: fields.text({
			label: 'Question text',
			multiline: true,
			validation: { isRequired: true },
		}),
		choices: fields.array(fields.text({ label: 'Choice' }), {
			label: 'Choices',
			itemLabel: (props: any) => props.value || 'Choice',
		}),
		leaderboardTitle: fields.text({
			label: 'Leaderboard title',
			validation: { isRequired: true },
		}),
		leaderboardEntries: fields.array(
			fields.object({
				rank: fields.text({
					label: 'Rank',
					description: 'Digits only.',
					validation: { isRequired: true },
				}),
				name: fields.text({
					label: 'Player name',
					validation: { isRequired: true },
				}),
				score: fields.text({
					label: 'Score',
					description: 'Digits only.',
					validation: { isRequired: true },
				}),
				delta: fields.text({
					label: 'Score change',
					description: 'Digits only. Use negative numbers for drops.',
				}),
				isCurrentUser: fields.checkbox({
					label: 'Highlight as the current player',
					defaultValue: false,
				}),
				variant: fields.select({
					label: 'Medal style',
					options: [
						{ label: 'Default', value: 'default' },
						{ label: 'Gold', value: 'gold' },
						{ label: 'Silver', value: 'silver' },
						{ label: 'Bronze', value: 'bronze' },
					],
					defaultValue: 'default',
				}),
			}),
			{
				label: 'Leaderboard rows',
				itemLabel: (props: any) => props.fields.name.value || 'Player',
			},
		),
	},
})

export default config({
	storage: { kind: 'local' },
	ui: {
		navigation: ['config', 'gameHome'],
	},
	singletons: {
		gameHome,
		config: gameConfig,
	},
})
