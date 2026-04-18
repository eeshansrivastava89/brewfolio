import { afterEach, describe, expect, it, vi } from 'vitest'

import { fetchIpynb, transformGithubUrl } from '../../brewfolio/src/lib/notebook-loader'

describe('notebook-loader', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('transforms github blob urls into raw urls', () => {
    expect(
      transformGithubUrl('https://github.com/openai/repo/blob/main/notebook.ipynb'),
    ).toBe('https://raw.githubusercontent.com/openai/repo/main/notebook.ipynb')
  })

  it('leaves raw github urls untouched', () => {
    const raw = 'https://raw.githubusercontent.com/openai/repo/main/notebook.ipynb'
    expect(transformGithubUrl(raw)).toBe(raw)
  })

  it('leaves non-github urls untouched', () => {
    const url = 'https://example.com/notebook.ipynb'
    expect(transformGithubUrl(url)).toBe(url)
  })

  it('fetches notebook json from the transformed url', async () => {
    const payload = { cells: [] }
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      fetchIpynb('https://github.com/openai/repo/blob/main/notebook.ipynb'),
    ).resolves.toEqual(payload)

    expect(fetchMock).toHaveBeenCalledWith(
      'https://raw.githubusercontent.com/openai/repo/main/notebook.ipynb',
    )
  })

  it('throws a useful error when github fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      }),
    )

    await expect(fetchIpynb('https://example.com/missing.ipynb')).rejects.toThrow(
      '[notebooks] Failed to fetch notebook from GitHub: 404 Not Found',
    )
  })
})
