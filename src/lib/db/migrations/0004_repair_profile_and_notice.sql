-- 修复历史库中 user_profile / competition_notice 缺失或列漂移问题（幂等）

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE notice_status AS ENUM ('draft', 'published', 'withdrawn');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE gender AS ENUM ('male', 'female', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE in_school_status AS ENUM ('yes', 'no', 'graduated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS competition_notice (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES competition(id) ON DELETE CASCADE,
  title varchar(255) NOT NULL,
  content text NOT NULL,
  status notice_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_by uuid REFERENCES "user"(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES "user"(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE competition_notice
  ADD COLUMN IF NOT EXISTS id uuid,
  ADD COLUMN IF NOT EXISTS competition_id uuid,
  ADD COLUMN IF NOT EXISTS title varchar(255),
  ADD COLUMN IF NOT EXISTS content text,
  ADD COLUMN IF NOT EXISTS status notice_status,
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS updated_by uuid,
  ADD COLUMN IF NOT EXISTS created_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz;

UPDATE competition_notice SET id = gen_random_uuid() WHERE id IS NULL;
UPDATE competition_notice SET status = 'draft' WHERE status IS NULL;
UPDATE competition_notice SET created_at = now() WHERE created_at IS NULL;
UPDATE competition_notice SET updated_at = now() WHERE updated_at IS NULL;

ALTER TABLE competition_notice ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE competition_notice ALTER COLUMN status SET DEFAULT 'draft';
ALTER TABLE competition_notice ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE competition_notice ALTER COLUMN updated_at SET DEFAULT now();

CREATE INDEX IF NOT EXISTS competition_notice_competition_idx
  ON competition_notice(competition_id);

CREATE TABLE IF NOT EXISTS user_profile (
  user_id                    uuid PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  nickname                   varchar(100),
  gender                     gender,
  birthday                   timestamptz,
  school_name                varchar(200),
  department                 varchar(120),
  enrollment_year            integer,
  education_level            varchar(64),
  in_school_status           in_school_status,
  public_bio                 text,
  skill_tags                 jsonb NOT NULL DEFAULT '[]'::jsonb,
  public_show_avatar         boolean NOT NULL DEFAULT true,
  public_show_college_major  boolean NOT NULL DEFAULT true,
  public_show_titles         boolean NOT NULL DEFAULT true,
  created_at                 timestamptz NOT NULL DEFAULT now(),
  updated_at                 timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_profile
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS nickname varchar(100),
  ADD COLUMN IF NOT EXISTS gender gender,
  ADD COLUMN IF NOT EXISTS birthday timestamptz,
  ADD COLUMN IF NOT EXISTS school_name varchar(200),
  ADD COLUMN IF NOT EXISTS department varchar(120),
  ADD COLUMN IF NOT EXISTS enrollment_year integer,
  ADD COLUMN IF NOT EXISTS education_level varchar(64),
  ADD COLUMN IF NOT EXISTS in_school_status in_school_status,
  ADD COLUMN IF NOT EXISTS public_bio text,
  ADD COLUMN IF NOT EXISTS skill_tags jsonb,
  ADD COLUMN IF NOT EXISTS public_show_avatar boolean,
  ADD COLUMN IF NOT EXISTS public_show_college_major boolean,
  ADD COLUMN IF NOT EXISTS public_show_titles boolean,
  ADD COLUMN IF NOT EXISTS created_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz;

UPDATE user_profile SET skill_tags = '[]'::jsonb WHERE skill_tags IS NULL;
UPDATE user_profile SET public_show_avatar = true WHERE public_show_avatar IS NULL;
UPDATE user_profile
SET public_show_college_major = true
WHERE public_show_college_major IS NULL;
UPDATE user_profile SET public_show_titles = true WHERE public_show_titles IS NULL;
UPDATE user_profile SET created_at = now() WHERE created_at IS NULL;
UPDATE user_profile SET updated_at = now() WHERE updated_at IS NULL;

ALTER TABLE user_profile ALTER COLUMN skill_tags SET DEFAULT '[]'::jsonb;
ALTER TABLE user_profile ALTER COLUMN public_show_avatar SET DEFAULT true;
ALTER TABLE user_profile ALTER COLUMN public_show_college_major SET DEFAULT true;
ALTER TABLE user_profile ALTER COLUMN public_show_titles SET DEFAULT true;
ALTER TABLE user_profile ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE user_profile ALTER COLUMN updated_at SET DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS user_profile_user_id_unique
  ON user_profile(user_id);
