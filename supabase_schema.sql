-- =========================================================================
-- ABIHUB 2026 - SUPABASE DATABASE SCHEMA & POLICIES
-- Kopiere dieses Skript und führe es im Supabase SQL Editor aus (1 Klick)
-- =========================================================================

-- 1. Tabelle für Abiturstufen (Cohorts)
CREATE TABLE IF NOT EXISTS public.cohorts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    school TEXT NOT NULL,
    year TEXT NOT NULL DEFAULT '2026',
    state TEXT NOT NULL,
    motto TEXT DEFAULT '',
    join_code TEXT UNIQUE NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabelle für Stufenmitglieder (Members)
CREATE TABLE IF NOT EXISTS public.cohort_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Ersteller', 'Admin', 'Schüler')),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    avatar TEXT DEFAULT '🎓',
    lks TEXT DEFAULT '',
    is_pending BOOLEAN DEFAULT false,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(cohort_id, user_id)
);

-- 3. Tabelle für Termine & Klausuren
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT,
    location TEXT DEFAULT '',
    category TEXT NOT NULL CHECK (category IN ('Klausur', 'Frist', 'Event', 'Treffen')),
    notes TEXT DEFAULT '',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabelle für Ankündigungen & News
CREATE TABLE IF NOT EXISTS public.news_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    is_important BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabelle für Abizeitung-Beiträge & Zitate
CREATE TABLE IF NOT EXISTS public.yearbook_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE NOT NULL,
    author TEXT NOT NULL,
    author_role TEXT DEFAULT 'Schüler',
    avatar TEXT DEFAULT '🎓',
    content TEXT NOT NULL,
    image_url TEXT,
    category TEXT DEFAULT 'Zitate',
    votes_count INTEGER DEFAULT 0,
    is_selected_for_print BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security) aktivieren
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yearbook_posts ENABLE ROW LEVEL SECURITY;

-- Einfache RLS Policies: Authentifizierte Nutzer dürfen Stufen lesen & beitreten
CREATE POLICY "Ermögliche Lesen von Stufen für eingeloggte Nutzer"
ON public.cohorts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Ermögliche Erstellen von Stufen"
ON public.cohorts FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Mitglieder können ihre Stufendaten einsehen"
ON public.cohort_members FOR ALL TO authenticated USING (true);

CREATE POLICY "Events für Stufenmitglieder"
ON public.calendar_events FOR ALL TO authenticated USING (true);

CREATE POLICY "News für Stufenmitglieder"
ON public.news_messages FOR ALL TO authenticated USING (true);

CREATE POLICY "Abizeitung für Stufenmitglieder"
ON public.yearbook_posts FOR ALL TO authenticated USING (true);
