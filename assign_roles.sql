-- =================================================================
-- ROLE ASSIGNMENT SCRIPT
-- 1. Sign up these 3 users in your app first:
--    - hod@test.com
--    - tech@test.com
--    - staff@test.com
-- 2. Run this script to give them the correct roles and permissions.
-- =================================================================

-- 1. ASSIGN ROLES
-- =================================================================
-- Update HOD
UPDATE public.user_roles
SET role = 'hod'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'hod@test.com');

-- Update Technician
UPDATE public.user_roles
SET role = 'technician'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'tech@test.com');

-- (Staff/Requestor is the default role, so no update needed for staff@test.com)


-- 2. ASSIGN HOD TO A DEPARTMENT
-- =================================================================
INSERT INTO public.service_dept_persons (department_id, user_id, is_hod, description)
SELECT 
  (SELECT id FROM public.service_departments WHERE name = 'Facility Management' LIMIT 1),
  (SELECT id FROM auth.users WHERE email = 'hod@test.com'),
  true,
  'Facility Manager'
WHERE EXISTS (SELECT 1 FROM auth.users WHERE email = 'hod@test.com')
AND NOT EXISTS (
  SELECT 1 FROM public.service_dept_persons 
  WHERE user_id = (SELECT id FROM auth.users WHERE email = 'hod@test.com')
);


-- 3. ASSIGN TECHNICIAN TO A REQUEST TYPE (So they receive tasks)
-- =================================================================
INSERT INTO public.service_request_type_wise_persons (service_request_type_id, user_id, description)
SELECT 
  (SELECT id FROM public.service_request_types WHERE name = 'AC Not Cooling' LIMIT 1),
  (SELECT id FROM auth.users WHERE email = 'tech@test.com'),
  'AC Specialist'
WHERE EXISTS (SELECT 1 FROM auth.users WHERE email = 'tech@test.com')
AND NOT EXISTS (
  SELECT 1 FROM public.service_request_type_wise_persons 
  WHERE user_id = (SELECT id FROM auth.users WHERE email = 'tech@test.com')
);
