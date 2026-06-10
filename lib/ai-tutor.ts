import Anthropic from '@anthropic-ai/sdk';
import { getServiceSupabase } from './supabase';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const TEACHER_NAME = process.env.NEXT_PUBLIC_TEACHER_NAME || 'votre enseignant';
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'EkoleDirect';

// Construire le prompt système personnalisé pour chaque élève
async function buildSystemPrompt(eleveId: string, matiere: string): Promise<string> {
  const db = getServiceSupabase();

  // Récupérer le profil de l'élève
  const { data: eleve } = await db
    .from('eleves')
    .select('*, users!eleves_user_id_fkey(full_name)')
    .eq('id', eleveId)
    .single();

  // Récupérer le résumé de progression
  const { data: resume } = await db
    .from('resume_eleve')
    .select('*')
    .eq('eleve_id', eleveId)
    .single();

  // Récupérer le programme de la matière pour la classe
  const { data: programme } = await db
    .from('programmes')
    .select('*')
    .eq('niveau', eleve?.classe || '3eme')
    .eq('matiere', matiere)
    .eq('actif', true)
    .order('ordre');

  // Récupérer la progression dans cette matière
  const programmeIds = programme?.map((p: any) => p.id) || [];
  const { data: progression } = programmeIds.length > 0
    ? await db
        .from('progression')
        .select('*, programmes(*)')
        .eq('eleve_id', eleveId)
        .in('programme_id', programmeIds)
    : { data: [] };

  const eleveName = (eleve as any)?.users?.full_name || 'l\'élève';
  const classe = eleve?.classe || 'non définie';

  const chapitresListe = programme?.map((p: any) => {
    const prog = progression?.find((pr: any) => pr.programme_id === p.id);
    const statut = prog ? prog.statut : 'non_commence';
    return `- Ch.${p.chapitre_numero}: ${p.chapitre_titre} [${statut}${prog?.score ? `, score: ${prog.score}/100` : ''}]`;
  }).join('\n') || 'Programme non défini';

  return `Tu es le tuteur IA de ${APP_NAME}, une plateforme de soutien scolaire béninoise créée par ${TEACHER_NAME}.

RÈGLES ABSOLUES :
- Tu parles TOUJOURS en français simple et clair, adapté au niveau de l'élève.
- Tu es patient, encourageant et bienveillant comme un bon enseignant béninois.
- Tu donnes des explications étape par étape.
- Tu utilises des exemples concrets du quotidien béninois quand c'est pertinent.
- Tu poses des questions pour vérifier la compréhension avant d'avancer.
- Tu ne donnes JAMAIS les réponses directement aux exercices — tu guides l'élève pour qu'il trouve lui-même.
- Si l'élève pose des questions hors-sujet (non scolaires), redirige-le gentiment vers les études.
- Quand l'élève maîtrise un sujet, félicite-le et suggère le chapitre suivant.

ÉLÈVE ACTUEL :
- Nom : ${eleveName}
- Classe : ${classe}
- Matière en cours : ${matiere}

PROGRAMME DE ${matiere.toUpperCase()} (${classe}) :
${chapitresListe}

${resume ? `RÉSUMÉ DE PROGRESSION DE CET ÉLÈVE :
- Forces : ${resume.forces || 'Pas encore évalué'}
- Faiblesses : ${resume.faiblesses || 'Pas encore évalué'}
- Recommandations : ${resume.recommandations || 'Continuer les exercices régulièrement'}
` : ''}

OBJECTIF : Aide cet élève à progresser dans ${matiere} en suivant le programme béninois officiel. Commence par lui demander où il en est ou sur quel chapitre il veut travailler.`;
}

// Envoyer un message et obtenir la réponse du LLM
export async function chatWithTutor(
  eleveId: string,
  conversationId: string,
  matiere: string,
  userMessage: string
): Promise<{ reply: string; conversationId: string }> {
  const db = getServiceSupabase();

  // Récupérer ou créer la conversation
  let conversation;
  if (conversationId && conversationId !== 'new') {
    const { data } = await db
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();
    conversation = data;
  }

  // Messages existants (limiter à 20 derniers pour économiser les tokens)
  const existingMessages = conversation?.messages || [];
  const recentMessages = existingMessages.slice(-20);

  // Construire le prompt système
  const systemPrompt = await buildSystemPrompt(eleveId, matiere);

  // Construire les messages pour l'API
  const apiMessages = [
    ...recentMessages.map((m: any) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: userMessage },
  ];

  // Appel API Claude avec Haiku (le moins cher)
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: systemPrompt,
    messages: apiMessages,
  });

  const assistantReply = response.content
    .filter((block) => block.type === 'text')
    .map((block) => ('text' in block ? block.text : ''))
    .join('');

  // Sauvegarder les messages
  const updatedMessages = [
    ...existingMessages,
    { role: 'user', content: userMessage, timestamp: new Date().toISOString() },
    { role: 'assistant', content: assistantReply, timestamp: new Date().toISOString() },
  ];

  let savedConvId = conversationId;

  if (!conversation || conversationId === 'new') {
    // Créer nouvelle conversation
    const { data: newConv } = await db
      .from('conversations')
      .insert({
        eleve_id: eleveId,
        matiere,
        titre: `${matiere} - ${new Date().toLocaleDateString('fr-FR')}`,
        messages: updatedMessages,
      })
      .select()
      .single();
    savedConvId = newConv?.id;
  } else {
    // Mettre à jour la conversation existante
    await db
      .from('conversations')
      .update({
        messages: updatedMessages,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId);
  }

  // Tous les 10 messages, générer un résumé de progression
  if (updatedMessages.length % 10 === 0) {
    generateProgressSummary(eleveId, matiere).catch(console.error);
  }

  return { reply: assistantReply, conversationId: savedConvId };
}

// Générer un résumé de la progression (exécuté en arrière-plan)
async function generateProgressSummary(eleveId: string, matiere: string) {
  const db = getServiceSupabase();

  const { data: conversations } = await db
    .from('conversations')
    .select('messages')
    .eq('eleve_id', eleveId)
    .eq('matiere', matiere)
    .order('updated_at', { ascending: false })
    .limit(3);

  if (!conversations?.length) return;

  // Prendre les 5 derniers messages de chaque conversation récente
  const recentExchanges = conversations
    .flatMap((c: any) => c.messages.slice(-5))
    .map((m: any) => `${m.role}: ${m.content}`)
    .join('\n');

  const summaryResponse = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: `Analyse ces échanges récents entre un tuteur et un élève en ${matiere} et donne un résumé JSON avec les clés : forces, faiblesses, recommandations (chaque valeur est une phrase courte). Réponds UNIQUEMENT en JSON valide.\n\n${recentExchanges}`,
      },
    ],
  });

  try {
    const text = summaryResponse.content
      .filter((b) => b.type === 'text')
      .map((b) => ('text' in b ? b.text : ''))
      .join('');
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    await db.from('resume_eleve').upsert(
      {
        eleve_id: eleveId,
        resume_global: `Dernière activité en ${matiere}`,
        forces: parsed.forces || '',
        faiblesses: parsed.faiblesses || '',
        recommandations: parsed.recommandations || '',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'eleve_id' }
    );
  } catch (e) {
    console.error('Erreur résumé progression:', e);
  }
}
