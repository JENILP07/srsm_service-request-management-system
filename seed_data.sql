-- =========================================================================
-- DUMMY DATA SEED SCRIPT
-- Run this in Supabase SQL Editor to populate your database.
-- =========================================================================

-- 1. SEED DEPARTMENTS
-- =========================================================================
INSERT INTO public.service_departments (name, description, cc_email) VALUES
('IT Department', 'Handles all hardware, software, and network issues', 'it.support@example.com'),
('Facility Management', 'Housekeeping, plumbing, electrical, and furniture', 'facility@example.com'),
('HR Department', 'Employee relations, payroll, and benefits', 'hr@example.com'),
('Accounts', 'Billing, reimbursements, and finance', 'accounts@example.com')
ON CONFLICT DO NOTHING;

-- 2. SEED SERVICE TYPES
-- =========================================================================
INSERT INTO public.service_types (name, description, sequence) VALUES
('Hardware Support', 'Physical equipment repair and replacement', 1),
('Software Support', 'Installation, licensing, and troubleshooting', 2),
('Network/Internet', 'WiFi, LAN, and VPN access', 3),
('Civil Maintenance', 'Painting, carpentry, and furniture repair', 4),
('Electrical', 'Lights, fans, AC, and power points', 5)
ON CONFLICT DO NOTHING;

-- 3. SEED REQUEST TYPES
-- =========================================================================
-- We use subqueries to get IDs dynamically so this script works on any DB instance.

-- IT > Hardware
INSERT INTO public.service_request_types (name, description, department_id, service_type_id, default_priority_level)
SELECT 'Printer Malfunction', 'Paper jams, toner refill, not connecting', 
  (SELECT id FROM public.service_departments WHERE name = 'IT Department'),
  (SELECT id FROM public.service_types WHERE name = 'Hardware Support'),
  'Medium'
WHERE NOT EXISTS (SELECT 1 FROM public.service_request_types WHERE name = 'Printer Malfunction');

INSERT INTO public.service_request_types (name, description, department_id, service_type_id, default_priority_level)
SELECT 'Laptop/Desktop Repair', 'System not starting, screen broken, etc.', 
  (SELECT id FROM public.service_departments WHERE name = 'IT Department'),
  (SELECT id FROM public.service_types WHERE name = 'Hardware Support'),
  'High'
WHERE NOT EXISTS (SELECT 1 FROM public.service_request_types WHERE name = 'Laptop/Desktop Repair');

-- IT > Network
INSERT INTO public.service_request_types (name, description, department_id, service_type_id, default_priority_level)
SELECT 'WiFi Connectivity', 'Cannot connect to office WiFi', 
  (SELECT id FROM public.service_departments WHERE name = 'IT Department'),
  (SELECT id FROM public.service_types WHERE name = 'Network/Internet'),
  'High'
WHERE NOT EXISTS (SELECT 1 FROM public.service_request_types WHERE name = 'WiFi Connectivity');

-- Facility > Electrical
INSERT INTO public.service_request_types (name, description, department_id, service_type_id, default_priority_level)
SELECT 'AC Not Cooling', 'Air conditioner maintenance required', 
  (SELECT id FROM public.service_departments WHERE name = 'Facility Management'),
  (SELECT id FROM public.service_types WHERE name = 'Electrical'),
  'Medium'
WHERE NOT EXISTS (SELECT 1 FROM public.service_request_types WHERE name = 'AC Not Cooling');

-- 4. SEED SAMPLE REQUESTS
-- =========================================================================
-- WARNING: These requests will be assigned to the FIRST user found in your system.
-- Ensure you have at least one user signed up!

DO $$
DECLARE
  first_user_id UUID;
  status_pending_id UUID;
  status_progress_id UUID;
  type_printer_id UUID;
  type_wifi_id UUID;
BEGIN
  -- Get the first user (likely YOU)
  SELECT id INTO first_user_id FROM auth.users LIMIT 1;
  
  -- Get Status IDs
  SELECT id INTO status_pending_id FROM public.service_request_statuses WHERE system_name = 'Pending';
  SELECT id INTO status_progress_id FROM public.service_request_statuses WHERE system_name = 'In Progress';
  
  -- Get Request Type IDs
  SELECT id INTO type_printer_id FROM public.service_request_types WHERE name = 'Printer Malfunction' LIMIT 1;
  SELECT id INTO type_wifi_id FROM public.service_request_types WHERE name = 'WiFi Connectivity' LIMIT 1;

  -- Only insert if we have a user and types
  IF first_user_id IS NULL OR type_printer_id IS NULL THEN
    RAISE NOTICE 'Skipping sample requests: No user or Request Types found.';
    RETURN;
  END IF;

  -- Request 1: Printer Issue (Pending)
  INSERT INTO public.service_requests (
    requester_id, 
    service_request_type_id, 
    title, 
    description, 
    priority_level, 
    status_id
  )
  VALUES (
    first_user_id,
    type_printer_id,
    'Printer on 2nd Floor is jamming',
    'Every time I try to print a PDF, the paper jams in the rear tray. Please fix asap.',
    'Medium',
    status_pending_id
  );

  -- Request 2: WiFi Issue (In Progress)
  INSERT INTO public.service_requests (
    requester_id, 
    service_request_type_id, 
    title, 
    description, 
    priority_level, 
    status_id
  )
  VALUES (
    first_user_id,
    type_wifi_id,
    'Weak Signal in Conference Room B',
    'The signal drops frequently during video calls.',
    'High',
    status_progress_id
  );

  -- 5. SEED PERSONNEL MAPPINGS (Assign YOU to Dept & Type)
  -- =========================================================================
  
  -- Assign current user to IT Department
  INSERT INTO public.service_dept_persons (
    department_id,
    user_id,
    is_hod,
    description
  ) 
  SELECT 
    (SELECT id FROM public.service_departments WHERE name = 'IT Department' LIMIT 1),
    first_user_id,
    true, -- Make you HOD so you can see approvals
    'Head of IT'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.service_dept_persons WHERE user_id = first_user_id 
    AND department_id = (SELECT id FROM public.service_departments WHERE name = 'IT Department' LIMIT 1)
  );

  -- Assign current user as specialist for Printer Malfunction
  INSERT INTO public.service_request_type_wise_persons (
    service_request_type_id,
    user_id,
    description
  )
  SELECT
    type_printer_id,
    first_user_id,
    'Printer Specialist'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.service_request_type_wise_persons WHERE user_id = first_user_id
    AND service_request_type_id = type_printer_id
  );

END $$;
