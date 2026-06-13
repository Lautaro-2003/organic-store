import { readProducts } from '@/lib/products';

export async function GET(request: Request) {
  const products = readProducts();
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
