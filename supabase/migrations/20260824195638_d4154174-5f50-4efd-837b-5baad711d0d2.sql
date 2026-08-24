CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  path TEXT NOT NULL,
  referrer TEXT,
  session_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX analytics_events_created_at_idx ON public.analytics_events (created_at DESC);
CREATE INDEX analytics_events_name_idx ON public.analytics_events (event_name);
GRANT INSERT ON public.analytics_events TO anon;
GRANT SELECT, INSERT ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can record analytics events" ON public.analytics_events FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can read analytics events" ON public.analytics_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.seo_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_url TEXT NOT NULL,
  range_start DATE NOT NULL,
  range_end DATE NOT NULL,
  totals JSONB NOT NULL DEFAULT '{}'::jsonb,
  by_date JSONB NOT NULL DEFAULT '[]'::jsonb,
  top_queries JSONB NOT NULL DEFAULT '[]'::jsonb,
  top_pages JSONB NOT NULL DEFAULT '[]'::jsonb,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX seo_snapshots_fetched_at_idx ON public.seo_snapshots (fetched_at DESC);
GRANT SELECT ON public.seo_snapshots TO authenticated;
GRANT ALL ON public.seo_snapshots TO service_role;
ALTER TABLE public.seo_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read seo snapshots" ON public.seo_snapshots FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.seo_settings (
  id BOOLEAN NOT NULL PRIMARY KEY DEFAULT true CHECK (id),
  site_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.seo_settings TO authenticated;
GRANT ALL ON public.seo_settings TO service_role;
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read seo settings" ON public.seo_settings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert seo settings" ON public.seo_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update seo settings" ON public.seo_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));