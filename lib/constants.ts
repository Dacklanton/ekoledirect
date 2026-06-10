// Classes du système éducatif béninois
export const CLASSES = {
  primaire: ['CI', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'],
  college: ['6eme', '5eme', '4eme', '3eme'],
  lycee: ['2nde', '1ere', 'Tle'],
};

export const ALL_CLASSES = [
  ...CLASSES.primaire,
  ...CLASSES.college,
  ...CLASSES.lycee,
];

// Séries du lycée béninois
export const SERIES = ['A', 'B', 'C', 'D'];

// Matières par niveau
export const MATIERES: Record<string, string[]> = {
  primaire: ['Français', 'Mathématiques', 'Sciences', 'Histoire-Géographie', 'Anglais'],
  college: ['Français', 'Mathématiques', 'PCT', 'SVT', 'Histoire-Géographie', 'Anglais', 'Allemand'],
  lycee: ['Français', 'Mathématiques', 'PCT', 'SVT', 'Histoire-Géographie', 'Anglais', 'Philosophie', 'Allemand', 'Espagnol'],
};

export function getMatieresForClasse(classe: string): string[] {
  if (CLASSES.primaire.includes(classe)) return MATIERES.primaire;
  if (CLASSES.college.includes(classe)) return MATIERES.college;
  if (CLASSES.lycee.includes(classe)) return MATIERES.lycee;
  return MATIERES.college;
}

export function getNiveauLabel(classe: string): string {
  if (CLASSES.primaire.includes(classe)) return 'Primaire';
  if (CLASSES.college.includes(classe)) return 'Collège';
  if (CLASSES.lycee.includes(classe)) return 'Lycée';
  return '';
}

// Examens
export const EXAMENS: Record<string, string> = {
  CM2: 'CEP',
  '3eme': 'BEPC',
  Tle: 'BAC',
};

// Icônes des matières (emoji)
export const MATIERE_ICONS: Record<string, string> = {
  'Français': '📖',
  'Mathématiques': '🔢',
  'PCT': '⚡',
  'SVT': '🌿',
  'Histoire-Géographie': '🌍',
  'Anglais': '🇬🇧',
  'Allemand': '🇩🇪',
  'Espagnol': '🇪🇸',
  'Philosophie': '🤔',
  'Sciences': '🔬',
};

// Plans d'abonnement
export const PLANS = [
  {
    id: 'essai',
    nom: 'Essai gratuit',
    prix: 0,
    duree: '3 jours',
    description: 'Découvrez la plateforme',
    features: ['3 jours d\'accès', '1 matière', 'Chat limité'],
  },
  {
    id: 'mensuel',
    nom: 'Mensuel',
    prix: parseInt(process.env.NEXT_PUBLIC_PRIX_MENSUEL || '3000'),
    duree: '1 mois',
    description: 'Idéal pour commencer',
    features: ['Toutes les matières', 'Chat illimité', 'Suivi de progression', 'Exercices et quiz'],
    popular: true,
  },
  {
    id: 'trimestriel',
    nom: 'Trimestriel',
    prix: parseInt(process.env.NEXT_PUBLIC_PRIX_TRIMESTRIEL || '7500'),
    duree: '3 mois',
    description: 'Économisez 17%',
    features: ['Tout le plan Mensuel', 'Rapports trimestriels', 'Priorité de support'],
  },
  {
    id: 'annuel',
    nom: 'Annuel',
    prix: parseInt(process.env.NEXT_PUBLIC_PRIX_ANNUEL || '25000'),
    duree: '1 an',
    description: 'Meilleur rapport qualité-prix',
    features: ['Tout le plan Trimestriel', 'Préparation examens', 'Support prioritaire'],
  },
];
