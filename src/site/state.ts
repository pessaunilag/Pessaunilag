import type { Payload } from 'payload'
import { unstable_cache } from 'next/cache'
import { SITE_TAG } from '../collections/access'

/**
 * Builds the plain JSON "state" the public-site renderer expects from what is
 * stored in Payload. Shapes mirror the content model of the original site.
 */

type AnyDoc = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

const day = (v: unknown): string => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v) ? v.slice(0, 10) : '')
const yn = (v: unknown): string => (v ? 'Yes' : 'No')
const str = (v: unknown): string => (v == null ? '' : String(v))

/** Pick an image URL at a sensible size for the field. */
function pic(m: unknown, size: 'card' | 'large' = 'large'): string {
  if (!m || typeof m !== 'object') return ''
  const media = m as AnyDoc
  if (media.mimeType && !String(media.mimeType).startsWith('image/')) return str(media.url)
  const s = media.sizes || {}
  const u = (s[size] && s[size].url) || (s.large && s.large.url) || (s.card && s.card.url) || media.url || ''
  return str(u)
}
const deptName = (d: unknown): string => (d && typeof d === 'object' ? str((d as AnyDoc).name) : '')
const deptNames = (ds: unknown): string[] => (Array.isArray(ds) ? ds.map(deptName).filter(Boolean) : [])

const base = (d: AnyDoc) => ({ id: String(d.id) })

const MAP: Record<string, (d: AnyDoc) => AnyDoc> = {
  news: (d) => ({ ...base(d), title: str(d.title), date: day(d.date), category: str(d.category), cover: pic(d.cover), summary: str(d.summary), body: str(d.body), link: str(d.link), departments: deptNames(d.departments) }),
  spotlights: (d) => ({ ...base(d), kind: str(d.kind), category: str(d.category), period: str(d.period), periodLabel: str(d.periodLabel), date: day(d.date), name: str(d.name), department: deptName(d.department), level: str(d.level), photo: pic(d.photo, 'card'), citation: str(d.citation), handle: str(d.handle) }),
  events: (d) => ({ ...base(d), title: str(d.title), date: day(d.date), dateLabel: str(d.dateLabel), time: str(d.time), venue: str(d.venue), category: str(d.category), description: str(d.description), poster: pic(d.poster), link: str(d.link), departments: deptNames(d.departments) }),
  excos: (d) => ({ ...base(d), name: str(d.name), position: str(d.position), department: deptName(d.department), level: str(d.level), photo: pic(d.photo, 'card'), instagram: str(d.instagram), bio: str(d.bio) }),
  departments: (d) => ({ ...base(d), name: str(d.name), code: str(d.code), type: str(d.type), about: str(d.about), hod: str(d.hod), rep: str(d.rep), assoc: str(d.assoc), site: str(d.site), instagram: str(d.instagram), email: str(d.email), photo: pic(d.photo) }),
  gallery: (d) => ({ ...base(d), image: pic(d.image), caption: str(d.caption), event: str(d.event), date: day(d.date), departments: deptNames(d.departments) }),
  opportunities: (d) => ({ ...base(d), title: str(d.title), type: str(d.type), org: str(d.org), deadline: day(d.deadline), description: str(d.description), link: str(d.link) }),
  resources: (d) => ({ ...base(d), title: str(d.title), type: str(d.type), department: deptName(d.department) || 'All departments', level: str(d.level) || 'All levels', link: str(d.link) }),
  partners: (d) => ({ ...base(d), name: str(d.name), tier: str(d.tier), logo: pic(d.logo, 'card'), note: str(d.note), link: str(d.link) }),
  alumni: (d) => ({ ...base(d), name: str(d.name), year: str(d.year), department: deptName(d.department), role: str(d.role), photo: pic(d.photo, 'card'), linkedin: str(d.linkedin) }),
  faqs: (d) => ({ ...base(d), q: str(d.q), a: str(d.a) }),
  pastExcos: (d) => ({ ...base(d), session: str(d.session), admin: str(d.admin), name: str(d.name), position: str(d.position), order: d.order == null ? '' : String(d.order), department: deptName(d.department), photo: pic(d.photo, 'card'), note: str(d.note) }),
  reps: (d) => ({ ...base(d), name: str(d.name), role: str(d.role), department: deptName(d.department), level: str(d.level), committee: str(d.committee), photo: pic(d.photo, 'card'), instagram: str(d.instagram) }),
  announcements: (d) => ({ ...base(d), title: str(d.title), date: day(d.date), category: str(d.category), body: str(d.body), link: str(d.link), pinned: yn(d.pinned), departments: deptNames(d.departments) }),
  articles: (d) => ({ ...base(d), title: str(d.title), author: str(d.author), date: day(d.date), tags: str(d.tags), summary: str(d.summary), body: str(d.body), cover: pic(d.cover), departments: deptNames(d.departments) }),
  patrons: (d) => ({ ...base(d), name: str(d.name), role: str(d.role), group: str(d.group), department: deptName(d.department), photo: pic(d.photo, 'card'), note: str(d.note) }),
  research: (d) => ({ ...base(d), title: str(d.title), authors: str(d.authors), department: deptName(d.department), journal: str(d.journal), year: str(d.year), link: str(d.link) }),
  newsletters: (d) => ({ ...base(d), title: str(d.title), issue: str(d.issue), date: day(d.date), summary: str(d.summary), cover: pic(d.cover, 'card'), link: str(d.link) }),
  merch: (d) => ({ ...base(d), name: str(d.name), price: str(d.price), photo: pic(d.photo, 'card'), note: str(d.note), link: str(d.link), status: str(d.availability) }),
  tiers: (d) => ({ ...base(d), name: str(d.name), price: str(d.price), tag: str(d.tag), benefits: str(d.benefits), featured: yn(d.featured) }),
}

