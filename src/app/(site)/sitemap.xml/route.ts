import config from '@payload-config'
import { getPayload } from 'payload'
import { getSiteState } from '@/site/state'

export const dynamic = 'force-dynamic'

const PAGES = ['', 'about', 'excos', 'reps', 'departments', 'news', 'spotlight', 'events', 'gallery', 'opportunities', 'resources', 'alumni', 'partner', 'contact', 'academics', 'tools', 'community', 'newsletter', 'merch']

export async function GET() {
  const base = (process.env.SITE_URL || 'https://pessaunilag.vercel.app').replace(/\/$/, '')
  const payload = await getPayload({ config })
  const s = (await getSiteState(payload)) as Record<string, Array<{ id: string }>>
  const urls = [
    ...PAGES.map((p) => `${base}/${p}`),
    ...(s.news || []).map((n) => `${base}/news/${n.id}`),
    ...(s.events || []).map((e) => `${base}/events/${e.id}`),
    ...(s.departments || []).map((d) => `${base}/departments/${d.id}`),
    ...(s.articles || []).map((a) => `${base}/community/${a.id}`),
  ]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`
  return new Response(xml, { headers: { 'content-type': 'application/xml', 'cache-control': 'public, s-maxage=3600' } })
}
