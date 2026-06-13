import 'server-only'
import { cookies } from 'next/headers'
import { decrypt } from './session'

export async function verifySession() {
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie)

  if (!session?.userId) {
    return null
  }

  return { isAuth: true, userId: session.userId }
}

export function isAdminEmail(email: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL
  return adminEmail ? email === adminEmail : email === 'admin@organico.com'
}
