-- Check if anon role has INSERT privilege at the table level
-- Run this in Supabase SQL Editor

-- Check what table-level privileges anon has
SELECT
  grantee,
  table_schema,
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'households'
  AND grantee = 'anon';

-- Check if anon role exists and its properties
SELECT
  rolname,
  rolsuper,
  rolinherit,
  rolcreaterole,
  rolcreatedb,
  rolcanlogin
FROM pg_roles
WHERE rolname = 'anon';

-- Try granting INSERT explicitly again
GRANT INSERT ON households TO anon;

-- Verify the grant worked
SELECT
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'households'
  AND grantee = 'anon'
  AND privilege_type = 'INSERT';

-- Now test INSERT as anon again
SET ROLE anon;
INSERT INTO households (name, invite_code) VALUES ('Test', 'TEST02') RETURNING *;
RESET ROLE;

-- Cleanup
DELETE FROM households WHERE invite_code = 'TEST02';
