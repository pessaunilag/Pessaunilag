'use client'
import React, { useEffect, useState } from 'react'

type Status = { available: boolean; complete: boolean; steps: string[]; expected: Record<string, number>; counts: Record<string, number> }

const card: React.CSSProperties = { border: '1px solid var(--theme-elevation-150)', background: 'var(--theme-elevation-0)', padding: '20px 22px', marginBottom: 24, borderRadius: 4 }
const btn: React.CSSProperties = { display: 'inline-block', padding: '9px 14px', border: '1px solid var(--theme-elevation-800)', background: 'var(--theme-elevation-800)', color: 'var(--theme-elevation-0)', borderRadius: 4, cursor: 'pointer', textDecoration: 'none', fontSize: 13, fontWeight: 600, marginRight: 8, marginTop: 8 }
const ghost: React.CSSProperties = { ...btn, background: 'transparent', color: 'var(--theme-elevation-800)' }

export const Welcome: React.FC = () => {
  const [status, setStatus] = useState<Status | null>(null)
  const [busy, setBusy] = useState<string>('')
  const [msg, setMsg] = useState<string>('')

  const load = () => fetch('/api/starter-status', { credentials: 'include' }).then((r) => (r.ok ? r.json() : null)).then(setStatus).catch(() => null)
  useEffect(() => { load() }, [])

  const runImport = async () => {
    setBusy('import'); setMsg('')
    const steps = status?.steps || []
    const done: string[] = []
    for (const step of steps) {
      setMsg(`Importing ${step}... (${done.length + 1} of ${steps.length})`)
      try {
        const r = await fetch(`/api/import-starter?step=${step}`, { method: 'POST', credentials: 'include' })
        const j = await r.json()
        if (!r.ok) throw new Error(j.error || 'Failed')
        done.push(...((j.log as string[]) || []))
      } catch (e) {
        setMsg(`Stopped at "${step}": ${(e as Error).message}. Click the import button again to resume.`)
        setBusy(''); load(); return
      }
    }
    setMsg(`Done. ${done.join(', ')}.`)
    setBusy(''); load()
  }

  const run = async (label: string, url: string) => {
    setBusy(label); setMsg('')
    try {
      const r = await fetch(url, { method: 'POST', credentials: 'include' })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Failed')
      if (j.results) {
        const lines = Object.entries(j.results as Record<string, { note: string }>).map(([k, v]) => `${k}: ${v.note}`)
        setMsg(lines.length ? lines.join(' · ') : 'No department has a website yet. Add one under Departments.')
      } else if (j.log) setMsg(`Imported ${j.media} photos. ${(j.log as string[]).filter((l) => /imported/.test(l)).join(', ')}.`)
      else setMsg('Done.')
      load()
    } catch (e) { setMsg((e as Error).message) }
    setBusy('')
  }

  return (
    <div style={card}>
      <h2 style={{ margin: '0 0 6px', fontSize: 22 }}>PESSA UNILAG website</h2>
      <p style={{ margin: '0 0 6px', color: 'var(--theme-elevation-600)' }}>
        Everything on the website is edited from the menu on the left. Changes go live the moment you click <b>Save</b> or <b>Publish</b>.
        Photos used anywhere are added to the Gallery on their own. Form submissions arrive in the <b>Inbox</b> and by email.
      </p>
      <div>
        <a style={btn} href="/" target="_blank" rel="noreferrer">Open the website</a>
        <a style={ghost} href="/admin/collections/news/create">New story</a>
        <a style={ghost} href="/admin/collections/events/create">New event</a>
        <a style={ghost} href="/admin/collections/spotlights/create">New spotlight</a>
        <a style={ghost} href="/admin/collections/submissions">Inbox</a>
        <button style={ghost} disabled={busy !== ''} onClick={() => run('refresh', '/api/refresh-external')}>{busy === 'refresh' ? 'Fetching...' : 'Fetch departmental news now'}</button>
        <button style={ghost} disabled={busy !== ''} onClick={() => run('revalidate', '/api/revalidate')}>{busy === 'revalidate' ? 'Refreshing...' : 'Refresh the public site'}</button>
        {status?.available && !status.complete && (
          <button style={btn} disabled={busy !== ''} onClick={runImport}>{busy === 'import' ? 'Importing, please wait...' : 'Import the current site content'}</button>
        )}
      </div>
      {msg && <p style={{ marginTop: 12, fontSize: 13 }}>{msg}</p>}
      {status?.available && !status.complete && !msg && (
        <p style={{ marginTop: 12, fontSize: 13, color: 'var(--theme-elevation-600)' }}>Starter content is not fully imported yet. Click the import button to bring in the news, events, executives, departments, photos and settings from the previous PESSA site. It runs in steps and can be clicked again if it stops.</p>
      )}
    </div>
  )
}
