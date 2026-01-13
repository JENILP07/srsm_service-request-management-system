-- =========================================================================
-- TASKPATHPAL (SERVICEDESK) DATABASE SETUP SCRIPT
-- Run this entire script in your Supabase SQL Editor to set up the project.
-- =========================================================================

-- 1. ENUMS & BASIC TABLES
-- =========================================================================

-- Create role enum type
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'hod', 'technician', 'requestor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create profiles table for user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  department_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT profiles_name_length CHECK (char_length(name) <= 100)
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'requestor',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create service_departments table
CREATE TABLE IF NOT EXISTS public.service_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  cc_email TEXT,
  is_request_title_disabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT departments_name_length CHECK (char_length(name) <= 100),
  CONSTRAINT departments_description_length CHECK (char_length(description) <= 500)
);

-- Create service_request_statuses table
CREATE TABLE IF NOT EXISTS public.service_request_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  system_name TEXT NOT NULL UNIQUE,
  sequence INTEGER DEFAULT 0,
  description TEXT,
  css_class TEXT,
  is_open BOOLEAN DEFAULT true,
  is_no_further_action_required BOOLEAN DEFAULT false,
  is_allowed_for_technician BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT statuses_name_length CHECK (char_length(name) <= 100),
  CONSTRAINT statuses_description_length CHECK (char_length(description) <= 500)
);

-- Create service_types table
CREATE TABLE IF NOT EXISTS public.service_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  sequence INTEGER DEFAULT 0,
  is_for_staff BOOLEAN DEFAULT true,
  is_for_student BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT service_types_name_length CHECK (char_length(name) <= 100),
  CONSTRAINT service_types_description_length CHECK (char_length(description) <= 500)
);

-- Create service_request_types table
CREATE TABLE IF NOT EXISTS public.service_request_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type_id UUID REFERENCES public.service_types(id),
  department_id UUID REFERENCES public.service_departments(id),
  name TEXT NOT NULL,
  description TEXT,
  sequence INTEGER DEFAULT 0,
  default_priority_level TEXT DEFAULT 'Medium',
  reminder_days_after_assignment INTEGER DEFAULT 3,
  is_visible_resource BOOLEAN DEFAULT false,
  is_mandatory_resource BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT request_types_name_length CHECK (char_length(name) <= 100),
  CONSTRAINT request_types_description_length CHECK (char_length(description) <= 500)
);

