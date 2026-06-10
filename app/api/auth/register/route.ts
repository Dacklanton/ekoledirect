import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { hashPassword, createToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, full_name, role, phone, classe, serie, parent_email } = body;

    if (!email || !password || !full_name || !role) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
    }

    const db = getServiceSupabase();

    // Vérifier si l'email existe déjà
    const { data: existing } = await db.from('users').select('id').eq('email', email).single();
    if (existing) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 });
    }

    // Créer l'utilisateur
    const { data: user, error } = await db
      .from('users')
      .insert({
        email,
        password_hash: hashPassword(password),
        full_name,
        role,
        phone: phone || null,
      })
      .select()
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Erreur lors de la création du compte' }, { status: 500 });
    }

    // Si c'est un élève, créer le profil élève
    if (role === 'eleve' && classe) {
      let parentId = null;
      if (parent_email) {
        const { data: parent } = await db.from('users').select('id').eq('email', parent_email).eq('role', 'parent').single();
        parentId = parent?.id || null;
      }

      await db.from('eleves').insert({
        user_id: user.id,
        parent_id: parentId,
        classe,
        serie: serie || null,
      });
    }

    // Créer un abonnement d'essai gratuit (3 jours)
    await db.from('abonnements').insert({
      user_id: user.id,
      plan: 'essai',
      statut: 'actif',
      date_fin: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      montant: 0,
    });

    // Générer le token JWT
    const token = createToken({
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    });

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
      message: 'Compte créé avec succès !',
    });

    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 jours
      path: '/',
    });

    return response;
  } catch (e: any) {
    console.error('Register error:', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
