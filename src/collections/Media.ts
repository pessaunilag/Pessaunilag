import type { CollectionConfig } from 'payload'
import { anyone, isLoggedIn, siteHooks } from './access'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Photo', plural: 'Photos & files' },
  admin: {
    group: 'Library',
    description:
      'Every photo on the website lives here. Upload once, then pick it anywhere. Photos are resized automatically.',
  },
  access: { read: anyone, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  hooks: siteHooks,
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/*', 'application/pdf'],
    adminThumbnail: 'thumb',
    focalPoint: true,
    formatOptions: { format: 'webp', options: { quality: 82 } },
    resizeOptions: { width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true },
    imageSizes: [
      { name: 'thumb', width: 480, withoutEnlargement: true, formatOptions: { format: 'webp', options: { quality: 78 } } },
      { name: 'card', width: 1000, withoutEnlargement: true, formatOptions: { format: 'webp', options: { quality: 80 } } },
      { name: 'large', width: 1800, withoutEnlargement: true, formatOptions: { format: 'webp', options: { quality: 82 } } },
    ],
  },
  fields: [
    { name: 'alt', type: 'text', label: 'Short description (for accessibility)' },
    {
      name: 'addToGallery',
      type: 'checkbox',
      label: 'Also show this photo in the Gallery',
      defaultValue: false,
      admin: { description: 'Tick to add this photo to the public Gallery page automatically.' },
    },
    { name: 'galleryCaption', type: 'text', label: 'Gallery caption', admin: { condition: (d) => Boolean(d?.addToGallery) } },
    { name: 'galleryEvent', type: 'text', label: 'Event name (for the Gallery)', admin: { condition: (d) => Boolean(d?.addToGallery) } },
  ],
}
