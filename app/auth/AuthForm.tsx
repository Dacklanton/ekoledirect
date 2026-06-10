'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const CLASSES_OPTIONS = [
  { group: 'Primaire', items: ['CI', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'] },
  { group: 'Collège', items: ['6eme', '5eme', '4eme', '3eme'] },
  { group: 'Lycée', items: ['2nde', '1ere', 'Tle'] },
];

export default function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'login' | 'register'>(
    searchParams.get('mode') === 'register' ? 'register' : 'login'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'eleve' | 'parent' | 'enseignant'>('eleve');
  const [classe, setClasse] = useState('3eme');
  const [serie, setSerie] = useState('');
  const [parentEmail, setParentEmail] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login'
        ? { email, password }
        : { email, password, full_name: fullName, role, phone, classe, serie, parent_email: parentEmail };
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push('/dashboard');
    } catch (e: any) {
      setError(e.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, var(--green-900), var(--green-800))', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div className="text-center" style={{ marginBottom: 32, color: 'white' }}>
          <h2 style={{ fontSize: '1.6rem' }}>🎓 EkoleDirect</h2>
          <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>Soutien scolaire intelligent</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <div className="flex gap-sm" style={{ marginBottom: 24 }}>
            <button className={`btn btn-full ${mode === 'login' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => { setMode('login'); setError(''); }}>Connexion</button>
            <button className={`btn btn-full ${mode === 'register' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => { setMode('register'); setError(''); }}>Inscription</button>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: 'var(--red-100)', color: 'var(--red-500)', borderRadius: 'var(--radius-md)', marginBottom: 16, fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-md">
            {mode === 'register' && (
              <>
                <div className="form-group">
                  <label>Je suis :</label>
                  <div className="flex gap-sm">
                    {[
                      { value: 'eleve', label: '🎒 Élève', color: 'var(--green-100)' },
                      { value: 'parent', label: '👨‍👩‍👧 Parent', color: 'var(--gold-100)' },
                      { value: 'enseignant', label: '👨‍🏫 Enseignant', color: 'var(--green-50)' },
                    ].map((r) => (
                      <button type="button" key={r.value} className="btn btn-full"
                        style={{ background: role === r.value ? r.color : 'var(--gray-50)', border: `2px solid ${role === r.value ? 'var(--green-500)' : 'var(--gray-200)'}`, color: 'var(--gray-800)', fontSize: '0.85rem' }}
                        onClick={() => setRole(r.value as any)}>{r.label}</button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Nom complet</label>
                  <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ex: Koffi Mensah" />
                </div>
              </>
            )}

            <div className="form-group">
              <label>Adresse email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" />
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? '6 caractères minimum' : '••••••'} />
            </div>

            {mode === 'register' && (
              <>
                <div className="form-group">
                  <label>Téléphone (facultatif)</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+229 XX XX XX XX" />
                </div>
                {role === 'eleve' && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Classe</label>
                        <select value={classe} onChange={(e) => setClasse(e.target.value)}>
                          {CLASSES_OPTIONS.map((g) => (
                            <optgroup key={g.group} label={g.group}>
                              {g.items.map((c) => <option key={c} value={c}>{c}</option>)}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                      {['2nde', '1ere', 'Tle'].includes(classe) && (
                        <div className="form-group">
                          <label>Série</label>
                          <select value={serie} onChange={(e) => setSerie(e.target.value)}>
                            <option value="">—</option>
                            {['A', 'B', 'C', 'D'].map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Email du parent (facultatif)</label>
                      <input type="email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} placeholder="Pour lier votre compte au parent" />
                    </div>
                  </>
                )}
              </>
            )}

            <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-center text-sm text-muted" style={{ marginTop: 16 }}>
            {mode === 'login' ? (
              <>Pas encore de compte ? <a href="#" onClick={() => setMode('register')} style={{ color: 'var(--green-700)', fontWeight: 600 }}>S'inscrire</a></>
            ) : (
              <>Déjà inscrit ? <a href="#" onClick={() => setMode('login')} style={{ color: 'var(--green-700)', fontWeight: 600 }}>Se connecter</a></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
