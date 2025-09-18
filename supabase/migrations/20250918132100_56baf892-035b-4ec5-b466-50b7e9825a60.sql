-- Add event_id foreign key to registrations table to link each registration to a specific event
ALTER TABLE public.registrations 
ADD COLUMN event_id UUID REFERENCES public.event_config(id) ON DELETE CASCADE;

-- Create index for better performance on event_id lookups
CREATE INDEX idx_registrations_event_id ON public.registrations(event_id);