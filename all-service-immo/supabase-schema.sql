-- ============================================================
-- ALL SERVICE IMMO — Schéma Supabase (PostgreSQL + RLS)
-- Copiez et exécutez ce script dans Supabase -> SQL Editor
-- ============================================================

-- 1. Stockage unifié multi-entités pour synchronisation temps réel
-- (Simple, robuste et compatible avec le mode autonome du site)
CREATE TABLE IF NOT EXISTS public.asi_state (
  id TEXT PRIMARY KEY DEFAULT 'main',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tables relationnelles structurées (pour intégration avancée / BI)
CREATE TABLE IF NOT EXISTS public.asi_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telephone TEXT,
  ville TEXT DEFAULT 'Brazzaville',
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.asi_biens (
  id TEXT PRIMARY KEY,
  titre TEXT NOT NULL,
  ville TEXT NOT NULL,
  type TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('vente', 'location')),
  statut TEXT NOT NULL DEFAULT 'Disponible' CHECK (statut IN ('Disponible', 'Réservé', 'Vendu', 'Loué')),
  prix_label TEXT NOT NULL,
  prix_num BIGINT NOT NULL DEFAULT 0,
  details TEXT,
  description TEXT,
  image_url TEXT,
  titre_verifie BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.asi_chantiers (
  id TEXT PRIMARY KEY,
  client_email TEXT NOT NULL,
  titre TEXT NOT NULL,
  type TEXT NOT NULL,
  ville TEXT NOT NULL,
  adresse TEXT,
  responsable TEXT,
  statut TEXT NOT NULL DEFAULT 'Étude / Plans',
  avancement INT NOT NULL DEFAULT 0 CHECK (avancement BETWEEN 0 AND 100),
  budget_total BIGINT NOT NULL DEFAULT 0,
  date_debut DATE,
  date_livraison DATE,
  jalons JSONB NOT NULL DEFAULT '[]'::jsonb,
  rapports JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.asi_documents (
  id TEXT PRIMARY KEY,
  client_email TEXT NOT NULL,
  chantier_id TEXT,
  titre TEXT NOT NULL,
  categorie TEXT NOT NULL,
  url TEXT,
  date_ajout DATE NOT NULL DEFAULT CURRENT_DATE,
  valide_client BOOLEAN NOT NULL DEFAULT FALSE,
  valide_le TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.asi_factures (
  id TEXT PRIMARY KEY,
  numero TEXT NOT NULL,
  client_email TEXT NOT NULL,
  chantier_id TEXT,
  libelle TEXT NOT NULL,
  montant BIGINT NOT NULL DEFAULT 0,
  echeance DATE,
  statut TEXT NOT NULL DEFAULT 'En attente' CHECK (statut IN ('Payée', 'En vérification', 'En attente', 'En retard')),
  mode_paiement TEXT,
  reference_paiement TEXT,
  date_paiement DATE
);

CREATE TABLE IF NOT EXISTS public.asi_demandes (
  id TEXT PRIMARY KEY,
  nom TEXT NOT NULL,
  telephone TEXT NOT NULL,
  email TEXT,
  ville TEXT,
  type_projet TEXT NOT NULL,
  bien_id TEXT,
  message TEXT,
  statut TEXT NOT NULL DEFAULT 'Nouvelle',
  note_admin TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.asi_messages (
  id TEXT PRIMARY KEY,
  client_email TEXT NOT NULL,
  expediteur TEXT NOT NULL CHECK (expediteur IN ('client', 'admin')),
  auteur TEXT NOT NULL,
  contenu TEXT NOT NULL,
  lu BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activer Row Level Security
ALTER TABLE public.asi_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asi_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asi_biens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asi_chantiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asi_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asi_factures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asi_demandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asi_messages ENABLE ROW LEVEL SECURITY;

-- Politiques pour synchronisation REST via clé publishable (à restreindre avec Supabase Auth en production)
CREATE POLICY "asi_state_public_rw" ON public.asi_state FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "asi_biens_public_read" ON public.asi_biens FOR SELECT USING (true);
CREATE POLICY "asi_demandes_public_insert" ON public.asi_demandes FOR INSERT WITH CHECK (true);
