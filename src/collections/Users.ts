import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminField } from './access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Team member', plural: 'Team (website editors)' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Settings',
    description:
      'People who can sign in and edit the website. Admins can also add or remove team members.',
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 14,
    maxLoginAttempts: 8,
    lockTime: 10 * 60 * 1000,
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: isAdmin,
    update: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'admin') return true
      return { id: { equals: req.user.id } }
    },
    delete: isAdmin,
    admin: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'name', type: 'text', required: true, admin: { description: 'Full name' } },
    { name: 'position', type: 'text', admin: { description: 'For example: General Secretary' } },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Admin (can manage the team)', value: 'admin' },
        { label: 'Editor (can edit all content)', value: 'editor' },
      ],
      access: { update: isAdminField, create: isAdminField },
    },
  ],
}
