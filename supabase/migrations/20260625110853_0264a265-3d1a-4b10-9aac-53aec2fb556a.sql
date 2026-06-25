CREATE OR REPLACE FUNCTION public.get_global_stats()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'total', COALESCE((SELECT COUNT(*) FROM public.processed_documents), 0),
    'actions', COALESCE((
      SELECT SUM(jsonb_array_length(COALESCE(structured_data->'tasks', '[]'::jsonb)))
      FROM public.processed_documents
      WHERE jsonb_typeof(structured_data->'tasks') = 'array'
    ), 0),
    'hours_saved', COALESCE((SELECT COUNT(*) * 0.75 FROM public.processed_documents), 0)
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_global_stats() TO anon, authenticated, service_role;