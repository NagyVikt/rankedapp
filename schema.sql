

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "drizzle";


ALTER SCHEMA "drizzle" OWNER TO "postgres";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  -- Ensure column names (id, email, name) match your public."User" table
  insert into public."User" (id, email, name)
  -- Ensure metadata path (raw_user_meta_data->>'name') is correct for how you store user's name
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
    "id" integer NOT NULL,
    "hash" "text" NOT NULL,
    "created_at" bigint
);


ALTER TABLE "drizzle"."__drizzle_migrations" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "drizzle"."__drizzle_migrations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "drizzle"."__drizzle_migrations_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "drizzle"."__drizzle_migrations_id_seq" OWNED BY "drizzle"."__drizzle_migrations"."id";



CREATE TABLE IF NOT EXISTS "public"."Authenticator" (
    "credentialid" "uuid" NOT NULL,
    "userid" "uuid" NOT NULL,
    "provideraccountid" "text" NOT NULL,
    "credentialpublickey" "text" NOT NULL,
    "counter" integer NOT NULL,
    "credentialdevicetype" "text" NOT NULL,
    "credentialbackedup" boolean NOT NULL,
    "transports" "text"[],
    "createdat" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updatedat" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."Authenticator" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Chat" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "createdAt" timestamp without time zone NOT NULL,
    "userId" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "visibility" character varying DEFAULT 'private'::character varying NOT NULL
);


ALTER TABLE "public"."Chat" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Document" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "createdAt" timestamp without time zone NOT NULL,
    "title" "text" NOT NULL,
    "content" "text",
    "userId" "uuid" NOT NULL,
    "text" character varying DEFAULT 'text'::character varying NOT NULL
);


ALTER TABLE "public"."Document" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Message" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "chatId" "uuid" NOT NULL,
    "role" character varying NOT NULL,
    "content" "json" NOT NULL,
    "createdAt" timestamp without time zone NOT NULL
);


ALTER TABLE "public"."Message" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Suggestion" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "documentId" "uuid" NOT NULL,
    "documentCreatedAt" timestamp without time zone NOT NULL,
    "originalText" "text" NOT NULL,
    "suggestedText" "text" NOT NULL,
    "description" "text",
    "isResolved" boolean DEFAULT false NOT NULL,
    "userId" "uuid" NOT NULL,
    "createdAt" timestamp without time zone NOT NULL
);


ALTER TABLE "public"."Suggestion" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."User" (
    "id" "uuid" NOT NULL,
    "email" character varying(64) NOT NULL,
    "pinHash" "text",
    "isPinSet" boolean DEFAULT false NOT NULL,
    "emailVerified" timestamp with time zone,
    "role" character varying(20) DEFAULT 'member'::character varying NOT NULL,
    "createdAt" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deletedAt" timestamp with time zone,
    "name" character varying(255)
);


ALTER TABLE "public"."User" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Vote" (
    "chatId" "uuid" NOT NULL,
    "messageId" "uuid" NOT NULL,
    "isUpvoted" boolean NOT NULL
);


ALTER TABLE "public"."Vote" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."account" (
    "userid" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "provider" "text" NOT NULL,
    "provideraccountid" "text" NOT NULL,
    "refresh_token" "text",
    "access_token" "text",
    "expires_at" integer,
    "token_type" "text",
    "scope" "text",
    "id_token" "text",
    "session_state" "text"
);


ALTER TABLE "public"."account" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."activity_logs" (
    "id" integer NOT NULL,
    "team_id" "uuid",
    "user_id" "uuid",
    "action" "text" NOT NULL,
    "timestamp" timestamp with time zone DEFAULT "now"() NOT NULL,
    "ip_address" character varying(45),
    "team_serial_id" integer
);


ALTER TABLE "public"."activity_logs" OWNER TO "postgres";


COMMENT ON COLUMN "public"."activity_logs"."team_id" IS 'Team associated with the activity';



COMMENT ON COLUMN "public"."activity_logs"."user_id" IS 'User who performed the action (if applicable)';



COMMENT ON COLUMN "public"."activity_logs"."action" IS 'Description of the action performed';



COMMENT ON COLUMN "public"."activity_logs"."ip_address" IS 'IP address from which the action originated (optional)';



CREATE SEQUENCE IF NOT EXISTS "public"."activity_logs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."activity_logs_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."activity_logs_id_seq" OWNED BY "public"."activity_logs"."id";



