"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@workspace/ui/lib/cn";
import { isBlobImageUrl } from "@/lib/product-image";

/**
 * Imagens de um produto: a imagem grande e, com mais do que uma, miniaturas
 * para escolher (botões, por isso funcionam com teclado). Sem imagens, mostra
 * "Sem imagem disponível" (nada inventado).
 */
export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const valid = images.filter(isBlobImageUrl);
  const [selected, setSelected] = React.useState(0);
  const current = valid[Math.min(selected, valid.length - 1)];

  return (
    <div className="flex w-full max-w-md shrink-0 flex-col gap-3">
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-ink-3">
        {current ? (
          <Image
            key={current}
            src={current}
            alt={valid.length > 1 ? `${name} — imagem ${valid.indexOf(current) + 1} de ${valid.length}` : name}
            fill
            priority
            sizes="(min-width: 768px) 28rem, 100vw"
            className="object-cover"
          />
        ) : (
          <p className="px-6 text-center text-sm text-muted-foreground">Sem imagem disponível</p>
        )}
      </div>

      {valid.length > 1 ? (
        <ul className="grid grid-cols-5 gap-2" aria-label="Imagens do produto">
          {valid.map((url, index) => (
            <li key={url}>
              <button
                type="button"
                onClick={() => setSelected(index)}
                aria-label={`Ver imagem ${index + 1} de ${valid.length}`}
                aria-current={url === current ? "true" : undefined}
                className={cn(
                  "relative block aspect-square w-full overflow-hidden rounded-lg border bg-ink-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  url === current ? "border-primary" : "border-border opacity-80 hover:opacity-100",
                )}
              >
                <Image src={url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
