-- 经验文章表迁移（幂等）

DO $$ BEGIN
  CREATE TYPE experience_post_status AS ENUM ('draft', 'pending_review', 'published', 'offline');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS experience_post (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  competition_id      varchar(64),
  competition_title   varchar(300),
  title               varchar(300) NOT NULL,
  content             text NOT NULL DEFAULT '',
  award_level         varchar(120),
  cover_image         text,
  status              experience_post_status NOT NULL DEFAULT 'draft',
  reviewer_id         uuid,
  review_comment      text,
  reviewed_at         timestamptz,
  published_at        timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS experience_post_user_idx ON experience_post(user_id);
CREATE INDEX IF NOT EXISTS experience_post_status_idx ON experience_post(status);
