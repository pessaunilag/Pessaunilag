import * as cheerio from 'cheerio'
import type { Payload } from 'payload'
import { revalidateSite } from '../collections/access'

/**
 * Pulls the latest posts from a departmental association website and stores
 * them as "external-posts". Works without any cooperation from the other site:
 * it reads RSS/Atom feeds when they exist, otherwise it scans the pages for
 * article-like links and reads each page's Open Graph tags.
 */

const UA = 'Mozilla/5.0 (compatible; PESSA-UNILAG-site/1.0; +https://pessaunilag.vercel.app)'
const TIMEOUT = 12000
const MAX_POSTS = 12
const SKIP = /\/(tag|tags|category|categories|author|page|search|login|signin|signup|register|cart|checkout|account|wp-admin|feed|rss|privacy|terms|contact|about|faq|gallery|team|executives|excos|merch|shop|tools|calculator)(\/|$|\?)|\.(pdf|jpg|jpeg|png|gif|webp|svg|zip|mp4|css|js)$/i
const LISTING_HINTS = ['', '/news', '/blog', '/announcements', '/posts', '/articles', '/updates', '/community', '/journal', '/events']

type Found = { url: string; title: string; excerpt?: string; image?: string; publishedAt?: string }

async function get(url: string): Promise<{ text: string; type: string } | null> {
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), TIMEOUT)
    const r = await fetch(url, { headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml,application/xml,application/rss+xml;q=0.9,*/*;q=0.8' }, signal: ctrl.signal, redirect: 'follow' })
    clearTimeout(t)
    if (!r.ok) return null
    const type = r.headers.get('content-type') || ''
    if (!/html|xml|rss|atom|json/i.test(type)) return null
    const text = await r.text()
    return { text: text.slice(0, 2_000_000), type }
  } catch {
    return null
  }
}

/** Some association sites (NAMSSN, for example) are JavaScript apps whose HTML is empty until a
 *  browser runs them. For those we ask a free rendering service for the finished page. */
const RENDERER = process.env.RENDER_PROXY || 'https://r.jina.ai/'
let lastRender = 0
async function getRendered(url: string): Promise<{ text: string; type: string } | null> {
  try {
    // be gentle with the free renderer: at most one request every 1.5 s
    const wait = lastRender + 1500 - Date.now()
    if (wait > 0) await new Promise((r) => setTimeout(r, wait))
    lastRender = Date.now()
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 25000)
    const r = await fetch(RENDERER + url, { headers: { 'user-agent': UA, 'x-return-format': 'html', 'x-timeout': '20', accept: 'text/html' }, signal: ctrl.signal })
    clearTimeout(t)
    if (!r.ok) return null
    return { text: (await r.text()).slice(0, 2_000_000), type: 'text/html' }
  } catch {
    return null
  }
}
const looksEmpty = (html: string) => {
  const $ = cheerio.load(html)
  $('script, style, noscript').remove()
  return clean($('body').text()).length < 300
}
/** Articles shown as cards without their own link (title + author/date + blurb). */
function cardsWithoutLinks(pageUrl: string, $: cheerio.CheerioAPI): Found[] {
  const out: Found[] = []
  const DATE = /([A-Z][a-z]+ \d{1,2}, \d{4}|\d{1,2} [A-Z][a-z]+,? \d{4})/
  $('h2, h3').each((_, h) => {
    const title = clean($(h).text())
    if (title.length < 6 || title.length > 180) return
    // the smallest wrapper that holds this heading and a date, but no other headings
    let card = $(h).parent()
    for (let i = 0; i < 4 && card.length; i++) {
      if (card.find('h1, h2, h3').length > 1) return
      if (DATE.test(clean(card.text()))) break
      card = card.parent()
    }
    if (!card.length || card.find('h1, h2, h3').length > 1) return
    if (card.find('a[href]').filter((_, a) => /^\/|^https?:/.test($(a).attr('href') || '')).length) return
    const text = clean(card.text())
    if (text.length > 1500) return
    const m = DATE.exec(text)
    if (!m) return
    const excerpt = clean(card.find('p').filter((_, p) => { const t = clean($(p).text()); return t.length > 40 && !/^by\s/i.test(t) && !DATE.test(t) }).first().text()).slice(0, 280)
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60)
    out.push({ url: pageUrl.replace(/#.*$/, '') + '#' + slug, title, excerpt, publishedAt: toISO(m[1]) })
  })
  return out
}

const abs = (base: string, href?: string | null) => {
  if (!href) return ''
  try {
    return new URL(href, base).toString().split('#')[0]
  } catch {
    return ''
  }
}
const clean = (s?: string | null) => String(s || '').replace(/\s+/g, ' ').trim()
const toISO = (s?: string | null) => {
  if (!s) return undefined
  const d = new Date(s)
  if (isNaN(d.getTime())) return undefined
  // Date-only strings become noon UTC so the day never shifts with time zones
  if (!/\d{1,2}:\d{2}/.test(s)) return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12)).toISOString()
  return d.toISOString()
}

function parseFeed(xml: string, base: string): Found[] {
  const $ = cheerio.load(xml, { xml: true })
  const out: Found[] = []
  $('item, entry').each((_, el) => {
    const e = $(el)
    const url = abs(base, e.find('link').attr('href') || e.find('link').first().text())
    const title = clean(e.find('title').first().text())
    if (!url || !title) return
    const excerpt = clean(cheerio.load(e.find('description, summary, content').first().text() || '').text()).slice(0, 280)
    const image = abs(base, e.find('enclosure').attr('url') || e.find('media\\:content, media\\:thumbnail').attr('url'))
    const publishedAt = toISO(e.find('pubDate, published, updated, dc\\:date').first().text())
    out.push({ url, title, excerpt, image, publishedAt })
  })
  return out
}

async function findFeed(home: string, $: cheerio.CheerioAPI): Promise<Found[] | null> {
  const links = $('link[type*="rss"], link[type*="atom"]').map((_, l) => abs(home, $(l).attr('href'))).get()
  for (const extra of ['/feed', '/rss.xml', '/feed.xml', '/atom.xml', '/rss']) links.push(abs(home, extra))
  for (const u of [...new Set(links)].filter(Boolean)) {
    const r = await get(u)
    if (r && /<(rss|feed|rdf)/i.test(r.text.slice(0, 2000))) {
      const items = parseFeed(r.text, u)
      if (items.length) return items
    }
  }
  return null
}

/** Score links on a listing page: same host, deep-ish path, real title, not a utility page. */
function candidateLinks(pageUrl: string, $: cheerio.CheerioAPI): Found[] {
  const host = new URL(pageUrl).host
  const seen = new Map<string, Found>()
  $('a[href]').each((_, a) => {
    const el = $(a)
    const url = abs(pageUrl, el.attr('href'))
    if (!url) return
    let u: URL
    try { u = new URL(url) } catch { return }
    if (u.host !== host || SKIP.test(u.pathname) || u.pathname === '/' || u.pathname.split('/').filter(Boolean).length < 1) return
    if (url === pageUrl) return
    const card = el.closest('article, li, .card, [class*=card], [class*=post], [class*=item]')
    const heading = (card.length ? card : el).find('h1,h2,h3,h4').first().text()
    const title = clean(heading || el.attr('title') || el.text())
    if (title.length < (heading ? 6 : 12) || title.length > 180) return
    if (/^(read more|learn more|view|see all|continue|more)$/i.test(title)) return
    const image = abs(pageUrl, (card.length ? card : el).find('img').first().attr('src') || (card.length ? card : el).find('img').first().attr('data-src'))
    const time = (card.length ? card : el).find('time').first()
    const publishedAt = toISO(time.attr('datetime') || time.text())
    const excerpt = clean((card.length ? card : el).find('p').first().text()).slice(0, 280)
    const prev = seen.get(url)
    if (!prev || (title.length > prev.title.length && !prev.publishedAt)) seen.set(url, { url, title, image, publishedAt, excerpt })
  })
  // Prefer deeper paths (actual posts) over section pages
  return [...seen.values()].sort((a, b) => new URL(b.url).pathname.length - new URL(a.url).pathname.length)
}

async function enrich(f: Found, home: { title: string; description: string; image: string }): Promise<Found> {
  if (f.url.includes('#')) return f
  let r = await get(f.url)
  if (!r || !/html/i.test(r.type)) return f
  if (looksEmpty(r.text)) r = (await getRendered(f.url)) || r
  const $ = cheerio.load(r.text)
  const og = (p: string) => $(`meta[property="${p}"], meta[name="${p}"]`).attr('content')
  const diff = (v: string | undefined, homeV: string) => (v && clean(v) !== homeV ? v : undefined)
  const title = clean(diff(og('og:title'), home.title) || $('main h1, article h1, h1').first().text()) || f.title
  const excerpt = clean(diff(og('og:description'), home.description) || diff(og('description'), home.description) || $('article p, main p').filter((_, p) => clean($(p).text()).length > 40).first().text()).slice(0, 280) || f.excerpt
  const image = abs(f.url, diff(og('og:image'), home.image) || $('main img, article img').first().attr('src')) || f.image
  const publishedAt = toISO(og('article:published_time') || og('datePublished') || $('time[datetime]').first().attr('datetime')) || f.publishedAt
  return { url: f.url, title, excerpt, image, publishedAt }
}

export async function discover(site: string, newsPath?: string | null): Promise<Found[]> {
  const home = new URL(site).origin + '/'
  const homePage = await get(home)
  if (!homePage) throw new Error('Site could not be reached')
  const $home = cheerio.load(homePage.text)
  const feed = await findFeed(home, $home)
  if (feed) return feed.slice(0, MAX_POSTS)

  const og = (p: string) => clean($home(`meta[property="${p}"], meta[name="${p}"]`).attr('content'))
  const homeMeta = { title: og('og:title'), description: og('og:description') || og('description'), image: abs(home, og('og:image')) }
  const spa = looksEmpty(homePage.text)
  const $nav = spa ? cheerio.load((await getRendered(home))?.text || homePage.text) : $home

  const pages = new Set<string>()
  if (newsPath) pages.add(abs(home, newsPath))
  // Nav links that look like a news section
  $nav('a[href]').each((_, a) => {
    const t = clean($nav(a).text()).toLowerCase()
    if (/news|blog|announce|update|article|journal|post|community|events/.test(t)) pages.add(abs(home, $nav(a).attr('href')))
  })
  // A JavaScript app answers every address with the same page, so only guess paths on ordinary sites
  if (!spa) for (const h of LISTING_HINTS) pages.add(abs(home, h))
  else pages.add(home)

  const found = new Map<string, Found>()
  for (const p of [...pages].filter(Boolean).slice(0, spa ? 5 : 8)) {
    let r = p === home ? homePage : await get(p)
    if (!r || !/html/i.test(r.type)) continue
    if (spa || looksEmpty(r.text)) r = (await getRendered(p)) || r
    const $ = cheerio.load(r.text)
    const norm = (u: string) => u.replace(/\/$/, '')
    const listing = new Set([...pages].map(norm))
    const cands = candidateLinks(p, $).filter((c) => !listing.has(norm(c.url)))
    for (const c of cands) if (!found.has(c.url)) found.set(c.url, c)
    if (p !== home) for (const c of cardsWithoutLinks(p, $)) if (!found.has(c.url)) found.set(c.url, c)
    if (found.size >= MAX_POSTS * 3) break
  }
  const top = [...found.values()].sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || '')).slice(0, MAX_POSTS)
  // Open individual posts only when the listing did not already tell us enough (keeps the daily job short)
  let budget = 6
  const out: Found[] = []
  for (const f of top) {
    if (budget > 0 && !f.url.includes('#') && !(f.excerpt && f.publishedAt)) { budget--; out.push(await enrich(f, homeMeta)) }
    else out.push(f)
  }
  return out
}

