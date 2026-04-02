import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const { items } = get();
        const existingItem = items.find((item) => item.product.id === product.id);
        
        if (product.stock === 0) {
          alert(`Sorry, ${product.name} is currently out of stock.`);
          return;
        }

        if (existingItem) {
          if (existingItem.quantity >= product.stock) {
            alert(`You cannot add more than ${product.stock} items of ${product.name}`);
            return;
          }
          set({
            items: items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({ items: [...items, { product, quantity: 1 }] });
        }
      },
      removeItem: (productId) => {
        const { items } = get();
        set({ items: items.filter((item) => item.product.id !== productId) });
      },
      updateQuantity: (productId, quantity) => {
        const { items } = get();
        const existingItem = items.find((item) => item.product.id === productId);
        
        if (!existingItem) return;
        if (quantity < 1) return;
        if (quantity > existingItem.product.stock) {
          alert(`You cannot add more than ${existingItem.product.stock} items of ${existingItem.product.name}`);
          return;
        }

        set({
          items: items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

export default useCartStore;