CREATE TABLE IF NOT EXISTS "public"."campaigns" (
    "id" integer NOT NULL,
    "webshop_id" integer NOT NULL,
    "shop_identifier" "text",
    "name" character varying(255) NOT NULL,
    "send_now" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "weekly" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "assignments" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."campaigns" OWNER TO "postgres";


COMMENT ON COLUMN "public"."campaigns"."id" IS 'Primary key for the campaign';



COMMENT ON COLUMN "public"."campaigns"."webshop_id" IS 'The webshop this campaign belongs to';



COMMENT ON COLUMN "public"."campaigns"."shop_identifier" IS 'Optional shop identifier (e.g., domain) associated with the campaign record';



COMMENT ON COLUMN "public"."campaigns"."name" IS 'Name of the marketing campaign';



COMMENT ON COLUMN "public"."campaigns"."send_now" IS 'JSONB data for immediate send configurations';



COMMENT ON COLUMN "public"."campaigns"."weekly" IS 'JSONB data for weekly send configurations';



COMMENT ON COLUMN "public"."campaigns"."assignments" IS 'JSONB data for assignment configurations';



COMMENT ON COLUMN "public"."campaigns"."is_active" IS 'Flag indicating if the campaign is currently active';



CREATE SEQUENCE IF NOT EXISTS "public"."campaigns_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."campaigns_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."campaigns_id_seq" OWNED BY "public"."campaigns"."id";



CREATE TABLE IF NOT EXISTS "public"."customers" (
    "id" integer NOT NULL,
    "webshop_id" integer NOT NULL,
    "shop_identifier" character varying(100),
    "email" character varying(254) NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."customers" OWNER TO "postgres";


COMMENT ON COLUMN "public"."customers"."id" IS 'Primary key for the customer';



COMMENT ON COLUMN "public"."customers"."webshop_id" IS 'The webshop this customer belongs to';



COMMENT ON COLUMN "public"."customers"."shop_identifier" IS 'Optional shop identifier (e.g., domain) associated with the customer record';



COMMENT ON COLUMN "public"."customers"."email" IS 'Customer''s email address';



CREATE SEQUENCE IF NOT EXISTS "public"."customers_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."customers_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."customers_id_seq" OWNED BY "public"."customers"."id";



CREATE TABLE IF NOT EXISTS "public"."designs" (
    "id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "design" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."designs" OWNER TO "postgres";


COMMENT ON COLUMN "public"."designs"."id" IS 'Primary key for the design';



COMMENT ON COLUMN "public"."designs"."user_id" IS 'The user who created/owns this design';



COMMENT ON COLUMN "public"."designs"."name" IS 'Name of the design';



COMMENT ON COLUMN "public"."designs"."design" IS 'JSONB data representing the design itself';



CREATE SEQUENCE IF NOT EXISTS "public"."designs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."designs_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."designs_id_seq" OWNED BY "public"."designs"."id";



CREATE TABLE IF NOT EXISTS "public"."invitations" (
    "id" integer NOT NULL,
    "team_id" "uuid" NOT NULL,
    "invited_by" "uuid" NOT NULL,
    "email" character varying(255) NOT NULL,
    "role" character varying(50) NOT NULL,
    "invited_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    "team_serial_id" integer
);


ALTER TABLE "public"."invitations" OWNER TO "postgres";


COMMENT ON COLUMN "public"."invitations"."team_id" IS 'Team the user is invited to';



COMMENT ON COLUMN "public"."invitations"."invited_by" IS 'User who sent the invitation';



COMMENT ON COLUMN "public"."invitations"."email" IS 'Email address of the invited user';



COMMENT ON COLUMN "public"."invitations"."role" IS 'Role assigned to the invited user upon acceptance';



COMMENT ON COLUMN "public"."invitations"."status" IS 'Current status of the invitation (pending, accepted, etc.)';



CREATE SEQUENCE IF NOT EXISTS "public"."invitations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."invitations_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."invitations_id_seq" OWNED BY "public"."invitations"."id";



CREATE TABLE IF NOT EXISTS "public"."session" (
    "sessiontoken" "text" NOT NULL,
    "userid" "uuid" NOT NULL,
    "expires" timestamp without time zone NOT NULL,
    "createdat" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updatedat" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."session" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team_members" (
    "id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "team_id" "uuid" NOT NULL,
    "role" character varying(50) NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "team_serial_id" integer
);


ALTER TABLE "public"."team_members" OWNER TO "postgres";


COMMENT ON COLUMN "public"."team_members"."user_id" IS 'Foreign key referencing the User table';



COMMENT ON COLUMN "public"."team_members"."team_id" IS 'Foreign key referencing the Teams table';



COMMENT ON COLUMN "public"."team_members"."role" IS 'Role of the user within the team (e.g., admin, member)';



CREATE SEQUENCE IF NOT EXISTS "public"."team_members_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."team_members_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."team_members_id_seq" OWNED BY "public"."team_members"."id";



CREATE TABLE IF NOT EXISTS "public"."teams" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT "now"() NOT NULL,
    "stripeCustomerId" "text",
    "stripeSubscriptionId" "text",
    "stripeProductId" "text",
    "planName" character varying(50),
    "subscriptionStatus" character varying(20),
    "serial_id" integer NOT NULL
);


ALTER TABLE "public"."teams" OWNER TO "postgres";


COMMENT ON COLUMN "public"."teams"."id" IS 'Primary key for the team (UUID)';



COMMENT ON COLUMN "public"."teams"."name" IS 'Name of the team';



COMMENT ON COLUMN "public"."teams"."createdAt" IS 'Timestamp when the team was created';



COMMENT ON COLUMN "public"."teams"."updatedAt" IS 'Timestamp when the team was last updated';



COMMENT ON COLUMN "public"."teams"."stripeCustomerId" IS 'Stripe Customer ID associated with the team (if any)';



COMMENT ON COLUMN "public"."teams"."stripeSubscriptionId" IS 'Stripe Subscription ID for the team (if any)';



COMMENT ON COLUMN "public"."teams"."stripeProductId" IS 'Stripe Product ID for the team''s plan (if any)';



COMMENT ON COLUMN "public"."teams"."planName" IS 'Name of the subscription plan (e.g., free, pro)';



COMMENT ON COLUMN "public"."teams"."subscriptionStatus" IS 'Current status of the Stripe subscription (e.g., active, canceled)';



CREATE SEQUENCE IF NOT EXISTS "public"."teams_serial_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."teams_serial_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."teams_serial_id_seq" OWNED BY "public"."teams"."serial_id";



CREATE TABLE IF NOT EXISTS "public"."verificationToken" (
    "identifier" "text" NOT NULL,
    "token" "text" NOT NULL,
    "expires" timestamp without time zone NOT NULL,
    "createdat" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updatedat" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."verificationToken" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."webshops" (
    "id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" character varying(100) NOT NULL,
    "url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "platform" character varying(50)
);


ALTER TABLE "public"."webshops" OWNER TO "postgres";


COMMENT ON COLUMN "public"."webshops"."id" IS 'Primary key for the webshop (Integer)';



COMMENT ON COLUMN "public"."webshops"."user_id" IS 'The user who owns this webshop';



COMMENT ON COLUMN "public"."webshops"."name" IS 'Name of the webshop';



COMMENT ON COLUMN "public"."webshops"."url" IS 'URL of the webshop storefront';



COMMENT ON COLUMN "public"."webshops"."platform" IS 'Platform the webshop runs on (e.g., Shopify, WooCommerce)';



CREATE SEQUENCE IF NOT EXISTS "public"."webshops_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."webshops_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."webshops_id_seq" OWNED BY "public"."webshops"."id";



ALTER TABLE ONLY "drizzle"."__drizzle_migrations" ALTER COLUMN "id" SET DEFAULT "nextval"('"drizzle"."__drizzle_migrations_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."activity_logs" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."activity_logs_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."campaigns" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."campaigns_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."customers" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."customers_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."designs" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."designs_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."invitations" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."invitations_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."team_members" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."team_members_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."teams" ALTER COLUMN "serial_id" SET DEFAULT "nextval"('"public"."teams_serial_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."webshops" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."webshops_id_seq"'::"regclass");



ALTER TABLE ONLY "drizzle"."__drizzle_migrations"
    ADD CONSTRAINT "__drizzle_migrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Authenticator"
    ADD CONSTRAINT "Authenticator_credentialid_key" UNIQUE ("credentialid");



ALTER TABLE ONLY "public"."Authenticator"
    ADD CONSTRAINT "Authenticator_pkey" PRIMARY KEY ("userid", "credentialid");



ALTER TABLE ONLY "public"."Chat"
    ADD CONSTRAINT "Chat_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Document"
    ADD CONSTRAINT "Document_id_createdAt_pk" PRIMARY KEY ("id", "createdAt");



ALTER TABLE ONLY "public"."Message"
    ADD CONSTRAINT "Message_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Suggestion"
    ADD CONSTRAINT "Suggestion_id_pk" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Vote"
    ADD CONSTRAINT "Vote_chatId_messageId_pk" PRIMARY KEY ("chatId", "messageId");



ALTER TABLE ONLY "public"."account"
    ADD CONSTRAINT "account_pkey" PRIMARY KEY ("provider", "provideraccountid");



ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."campaigns"
    ADD CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_webshop_id_email_key" UNIQUE ("webshop_id", "email");



ALTER TABLE ONLY "public"."designs"
    ADD CONSTRAINT "designs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_team_id_email_key" UNIQUE ("team_id", "email");



ALTER TABLE ONLY "public"."session"
    ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sessiontoken");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_user_id_team_id_key" UNIQUE ("user_id", "team_id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_stripeCustomerId_key" UNIQUE ("stripeCustomerId");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_stripeSubscriptionId_key" UNIQUE ("stripeSubscriptionId");



ALTER TABLE ONLY "public"."verificationToken"
    ADD CONSTRAINT "verificationToken_pkey" PRIMARY KEY ("identifier", "token");



ALTER TABLE ONLY "public"."verificationToken"
    ADD CONSTRAINT "verificationToken_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."webshops"
    ADD CONSTRAINT "webshops_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_activity_logs_team_id" ON "public"."activity_logs" USING "btree" ("team_id");



CREATE INDEX "idx_activity_logs_user_id" ON "public"."activity_logs" USING "btree" ("user_id");



CREATE INDEX "idx_campaigns_webshop_id" ON "public"."campaigns" USING "btree" ("webshop_id");



CREATE INDEX "idx_customers_webshop_id" ON "public"."customers" USING "btree" ("webshop_id");



CREATE INDEX "idx_designs_user_id" ON "public"."designs" USING "btree" ("user_id");



CREATE INDEX "idx_invitations_email" ON "public"."invitations" USING "btree" ("email");



CREATE INDEX "idx_invitations_team_id" ON "public"."invitations" USING "btree" ("team_id");



CREATE INDEX "idx_team_members_team_id" ON "public"."team_members" USING "btree" ("team_id");



CREATE INDEX "idx_team_members_user_id" ON "public"."team_members" USING "btree" ("user_id");



CREATE INDEX "idx_teams_stripe_customer_id" ON "public"."teams" USING "btree" ("stripeCustomerId");



CREATE INDEX "idx_teams_stripe_subscription_id" ON "public"."teams" USING "btree" ("stripeSubscriptionId");



CREATE INDEX "idx_webshops_user_id" ON "public"."webshops" USING "btree" ("user_id");



ALTER TABLE ONLY "public"."Authenticator"
    ADD CONSTRAINT "Authenticator_userid_fkey" FOREIGN KEY ("userid") REFERENCES "public"."User"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Chat"
    ADD CONSTRAINT "Chat_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."Document"
    ADD CONSTRAINT "Document_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id");



ALTER TABLE ONLY "public"."Message"
    ADD CONSTRAINT "Message_chatId_Chat_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id");



ALTER TABLE ONLY "public"."Suggestion"
    ADD CONSTRAINT "Suggestion_documentId_documentCreatedAt_Document_id_createdAt_f" FOREIGN KEY ("documentId", "documentCreatedAt") REFERENCES "public"."Document"("id", "createdAt");



ALTER TABLE ONLY "public"."Suggestion"
    ADD CONSTRAINT "Suggestion_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id");



ALTER TABLE ONLY "public"."Vote"
    ADD CONSTRAINT "Vote_chatId_Chat_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id");



ALTER TABLE ONLY "public"."Vote"
    ADD CONSTRAINT "Vote_messageId_Message_id_fk" FOREIGN KEY ("messageId") REFERENCES "public"."Message"("id");



ALTER TABLE ONLY "public"."account"
    ADD CONSTRAINT "account_userid_fkey" FOREIGN KEY ("userid") REFERENCES "public"."User"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."campaigns"
    ADD CONSTRAINT "campaigns_webshop_id_fkey" FOREIGN KEY ("webshop_id") REFERENCES "public"."webshops"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_webshop_id_fkey" FOREIGN KEY ("webshop_id") REFERENCES "public"."webshops"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."designs"
    ADD CONSTRAINT "designs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "public"."User"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."session"
    ADD CONSTRAINT "session_userid_fkey" FOREIGN KEY ("userid") REFERENCES "public"."User"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."webshops"
    ADD CONSTRAINT "webshops_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE;





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";











































































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";


















GRANT ALL ON TABLE "public"."Authenticator" TO "anon";
GRANT ALL ON TABLE "public"."Authenticator" TO "authenticated";
GRANT ALL ON TABLE "public"."Authenticator" TO "service_role";



GRANT ALL ON TABLE "public"."Chat" TO "anon";
GRANT ALL ON TABLE "public"."Chat" TO "authenticated";
GRANT ALL ON TABLE "public"."Chat" TO "service_role";



GRANT ALL ON TABLE "public"."Document" TO "anon";
GRANT ALL ON TABLE "public"."Document" TO "authenticated";
GRANT ALL ON TABLE "public"."Document" TO "service_role";



GRANT ALL ON TABLE "public"."Message" TO "anon";
GRANT ALL ON TABLE "public"."Message" TO "authenticated";
GRANT ALL ON TABLE "public"."Message" TO "service_role";



GRANT ALL ON TABLE "public"."Suggestion" TO "anon";
GRANT ALL ON TABLE "public"."Suggestion" TO "authenticated";
GRANT ALL ON TABLE "public"."Suggestion" TO "service_role";



GRANT ALL ON TABLE "public"."User" TO "anon";
GRANT ALL ON TABLE "public"."User" TO "authenticated";
GRANT ALL ON TABLE "public"."User" TO "service_role";



GRANT ALL ON TABLE "public"."Vote" TO "anon";
GRANT ALL ON TABLE "public"."Vote" TO "authenticated";
GRANT ALL ON TABLE "public"."Vote" TO "service_role";



GRANT ALL ON TABLE "public"."account" TO "anon";
GRANT ALL ON TABLE "public"."account" TO "authenticated";
GRANT ALL ON TABLE "public"."account" TO "service_role";



GRANT ALL ON TABLE "public"."activity_logs" TO "anon";
GRANT ALL ON TABLE "public"."activity_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_logs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."activity_logs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."activity_logs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."activity_logs_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."campaigns" TO "anon";
GRANT ALL ON TABLE "public"."campaigns" TO "authenticated";
GRANT ALL ON TABLE "public"."campaigns" TO "service_role";



GRANT ALL ON SEQUENCE "public"."campaigns_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."campaigns_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."campaigns_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."customers" TO "anon";
GRANT ALL ON TABLE "public"."customers" TO "authenticated";
GRANT ALL ON TABLE "public"."customers" TO "service_role";



GRANT ALL ON SEQUENCE "public"."customers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."customers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."customers_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."designs" TO "anon";
GRANT ALL ON TABLE "public"."designs" TO "authenticated";
GRANT ALL ON TABLE "public"."designs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."designs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."designs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."designs_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."invitations" TO "anon";
GRANT ALL ON TABLE "public"."invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."invitations" TO "service_role";



GRANT ALL ON SEQUENCE "public"."invitations_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."invitations_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."invitations_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."session" TO "anon";
GRANT ALL ON TABLE "public"."session" TO "authenticated";
GRANT ALL ON TABLE "public"."session" TO "service_role";



GRANT ALL ON TABLE "public"."team_members" TO "anon";
GRANT ALL ON TABLE "public"."team_members" TO "authenticated";
GRANT ALL ON TABLE "public"."team_members" TO "service_role";



GRANT ALL ON SEQUENCE "public"."team_members_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."team_members_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."team_members_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."teams" TO "anon";
GRANT ALL ON TABLE "public"."teams" TO "authenticated";
GRANT ALL ON TABLE "public"."teams" TO "service_role";



GRANT ALL ON SEQUENCE "public"."teams_serial_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."teams_serial_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."teams_serial_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."verificationToken" TO "anon";
GRANT ALL ON TABLE "public"."verificationToken" TO "authenticated";
GRANT ALL ON TABLE "public"."verificationToken" TO "service_role";



GRANT ALL ON TABLE "public"."webshops" TO "anon";
GRANT ALL ON TABLE "public"."webshops" TO "authenticated";
GRANT ALL ON TABLE "public"."webshops" TO "service_role";



GRANT ALL ON SEQUENCE "public"."webshops_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."webshops_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."webshops_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
