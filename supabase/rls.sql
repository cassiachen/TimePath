-- Row Level Security for TimePath. Run this AFTER schema.sql, in the same
-- Supabase SQL editor. Every table gets RLS turned on plus one "for all"
-- policy: a user may select/insert/update/delete only rows whose user_id
-- equals their own auth.uid(). The anon key is safe to ship in the client
-- precisely because of these policies — without a valid session there is no
-- auth.uid(), so `using` never matches and no rows are visible.

alter table user_settings enable row level security;
alter table sops enable row level security;
alter table tasks enable row level security;
alter table goals enable row level security;
alter table goal_nodes enable row level security;
alter table goal_node_tasks enable row level security;

drop policy if exists user_settings_owner on user_settings;
create policy user_settings_owner on user_settings
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists sops_owner on sops;
create policy sops_owner on sops
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists tasks_owner on tasks;
create policy tasks_owner on tasks
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists goals_owner on goals;
create policy goals_owner on goals
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists goal_nodes_owner on goal_nodes;
create policy goal_nodes_owner on goal_nodes
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists goal_node_tasks_owner on goal_node_tasks;
create policy goal_node_tasks_owner on goal_node_tasks
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
