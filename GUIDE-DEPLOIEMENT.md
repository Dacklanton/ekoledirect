# 🎓 EkoleDirect — Guide de déploiement complet

## Ce que vous avez reçu

Un projet Next.js complet avec :
- ✅ Page d'accueil publique (landing page)
- ✅ Inscription/Connexion (3 rôles : élève, parent, enseignant)
- ✅ Chat avec tuteur IA (Claude Haiku — le moins cher)
- ✅ Dashboard élève (progression, matières, scores)
- ✅ Dashboard parent (suivi des enfants)
- ✅ Dashboard enseignant (stats, élèves, revenus)
- ✅ Programmes scolaires béninois (CI → Terminale, 8 matières)
- ✅ Système d'abonnement (essai gratuit 3 jours, puis payant)
- ✅ PWA installable sur Android et desktop
- ✅ Économie de tokens (Haiku + cache + résumés)

---

## 🚀 Déploiement en 5 étapes (≈ 30 minutes)

### Étape 1 : Créer votre compte Supabase (base de données gratuite)

1. Allez sur **https://supabase.com** → "Start your project"
2. Connectez-vous avec votre compte GitHub (créez-en un si besoin)
3. Cliquez "New project" :
   - **Nom** : ekoledirect
   - **Mot de passe BD** : (notez-le quelque part, vous n'en aurez plus besoin)
   - **Région** : West EU (le plus proche du Bénin)
4. Attendez ~2 minutes que le projet se crée

5. **Créer les tables** :
   - Dans le menu gauche, cliquez **SQL Editor**
   - Ouvrez le fichier `supabase-schema.sql` fourni
   - Copiez-collez TOUT le contenu dans l'éditeur SQL
   - Cliquez **Run** (▶️)
   - Vous devriez voir "Success" — toutes les tables et données initiales sont créées

6. **Récupérer les clés** :
   - Allez dans **Settings** → **API** (menu gauche)
   - Notez :
     - `Project URL` → c'est votre `NEXT_PUBLIC_SUPABASE_URL`
     - `anon public` key → c'est votre `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `service_role` key → c'est votre `SUPABASE_SERVICE_ROLE_KEY` (⚠️ gardez-la secrète)

### Étape 2 : Créer votre clé API Anthropic (Claude)

1. Allez sur **https://console.anthropic.com**
2. Créez un compte (email + carte bancaire)
3. Ajoutez **10 $ de crédits** pour commencer (rechargeable)
4. Allez dans **API Keys** → "Create Key"
5. Copiez la clé (elle commence par `sk-ant-...`)
   → C'est votre `ANTHROPIC_API_KEY`

**Coût estimé** : avec Haiku à $1/$5 par million de tokens, 
100 élèves actifs vous coûteront ~80-120 $/mois en tokens.

### Étape 3 : Créer votre compte Vercel (hébergement gratuit)

1. Allez sur **https://vercel.com** → "Sign Up" avec GitHub
2. Cliquez **"Add New..."** → **"Project"**
3. Deux options :

**Option A — Via GitHub (recommandé)** :
   - Créez un repo GitHub : https://github.com/new
   - Nom : `ekoledirect`, privé
   - Uploadez tous les fichiers du projet dans ce repo
   - Dans Vercel, cliquez "Import" à côté de votre repo

**Option B — Upload direct** :
   - Installez Vercel CLI : `npm i -g vercel`
   - Dans le dossier du projet : `vercel`
   - Suivez les instructions

4. **Configurer les variables d'environnement** :
   Dans Vercel → votre projet → **Settings** → **Environment Variables** :

   | Nom | Valeur |
   |-----|--------|
   | `NEXT_PUBLIC_SUPABASE_URL` | (de l'étape 1) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (de l'étape 1) |
   | `SUPABASE_SERVICE_ROLE_KEY` | (de l'étape 1) |
   | `ANTHROPIC_API_KEY` | (de l'étape 2) |
   | `JWT_SECRET` | (inventez une phrase longue et aléatoire) |
   | `NEXT_PUBLIC_APP_NAME` | EkoleDirect |
   | `NEXT_PUBLIC_TEACHER_NAME` | (votre nom) |
   | `NEXT_PUBLIC_PRIX_MENSUEL` | 3000 |
   | `NEXT_PUBLIC_PRIX_TRIMESTRIEL` | 7500 |
   | `NEXT_PUBLIC_PRIX_ANNUEL` | 25000 |

5. Cliquez **"Deploy"** — en 2 minutes votre site est en ligne !
   Vous recevez une URL comme `ekoledirect.vercel.app`

### Étape 4 : Domaine personnalisé (optionnel mais recommandé)

1. Achetez un domaine sur **https://namecheap.com** (~10 $/an)
   Suggestion : `ekoledirect.bj` ou `ekoledirect.com`
2. Dans Vercel → Settings → Domains → ajoutez votre domaine
3. Suivez les instructions DNS (Vercel vous guide)

### Étape 5 : Créer votre compte enseignant

1. Allez sur votre site
2. Inscrivez-vous en tant que **Enseignant**
3. Vous aurez accès au dashboard admin avec les stats et la gestion

---

## 💰 Ajouter le paiement Mobile Money (après le lancement)

Pour encaisser les paiements, intégrez **FedaPay** ou **KkiaPay** :

### FedaPay (recommandé pour le Bénin)
1. Créez un compte sur **https://fedapay.com**
2. Validez votre identité (CNI + attestation)
3. Récupérez vos clés API
4. Ajoutez un bouton de paiement sur la page d'abonnement

### En attendant l'intégration
Commencez avec le paiement **manuel** :
- L'élève paie par Mobile Money à votre numéro
- Vous activez son abonnement manuellement dans Supabase
- C'est la méthode la plus rapide pour lancer ce soir !

**Pour activer un abonnement manuellement** :
1. Allez dans Supabase → Table Editor → `abonnements`
2. Trouvez l'utilisateur
3. Changez `plan` en `mensuel`, `statut` en `actif`
4. Mettez `date_fin` à dans 30 jours

---

## 📱 Installer sur téléphone Android

Dites à vos élèves :
1. Ouvrir **Chrome** sur le téléphone
2. Aller sur votre site (ex: ekoledirect.vercel.app)
3. Appuyer sur les **3 points** (⋮) en haut à droite
4. Cliquer **"Ajouter à l'écran d'accueil"**
5. L'app apparaît comme une vraie application !

---

## 🔧 Modifier les programmes scolaires

### Option 1 : Via Supabase (sans toucher au code)
1. Allez dans Supabase → Table Editor → `programmes`
2. Ajoutez/modifiez les chapitres directement
3. Les changements sont instantanés

### Option 2 : Ajouter une matière dans le code
Dans `lib/constants.ts`, ajoutez la matière aux listes correspondantes.

---

## 📊 Suivi des coûts API

1. Allez sur **https://console.anthropic.com** → Usage
2. Surveillez votre consommation quotidienne
3. Règle : si vous dépassez ~5 $/jour, vérifiez les conversations anormalement longues
4. Le système utilise Haiku (le modèle le moins cher) et limite les conversations à 20 messages de contexte

### Optimisations intégrées :
- Haiku 4.5 ($1/$5 MTok) au lieu de Sonnet ($3/$15)
- Contexte limité à 20 messages récents
- Résumés automatiques tous les 10 messages
- Le prompt système est réutilisable avec le cache (90% d'économie)

---

## 📈 Objectif 500 $/mois — Le plan

| Mois | Élèves | Revenu (FCFA) | Revenu ($) | Coût API | Bénéfice |
|------|---------|---------------|------------|----------|----------|
| 1    | 20      | 60 000        | ~100 $     | ~25 $    | ~75 $    |
| 2    | 50      | 150 000       | ~250 $     | ~50 $    | ~200 $   |
| 3    | 100     | 300 000       | ~500 $     | ~100 $   | ~400 $   |
| 4    | 150     | 450 000       | ~750 $     | ~150 $   | ~600 $   |

### Comment recruter vos premiers élèves :
1. **Vos élèves actuels** → proposez-leur 1 mois gratuit pour tester
2. **Parents WhatsApp** → envoyez un message dans les groupes de parents
3. **Bouche à oreille** → demandez aux parents satisfaits de recommander
4. **Écoles partenaires** → proposez une démonstration aux directeurs
5. **Facebook/TikTok** → publiez des vidéos de démonstration

---

## ❓ FAQ

**Q: Mon abonnement Claude Pro à 20$ suffit-il ?**
Non. Le Pro est pour votre usage personnel. L'API est séparée et se paie au token.
Commencez avec 10$ de crédits API, c'est suffisant pour le premier mois.

**Q: Que se passe-t-il si l'API tombe en panne ?**
Le chat affiche une erreur "Réessayez". Vos données sont sauvegardées dans Supabase.

**Q: Puis-je changer les prix ?**
Oui, modifiez les variables `NEXT_PUBLIC_PRIX_*` dans Vercel, puis redéployez.

**Q: Comment supprimer un élève ?**
Dans Supabase → Table Editor → `users` → supprimez la ligne.

**Q: L'app est-elle sécurisée ?**
Oui : mots de passe hashés (bcrypt), JWT pour les sessions, HTTPS via Vercel.
