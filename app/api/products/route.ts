import { readProducts } from '@/lib/products';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabaseAdmin() {
  if (!supabaseUrl || supabaseUrl === 'https://xxx.supabase.co') return null;
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function GET(request: Request) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    await supabase
      .from('stock_reservations')
      .delete()
      .lt('expires_at', new Date().toISOString())
  }

  let products = await readProducts();

  if (supabase) {
    const productIds = products.map(p => p.id)
    const { data: reservations } = await supabase
      .from('stock_reservations')
      .select('product_id, quantity')
      .in('product_id', productIds)
      .gt('expires_at', new Date().toISOString())

    const reservedMap = new Map<string, number>()
    if (reservations) {
      for (const r of reservations) {
        reservedMap.set(r.product_id, (reservedMap.get(r.product_id) || 0) + r.quantity)
      }
    }

    products = products.map(p => ({
      ...p,
      stock: Math.max(0, (p.stock ?? 0) - (reservedMap.get(p.id) || 0)),
    }))
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase() || '';
  const category = searchParams.get('category') || 'Todas';

  let filtered = products;

  if (search) {
    filtered = filtered.filter(
      p =>
        p.name.toLowerCase().includes(search) ||
        (p.description && p.description.toLowerCase().includes(search))
    );
  }

  if (category !== 'Todas') {
    filtered = filtered.filter(p => p.category === category);
  }

  const sort = searchParams.get('sort');
  if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  else if (sort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));

  return Response.json({
    products: filtered,
    total: filtered.length,
    categories: [...new Set(products.map(p => p.category))],
  });
}
