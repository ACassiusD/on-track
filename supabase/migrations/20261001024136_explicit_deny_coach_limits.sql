-- Explicitly deny all direct row access; only the guarded private limiter may update.
create policy coach_limits_no_direct_access on on_track_private.coach_request_limits
for all to public using (false) with check (false);
