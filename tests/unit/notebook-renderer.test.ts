import { describe, expect, it } from 'vitest'

import { escapeHtml, renderNotebook, type Ipynb } from '../../brewfolio/src/lib/notebook-renderer'

describe('notebook-renderer', () => {
  it('escapes html safely', () => {
    expect(escapeHtml(`"<tag>'&`)).toBe('&quot;&lt;tag&gt;&#39;&amp;')
  })

  it('renders markdown, code, raw cells, and all supported output types', () => {
    const notebook: Ipynb = {
      metadata: { kernelspec: { language: 'python' } },
      cells: [
        {
          cell_type: 'markdown',
          source: ['## Heading\n\nBody text'],
        },
        {
          cell_type: 'code',
          source: ['print("hello")'],
          outputs: [
            { output_type: 'stream', text: 'line one\n' },
            {
              output_type: 'error',
              traceback: ['\u001b[31mValueError\u001b[0m: bad input'],
            },
            {
              output_type: 'display_data',
              data: { 'text/html': '<table><tr><td>html</td></tr></table>' },
            },
            {
              output_type: 'display_data',
              data: { 'image/png': 'YmFzZTY0' },
            },
            {
              output_type: 'display_data',
              data: { 'image/jpeg': 'anBlZw==' },
            },
            {
              output_type: 'display_data',
              data: { 'image/svg+xml': '<svg></svg>' },
            },
            {
              output_type: 'execute_result',
              data: { 'text/plain': ['plain output'] },
            },
            {
              output_type: 'display_data',
              data: { 'application/json': ['ignored'] },
            },
          ],
        },
        {
          cell_type: 'raw',
          source: '<raw>',
        },
      ],
    }

    const html = renderNotebook(notebook)

    expect(html).toContain('<div class="notebook">')
    expect(html).toContain('<h2>Heading</h2>')
    expect(html).toContain('class="nb-input language-python"')
    expect(html).toContain('class="nb-output nb-stream"')
    expect(html).toContain('ValueError: bad input')
    expect(html).toContain('<table><tr><td>html</td></tr></table>')
    expect(html).toContain('src="data:image/png;base64,YmFzZTY0"')
    expect(html).toContain('src="data:image/jpeg;base64,anBlZw=="')
    expect(html).toContain('<div class="nb-output nb-image"><svg></svg></div>')
    expect(html).toContain('class="nb-output nb-text"')
    expect(html).toContain('<pre class="nb-cell nb-raw">&lt;raw&gt;</pre>')
  })

  it('falls back to escaped code when the language grammar is unknown', () => {
    const notebook: Ipynb = {
      metadata: { kernelspec: { language: 'unknown-language' } },
      cells: [
        {
          cell_type: 'code',
          source: '<script>alert(1)</script>',
        },
      ],
    }

    const html = renderNotebook(notebook)
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
  })

  it('covers fallback notebook branches with missing metadata and empty outputs', () => {
    const notebook: Ipynb = {
      cells: [
        {
          cell_type: 'markdown',
          source: undefined,
        },
        {
          cell_type: 'code',
          source: undefined,
          outputs: [
            {
              output_type: 'error',
            },
            {
              output_type: 'execute_result',
            },
          ],
        },
      ],
    }

    const html = renderNotebook(notebook)
    expect(html).toContain('language-python')
    expect(html).toContain('<div class="nb-cell nb-markdown"></div>')
    expect(html).toContain('<pre class="nb-output nb-error"></pre>')
    expect(html).not.toContain('nb-outputs"></div></div>')
  })
})
