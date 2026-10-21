import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_news_category" AS ENUM('Announcement', 'Event Recap', 'Academics', 'Sports', 'Social', 'Partnership', 'Welfare');
  CREATE TYPE "public"."enum_news_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__news_v_version_category" AS ENUM('Announcement', 'Event Recap', 'Academics', 'Sports', 'Social', 'Partnership', 'Welfare');
  CREATE TYPE "public"."enum__news_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_events_category" AS ENUM('Academics', 'Sports', 'Social', 'Other');
  CREATE TYPE "public"."enum_events_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__events_v_version_category" AS ENUM('Academics', 'Sports', 'Social', 'Other');
  CREATE TYPE "public"."enum__events_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_spotlights_kind" AS ENUM('Student', 'Lecturer', 'Department');
  CREATE TYPE "public"."enum_spotlights_category" AS ENUM('Academic', 'Social', 'Sports', 'Humanitarian', 'All-Rounder');
  CREATE TYPE "public"."enum_spotlights_period" AS ENUM('Week', 'Month');
  CREATE TYPE "public"."enum_spotlights_level" AS ENUM('100', '200', '300', '400', '500');
  CREATE TYPE "public"."enum_spotlights_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__spotlights_v_version_kind" AS ENUM('Student', 'Lecturer', 'Department');
  CREATE TYPE "public"."enum__spotlights_v_version_category" AS ENUM('Academic', 'Social', 'Sports', 'Humanitarian', 'All-Rounder');
  CREATE TYPE "public"."enum__spotlights_v_version_period" AS ENUM('Week', 'Month');
  CREATE TYPE "public"."enum__spotlights_v_version_level" AS ENUM('100', '200', '300', '400', '500');
  CREATE TYPE "public"."enum__spotlights_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_announcements_category" AS ENUM('Notice', 'Academic', 'Exams', 'Welfare', 'Deadline', 'Event');
  CREATE TYPE "public"."enum_announcements_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__announcements_v_version_category" AS ENUM('Notice', 'Academic', 'Exams', 'Welfare', 'Deadline', 'Event');
  CREATE TYPE "public"."enum__announcements_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_articles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__articles_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_newsletters_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__newsletters_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_opportunities_type" AS ENUM('Internship', 'Scholarship', 'Competition', 'Job', 'Fellowship', 'Conference', 'Training');
  CREATE TYPE "public"."enum_opportunities_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__opportunities_v_version_type" AS ENUM('Internship', 'Scholarship', 'Competition', 'Job', 'Fellowship', 'Conference', 'Training');
  CREATE TYPE "public"."enum__opportunities_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_merch_availability" AS ENUM('Available', 'Pre-order', 'Sold out');
  CREATE TYPE "public"."enum_merch_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__merch_v_version_availability" AS ENUM('Available', 'Pre-order', 'Sold out');
  CREATE TYPE "public"."enum__merch_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_excos_level" AS ENUM('100', '200', '300', '400', '500');
  CREATE TYPE "public"."enum_reps_role" AS ENUM('Speaker', 'Deputy Speaker', 'Clerk', 'Chief Whip', 'Majority Leader', 'Committee Chair', 'Member');
  CREATE TYPE "public"."enum_reps_level" AS ENUM('100', '200', '300', '400', '500');
  CREATE TYPE "public"."enum_patrons_group" AS ENUM('Patron', 'Faculty leadership', 'Lecturer');
  CREATE TYPE "public"."enum_departments_type" AS ENUM('Department', 'Sub-department');
  CREATE TYPE "public"."enum_resources_type" AS ENUM('Past Questions', 'Course Materials', 'Lecture Notes', 'Timetable', 'Handbook', 'Form', 'Other');
  CREATE TYPE "public"."enum_resources_level" AS ENUM('All levels', '100', '200', '300', '400', '500');
  CREATE TYPE "public"."enum_partners_tier" AS ENUM('Headline Sponsor', 'Platinum Sponsor', 'Gold Sponsor', 'Silver Sponsor', 'Bronze Sponsor', 'Programme Partner', 'Media Partner');
  CREATE TYPE "public"."enum_alumni_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__alumni_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_submissions_kind" AS ENUM('nomination', 'alumni', 'contact', 'suggestion', 'sponsor');
  CREATE TYPE "public"."enum_submissions_status" AS ENUM('new', 'seen', 'done');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TABLE "news" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"date" timestamp(3) with time zone,
  	"category" "enum_news_category",
  	"cover_id" integer,
  	"summary" varchar,
  	"body" varchar,
  	"link" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_news_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "news_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"departments_id" integer
  );
  
  CREATE TABLE "_news_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_date" timestamp(3) with time zone,
  	"version_category" "enum__news_v_version_category",
  	"version_cover_id" integer,
  	"version_summary" varchar,
  	"version_body" varchar,
  	"version_link" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__news_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_news_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"departments_id" integer
  );
  
  CREATE TABLE "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"date" timestamp(3) with time zone,
  	"date_label" varchar,
  	"time" varchar,
  	"venue" varchar,
  	"category" "enum_events_category" DEFAULT 'Social',
  	"description" varchar,
  	"poster_id" integer,
  	"link" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_events_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "events_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"departments_id" integer
  );
  
  CREATE TABLE "_events_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_date" timestamp(3) with time zone,
  	"version_date_label" varchar,
  	"version_time" varchar,
  	"version_venue" varchar,
  	"version_category" "enum__events_v_version_category" DEFAULT 'Social',
  	"version_description" varchar,
  	"version_poster_id" integer,
  	"version_link" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__events_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_events_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"departments_id" integer
  );
  
  CREATE TABLE "spotlights" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum_spotlights_kind" DEFAULT 'Student',
  	"category" "enum_spotlights_category",
  	"period" "enum_spotlights_period" DEFAULT 'Week',
  	"period_label" varchar,
  	"date" timestamp(3) with time zone,
  	"name" varchar,
  	"department_id" integer,
  	"level" "enum_spotlights_level",
  	"photo_id" integer,
  	"citation" varchar,
  	"handle" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_spotlights_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_spotlights_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_kind" "enum__spotlights_v_version_kind" DEFAULT 'Student',
  	"version_category" "enum__spotlights_v_version_category",
  	"version_period" "enum__spotlights_v_version_period" DEFAULT 'Week',
  	"version_period_label" varchar,
  	"version_date" timestamp(3) with time zone,
  	"version_name" varchar,
  	"version_department_id" integer,
  	"version_level" "enum__spotlights_v_version_level",
  	"version_photo_id" integer,
  	"version_citation" varchar,
  	"version_handle" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__spotlights_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "announcements" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"date" timestamp(3) with time zone,
  	"category" "enum_announcements_category",
  	"body" varchar,
  	"link" varchar,
  	"pinned" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_announcements_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "announcements_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"departments_id" integer
  );
  
  CREATE TABLE "_announcements_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_date" timestamp(3) with time zone,
  	"version_category" "enum__announcements_v_version_category",
  	"version_body" varchar,
  	"version_link" varchar,
  	"version_pinned" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__announcements_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_announcements_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"departments_id" integer
  );
  
  CREATE TABLE "articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"author" varchar,
  	"date" timestamp(3) with time zone,
  	"tags" varchar,
  	"summary" varchar,
  	"body" varchar,
  	"cover_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_articles_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "articles_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"departments_id" integer
  );
  
  CREATE TABLE "_articles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_author" varchar,
  	"version_date" timestamp(3) with time zone,
  	"version_tags" varchar,
  	"version_summary" varchar,
  	"version_body" varchar,
  	"version_cover_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__articles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_articles_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"departments_id" integer
  );
  
  CREATE TABLE "newsletters" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"issue" varchar,
  	"date" timestamp(3) with time zone,
  	"summary" varchar,
  	"cover_id" integer,
  	"link" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_newsletters_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_newsletters_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_issue" varchar,
  	"version_date" timestamp(3) with time zone,
  	"version_summary" varchar,
  	"version_cover_id" integer,
  	"version_link" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__newsletters_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "gallery" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"caption" varchar,
  	"event" varchar,
  	"date" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "gallery_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"departments_id" integer
  );
  
  CREATE TABLE "opportunities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"type" "enum_opportunities_type" DEFAULT 'Internship',
  	"org" varchar,
  	"deadline" timestamp(3) with time zone,
  	"description" varchar,
  	"link" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_opportunities_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_opportunities_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_type" "enum__opportunities_v_version_type" DEFAULT 'Internship',
  	"version_org" varchar,
  	"version_deadline" timestamp(3) with time zone,
  	"version_description" varchar,
  	"version_link" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__opportunities_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "merch" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"name" varchar,
  	"price" varchar,
  	"photo_id" integer,
  	"note" varchar,
  	"link" varchar,
  	"availability" "enum_merch_availability" DEFAULT 'Available',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_merch_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_merch_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__order" varchar,
  	"version_name" varchar,
  	"version_price" varchar,
  	"version_photo_id" integer,
  	"version_note" varchar,
  	"version_link" varchar,
  	"version_availability" "enum__merch_v_version_availability" DEFAULT 'Available',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__merch_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "faqs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"q" varchar NOT NULL,
  	"a" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "excos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"name" varchar NOT NULL,
  	"position" varchar NOT NULL,
  	"department_id" integer,
  	"level" "enum_excos_level",
  	"photo_id" integer,
  	"instagram" varchar,
  	"bio" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "past_excos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"session" varchar NOT NULL,
  	"admin" varchar,
  	"name" varchar NOT NULL,
  	"position" varchar NOT NULL,
  	"order" numeric,
  	"department_id" integer,
  	"photo_id" integer,
  	"note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "reps" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"name" varchar NOT NULL,
  	"role" "enum_reps_role" DEFAULT 'Member' NOT NULL,
  	"department_id" integer,
  	"level" "enum_reps_level",
  	"committee" varchar,
  	"photo_id" integer,
  	"instagram" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "patrons" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"name" varchar NOT NULL,
  	"role" varchar NOT NULL,
  	"group" "enum_patrons_group" DEFAULT 'Lecturer' NOT NULL,
  	"department_id" integer,
  	"photo_id" integer,
  	"note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "departments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"name" varchar NOT NULL,
  	"code" varchar,
  	"type" "enum_departments_type" DEFAULT 'Department' NOT NULL,
  	"about" varchar,
  	"hod" varchar,
  	"rep" varchar,
  	"assoc" varchar,
  	"site" varchar,
  	"news_path" varchar,
  	"instagram" varchar,
  	"email" varchar,
  	"photo_id" integer,
  	"last_fetched" timestamp(3) with time zone,
  	"fetch_note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "resources" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"title" varchar NOT NULL,
  	"type" "enum_resources_type" DEFAULT 'Past Questions' NOT NULL,
  	"department_id" integer,
  	"level" "enum_resources_level" DEFAULT 'All levels',
  	"link" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "research" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"authors" varchar NOT NULL,
  	"department_id" integer,
  	"journal" varchar,
  	"year" varchar,
  	"link" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "external_posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"department_id" integer NOT NULL,
  	"source" varchar,
  	"excerpt" varchar,
  	"image" varchar,
  	"published_at" timestamp(3) with time zone,
  	"visible" boolean DEFAULT true,
  	"fetched_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "partners" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"name" varchar NOT NULL,
  	"tier" "enum_partners_tier" DEFAULT 'Programme Partner' NOT NULL,
  	"logo_id" integer,
  	"note" varchar,
  	"link" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "tiers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"name" varchar NOT NULL,
  	"price" varchar NOT NULL,
  	"tag" varchar,
  	"benefits" varchar NOT NULL,
  	"featured" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "alumni" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"name" varchar,
  	"year" varchar,
  	"department_id" integer,
  	"role" varchar,
  	"photo_id" integer,
  	"linkedin" varchar,
  	"email" varchar,
  	"phone" varchar,
  	"mentor" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_alumni_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_alumni_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__order" varchar,
  	"version_name" varchar,
  	"version_year" varchar,
  	"version_department_id" integer,
  	"version_role" varchar,
  	"version_photo_id" integer,
  	"version_linkedin" varchar,
  	"version_email" varchar,
  	"version_phone" varchar,
  	"version_mentor" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__alumni_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum_submissions_kind" NOT NULL,
  	"summary" varchar,
  	"name" varchar,
  	"email" varchar,
  	"phone" varchar,
  	"data" jsonb,
  	"status" "enum_submissions_status" DEFAULT 'new',
  	"notes" varchar,
  	"website" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"add_to_gallery" boolean DEFAULT false,
  	"gallery_caption" varchar,
  	"gallery_event" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"position" varchar,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"news_id" integer,
  	"events_id" integer,
  	"spotlights_id" integer,
  	"announcements_id" integer,
  	"articles_id" integer,
  	"newsletters_id" integer,
  	"gallery_id" integer,
  	"opportunities_id" integer,
  	"merch_id" integer,
  	"faqs_id" integer,
  	"excos_id" integer,
  	"past_excos_id" integer,
  	"reps_id" integer,
  	"patrons_id" integer,
  	"departments_id" integer,
  	"resources_id" integer,
  	"research_id" integer,
  	"external_posts_id" integer,
  	"partners_id" integer,
  	"tiers_id" integer,
  	"alumni_id" integer,
  	"submissions_id" integer,
  	"media_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "settings_contacts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" varchar,
  	"phone" varchar
  );
  
  CREATE TABLE "settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"logo_id" integer,
  	"name" varchar NOT NULL,
  	"short" varchar NOT NULL,
  	"faculty" varchar,
  	"university" varchar,
  	"admin" varchar,
  	"session" varchar,
  	"founded" varchar,
  	"announcement" varchar,
  	"announcement_link" varchar,
  	"hero_line1" varchar,
  	"hero_line2" varchar,
  	"hero_sub" varchar,
  	"hero_image_id" integer,
  	"glance_image_id" integer,
  	"president_quote" varchar,
  	"about" varchar,
  	"vision" varchar,
  	"mission" varchar,
  	"wa_number" varchar,
  	"email" varchar,
  	"address" varchar,
  	"wa_community" varchar,
  	"instagram" varchar,
  	"linkedin" varchar,
  	"linkedin_name" varchar,
  	"x" varchar,
  	"tiktok" varchar,
  	"suggestion_form" varchar,
  	"nomination_form" varchar,
  	"alumni_form" varchar,
  	"contact_form" varchar,
  	"partner_deck" varchar,
  	"deck_students" varchar,
  	"deck_intake" varchar,
  	"deck_ages" varchar,
  	"deck_reach" varchar,
  	"deck_email" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "news" ADD CONSTRAINT "news_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news_rels" ADD CONSTRAINT "news_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_rels" ADD CONSTRAINT "news_rels_departments_fk" FOREIGN KEY ("departments_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_v" ADD CONSTRAINT "_news_v_parent_id_news_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."news"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_v" ADD CONSTRAINT "_news_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_v_rels" ADD CONSTRAINT "_news_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_news_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_v_rels" ADD CONSTRAINT "_news_v_rels_departments_fk" FOREIGN KEY ("departments_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_departments_fk" FOREIGN KEY ("departments_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_parent_id_events_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_poster_id_media_id_fk" FOREIGN KEY ("version_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_departments_fk" FOREIGN KEY ("departments_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "spotlights" ADD CONSTRAINT "spotlights_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "spotlights" ADD CONSTRAINT "spotlights_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_spotlights_v" ADD CONSTRAINT "_spotlights_v_parent_id_spotlights_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."spotlights"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_spotlights_v" ADD CONSTRAINT "_spotlights_v_version_department_id_departments_id_fk" FOREIGN KEY ("version_department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_spotlights_v" ADD CONSTRAINT "_spotlights_v_version_photo_id_media_id_fk" FOREIGN KEY ("version_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "announcements_rels" ADD CONSTRAINT "announcements_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."announcements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "announcements_rels" ADD CONSTRAINT "announcements_rels_departments_fk" FOREIGN KEY ("departments_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_announcements_v" ADD CONSTRAINT "_announcements_v_parent_id_announcements_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."announcements"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_announcements_v_rels" ADD CONSTRAINT "_announcements_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_announcements_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_announcements_v_rels" ADD CONSTRAINT "_announcements_v_rels_departments_fk" FOREIGN KEY ("departments_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_departments_fk" FOREIGN KEY ("departments_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_parent_id_articles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_departments_fk" FOREIGN KEY ("departments_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters" ADD CONSTRAINT "newsletters_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_newsletters_v" ADD CONSTRAINT "_newsletters_v_parent_id_newsletters_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."newsletters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_newsletters_v" ADD CONSTRAINT "_newsletters_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gallery" ADD CONSTRAINT "gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gallery_rels" ADD CONSTRAINT "gallery_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gallery_rels" ADD CONSTRAINT "gallery_rels_departments_fk" FOREIGN KEY ("departments_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_opportunities_v" ADD CONSTRAINT "_opportunities_v_parent_id_opportunities_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."opportunities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "merch" ADD CONSTRAINT "merch_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_merch_v" ADD CONSTRAINT "_merch_v_parent_id_merch_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."merch"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_merch_v" ADD CONSTRAINT "_merch_v_version_photo_id_media_id_fk" FOREIGN KEY ("version_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "excos" ADD CONSTRAINT "excos_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "excos" ADD CONSTRAINT "excos_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "past_excos" ADD CONSTRAINT "past_excos_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "past_excos" ADD CONSTRAINT "past_excos_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reps" ADD CONSTRAINT "reps_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reps" ADD CONSTRAINT "reps_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "patrons" ADD CONSTRAINT "patrons_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "patrons" ADD CONSTRAINT "patrons_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "departments" ADD CONSTRAINT "departments_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "resources" ADD CONSTRAINT "resources_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "research" ADD CONSTRAINT "research_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "external_posts" ADD CONSTRAINT "external_posts_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners" ADD CONSTRAINT "partners_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "alumni" ADD CONSTRAINT "alumni_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "alumni" ADD CONSTRAINT "alumni_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_alumni_v" ADD CONSTRAINT "_alumni_v_parent_id_alumni_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."alumni"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_alumni_v" ADD CONSTRAINT "_alumni_v_version_department_id_departments_id_fk" FOREIGN KEY ("version_department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_alumni_v" ADD CONSTRAINT "_alumni_v_version_photo_id_media_id_fk" FOREIGN KEY ("version_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_news_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_spotlights_fk" FOREIGN KEY ("spotlights_id") REFERENCES "public"."spotlights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_announcements_fk" FOREIGN KEY ("announcements_id") REFERENCES "public"."announcements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_newsletters_fk" FOREIGN KEY ("newsletters_id") REFERENCES "public"."newsletters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_gallery_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_opportunities_fk" FOREIGN KEY ("opportunities_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_merch_fk" FOREIGN KEY ("merch_id") REFERENCES "public"."merch"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_excos_fk" FOREIGN KEY ("excos_id") REFERENCES "public"."excos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_past_excos_fk" FOREIGN KEY ("past_excos_id") REFERENCES "public"."past_excos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reps_fk" FOREIGN KEY ("reps_id") REFERENCES "public"."reps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_patrons_fk" FOREIGN KEY ("patrons_id") REFERENCES "public"."patrons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_departments_fk" FOREIGN KEY ("departments_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_resources_fk" FOREIGN KEY ("resources_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_research_fk" FOREIGN KEY ("research_id") REFERENCES "public"."research"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_external_posts_fk" FOREIGN KEY ("external_posts_id") REFERENCES "public"."external_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tiers_fk" FOREIGN KEY ("tiers_id") REFERENCES "public"."tiers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_alumni_fk" FOREIGN KEY ("alumni_id") REFERENCES "public"."alumni"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_submissions_fk" FOREIGN KEY ("submissions_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings_contacts" ADD CONSTRAINT "settings_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings" ADD CONSTRAINT "settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "settings" ADD CONSTRAINT "settings_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "settings" ADD CONSTRAINT "settings_glance_image_id_media_id_fk" FOREIGN KEY ("glance_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "news_cover_idx" ON "news" USING btree ("cover_id");
  CREATE INDEX "news_updated_at_idx" ON "news" USING btree ("updated_at");
  CREATE INDEX "news_created_at_idx" ON "news" USING btree ("created_at");
  CREATE INDEX "news__status_idx" ON "news" USING btree ("_status");
  CREATE INDEX "news_rels_order_idx" ON "news_rels" USING btree ("order");
  CREATE INDEX "news_rels_parent_idx" ON "news_rels" USING btree ("parent_id");
  CREATE INDEX "news_rels_path_idx" ON "news_rels" USING btree ("path");
  CREATE INDEX "news_rels_departments_id_idx" ON "news_rels" USING btree ("departments_id");
  CREATE INDEX "_news_v_parent_idx" ON "_news_v" USING btree ("parent_id");
  CREATE INDEX "_news_v_version_version_cover_idx" ON "_news_v" USING btree ("version_cover_id");
  CREATE INDEX "_news_v_version_version_updated_at_idx" ON "_news_v" USING btree ("version_updated_at");
  CREATE INDEX "_news_v_version_version_created_at_idx" ON "_news_v" USING btree ("version_created_at");
  CREATE INDEX "_news_v_version_version__status_idx" ON "_news_v" USING btree ("version__status");
  CREATE INDEX "_news_v_created_at_idx" ON "_news_v" USING btree ("created_at");
  CREATE INDEX "_news_v_updated_at_idx" ON "_news_v" USING btree ("updated_at");
  CREATE INDEX "_news_v_latest_idx" ON "_news_v" USING btree ("latest");
  CREATE INDEX "_news_v_autosave_idx" ON "_news_v" USING btree ("autosave");
  CREATE INDEX "_news_v_rels_order_idx" ON "_news_v_rels" USING btree ("order");
  CREATE INDEX "_news_v_rels_parent_idx" ON "_news_v_rels" USING btree ("parent_id");
  CREATE INDEX "_news_v_rels_path_idx" ON "_news_v_rels" USING btree ("path");
  CREATE INDEX "_news_v_rels_departments_id_idx" ON "_news_v_rels" USING btree ("departments_id");
  CREATE INDEX "events_poster_idx" ON "events" USING btree ("poster_id");
  CREATE INDEX "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE INDEX "events__status_idx" ON "events" USING btree ("_status");
  CREATE INDEX "events_rels_order_idx" ON "events_rels" USING btree ("order");
  CREATE INDEX "events_rels_parent_idx" ON "events_rels" USING btree ("parent_id");
  CREATE INDEX "events_rels_path_idx" ON "events_rels" USING btree ("path");
  CREATE INDEX "events_rels_departments_id_idx" ON "events_rels" USING btree ("departments_id");
  CREATE INDEX "_events_v_parent_idx" ON "_events_v" USING btree ("parent_id");
  CREATE INDEX "_events_v_version_version_poster_idx" ON "_events_v" USING btree ("version_poster_id");
  CREATE INDEX "_events_v_version_version_updated_at_idx" ON "_events_v" USING btree ("version_updated_at");
  CREATE INDEX "_events_v_version_version_created_at_idx" ON "_events_v" USING btree ("version_created_at");
  CREATE INDEX "_events_v_version_version__status_idx" ON "_events_v" USING btree ("version__status");
  CREATE INDEX "_events_v_created_at_idx" ON "_events_v" USING btree ("created_at");
  CREATE INDEX "_events_v_updated_at_idx" ON "_events_v" USING btree ("updated_at");
  CREATE INDEX "_events_v_latest_idx" ON "_events_v" USING btree ("latest");
  CREATE INDEX "_events_v_autosave_idx" ON "_events_v" USING btree ("autosave");
  CREATE INDEX "_events_v_rels_order_idx" ON "_events_v_rels" USING btree ("order");
  CREATE INDEX "_events_v_rels_parent_idx" ON "_events_v_rels" USING btree ("parent_id");
  CREATE INDEX "_events_v_rels_path_idx" ON "_events_v_rels" USING btree ("path");
  CREATE INDEX "_events_v_rels_departments_id_idx" ON "_events_v_rels" USING btree ("departments_id");
  CREATE INDEX "spotlights_department_idx" ON "spotlights" USING btree ("department_id");
  CREATE INDEX "spotlights_photo_idx" ON "spotlights" USING btree ("photo_id");
  CREATE INDEX "spotlights_updated_at_idx" ON "spotlights" USING btree ("updated_at");
  CREATE INDEX "spotlights_created_at_idx" ON "spotlights" USING btree ("created_at");
  CREATE INDEX "spotlights__status_idx" ON "spotlights" USING btree ("_status");
  CREATE INDEX "_spotlights_v_parent_idx" ON "_spotlights_v" USING btree ("parent_id");
  CREATE INDEX "_spotlights_v_version_version_department_idx" ON "_spotlights_v" USING btree ("version_department_id");
  CREATE INDEX "_spotlights_v_version_version_photo_idx" ON "_spotlights_v" USING btree ("version_photo_id");
  CREATE INDEX "_spotlights_v_version_version_updated_at_idx" ON "_spotlights_v" USING btree ("version_updated_at");
  CREATE INDEX "_spotlights_v_version_version_created_at_idx" ON "_spotlights_v" USING btree ("version_created_at");
  CREATE INDEX "_spotlights_v_version_version__status_idx" ON "_spotlights_v" USING btree ("version__status");
  CREATE INDEX "_spotlights_v_created_at_idx" ON "_spotlights_v" USING btree ("created_at");
  CREATE INDEX "_spotlights_v_updated_at_idx" ON "_spotlights_v" USING btree ("updated_at");
  CREATE INDEX "_spotlights_v_latest_idx" ON "_spotlights_v" USING btree ("latest");
  CREATE INDEX "_spotlights_v_autosave_idx" ON "_spotlights_v" USING btree ("autosave");
  CREATE INDEX "announcements_updated_at_idx" ON "announcements" USING btree ("updated_at");
  CREATE INDEX "announcements_created_at_idx" ON "announcements" USING btree ("created_at");
  CREATE INDEX "announcements__status_idx" ON "announcements" USING btree ("_status");
  CREATE INDEX "announcements_rels_order_idx" ON "announcements_rels" USING btree ("order");
  CREATE INDEX "announcements_rels_parent_idx" ON "announcements_rels" USING btree ("parent_id");
  CREATE INDEX "announcements_rels_path_idx" ON "announcements_rels" USING btree ("path");
  CREATE INDEX "announcements_rels_departments_id_idx" ON "announcements_rels" USING btree ("departments_id");
  CREATE INDEX "_announcements_v_parent_idx" ON "_announcements_v" USING btree ("parent_id");
  CREATE INDEX "_announcements_v_version_version_updated_at_idx" ON "_announcements_v" USING btree ("version_updated_at");
  CREATE INDEX "_announcements_v_version_version_created_at_idx" ON "_announcements_v" USING btree ("version_created_at");
  CREATE INDEX "_announcements_v_version_version__status_idx" ON "_announcements_v" USING btree ("version__status");
  CREATE INDEX "_announcements_v_created_at_idx" ON "_announcements_v" USING btree ("created_at");
  CREATE INDEX "_announcements_v_updated_at_idx" ON "_announcements_v" USING btree ("updated_at");
  CREATE INDEX "_announcements_v_latest_idx" ON "_announcements_v" USING btree ("latest");
  CREATE INDEX "_announcements_v_autosave_idx" ON "_announcements_v" USING btree ("autosave");
  CREATE INDEX "_announcements_v_rels_order_idx" ON "_announcements_v_rels" USING btree ("order");
  CREATE INDEX "_announcements_v_rels_parent_idx" ON "_announcements_v_rels" USING btree ("parent_id");
  CREATE INDEX "_announcements_v_rels_path_idx" ON "_announcements_v_rels" USING btree ("path");
  CREATE INDEX "_announcements_v_rels_departments_id_idx" ON "_announcements_v_rels" USING btree ("departments_id");
  CREATE INDEX "articles_cover_idx" ON "articles" USING btree ("cover_id");
  CREATE INDEX "articles_updated_at_idx" ON "articles" USING btree ("updated_at");
  CREATE INDEX "articles_created_at_idx" ON "articles" USING btree ("created_at");
  CREATE INDEX "articles__status_idx" ON "articles" USING btree ("_status");
  CREATE INDEX "articles_rels_order_idx" ON "articles_rels" USING btree ("order");
  CREATE INDEX "articles_rels_parent_idx" ON "articles_rels" USING btree ("parent_id");
  CREATE INDEX "articles_rels_path_idx" ON "articles_rels" USING btree ("path");
  CREATE INDEX "articles_rels_departments_id_idx" ON "articles_rels" USING btree ("departments_id");
  CREATE INDEX "_articles_v_parent_idx" ON "_articles_v" USING btree ("parent_id");
  CREATE INDEX "_articles_v_version_version_cover_idx" ON "_articles_v" USING btree ("version_cover_id");
  CREATE INDEX "_articles_v_version_version_updated_at_idx" ON "_articles_v" USING btree ("version_updated_at");
  CREATE INDEX "_articles_v_version_version_created_at_idx" ON "_articles_v" USING btree ("version_created_at");
  CREATE INDEX "_articles_v_version_version__status_idx" ON "_articles_v" USING btree ("version__status");
  CREATE INDEX "_articles_v_created_at_idx" ON "_articles_v" USING btree ("created_at");
  CREATE INDEX "_articles_v_updated_at_idx" ON "_articles_v" USING btree ("updated_at");
  CREATE INDEX "_articles_v_latest_idx" ON "_articles_v" USING btree ("latest");
  CREATE INDEX "_articles_v_autosave_idx" ON "_articles_v" USING btree ("autosave");
  CREATE INDEX "_articles_v_rels_order_idx" ON "_articles_v_rels" USING btree ("order");
  CREATE INDEX "_articles_v_rels_parent_idx" ON "_articles_v_rels" USING btree ("parent_id");
  CREATE INDEX "_articles_v_rels_path_idx" ON "_articles_v_rels" USING btree ("path");
  CREATE INDEX "_articles_v_rels_departments_id_idx" ON "_articles_v_rels" USING btree ("departments_id");
  CREATE INDEX "newsletters_cover_idx" ON "newsletters" USING btree ("cover_id");
  CREATE INDEX "newsletters_updated_at_idx" ON "newsletters" USING btree ("updated_at");
  CREATE INDEX "newsletters_created_at_idx" ON "newsletters" USING btree ("created_at");
  CREATE INDEX "newsletters__status_idx" ON "newsletters" USING btree ("_status");
  CREATE INDEX "_newsletters_v_parent_idx" ON "_newsletters_v" USING btree ("parent_id");
  CREATE INDEX "_newsletters_v_version_version_cover_idx" ON "_newsletters_v" USING btree ("version_cover_id");
  CREATE INDEX "_newsletters_v_version_version_updated_at_idx" ON "_newsletters_v" USING btree ("version_updated_at");
  CREATE INDEX "_newsletters_v_version_version_created_at_idx" ON "_newsletters_v" USING btree ("version_created_at");
  CREATE INDEX "_newsletters_v_version_version__status_idx" ON "_newsletters_v" USING btree ("version__status");
  CREATE INDEX "_newsletters_v_created_at_idx" ON "_newsletters_v" USING btree ("created_at");
  CREATE INDEX "_newsletters_v_updated_at_idx" ON "_newsletters_v" USING btree ("updated_at");
  CREATE INDEX "_newsletters_v_latest_idx" ON "_newsletters_v" USING btree ("latest");
  CREATE INDEX "_newsletters_v_autosave_idx" ON "_newsletters_v" USING btree ("autosave");
  CREATE INDEX "gallery_image_idx" ON "gallery" USING btree ("image_id");
  CREATE INDEX "gallery_updated_at_idx" ON "gallery" USING btree ("updated_at");
  CREATE INDEX "gallery_created_at_idx" ON "gallery" USING btree ("created_at");
  CREATE INDEX "gallery_rels_order_idx" ON "gallery_rels" USING btree ("order");
  CREATE INDEX "gallery_rels_parent_idx" ON "gallery_rels" USING btree ("parent_id");
  CREATE INDEX "gallery_rels_path_idx" ON "gallery_rels" USING btree ("path");
  CREATE INDEX "gallery_rels_departments_id_idx" ON "gallery_rels" USING btree ("departments_id");
  CREATE INDEX "opportunities_updated_at_idx" ON "opportunities" USING btree ("updated_at");
  CREATE INDEX "opportunities_created_at_idx" ON "opportunities" USING btree ("created_at");
  CREATE INDEX "opportunities__status_idx" ON "opportunities" USING btree ("_status");
  CREATE INDEX "_opportunities_v_parent_idx" ON "_opportunities_v" USING btree ("parent_id");
  CREATE INDEX "_opportunities_v_version_version_updated_at_idx" ON "_opportunities_v" USING btree ("version_updated_at");
  CREATE INDEX "_opportunities_v_version_version_created_at_idx" ON "_opportunities_v" USING btree ("version_created_at");
  CREATE INDEX "_opportunities_v_version_version__status_idx" ON "_opportunities_v" USING btree ("version__status");
  CREATE INDEX "_opportunities_v_created_at_idx" ON "_opportunities_v" USING btree ("created_at");
  CREATE INDEX "_opportunities_v_updated_at_idx" ON "_opportunities_v" USING btree ("updated_at");
  CREATE INDEX "_opportunities_v_latest_idx" ON "_opportunities_v" USING btree ("latest");
  CREATE INDEX "_opportunities_v_autosave_idx" ON "_opportunities_v" USING btree ("autosave");
  CREATE INDEX "merch__order_idx" ON "merch" USING btree ("_order");
  CREATE INDEX "merch_photo_idx" ON "merch" USING btree ("photo_id");
  CREATE INDEX "merch_updated_at_idx" ON "merch" USING btree ("updated_at");
  CREATE INDEX "merch_created_at_idx" ON "merch" USING btree ("created_at");
  CREATE INDEX "merch__status_idx" ON "merch" USING btree ("_status");
  CREATE INDEX "_merch_v_parent_idx" ON "_merch_v" USING btree ("parent_id");
  CREATE INDEX "_merch_v_version_version__order_idx" ON "_merch_v" USING btree ("version__order");
  CREATE INDEX "_merch_v_version_version_photo_idx" ON "_merch_v" USING btree ("version_photo_id");
  CREATE INDEX "_merch_v_version_version_updated_at_idx" ON "_merch_v" USING btree ("version_updated_at");
  CREATE INDEX "_merch_v_version_version_created_at_idx" ON "_merch_v" USING btree ("version_created_at");
  CREATE INDEX "_merch_v_version_version__status_idx" ON "_merch_v" USING btree ("version__status");
  CREATE INDEX "_merch_v_created_at_idx" ON "_merch_v" USING btree ("created_at");
  CREATE INDEX "_merch_v_updated_at_idx" ON "_merch_v" USING btree ("updated_at");
  CREATE INDEX "_merch_v_latest_idx" ON "_merch_v" USING btree ("latest");
  CREATE INDEX "_merch_v_autosave_idx" ON "_merch_v" USING btree ("autosave");
  CREATE INDEX "faqs__order_idx" ON "faqs" USING btree ("_order");
  CREATE INDEX "faqs_updated_at_idx" ON "faqs" USING btree ("updated_at");
  CREATE INDEX "faqs_created_at_idx" ON "faqs" USING btree ("created_at");
  CREATE INDEX "excos__order_idx" ON "excos" USING btree ("_order");
  CREATE INDEX "excos_department_idx" ON "excos" USING btree ("department_id");
  CREATE INDEX "excos_photo_idx" ON "excos" USING btree ("photo_id");
  CREATE INDEX "excos_updated_at_idx" ON "excos" USING btree ("updated_at");
  CREATE INDEX "excos_created_at_idx" ON "excos" USING btree ("created_at");
  CREATE INDEX "past_excos_department_idx" ON "past_excos" USING btree ("department_id");
  CREATE INDEX "past_excos_photo_idx" ON "past_excos" USING btree ("photo_id");
  CREATE INDEX "past_excos_updated_at_idx" ON "past_excos" USING btree ("updated_at");
  CREATE INDEX "past_excos_created_at_idx" ON "past_excos" USING btree ("created_at");
  CREATE INDEX "reps__order_idx" ON "reps" USING btree ("_order");
  CREATE INDEX "reps_department_idx" ON "reps" USING btree ("department_id");
  CREATE INDEX "reps_photo_idx" ON "reps" USING btree ("photo_id");
  CREATE INDEX "reps_updated_at_idx" ON "reps" USING btree ("updated_at");
  CREATE INDEX "reps_created_at_idx" ON "reps" USING btree ("created_at");
  CREATE INDEX "patrons__order_idx" ON "patrons" USING btree ("_order");
  CREATE INDEX "patrons_department_idx" ON "patrons" USING btree ("department_id");
  CREATE INDEX "patrons_photo_idx" ON "patrons" USING btree ("photo_id");
  CREATE INDEX "patrons_updated_at_idx" ON "patrons" USING btree ("updated_at");
  CREATE INDEX "patrons_created_at_idx" ON "patrons" USING btree ("created_at");
  CREATE INDEX "departments__order_idx" ON "departments" USING btree ("_order");
  CREATE INDEX "departments_photo_idx" ON "departments" USING btree ("photo_id");
  CREATE INDEX "departments_updated_at_idx" ON "departments" USING btree ("updated_at");
  CREATE INDEX "departments_created_at_idx" ON "departments" USING btree ("created_at");
  CREATE INDEX "resources__order_idx" ON "resources" USING btree ("_order");
  CREATE INDEX "resources_department_idx" ON "resources" USING btree ("department_id");
  CREATE INDEX "resources_updated_at_idx" ON "resources" USING btree ("updated_at");
  CREATE INDEX "resources_created_at_idx" ON "resources" USING btree ("created_at");
  CREATE INDEX "research_department_idx" ON "research" USING btree ("department_id");
  CREATE INDEX "research_updated_at_idx" ON "research" USING btree ("updated_at");
  CREATE INDEX "research_created_at_idx" ON "research" USING btree ("created_at");
  CREATE UNIQUE INDEX "external_posts_url_idx" ON "external_posts" USING btree ("url");
  CREATE INDEX "external_posts_department_idx" ON "external_posts" USING btree ("department_id");
  CREATE INDEX "external_posts_updated_at_idx" ON "external_posts" USING btree ("updated_at");
  CREATE INDEX "external_posts_created_at_idx" ON "external_posts" USING btree ("created_at");
  CREATE INDEX "partners__order_idx" ON "partners" USING btree ("_order");
  CREATE INDEX "partners_logo_idx" ON "partners" USING btree ("logo_id");
  CREATE INDEX "partners_updated_at_idx" ON "partners" USING btree ("updated_at");
  CREATE INDEX "partners_created_at_idx" ON "partners" USING btree ("created_at");
  CREATE INDEX "tiers__order_idx" ON "tiers" USING btree ("_order");
  CREATE INDEX "tiers_updated_at_idx" ON "tiers" USING btree ("updated_at");
  CREATE INDEX "tiers_created_at_idx" ON "tiers" USING btree ("created_at");
  CREATE INDEX "alumni__order_idx" ON "alumni" USING btree ("_order");
  CREATE INDEX "alumni_department_idx" ON "alumni" USING btree ("department_id");
  CREATE INDEX "alumni_photo_idx" ON "alumni" USING btree ("photo_id");
  CREATE INDEX "alumni_updated_at_idx" ON "alumni" USING btree ("updated_at");
  CREATE INDEX "alumni_created_at_idx" ON "alumni" USING btree ("created_at");
  CREATE INDEX "alumni__status_idx" ON "alumni" USING btree ("_status");
  CREATE INDEX "_alumni_v_parent_idx" ON "_alumni_v" USING btree ("parent_id");
  CREATE INDEX "_alumni_v_version_version__order_idx" ON "_alumni_v" USING btree ("version__order");
  CREATE INDEX "_alumni_v_version_version_department_idx" ON "_alumni_v" USING btree ("version_department_id");
  CREATE INDEX "_alumni_v_version_version_photo_idx" ON "_alumni_v" USING btree ("version_photo_id");
  CREATE INDEX "_alumni_v_version_version_updated_at_idx" ON "_alumni_v" USING btree ("version_updated_at");
  CREATE INDEX "_alumni_v_version_version_created_at_idx" ON "_alumni_v" USING btree ("version_created_at");
  CREATE INDEX "_alumni_v_version_version__status_idx" ON "_alumni_v" USING btree ("version__status");
  CREATE INDEX "_alumni_v_created_at_idx" ON "_alumni_v" USING btree ("created_at");
  CREATE INDEX "_alumni_v_updated_at_idx" ON "_alumni_v" USING btree ("updated_at");
  CREATE INDEX "_alumni_v_latest_idx" ON "_alumni_v" USING btree ("latest");
  CREATE INDEX "_alumni_v_autosave_idx" ON "_alumni_v" USING btree ("autosave");
  CREATE INDEX "submissions_updated_at_idx" ON "submissions" USING btree ("updated_at");
  CREATE INDEX "submissions_created_at_idx" ON "submissions" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_news_id_idx" ON "payload_locked_documents_rels" USING btree ("news_id");
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX "payload_locked_documents_rels_spotlights_id_idx" ON "payload_locked_documents_rels" USING btree ("spotlights_id");
  CREATE INDEX "payload_locked_documents_rels_announcements_id_idx" ON "payload_locked_documents_rels" USING btree ("announcements_id");
  CREATE INDEX "payload_locked_documents_rels_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("articles_id");
  CREATE INDEX "payload_locked_documents_rels_newsletters_id_idx" ON "payload_locked_documents_rels" USING btree ("newsletters_id");
  CREATE INDEX "payload_locked_documents_rels_gallery_id_idx" ON "payload_locked_documents_rels" USING btree ("gallery_id");
  CREATE INDEX "payload_locked_documents_rels_opportunities_id_idx" ON "payload_locked_documents_rels" USING btree ("opportunities_id");
  CREATE INDEX "payload_locked_documents_rels_merch_id_idx" ON "payload_locked_documents_rels" USING btree ("merch_id");
  CREATE INDEX "payload_locked_documents_rels_faqs_id_idx" ON "payload_locked_documents_rels" USING btree ("faqs_id");
  CREATE INDEX "payload_locked_documents_rels_excos_id_idx" ON "payload_locked_documents_rels" USING btree ("excos_id");
  CREATE INDEX "payload_locked_documents_rels_past_excos_id_idx" ON "payload_locked_documents_rels" USING btree ("past_excos_id");
  CREATE INDEX "payload_locked_documents_rels_reps_id_idx" ON "payload_locked_documents_rels" USING btree ("reps_id");
  CREATE INDEX "payload_locked_documents_rels_patrons_id_idx" ON "payload_locked_documents_rels" USING btree ("patrons_id");
  CREATE INDEX "payload_locked_documents_rels_departments_id_idx" ON "payload_locked_documents_rels" USING btree ("departments_id");
  CREATE INDEX "payload_locked_documents_rels_resources_id_idx" ON "payload_locked_documents_rels" USING btree ("resources_id");
  CREATE INDEX "payload_locked_documents_rels_research_id_idx" ON "payload_locked_documents_rels" USING btree ("research_id");
  CREATE INDEX "payload_locked_documents_rels_external_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("external_posts_id");
  CREATE INDEX "payload_locked_documents_rels_partners_id_idx" ON "payload_locked_documents_rels" USING btree ("partners_id");
  CREATE INDEX "payload_locked_documents_rels_tiers_id_idx" ON "payload_locked_documents_rels" USING btree ("tiers_id");
  CREATE INDEX "payload_locked_documents_rels_alumni_id_idx" ON "payload_locked_documents_rels" USING btree ("alumni_id");
  CREATE INDEX "payload_locked_documents_rels_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("submissions_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "settings_contacts_order_idx" ON "settings_contacts" USING btree ("_order");
  CREATE INDEX "settings_contacts_parent_id_idx" ON "settings_contacts" USING btree ("_parent_id");
  CREATE INDEX "settings_logo_idx" ON "settings" USING btree ("logo_id");
  CREATE INDEX "settings_hero_image_idx" ON "settings" USING btree ("hero_image_id");
  CREATE INDEX "settings_glance_image_idx" ON "settings" USING btree ("glance_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "news" CASCADE;
  DROP TABLE "news_rels" CASCADE;
  DROP TABLE "_news_v" CASCADE;
  DROP TABLE "_news_v_rels" CASCADE;
  DROP TABLE "events" CASCADE;
  DROP TABLE "events_rels" CASCADE;
  DROP TABLE "_events_v" CASCADE;
  DROP TABLE "_events_v_rels" CASCADE;
  DROP TABLE "spotlights" CASCADE;
  DROP TABLE "_spotlights_v" CASCADE;
  DROP TABLE "announcements" CASCADE;
  DROP TABLE "announcements_rels" CASCADE;
  DROP TABLE "_announcements_v" CASCADE;
  DROP TABLE "_announcements_v_rels" CASCADE;
  DROP TABLE "articles" CASCADE;
  DROP TABLE "articles_rels" CASCADE;
  DROP TABLE "_articles_v" CASCADE;
  DROP TABLE "_articles_v_rels" CASCADE;
  DROP TABLE "newsletters" CASCADE;
  DROP TABLE "_newsletters_v" CASCADE;
  DROP TABLE "gallery" CASCADE;
  DROP TABLE "gallery_rels" CASCADE;
  DROP TABLE "opportunities" CASCADE;
  DROP TABLE "_opportunities_v" CASCADE;
  DROP TABLE "merch" CASCADE;
  DROP TABLE "_merch_v" CASCADE;
  DROP TABLE "faqs" CASCADE;
  DROP TABLE "excos" CASCADE;
  DROP TABLE "past_excos" CASCADE;
  DROP TABLE "reps" CASCADE;
  DROP TABLE "patrons" CASCADE;
  DROP TABLE "departments" CASCADE;
  DROP TABLE "resources" CASCADE;
  DROP TABLE "research" CASCADE;
  DROP TABLE "external_posts" CASCADE;
  DROP TABLE "partners" CASCADE;
  DROP TABLE "tiers" CASCADE;
  DROP TABLE "alumni" CASCADE;
  DROP TABLE "_alumni_v" CASCADE;
  DROP TABLE "submissions" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "settings_contacts" CASCADE;
  DROP TABLE "settings" CASCADE;
  DROP TYPE "public"."enum_news_category";
  DROP TYPE "public"."enum_news_status";
  DROP TYPE "public"."enum__news_v_version_category";
  DROP TYPE "public"."enum__news_v_version_status";
  DROP TYPE "public"."enum_events_category";
  DROP TYPE "public"."enum_events_status";
  DROP TYPE "public"."enum__events_v_version_category";
  DROP TYPE "public"."enum__events_v_version_status";
  DROP TYPE "public"."enum_spotlights_kind";
  DROP TYPE "public"."enum_spotlights_category";
  DROP TYPE "public"."enum_spotlights_period";
  DROP TYPE "public"."enum_spotlights_level";
  DROP TYPE "public"."enum_spotlights_status";
  DROP TYPE "public"."enum__spotlights_v_version_kind";
  DROP TYPE "public"."enum__spotlights_v_version_category";
  DROP TYPE "public"."enum__spotlights_v_version_period";
  DROP TYPE "public"."enum__spotlights_v_version_level";
  DROP TYPE "public"."enum__spotlights_v_version_status";
  DROP TYPE "public"."enum_announcements_category";
  DROP TYPE "public"."enum_announcements_status";
  DROP TYPE "public"."enum__announcements_v_version_category";
  DROP TYPE "public"."enum__announcements_v_version_status";
  DROP TYPE "public"."enum_articles_status";
  DROP TYPE "public"."enum__articles_v_version_status";
  DROP TYPE "public"."enum_newsletters_status";
  DROP TYPE "public"."enum__newsletters_v_version_status";
  DROP TYPE "public"."enum_opportunities_type";
  DROP TYPE "public"."enum_opportunities_status";
  DROP TYPE "public"."enum__opportunities_v_version_type";
  DROP TYPE "public"."enum__opportunities_v_version_status";
  DROP TYPE "public"."enum_merch_availability";
  DROP TYPE "public"."enum_merch_status";
  DROP TYPE "public"."enum__merch_v_version_availability";
  DROP TYPE "public"."enum__merch_v_version_status";
  DROP TYPE "public"."enum_excos_level";
  DROP TYPE "public"."enum_reps_role";
  DROP TYPE "public"."enum_reps_level";
  DROP TYPE "public"."enum_patrons_group";
  DROP TYPE "public"."enum_departments_type";
  DROP TYPE "public"."enum_resources_type";
  DROP TYPE "public"."enum_resources_level";
  DROP TYPE "public"."enum_partners_tier";
  DROP TYPE "public"."enum_alumni_status";
  DROP TYPE "public"."enum__alumni_v_version_status";
  DROP TYPE "public"."enum_submissions_kind";
  DROP TYPE "public"."enum_submissions_status";
  DROP TYPE "public"."enum_users_role";`)
}