export async function refreshDepartment(payload: Payload, dept: { id: number; name: string; site?: string | null; newsPath?: string | null; assoc?: string | null }) {
  const site = dept.site || ''
  if (!/^https?:\/\//i.test(site)) return { added: 0, updated: 0, note: 'No website' }
  let added = 0, updated = 0, note = ''
  try {
    const posts = await discover(site, dept.newsPath)
    for (const p of posts) {
      const existing = await payload.find({ collection: 'external-posts', where: { url: { equals: p.url } }, limit: 1, depth: 0, overrideAccess: true })
      const data = {
        title: p.title, url: p.url, excerpt: p.excerpt || '', image: p.image || '',
        publishedAt: p.publishedAt || undefined, department: dept.id, source: dept.assoc || new URL(site).host,
        fetchedAt: new Date().toISOString(),
      }
      if (existing.docs[0]) {
        const e = existing.docs[0]
        if (e.title !== data.title || (e.excerpt || '') !== data.excerpt || (e.image || '') !== data.image) {
          await payload.update({ collection: 'external-posts', id: e.id, data: { title: data.title, excerpt: data.excerpt, image: data.image, fetchedAt: data.fetchedAt, publishedAt: e.publishedAt || data.publishedAt }, overrideAccess: true, depth: 0 })
          updated++
        }
      } else {
        await payload.create({ collection: 'external-posts', data: { ...data, visible: true }, overrideAccess: true, depth: 0 })
        added++
      }
    }
    note = posts.length ? `${posts.length} posts found, ${added} new` : 'Reached the site but found no posts'
  } catch (e) {
    note = `Failed: ${(e as Error).message}`
  }
  await payload.update({ collection: 'departments', id: dept.id, data: { lastFetched: new Date().toISOString(), fetchNote: note }, overrideAccess: true, depth: 0 }).catch(() => {})
  return { added, updated, note }
}

export async function refreshAll(payload: Payload) {
  const depts = await payload.find({ collection: 'departments', limit: 100, depth: 0, overrideAccess: true })
  const results: Record<string, { added: number; updated: number; note: string }> = {}
  for (const d of depts.docs) {
    if (!d.site) continue
    results[d.name] = await refreshDepartment(payload, d)
  }
  if (Object.values(results).some((r) => r.added || r.updated)) revalidateSite()
  return results
}

export const __internals = { cardsWithoutLinks, candidateLinks, looksEmpty }
