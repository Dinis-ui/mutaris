CREATE TYPE "public"."admin_role" AS ENUM('read', 'support', 'full');--> statement-breakpoint
ALTER TABLE "admins" ADD COLUMN "role" "admin_role" DEFAULT 'full' NOT NULL;