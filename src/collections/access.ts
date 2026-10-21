import type { Access, CollectionConfig, FieldAccess } from 'payload'
import { revalidateTag } from 'next/cache'

export const SITE_TAG = 'pessa-site'

export const isLoggedIn: Access = ({ req }) => Boolean(req.user)
export const isAdmin: Access = ({ req }) => req.user?.role === 'admin'
export const isAdminField: FieldAccess = ({ req }) => req.user?.role === 'admin'
export const anyone: Access = () => true

/** Make the public site re-render after any change to a collection or global. */
export function revalidateSite(): void {
  try {
    // expire: 0 = the next visitor gets fresh data, not a stale copy
    revalidateTag(SITE_TAG, { expire: 0 })
  } catch {
    /* outside a Next request (CLI, migrations) */
  }
}

export const siteHooks: NonNullable<CollectionConfig['hooks']> = {
  afterChange: [() => revalidateSite()],
  afterDelete: [() => revalidateSite()],
}
