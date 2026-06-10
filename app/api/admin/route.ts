import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== 'enseignant') {
    return NextResponse.json({ error: 'Accès réservé aux enseignants' }, { status: 403 });
  }

  const db = getServiceSupabase();

  // Tous les élèves
  const { data: eleves } = await db
    .from('eleves')
    .select('*, users!eleves_user_id_fkey(full_name, email, created_at)');

  // Tous les abonnements actifs
  const { data: abonnements } = await db
    .from('abonnements')
    .select('*')
    .eq('statut', 'actif');

  // Programmes
  const { data: programmes } = await db
    .from('programmes')
    .select('*')
    .order('niveau, matiere, ordre');

  // Stats globales
  const totalEleves = eleves?.length || 0;
  const abosActifs = abonnements?.filter((a: any) => a.plan !== 'essai').length || 0;
  const revenuMensuel = abonnements
    ?.filter((a: any) => a.plan !== 'essai')
    .reduce((sum: number, a: any) => sum + (a.montant || 0), 0) || 0;

  return NextResponse.json({
    eleves: eleves || [],
    programmes: programmes || [],
    stats: {
      totalEleves,
      abosActifs,
      essaisActifs: (abonnements?.filter((a: any) => a.plan === 'essai').length || 0),
      revenuMensuel,
    },
  });
}

// Modifier un programme
export async function PUT(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== 'enseignant') {
    return NextResponse.json({ error: 'Accès réservé' }, { status: 403 });
  }

  const body = await req.json();
  const db = getServiceSupabase();

  if (body.action === 'update_programme') {
    const { id, ...updates } = body.data;
    const { error } = await db.from('programmes').update(updates).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (body.action === 'add_programme') {
    const { error } = await db.from('programmes').insert(body.data);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
