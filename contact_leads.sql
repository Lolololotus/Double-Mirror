-- contact_leads 테이블 생성
CREATE TABLE IF NOT EXISTS public.contact_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- RLS 설정 (Insert는 누구나 가능하게)
ALTER TABLE public.contact_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anyone to insert leads" 
ON public.contact_leads FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow authenticated to view leads" 
ON public.contact_leads FOR SELECT 
TO authenticated 
USING (true);
