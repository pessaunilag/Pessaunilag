export const dynamic = 'force-static'
export function GET() {
  const base = (process.env.SITE_URL || 'https://pessaunilag.vercel.app').replace(/\/$/, '')
  return new Response(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\nSitemap: ${base}/sitemap.xml\n`, { headers: { 'content-type': 'text/plain' } })
}
