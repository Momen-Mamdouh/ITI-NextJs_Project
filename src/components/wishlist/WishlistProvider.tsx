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
import { useCart } from "@/components/cart/CartProvider";
import {
  readWishlistFromStorage,
  writeWishlistToStorage,
} from "@/lib/wishlist-client";
import {
  getWishlistProductIds,
  mergeGuestWishlistIntoAccount,
  toggleWishlist as toggleWishlistAction,
} from "@/features/user/actions";

type WishlistContextValue = {
  ids: string[];
  isReady: boolean;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<{ success: boolean; error?: string }>;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useCart();
  const [ids, setIds] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);
  const didCustomerWishlistSync = useRef(false);

  useEffect(() => {
    if (!user) didCustomerWishlistSync.current = false;
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) {
        setIds(readWishlistFromStorage());
        setIsReady(true);
        return;
      }

      setIsReady(false);

      if (user.role === "customer" && !didCustomerWishlistSync.current) {
        didCustomerWishlistSync.current = true;
        const local = readWishlistFromStorage();
        if (local.length > 0) {
          await mergeGuestWishlistIntoAccount(local);
          if (!cancelled) writeWishlistToStorage([]);
        }
      }

      const res = await getWishlistProductIds();
      if (cancelled) return;
      setIds(res.ids);
      setIsReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const isInWishlist = useCallback(
    (productId: string) => ids.includes(productId),
    [ids],
  );

  const toggleWishlist = useCallback(
    async (productId: string) => {
      if (!user) {
        const next = isInWishlist(productId)
          ? ids.filter((id) => id !== productId)
          : [...ids, productId];
        writeWishlistToStorage(next);
        setIds(next);
        return { success: true };
      }

      const res = await toggleWishlistAction(productId);
      if (!res.success) {
        return { success: false, error: "error" in res ? String(res.error) : "Failed" };
      }
      setIds((prev) =>
        res.inWishlist
          ? [...new Set([...prev, productId])]
          : prev.filter((id) => id !== productId),
      );
      return { success: true };
    },
    [user, ids, isInWishlist],
  );

  const value = useMemo(
    () => ({
      ids,
      isReady,
      isInWishlist,
      toggleWishlist,
    }),
    [ids, isReady, isInWishlist, toggleWishlist],
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return ctx;
}
