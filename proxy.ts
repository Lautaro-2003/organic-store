import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAdminRoute = pathname.startsWith('/admin')
  const isAdminLogin = pathname === '/admin/login'
  const isAdminApi = pathname.startsWith('/api/admin')

  if (isAdminApi) {
    const sessionCookie = request.cookies.get('session')?.value
    const session = await decrypt(sessionCookie)

    if (!session?.userId) {
      return Response.json({ error: 'No autorizado' }, { status: 401 })
    }

    return NextResponse.next()
  }

  if (isAdminRoute && !isAdminLogin) {
    const sessionCookie = request.cookies.get('session')?.value
    const session = await decrypt(sessionCookie)

    if (!session?.userId) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
