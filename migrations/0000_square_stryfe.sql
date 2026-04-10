CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "protocols" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"content" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"sample_id" integer NOT NULL,
	"title" text NOT NULL,
	"content" json NOT NULL,
	"generated_by" integer NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"pdf_path" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "sample_shares" (
	"id" serial PRIMARY KEY NOT NULL,
	"sample_id" integer NOT NULL,
	"shared_by" integer NOT NULL,
	"shared_with" text,
	"share_token" text NOT NULL,
	"share_type" text DEFAULT 'link' NOT NULL,
	"expires_at" timestamp,
	"access_count" integer DEFAULT 0 NOT NULL,
	"max_access" integer DEFAULT 10,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sample_shares_share_token_unique" UNIQUE("share_token")
);
CREATE TABLE "samples" (
	"id" serial PRIMARY KEY NOT NULL,
	"sample_id" text NOT NULL,
	"user_id" integer NOT NULL,
	"sample_type" text NOT NULL,
	"collection_date" timestamp NOT NULL,
	"collection_time" text NOT NULL,
	"location" text,
	"geolocation" json,
	"temperature" numeric(5, 2),
	"ph" numeric(3, 1),
	 "salinity" numeric(5, 2),
	 "conductivity" numeric(8, 2),
	"field_conditions" json,
	"status" text DEFAULT 'pending' NOT NULL,
	"qr_code" text,
	"barcode" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "samples_sample_id_unique" UNIQUE("sample_id")
);

CREATE TABLE "sensor_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"sample_id" integer NOT NULL,
	"sensor_type" text NOT NULL,
	"value" numeric(10, 4) NOT NULL,
	"unit" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "slot_reservations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"slot_date" timestamp NOT NULL,
	"slot_time" text NOT NULL,
	"location" text NOT NULL,
	"purpose" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"approved_by" integer,
	"approved_at" timestamp,
	"notes" text
);

CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"mobile" text,
	"role" text DEFAULT 'student' NOT NULL,
	"city" text,
	"profile_picture" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
