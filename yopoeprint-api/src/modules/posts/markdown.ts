// Markdown → HTML pour les articles du blog, sans dépendance.
// Tout le texte est échappé AVANT la mise en forme : aucun HTML saisi dans l'admin n'arrive tel quel
// sur la boutique (qui affiche le résultat avec dangerouslySetInnerHTML).
//
// Pris en charge : ## et ### (titres), paragraphes, **gras**, *italique*, [lien](url),
// listes « - » et « 1. », citations « > », séparateur « --- ».

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

// Liens : chemins internes ou http(s) uniquement (pas de javascript:, data:…)
const SAFE_URL = /^(\/(?!\/)[^\s]*|https?:\/\/[^\s]+)$/i

function inline(text: string): string {
  let s = escapeHtml(text)
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label, url) => {
    const raw = url.replace(/&amp;/g, '&')
    if (!SAFE_URL.test(raw)) return label
    const external = /^https?:/i.test(raw)
    return `<a href="${url}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${label}</a>`
  })
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, '$1<em>$2</em>')
  return s
}

export function renderMarkdown(md: string): string {
  const lines = (md || '').replace(/\r\n?/g, '\n').split('\n')
  const out: string[] = []
  let paragraph: string[] = []
  let list: { tag: 'ul' | 'ol'; items: string[] } | null = null
  let quote: string[] = []

  const flushParagraph = () => {
    if (paragraph.length) out.push(`<p>${inline(paragraph.join(' '))}</p>`)
    paragraph = []
  }
  const flushList = () => {
    if (list) out.push(`<${list.tag}>${list.items.map((i) => `<li>${inline(i)}</li>`).join('')}</${list.tag}>`)
    list = null
  }
  const flushQuote = () => {
    if (quote.length) out.push(`<blockquote>${inline(quote.join(' '))}</blockquote>`)
    quote = []
  }
  const flushAll = () => { flushParagraph(); flushList(); flushQuote() }

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) { flushAll(); continue }

    const heading = /^(#{1,3})\s+(.+)$/.exec(line)
    if (heading) {
      flushAll()
      // Le titre de l'article est le seul h1 de la page : # et ## deviennent h2, ### devient h3
      const level = heading[1].length === 3 ? 3 : 2
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`)
      continue
    }
    if (/^(-{3,}|\*{3,})$/.test(line)) { flushAll(); out.push('<hr />'); continue }

    const bullet = /^[-*]\s+(.+)$/.exec(line)
    const numbered = /^\d+[.)]\s+(.+)$/.exec(line)
    if (bullet || numbered) {
      flushParagraph(); flushQuote()
      const tag = bullet ? 'ul' : 'ol'
      if (list && list.tag !== tag) flushList()
      if (!list) list = { tag, items: [] }
      list.items.push((bullet || numbered)![1])
      continue
    }

    const q = /^>\s?(.*)$/.exec(line)
    if (q) { flushParagraph(); flushList(); quote.push(q[1]); continue }

    flushList(); flushQuote()
    paragraph.push(line)
  }
  flushAll()
  return out.join('\n')
}

/** Durée de lecture estimée (200 mots par minute, 1 minute au minimum). */
export function readMinutes(md: string): number {
  const words = (md || '').replace(/[#*>\-[\]()`]/g, ' ').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}
