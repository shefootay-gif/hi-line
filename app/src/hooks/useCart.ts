import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: number;
  name: string;
  nameAr: string | null;
  scent: string;
  scentColor: string | null;
  price: string;
  salePrice: string | null;
  image: string | null;
  quantity: number;
  stock?: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getDiscountAmount: () => number;
}

type NormalizedCartItem = Omit<CartItem, "stock"> & { stock: number };

const parsePositiveInt = (value: unknown, fallback = 1) => {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.floor(parsed));
};

const parseMoney = (value: unknown) => {
  const parsed = typeof value === "number" ? value : parseFloat(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeText = (value: unknown) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizePriceString = (value: unknown) => {
  const parsed = parseMoney(value);
  return parsed.toFixed(2);
};

const normalizeCartItem = (item: Partial<CartItem> & Pick<CartItem, "productId">): NormalizedCartItem => {
  const stock = parsePositiveInt(item.stock, 1);
  const quantity = Math.max(1, Math.min(parsePositiveInt(item.quantity, 1), stock || 1));

  return {
    productId: item.productId,
    name: typeof item.name === "string" && item.name.trim() ? item.name : "",
    nameAr: normalizeText(item.nameAr),
    scent: typeof item.scent === "string" && item.scent.trim() ? item.scent : "",
    scentColor: normalizeText(item.scentColor),
    price: normalizePriceString(item.price),
    salePrice: normalizeText(item.salePrice),
    image: normalizeText(item.image),
    quantity,
    stock,
  };
};

const normalizeCartItems = (items: Array<Partial<CartItem> & Pick<CartItem, "productId">>) =>
  items
    .map((item) => normalizeCartItem(item))
    .filter((item) => item.quantity > 0 && item.stock > 0);

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const normalizedItem = normalizeCartItem(item);
          if (normalizedItem.stock <= 0) {
            return { items: normalizeCartItems(state.items) };
          }
          const items = normalizeCartItems(state.items);
          const existing = items.find(
            (i) => i.productId === item.productId
          );
          if (existing) {
            const existingItem = normalizeCartItem(existing);
            const newQuantity = Math.min(
              existingItem.quantity + 1,
              existingItem.stock || normalizedItem.stock
            );
            return {
              items: items.map((i) =>
                i.productId === item.productId ? { ...i, quantity: newQuantity } : i
              ),
            };
          }
          return { items: [...items, normalizedItem] };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: normalizeCartItems(state.items).filter((i) => i.productId !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => {
          const items = normalizeCartItems(state.items);
          if (quantity <= 0) {
            return {
              items: items.filter((i) => i.productId !== productId),
            };
          }
          return {
            items: items.map((i) => {
              if (i.productId === productId) {
                // Enforce stock limit
                return { ...i, quantity: Math.min(quantity, i.stock ?? quantity) };
              }
              return i;
            }),
          };
        }),
      clearCart: () => set({ items: [] }),
      getTotalItems: () => {
        return normalizeCartItems(get().items).reduce(
          (sum, item) => sum + item.quantity,
          0
        );
      },
      getTotalPrice: () => {
        const totalItems = get().getTotalItems();
        const baseTotal = normalizeCartItems(get().items).reduce((sum, item) => {
          const price = item.salePrice ? parseMoney(item.salePrice) : parseMoney(item.price);
          return sum + price * item.quantity;
        }, 0);
        return totalItems >= 3 ? baseTotal * 0.85 : baseTotal;
      },
      getDiscountAmount: () => {
        const totalItems = get().getTotalItems();
        if (totalItems < 3) return 0;
        const baseTotal = normalizeCartItems(get().items).reduce((sum, item) => {
          const price = item.salePrice ? parseMoney(item.salePrice) : parseMoney(item.price);
          return sum + price * item.quantity;
        }, 0);
        return baseTotal * 0.15;
      },
    }),
    {
      name: "hiline-cart",
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as Partial<CartState> | undefined;
        return {
          items: normalizeCartItems(state?.items ?? []),
        };
      },
    }
  )
);

useCart.setState((state) => ({
  items: normalizeCartItems(state.items),
}));
