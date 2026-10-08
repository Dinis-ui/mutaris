"use client";

import * as React from "react";
import { Check, ShoppingBag } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@workspace/types";

interface AddToCartButtonProps {
  product: Product;
}

const CONFIRMATION_MS = 2500;

/**
 * Adds one unit to the in-memory cart from `lib/cart-context.tsx`. There is
 * no checkout or persistence yet — this only exercises that structure.
 */
export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = React.useState(false);
  const disabled = product.availability === "brevemente";

  React.useEffect(() => {
    if (!added) return;
    const timeout = setTimeout(() => setAdded(false), CONFIRMATION_MS);
    return () => clearTimeout(timeout);
  }, [added]);

  function handleClick() {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      currency: product.currency,
      quantity: 1,
    });
    setAdded(true);
  }

  return (
    <Button
      type="button"
      size="lg"
      disabled={disabled}
      onClick={handleClick}
      className="w-fit uppercase"
    >
      {added ? (
        <>
          <Check aria-hidden="true" className="h-4 w-4" />
          Adicionado ao carrinho
        </>
      ) : (
        <>
          <ShoppingBag aria-hidden="true" className="h-4 w-4" />
          {disabled ? "Ainda não disponível" : "Adicionar ao carrinho"}
        </>
      )}
    </Button>
  );
}
