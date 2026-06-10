import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ user: null }, { status: 401 });

  const db = getServiceSupabase();

  // Si c'est un élève, récupérer le profil élève
  let eleve = null;
  if (user.role === 'eleve') {
    const { data } = await db.from('eleves').select('*').eq('user_id', user.id).single();
    eleve = data;
  }

  // Récupérer l'abonnement actif
  const { data: abo } = await db
    .from('abonnements')
    .select('*')
    .eq('user_id', user.id)
    .eq('statut', 'actif')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return NextResponse.json({ user, eleve, abonnement: abo });
}
