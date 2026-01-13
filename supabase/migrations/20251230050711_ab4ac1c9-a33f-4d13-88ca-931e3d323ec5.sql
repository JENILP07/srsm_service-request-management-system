-- Fix: User emails exposed to all authenticated users
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create more restrictive policies
-- Users can always see their own full profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Admins and HODs can view all profiles (for assignment, management purposes)
CREATE POLICY "Admins and HODs can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'hod'::app_role)
);

-- Technicians can view profiles of users who created requests assigned to them
CREATE POLICY "Technicians can view requester profiles" 
ON public.profiles 
FOR SELECT 
USING (
  has_role(auth.uid(), 'technician'::app_role) AND
  EXISTS (
    SELECT 1 FROM service_requests sr 
    WHERE sr.assigned_to_user_id = auth.uid() 
    AND sr.requester_id = profiles.id
  )
);