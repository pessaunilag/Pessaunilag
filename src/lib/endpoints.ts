import type { Endpoint, PayloadRequest } from 'payload'
import { refreshAll } from './fetchExternal'
import { importStarter, starterStatus, type Step } from './seed'
import { revalidateSite } from '../collections/access'

const json = (data: unknown, status = 200) => Response.json(data, { status })

const cronOk = (req: PayloadRequest) => {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const auth = req.headers.get('authorization') || ''
  return auth === `Bearer ${secret}`
}

export const adminEndpoints: Endpoint[] = [
  {
    // Called by Vercel Cron once a day (see vercel.json). Also keeps the free database awake.
    path: '/cron-refresh',
    method: 'get',
    handler: async (req) => {
      if (!cronOk(req) && !req.user) return json({ error: 'Unauthorized' }, 401)
      const results = await refreshAll(req.payload)
      return json({ ok: true, at: new Date().toISOString(), results })
    },
  },
  {
    // "Fetch departmental news now" button in the admin.
    path: '/refresh-external',
    method: 'post',
    handler: async (req) => {
      if (!req.user) return json({ error: 'Sign in first' }, 401)
      const results = await refreshAll(req.payload)
      revalidateSite()
      return json({ ok: true, results })
    },
  },
  {
    path: '/starter-status',
    method: 'get',
    handler: async (req) => {
      if (!req.user) return json({ error: 'Sign in first' }, 401)
      return json(await starterStatus(req.payload))
    },
  },
  {
    // Import of the content from the original PESSA site, one step per call.
    // Safe to repeat: existing items are skipped.
    path: '/import-starter',
    method: 'post',
    handler: async (req) => {
      if (!req.user) return json({ error: 'Sign in first' }, 401)
      const step = (req.searchParams.get('step') || 'settings') as Step
      try {
        const result = await importStarter(req.payload, step)
        if (!result.next) revalidateSite()
        return json({ ok: true, ...result })
      } catch (e) {
        return json({ error: (e as Error).message }, 500)
      }
    },
  },
  {
    path: '/revalidate',
    method: 'post',
    handler: async (req) => {
      if (!req.user) return json({ error: 'Sign in first' }, 401)
      revalidateSite()
      return json({ ok: true })
    },
  },
]
