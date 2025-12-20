-- Rename success column to step_old to avoid conflicts
ALTER TABLE "contacts" RENAME COLUMN "success" TO "step_old";--> statement-breakpoint

-- Create the step_type enum
CREATE TYPE "public"."step_type" AS ENUM('text', 'image', 'video');--> statement-breakpoint

-- Add the new step column as integer with proper casting
ALTER TABLE "contacts" ADD COLUMN "step" integer;--> statement-breakpoint
UPDATE "contacts" SET "step" = CASE WHEN "step_old" = true THEN 1 ELSE 0 END;--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "step" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "step" SET DEFAULT 1;--> statement-breakpoint

-- Drop the old column
ALTER TABLE "contacts" DROP COLUMN "step_old";--> statement-breakpoint

-- Create the steps table
CREATE TABLE "steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flux_id" text NOT NULL,
	"stepPosition" integer NOT NULL,
	"step_type" "step_type" DEFAULT 'text' NOT NULL,
	"message" text,
	"document_url" text
);--> statement-breakpoint

-- Add missing columns to contacts
ALTER TABLE "contacts" ADD COLUMN "number_success" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "number_fails" integer DEFAULT 0 NOT NULL;--> statement-breakpoint

-- Add foreign key for steps table
ALTER TABLE "steps" ADD CONSTRAINT "steps_flux_id_fluxes_id_fk" FOREIGN KEY ("flux_id") REFERENCES "public"."fluxes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

-- Fix subscription table defaults
ALTER TABLE "subscription" ALTER COLUMN "trial_start" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "subscription" ALTER COLUMN "trial_end" SET DEFAULT now() + INTERVAL '7 days';--> statement-breakpoint

-- Remove old columns from fluxes table  
ALTER TABLE "fluxes" DROP COLUMN IF EXISTS "message";--> statement-breakpoint
ALTER TABLE "fluxes" DROP COLUMN IF EXISTS "document_url";
