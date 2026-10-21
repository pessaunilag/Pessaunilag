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

export async function starterStatus(payload: Payload) {
  const [d, n, e, x] = await Promise.all(
    (['departments', 'news', 'events', 'excos'] as const).map((c) => payload.count({ collection: c, overrideAccess: true })),
  )
  const total = d.totalDocs + n.totalDocs + e.totalDocs + x.totalDocs
  return { empty: total === 0, available: fs.existsSync(path.join(SEED_DIR, 'state.json')), counts: { departments: d.totalDocs, news: n.totalDocs, events: e.totalDocs, excos: x.totalDocs } }
}

export async function importStarter(payload: Payload) {
  const state: AnyDoc = JSON.parse(fs.readFileSync(path.join(SEED_DIR, 'state.json'), 'utf8'))
  const mediaIds = new Map<string, number>()
  const log: string[] = []

  const media = async (ref: unknown, alt: string, gallery?: { caption?: string; event?: string }): Promise<number | null> => {
    if (typeof ref !== 'string' || !ref.startsWith('seed:')) return null
    const file = ref.slice(5)
    if (mediaIds.has(file)) return mediaIds.get(file)!
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

  // 1. Departments first (everything else points at them)
  const deptId = new Map<string, number>()
  for (const d of state.departments || []) {
    const doc = await payload.create({
      collection: 'departments',
      overrideAccess: true,
      data: { name: s(d.name), code: s(d.code), type: d.type === 'Sub-department' ? 'Sub-department' : 'Department', about: s(d.about), hod: s(d.hod), rep: s(d.rep), assoc: s(d.assoc), site: s(d.site), instagram: s(d.instagram), email: s(d.email), photo: await media(d.photo, s(d.name)) },
    })
    deptId.set(s(d.name), doc.id)
  }
  const dept = (name: unknown) => (name && deptId.get(s(name))) || null
  const depts = (names: unknown) => (Array.isArray(names) ? names.map(dept).filter(Boolean) : [])

  // 2. Settings
  const S = state.settings || {}
  const contacts = s(S.contacts).split('\n').map((l) => l.split('|').map((x) => x.trim())).filter((a) => a[0]).map((a) => ({ name: a[0], role: a[1] || '', phone: a[2] || '' }))
  const settingsData: AnyDoc = { contacts }
  for (const k of ['name', 'short', 'faculty', 'university', 'admin', 'session', 'founded', 'announcement', 'announcementLink', 'heroLine1', 'heroLine2', 'heroSub', 'presidentQuote', 'about', 'vision', 'mission', 'waNumber', 'email', 'address', 'waCommunity', 'instagram', 'linkedin', 'linkedinName', 'x', 'tiktok', 'suggestionForm', 'nominationForm', 'alumniForm', 'contactForm', 'partnerDeck', 'deckStudents', 'deckIntake', 'deckAges', 'deckReach', 'deckEmail']) settingsData[k] = s(S[k])
  settingsData.logo = await media(S.logo, 'PESSA logo')
  settingsData.heroImage = await media(S.heroImage, 'Home page photo', { caption: 'Faculty of Physical and Earth Sciences' })
  settingsData.glanceImage = await media(S.glanceImage, 'Numbers band photo')
  await payload.updateGlobal({ slug: 'settings', data: settingsData, overrideAccess: true })

  // 3. Everything else
  const put = async (collection: string, items: AnyDoc[] | undefined, map: (i: AnyDoc) => Promise<AnyDoc>, published = false) => {
    let n = 0
    for (const it of items || []) {
      try {
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

  await put('news', state.news, async (i) => ({ title: s(i.title), date: day(i.date), category: s(i.category) || undefined, cover: await media(i.cover, s(i.title), { caption: s(i.title) }), summary: s(i.summary), body: s(i.body), link: s(i.link), departments: depts(i.departments) }), true)
  await put('events', state.events, async (i) => ({ title: s(i.title), date: day(i.date), dateLabel: s(i.dateLabel), time: s(i.time), venue: s(i.venue), category: s(i.category) || 'Other', description: s(i.description), poster: await media(i.poster, s(i.title), { caption: s(i.title), event: s(i.title) }), link: s(i.link), departments: depts(i.departments) }), true)
  await put('spotlights', state.spotlights, async (i) => ({ kind: s(i.kind) || 'Student', category: s(i.category) || undefined, period: s(i.period) || 'Week', periodLabel: s(i.periodLabel), date: day(i.date), name: s(i.name), department: dept(i.department), level: s(i.level) || undefined, photo: await media(i.photo, s(i.name), { caption: s(i.name) }), citation: s(i.citation), handle: s(i.handle) }), true)
  await put('announcements', state.announcements, async (i) => ({ title: s(i.title), date: day(i.date), category: s(i.category) || undefined, body: s(i.body), link: s(i.link), pinned: yes(i.pinned), departments: depts(i.departments) }), true)
  await put('articles', state.articles, async (i) => ({ title: s(i.title), author: s(i.author), date: day(i.date), tags: s(i.tags), summary: s(i.summary), body: s(i.body), cover: await media(i.cover, s(i.title), { caption: s(i.title) }) }), true)
  await put('newsletters', state.newsletters, async (i) => ({ title: s(i.title), issue: s(i.issue), date: day(i.date), summary: s(i.summary), cover: await media(i.cover, s(i.title)), link: s(i.link) }), true)
  await put('opportunities', state.opportunities, async (i) => ({ title: s(i.title), type: s(i.type) || 'Internship', org: s(i.org), deadline: day(i.deadline), description: s(i.description), link: s(i.link) }), true)
  await put('merch', state.merch, async (i) => ({ name: s(i.name), price: s(i.price), photo: await media(i.photo, s(i.name)), note: s(i.note), link: s(i.link), availability: s(i.status) || 'Available' }), true)
  await put('alumni', state.alumni, async (i) => ({ name: s(i.name), year: s(i.year), department: dept(i.department), role: s(i.role), photo: await media(i.photo, s(i.name)), linkedin: s(i.linkedin) }), true)
  await put('gallery', state.gallery, async (i) => ({ image: await media(i.image, s(i.caption) || 'Gallery photo'), caption: s(i.caption), event: s(i.event), date: day(i.date) }))
  await put('excos', state.excos, async (i) => ({ name: s(i.name), position: s(i.position), department: dept(i.department), level: s(i.level) || undefined, photo: await media(i.photo, s(i.name), { caption: `${s(i.name)}, ${s(i.position)}` }), instagram: s(i.instagram), bio: s(i.bio) }))
  await put('past-excos', state.pastExcos, async (i) => ({ session: s(i.session), admin: s(i.admin), name: s(i.name), position: s(i.position), order: i.order ? Number(i.order) || undefined : undefined, department: dept(i.department), photo: await media(i.photo, s(i.name), { caption: `${s(i.name)}, ${s(i.position)} (${s(i.session)})` }), note: s(i.note) }))
  await put('reps', state.reps, async (i) => ({ name: s(i.name), role: s(i.role) || 'Member', department: dept(i.department), level: s(i.level) || undefined, committee: s(i.committee), photo: await media(i.photo, s(i.name)), instagram: s(i.instagram) }))
  await put('patrons', state.patrons, async (i) => ({ name: s(i.name), role: s(i.role), group: s(i.group) || 'Lecturer', department: dept(i.department), photo: await media(i.photo, s(i.name)), note: s(i.note) }))
  await put('resources', state.resources, async (i) => ({ title: s(i.title), type: s(i.type) || 'Other', department: i.department === 'All departments' ? null : dept(i.department), level: s(i.level) || 'All levels', link: s(i.link) }))
  await put('research', state.research, async (i) => ({ title: s(i.title), authors: s(i.authors), department: dept(i.department), journal: s(i.journal), year: s(i.year), link: s(i.link) }))
  await put('partners', state.partners, async (i) => ({ name: s(i.name), tier: s(i.tier) || 'Programme Partner', logo: await media(i.logo, s(i.name)), note: s(i.note), link: s(i.link) }))
  await put('tiers', state.tiers, async (i) => ({ name: s(i.name), price: s(i.price), tag: s(i.tag), benefits: s(i.benefits), featured: yes(i.featured) }))
  await put('faqs', state.faqs, async (i) => ({ q: s(i.q), a: s(i.a) }))

  return { media: mediaIds.size, log }
}
