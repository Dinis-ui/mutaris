ALTER TABLE "products" ADD COLUMN "images" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
-- Copia a imagem atual de cada produto para a lista nova (a primeira é a capa).
UPDATE "products" SET "images" = ARRAY["image"] WHERE "image" IS NOT NULL AND cardinality("images") = 0;
