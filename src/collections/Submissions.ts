import type { CollectionConfig, Field } from 'payload'
import { anyone, isLoggedIn } from './access'
import { notifySubmission } from '../lib/notify'

export const KINDS = [
  { label: 'Spotlight nomination', value: 'nomination' },
  { label: 'Alumni registration', value: 'alumni' },
  { label: 'Contact message', value: 'contact' },
  { label: 'Suggestion box', value: 'suggestion' },
  { label: 'Sponsorship enquiry', value: 'sponsor' },
]

export const Submissions: CollectionConfig = {
  slug: 'submissions',
  labels: { singular: 'Form submission', plural: 'Inbox (form submissions)' },
  admin: {
    useAsTitle: 'summary',
    defaultColumns: ['summary', 'kind', 'status', 'createdAt'],
    group: 'Inbox',
    description:
      'Everything sent through the website forms: nominations, suggestions, alumni sign-ups, contact messages and sponsorship enquiries. A copy is emailed to the PESSA inbox.',
    listSearchableFields: ['summary', 'name', 'email'],
  },
  defaultSort: '-createdAt',
  access: {
    create: anyone,
    read: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (operation !== 'create' || !data) return data
        // Honeypot: bots fill the hidden "website" field.
        if (data.website) throw new Error('Rejected')
        const d = (data.data || {}) as Record<string, string>
        const first = Object.entries(d).find(([, v]) => String(v || '').trim())
        const who = data.name || d['Name'] || d['Nominee'] || d['Company'] || 'Anonymous'
        const kind = KINDS.find((k) => k.value === data.kind)?.label || 'Submission'
        data.summary = `${kind}: ${who}${first && !data.name ? '' : ''}`.slice(0, 180)
        data.status = 'new'
        delete data.website
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return doc
        await notifySubmission(req.payload, doc)
        if (doc.kind === 'alumni') {
          const d = (doc.data || {}) as Record<string, string>
          try {
            await req.payload.create({
              collection: 'alumni',
              draft: true,
              overrideAccess: true,
              data: {
                name: d['Name'] || doc.name || 'Alumnus',
                year: d['Graduation year'] || '',
                role: d['Role'] || '',
                email: doc.email || d['Email'] || '',
                phone: doc.phone || d['Phone'] || '',
                mentor: /yes/i.test(d['Open to mentoring students'] || ''),
                _status: 'draft',
              },
            })
          } catch (e) {
            req.payload.logger.warn(`alumni draft: ${(e as Error).message}`)
          }
        }
        return doc
      },
    ],
  },
  fields: [
    { name: 'kind', type: 'select', label: 'Form', required: true, options: KINDS } as Field,
    { name: 'summary', type: 'text', admin: { readOnly: true } } as Field,
    { name: 'name', type: 'text', label: 'Name' } as Field,
    { name: 'email', type: 'email', label: 'Email' } as Field,
    { name: 'phone', type: 'text', label: 'Phone' } as Field,
    { name: 'data', type: 'json', label: 'What they sent', admin: { readOnly: true } } as Field,
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Seen', value: 'seen' },
        { label: 'Done', value: 'done' },
      ],
      admin: { position: 'sidebar' },
    } as Field,
    { name: 'notes', type: 'textarea', label: 'Internal notes (not public)', admin: { position: 'sidebar' } } as Field,
    { name: 'website', type: 'text', admin: { hidden: true } } as Field,
  ],
}
