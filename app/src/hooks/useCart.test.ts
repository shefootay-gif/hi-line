import { describe, it, expect, beforeEach } from 'vitest';
import { useCart } from './useCart';

describe('useCart', () => {
  beforeEach(() => {
    useCart.getState().clearCart();
  });

  it('should add an item to the cart', () => {
    const item = {
      productId: 1,
      name: 'Test Product',
      nameAr: 'منتج اختبار',
      scent: 'Fresh',
      scentColor: '#fff',
      price: '100.00',
      salePrice: null,
      image: null,
      stock: 10
    };

    useCart.getState().addItem(item);
    
    const items = useCart.getState().items;
    expect(items.length).toBe(1);
    expect(items[0].productId).toBe(1);
    expect(items[0].quantity).toBe(1);
  });

  it('should increase quantity if adding the same item', () => {
    const item = {
      productId: 1,
      name: 'Test Product',
      nameAr: null,
      scent: 'Fresh',
      scentColor: null,
      price: '100.00',
      salePrice: null,
      image: null,
      stock: 10
    };

    useCart.getState().addItem(item);
    useCart.getState().addItem(item);
    
    const items = useCart.getState().items;
    expect(items.length).toBe(1);
    expect(items[0].quantity).toBe(2);
  });

  it('should update item quantity', () => {
    const item = {
      productId: 1,
      name: 'Test Product',
      nameAr: null,
      scent: 'Fresh',
      scentColor: null,
      price: '100.00',
      salePrice: null,
      image: null,
      stock: 10
    };

    useCart.getState().addItem(item);
    useCart.getState().updateQuantity(1, 5);
    
    const items = useCart.getState().items;
    expect(items[0].quantity).toBe(5);
  });

  it('should calculate total price correctly', () => {
    useCart.getState().addItem({
      productId: 1,
      name: 'Item 1',
      nameAr: null,
      scent: 'Fresh',
      scentColor: null,
      price: '100.00',
      salePrice: null,
      image: null,
      stock: 10
    });
    
    useCart.getState().addItem({
      productId: 2,
      name: 'Item 2',
      nameAr: null,
      scent: 'Fresh',
      scentColor: null,
      price: '200.00',
      salePrice: '150.00',
      image: null,
      stock: 10
    });
    
    expect(useCart.getState().getTotalPrice()).toBe(250);
  });
});
