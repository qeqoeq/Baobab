CREATE TABLE IF NOT EXISTS public.skipped_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.items_seed(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_id)
);

ALTER TABLE public.skipped_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "skipped_select_own" ON public.skipped_items
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "skipped_insert_own" ON public.skipped_items
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
