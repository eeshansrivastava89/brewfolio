export interface TocEntry {
	id: string
	text: string
	level: 2 | 3
}

function decodeEntities(text: string): string {
	const entities: Record<string, string> = {
		'&amp;': '&',
		'&lt;': '<',
		'&gt;': '>',
		'&quot;': '"',
		'&#39;': "'",
		'&apos;': "'",
		'&nbsp;': ' ',
	}

	return text.replace(/&[^;]+;/g, (entity) => {
		if (entities[entity]) return entities[entity]
		const numMatch = entity.match(/^&#(\d+);$/)
		if (numMatch) return String.fromCodePoint(Number(numMatch[1]))
		const hexMatch = entity.match(/^&#x([0-9a-fA-F]+);$/)
		if (hexMatch) return String.fromCodePoint(parseInt(hexMatch[1], 16))
		return entity
	})
}

export function extractToc(html: string): { toc: TocEntry[]; html: string } {
	const toc: TocEntry[] = []
	const usedIds = new Set<string>()

	const processed = html.replace(
		/<(h[23])([^>]*)>([\s\S]*?)<\/\1>/gi,
		(match, tag, attrs, content) => {
			const level = Number.parseInt(tag[1], 10) as 2 | 3
			const text = decodeEntities(content.replace(/<[^>]*>/g, '').trim())
			if (!text) return match

			let id = text
				.toLowerCase()
				.replace(/[^a-z0-9\s-]/g, '')
				.replace(/\s+/g, '-')
				.replace(/-+/g, '-')
				.replace(/^-|-$/g, '')
				.slice(0, 60)

			if (usedIds.has(id)) {
				let i = 2
				while (usedIds.has(`${id}-${i}`)) i++
				id = `${id}-${i}`
			}
			usedIds.add(id)
			toc.push({ id, text, level })

			if (attrs.includes('id=')) return match
			return `<${tag}${attrs} id="${id}">${content}</${tag}>`
		},
	)

	return { toc, html: processed }
}
