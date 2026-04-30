-- 手工初始化迁移（在受限环境下替代 drizzle-kit generate 产物）
-- 与 src/lib/db/schema/index.ts 对齐

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN CREATE TYPE user_status AS ENUM ('active', 'pending_verification', 'disabled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('super_admin', 'competition_admin', 'content_editor', 'student_user'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE role_scope AS ENUM ('global', 'competition'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE competition_status AS ENUM ('draft', 'upcoming', 'registration_open', 'in_progress', 'finished', 'archived'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE registration_mode AS ENUM ('individual', 'team', 'both'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE registration_apply_mode AS ENUM ('individual', 'team'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE registration_form_status AS ENUM ('draft', 'published', 'archived'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE registration_form_version_status AS ENUM ('draft', 'active', 'retired'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE registration_field_scope AS ENUM ('registration', 'team_member'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE registration_status AS ENUM ('draft', 'submitted', 'approved', 'rejected', 'withdrawn', 'cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE registration_revision_action AS ENUM ('save_draft', 'submit', 'resubmit', 'withdraw'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE registration_audit_action AS ENUM ('submit', 'resubmit', 'approve', 'reject', 'withdraw', 'cancel', 'system_cancel'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE notice_status AS ENUM ('draft', 'published', 'withdrawn'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE attachment_visibility AS ENUM ('public', 'admin_only'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "user" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL,
  email varchar(255) NOT NULL,
  email_verified timestamptz,
  image text,
  password_hash text,
  student_no varchar(64),
  college varchar(120),
  major varchar(120),
  grade varchar(64),
  phone varchar(64),
  status user_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS user_email_unique ON "user"(email);

CREATE TABLE IF NOT EXISTS competition (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug varchar(128) NOT NULL,
  title varchar(255) NOT NULL,
  category varchar(120) NOT NULL,
  status competition_status NOT NULL DEFAULT 'draft',
  summary text NOT NULL,
  department varchar(120) NOT NULL,
  registration_mode registration_mode NOT NULL DEFAULT 'individual',
  registration_start_at timestamptz,
  registration_end_at timestamptz,
  event_start_at timestamptz,
  event_end_at timestamptz,
  location varchar(255),
  cover_label varchar(120),
  description text,
  highlights_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  timeline_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  related_questions_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES "user"(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS competition_slug_unique ON competition(slug);
CREATE INDEX IF NOT EXISTS competition_status_idx ON competition(status);

CREATE TABLE IF NOT EXISTS role_assignment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  scope_type role_scope NOT NULL,
  competition_id uuid REFERENCES competition(id) ON DELETE CASCADE,
  granted_by uuid REFERENCES "user"(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);
CREATE INDEX IF NOT EXISTS role_assignment_user_idx ON role_assignment(user_id);
CREATE INDEX IF NOT EXISTS role_assignment_competition_idx ON role_assignment(competition_id);
CREATE UNIQUE INDEX IF NOT EXISTS role_assignment_user_role_scope_unique
  ON role_assignment(user_id, role, scope_type, competition_id) WHERE revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS competition_status_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES competition(id) ON DELETE CASCADE,
  from_status competition_status NOT NULL,
  to_status competition_status NOT NULL,
  operator_user_id uuid REFERENCES "user"(id) ON DELETE SET NULL,
  operator_role user_role NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS competition_status_log_competition_created_idx
  ON competition_status_log(competition_id, created_at);

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

CREATE TABLE IF NOT EXISTS competition_attachment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES competition(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  storage_key varchar(512) NOT NULL,
  mime_type varchar(128),
  size_bytes integer,
  visibility attachment_visibility NOT NULL DEFAULT 'public',
  created_by uuid REFERENCES "user"(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS competition_faq (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES competition(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS registration_form (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES competition(id) ON DELETE CASCADE,
  status registration_form_status NOT NULL DEFAULT 'draft',
  apply_mode registration_mode NOT NULL DEFAULT 'individual',
  max_team_size integer NOT NULL DEFAULT 1,
  current_version_id uuid,
  created_by uuid REFERENCES "user"(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS registration_form_competition_unique
  ON registration_form(competition_id);

CREATE TABLE IF NOT EXISTS registration_form_version (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES registration_form(id) ON DELETE CASCADE,
  version_no integer NOT NULL,
  status registration_form_version_status NOT NULL DEFAULT 'draft',
  change_note text,
  published_at timestamptz,
  created_by uuid REFERENCES "user"(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(form_id, version_no)
);

CREATE TABLE IF NOT EXISTS registration_form_field (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_version_id uuid NOT NULL REFERENCES registration_form_version(id) ON DELETE CASCADE,
  field_key varchar(120) NOT NULL,
  label varchar(160) NOT NULL,
  field_type varchar(80) NOT NULL,
  scope registration_field_scope NOT NULL DEFAULT 'registration',
  is_required boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  export_order integer NOT NULL DEFAULT 0,
  export_label varchar(160),
  placeholder text,
  help_text text,
  default_value_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  options_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  validation_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  visibility_rule_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(form_version_id, field_key)
);

CREATE TABLE IF NOT EXISTS registration (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_no varchar(32) NOT NULL,
  competition_id uuid NOT NULL REFERENCES competition(id) ON DELETE CASCADE,
  form_version_id uuid NOT NULL REFERENCES registration_form_version(id) ON DELETE RESTRICT,
  applicant_user_id uuid NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
  apply_mode registration_apply_mode NOT NULL,
  status registration_status NOT NULL DEFAULT 'draft',
  revision_no integer NOT NULL DEFAULT 0,
  payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  applicant_snapshot_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  submitted_at timestamptz,
  approved_at timestamptz,
  last_reviewed_at timestamptz,
  last_reviewed_by uuid REFERENCES "user"(id) ON DELETE SET NULL,
  latest_review_comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS registration_no_unique ON registration(registration_no);
CREATE INDEX IF NOT EXISTS registration_status_idx ON registration(status);
CREATE INDEX IF NOT EXISTS registration_competition_status_idx ON registration(competition_id, status);
CREATE UNIQUE INDEX IF NOT EXISTS registration_competition_applicant_active_unique
  ON registration(competition_id, applicant_user_id)
  WHERE status IN ('draft', 'submitted', 'approved', 'rejected', 'withdrawn');

CREATE TABLE IF NOT EXISTS registration_team_member (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES registration(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  is_leader boolean NOT NULL DEFAULT false,
  member_role varchar(120),
  name varchar(100) NOT NULL,
  student_no varchar(64),
  college varchar(120),
  major varchar(120),
  grade varchar(64),
  phone varchar(64),
  email varchar(255),
  member_payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS registration_revision (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES registration(id) ON DELETE CASCADE,
  revision_no integer NOT NULL,
  action_type registration_revision_action NOT NULL,
  payload_snapshot_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  team_snapshot_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  applicant_snapshot_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  form_version_id uuid NOT NULL REFERENCES registration_form_version(id) ON DELETE RESTRICT,
  created_by uuid REFERENCES "user"(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(registration_id, revision_no)
);

CREATE TABLE IF NOT EXISTS registration_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES registration(id) ON DELETE CASCADE,
  from_status registration_status NOT NULL,
  to_status registration_status NOT NULL,
  action registration_audit_action NOT NULL,
  operator_user_id uuid REFERENCES "user"(id) ON DELETE SET NULL,
  operator_role user_role NOT NULL,
  comment text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS registration_audit_log_registration_created_idx
  ON registration_audit_log(registration_id, created_at);

CREATE TABLE IF NOT EXISTS auth_account (
  user_id uuid NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  type varchar(32) NOT NULL,
  provider varchar(64) NOT NULL,
  provider_account_id varchar(191) NOT NULL,
  refresh_token text,
  access_token text,
  expires_at integer,
  token_type varchar(32),
  scope text,
  id_token text,
  session_state text,
  PRIMARY KEY (provider, provider_account_id)
);

CREATE TABLE IF NOT EXISTS auth_session (
  session_token varchar(191) PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  expires timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_verification_token (
  identifier varchar(191) NOT NULL,
  token varchar(191) NOT NULL,
  expires timestamptz NOT NULL,
  PRIMARY KEY (identifier, token)
);
