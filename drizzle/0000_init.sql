CREATE TABLE "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"university_id" integer NOT NULL,
	"program_id" integer,
	"status" text DEFAULT 'researching' NOT NULL,
	"checklist" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"notes" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"university_id" integer,
	"user_id" text,
	"action" text NOT NULL,
	"summary" text NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "data_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"university_id" integer NOT NULL,
	"program_slug" text,
	"field_label" text NOT NULL,
	"message" text NOT NULL,
	"reporter_id" text,
	"status" text DEFAULT 'open' NOT NULL,
	"resolved_by" text,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"university_id" integer NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"field" text NOT NULL,
	"level" text NOT NULL,
	"degree" text NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_searches" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"query" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "universities" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"country" text NOT NULL,
	"country_code" text NOT NULL,
	"region" text NOT NULL,
	"city" text NOT NULL,
	"control" text NOT NULL,
	"category" text NOT NULL,
	"qs_rank" integer,
	"qs_edition" integer,
	"fields" text[] DEFAULT '{}'::text[] NOT NULL,
	"curricula" text[] DEFAULT '{}'::text[] NOT NULL,
	"sat_policy" text,
	"intl_tuition_usd_min" numeric,
	"data" jsonb NOT NULL,
	"last_verified" date NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'student' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_university_id_universities_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_university_id_universities_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_reports" ADD CONSTRAINT "data_reports_university_id_universities_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_reports" ADD CONSTRAINT "data_reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_reports" ADD CONSTRAINT "data_reports_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programs" ADD CONSTRAINT "programs_university_id_universities_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_searches" ADD CONSTRAINT "saved_searches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "applications_user_uni_prog_idx" ON "applications" USING btree ("user_id","university_id","program_id");--> statement-breakpoint
CREATE UNIQUE INDEX "programs_uni_slug_idx" ON "programs" USING btree ("university_id","slug");--> statement-breakpoint
CREATE INDEX "programs_field_idx" ON "programs" USING btree ("field");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "universities_slug_idx" ON "universities" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "universities_country_idx" ON "universities" USING btree ("country_code");--> statement-breakpoint
CREATE INDEX "universities_qs_idx" ON "universities" USING btree ("qs_rank");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");