import type { Field, GlobalConfig } from 'payload'
import { anyone, isLoggedIn, revalidateSite } from '../collections/access'

const t = (name: string, label: string, description?: string, required?: boolean): Field =>
  ({ name, type: 'text', label, required, admin: { description } }) as Field
const a = (name: string, label: string, description?: string, rows = 5): Field =>
  ({ name, type: 'textarea', label, admin: { description, rows } }) as Field
const u = (name: string, label: string, description?: string): Field =>
  ({
    name, type: 'text', label,
    admin: { description: description || 'Must start with https://', placeholder: 'https://' },
    validate: (v: unknown) => (!v || /^https?:\/\/[^\s"'<>]+$/i.test(String(v)) ? true : 'Links must start with https://'),
  }) as Field
const p = (name: string, label: string, description?: string): Field =>
  ({ name, type: 'upload', relationTo: 'media', label, admin: { description } }) as Field

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Site settings',
  admin: {
    group: 'Settings',
    description: 'Name, logo, home page text, contact details, social links and the sponsorship numbers.',
  },
  access: { read: anyone, update: isLoggedIn },
  hooks: { afterChange: [() => revalidateSite()] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identity',
          fields: [
            p('logo', 'PESSA logo', 'Use a transparent PNG for the best result.'),
            t('name', 'Full name', undefined, true),
            t('short', 'Short name', undefined, true),
            t('faculty', 'Faculty'),
            t('university', 'University'),
            t('admin', 'Administration name', 'For example: The Pharonia'),
            t('session', 'Session', 'For example: 2026/2027'),
            t('founded', 'Founded'),
          ],
        },
        {
          label: 'Announcement bar',
          fields: [
            t('announcement', 'Announcement text', 'Shown at the very top of every page. Leave empty to hide the bar.'),
            u('announcementLink', 'Announcement link (optional)'),
          ],
        },
        {
          label: 'Home page',
          fields: [
            t('heroLine1', 'Headline, first part'),
            t('heroLine2', 'Headline, highlighted word'),
            a('heroSub', 'Text under the headline', undefined, 3),
            p('heroImage', 'Home page photo'),
            p('glanceImage', 'Photo behind the numbers band'),
            a('presidentQuote', 'Message from the President (home page quote)'),
          ],
        },
        {
          label: 'About',
          fields: [a('about', 'About PESSA', 'Leave an empty line between paragraphs.', 12), a('vision', 'Vision', undefined, 3), a('mission', 'Mission', undefined, 3)],
        },
        {
          label: 'Contact',
          fields: [
            {
              name: 'contacts',
              type: 'array',
              label: 'Contact people',
              labels: { singular: 'Person', plural: 'People' },
              fields: [t('name', 'Name', undefined, true), t('role', 'Role'), t('phone', 'Phone', 'For example: 0803 123 4567')],
            } as Field,
            t('waNumber', 'WhatsApp number for website messages', 'People can also send their form on WhatsApp to this number.'),
            t('email', 'Email'),
            t('address', 'Address'),
            u('waCommunity', 'WhatsApp community link'),
            t('instagram', 'Instagram handle (no @)'),
            u('linkedin', 'LinkedIn page link'),
            t('linkedinName', 'LinkedIn page name'),
            t('x', 'X handle (no @)'),
            t('tiktok', 'TikTok handle (no @)'),
          ],
        },
        {
          label: 'Forms',
          description: 'Website forms are stored in the Inbox and emailed to PESSA. If you add a Google Form link here, that form is used instead.',
          fields: [
            u('suggestionForm', 'Suggestion box form (optional)'),
            u('nominationForm', 'Spotlight nomination form (optional)'),
            u('alumniForm', 'Alumni sign-up form (optional)'),
            u('contactForm', 'Contact form (optional)'),
          ],
        },
        {
          label: 'Sponsorship',
          fields: [
            u('partnerDeck', 'Sponsorship deck link (PDF, optional)'),
            t('deckStudents', 'Students in the faculty'),
            t('deckIntake', 'New intake each year'),
            t('deckAges', 'Age range'),
            t('deckReach', 'Combined social reach'),
            t('deckEmail', 'Email database reach'),
          ],
        },
      ],
    },
  ],
}
