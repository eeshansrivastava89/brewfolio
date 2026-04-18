import { config, fields, singleton } from '@keystatic/core'

const gameConfig = singleton({
	label: 'Config',
	path: 'src/data/site-config',
	schema: {
		siteTitle: fields.text({
			label: 'Site title',
			validation: { isRequired: true },
		}),
	},
})

const gameHome = singleton({
	label: 'Game home',
	path: 'src/data/game-home',
	schema: {
		roundTitle: fields.text({
			label: 'Round title',
			validation: { isRequired: true },
		}),
		subtitle: fields.text({
			label: 'Subtitle',
			multiline: true,
		}),
		scoreLabel: fields.text({
			label: 'Score label',
			validation: { isRequired: true },
		}),
		scoreValue: fields.text({
			label: 'Score value',
			validation: { isRequired: true },
		}),
		previousScoreValue: fields.text({
			label: 'Previous score value',
			validation: { isRequired: true },
		}),
		timerVariant: fields.select({
			label: 'Timer variant',
			options: [
				{ label: 'Countdown', value: 'countdown' },
				{ label: 'Count up', value: 'countup' },
			],
			defaultValue: 'countdown',
		}),
		timerTotalMs: fields.text({
			label: 'Timer total milliseconds',
			validation: { isRequired: true },
		}),
		questionTitle: fields.text({
			label: 'Question heading',
			validation: { isRequired: true },
		}),
		questionPrompt: fields.text({
			label: 'Question prompt',
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
					validation: { isRequired: true },
				}),
				name: fields.text({
					label: 'Name',
					validation: { isRequired: true },
				}),
				score: fields.text({
					label: 'Score',
					validation: { isRequired: true },
				}),
				delta: fields.text({ label: 'Delta' }),
				isCurrentUser: fields.checkbox({
					label: 'Current user',
					defaultValue: false,
				}),
				variant: fields.select({
					label: 'Variant',
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
				label: 'Leaderboard entries',
				itemLabel: (props: any) => props.fields.name.value || 'Entry',
			},
		),
	},
})

export default config({
	storage: { kind: 'local' },
	ui: {
		navigation: ['gameHome', 'config'],
	},
	singletons: {
		gameHome,
		config: gameConfig,
	},
})
