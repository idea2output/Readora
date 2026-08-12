-- Hardening handle_new_user() security definer function against public REST API execution
revoke execute on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to service_role;
