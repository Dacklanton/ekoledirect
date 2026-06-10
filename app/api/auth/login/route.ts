import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { verifyPassword, createToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
    }

    const db = getServiceSupabase();
    const { data: user } = await db.from('users').select('*').eq('email', email).single();

    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
    }

    const token = createToken({
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    });

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
    });

    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (e: any) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
