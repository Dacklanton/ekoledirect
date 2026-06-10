-- ============================================================
-- EKOLE DIRECT - Schéma de base de données Supabase
-- Exécutez ce fichier dans l'éditeur SQL de Supabase
-- ============================================================

-- 1. Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('enseignant', 'parent', 'eleve')),
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Profils élèves (lié à users)
CREATE TABLE IF NOT EXISTS eleves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  classe TEXT NOT NULL, -- CI, CP, CE1, CE2, CM1, CM2, 6e, 5e, 4e, 3e, 2nde, 1ere, Tle
  serie TEXT, -- A, B, C, D (pour le lycée)
  ecole TEXT,
  matieres_suivies TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Programmes scolaires (modifiables par l'enseignant)
CREATE TABLE IF NOT EXISTS programmes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  niveau TEXT NOT NULL,
  matiere TEXT NOT NULL,
  chapitre_numero INTEGER NOT NULL,
  chapitre_titre TEXT NOT NULL,
  objectifs TEXT,
  contenu TEXT,
  ordre INTEGER DEFAULT 0,
  actif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Progression des élèves
CREATE TABLE IF NOT EXISTS progression (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  eleve_id UUID REFERENCES eleves(id) ON DELETE CASCADE,
  programme_id UUID REFERENCES programmes(id) ON DELETE CASCADE,
  statut TEXT DEFAULT 'non_commence' CHECK (statut IN ('non_commence', 'en_cours', 'termine', 'maitrise')),
  score INTEGER DEFAULT 0, -- 0-100
  temps_passe INTEGER DEFAULT 0, -- en minutes
  notes TEXT,
  derniere_activite TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Conversations avec le LLM (par élève)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  eleve_id UUID REFERENCES eleves(id) ON DELETE CASCADE,
  matiere TEXT NOT NULL,
  titre TEXT,
  resume TEXT, -- résumé généré par le LLM périodiquement
  messages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Exercices et quiz
CREATE TABLE IF NOT EXISTS exercices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  programme_id UUID REFERENCES programmes(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'qcm' CHECK (type IN ('qcm', 'vrai_faux', 'redaction', 'calcul')),
  question TEXT NOT NULL,
  options JSONB, -- pour QCM: ["A", "B", "C", "D"]
  reponse_correcte TEXT NOT NULL,
  explication TEXT,
  difficulte INTEGER DEFAULT 1 CHECK (difficulte BETWEEN 1 AND 3),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Résultats des exercices
CREATE TABLE IF NOT EXISTS resultats_exercices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  eleve_id UUID REFERENCES eleves(id) ON DELETE CASCADE,
  exercice_id UUID REFERENCES exercices(id) ON DELETE CASCADE,
  reponse_donnee TEXT,
  est_correct BOOLEAN,
  tentative INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Abonnements et paiements
CREATE TABLE IF NOT EXISTS abonnements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT DEFAULT 'essai' CHECK (plan IN ('essai', 'mensuel', 'trimestriel', 'annuel')),
  statut TEXT DEFAULT 'actif' CHECK (statut IN ('actif', 'expire', 'annule')),
  date_debut TIMESTAMPTZ DEFAULT NOW(),
  date_fin TIMESTAMPTZ,
  montant INTEGER DEFAULT 0, -- en FCFA
  reference_paiement TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Résumés de progression (ce que le LLM lit pour connaître l'élève)
CREATE TABLE IF NOT EXISTS resume_eleve (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  eleve_id UUID REFERENCES eleves(id) ON DELETE CASCADE,
  resume_global TEXT, -- résumé de toute la progression
  forces TEXT,
  faiblesses TEXT,
  recommandations TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX idx_eleves_parent ON eleves(parent_id);
CREATE INDEX idx_eleves_user ON eleves(user_id);
CREATE INDEX idx_progression_eleve ON progression(eleve_id);
CREATE INDEX idx_conversations_eleve ON conversations(eleve_id);
CREATE INDEX idx_programmes_niveau_matiere ON programmes(niveau, matiere);
CREATE INDEX idx_abonnements_user ON abonnements(user_id);

-- Row Level Security (RLS) - Sécurité
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE eleves ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE progression ENABLE ROW LEVEL SECURITY;
ALTER TABLE abonnements ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- DONNÉES INITIALES : Programmes scolaires béninois
-- ============================================================

-- FRANÇAIS - Classe de 3ème (préparation BEPC)
INSERT INTO programmes (niveau, matiere, chapitre_numero, chapitre_titre, objectifs, contenu, ordre) VALUES
('3eme', 'Français', 1, 'La communication écrite', 'Maîtriser les techniques de rédaction', 'Types de textes, argumentation, narration, description. Rédaction de lettres officielles et personnelles.', 1),
('3eme', 'Français', 2, 'Grammaire et conjugaison', 'Maîtriser les règles grammaticales', 'Concordance des temps, propositions subordonnées, voix active/passive, discours direct/indirect.', 2),
('3eme', 'Français', 3, 'Vocabulaire et expression', 'Enrichir le vocabulaire', 'Champs lexicaux, synonymes/antonymes, figures de style, registres de langue.', 3),
('3eme', 'Français', 4, 'Lecture et compréhension', 'Analyser des textes littéraires', 'Étude de textes narratifs, poétiques et argumentatifs. Résumé de texte, commentaire.', 4),
('3eme', 'Français', 5, 'Orthographe', 'Maîtriser l''orthographe', 'Accords, homophones, dictée préparée, auto-correction.', 5),

-- MATHÉMATIQUES - Classe de 3ème
('3eme', 'Mathématiques', 1, 'Calcul numérique', 'Maîtriser les opérations sur les nombres', 'Nombres rationnels, puissances, racines carrées, calcul littéral.', 1),
('3eme', 'Mathématiques', 2, 'Équations et inéquations', 'Résoudre des équations', 'Équations du premier degré, systèmes d''équations, inéquations, problèmes.', 2),
('3eme', 'Mathématiques', 3, 'Géométrie plane', 'Maîtriser les figures géométriques', 'Théorème de Pythagore, théorème de Thalès, trigonométrie, cercle.', 3),
('3eme', 'Mathématiques', 4, 'Fonctions et statistiques', 'Comprendre les fonctions', 'Fonctions linéaires et affines, représentation graphique, statistiques descriptives.', 4),
('3eme', 'Mathématiques', 5, 'Géométrie dans l''espace', 'Calculer volumes et surfaces', 'Prismes, cylindres, cônes, pyramides, sphères.', 5),

-- PCT (Physique-Chimie-Technologie) - Classe de 3ème
('3eme', 'PCT', 1, 'Mécanique', 'Comprendre les forces et le mouvement', 'Forces, poids, masse, équilibre, machines simples.', 1),
('3eme', 'PCT', 2, 'Électricité', 'Comprendre les circuits électriques', 'Tension, intensité, résistance, loi d''Ohm, puissance électrique.', 2),
('3eme', 'PCT', 3, 'Chimie : la matière', 'Connaître les transformations chimiques', 'Atomes, molécules, réactions chimiques, combustion, oxydation.', 3),
('3eme', 'PCT', 4, 'Optique', 'Comprendre la lumière', 'Propagation, réflexion, réfraction, lentilles.', 4),

-- SVT (Sciences de la Vie et de la Terre) - Classe de 3ème
('3eme', 'SVT', 1, 'Le corps humain', 'Comprendre le fonctionnement du corps', 'Système nerveux, reproduction humaine, hygiène.', 1),
('3eme', 'SVT', 2, 'Génétique', 'Comprendre l''hérédité', 'Chromosomes, gènes, transmission des caractères.', 2),
('3eme', 'SVT', 3, 'Écologie', 'Comprendre les écosystèmes', 'Chaînes alimentaires, biodiversité, impact de l''homme.', 3),
('3eme', 'SVT', 4, 'Géologie', 'Comprendre la structure de la Terre', 'Roches, séismes, volcans, plaques tectoniques.', 4),

-- HISTOIRE-GÉOGRAPHIE - Classe de 3ème
('3eme', 'Histoire-Géographie', 1, 'L''Afrique au XIXe siècle', 'Comprendre la colonisation', 'Résistances africaines, conférence de Berlin, colonisation française.', 1),
('3eme', 'Histoire-Géographie', 2, 'Les guerres mondiales', 'Comprendre les conflits du XXe siècle', 'Première et Seconde Guerre mondiale, causes et conséquences.', 2),
('3eme', 'Histoire-Géographie', 3, 'Le Bénin indépendant', 'Connaître l''histoire nationale', 'Indépendance du Dahomey, évolution politique, démocratie.', 3),
('3eme', 'Histoire-Géographie', 4, 'Géographie du Bénin', 'Connaître le territoire national', 'Relief, climat, population, économie, départements.', 4),

-- ANGLAIS - Classe de 3ème
('3eme', 'Anglais', 1, 'Grammar Foundations', 'Master basic English grammar', 'Tenses (present, past, future), modals, conditionals.', 1),
('3eme', 'Anglais', 2, 'Reading Comprehension', 'Understand English texts', 'Short stories, articles, dialogues, vocabulary building.', 2),
('3eme', 'Anglais', 3, 'Writing Skills', 'Write in English', 'Letters, essays, descriptions, narrative writing.', 3),
('3eme', 'Anglais', 4, 'Oral Communication', 'Speak and understand English', 'Everyday conversations, pronunciation, listening practice.', 4),

-- FRANÇAIS - CM2 (préparation CEP)
('CM2', 'Français', 1, 'Grammaire', 'Maîtriser la grammaire de base', 'Sujet, verbe, complément. Types de phrases. Déterminants et pronoms.', 1),
('CM2', 'Français', 2, 'Conjugaison', 'Conjuguer les verbes courants', 'Présent, passé composé, imparfait, futur simple. Verbes des 3 groupes.', 2),
('CM2', 'Français', 3, 'Orthographe', 'Écrire sans fautes', 'Accords sujet-verbe, pluriel, féminin, homophones (a/à, et/est, son/sont).', 3),
('CM2', 'Français', 4, 'Expression écrite', 'Rédiger des textes courts', 'Raconter, décrire, écrire une lettre, résumer.', 4),
('CM2', 'Français', 5, 'Lecture', 'Lire et comprendre', 'Textes narratifs, documentaires, poésie. Questions de compréhension.', 5),

-- MATHÉMATIQUES - CM2
('CM2', 'Mathématiques', 1, 'Numération', 'Maîtriser les nombres', 'Nombres entiers jusqu''au million, fractions simples, décimaux.', 1),
('CM2', 'Mathématiques', 2, 'Opérations', 'Calculer avec précision', 'Addition, soustraction, multiplication, division. Problèmes.', 2),
('CM2', 'Mathématiques', 3, 'Mesures', 'Mesurer et convertir', 'Longueurs, masses, capacités, durées, aires. Conversions.', 3),
('CM2', 'Mathématiques', 4, 'Géométrie', 'Reconnaître et construire des figures', 'Droites, angles, triangles, rectangles, cercle, symétrie, périmètre, aire.', 4),

-- TERMINALE D - Mathématiques
('Tle_D', 'Mathématiques', 1, 'Suites numériques', 'Maîtriser les suites', 'Suites arithmétiques, géométriques, convergence, limites.', 1),
('Tle_D', 'Mathématiques', 2, 'Fonctions', 'Étudier les fonctions', 'Limites, continuité, dérivation, fonctions logarithme et exponentielle.', 2),
('Tle_D', 'Mathématiques', 3, 'Intégration', 'Calculer des intégrales', 'Primitives, intégrales, calcul d''aires.', 3),
('Tle_D', 'Mathématiques', 4, 'Probabilités et statistiques', 'Maîtriser les probabilités', 'Probabilités conditionnelles, loi binomiale, statistiques.', 4),
('Tle_D', 'Mathématiques', 5, 'Géométrie dans l''espace', 'Maîtriser la géométrie analytique', 'Vecteurs dans l''espace, droites et plans, produit scalaire.', 5),

-- PHILOSOPHIE - Terminale
('Tle', 'Philosophie', 1, 'La conscience et l''inconscient', 'Comprendre la conscience humaine', 'Descartes, Freud, la conscience de soi, le sujet.', 1),
('Tle', 'Philosophie', 2, 'La liberté', 'Réfléchir sur la liberté', 'Libre arbitre, déterminisme, responsabilité, engagement.', 2),
('Tle', 'Philosophie', 3, 'L''État et la politique', 'Comprendre l''organisation politique', 'Justice, droit, État, démocratie, pouvoir.', 3),
('Tle', 'Philosophie', 4, 'La vérité et la raison', 'Distinguer vérité et opinion', 'Science, croyance, démonstration, expérience.', 4);
