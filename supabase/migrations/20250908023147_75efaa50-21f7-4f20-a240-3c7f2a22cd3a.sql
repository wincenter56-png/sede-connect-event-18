-- Create storage bucket for event banners
INSERT INTO storage.buckets (id, name, public) 
VALUES ('event-banners', 'event-banners', true);

-- Create RLS policies for banner uploads
CREATE POLICY "Allow public read access to event banners" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'event-banners');

CREATE POLICY "Allow admin upload event banners" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'event-banners');

CREATE POLICY "Allow admin update event banners" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'event-banners');

CREATE POLICY "Allow admin delete event banners" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'event-banners');