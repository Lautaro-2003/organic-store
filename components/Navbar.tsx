"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/context/AuthContext';
import { ShoppingBag, Leaf, Menu, X, ArrowRight, LogOut, User, Package } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  
  // Conectamos con el store de Zustand de forma reactiva
  const cart = useCartStore((state) => state.cart);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const { user, loading: authLoading, signOut } = useAuth();

  // Efecto para detectar scroll y agregar sombreado o estilos adicionales
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Productos', path: '/productos' },
  ];

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 px-6 py-4 md:px-12 flex justify-between items-center ${
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

        {!authLoading && (
          user ? (
            <>
              <Link
                href="/mis-compras"
                className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-emerald-700 transition py-1.5"
              >
                <Package className="w-3.5 h-3.5" />
                Mis Compras
              </Link>
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-red-600 transition py-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Salir
              </button>
            </>
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
          onClick={() => setIsOpen(!isOpen)}
          className="text-stone-800 focus:outline-none p-1.5 hover:bg-stone-200/50 rounded-lg transition"
          aria-label="Abrir menú"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

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
            user ? (
              <>
                <Link
                  href="/mis-compras"
                  onClick={() => setIsOpen(false)}
                  className="py-2 px-4 rounded-xl flex justify-between items-center font-bold text-sm text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  <span>Mis Compras</span>
                  <Package className="w-4 h-4 opacity-70" />
                </Link>
                <button
                  onClick={() => { signOut(); setIsOpen(false); }}
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