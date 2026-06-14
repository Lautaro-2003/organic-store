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
        success: 'http://localhost:3000/carrito/resultado?status=approved',
        failure: 'http://localhost:3000/carrito/resultado?status=rejected',
        pending: 'http://localhost:3000/carrito/resultado?status=pending',
      },
      // auto_return: 'approved',
      statement_descriptor: 'TIENDA ORGANICA',
      payment_methods: {
        excluded_payment_types: [],
        installments: 12,
      },
    };

    console.log('[MP] Preferencia a enviar:', JSON.stringify(body, null, 2));

    const preference = await new Preference(client).create({ body });

    return Response.json({
      id: preference.id,
      init_point: preference.init_point,
    });
  } catch (error) {
    console.error('[MP] Error creating preference:', error);
    return Response.json(
      { error: (error as Error)?.message || String(error) },
      { status: 500 }
    );
  }
}
