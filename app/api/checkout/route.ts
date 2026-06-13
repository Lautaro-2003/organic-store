export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, customer } = body;

    if (!items || items.length === 0) {
      return Response.json({ error: 'Carrito vacío' }, { status: 400 });
    }

    const total = items.reduce(
      (acc: number, item: { price: number; quantity: number }) =>
        acc + item.price * item.quantity,
      0
    );

    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();

    console.log(`[Checkout] Orden ${orderId} creada — Total: $${total}`);
    if (customer) console.log(`[Checkout] Cliente: ${customer.email || 'sin email'}`);

    return Response.json({
      success: true,
      orderId,
      total,
      message: 'Orden confirmada. Te contactaremos para coordinar el pago y envío.',
    });
  } catch {
    return Response.json({ error: 'Error al procesar la orden' }, { status: 500 });
  }
}
