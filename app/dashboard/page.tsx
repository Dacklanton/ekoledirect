'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const MATIERE_ICONS: Record<string, string> = {
  'Français': '📖', 'Mathématiques': '🔢', 'PCT': '⚡', 'SVT': '🌿',
  'Histoire-Géographie': '🌍', 'Anglais': '🇬🇧', 'Allemand': '🇩🇪',
  'Espagnol': '🇪🇸', 'Philosophie': '🤔', 'Sciences': '🔬',
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [eleve, setEleve] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data
  const [stats, setStats] = useState<any>(null);
  const [enfants, setEnfants] = useState<any[]>([]);
  const [adminData, setAdminData] = useState<any>(null);

  useEffect(() => {
    fetchSession();
  }, []);

  async function fetchSession() {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (!data.user) { router.push('/auth'); return; }
      setUser(data.user);
      setEleve(data.eleve);

      // Fetch role-specific data
      if (data.user.role === 'eleve') {
        const progRes = await fetch('/api/progression');
        const progData = await progRes.json();
        setStats(progData.stats);
      } else if (data.user.role === 'parent') {
        const parentRes = await fetch('/api/parent');
        const parentData = await parentRes.json();
        setEnfants(parentData.enfants || []);
      } else if (data.user.role === 'enseignant') {
        const adminRes = await fetch('/api/admin');
        const ad = await adminRes.json();
        setAdminData(ad);
      }
    } catch (e) {
      router.push('/auth');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p className="text-muted">Chargement...</p>
    </div>
  );

  const matieres = eleve?.classe
    ? getMatieres(eleve.classe)
    : ['Français', 'Mathématiques', 'PCT', 'SVT', 'Histoire-Géographie', 'Anglais'];

  return (
    <div>
      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3 style={{ fontSize: '1.1rem' }}>🎓 EkoleDirect</h3>
          <p style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: 4 }}>{user?.full_name}</p>
          <span className="badge badge-gold" style={{ marginTop: 6 }}>
            {user?.role === 'eleve' ? `🎒 ${eleve?.classe || 'Élève'}` : user?.role === 'parent' ? '👨‍👩‍👧 Parent' : '👨‍🏫 Enseignant'}
          </span>
        </div>
        <nav className="sidebar-nav">
          <a className="sidebar-link active" href="/dashboard">📊 Tableau de bord</a>
          {user?.role === 'eleve' && (
            <a className="sidebar-link" href="/chat">💬 Tuteur IA</a>
          )}
          {user?.role === 'enseignant' && (
            <>
              <a className="sidebar-link" href="/admin">⚙️ Programmes</a>
              <a className="sidebar-link" href="/admin">👥 Élèves</a>
            </>
          )}
        </nav>
        <div className="sidebar-footer">
          <button className="btn btn-ghost btn-sm btn-full" style={{ color: 'rgba(255,255,255,0.6)' }} onClick={handleLogout}>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="main-content">
        {/* Topbar (mobile) */}
        <div className="topbar">
          <button className="btn btn-ghost btn-sm" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display: 'none' }}>☰</button>
          <h3>Tableau de bord</h3>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Déconnexion</button>
        </div>

        <div style={{ padding: '24px 28px' }}>
          {/* Greeting */}
          <div style={{ marginBottom: 28 }}>
            <h2>Bonjour, {user?.full_name?.split(' ')[0]} 👋</h2>
            <p className="text-muted">
              {user?.role === 'eleve' && `Classe de ${eleve?.classe} — Continuez vos révisions !`}
              {user?.role === 'parent' && 'Suivez la progression de vos enfants'}
              {user?.role === 'enseignant' && 'Gérez votre plateforme de soutien scolaire'}
            </p>
          </div>

          {/* === ÉLÈVE VIEW === */}
          {user?.role === 'eleve' && (
            <>
              {/* Stats */}
              <div className="grid-4" style={{ marginBottom: 28 }}>
                {[
                  { value: stats?.scoreMoyen || 0, label: 'Score moyen', suffix: '%' },
                  { value: stats?.termines || 0, label: 'Chapitres terminés' },
                  { value: stats?.enCours || 0, label: 'En cours' },
                  { value: stats?.totalChapitres || 0, label: 'Total chapitres' },
                ].map((s, i) => (
                  <div key={i} className="stat-card">
                    <div className="stat-value">{s.value}{s.suffix || ''}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Matières */}
              <h3 style={{ marginBottom: 16 }}>Choisissez une matière pour commencer</h3>
              <div className="grid-3">
                {matieres.map((m) => (
                  <div key={m} className="subject-card" onClick={() => router.push(`/chat?matiere=${encodeURIComponent(m)}`)}>
                    <div className="subject-icon">{MATIERE_ICONS[m] || '📚'}</div>
                    <div className="subject-name">{m}</div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{ width: `${Math.floor(Math.random() * 60 + 10)}%` }} />
                    </div>
                    <span className="text-sm text-muted">Cliquez pour étudier →</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* === PARENT VIEW === */}
          {user?.role === 'parent' && (
            <>
              {enfants.length === 0 ? (
                <div className="card text-center" style={{ padding: 48 }}>
                  <p style={{ fontSize: '2rem', marginBottom: 12 }}>👨‍👩‍👧</p>
                  <h3>Aucun enfant lié à votre compte</h3>
                  <p className="text-muted" style={{ marginTop: 8 }}>
                    Votre enfant doit entrer votre email lors de son inscription pour lier les comptes.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-lg">
                  {enfants.map((enfant: any) => (
                    <div key={enfant.id} className="card">
                      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
                        <div>
                          <h3>🎒 {enfant.nom}</h3>
                          <p className="text-sm text-muted">Classe de {enfant.classe} {enfant.serie ? `— Série ${enfant.serie}` : ''}</p>
                        </div>
                        <span className="badge badge-green">Progression : {enfant.stats.progression}%</span>
                      </div>
                      <div className="progress-bar" style={{ marginBottom: 16 }}>
                        <div className="progress-bar-fill" style={{ width: `${enfant.stats.progression}%` }} />
                      </div>
                      <div className="grid-2">
                        <div className="stat-card">
                          <div className="stat-value">{enfant.stats.scoreMoyen}%</div>
                          <div className="stat-label">Score moyen</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-value">{enfant.activiteRecente?.length || 0}</div>
                          <div className="stat-label">Sessions récentes</div>
                        </div>
                      </div>
                      {enfant.resume && (
                        <div style={{ marginTop: 16, padding: 16, background: 'var(--green-50)', borderRadius: 'var(--radius-md)' }}>
                          <p className="text-sm"><strong>Forces :</strong> {enfant.resume.forces || '—'}</p>
                          <p className="text-sm"><strong>À améliorer :</strong> {enfant.resume.faiblesses || '—'}</p>
                          <p className="text-sm"><strong>Conseil :</strong> {enfant.resume.recommandations || '—'}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* === ENSEIGNANT VIEW === */}
          {user?.role === 'enseignant' && adminData && (
            <>
              <div className="grid-4" style={{ marginBottom: 28 }}>
                {[
                  { value: adminData.stats.totalEleves, label: 'Élèves inscrits', icon: '👥' },
                  { value: adminData.stats.abosActifs, label: 'Abonnés payants', icon: '💰' },
                  { value: adminData.stats.essaisActifs, label: 'En essai gratuit', icon: '🆓' },
                  { value: `${adminData.stats.revenuMensuel.toLocaleString()} F`, label: 'Revenu mensuel', icon: '📈' },
                ].map((s, i) => (
                  <div key={i} className="stat-card">
                    <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{s.icon}</div>
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              <h3 style={{ marginBottom: 16 }}>Élèves récents</h3>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Nom</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Classe</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Email</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Inscrit le</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminData.eleves.slice(0, 20).map((e: any) => (
                      <tr key={e.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                        <td style={{ padding: '10px 16px' }}>{e.users?.full_name}</td>
                        <td style={{ padding: '10px 16px' }}><span className="badge badge-green">{e.classe}</span></td>
                        <td style={{ padding: '10px 16px', color: 'var(--gray-500)' }}>{e.users?.email}</td>
                        <td style={{ padding: '10px 16px', color: 'var(--gray-500)' }}>
                          {new Date(e.users?.created_at).toLocaleDateString('fr-FR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .topbar button:first-child { display: block !important; }
        }
      `}</style>
    </div>
  );
}

function getMatieres(classe: string): string[] {
  const primaire = ['CI', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'];
  const college = ['6eme', '5eme', '4eme', '3eme'];
  if (primaire.includes(classe)) return ['Français', 'Mathématiques', 'Sciences', 'Histoire-Géographie', 'Anglais'];
  if (college.includes(classe)) return ['Français', 'Mathématiques', 'PCT', 'SVT', 'Histoire-Géographie', 'Anglais'];
  return ['Français', 'Mathématiques', 'PCT', 'SVT', 'Histoire-Géographie', 'Anglais', 'Philosophie'];
}
