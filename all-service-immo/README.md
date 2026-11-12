# All Service Immo — Site Vitrine, Espace Client & Espace Admin

Plateforme web complète pour un service **Immobilier + Architecture + Construction** en Afrique centrale.

## Fichiers du dossier
- `index.html` — Application complète tout-en-un :
  - **Site Public** : recherche multicritère (ville, type, budget), catalogue biens (favoris ❤️, fiche détaillée, réservation de visite), réalisations, simulateur de devis FCFA, témoignages, FAQ, formulaire de contact connecté au CRM.
  - **Espace Client** (`#espace-client` ou `client.html`) : connexion / création de compte, tableau de bord, suivi de chantier (avancement %, 6 jalons, journal photo hebdomadaire), plans & documents (aperçu, validation/approbation horodatée, impression), factures & paiements (déclaration paiement Mobile Money/Virement, reçu imprimable), biens favoris & demandes, messagerie directe avec l'équipe, avis & profil.
  - **Espace Admin** (`#espace-admin` ou `admin.html`) : vue d'ensemble (KPI trésorerie & graphiques), CRM des demandes/visites (conversion en client + chantier en 1 clic), CRUD biens immobiliers (avec upload photo), CRUD réalisations, gestion chantiers & publication de rapports photo, envoi de plans/documents, facturation & validation des paiements, messagerie clients, modération des avis, paramètres société, export/import JSON et synchronisation Supabase.
- `client.html` — Raccourci direct vers l'Espace Client.
- `admin.html` — Raccourci direct vers l'Espace Admin.
- `supabase-schema.sql` — Script SQL prêt à exécuter dans Supabase pour activer la synchronisation cloud multi-appareils.

## Comptes de démonstration intégrés
Des boutons **« Accès démo en 1 clic »** sont directement disponibles sur les écrans de connexion :
- **Espace Admin** : `admin@allserviceimmo.com` / `Admin@2026`
- **Espace Client 1** : `famille.m@client.com` / `Client@2026` (Villa Horizon à Brazzaville — 72%)
- **Espace Client 2** : `jean.bosco@client.com` / `Client@2026` (Projet Pointe-Noire — 35%)

## Activer la synchronisation Cloud Supabase (optionnel)
1. Créez (ou activez) un projet Supabase et exécutez le fichier `supabase-schema.sql` dans **SQL Editor**.
2. Connectez-vous à **Espace Admin → Paramètres & DB**.
3. Collez votre **Project URL** et **Publishable / Anon Key**, puis cliquez sur **Envoyer vers Supabase**.

## Stockage & Déploiement
- **Google Drive** (dossier *All service immo*) : https://drive.google.com/drive/folders/1MGYrjRnidqXhCR7rS6_sjVIyYc2bQ4gD
- **GitHub** : `businesscongoinfo-star/muana-bitinda` (`all-service-immo/`)
- **Vercel** : projet `all-service-immo` (Root Directory : `all-service-immo`)
