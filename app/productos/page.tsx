"use client";

import { useState, useEffect, useMemo } from 'react';
import ProductCard from '@/components/ProductCard';
import { Search, X, ArrowUpDown, Loader2 } from 'lucide-react';
import type { Product } from '@/types/product';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name';

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [sortBy, setSortBy] = useState<SortOption>('default');

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.products) setProducts(data.products);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const cats = products.map(p => p.category);
    return ['Todas', ...Array.from(new Set(cats))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const filtered = products.filter(product => {
      const matchesSearch = q === '' ||
        product.name.toLowerCase().includes(q) ||
        (product.description && product.description.toLowerCase().includes(q));
      const matchesCategory = selectedCategory === 'Todas' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    switch (sortBy) {
      case 'price-asc':
        return [...filtered].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...filtered].sort((a, b) => b.price - a.price);
      case 'name':
        return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
      default:
        return filtered;
    }
  }, [searchQuery, selectedCategory, sortBy, products]);

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="mb-10">
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">
          Almacén Natural
        </span>
        <h1 className="text-3xl font-black text-stone-900 tracking-tight">
          Todos los Productos
        </h1>
        <p className="text-stone-500 text-sm mt-2">
          {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-stone-200 rounded-xl py-3 pl-10 pr-10 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="relative">
          <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortOption)}
            className="appearance-none bg-white border border-stone-200 rounded-xl py-3 pl-10 pr-10 text-sm text-stone-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition cursor-pointer"
          >
            <option value="default">Ordenar por</option>
            <option value="price-asc">Precio: menor a mayor</option>
            <option value="price-desc">Precio: mayor a menor</option>
            <option value="name">Nombre A-Z</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
              selectedCategory === category
                ? 'bg-emerald-800 text-white shadow-md shadow-emerald-800/10'
                : 'bg-white text-stone-600 border border-stone-200 hover:border-emerald-300 hover:text-emerald-800'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              category={product.category}
              price={product.price}
              image={product.image}
              description={product.description}
              rating={product.rating}
              stock={product.stock}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-stone-400 text-lg font-semibold">No se encontraron productos</p>
          <p className="text-stone-400 text-sm mt-1">Intentá con otros términos de búsqueda</p>
        </div>
      )}
    </div>
  );
}
