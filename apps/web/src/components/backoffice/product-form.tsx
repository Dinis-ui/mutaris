"use client";

import * as React from "react";
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
import { ProductImagesField } from "@/components/backoffice/product-images-field";

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
  const [uploading, setUploading] = React.useState(false);
  // Sobe quando o produto é guardado: as imagens atuais passam a "guardadas".
  const [savedVersion, setSavedVersion] = React.useState(0);

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
      if (result.status === "saved") setSavedVersion((version) => version + 1);
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
        id="product-images"
        label="Imagens"
        hint="JPG, PNG ou WebP, até 4 MB cada. A primeira é a capa (aparece na loja); as outras aparecem na página do produto."
      >
        <ProductImagesField
          initialImages={product?.images ?? []}
          productName={name}
          error={errors.images}
          onBusyChange={setUploading}
          savedVersion={savedVersion}
        />
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
