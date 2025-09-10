-- Adicionar coluna event_name na tabela event_config
ALTER TABLE public.event_config 
ADD COLUMN event_name TEXT;