import { MercadoPagoConfig, Preference } from 'mercadopago';

export async function POST(request: Request) {
  try {
    const { items } = await request.json();

    if (!items || items.length === 0) {
      return Response.json({ error: 'Carrito vacío' }, { status: 400 });
    }

    const token = process.env.MP_ACCESS_TOKEN;
    if (!token || token === 'xxx') {
      return Response.json(
        { error: 'Mercado Pago no está configurado. Reemplazá MP_ACCESS_TOKEN en .env.local' },
        { status: 500 }
      );
    }

    const client = new MercadoPagoConfig({ accessToken: token });

    const body = {
      items: items.map((item: { id: string; name: string; quantity: number; price: number }) => ({
        id: item.id,
        title: item.name,
        quantity: Number(item.quantity),
        unit_price: Number(item.price),
        currency_id: 'ARS',
      })),
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_URL}/carrito/resultado?status=success`,
        failure: `${process.env.NEXT_PUBLIC_URL}/carrito/resultado?status=failure`,
        pending: `${process.env.NEXT_PUBLIC_URL}/carrito/resultado?status=pending`,
      },
      auto_return: 'approved',
      statement_descriptor: 'TIENDA ORGANICA',
    };

    const preference = await new Preference(client).create({ body });

    return Response.json({
      id: preference.id,
      init_point: preference.init_point,
    });
  } catch (error) {
    console.error('[MP] Error creating preference:', error);
    return Response.json(
      { error: 'Error al crear la preferencia de pago. Verificá tus credenciales de Mercado Pago.' },
      { status: 500 }
    );
  }
}
