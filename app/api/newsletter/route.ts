import nodemailer from 'nodemailer';

function createTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST || SMTP_HOST === 'smtp.ejemplo.com') {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

function welcomeEmailHtml(email: string) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <tr>
      <td style="padding:32px 24px 0;text-align:center;">
        <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
          <tr>
            <td style="background:#059669;border-radius:12px;padding:10px 14px;">
              <span style="color:#fff;font-size:20px;font-weight:900;letter-spacing:1px;">ORGÁNICO</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 24px 0;text-align:center;">
        <h1 style="margin:0;font-size:24px;color:#1c1917;font-weight:800;">¡Gracias por suscribirte!</h1>
        <p style="margin:12px 0 0;color:#78716c;font-size:15px;line-height:1.6;">
          Bienvenido a la comunidad <strong style="color:#059669;">Orgánico</strong>. A partir de ahora vas a recibir:
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:24px;">
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding:12px 16px;background:#f0fdf4;border-radius:12px;font-size:14px;color:#1c1917;">
              <span style="font-size:18px;margin-right:8px;">🌿</span>
              <strong>Novedades</strong> — Productos nuevos y lanzamientos exclusivos antes que nadie.
            </td>
          </tr>
          <tr><td style="height:8px;"></td></tr>
          <tr>
            <td style="padding:12px 16px;background:#f0fdf4;border-radius:12px;font-size:14px;color:#1c1917;">
              <span style="font-size:18px;margin-right:8px;">🥗</span>
              <strong>Recetas saludables</strong> — Ideas fáciles con ingredientes orgánicos de temporada.
            </td>
          </tr>
          <tr><td style="height:8px;"></td></tr>
          <tr>
            <td style="padding:12px 16px;background:#f0fdf4;border-radius:12px;font-size:14px;color:#1c1917;">
              <span style="font-size:18px;margin-right:8px;">🎉</span>
              <strong>Ofertas exclusivas</strong> — Descuentos y promociones solo para suscriptores.
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 24px 24px;text-align:center;">
        <p style="margin:0;color:#a8a29e;font-size:12px;">
          Este correo fue enviado a <span style="color:#78716c;">${email}</span><br />
          Si no te suscribiste, podés ignorar este mensaje.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'Email inválido' }, { status: 400 });
    }

    console.log(`[Newsletter] Nuevo suscriptor: ${email}`);

    const transporter = createTransport();

    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || 'noreply@organico.com',
          to: email,
          subject: '🌿 ¡Bienvenido a Orgánico!',
          html: welcomeEmailHtml(email),
        });

        console.log(`[Newsletter] Email de bienvenida enviado a ${email}`);
      } catch (mailErr) {
        console.error('[Newsletter] Error al enviar email:', mailErr);
      }
    } else {
      console.log('[Newsletter] SMTP no configurado. Email no enviado (modo desarrollo).');
    }

    return Response.json({
      success: true,
      message: 'Suscripción exitosa',
      emailed: !!transporter,
    });
  } catch {
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
