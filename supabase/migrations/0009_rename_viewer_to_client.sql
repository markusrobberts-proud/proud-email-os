-- 0009_rename_viewer_to_client.sql
-- The role formerly known as "viewer" is now "client": brand-scoped,
-- read-only, intended for the brand's actual stakeholder (the
-- agency client) rather than an internal account-manager-type viewer.
--
-- Postgres lets us rename enum values in place so all existing rows
-- update for free. Brand_members.role uses the same user_role enum,
-- so this rename flows through there too.

alter type user_role rename value 'viewer' to 'client';
