import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsFromCart = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );
      if (productsFromCart) {
        setProducts(JSON.parse(productsFromCart));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productAlreadyCart = products.filter(
        productCart => productCart.id === product.id,
      );

      if (productAlreadyCart[0]) {
        productAlreadyCart[0].quantity += 1;
        setProducts([...products]);
      } else {
        const addProduct = { ...product, quantity: 1 };
        setProducts([...products, addProduct]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productAlreadyCart = products.filter(
        productCart => productCart.id === id,
      );

      if (productAlreadyCart[0]) {
        productAlreadyCart[0].quantity += 1;
      }

      setProducts([...products]);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productAlreadyCart = products.filter(
        productCart => productCart.id === id,
      );

      if (productAlreadyCart[0]) {
        productAlreadyCart[0].quantity -= 1;
      }

      if (productAlreadyCart[0].quantity === 0) {
        setProducts([...products.filter(productCart => productCart.id !== id)]);
      } else {
        setProducts([...products]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );

      // await AsyncStorage.removeItem('@GoMarketplace:products');
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
