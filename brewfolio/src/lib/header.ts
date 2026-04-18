export interface HeaderConfig {
	siteName: string
	showClockWeather: boolean
	cityName: string
	timezone?: string
	latitude?: number
	longitude?: number
}

type ResolveHeaderConfigInput = {
	siteName?: string | null
	city?: string | null
	country?: string | null
}

type HeaderLocation = {
	cityName: string
	latitude: number
	longitude: number
	timezone: string
}

const geocodeCache = new Map<string, Promise<HeaderLocation | null>>()

export async function resolveHeaderConfig({
	siteName = '',
	city = '',
	country = '',
}: ResolveHeaderConfigInput): Promise<HeaderConfig> {
	const trimmedSiteName = String(siteName || '').trim()
	const trimmedCity = String(city || '').trim()
	const trimmedCountry = String(country || '').trim()

	if (!trimmedCity) {
		return {
			siteName: trimmedSiteName,
			showClockWeather: false,
			cityName: '',
			timezone: undefined,
			latitude: undefined,
			longitude: undefined,
		}
	}

	const cacheKey = `${trimmedCity.toLowerCase()}::${trimmedCountry.toLowerCase()}`
	if (!geocodeCache.has(cacheKey)) {
		geocodeCache.set(cacheKey, resolveHeaderLocation(trimmedCity, trimmedCountry))
	}

	const location = await geocodeCache.get(cacheKey)!
	if (!location) {
		return {
			siteName: trimmedSiteName,
			showClockWeather: false,
			cityName: trimmedCity,
			timezone: undefined,
			latitude: undefined,
			longitude: undefined,
		}
	}

	return {
		siteName: trimmedSiteName,
		showClockWeather: true,
		cityName: location.cityName,
		timezone: location.timezone,
		latitude: location.latitude,
		longitude: location.longitude,
	}
}

async function resolveHeaderLocation(city: string, country: string): Promise<HeaderLocation | null> {
	try {
		const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=5&language=en&format=json`
		const response = await fetch(url)
		if (!response.ok) throw new Error(`Geocoding failed: ${response.status}`)
		const data = await response.json()
		const results = Array.isArray(data?.results) ? data.results : []
		const match = country
			? results.find((entry: any) => String(entry?.country || '').toLowerCase() === country.toLowerCase()) || results[0]
			: results[0]

		if (!match) throw new Error(`No geocoding match for "${city}"`)

		const latitude = Number(match.latitude)
		const longitude = Number(match.longitude)
		const timezone = String(match.timezone || '')
		if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !timezone) {
			return null
		}

		return {
			cityName: String(match.name || city),
			latitude,
			longitude,
			timezone,
		}
	} catch {
		return null
	}
}
