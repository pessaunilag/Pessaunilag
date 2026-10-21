import fs from 'node:fs'
import path from 'node:path'
import type { Payload } from 'payload'

/**
 * Imports the content of the original PESSA site (seed/state.json + seed/images)
 * into the database. Runs once, from the admin, while the site is still empty.
 */

type AnyDoc = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

const SEED_DIR = path.join(process.cwd(), 'seed')
const MIME: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' }

const STEPS = ['settings', 'departments', 'news', 'events', 'gallery', 'people', 'academics', 'partners', 'rest'] as const
export type Step = (typeof STEPS)[number]

function loadState(): AnyDoc {
  return JSON.parse(fs.readFileSync(path.join(SEED_DIR, 'state.json'), 'utf8'))
}

/** How much of the starter content is already in the database. */
export async function starterStatus(payload: Payload) {
  const available = fs.existsSync(path.join(SEED_DIR, 'state.json'))
  if (!available) return { available: false, complete: true, steps: STEPS, expected: {}, counts: {} }
  const state = loadState()
  const map: Record<string, string> = { news: 'news', events: 'events', gallery: 'gallery', excos: 'excos', pastExcos: 'past-excos', patrons: 'patrons', departments: 'departments', partners: 'partners', tiers: 'tiers', faqs: 'faqs', announcements: 'announcements' }
  const expected: Record<string, number> = {}
  const counts: Record<string, number> = {}
  for (const [k, slug] of Object.entries(map)) {
    expected[slug] = (state[k] || []).length
    counts[slug] = (await payload.count({ collection: slug as never, overrideAccess: true })).totalDocs
  }
  const media = (await payload.count({ collection: 'media', overrideAccess: true })).totalDocs
  const complete = Object.keys(expected).every((k) => counts[k] >= expected[k]) && media >= 30
  return { available, complete, steps: STEPS, expected, counts: { ...counts, media } }
}

/**
 * Imports one step of the starter content. Safe to run again: anything that already
 * exists (matched by name or title) is skipped, so a run that was cut short simply resumes.
 */
