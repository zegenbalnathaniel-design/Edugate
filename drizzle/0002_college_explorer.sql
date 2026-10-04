ALTER TABLE "programs" ADD COLUMN "subjects" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "programs" ADD COLUMN "degree_norm" text;--> statement-breakpoint
ALTER TABLE "programs" ADD COLUMN "cost_inr" numeric;--> statement-breakpoint
ALTER TABLE "programs" ADD COLUMN "admission_bases" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "programs" ADD COLUMN "tests" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "universities" ADD COLUMN "hub" text;--> statement-breakpoint
ALTER TABLE "universities" ADD COLUMN "institution_type" text;--> statement-breakpoint
ALTER TABLE "universities" ADD COLUMN "degrees" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "universities" ADD COLUMN "admission_bases" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "universities" ADD COLUMN "tests" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "universities" ADD COLUMN "cost_inr_min" numeric;--> statement-breakpoint
ALTER TABLE "universities" ADD COLUMN "selectivity" text;--> statement-breakpoint
ALTER TABLE "universities" ADD COLUMN "data_hash" text;--> statement-breakpoint
CREATE INDEX "programs_subjects_idx" ON "programs" USING gin ("subjects");--> statement-breakpoint
CREATE INDEX "universities_region_idx" ON "universities" USING btree ("country_code","region","hub");