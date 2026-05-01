-- 用户扩展资料表迁移（幂等）

DO $$ BEGIN
  CREATE TYPE gender AS ENUM ('male', 'female', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE in_school_status AS ENUM ('yes', 'no', 'graduated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

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
