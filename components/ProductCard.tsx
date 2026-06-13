"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore'; 
import { Star, Check, Plus } from 'lucide-react';

interface ProductCardProps {
  id: string; 
  name: string;
  category: string;
  price: number;
  image?: string;
  description?: string;
  rating?: number;
  stock?: number;
}

export default function ProductCard({ id, name, category, price, image, description, rating = 4.5, stock }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const cartItem = useCartStore((state) => state.cart.find((item) => item.id === id));
  const [isAdding, setIsAdding] = useState(false);
  const outOfStock = stock !== undefined && stock <= 0;
  const maxedOut = !outOfStock && stock !== undefined && (cartItem?.quantity || 0) >= stock;

  // Intentamos obtener una imagen por defecto o usar la provista
  const productImage = image || "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=600&q=80";

  const handleAdd = () => {
    if (maxedOut) return;
    setIsAdding(true);
    addToCart({ 
      id, 
      name, 
      category, 
      price, 
      quantity: 1,
      stock: stock ?? 0,
    });
    
    // Feedback visual breve
    setTimeout(() => {
      setIsAdding(false);
    }, 1200);
  };

  return (
    <div className="bg-white border border-stone-200 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-4 group flex flex-col">
      <div className="flex-1">
        <div className="bg-stone-100 rounded-xl aspect-[4/3] flex items-center justify-center relative overflow-hidden mb-4 border border-stone-100">
          <Image 
            src={productImage}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute top-2.5 left-2.5">
            <span className="text-[9px] font-extrabold tracking-widest text-emerald-800 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg uppercase shadow-sm border border-stone-100">
              {category}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 mb-1.5">
          <div className="flex items-center text-amber-400">
            <Star className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="text-[11px] font-bold text-stone-500">{rating.toFixed(1)}</span>
        </div>
        
        <h3 className="font-bold text-stone-900 text-base leading-tight group-hover:text-emerald-800 transition duration-200 line-clamp-2">
          {name}
        </h3>

        {description && (
          <p className="text-stone-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      
      <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-stone-100 shrink-0">
        <div className="flex flex-col">
          {outOfStock ? (
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider leading-none">Sin stock</span>
          ) : (
            <>
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider leading-none">Precio</span>
              <span className="text-xl font-black text-stone-900 mt-1">$ {price.toLocaleString('es-AR')}</span>
            </>
          )}
        </div>
        
        <button 
          onClick={handleAdd}
          disabled={isAdding || outOfStock || maxedOut}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-300 shadow-sm active:scale-95 ${
            outOfStock || maxedOut
              ? "bg-stone-200 text-stone-400 cursor-not-allowed"
              : isAdding 
                ? "bg-emerald-600 text-white shadow-emerald-600/10" 
                : "bg-emerald-950 hover:bg-emerald-800 text-white shadow-emerald-950/10 hover:shadow-md"
          }`}
        >
          {outOfStock || maxedOut ? (
            <span>{maxedOut ? 'Stock máximo' : 'Sin stock'}</span>
          ) : isAdding ? (
            <>
              <Check className="w-4 h-4" />
              <span>Agregado</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Agregar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}