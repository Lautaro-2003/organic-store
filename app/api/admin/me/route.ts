import { cookies } from 'next/headers'
import { decrypt } from '@/lib/session'

export async function GET() {
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie)

  if (!session?.userId) {
    return Response.json({ isAdmin: false })
  }

  return Response.json({
    isAdmin: true,
    email: process.env.ADMIN_EMAIL || 'admin@organico.com',
  })
}
