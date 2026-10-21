import type { Payload } from 'payload'

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)

/** Email the PESSA inbox about a new form submission. Never throws. */
export async function notifySubmission(payload: Payload, doc: Record<string, unknown>): Promise<void> {
  const to = process.env.NOTIFY_EMAIL
  if (!to) return
  const data = (doc.data || {}) as Record<string, string>
  const base = (process.env.SITE_URL || '').replace(/\/$/, '')
  const rows = Object.entries(data)
    .filter(([, v]) => String(v || '').trim())
    .map(([k, v]) => `<tr><td style="padding:6px 10px;color:#6b6659;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:6px 10px">${esc(v).replace(/\n/g, '<br>')}</td></tr>`)
    .join('')
  const subject = `[PESSA website] ${doc.summary || 'New submission'}`
  const html = `
  <div style="font-family:Georgia,serif;max-width:620px;margin:0 auto;color:#141210">
    <p style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#6b6659">PESSA UNILAG website</p>
    <h2 style="margin:0 0 12px;font-weight:500">${esc(doc.summary)}</h2>
    <table style="border-collapse:collapse;font-size:15px;border-top:1px solid #e3ddcf;border-bottom:1px solid #e3ddcf">${rows}</table>
    ${base ? `<p style="margin-top:18px"><a href="${base}/admin/collections/submissions/${doc.id}" style="color:#141210">Open in the inbox</a></p>` : ''}
  </div>`
  try {
    await payload.sendEmail({ to, subject, html, replyTo: typeof doc.email === 'string' && doc.email ? doc.email : undefined })
  } catch (e) {
    payload.logger.warn(`email failed: ${(e as Error).message}`)
  }
}
