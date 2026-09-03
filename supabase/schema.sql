-- TimePath cloud schema. Run this once in the Supabase SQL editor
-- (Dashboard -> SQL Editor -> New query -> paste -> Run), before rls.sql.
--
-- Deliberate deviation from the original design doc: primary keys are `text`,
-- not `uuid`. The app already generates its own ids client-side via
-- U.uid()/S.uid() (e.g. "task_mtjrl88rqhucb6") and has done so since before
-- any cloud sync existed. Keeping that exact id as the row's primary key
-- means the sync layer and the one-time LocalStorage migration never need an
-- id-remapping pass — the local id *is* the row id, always. A generated
-- uuid default would have forced a client-id -> server-id translation table
-- everywhere foreign keys are involved (sop_id, goal_id, parent_id,
-- linkedTaskIds); text ids sidestep that entirely.

-- ============================================================
-- user_settings — 1:1 with auth.users. Replaces the single global
-- Budget object + language + selectedDate that used to live in
-- localStorage under "timepath:v1".
-- ============================================================
create table if not exists user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  language text not null default 'zh' check (language in ('zh', 'en')),
  budget jsonb not null default '{"sleep":8,"work":8.5,"meals":1.5,"commute":1,"exercise":0,"study":0,"entertainment":0,"other":0}'::jsonb,
  budget_configured boolean not null default false,
  selected_date date not null default current_date,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- sops — the SOP library (sop.html)
-- ============================================================
create table if not exists sops (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null default '',
  default_duration_minutes int not null default 30,
  steps jsonb not null default '[]'::jsonb,           -- [{id, title}]
  min_standard text not null default '',
  full_standard text not null default '',
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- tasks — the core object shared by Today / Tasks / SOP / Review
-- ============================================================
create table if not exists tasks (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  date date not null,
  start_time text not null,                            -- "HH:MM", same format as the client
  estimated_minutes int not null default 30,
  priority text not null default 'should' check (priority in ('must', 'should', 'optional')),
  category text not null default '',
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done', 'delayed', 'skipped')),
  sop_id text references sops(id) on delete set null,
  energy text not null default 'mid' check (energy in ('high', 'mid', 'low')),
  note text not null default '',
  subtasks jsonb not null default '[]'::jsonb,         -- [{id, title, done}]
  is_buffer boolean not null default false,
  recurrence text not null default 'none' check (recurrence in ('none', 'daily', 'weekly')),
  time_log jsonb not null default '[]'::jsonb,         -- [{start, end}] epoch ms, matches client's Date.now()
  running_since timestamptz,
  delay_history jsonb not null default '[]'::jsonb,    -- [{date, reason, action}]
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tasks_user_date_idx on tasks (user_id, date);

-- ============================================================
-- goals — long-term goals (goals.html)
-- ============================================================
create table if not exists goals (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  category text not null default '',
  status text not null default 'active',
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- goal_nodes — month / week breakdown nodes under a goal
-- ============================================================
create table if not exists goal_nodes (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id text not null references goals(id) on delete cascade,
  parent_id text references goal_nodes(id) on delete cascade,   -- week -> month
  level text not null check (level in ('month', 'week')),
  title text not null,
  description text not null default '',
  start_date date not null,
  end_date date not null,
  status text not null default 'active' check (status in ('active', 'done', 'paused')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists goal_nodes_goal_idx on goal_nodes (goal_id);
create index if not exists goal_nodes_parent_idx on goal_nodes (parent_id);

-- ============================================================
-- goal_node_tasks — replaces the old Node.linkedTaskIds[] array with a
-- proper join table, so deleting a task or a node cleans up the link
-- automatically instead of leaving a stale id behind in a jsonb array.
-- ============================================================
create table if not exists goal_node_tasks (
  node_id text not null references goal_nodes(id) on delete cascade,
  task_id text not null references tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (node_id, task_id)
);
