import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { resendAdapter } from '@payloadcms/email-resend'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Submissions } from './collections/Submissions'
import { contentCollections } from './collections/content'
import { Settings } from './globals/Settings'
import { adminEndpoints } from './lib/endpoints'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const useS3 = Boolean(process.env.S3_BUCKET && process.env.S3_ENDPOINT && process.env.S3_ACCESS_KEY_ID)
const publicBase = (process.env.S3_PUBLIC_URL || '').replace(/\/$/, '')

export default buildConfig({
  serverURL: process.env.SITE_URL || undefined,
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' | PESSA UNILAG', description: 'Edit the PESSA UNILAG website' },
    components: {
      beforeDashboard: ['/components/Welcome#Welcome'],
      graphics: { Logo: '/components/Logo#Logo', Icon: '/components/Logo#Icon' },
    },
    avatar: 'default',
    dateFormat: 'd MMM yyyy',
  },
  collections: [...contentCollections, Submissions, Media, Users],
  globals: [Settings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
    // Schema changes are applied with migrations (pnpm payload migrate), which runs at build time on Vercel.
    push: process.env.NODE_ENV === 'development' && !process.env.DISABLE_DB_PUSH,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  email: process.env.RESEND_API_KEY
    ? resendAdapter({
        apiKey: process.env.RESEND_API_KEY,
        defaultFromAddress: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        defaultFromName: process.env.RESEND_FROM_NAME || 'PESSA UNILAG website',
      })
    : undefined,
  endpoints: adminEndpoints,
  sharp,
  upload: { limits: { fileSize: 12 * 1024 * 1024 } },
  plugins: [
    s3Storage({
      enabled: useS3,
      collections: {
        media: {
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename }) => `${publicBase}/${filename}`,
        },
      },
      bucket: process.env.S3_BUCKET || 'media',
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION || 'us-east-1',
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      },
    }),
  ],
})
