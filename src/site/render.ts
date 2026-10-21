import vm from 'node:vm'
import { SITE_JS, SITE_HASH } from './bundle.generated'

type Rendered = { html: string; title: string; description: string; image: string; status: number }
type Api = { render: (path: string, state: unknown, opts: { edit?: boolean; user?: string; admin?: string }) => Rendered }

let api: Api | null = null
function load(): Api {
  if (api) return api
  const sandbox: Record<string, unknown> = { console }
  sandbox.window = sandbox
  sandbox.globalThis = sandbox
  vm.createContext(sandbox)
  vm.runInContext(SITE_JS, sandbox, { filename: 'site.js' })
  api = (sandbox as { PESSA: Api }).PESSA
  return api
}

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string)
const jsonForScript = (v: unknown) => JSON.stringify(v).replace(/</g, '\\u003c').replace(new RegExp('[\u2028\u2029]', 'g'), (c) => '\\u' + c.charCodeAt(0).toString(16))

export function renderSite(path: string, state: Record<string, unknown>, opts: { edit?: boolean; user?: string; origin: string }) {
  const r = load().render(path, JSON.parse(JSON.stringify(state)), { edit: opts.edit, user: opts.user, admin: '/admin' })
  const S = (state.settings || {}) as Record<string, string>
  const canonical = opts.origin.replace(/\/$/, '') + (path === '/' ? '/' : path.replace(/\/$/, ''))
  const image = r.image && r.image.startsWith('/') ? opts.origin.replace(/\/$/, '') + r.image : r.image
  const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(r.title)}</title>
<meta name="description" content="${esc(r.description)}">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="website"><meta property="og:site_name" content="${esc(S.short || 'PESSA')} UNILAG"><meta property="og:title" content="${esc(r.title)}"><meta property="og:description" content="${esc(r.description)}"><meta property="og:url" content="${esc(canonical)}">${image ? `<meta property="og:image" content="${esc(image)}"><meta name="twitter:card" content="summary_large_image">` : ''}
${state.settings && (state.settings as Record<string, string>).logo ? `<link rel="icon" href="${esc((state.settings as Record<string, string>).logo)}">` : ''}
<meta name="theme-color" content="#F4EFE4">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/site.css?v=${SITE_HASH}">
${opts.edit ? '<meta name="robots" content="noindex">' : ''}
</head>
<body${opts.edit ? ' class="editing"' : ''}>
<div id="root">${r.html}</div>
<script type="application/json" id="state">${jsonForScript({ state, edit: !!opts.edit, user: opts.user || '', admin: '/admin' })}</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="/site.js?v=${SITE_HASH}" defer></script>
</body>
</html>`
  return { html: doc, status: r.status }
}
