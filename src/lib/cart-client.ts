export const CART_STORAGE_KEY = "shophub_cart_v1";

export type CartLine = {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image: string;
  sellerId: string;
};

export function readCartFromStorage(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row): row is CartLine =>
        row &&
        typeof row === "object" &&
        typeof (row as CartLine).productId === "string" &&
        typeof (row as CartLine).quantity === "number" &&
        (row as CartLine).quantity >= 1,
    );
  } catch {
    return [];
  }
}

export function writeCartToStorage(items: CartLine[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export function mergeLineIntoCart(
  cart: CartLine[],
  line: CartLine,
  maxQuantity: number,
): CartLine[] {
  const next = cart.filter((i) => i.productId !== line.productId);
  const existing = cart.find((i) => i.productId === line.productId);
  const quantity = Math.min(
    maxQuantity,
    (existing?.quantity ?? 0) + line.quantity,
  );
  if (quantity < 1) return next;
  next.push({
    ...line,
    quantity,
  });
  return next;
}
