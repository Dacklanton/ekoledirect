import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getServiceSupabase } from '@/lib/supabase';
import { chatWithTutor } from '@/lib/ai-tutor';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

    const { message, matiere, conversationId } = await req.json();
    if (!message || !matiere) {
      return NextResponse.json({ error: 'Message et matière requis' }, { status: 400 });
    }

    // Vérifier que c'est un élève
    const db = getServiceSupabase();
    const { data: eleve } = await db.from('eleves').select('*').eq('user_id', user.id).single();
    if (!eleve) {
      return NextResponse.json({ error: 'Profil élève non trouvé' }, { status: 404 });
    }

    // Vérifier l'abonnement
    const { data: abo } = await db
      .from('abonnements')
      .select('*')
      .eq('user_id', user.id)
      .eq('statut', 'actif')
      .single();

    if (!abo || (abo.date_fin && new Date(abo.date_fin) < new Date())) {
      return NextResponse.json({
        error: 'Votre abonnement a expiré. Veuillez renouveler pour continuer.',
        expired: true,
      }, { status: 403 });
    }

    // Appeler le tuteur IA
    const result = await chatWithTutor(
      eleve.id,
      conversationId || 'new',
      matiere,
      message
    );

    return NextResponse.json(result);
  } catch (e: any) {
    console.error('Chat API error:', e);
    return NextResponse.json({ error: 'Erreur du tuteur IA. Réessayez.' }, { status: 500 });
  }
}

// Récupérer les conversations d'un élève
export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

  const db = getServiceSupabase();
  const { data: eleve } = await db.from('eleves').select('*').eq('user_id', user.id).single();

  const matiere = req.nextUrl.searchParams.get('matiere');

  let query = db
    .from('conversations')
    .select('id, matiere, titre, created_at, updated_at')
    .eq('eleve_id', eleve?.id)
    .order('updated_at', { ascending: false });

  if (matiere) query = query.eq('matiere', matiere);

  const { data } = await query.limit(20);
  return NextResponse.json({ conversations: data || [] });
}
