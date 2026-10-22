-- Lets a signed-in user permanently delete their own account and all of their data.
-- Apple requires in-app account deletion for apps with sign-up
-- (App Store Review Guideline 5.1.1(v)). Called from the Profile screen with
-- supabase.rpc("delete_own_account").

create or replace function public.delete_own_account()
returns void
language plpgsql
-- Runs with the owner's rights so it can delete from auth.users; it only ever
-- touches rows belonging to the caller (auth.uid()).
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not signed in';
  end if;

  -- Alarms reference medications, so delete them first.
  delete from public.alarms where user_id = uid;
  delete from public.medications where user_id = uid;
  delete from public.profiles where id = uid;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;
