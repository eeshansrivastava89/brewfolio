import { describe, expect, it } from 'vitest'
import { extractToc } from '../../brewfolio/src/lib/toc'

describe('extractToc', () => {
  it('extracts h2 and h3 entries and injects ids when missing', () => {
    const input = '<h2>Intro &amp; setup</h2><p>Body</p><h3>Step one</h3>'
    const { toc, html } = extractToc(input)

    expect(toc).toEqual([
      { id: 'intro-setup', text: 'Intro & setup', level: 2 },
      { id: 'step-one', text: 'Step one', level: 3 },
    ])
    expect(html).toContain('id="intro-setup"')
    expect(html).toContain('id="step-one"')
  })

  it('handles duplicate headings and leaves existing ids alone', () => {
    const input = '<h2 id="keep-me">Repeat</h2><h2>Repeat</h2><h3>Repeat</h3>'
    const { toc, html } = extractToc(input)

    expect(toc).toEqual([
      { id: 'repeat', text: 'Repeat', level: 2 },
      { id: 'repeat-2', text: 'Repeat', level: 2 },
      { id: 'repeat-3', text: 'Repeat', level: 3 },
    ])
    expect(html).toContain('<h2 id="keep-me">Repeat</h2>')
    expect(html).toContain('id="repeat-2"')
    expect(html).toContain('id="repeat-3"')
  })

  it('ignores empty headings and decodes numeric entities', () => {
    const input = '<h2><span></span></h2><h3>Title &#38; more &#x26; &bogus;</h3>'
    const { toc } = extractToc(input)
    expect(toc).toEqual([
      { id: 'title-more-bogus', text: 'Title & more & &bogus;', level: 3 },
    ])
  })
})
