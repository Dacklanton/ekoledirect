import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== 'parent') {
    return NextResponse.json({ error: 'Accès réservé aux parents' }, { status: 403 });
  }

  const db = getServiceSupabase();

  // Récupérer les enfants du parent
  const { data: enfants } = await db
    .from('eleves')
    .select('*, users!eleves_user_id_fkey(full_name, email)')
    .eq('parent_id', user.id);

  // Pour chaque enfant, récupérer les stats
  const enfantsAvecStats = await Promise.all(
    (enfants || []).map(async (enfant: any) => {
      const { data: progression } = await db
        .from('progression')
        .select('statut, score')
        .eq('eleve_id', enfant.id);

      const { data: convRecent } = await db
        .from('conversations')
        .select('matiere, updated_at')
        .eq('eleve_id', enfant.id)
        .order('updated_at', { ascending: false })
        .limit(5);

      const { data: resume } = await db
        .from('resume_eleve')
        .select('*')
        .eq('eleve_id', enfant.id)
        .single();

      const total = progression?.length || 0;
      const termines = progression?.filter((p: any) => ['termine', 'maitrise'].includes(p.statut)).length || 0;

      return {
        ...enfant,
        nom: enfant.users?.full_name,
        stats: {
          progression: total > 0 ? Math.round((termines / total) * 100) : 0,
          scoreMoyen: total > 0 ? Math.round(progression!.reduce((s: number, p: any) => s + (p.score || 0), 0) / total) : 0,
        },
        activiteRecente: convRecent || [],
        resume,
      };
    })
  );

  return NextResponse.json({ enfants: enfantsAvecStats });
}
