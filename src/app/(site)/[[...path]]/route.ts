import config from '@payload-config'
import { getPayload } from 'payload'
import type { NextRequest } from 'next/server'
import { getSiteState, buildState } from '@/site/state'
import { renderSite } from '@/site/render'

export const dynamic = 'force-dynamic'

/** Every public page of the website is served here. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await ctx.params
  const pathname = '/' + path.map((p) => decodeURIComponent(p)).join('/')
  // Only the known shapes of URL are pages; anything else (favicon, old files) is a plain 404.
  if (!/^\/([a-z]+(\/[A-Za-z0-9_-]+)?)?$/.test(pathname)) return new Response('Not found', { status: 404 })

  const payload = await getPayload({ config })
  let user: { name?: string; email?: string } | null = null
  if (req.cookies.has('payload-token')) {
    try {
      user = (await payload.auth({ headers: req.headers })).user
    } catch {
      user = null
    }
  }
  // Editors see fresh data and edit buttons; visitors get the cached site.
  const state = user ? await buildState(payload) : await getSiteState(payload)
  const origin = process.env.SITE_URL || req.nextUrl.origin
  const { html, status } = renderSite(pathname, state, { edit: Boolean(user), user: user?.name || user?.email, origin })
  return new Response(html, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': user ? 'private, no-store' : 'public, max-age=0, s-maxage=30, stale-while-revalidate=300',
    },
  })
}
