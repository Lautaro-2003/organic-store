import { createSession } from '@/lib/session'
import { isAdminEmail } from '@/lib/dal'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@organico.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

    if (email !== adminEmail || password !== adminPassword) {
      return Response.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    if (!isAdminEmail(email)) {
      return Response.json({ error: 'No tienes permisos de administrador' }, { status: 403 })
    }

    await createSession('admin')

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
