-- Remove duplicate event configs, keeping only the most recent
DELETE FROM public.event_config 
WHERE id NOT IN (
  SELECT id FROM public.event_config 
  ORDER BY updated_at DESC 
  LIMIT 1
);