-- Create service_dept_persons table
CREATE TABLE IF NOT EXISTS public.service_dept_persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES public.service_departments(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  from_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  to_date TIMESTAMP WITH TIME ZONE,
  is_hod BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service_request_type_wise_persons table
CREATE TABLE IF NOT EXISTS public.service_request_type_wise_persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_type_id UUID REFERENCES public.service_request_types(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  from_date TIMESTAMP WITH TIME ZONE,
  to_date TIMESTAMP WITH TIME ZONE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service_requests table
CREATE TABLE IF NOT EXISTS public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_no TEXT UNIQUE, -- Made nullable initially for trigger
  request_datetime TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  requester_id UUID REFERENCES auth.users(id) NOT NULL,
  service_request_type_id UUID REFERENCES public.service_request_types(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority_level TEXT NOT NULL DEFAULT 'Medium',
  status_id UUID REFERENCES public.service_request_statuses(id) NOT NULL,
  status_datetime TIMESTAMP WITH TIME ZONE,
  status_by_user_id UUID REFERENCES auth.users(id),
  status_description TEXT,
  approval_status TEXT DEFAULT 'Pending',
  approval_datetime TIMESTAMP WITH TIME ZONE,
  approval_by_user_id UUID REFERENCES auth.users(id),
  approval_description TEXT,
  assigned_to_user_id UUID REFERENCES auth.users(id),
  assigned_datetime TIMESTAMP WITH TIME ZONE,
  assigned_by_user_id UUID REFERENCES auth.users(id),
  assigned_description TEXT,
  on_behalf_of_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT service_requests_title_length CHECK (char_length(title) <= 250),
  CONSTRAINT service_requests_description_length CHECK (char_length(description) <= 5000)
);

-- Create service_request_replies table
CREATE TABLE IF NOT EXISTS public.service_request_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  reply_datetime TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reply_description TEXT NOT NULL,
  attachment_path TEXT,
  status_id UUID REFERENCES public.service_request_statuses(id),
  status_datetime TIMESTAMP WITH TIME ZONE,
  status_by_user_id UUID REFERENCES auth.users(id),
  status_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT replies_description_length CHECK (char_length(reply_description) <= 5000)
);

-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_request_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_request_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_dept_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_request_type_wise_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_request_replies ENABLE ROW LEVEL SECURITY;

-- Security Definer Functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _user_id IS NULL OR _role IS NULL THEN RETURN FALSE; END IF;
  RETURN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _user_id IS NULL THEN RETURN NULL; END IF;
  RETURN (SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1);
END;
$$;

-- RLS: Profiles (Restricted)
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins and HODs can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hod'));
CREATE POLICY "Technicians can view requester profiles" ON public.profiles FOR SELECT USING (
  public.has_role(auth.uid(), 'technician') AND EXISTS (SELECT 1 FROM service_requests sr WHERE sr.assigned_to_user_id = auth.uid() AND sr.requester_id = profiles.id)
);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS: User Roles
CREATE POLICY "Users can view their own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own role on signup" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS: Reference Tables (Read-only for all, Manage for Admin)
CREATE POLICY "Authenticated users can view departments" ON public.service_departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage departments" ON public.service_departments FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view statuses" ON public.service_request_statuses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage statuses" ON public.service_request_statuses FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view service types" ON public.service_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage service types" ON public.service_types FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view request types" ON public.service_request_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage request types" ON public.service_request_types FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view dept persons" ON public.service_dept_persons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage dept persons" ON public.service_dept_persons FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view type person mappings" ON public.service_request_type_wise_persons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage type person mappings" ON public.service_request_type_wise_persons FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS: Service Requests
CREATE POLICY "Users can view own requests" ON public.service_requests FOR SELECT USING (auth.uid() = requester_id);
CREATE POLICY "Technicians can view assigned requests" ON public.service_requests FOR SELECT USING (auth.uid() = assigned_to_user_id);
CREATE POLICY "HOD/Admin can view all requests" ON public.service_requests FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hod'));
CREATE POLICY "Requestors can create requests" ON public.service_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Technicians can update assigned requests" ON public.service_requests FOR UPDATE USING (auth.uid() = assigned_to_user_id AND public.has_role(auth.uid(), 'technician'));
CREATE POLICY "HOD can update department requests" ON public.service_requests FOR UPDATE USING (public.has_role(auth.uid(), 'hod'));
CREATE POLICY "Admin can manage all requests" ON public.service_requests FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS: Service Request Replies
CREATE POLICY "Users can view replies on own requests" ON public.service_request_replies FOR SELECT USING (EXISTS (SELECT 1 FROM public.service_requests sr WHERE sr.id = service_request_id AND sr.requester_id = auth.uid()));
CREATE POLICY "Technicians can view replies on assigned requests" ON public.service_request_replies FOR SELECT USING (EXISTS (SELECT 1 FROM public.service_requests sr WHERE sr.id = service_request_id AND sr.assigned_to_user_id = auth.uid()));
CREATE POLICY "HOD/Admin can view all replies" ON public.service_request_replies FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hod'));
CREATE POLICY "Authenticated users can create replies" ON public.service_request_replies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin can manage all replies" ON public.service_request_replies FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 3. TRIGGERS & FUNCTIONS
-- =========================================================================

-- Handle new user signup (create profile & role)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE clean_name TEXT;
BEGIN
  clean_name := LEFT(TRIM(COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))), 100);
  IF clean_name = '' OR clean_name IS NULL THEN clean_name := split_part(NEW.email, '@', 1); END IF;
  INSERT INTO public.profiles (id, name, email) VALUES (NEW.id, clean_name, NEW.email);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'requestor');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-generate Update Timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_service_departments_updated_at BEFORE UPDATE ON public.service_departments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_service_request_statuses_updated_at BEFORE UPDATE ON public.service_request_statuses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_service_types_updated_at BEFORE UPDATE ON public.service_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_service_request_types_updated_at BEFORE UPDATE ON public.service_request_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_service_dept_persons_updated_at BEFORE UPDATE ON public.service_dept_persons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_service_request_type_wise_persons_updated_at BEFORE UPDATE ON public.service_request_type_wise_persons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON public.service_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_service_request_replies_updated_at BEFORE UPDATE ON public.service_request_replies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Sequence for Request No
CREATE SEQUENCE IF NOT EXISTS public.service_request_seq START WITH 1;

-- Auto-generate Request No Trigger
CREATE OR REPLACE FUNCTION public.generate_request_no_trigger()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE seq_num INTEGER; year_str TEXT;
BEGIN
  IF NEW.request_no IS NULL OR NEW.request_no = '' THEN
    year_str := to_char(now(), 'YYYY');
    seq_num := nextval('service_request_seq');
    NEW.request_no := 'SR-' || year_str || '-' || LPAD(seq_num::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_request_no ON public.service_requests;
CREATE TRIGGER set_request_no BEFORE INSERT ON public.service_requests FOR EACH ROW EXECUTE FUNCTION public.generate_request_no_trigger();

-- 4. INSERT DEFAULT DATA
-- =========================================================================

-- Seed Statuses
INSERT INTO public.service_request_statuses (name, system_name, sequence, css_class) VALUES
('Pending', 'Pending', 1, 'bg-yellow-100 text-yellow-800'),
('In Progress', 'In Progress', 2, 'bg-blue-100 text-blue-800'),
('Resolved', 'Resolved', 3, 'bg-green-100 text-green-800'),
('Closed', 'Closed', 4, 'bg-gray-100 text-gray-800')
ON CONFLICT (system_name) DO NOTHING;

-- Seed Service Types
INSERT INTO public.service_types (name, description, sequence) VALUES
('IT Support', 'Computer, Network, Printer issues', 1),
('Maintenance', 'Electrical, Plumbing, Furniture repairs', 2)
ON CONFLICT DO NOTHING;
