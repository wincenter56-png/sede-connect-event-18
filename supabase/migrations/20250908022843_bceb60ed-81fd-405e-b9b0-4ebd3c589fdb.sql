-- Insert event configuration based on the uploaded image
INSERT INTO public.event_config (
  event_date,
  event_value,
  payment_info,
  banner_url
) VALUES (
  '2025-09-20 16:00:00-03:00',
  25.00,
  'PIX: [Chave PIX será configurada pelo administrador]',
  '/src/assets/evento-mulheres-banner.png'
)
ON CONFLICT (id) DO UPDATE SET
  event_date = EXCLUDED.event_date,
  event_value = EXCLUDED.event_value,
  payment_info = EXCLUDED.payment_info,
  banner_url = EXCLUDED.banner_url,
  updated_at = now();