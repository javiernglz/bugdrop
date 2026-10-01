import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  function addToCart(product, quantity = 1) {
    setItems(prev => {
      const existing = prev.find(i => i.product_id === product.id);
      if (existing) {
        return prev.map(i =>
          i.product_id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, {
        product_id: product.id,
        name: product.name,
        image_emoji: product.image_emoji,
        unit_price: product.price,
        quantity,
      }];
    });
  }

  function removeFromCart(productId) {
    setItems(prev => prev.filter(i => i.product_id !== productId));
  }

  function clearCart() {
    setItems([]);
  }

  function updateQuantity(productId, quantity) {
    if (quantity <= 0) return removeFromCart(productId);
    setItems(prev =>
      prev.map(i => i.product_id === productId ? { ...i, quantity } : i)
    );
  }

  const total = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, total, count, addToCart, removeFromCart, clearCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