/** state key -> payload collection slug (+ sort for ordered lists) */
const DRAFTS = new Set(['news', 'events', 'spotlights', 'announcements', 'articles', 'newsletters', 'opportunities', 'merch', 'alumni'])
const SOURCES: Record<string, { slug: string; sort?: string }> = {
  news: { slug: 'news' }, spotlights: { slug: 'spotlights' }, events: { slug: 'events' },
  excos: { slug: 'excos', sort: '_order' }, departments: { slug: 'departments', sort: '_order' },
  gallery: { slug: 'gallery' }, opportunities: { slug: 'opportunities' }, resources: { slug: 'resources', sort: '_order' },
  partners: { slug: 'partners', sort: '_order' }, alumni: { slug: 'alumni', sort: '_order' }, faqs: { slug: 'faqs', sort: '_order' },
  pastExcos: { slug: 'past-excos' }, reps: { slug: 'reps', sort: '_order' }, announcements: { slug: 'announcements' },
  articles: { slug: 'articles' }, patrons: { slug: 'patrons', sort: '_order' }, research: { slug: 'research' },
  newsletters: { slug: 'newsletters' }, merch: { slug: 'merch', sort: '_order' }, tiers: { slug: 'tiers', sort: '_order' },
}

function settingsToState(s: AnyDoc): AnyDoc {
  const out: AnyDoc = {}
  for (const [k, v] of Object.entries(s || {})) {
    if (['id', 'createdAt', 'updatedAt', 'globalType'].includes(k)) continue
    if (k === 'contacts') { out.contacts = (Array.isArray(v) ? v : []).map((c: AnyDoc) => [c.name, c.role, c.phone].map(str).join(' | ')).join('\n'); continue }
    if (['logo', 'heroImage', 'glanceImage'].includes(k)) { out[k] = pic(v, k === 'logo' ? 'card' : 'large'); continue }
    out[k] = str(v)
  }
  return out
}

export async function buildState(payload: Payload): Promise<AnyDoc> {
  const state: AnyDoc = { v: 2, settings: {}, external: {} }
  const jobs = Object.entries(SOURCES).map(async ([key, src]) => {
    const r = await payload.find({ collection: src.slug as never, limit: 500, depth: 2, sort: src.sort, overrideAccess: true, pagination: false, where: DRAFTS.has(src.slug) ? { _status: { equals: 'published' } } : undefined })
    state[key] = (r.docs as AnyDoc[]).map(MAP[key])
  })
  jobs.push((async () => { state.settings = settingsToState(await payload.findGlobal({ slug: 'settings', depth: 1, overrideAccess: true })) })())
  jobs.push((async () => {
    const r = await payload.find({ collection: 'external-posts', where: { visible: { equals: true } }, limit: 200, depth: 1, sort: '-publishedAt', overrideAccess: true, pagination: false })
    for (const d of r.docs as AnyDoc[]) {
      const n = deptName(d.department); if (!n) continue
      ;(state.external[n] ||= []).push({ id: String(d.id), title: str(d.title), url: str(d.url), excerpt: str(d.excerpt), image: str(d.image), publishedAt: str(d.publishedAt), source: str(d.source) })
    }
  })())
  jobs.push((async () => {
    // Photos flagged "Also show in the Gallery" join the Gallery automatically
    const r = await payload.find({ collection: 'media', where: { addToGallery: { equals: true } }, limit: 500, depth: 0, sort: '-createdAt', overrideAccess: true, pagination: false })
    state._mediaGallery = (r.docs as AnyDoc[]).filter((m) => String(m.mimeType || '').startsWith('image/')).map((m) => ({ id: 'm' + m.id, image: pic(m), caption: str(m.galleryCaption || m.alt), event: str(m.galleryEvent), date: day(m.createdAt), departments: [] }))
  })())
  await Promise.all(jobs)
  const used = new Set((state.gallery as AnyDoc[]).map((g) => g.image))
  state.gallery = [...state.gallery, ...(state._mediaGallery as AnyDoc[]).filter((g) => g.image && !used.has(g.image))]
  delete state._mediaGallery
  return state
}

export const getSiteState = (payload: Payload) =>
  unstable_cache(() => buildState(payload), ['pessa-site-state'], { tags: [SITE_TAG], revalidate: 600 })()
