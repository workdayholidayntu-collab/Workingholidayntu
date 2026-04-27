-- Align with SECURITY.md §6.2:
--   1. auto-hide threshold 3 → 10 (avoid drive-by takedown by small groups)
--   2. reports: unique (reporter_id, target_type, target_id) to prevent
--      one user spamming the same target with reports

-- 1. Update threshold ------------------------------------------------------

create or replace function public.auto_hide_on_threshold()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pending_count int;
begin
  select count(*) into pending_count
    from reports
    where target_type = new.target_type
      and target_id = new.target_id
      and status = 'pending';

  if pending_count >= 10 then
    if new.target_type = 'post' then
      update posts
        set status = 'hidden'
        where id = new.target_id and status != 'hidden';
    elsif new.target_type = 'comment' then
      update comments
        set status = 'hidden'
        where id = new.target_id and status != 'hidden';
    end if;
  end if;
  return new;
end;
$$;

-- 2. Unique constraint on reports -----------------------------------------

alter table reports
  add constraint reports_reporter_target_unique
  unique (reporter_id, target_type, target_id);
