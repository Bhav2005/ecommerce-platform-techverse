import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const CartProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState(null);

  // Load cart from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error parsing cart from localStorage:', e);
        setCartItems([]);
      }
    }
  }, []);

  // Save cart to local storage on changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addItemToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.productId === product._id);
      
      if (existingItem) {
        // Check stock limit
        const updatedQty = existingItem.quantity + quantity;
        if (updatedQty > product.stock) {
          alert(`Cannot add more items. Only ${product.stock} items available in stock.`);
          return prevItems;
        }
        
        return prevItems.map(item =>
          item.productId === product._id
            ? { ...item, quantity: updatedQty }
            : item
        );
      } else {
        if (quantity > product.stock) {
          alert(`Cannot add item. Only ${product.stock} items available in stock.`);
          return prevItems;
        }
        return [...prevItems, {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          image: product.images[0] || '',
          stockLimit: product.stock
        }];
      }
    });
  };

  const removeItemFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.productId !== productId));
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeItemFromCart(productId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.productId === productId) {
          if (quantity > item.stockLimit) {
            alert(`Cannot set quantity to ${quantity}. Only ${item.stockLimit} items available in stock.`);
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
    setCouponError(null);
  };

  const applyCoupon = async (code) => {
    setCouponError(null);
    if (!token) {
      setCouponError('Please log in to apply coupons.');
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code })
      });

      const data = await response.json();

      if (!response.ok) {
        setCouponError(data.message || 'Invalid coupon.');
        setCoupon(null);
        return false;
      }

      setCoupon(data);
      return true;
    } catch (err) {
      setCouponError('Error validating coupon.');
      setCoupon(null);
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponError(null);
  };

  const getCartTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;

    if (coupon) {
      if (coupon.discountType === 'percentage') {
        discount = parseFloat((subtotal * (coupon.discountValue / 100)).toFixed(2));
      } else if (coupon.discountType === 'fixed') {
        discount = Math.min(coupon.discountValue, subtotal);
      }
    }

    const total = parseFloat((subtotal - discount).toFixed(2));

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      discount,
      total
    };
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      coupon,
      couponError,
      addItemToCart,
      removeItemFromCart,
      updateCartQuantity,
      clearCart,
      applyCoupon,
      removeCoupon,
      getCartTotals
    }}>
      {children}
    </CartContext.Provider>
  );
};
