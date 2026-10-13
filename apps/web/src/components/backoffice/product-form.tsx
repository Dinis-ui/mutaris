"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@workspace/types";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { productCategories } from "@/data/product-categories";
import {
  AVAILABILITIES,
  AVAILABILITY_LABEL,
  centsToPriceInput,
  slugify,
  type ProductField,
  type ProductFormState,
} from "@/lib/backoffice-product-form";
import { saveProductAction } from "@/app/backoffice/loja/actions";
import {
  PRODUCT_IMAGE_MAX_BYTES,
  PRODUCT_IMAGE_TYPES,
  isBlobImageUrl,
} from "@/lib/product-image";

const SELECT_CLASS =
  "h-12 w-full rounded-lg border border-border bg-input px-4 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

/** O menu aberto é desenhado pelo navegador: sem isto fica texto claro sobre fundo branco. */
const OPTION_CLASS = "bg-card text-foreground";

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-foreground">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

/**
 * Formulário de criação/edição de produto. Submete com `onSubmit` (e não
 * com `action=`) para que os campos não sejam limpos quando há erros.
 * A validação a sério é feita na Server Action.
 */
export function ProductForm({ product }: { product?: Product }) {
  const isEditing = Boolean(product);
  const [name, setName] = React.useState(product?.name ?? "");
  const [slug, setSlug] = React.useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(isEditing);
  const [state, setState] = React.useState<ProductFormState>({ status: "idle" });
  const [pending, startTransition] = React.useTransition();
  const [imageUrl, setImageUrl] = React.useState(product?.image ?? "");
  // Imagem enviada nesta sessão e ainda não guardada no produto (pode ser apagada ao trocar/remover).
  const [unsavedImage, setUnsavedImage] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [imageError, setImageError] = React.useState<string | null>(null);

  function discardFromStorage(url: string | null) {
    if (!url) return;
    void fetch("/api/backoffice-upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    }).catch(() => undefined);
  }

  async function onImageSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;

    setImageError(null);
    if (!(PRODUCT_IMAGE_TYPES as readonly string[]).includes(file.type)) {
      setImageError("Usa uma imagem JPG, PNG ou WebP.");
      return;
    }
    if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
      setImageError("A imagem é demasiado grande (máximo 4 MB).");
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch("/api/backoffice-upload", { method: "POST", body });
      const data = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;
      if (!response.ok || !data?.url) {
        setImageError(data?.error ?? "Não foi possível carregar a imagem.");
        return;
      }
      discardFromStorage(unsavedImage);
      setImageUrl(data.url);
      setUnsavedImage(data.url);
    } catch {
      setImageError("Não foi possível carregar a imagem. Tenta novamente.");
    } finally {
      setUploading(false);
    }
  }

  function onRemoveImage() {
    setImageError(null);
    discardFromStorage(unsavedImage);
    setUnsavedImage(null);
    setImageUrl("");
  }

  function onNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await saveProductAction(formData);
      setState(result);
      if (result.status === "saved") setUnsavedImage(null);
    });
  }

  const errors = state.fieldErrors ?? {};
  const invalid = (field: ProductField) => (errors[field] ? true : undefined);

  return (
    <form onSubmit={onSubmit} className="flex max-w-2xl flex-col gap-6" noValidate>
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      <Field id="product-name" label="Nome" error={errors.name}>
        <Input
          id="product-name"
          name="name"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          aria-invalid={invalid("name")}
          maxLength={120}
          required
        />
      </Field>

      <Field
        id="product-slug"
        label="Endereço (slug)"
        hint={`Aparece no link da loja: /loja/${slug || "…"}`}
        error={errors.slug}
      >
        <Input
          id="product-slug"
          name="slug"
          value={slug}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(event.target.value);
          }}
          aria-invalid={invalid("slug")}
          maxLength={80}
          required
        />
      </Field>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field id="product-category" label="Categoria" error={errors.category}>
          <select
            id="product-category"
            name="category"
            defaultValue={product?.category ?? ""}
            aria-invalid={invalid("category")}
            className={SELECT_CLASS}
            required
          >
            <option value="" disabled className={OPTION_CLASS}>
              Escolhe…
            </option>
            {productCategories.map((category) => (
              <option key={category.slug} value={category.slug} className={OPTION_CLASS}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>

        <Field id="product-availability" label="Disponibilidade" error={errors.availability}>
          <select
            id="product-availability"
            name="availability"
            defaultValue={product?.availability ?? "disponivel"}
            aria-invalid={invalid("availability")}
            className={SELECT_CLASS}
          >
            {AVAILABILITIES.map((value) => (
              <option key={value} value={value} className={OPTION_CLASS}>
                {AVAILABILITY_LABEL[value]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field id="product-price" label="Preço (€)" hint="Ex.: 89 ou 89,50" error={errors.price}>
        <Input
          id="product-price"
          name="price"
          inputMode="decimal"
          defaultValue={product ? centsToPriceInput(product.price) : ""}
          aria-invalid={invalid("price")}
          className="sm:max-w-48"
          required
        />
      </Field>

      <Field id="product-description" label="Descrição" error={errors.description}>
        <Textarea
          id="product-description"
          name="description"
          rows={5}
          defaultValue={product?.description ?? ""}
          aria-invalid={invalid("description")}
          maxLength={2000}
          required
        />
      </Field>

      <Field
        id="product-features"
        label="Características"
        hint="Uma por linha."
        error={errors.features}
      >
        <Textarea
          id="product-features"
          name="features"
          rows={5}
          defaultValue={product?.features.join("\n") ?? ""}
          aria-invalid={invalid("features")}
        />
      </Field>

      <Field
        id="product-image"
        label="Imagem"
        hint="JPG, PNG ou WebP, até 4 MB. Aparece na loja e na página do produto."
        error={imageError ?? errors.image}
      >
        <input type="hidden" name="image" value={imageUrl} />
        <div className="flex flex-col gap-3">
          {isBlobImageUrl(imageUrl) ? (
            <div className="relative aspect-[4/3] w-full max-w-xs overflow-hidden rounded-lg border border-border bg-ink-3">
              <Image
                src={imageUrl}
                alt={name ? `Imagem de ${name}` : "Imagem do produto"}
                fill
                sizes="320px"
                className="object-cover"
              />
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            <input
              id="product-image"
              type="file"
              accept={PRODUCT_IMAGE_TYPES.join(",")}
              onChange={onImageSelected}
              disabled={uploading}
              className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-card file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground"
            />
            {uploading ? <span className="text-sm text-muted-foreground">A carregar…</span> : null}
            {imageUrl && !uploading ? (
              <Button type="button" variant="ghost" size="sm" onClick={onRemoveImage}>
                Remover imagem
              </Button>
            ) : null}
          </div>
        </div>
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending || uploading}>
          {pending ? "A guardar…" : isEditing ? "Guardar alterações" : "Criar produto"}
        </Button>
        <Button asChild variant="ghost">
          <Link href="/backoffice/loja">Cancelar</Link>
        </Button>
        {state.message ? (
          <p role={state.status === "error" ? "alert" : "status"} className="text-sm text-muted-foreground">
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
