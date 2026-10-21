import type { CollectionAfterChangeHook } from 'payload'

const idOf = (v: unknown): number | string | null => {
  if (v == null) return null
  if (typeof v === 'object') return (v as { id?: number | string }).id ?? null
  return v as number | string
}

/**
 * Whenever a photo on any item is set or changed, mark that photo
 * "Also show in the Gallery" so the Gallery grows on its own.
 */
export const autoGallery =
  (imageFields: string[], labelOf: (doc: Record<string, unknown>) => string): CollectionAfterChangeHook =>
  async ({ doc, previousDoc, req }) => {
    for (const f of imageFields) {
      const now = idOf(doc?.[f])
      const before = idOf(previousDoc?.[f])
      if (!now || now === before) continue
      try {
        const media = await req.payload.findByID({ collection: 'media', id: now, depth: 0 })
        if (!media || media.addToGallery) continue
        if (!String(media.mimeType || '').startsWith('image/')) continue
        await req.payload.update({
          collection: 'media',
          id: now,
          data: { addToGallery: true, galleryCaption: media.galleryCaption || labelOf(doc) },
          depth: 0,
          overrideAccess: true,
        })
      } catch (e) {
        req.payload.logger.warn(`autoGallery: ${(e as Error).message}`)
      }
    }
    return doc
  }
