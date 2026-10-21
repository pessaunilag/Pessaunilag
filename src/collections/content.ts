import type { CollectionConfig, Field } from 'payload'
import { anyone, isLoggedIn, revalidateSite } from './access'
import { autoGallery } from './autoGallery'

/* ------------------------------------------------------------------ */
/*  Small field helpers so every collection reads like a form          */
/* ------------------------------------------------------------------ */

type Opt = string | { label: string; value: string }

const text = (name: string, label: string, o: Partial<Field> & { required?: boolean; description?: string } = {}): Field =>
  ({ name, type: 'text', label, required: o.required, admin: { description: o.description } }) as Field

const area = (name: string, label: string, o: { required?: boolean; description?: string; rows?: number } = {}): Field =>
  ({ name, type: 'textarea', label, required: o.required, admin: { description: o.description, rows: o.rows } }) as Field

const long = (name: string, label: string, o: { required?: boolean; description?: string } = {}): Field =>
  area(name, label, { ...o, rows: 14, description: o.description || 'Leave an empty line between paragraphs.' })

const day = (name: string, label: string, o: { required?: boolean; description?: string } = {}): Field =>
  ({
    name,
    type: 'date',
    label,
    required: o.required,
    admin: { description: o.description, date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' } },
  }) as Field

const select = (name: string, label: string, options: Opt[], o: { required?: boolean; description?: string; defaultValue?: string; hasMany?: boolean } = {}): Field =>
  ({
    name,
    type: 'select',
    label,
    required: o.required,
    hasMany: o.hasMany,
    defaultValue: o.defaultValue,
    options: options.map((x) => (typeof x === 'string' ? { label: x, value: x } : x)),
    admin: { description: o.description },
  }) as Field

const yesNo = (name: string, label: string, description?: string): Field =>
  ({ name, type: 'checkbox', label, defaultValue: false, admin: { description } }) as Field

const link = (name: string, label: string, o: { required?: boolean; description?: string } = {}): Field =>
  ({
    name,
    type: 'text',
    label,
    required: o.required,
    admin: { description: o.description || 'Must start with https://', placeholder: 'https://' },
    validate: (v: unknown) => {
      if (!v) return true
      return /^https?:\/\/[^\s"'<>]+$/i.test(String(v)) ? true : 'Links must start with https://'
    },
  }) as Field

/** A photo picked from the Photos library (upload inline or choose an existing one). */
const photo = (name: string, label: string, o: { required?: boolean; description?: string } = {}): Field =>
  ({ name, type: 'upload', relationTo: 'media', label, required: o.required, admin: { description: o.description } }) as Field

const dept = (name = 'department', label = 'Department', o: { description?: string; hasMany?: boolean; required?: boolean } = {}): Field =>
  ({ name, type: 'relationship', relationTo: 'departments', label, hasMany: o.hasMany, required: o.required, admin: { description: o.description } }) as Field

const level = (): Field => select('level', 'Level', ['100', '200', '300', '400', '500'])

const instagram = (name = 'instagram', label = 'Instagram handle (optional)'): Field =>
  text(name, label, { description: 'Without the @' })

/* ------------------------------------------------------------------ */
/*  Collection factory                                                 */
/* ------------------------------------------------------------------ */

type Spec = {
  slug: string
  singular: string
  plural: string
  group: string
  title: string
  columns?: string[]
  fields: Field[]
  drafts?: boolean
  orderable?: boolean
  description?: string
  defaultSort?: string
  imageFields?: string[]
  galleryLabel?: (doc: Record<string, unknown>) => string
}

function make(s: Spec): CollectionConfig {
  const hooks: CollectionConfig['hooks'] = {
    afterChange: [() => revalidateSite()],
    afterDelete: [() => revalidateSite()],
  }
  if (s.imageFields?.length) hooks.afterChange!.push(autoGallery(s.imageFields, s.galleryLabel || ((d) => String(d[s.title] || ''))))
  return {
    slug: s.slug,
    labels: { singular: s.singular, plural: s.plural },
    admin: {
      useAsTitle: s.title,
      defaultColumns: s.columns || [s.title, 'updatedAt'],
      group: s.group,
      description: s.description,
    },
    access: { read: anyone, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
    defaultSort: s.defaultSort,
    orderable: s.orderable,
    versions: s.drafts ? { drafts: { autosave: { interval: 1500 } }, maxPerDoc: 20 } : undefined,
    hooks,
    fields: s.fields,
  }
}

/* ------------------------------------------------------------------ */
/*  The collections (mirrors the content model of the live site)       */
/* ------------------------------------------------------------------ */

const PUBLISH = 'Publishing'
const PEOPLE = 'People'
const ACADEMICS = 'Academics'
const PARTNERS = 'Partners & alumni'

export const News = make({
  slug: 'news', singular: 'News story', plural: 'News', group: PUBLISH, title: 'title', drafts: true,
  columns: ['title', 'date', 'category', '_status'], defaultSort: '-date',
  description: 'Stories for the News page and the home page. Tag a department and the story also appears on that department\'s page.',
  imageFields: ['cover'],
  fields: [
    text('title', 'Headline', { required: true }),
    day('date', 'Date', { required: true }),
    select('category', 'Category', ['Announcement', 'Event Recap', 'Academics', 'Sports', 'Social', 'Partnership', 'Welfare']),
    dept('departments', 'Departments this story is about (optional)', { hasMany: true, description: 'Pick one or more departments and the story shows on their pages automatically.' }),
    photo('cover', 'Cover photo'),
    area('summary', 'Short summary (shows on cards)', { required: true }),
    long('body', 'Full story'),
    link('link', 'Related link (optional)'),
  ],
})

export const Spotlights = make({
  slug: 'spotlights', singular: 'Spotlight', plural: 'Spotlight', group: PUBLISH, title: 'name', drafts: true,
  columns: ['name', 'kind', 'period', 'date', '_status'], defaultSort: '-date',
  description: 'Student, Lecturer or Department of the Week / Month.',
  imageFields: ['photo'],
  fields: [
    select('kind', 'Who is this for?', ['Student', 'Lecturer', 'Department'], { required: true, defaultValue: 'Student' }),
    {
      name: 'category', type: 'select', label: 'Category',
      options: ['Academic', 'Social', 'Sports', 'Humanitarian', 'All-Rounder'].map((x) => ({ label: x, value: x })),
      admin: {
        description: 'Students: any category. Lecturers: Academic or Social only.',
        condition: (d) => d?.kind === 'Student' || d?.kind === 'Lecturer',
      },
      validate: (v: unknown, { siblingData }: { siblingData?: Record<string, unknown> }) => {
        if (siblingData?.kind === 'Lecturer' && v && !['Academic', 'Social'].includes(String(v))) return 'Lecturers can only be Academic or Social.'
        return true
      },
    } as Field,
    select('period', 'Of the', ['Week', 'Month'], { required: true, defaultValue: 'Week' }),
    text('periodLabel', 'Period label', { description: 'For example: Week 3, November 2026' }),
    day('date', 'Date announced', { required: true }),
    text('name', 'Name', { required: true, description: 'For a department, enter the department name.' }),
    { ...dept('department', 'Department'), admin: { condition: (d) => d?.kind !== 'Department' } } as Field,
    { ...level(), admin: { condition: (d) => d?.kind === 'Student' } } as Field,
    photo('photo', 'Photo (shown in a round frame)'),
    area('citation', 'Why they were chosen', { required: true }),
    instagram('handle'),
  ],
})

export const Events = make({
  slug: 'events', singular: 'Event', plural: 'Events', group: PUBLISH, title: 'title', drafts: true,
  columns: ['title', 'date', 'category', '_status'], defaultSort: '-date',
  imageFields: ['poster'],
  fields: [
    text('title', 'Event name', { required: true }),
    day('date', 'Date', { description: 'Leave empty if the date is not fixed yet.' }),
    text('dateLabel', 'Date note (when no exact date)', { description: 'For example: Mid-December 2026' }),
    text('time', 'Time', { description: 'For example: 10:00 AM' }),
    text('venue', 'Venue'),
    select('category', 'Category', ['Academics', 'Sports', 'Social', 'Other'], { required: true, defaultValue: 'Social' }),
    dept('departments', 'Departments involved (optional)', { hasMany: true, description: 'The event also shows on these department pages.' }),
    long('description', 'Description'),
    photo('poster', 'Flyer or photo'),
    link('link', 'Registration or info link (optional)'),
  ],
})

export const Announcements = make({
  slug: 'announcements', singular: 'Announcement', plural: 'Announcements', group: ACADEMICS, title: 'title', drafts: true,
  columns: ['title', 'date', 'category', 'pinned', '_status'], defaultSort: '-date',
  description: 'Academic notices shown on the Academics page. The site-wide bar at the very top of every page is set in Site settings.',
  fields: [
    text('title', 'Title', { required: true }),
    day('date', 'Date', { required: true }),
    select('category', 'Category', ['Notice', 'Academic', 'Exams', 'Welfare', 'Deadline', 'Event']),
    dept('departments', 'Departments concerned (optional)', { hasMany: true }),
    long('body', 'Details', { required: true }),
    link('link', 'Link (optional)'),
    yesNo('pinned', 'Pin to the top'),
  ],
})

export const Articles = make({
  slug: 'articles', singular: 'Journal article', plural: 'Journal articles', group: PUBLISH, title: 'title', drafts: true,
  columns: ['title', 'author', 'date', '_status'], defaultSort: '-date',
  imageFields: ['cover'],
  fields: [
    text('title', 'Title', { required: true }),
    text('author', 'Author', { required: true }),
    day('date', 'Date', { required: true }),
    text('tags', 'Tags (comma separated)', { description: 'For example: Physics, Careers' }),
    dept('departments', 'Departments (optional)', { hasMany: true }),
    area('summary', 'Summary (shows on cards)', { required: true }),
    long('body', 'Full article', { required: true }),
    photo('cover', 'Cover image (optional)'),
  ],
})

export const Newsletters = make({
  slug: 'newsletters', singular: 'Newsletter issue', plural: 'Newsletters', group: PUBLISH, title: 'title', drafts: true,
  columns: ['title', 'issue', 'date', '_status'], defaultSort: '-date',
  imageFields: ['cover'],
  fields: [
    text('title', 'Title', { required: true }),
    text('issue', 'Issue', { description: 'For example: Vol. 1, No. 3' }),
    day('date', 'Date', { required: true }),
    area('summary', 'What is inside'),
    photo('cover', 'Cover'),
    link('link', 'Read link (PDF or Drive)', { required: true }),
  ],
})

export const Gallery = make({
  slug: 'gallery', singular: 'Gallery photo', plural: 'Gallery', group: PUBLISH, title: 'caption',
  columns: ['image', 'caption', 'event', 'date'], defaultSort: '-date',
  description: 'Photos on the Gallery page. Photos used elsewhere on the site are added here automatically too.',
  fields: [
    photo('image', 'Photo', { required: true }),
    text('caption', 'Caption'),
    text('event', 'Event'),
    day('date', 'Date'),
    dept('departments', 'Departments (optional)', { hasMany: true }),
  ],
})

export const Excos = make({
  slug: 'excos', singular: 'Executive', plural: 'Executives (current)', group: PEOPLE, title: 'name', orderable: true,
  columns: ['name', 'position', 'department'],
  description: 'The current administration. Drag the rows to set the order shown on the site.',
  imageFields: ['photo'],
  fields: [
    text('name', 'Full name', { required: true }),
    text('position', 'Position', { required: true }),
    dept(),
    level(),
    photo('photo', 'Photo'),
    instagram(),
    area('bio', 'Short bio (optional)'),
  ],
})

export const PastExcos = make({
  slug: 'past-excos', singular: 'Past executive', plural: 'Hall of fame (past executives)', group: PEOPLE, title: 'name',
  columns: ['name', 'session', 'admin', 'position'], defaultSort: '-session',
  imageFields: ['photo'],
  fields: [
    text('session', 'Session', { required: true, description: 'For example: 2025/2026' }),
    text('admin', 'Administration name', { description: 'For example: The Pioneers' }),
    text('name', 'Full name', { required: true }),
    text('position', 'Position', { required: true }),
    { name: 'order', type: 'number', label: 'Order in the list (1 = President)', admin: { step: 1 } } as Field,
    dept(),
    photo('photo', 'Photo'),
    area('note', 'Highlight or legacy (optional)'),
  ],
})

export const Reps = make({
  slug: 'reps', singular: 'Representative', plural: 'House of Representatives', group: PEOPLE, title: 'name', orderable: true,
  columns: ['name', 'role', 'department'],
  imageFields: ['photo'],
  fields: [
    text('name', 'Full name', { required: true }),
    select('role', 'Role', ['Speaker', 'Deputy Speaker', 'Clerk', 'Chief Whip', 'Majority Leader', 'Committee Chair', 'Member'], { required: true, defaultValue: 'Member' }),
    dept(),
    level(),
    text('committee', 'Committee (optional)'),
    photo('photo', 'Photo'),
    instagram(),
  ],
})

export const Patrons = make({
  slug: 'patrons', singular: 'Patron or lecturer', plural: 'Patrons & lecturers', group: PEOPLE, title: 'name', orderable: true,
  columns: ['name', 'role', 'group', 'department'],
  imageFields: ['photo'],
  fields: [
    text('name', 'Full name with title', { required: true, description: 'For example: Prof. A. B. Cole' }),
    text('role', 'Role', { required: true, description: 'For example: Dean, Sub-Dean, Head of Department, Staff Adviser' }),
    select('group', 'Group', ['Patron', 'Faculty leadership', 'Lecturer'], { required: true, defaultValue: 'Lecturer' }),
    dept(),
    photo('photo', 'Photo'),
    area('note', 'Short note (optional)'),
  ],
})

export const Alumni = make({
  slug: 'alumni', singular: 'Alumnus', plural: 'Alumni', group: PARTNERS, title: 'name', orderable: true, drafts: true,
  columns: ['name', 'year', 'role', '_status'],
  description: 'Sign-ups from the website arrive here as drafts. Open one, check it, then click Publish to show it on the site.',
  imageFields: ['photo'],
  fields: [
    text('name', 'Full name', { required: true }),
    text('year', 'Graduation year'),
    dept(),
    text('role', 'Current role and organisation'),
    photo('photo', 'Photo'),
    link('linkedin', 'LinkedIn link (optional)'),
    text('email', 'Email (private, not shown on the site)'),
    text('phone', 'Phone (private, not shown on the site)'),
    yesNo('mentor', 'Open to mentoring students'),
  ],
})

export const Departments = make({
  slug: 'departments', singular: 'Department', plural: 'Departments', group: ACADEMICS, title: 'name', orderable: true,
  columns: ['name', 'code', 'type', 'assoc'],
  description: 'Each department gets its own page. If the department\'s association has a website, add it and their latest posts are pulled in automatically every day.',
  imageFields: ['photo'],
  fields: [
    text('name', 'Name', { required: true }),
    text('code', 'Short code', { description: 'Two to four letters, for example MAT' }),
    select('type', 'Type', ['Department', 'Sub-department'], { required: true, defaultValue: 'Department' }),
    area('about', 'About'),
    text('hod', 'Head of Department'),
    text('rep', 'Department president or rep'),
    text('assoc', 'Departmental association', { description: 'For example: NAMSSN UNILAG' }),
    link('site', 'Association website', { description: 'Their latest posts are fetched from here automatically.' }),
    text('newsPath', 'Where their news lives (optional)', { description: 'Only if their news is not on the home page, for example /blog or /announcements. Leave empty to let the site find it.' }),
    instagram('instagram', 'Association Instagram (no @)'),
    text('email', 'Department email'),
    photo('photo', 'Photo'),
    { name: 'lastFetched', type: 'date', label: 'Last time their site was checked', admin: { readOnly: true, position: 'sidebar' } } as Field,
    { name: 'fetchNote', type: 'text', label: 'Last fetch result', admin: { readOnly: true, position: 'sidebar' } } as Field,
  ],
})

export const Resources = make({
  slug: 'resources', singular: 'Resource', plural: 'Resources & materials', group: ACADEMICS, title: 'title', orderable: true,
  columns: ['title', 'type', 'department', 'level'],
  description: 'Past questions, course materials, timetables, handbooks and forms. Each one is a link to Google Drive or any other file host.',
  fields: [
    text('title', 'Title', { required: true }),
    select('type', 'Type', ['Past Questions', 'Course Materials', 'Lecture Notes', 'Timetable', 'Handbook', 'Form', 'Other'], { required: true, defaultValue: 'Past Questions' }),
    dept('department', 'Department', { description: 'Leave empty for all departments.' }),
    select('level', 'Level', ['All levels', '100', '200', '300', '400', '500'], { defaultValue: 'All levels' }),
    link('link', 'Link (Google Drive, etc.)', { required: true }),
  ],
})

export const Research = make({
  slug: 'research', singular: 'Paper', plural: 'Research papers', group: ACADEMICS, title: 'title',
  columns: ['title', 'authors', 'department', 'year'], defaultSort: '-year',
  fields: [
    text('title', 'Paper title', { required: true }),
    text('authors', 'Authors', { required: true }),
    dept(),
    text('journal', 'Journal or conference'),
    text('year', 'Year'),
    link('link', 'Link'),
  ],
})

export const Opportunities = make({
  slug: 'opportunities', singular: 'Opportunity', plural: 'Opportunities', group: PUBLISH, title: 'title', drafts: true,
  columns: ['title', 'type', 'org', 'deadline', '_status'], defaultSort: 'deadline',
  fields: [
    text('title', 'Title', { required: true }),
    select('type', 'Type', ['Internship', 'Scholarship', 'Competition', 'Job', 'Fellowship', 'Conference', 'Training'], { required: true, defaultValue: 'Internship' }),
    text('org', 'Organisation'),
    day('deadline', 'Deadline'),
    area('description', 'Details'),
    link('link', 'Apply link', { required: true }),
  ],
})

export const Partners = make({
  slug: 'partners', singular: 'Partner', plural: 'Partners & sponsors', group: PARTNERS, title: 'name', orderable: true,
  columns: ['name', 'tier'],
  imageFields: ['logo'],
  fields: [
    text('name', 'Name', { required: true }),
    select('tier', 'Role', ['Headline Sponsor', 'Platinum Sponsor', 'Gold Sponsor', 'Silver Sponsor', 'Bronze Sponsor', 'Programme Partner', 'Media Partner'], { required: true, defaultValue: 'Programme Partner' }),
    photo('logo', 'Logo'),
    text('note', 'What they supported'),
    link('link', 'Website'),
  ],
})

export const Tiers = make({
  slug: 'tiers', singular: 'Sponsorship tier', plural: 'Sponsorship tiers', group: PARTNERS, title: 'name', orderable: true,
  columns: ['name', 'price', 'featured'],
  fields: [
    text('name', 'Tier name', { required: true }),
    text('price', 'Price', { required: true, description: 'For example: ₦2,000,000' }),
    text('tag', 'One-line summary'),
    area('benefits', 'Benefits (one per line)', { required: true, rows: 8 }),
    yesNo('featured', 'Highlight this tier'),
  ],
})

export const Merch = make({
  slug: 'merch', singular: 'Merchandise item', plural: 'Merchandise', group: PUBLISH, title: 'name', orderable: true, drafts: true,
  columns: ['name', 'price', 'availability', '_status'],
  imageFields: ['photo'],
  fields: [
    text('name', 'Item', { required: true }),
    text('price', 'Price', { required: true, description: 'For example: ₦8,000' }),
    photo('photo', 'Photo'),
    text('note', 'Sizes, colours or notes'),
    link('link', 'Order link (WhatsApp, form or store)'),
    select('availability', 'Availability', ['Available', 'Pre-order', 'Sold out'], { required: true, defaultValue: 'Available' }),
  ],
})

export const Faqs = make({
  slug: 'faqs', singular: 'Question', plural: 'FAQs', group: PUBLISH, title: 'q', orderable: true,
  columns: ['q'],
  fields: [text('q', 'Question', { required: true }), area('a', 'Answer', { required: true })],
})

/** Posts pulled automatically from departmental association websites. */
export const ExternalPosts: CollectionConfig = {
  slug: 'external-posts',
  labels: { singular: 'Post from a departmental site', plural: 'Posts from departmental sites' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'department', 'publishedAt', 'source'],
    group: ACADEMICS,
    description:
      'Fetched automatically every day from each department\'s association website. You can hide a post by unticking "Show on the site"; the fetcher will not re-add it.',
  },
  access: { read: anyone, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  defaultSort: '-publishedAt',
  hooks: { afterChange: [() => revalidateSite()], afterDelete: [() => revalidateSite()] },
  fields: [
    text('title', 'Title', { required: true }),
    { name: 'url', type: 'text', label: 'Link', required: true, unique: true, index: true } as Field,
    dept('department', 'Department', { required: true }),
    text('source', 'Source site'),
    area('excerpt', 'Excerpt'),
    text('image', 'Image URL'),
    { name: 'publishedAt', type: 'date', label: 'Published' } as Field,
    { name: 'visible', type: 'checkbox', label: 'Show on the site', defaultValue: true } as Field,
    { name: 'fetchedAt', type: 'date', admin: { readOnly: true, position: 'sidebar' } } as Field,
  ],
}

export const contentCollections: CollectionConfig[] = [
  News, Events, Spotlights, Announcements, Articles, Newsletters, Gallery, Opportunities, Merch, Faqs,
  Excos, PastExcos, Reps, Patrons,
  Departments, Resources, Research, ExternalPosts,
  Partners, Tiers, Alumni,
]
