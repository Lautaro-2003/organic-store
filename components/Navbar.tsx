"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/context/AuthContext';
import { ShoppingBag, Leaf, Menu, X, ArrowRight, LogOut, User, UserCircle, Package, Search } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; price: number; category: string }[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  
  // Conectamos con el store de Zustand de forma reactiva
  const cart = useCartStore((state) => state.cart);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const { user, isAdmin, loading: authLoading, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data.products?.slice(0, 6) || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Productos', path: '/productos' },
  ];

  return (
    <nav className={`relative sticky top-0 z-50 transition-all duration-300 px-6 py-4 md:px-12 flex justify-between items-center ${
      isScrolled 
        ? "bg-stone-50/80 backdrop-blur-lg border-b border-stone-200/50 shadow-sm" 
        : "bg-stone-50/50 backdrop-blur-sm border-b border-transparent"
    }`}>
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 group">
        <div className="bg-emerald-600 text-white p-2 rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-md shadow-emerald-600/10">
          <Leaf className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-black tracking-tight text-emerald-950 leading-none">ORGÁNICO</span>
          <span className="text-[10px] text-emerald-700/80 font-bold tracking-widest uppercase">Bio Mercado</span>
        </div>
      </Link>
      
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-stone-600">
        {navLinks.map((link) => {
          const isActive = pathname === link.path;
          return (
            <Link 
              key={link.path} 
              href={link.path} 
              className={`relative py-1.5 transition duration-250 hover:text-emerald-800 ${
                isActive ? 'text-emerald-900 font-bold' : 'text-stone-600'
              }`}
            >
              {link.name}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
              )}
            </Link>
          );
        })}

        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="p-2 text-stone-500 hover:text-emerald-700 transition rounded-lg hover:bg-stone-100"
          aria-label="Buscar"
        >
          <Search className="w-4 h-4" />
        </button>

        {!authLoading && (
          user || isAdmin ? (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="p-1.5 text-stone-500 hover:text-emerald-700 transition rounded-lg hover:bg-stone-100"
                aria-label="Menú de usuario"
              >
                <UserCircle className="w-5 h-5" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden z-50">
                  {isAdmin ? (
                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-stone-600 hover:text-emerald-700 hover:bg-stone-50 transition"
                    >
                      <User className="w-4 h-4" />
                      Panel Admin
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/perfil"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-stone-600 hover:text-emerald-700 hover:bg-stone-50 transition"
                      >
                        <User className="w-4 h-4" />
                        Mis datos
                      </Link>
                      <div className="border-t border-stone-100" />
                      <Link
                        href="/mis-compras"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-stone-600 hover:text-emerald-700 hover:bg-stone-50 transition"
                      >
                        <Package className="w-4 h-4" />
                        Mis Compras
                      </Link>
                    </>
                  )}
                  <div className="border-t border-stone-100" />
                  <button
                    onClick={async () => { await signOut(); router.push('/') }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-emerald-700 transition py-1.5"
            >
              <User className="w-3.5 h-3.5" />
              Ingresar
            </Link>
          )
        )}
        
        <Link 
          href="/carrito" 
          className="bg-emerald-900 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-full flex items-center gap-2.5 text-xs font-bold transition-all duration-300 shadow-md shadow-emerald-900/10 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
        >
          <div className="relative">
            <ShoppingBag className="w-4 h-4" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse">
                {totalItems}
              </span>
            )}
          </div>
          <span>Mi Carrito</span>
        </Link>
      </div>

      {/* Mobile Menu & Cart Button */}
      <div className="flex items-center gap-4 md:hidden">
        <Link 
          href="/carrito" 
          className="relative bg-emerald-900 text-white p-2.5 rounded-full flex items-center justify-center shadow-md shadow-emerald-900/10"
        >
          <ShoppingBag className="w-4 h-4" />
          {totalItems > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-amber-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {totalItems}
            </span>
          )}
        </Link>

        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="p-2 text-stone-500 hover:text-emerald-700 transition rounded-lg hover:bg-stone-100"
          aria-label="Buscar"
        >
          <Search className="w-4 h-4" />
        </button>
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-stone-800 focus:outline-none p-1.5 hover:bg-stone-200/50 rounded-lg transition"
          aria-label="Abrir menú"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Search Dropdown */}
      {searchOpen && (
        <div ref={searchRef} className="absolute right-0 top-full mt-2 w-80 bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden z-50" style={{ right: '24px' }}>
          <div className="p-3 border-b border-stone-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {searchLoading ? (
              <div className="p-4 text-center text-xs text-stone-400">Buscando...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map(product => (
                <button
                  key={product.id}
                  onClick={() => { router.push(`/productos/${product.id}`); setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-50 transition text-left"
                >
                  <div>
                    <p className="text-sm font-semibold text-stone-900">{product.name}</p>
                    <p className="text-[10px] text-stone-400">{product.category}</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-700">$ {product.price.toLocaleString('es-AR')}</span>
                </button>
              ))
            ) : searchQuery.trim() ? (
              <div className="p-4 text-center text-xs text-stone-400">No se encontraron productos</div>
            ) : null}
          </div>
        </div>
      )}

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-stone-50 border-b border-stone-200 p-6 flex flex-col gap-4 shadow-xl md:hidden animate-in slide-in-from-top duration-200 z-40">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link 
                key={link.path} 
                href={link.path} 
                onClick={() => setIsOpen(false)}
                className={`py-2 px-4 rounded-xl flex justify-between items-center font-bold text-sm transition-colors ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-950' 
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <span>{link.name}</span>
                <ArrowRight className="w-4 h-4 opacity-70" />
              </Link>
            );
          })}
          {!authLoading && (
            user || isAdmin ? (
              <>
                {isAdmin ? (
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="py-2 px-4 rounded-xl flex justify-between items-center font-bold text-sm text-stone-600 hover:bg-stone-100 transition-colors"
                  >
                    <span>Panel Admin</span>
                    <User className="w-4 h-4 opacity-70" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/perfil"
                      onClick={() => setIsOpen(false)}
                      className="py-2 px-4 rounded-xl flex justify-between items-center font-bold text-sm text-stone-600 hover:bg-stone-100 transition-colors"
                    >
                      <span>Mis datos</span>
                      <User className="w-4 h-4 opacity-70" />
                    </Link>
                    <Link
                      href="/mis-compras"
                      onClick={() => setIsOpen(false)}
                      className="py-2 px-4 rounded-xl flex justify-between items-center font-bold text-sm text-stone-600 hover:bg-stone-100 transition-colors"
                    >
                      <span>Mis Compras</span>
                      <Package className="w-4 h-4 opacity-70" />
                    </Link>
                  </>
                )}
                <button
                  onClick={async () => { await signOut(); setIsOpen(false); router.push('/') }}
                  className="py-2 px-4 rounded-xl flex justify-between items-center font-bold text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <span>Cerrar Sesión</span>
                  <LogOut className="w-4 h-4 opacity-70" />
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setIsOpen(false)}
                className="py-2 px-4 rounded-xl flex justify-between items-center font-bold text-sm text-stone-600 hover:bg-stone-100 transition-colors"
              >
                <span>Ingresar</span>
                <User className="w-4 h-4 opacity-70" />
              </Link>
            )
          )}
        </div>
      )}
    </nav>
  );
}