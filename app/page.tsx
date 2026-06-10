'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div>
      {/* HERO */}
      <section className="hero">
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800 }}>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
            <span className="badge badge-gold" style={{ fontSize: '0.85rem', padding: '6px 16px' }}>
              🇧🇯 Programme scolaire béninois officiel
            </span>
          </div>
          <h1>Votre tuteur scolaire<br />disponible <span style={{ color: 'var(--gold-400)' }}>24h/24</span></h1>
          <p>
            Soutien scolaire intelligent du CI à la Terminale. Exercices, explications
            et suivi personnalisé pour préparer le CEP, le BEPC et le BAC.
          </p>
          <div className="flex gap-md justify-center" style={{ flexWrap: 'wrap' }}>
            <button className="btn btn-gold btn-lg" onClick={() => router.push('/auth?mode=register')}>
              Commencer gratuitement →
            </button>
            <button className="btn btn-secondary btn-lg" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}
              onClick={() => router.push('/auth?mode=login')}>
              Se connecter
            </button>
          </div>
          <p style={{ marginTop: 16, fontSize: '0.85rem', opacity: 0.6 }}>
            ✓ 3 jours d'essai gratuit &nbsp; ✓ Accessible sur téléphone et ordinateur &nbsp; ✓ Paiement Mobile Money
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section">
        <div className="container text-center">
          <h2 style={{ marginBottom: 12 }}>Comment ça marche ?</h2>
          <p className="text-muted" style={{ marginBottom: 48, maxWidth: 500, margin: '0 auto 48px' }}>
            Un tuteur intelligent qui s'adapte au rythme de chaque élève
          </p>
          <div className="grid-3" style={{ maxWidth: 900, margin: '0 auto' }}>
            {[
              { icon: '💬', title: 'Posez vos questions', desc: 'Le tuteur IA explique chaque leçon avec patience, en français simple, avec des exemples du quotidien.' },
              { icon: '📊', title: 'Suivez la progression', desc: 'Tableau de bord pour les élèves et les parents. Voyez les forces, les faiblesses, les scores.' },
              { icon: '📝', title: 'Exercices & Quiz', desc: 'QCM, calculs, rédactions — corrigés et expliqués par le tuteur IA pour progresser rapidement.' },
            ].map((f, i) => (
              <div key={i} className="card" style={{ textAlign: 'center', padding: 32 }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ marginBottom: 8 }}>{f.title}</h3>
                <p className="text-muted text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUBJECTS */}
      <section style={{ padding: '60px 20px', background: 'var(--green-50)' }}>
        <div className="container text-center">
          <h2 style={{ marginBottom: 32 }}>Toutes les matières du programme béninois</h2>
          <div className="flex gap-md justify-center" style={{ flexWrap: 'wrap' }}>
            {['📖 Français', '🔢 Mathématiques', '⚡ PCT', '🌿 SVT', '🌍 Histoire-Géo', '🇬🇧 Anglais', '🤔 Philosophie', '🇩🇪 Allemand'].map((m, i) => (
              <span key={i} className="badge badge-green" style={{ fontSize: '0.95rem', padding: '8px 16px' }}>{m}</span>
            ))}
          </div>
          <p className="text-muted" style={{ marginTop: 20 }}>Du CI à la Terminale • Séries A, B, C, D</p>
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing-section">
        <div className="container text-center">
          <h2 style={{ marginBottom: 12 }}>Tarifs accessibles</h2>
          <p className="text-muted" style={{ marginBottom: 48 }}>Paiement par Mobile Money (MTN, Moov, Celtiis)</p>
          <div className="grid-3" style={{ maxWidth: 900, margin: '0 auto', alignItems: 'center' }}>
            {[
              { name: 'Essai', price: 'Gratuit', period: '3 jours', features: ['1 matière', 'Chat limité', 'Découverte'], popular: false },
              { name: 'Mensuel', price: '3 000 F', period: '/mois', features: ['Toutes les matières', 'Chat illimité', 'Suivi progression', 'Quiz & exercices'], popular: true },
              { name: 'Trimestriel', price: '7 500 F', period: '/3 mois', features: ['Tout le plan Mensuel', 'Rapports détaillés', 'Économisez 17%'], popular: false },
            ].map((plan, i) => (
              <div key={i} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && <span className="badge badge-green" style={{ marginBottom: 12 }}>Le plus choisi</span>}
                <h3>{plan.name}</h3>
                <div style={{ margin: '16px 0' }}>
                  <span className="price">{plan.price}</span>
                  <span className="price-suffix"> {plan.period}</span>
                </div>
                <div style={{ textAlign: 'left', marginBottom: 20 }}>
                  {plan.features.map((f, j) => (
                    <p key={j} style={{ padding: '4px 0', fontSize: '0.9rem', color: 'var(--gray-600)' }}>✓ {f}</p>
                  ))}
                </div>
                <button className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'} btn-full`}
                  onClick={() => router.push('/auth?mode=register')}>
                  {plan.price === 'Gratuit' ? 'Essayer' : 'Commencer'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '40px 20px', background: 'var(--green-900)', color: 'rgba(255,255,255,0.6)', textAlign: 'center', fontSize: '0.85rem' }}>
        <p style={{ marginBottom: 8, color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>EkoleDirect 🇧🇯</p>
        <p>Soutien scolaire en ligne — Programme béninois officiel</p>
        <p style={{ marginTop: 8 }}>© {new Date().getFullYear()} Tous droits réservés</p>
      </footer>
    </div>
  );
}
