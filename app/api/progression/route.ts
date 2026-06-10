import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

  const db = getServiceSupabase();

  // Déterminer quel élève regarder
  let eleveId: string | null = null;

  if (user.role === 'eleve') {
    const { data } = await db.from('eleves').select('id').eq('user_id', user.id).single();
    eleveId = data?.id || null;
  } else if (user.role === 'parent') {
    // Le parent peut spécifier un élève enfant
    const childId = req.nextUrl.searchParams.get('eleve_id');
    if (childId) {
      const { data } = await db.from('eleves').select('id').eq('id', childId).eq('parent_id', user.id).single();
      eleveId = data?.id || null;
    }
  } else if (user.role === 'enseignant') {
    eleveId = req.nextUrl.searchParams.get('eleve_id');
  }

  if (!eleveId) return NextResponse.json({ error: 'Élève non trouvé' }, { status: 404 });

  // Récupérer la progression
  const { data: progression } = await db
    .from('progression')
    .select('*, programmes(*)')
    .eq('eleve_id', eleveId);

  // Récupérer le résumé
  const { data: resume } = await db
    .from('resume_eleve')
    .select('*')
    .eq('eleve_id', eleveId)
    .single();

  // Récupérer les stats de conversations
  const { data: convStats } = await db
    .from('conversations')
    .select('matiere, updated_at')
    .eq('eleve_id', eleveId)
    .order('updated_at', { ascending: false });

  // Calculer les stats
  const totalChapitres = progression?.length || 0;
  const termines = progression?.filter((p: any) => p.statut === 'termine' || p.statut === 'maitrise').length || 0;
  const enCours = progression?.filter((p: any) => p.statut === 'en_cours').length || 0;
  const scoreMoyen = progression?.length
    ? Math.round(progression.reduce((sum: number, p: any) => sum + (p.score || 0), 0) / progression.length)
    : 0;

  return NextResponse.json({
    progression: progression || [],
    resume,
    stats: { totalChapitres, termines, enCours, scoreMoyen },
    recentActivity: convStats?.slice(0, 5) || [],
  });
}
