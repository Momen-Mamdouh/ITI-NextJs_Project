"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import {
  readCartFromStorage,
  writeCartToStorage,
  type CartLine,
} from "@/lib/cart-client";
import {
  getCustomerCart,
  mergeGuestCartIntoAccount,
  saveCustomerCart,
} from "@/features/cart/cart-actions";

type SessionUser = { id: string; role: string } | null;

type CartContextValue = {
  items: CartLine[];
  itemCount: number;
  subtotal: number;
  isHydrated: boolean;
  user: SessionUser;
  addItem: (line: CartLine) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearLocal: () => void;
  syncToServer: () => Promise<void>;
  refreshFromServer: () => Promise<void>;
  setCartItems: (next: CartLine[]) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [user, setUser] = useState<SessionUser>(null);
  const pathname = usePathname();
  const didInitialCustomerSync = useRef(false);

  useEffect(() => {
    if (!user) didInitialCustomerSync.current = false;
  }, [user]);

  const persist = useCallback((next: CartLine[]) => {
    setItems(next);
    writeCartToStorage(next);
  }, []);

  useEffect(() => {
    setItems(readCartFromStorage());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/auth/session", { credentials: "include" });
      const data = (await res.json()) as { user: SessionUser };
      if (cancelled) return;
      setUser(data.user ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // One-time: guest localStorage → DB merge, or load server cart (customers only)
  useEffect(() => {
    if (!isHydrated || !user || user.role !== "customer") {
      return;
    }
    if (didInitialCustomerSync.current) return;
    didInitialCustomerSync.current = true;
    (async () => {
      const local = readCartFromStorage();
      if (local.length > 0) {
        const merged = await mergeGuestCartIntoAccount(local);
        if (merged.success && merged.items) {
          persist(merged.items);
        }
        return;
      }
      const server = await getCustomerCart();
      if (server.success && server.items.length > 0) {
        persist(server.items);
      }
    })();
  }, [isHydrated, user, persist]);

  const addItem = useCallback(
    (line: CartLine) => {
      const current = readCartFromStorage();
      const without = current.filter((i) => i.productId !== line.productId);
      const existing = current.find((i) => i.productId === line.productId);
      const nextQty = Math.min(
        999,
        (existing?.quantity ?? 0) + line.quantity,
      );
      if (nextQty < 1) return;
      const next: CartLine = {
        ...line,
        quantity: nextQty,
      };
      const merged = [...without, next];
      persist(merged);
      if (user?.role === "customer") {
        void saveCustomerCart(merged);
      }
    },
    [persist, user],
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      const current = readCartFromStorage();
      if (quantity < 1) {
        const next = current.filter((i) => i.productId !== productId);
        persist(next);
        if (user?.role === "customer") void saveCustomerCart(next);
        return;
      }
      const next = current.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.min(999, quantity) }
          : i,
      );
      persist(next);
      if (user?.role === "customer") void saveCustomerCart(next);
    },
    [persist, user],
  );

  const removeItem = useCallback(
    (productId: string) => {
      const current = readCartFromStorage();
      const next = current.filter((i) => i.productId !== productId);
      persist(next);
      if (user?.role === "customer") void saveCustomerCart(next);
    },
    [persist, user],
  );

  const clearLocal = useCallback(() => {
    persist([]);
    if (user?.role === "customer") void saveCustomerCart([]);
  }, [persist, user]);

  const syncToServer = useCallback(async () => {
    if (user?.role !== "customer") return;
    const local = readCartFromStorage();
    await saveCustomerCart(local);
  }, [user]);

  const refreshFromServer = useCallback(async () => {
    if (user?.role !== "customer") return;
    const { success, items } = await getCustomerCart();
    if (success) persist(items);
  }, [user, persist]);

  const setCartItems = useCallback(
    (next: CartLine[]) => {
      persist(next);
      if (user?.role === "customer") void saveCustomerCart(next);
    },
    [persist, user],
  );

  const value = useMemo((): CartContextValue => {
    const subtotal = items.reduce(
      (s, i) => s + i.price * i.quantity,
      0,
    );
    const itemCount = items.reduce((s, i) => s + i.quantity, 0);
    return {
      items,
      itemCount,
      subtotal,
      isHydrated,
      user,
      addItem,
      updateQuantity,
      removeItem,
      clearLocal,
      syncToServer,
      refreshFromServer,
      setCartItems,
    };
  }, [
    items,
    isHydrated,
    user,
    addItem,
    updateQuantity,
    removeItem,
    clearLocal,
    syncToServer,
    refreshFromServer,
    setCartItems,
  ]);

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
