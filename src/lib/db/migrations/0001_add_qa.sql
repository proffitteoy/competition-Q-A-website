-- 问答模块迁移（幂等）

DO $$ BEGIN
  CREATE TYPE question_status AS ENUM ('open', 'closed', 'hidden');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS question (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES competition(id) ON DELETE CASCADE,
  author_id     uuid NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  title         varchar(255) NOT NULL,
  body          text NOT NULL,
  status        question_status NOT NULL DEFAULT 'open',
  is_pinned     boolean NOT NULL DEFAULT false,
  answer_count  integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS question_competition_status_idx
  ON question (competition_id, status);
CREATE INDEX IF NOT EXISTS question_author_idx
  ON question (author_id);

CREATE TABLE IF NOT EXISTS answer (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id   uuid NOT NULL REFERENCES question(id) ON DELETE CASCADE,
  author_id     uuid NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  body          text NOT NULL,
  is_accepted   boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS answer_question_idx
  ON answer (question_id);
CREATE INDEX IF NOT EXISTS answer_author_idx
  ON answer (author_id);

CREATE TABLE IF NOT EXISTS question_comment (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id   uuid NOT NULL REFERENCES question(id) ON DELETE CASCADE,
  answer_id     uuid REFERENCES answer(id) ON DELETE CASCADE,
  parent_id     uuid,
  depth         integer NOT NULL DEFAULT 0,
  author_id     uuid NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  body          text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
  ALTER TABLE question_comment
    ADD CONSTRAINT question_comment_parent_fk
    FOREIGN KEY (parent_id) REFERENCES question_comment(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS question_comment_question_idx
  ON question_comment (question_id);
CREATE INDEX IF NOT EXISTS question_comment_parent_idx
  ON question_comment (parent_id);
