-- 名人堂表迁移（幂等）

DO $$ BEGIN
  CREATE TYPE hall_of_fame_status AS ENUM ('candidate', 'active', 'hidden');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS hall_of_fame_entry (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  tag             varchar(120) NOT NULL,
  bio             text NOT NULL DEFAULT '',
  admin_bio       text,
  status          hall_of_fame_status NOT NULL DEFAULT 'candidate',
  display_order   integer NOT NULL DEFAULT 0,
  created_by      uuid,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hall_of_fame_entry_user_idx ON hall_of_fame_entry(user_id);
CREATE INDEX IF NOT EXISTS hall_of_fame_entry_status_idx ON hall_of_fame_entry(status);
