import { create } from 'zustand';

// 1. Definimos el tipo de cada producto
export interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

// 2. Definimos qué tiene el estado global
interface CartState {
  cart: CartItem[];
  addToCart: (product: CartItem) => void;
  removeFromCart: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  clearCart: () => void;
}

// 3. Le pasamos el tipo <CartState> a la función create
export const useCartStore = create<CartState>((set) => ({
  cart: [],
  addToCart: (product) => 
    set((state) => {
      const existing = state.cart.find((item) => item.id === product.id);
      if (existing) {
        return {
          cart: state.cart.map((item) => 
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          )
        };
      }
      return { cart: [...state.cart, product] };
    }),
  removeFromCart: (id) => 
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== id)
    })),
  decreaseQuantity: (id) =>
    set((state) => {
      const existing = state.cart.find((item) => item.id === id);
      if (existing && existing.quantity > 1) {
        return {
          cart: state.cart.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity - 1 } : item
          )
        };
      }
      return { cart: state.cart.filter((item) => item.id !== id) };
    }),
  clearCart: () => set({ cart: [] })
}));