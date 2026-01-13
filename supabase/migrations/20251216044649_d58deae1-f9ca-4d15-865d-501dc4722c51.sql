-- Fix function search_path for generate_request_no
CREATE OR REPLACE FUNCTION public.generate_request_no()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  seq_num INTEGER;
  year_str TEXT;
BEGIN
  year_str := to_char(now(), 'YYYY');
  SELECT COALESCE(MAX(CAST(substring(request_no from 9) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM public.service_requests
  WHERE request_no LIKE 'SR-' || year_str || '-%';
  RETURN 'SR-' || year_str || '-' || LPAD(seq_num::TEXT, 4, '0');
END;
$$;

-- Fix function search_path for update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;