"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package, Plus, Pencil, Trash2, X, Search, Leaf,
  ArrowUpDown, LogOut, Upload, ImageIcon, AlertTriangle,
  Check, Loader2, DollarSign, ShoppingBag, PackageCheck,
  ClipboardList, ChevronDown, ChevronUp, MapPin, Phone, User, Calendar,
} from 'lucide-react';
import type { Product } from '@/types/product';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  apartment?: string;
  neighborhood: string;
  province: string;
  zipCode: string;
  notes?: string;
}

interface Order {
  id: string;
  user_id: string;
  items: OrderItem[];
  total: number;
  status: string;
  shipping_address: ShippingAddress | null;
  created_at: string;
}

type Tab = 'productos' | 'ordenes';

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('productos');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    image: '',
    stock: '',
  });

  const [uploading, setUploading] = useState(false);

  async function fetchProducts() {
    try {
      const res = await fetch('/api/admin/products');
      if (res.status === 401) { router.push('/admin/login'); return; }
      const data = await res.json();
      setProducts(data.products);
    } catch {
      console.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }

  async function fetchOrders() {
    try {
      const res = await fetch('/api/admin/orders');
      if (res.status === 401) { router.push('/admin/login'); return; }
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch {
      console.error('Error al cargar órdenes');
    }
  }

  useEffect(() => {
    if (tab === 'productos') {
      void fetchProducts();
    } else {
      setLoading(true);
      void fetchOrders().finally(() => setLoading(false));
    }
  }, [tab]);

  useEffect(() => {
    if (tab === 'productos' && products.length === 0) {
      void fetchProducts();
    }
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  function openCreate() {
    setForm({ name: '', price: '', category: '', description: '', image: '', stock: '' });
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(product: Product) {
    setForm({
      name: product.name,
      price: String(product.price),
      category: product.category,
      description: product.description || '',
      image: product.image || '',
      stock: String(product.stock || ''),
    });
    setEditing(product.id);
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editing ? `/api/admin/products/${editing}` : '/api/admin/products';
      const method = editing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          price: Number(form.price),
          category: form.category,
          description: form.description,
          image: form.image,
          stock: Number(form.stock) || 0,
        }),
      });

      if (res.ok) {
        setShowForm(false);
        fetchProducts();
      }
    } catch {
      console.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteConfirm(null);
        fetchProducts();
      }
    } catch {
      console.error('Error al eliminar');
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setForm(prev => ({ ...prev, image: data.url }));
      }
    } catch {
      console.error('Error al subir imagen');
    } finally {
      setUploading(false);
    }
  }

  const filtered = products
    .filter(p => {
      if (!search) return true;
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'name': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const totalValue = products.reduce((sum, p) => sum + p.price * (p.stock || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 text-white p-2 rounded-xl shadow-md shadow-emerald-600/10">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black text-stone-900 tracking-tight leading-none">Panel Admin</h1>
              <p className="text-[10px] text-stone-500 font-bold tracking-widest uppercase">Gestión de Productos</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-stone-500 hover:text-emerald-700 transition px-3 py-2 rounded-lg hover:bg-stone-100"
            >
              Tienda
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-1 mb-6 bg-stone-100 rounded-xl p-1 w-fit">
          <button
            onClick={() => setTab('productos')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition ${
              tab === 'productos' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            Productos
          </button>
          <button
            onClick={() => setTab('ordenes')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition ${
              tab === 'ordenes' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            Órdenes
          </button>
        </div>

        {tab === 'productos' && (
        <>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Productos</p>
                <p className="text-2xl font-black text-stone-900">{products.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-amber-50 text-amber-700 p-3 rounded-xl">
                <PackageCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Stock Total</p>
                <p className="text-2xl font-black text-stone-900">{totalStock} unidades</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Valor Inventario</p>
                <p className="text-2xl font-black text-stone-900">$ {totalValue.toLocaleString('es-AR')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>
              <div className="relative">
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="appearance-none bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-9 pr-9 text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition cursor-pointer"
                >
                  <option value="name">Nombre</option>
                  <option value="price-asc">Precio ↑</option>
                  <option value="price-desc">Precio ↓</option>
                </select>
              </div>
            </div>
            <button
              onClick={openCreate}
              className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-all duration-200 flex items-center gap-1.5 shadow-lg shadow-emerald-800/10 hover:shadow-xl shrink-0"
            >
              <Plus className="w-4 h-4" />
              Nuevo Producto
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 text-stone-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="text-left px-5 py-3">Producto</th>
                  <th className="text-left px-5 py-3 hidden sm:table-cell">Categoría</th>
                  <th className="text-right px-5 py-3">Precio</th>
                  <th className="text-right px-5 py-3 hidden sm:table-cell">Stock</th>
                  <th className="text-right px-5 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-stone-400">
                      <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="font-semibold">No hay productos</p>
                      <p className="text-xs mt-1">Creá tu primer producto para empezar</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map(product => (
                    <tr key={product.id} className="hover:bg-stone-50/50 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-stone-100 overflow-hidden shrink-0 flex items-center justify-center">
                            {product.image && (product.image.startsWith('http') || product.image.startsWith('/')) ? (
                              <Image src={product.image} alt="" width={40} height={40} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-stone-300" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-stone-900 text-sm leading-tight">{product.name}</p>
                            <p className="text-[10px] text-stone-400 line-clamp-1 mt-0.5">{product.description || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-black text-stone-900">
                        $ {product.price.toLocaleString('es-AR')}
                      </td>
                      <td className="px-5 py-4 text-right hidden sm:table-cell">
                        <span className={`text-xs font-bold ${(product.stock || 0) > 5 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {product.stock ?? 0} unidades
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(product)}
                            className="p-2 text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(product.id)}
                            className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mt-12 mb-12" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-xl">
                  {editing ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="font-black text-stone-900">
                    {editing ? 'Editar Producto' : 'Nuevo Producto'}
                  </h2>
                  <p className="text-[10px] text-stone-500 font-bold tracking-wider uppercase">
                    {editing ? 'Modificá los datos del producto' : 'Completá los datos del nuevo producto'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Nombre del producto <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  required
                  placeholder="Ej: Almendras Premium"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Precio ($) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                    required
                    min={0}
                    placeholder="0"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Stock <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={e => setForm(p => ({ ...p, stock: e.target.value }))}
                    required
                    min={0}
                    placeholder="0"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Categoría <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition appearance-none cursor-pointer"
                >
                  <option value="">Seleccionar categoría</option>
                  <option value="Frutos Secos">Frutos Secos</option>
                  <option value="Orgánicos">Orgánicos</option>
                  <option value="Harinas">Harinas</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Descripción
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                  placeholder="Descripción breve del producto..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Imagen
                </label>
                {form.image && (
                  <div className="mb-3 relative w-32 h-32 rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                    <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm(p => ({ ...p, image: '' }))}
                      className="absolute top-1 right-1 bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-sm hover:bg-white transition"
                    >
                      <X className="w-3 h-3 text-stone-600" />
                    </button>
                  </div>
                )}
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={form.image}
                    onChange={e => setForm(p => ({ ...p, image: e.target.value }))}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                  <label className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold py-3 px-4 rounded-xl text-xs transition cursor-pointer shrink-0">
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">{uploading ? 'Subiendo...' : 'Subir'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold py-3 px-4 rounded-xl text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-emerald-800 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-emerald-800/10"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {editing ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        {tab === 'ordenes' && (
          <div className="space-y-4">
            {loading ? (
              <div className="py-20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center shadow-sm">
                <ClipboardList className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <p className="font-bold text-stone-900">No hay órdenes aún</p>
                <p className="text-sm text-stone-500 mt-1">Cuando los clientes realicen compras, aparecerán acá.</p>
              </div>
            ) : (
              orders.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                return (
                  <div key={order.id} className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
                    <button
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="w-full flex items-center justify-between p-5 hover:bg-stone-50/50 transition"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                          {order.status === 'confirmed' ? 'Confirmada' : order.status}
                        </span>
                        <div className="text-left">
                          <p className="font-bold text-stone-900 text-sm">
                            $ {order.total.toLocaleString('es-AR')}
                          </p>
                          <p className="text-[10px] text-stone-400 font-mono">
                            ID: {order.id.slice(0, 8)}... — {new Date(order.created_at).toLocaleDateString('es-AR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-500">{order.items.length} producto{order.items.length !== 1 ? 's' : ''}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-stone-100 px-5 pb-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                          <div>
                            <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-3">Productos</h4>
                            <div className="space-y-2">
                              {order.items.map((item: OrderItem) => (
                                <div key={item.id} className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-stone-900">{item.name}</span>
                                    <span className="text-stone-400">x{item.quantity}</span>
                                  </div>
                                  <span className="font-semibold text-stone-700">
                                    $ {(item.price * item.quantity).toLocaleString('es-AR')}
                                  </span>
                                </div>
                              ))}
                              <div className="border-t border-stone-100 pt-2 flex justify-between font-bold text-stone-900">
                                <span>Total</span>
                                <span>$ {order.total.toLocaleString('es-AR')}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-3">Datos de envío</h4>
                            {order.shipping_address ? (
                              <div className="space-y-2 text-sm text-stone-600">
                                <div className="flex items-center gap-2">
                                  <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                  <span className="font-medium text-stone-900">{order.shipping_address.fullName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                  <span>{order.shipping_address.phone}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                                  <div>
                                    <p>{order.shipping_address.street}</p>
                                    {order.shipping_address.apartment && (
                                      <p className="text-stone-400">Depto: {order.shipping_address.apartment}</p>
                                    )}
                                    <p className="text-stone-400">
                                      {order.shipping_address.neighborhood}, {order.shipping_address.province} — CP: {order.shipping_address.zipCode}
                                    </p>
                                  </div>
                                </div>
                                {order.shipping_address.notes && (
                                  <div className="bg-amber-50 text-amber-700 text-xs font-medium px-3 py-2 rounded-lg mt-2">
                                    Notas: {order.shipping_address.notes}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-stone-400">Sin datos de envío</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center">
            <div className="bg-red-50 text-red-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-stone-900 mb-2">Eliminar Producto</h3>
            <p className="text-stone-500 text-sm mb-8">
              ¿Estás seguro? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold py-3 px-4 rounded-xl text-xs transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
