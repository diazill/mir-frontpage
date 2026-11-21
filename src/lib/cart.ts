import { useSyncExternalStore } from "react";

// Temporary cart: product id -> quantity, kept in localStorage so the count
// survives navigation and reloads. Checkout (WEB-04/06) will replace this with
// the Laravel cart.

const STORAGE_KEY = "mir-cart-v1";

type Cart = Readonly<Record<string, number>>;

const EMPTY_CART: Cart = Object.freeze({});

let cache: Cart | null = null;
const listeners = new Set<() => void>();

function parseCart(raw: string | null): Cart {
  if (!raw) return EMPTY_CART;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return EMPTY_CART;
    }
    const cart: Record<string, number> = {};
    for (const [id, quantity] of Object.entries(value)) {
      if (typeof quantity === "number" && Number.isInteger(quantity) && quantity > 0) {
        cart[id] = quantity;
      }
    }
    return cart;
  } catch {
    return EMPTY_CART;
  }
}

function readCart(): Cart {
  if (cache === null) {
    try {
      cache = parseCart(window.localStorage.getItem(STORAGE_KEY));
    } catch {
      // Storage can be blocked (private mode, disabled site data).
      cache = EMPTY_CART;
    }
  }
  return cache;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Upper bound per item so a stuck stepper can't build absurd orders. */
export const MAX_QUANTITY = 99;

function writeCart(next: Cart) {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // The in-memory cart still updates for this visit.
  }
  for (const listener of listeners) listener();
}

export function addToCart(productId: string, quantity = 1) {
  const cart = readCart();
  writeCart({
    ...cart,
    [productId]: Math.min(MAX_QUANTITY, (cart[productId] ?? 0) + quantity),
  });
}

/** Sets an exact quantity; 0 or less removes the item. */
export function setCartQuantity(productId: string, quantity: number) {
  const next = { ...readCart() };
  if (quantity <= 0) delete next[productId];
  else next[productId] = Math.min(MAX_QUANTITY, Math.floor(quantity));
  writeCart(next);
}

export function removeFromCart(productId: string) {
  setCartQuantity(productId, 0);
}

export function clearCart() {
  writeCart(EMPTY_CART);
}

/** Product id -> quantity. Empty during server render and hydration. */
export function useCart(): Cart {
  return useSyncExternalStore(subscribe, readCart, () => EMPTY_CART);
}

const noopSubscribe = () => () => {};

/** False during server render and hydration, true once localStorage is read. */
export function useCartReady() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

export function useCartCount() {
  const cart = useCart();
  return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
}
