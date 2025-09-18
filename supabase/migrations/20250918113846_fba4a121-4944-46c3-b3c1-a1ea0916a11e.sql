-- Allow delete access to registrations table
CREATE POLICY "Allow delete access to registrations" 
ON public.registrations 
FOR DELETE 
USING (true);