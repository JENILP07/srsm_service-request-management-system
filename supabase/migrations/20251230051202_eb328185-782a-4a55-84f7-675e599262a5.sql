-- =====================================================
-- SECURITY FIXES MIGRATION
-- =====================================================

-- 1. ADD CHECK CONSTRAINTS FOR INPUT VALIDATION
-- =====================================================

-- Service Requests: title and description length limits
ALTER TABLE public.service_requests 
  ADD CONSTRAINT service_requests_title_length CHECK (char_length(title) <= 250),
  ADD CONSTRAINT service_requests_description_length CHECK (char_length(description) <= 5000);

-- Service Request Replies: reply description length limit
ALTER TABLE public.service_request_replies
  ADD CONSTRAINT replies_description_length CHECK (char_length(reply_description) <= 5000);

-- Profiles: name length limit
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_name_length CHECK (char_length(name) <= 100);

-- Service Departments: name and description limits
ALTER TABLE public.service_departments
  ADD CONSTRAINT departments_name_length CHECK (char_length(name) <= 100),
  ADD CONSTRAINT departments_description_length CHECK (char_length(description) <= 500);

-- Service Types: name and description limits  
ALTER TABLE public.service_types
  ADD CONSTRAINT service_types_name_length CHECK (char_length(name) <= 100),
  ADD CONSTRAINT service_types_description_length CHECK (char_length(description) <= 500);

-- Service Request Types: name and description limits
ALTER TABLE public.service_request_types
  ADD CONSTRAINT request_types_name_length CHECK (char_length(name) <= 100),
  ADD CONSTRAINT request_types_description_length CHECK (char_length(description) <= 500);

-- Service Request Statuses: name and description limits
ALTER TABLE public.service_request_statuses
  ADD CONSTRAINT statuses_name_length CHECK (char_length(name) <= 100),
  ADD CONSTRAINT statuses_description_length CHECK (char_length(description) <= 500);

-- 2. ADD DELETE POLICIES FOR GDPR COMPLIANCE
-- =====================================================

-- Allow admins to delete profiles (GDPR right to be forgotten)
CREATE POLICY "Admins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. IMPROVE generate_request_no TO BE TRIGGER-BASED
-- =====================================================

-- Create sequence for atomic request number generation
CREATE SEQUENCE IF NOT EXISTS public.service_request_seq START WITH 1;

-- Drop the old function and create a trigger-based one
DROP FUNCTION IF EXISTS public.generate_request_no();

-- Create trigger function for auto-generating request numbers
CREATE OR REPLACE FUNCTION public.generate_request_no_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  seq_num INTEGER;
  year_str TEXT;
BEGIN
  -- Only generate if request_no is null or empty
  IF NEW.request_no IS NULL OR NEW.request_no = '' THEN
    year_str := to_char(now(), 'YYYY');
    seq_num := nextval('service_request_seq');
    NEW.request_no := 'SR-' || year_str || '-' || LPAD(seq_num::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-generate request_no on insert
DROP TRIGGER IF EXISTS set_request_no ON public.service_requests;
CREATE TRIGGER set_request_no
  BEFORE INSERT ON public.service_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_request_no_trigger();

-- 4. IMPROVE SECURITY DEFINER FUNCTIONS WITH VALIDATION
-- =====================================================

-- Update has_role with auth check and input validation
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate inputs
  IF _user_id IS NULL OR _role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if role exists
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
END;
$$;

-- Update get_user_role with validation
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate input
  IF _user_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN (
    SELECT role
    FROM public.user_roles
    WHERE user_id = _user_id
    LIMIT 1
  );
END;
$$;

-- Update handle_new_user with input sanitization
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  clean_name TEXT;
BEGIN
  -- Sanitize and limit name length
  clean_name := LEFT(TRIM(COALESCE(
    NEW.raw_user_meta_data->>'name', 
    split_part(NEW.email, '@', 1)
  )), 100);
  
  -- Ensure name is not empty
  IF clean_name = '' OR clean_name IS NULL THEN
    clean_name := split_part(NEW.email, '@', 1);
  END IF;
  
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    clean_name,
    NEW.email
  );
  
  -- Default role is requestor
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'requestor');
  
  RETURN NEW;
END;
$$;