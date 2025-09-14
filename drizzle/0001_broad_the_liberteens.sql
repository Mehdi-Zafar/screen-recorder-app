CREATE TYPE "public"."visibility" AS ENUM('public', 'private');--> statement-breakpoint
CREATE TABLE "videos" (
	"id" text PRIMARY KEY NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"video_url" text NOT NULL,
	"thumbnail_url" text NOT NULL,
	"visibility" "visibility" DEFAULT 'public' NOT NULL,
	"user_id" text NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"duration" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "videos_user_id_idx" ON "videos" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "videos_visibility_idx" ON "videos" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "videos_created_at_idx" ON "videos" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "videos_title_idx" ON "videos" USING btree ("title");