export async function importStarter(payload: Payload, step: Step = 'settings') {
  const state: AnyDoc = loadState()
  const mediaIds = new Map<string, number>()
  const log: string[] = []
  const stepIndex = STEPS.indexOf(step)
  if (stepIndex < 0) throw new Error('Unknown step')
  const next = STEPS[stepIndex + 1] || null

  const media = async (ref: unknown, alt: string, gallery?: { caption?: string; event?: string }): Promise<number | null> => {
    if (typeof ref !== 'string' || !ref.startsWith('seed:')) return null
    const file = ref.slice(5)
    if (mediaIds.has(file)) return mediaIds.get(file)!
    // Already uploaded in an earlier run? (Payload stores it under the same name, converted to .webp)
    const base = file.replace(/\.[a-z0-9]+$/i, '')
    const found = await payload.find({ collection: 'media', where: { filename: { like: base } }, limit: 1, depth: 0, overrideAccess: true })
    if (found.docs[0]) { mediaIds.set(file, found.docs[0].id); return found.docs[0].id }
    const full = path.join(SEED_DIR, 'images', file)
    if (!fs.existsSync(full)) { log.push(`missing image ${file}`); return null }
    const data = fs.readFileSync(full)
    const ext = file.split('.').pop()!.toLowerCase()
    const doc = await payload.create({
      collection: 'media',
      data: { alt, addToGallery: Boolean(gallery), galleryCaption: gallery?.caption || '', galleryEvent: gallery?.event || '' },
      file: { data, mimetype: MIME[ext] || 'application/octet-stream', name: file, size: data.length },
      overrideAccess: true,
    })
    mediaIds.set(file, doc.id)
    return doc.id
  }

  const day = (v: unknown) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? `${v}T12:00:00.000Z` : undefined)
  const yes = (v: unknown) => v === 'Yes' || v === true
  const s = (v: unknown) => (v == null ? '' : String(v))

  const exists = async (collection: string, field: string, value: string) => {
    if (!value) return false
    const r = await payload.find({ collection: collection as never, where: { [field]: { equals: value } }, limit: 1, depth: 0, overrideAccess: true, draft: true })
    return r.docs.length > 0
  }

  // Departments (everything else points at them)
  const deptId = new Map<string, number>()
  const existingDepts = await payload.find({ collection: 'departments', limit: 100, depth: 0, overrideAccess: true })
  for (const d of existingDepts.docs) deptId.set(s(d.name), d.id)
  if (step === 'departments') {
    let n = 0
    for (const d of state.departments || []) {
      if (deptId.has(s(d.name))) continue
      const doc = await payload.create({
        collection: 'departments',
        overrideAccess: true,
        data: { name: s(d.name), code: s(d.code), type: d.type === 'Sub-department' ? 'Sub-department' : 'Department', about: s(d.about), hod: s(d.hod), rep: s(d.rep), assoc: s(d.assoc), site: s(d.site), instagram: s(d.instagram), email: s(d.email), photo: await media(d.photo, s(d.name)) },
      })
      deptId.set(s(d.name), doc.id)
      n++
    }
    log.push(`departments: ${n} imported`)
    return { step, next, media: mediaIds.size, log }
  }
  const dept = (name: unknown) => (name && deptId.get(s(name))) || null
  const depts = (names: unknown) => (Array.isArray(names) ? names.map(dept).filter(Boolean) : [])

  if (step === 'settings') {
  const S = state.settings || {}
  const contacts = s(S.contacts).split('\n').map((l) => l.split('|').map((x) => x.trim())).filter((a) => a[0]).map((a) => ({ name: a[0], role: a[1] || '', phone: a[2] || '' }))
  const settingsData: AnyDoc = { contacts }
  for (const k of ['name', 'short', 'faculty', 'university', 'admin', 'session', 'founded', 'announcement', 'announcementLink', 'heroLine1', 'heroLine2', 'heroSub', 'presidentQuote', 'about', 'vision', 'mission', 'waNumber', 'email', 'address', 'waCommunity', 'instagram', 'linkedin', 'linkedinName', 'x', 'tiktok', 'suggestionForm', 'nominationForm', 'alumniForm', 'contactForm', 'partnerDeck', 'deckStudents', 'deckIntake', 'deckAges', 'deckReach', 'deckEmail']) settingsData[k] = s(S[k])
  settingsData.logo = await media(S.logo, 'PESSA logo')
  settingsData.heroImage = await media(S.heroImage, 'Home page photo', { caption: 'Faculty of Physical and Earth Sciences' })
  settingsData.glanceImage = await media(S.glanceImage, 'Numbers band photo')
  await payload.updateGlobal({ slug: 'settings', data: settingsData, overrideAccess: true })
  log.push('settings: imported')
  return { step, next, media: mediaIds.size, log }
  }

  // Everything else, one group per step
  const put = async (collection: string, items: AnyDoc[] | undefined, map: (i: AnyDoc) => Promise<AnyDoc>, published = false, key = 'title') => {
    let n = 0
    for (const it of items || []) {
      try {
        if (await exists(collection, key, s(it[key]))) continue
        const data = await map(it)
        if (published) data._status = 'published'
        await payload.create({ collection: collection as never, data: data as never, overrideAccess: true, draft: false })
        n++
      } catch (e) {
        log.push(`${collection}: ${(e as Error).message}`)
      }
    }
    log.push(`${collection}: ${n} imported`)
  }

  if (step === 'news') {
  await put('news', state.news, async (i) => ({ title: s(i.title), date: day(i.date), category: s(i.category) || undefined, cover: await media(i.cover, s(i.title), { caption: s(i.title) }), summary: s(i.summary), body: s(i.body), link: s(i.link), departments: depts(i.departments) }), true)
  }
  if (step === 'events') {
  await put('events', state.events, async (i) => ({ title: s(i.title), date: day(i.date), dateLabel: s(i.dateLabel), time: s(i.time), venue: s(i.venue), category: s(i.category) || 'Other', description: s(i.description), poster: await media(i.poster, s(i.title), { caption: s(i.title), event: s(i.title) }), link: s(i.link), departments: depts(i.departments) }), true)
  }
  if (step === 'gallery') {
  await put('gallery', state.gallery, async (i) => ({ image: await media(i.image, s(i.caption) || 'Gallery photo'), caption: s(i.caption), event: s(i.event), date: day(i.date) }), false, 'caption')
  }
  if (step === 'people') {
  await put('excos', state.excos, async (i) => ({ name: s(i.name), position: s(i.position), department: dept(i.department), level: s(i.level) || undefined, photo: await media(i.photo, s(i.name), { caption: `${s(i.name)}, ${s(i.position)}` }), instagram: s(i.instagram), bio: s(i.bio) }), false, 'name')
  await put('past-excos', state.pastExcos, async (i) => ({ session: s(i.session), admin: s(i.admin), name: s(i.name), position: s(i.position), order: i.order ? Number(i.order) || undefined : undefined, department: dept(i.department), photo: await media(i.photo, s(i.name), { caption: `${s(i.name)}, ${s(i.position)} (${s(i.session)})` }), note: s(i.note) }), false, 'name')
  await put('reps', state.reps, async (i) => ({ name: s(i.name), role: s(i.role) || 'Member', department: dept(i.department), level: s(i.level) || undefined, committee: s(i.committee), photo: await media(i.photo, s(i.name)), instagram: s(i.instagram) }), false, 'name')
  await put('patrons', state.patrons, async (i) => ({ name: s(i.name), role: s(i.role), group: s(i.group) || 'Lecturer', department: dept(i.department), photo: await media(i.photo, s(i.name)), note: s(i.note) }), false, 'name')
  }
  if (step === 'academics') {
  await put('announcements', state.announcements, async (i) => ({ title: s(i.title), date: day(i.date), category: s(i.category) || undefined, body: s(i.body), link: s(i.link), pinned: yes(i.pinned), departments: depts(i.departments) }), true)
  await put('resources', state.resources, async (i) => ({ title: s(i.title), type: s(i.type) || 'Other', department: i.department === 'All departments' ? null : dept(i.department), level: s(i.level) || 'All levels', link: s(i.link) }))
  await put('research', state.research, async (i) => ({ title: s(i.title), authors: s(i.authors), department: dept(i.department), journal: s(i.journal), year: s(i.year), link: s(i.link) }))
  await put('spotlights', state.spotlights, async (i) => ({ kind: s(i.kind) || 'Student', category: s(i.category) || undefined, period: s(i.period) || 'Week', periodLabel: s(i.periodLabel), date: day(i.date), name: s(i.name), department: dept(i.department), level: s(i.level) || undefined, photo: await media(i.photo, s(i.name), { caption: s(i.name) }), citation: s(i.citation), handle: s(i.handle) }), true, 'name')
  await put('articles', state.articles, async (i) => ({ title: s(i.title), author: s(i.author), date: day(i.date), tags: s(i.tags), summary: s(i.summary), body: s(i.body), cover: await media(i.cover, s(i.title), { caption: s(i.title) }) }), true)
  await put('newsletters', state.newsletters, async (i) => ({ title: s(i.title), issue: s(i.issue), date: day(i.date), summary: s(i.summary), cover: await media(i.cover, s(i.title)), link: s(i.link) }), true)
  await put('opportunities', state.opportunities, async (i) => ({ title: s(i.title), type: s(i.type) || 'Internship', org: s(i.org), deadline: day(i.deadline), description: s(i.description), link: s(i.link) }), true)
  }
  if (step === 'partners') {
  await put('partners', state.partners, async (i) => ({ name: s(i.name), tier: s(i.tier) || 'Programme Partner', logo: await media(i.logo, s(i.name)), note: s(i.note), link: s(i.link) }), false, 'name')
  await put('tiers', state.tiers, async (i) => ({ name: s(i.name), price: s(i.price), tag: s(i.tag), benefits: s(i.benefits), featured: yes(i.featured) }), false, 'name')
  await put('alumni', state.alumni, async (i) => ({ name: s(i.name), year: s(i.year), department: dept(i.department), role: s(i.role), photo: await media(i.photo, s(i.name)), linkedin: s(i.linkedin) }), true, 'name')
  }
  if (step === 'rest') {
  await put('merch', state.merch, async (i) => ({ name: s(i.name), price: s(i.price), photo: await media(i.photo, s(i.name)), note: s(i.note), link: s(i.link), availability: s(i.status) || 'Available' }), true, 'name')
  await put('faqs', state.faqs, async (i) => ({ q: s(i.q), a: s(i.a) }), false, 'q')
  }
  return { step, next, media: mediaIds.size, log }

}
