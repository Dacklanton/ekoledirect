'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const MATIERE_ICONS: Record<string, string> = {
  'Français': '📖', 'Mathématiques': '🔢', 'PCT': '⚡', 'SVT': '🌿',
  'Histoire-Géographie': '🌍', 'Anglais': '🇬🇧', 'Philosophie': '🤔', 'Sciences': '🔬',
};

interface Message { role: 'user' | 'assistant'; content: string; timestamp?: string; }

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [user, setUser] = useState<any>(null);
  const [eleve, setEleve] = useState<any>(null);
  const [matiere, setMatiere] = useState(searchParams.get('matiere') || '');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string>('new');
  const [conversations, setConversations] = useState<any[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    if (matiere) fetchConversations();
  }, [matiere]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchSession() {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    if (!data.user || data.user.role !== 'eleve') { router.push('/dashboard'); return; }
    setUser(data.user);
    setEleve(data.eleve);
  }

  async function fetchConversations() {
    const res = await fetch(`/api/chat?matiere=${encodeURIComponent(matiere)}`);
    const data = await res.json();
    setConversations(data.conversations || []);
  }

  async function sendMessage() {
    if (!input.trim() || sending || !matiere) return;

    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content, matiere, conversationId }),
      });

      const data = await res.json();

      if (data.expired) {
        setExpired(true);
        setSending(false);
        return;
      }

      if (!res.ok) throw new Error(data.error);

      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      if (data.conversationId) setConversationId(data.conversationId);
    } catch (e: any) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `❌ Erreur : ${e.message}. Réessayez.` }]);
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function startNewConversation() {
    setConversationId('new');
    setMessages([]);
  }

  // If no matiere selected, show subject picker
  if (!matiere) {
    const matieres = eleve?.classe ? getMatieres(eleve.classe) : ['Français', 'Mathématiques', 'PCT', 'SVT', 'Anglais'];
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ maxWidth: 600, width: '100%' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => router.push('/dashboard')} style={{ marginBottom: 16 }}>
            ← Retour
          </button>
          <h2 style={{ marginBottom: 8 }}>Choisissez une matière</h2>
          <p className="text-muted" style={{ marginBottom: 24 }}>Quel sujet voulez-vous étudier aujourd'hui ?</p>
          <div className="grid-2">
            {matieres.map((m) => (
              <div key={m} className="subject-card" onClick={() => setMatiere(m)}>
                <div className="subject-icon">{MATIERE_ICONS[m] || '📚'}</div>
                <div className="subject-name">{m}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex" style={{ height: '100vh' }}>
      {/* Chat sidebar - conversations list */}
      {showSidebar && (
        <div style={{ width: 260, borderRight: '1px solid var(--gray-200)', background: 'white', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 16, borderBottom: '1px solid var(--gray-200)' }}>
            <button className="btn btn-primary btn-sm btn-full" onClick={startNewConversation}>
              + Nouvelle conversation
            </button>
          </div>
          <div style={{ padding: '8px 12px' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => { setMatiere(''); setMessages([]); }}>
              ← Changer de matière
            </button>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '8px 12px' }}>
            {conversations.map((c: any) => (
              <div key={c.id}
                onClick={() => { setConversationId(c.id); setMessages([]); }}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  marginBottom: 4,
                  background: conversationId === c.id ? 'var(--green-50)' : 'transparent',
                  borderLeft: conversationId === c.id ? '3px solid var(--green-500)' : '3px solid transparent',
                }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>{c.titre || matiere}</p>
                <p className="text-xs text-muted">{new Date(c.updated_at).toLocaleDateString('fr-FR')}</p>
              </div>
            ))}
          </div>
          <div style={{ padding: 12, borderTop: '1px solid var(--gray-200)' }}>
            <button className="btn btn-ghost btn-sm btn-full" onClick={() => router.push('/dashboard')}>
              📊 Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Main chat area */}
      <div className="chat-container" style={{ flex: 1 }}>
        {/* Chat header */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--gray-200)', background: 'white', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowSidebar(!showSidebar)}>
            {showSidebar ? '◁' : '▷'}
          </button>
          <span style={{ fontSize: '1.3rem' }}>{MATIERE_ICONS[matiere] || '📚'}</span>
          <div>
            <h3 style={{ fontSize: '1rem' }}>Tuteur de {matiere}</h3>
            <p className="text-xs text-muted">Posez vos questions • {eleve?.classe || ''}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="text-center" style={{ margin: 'auto', maxWidth: 400, padding: 40 }}>
              <p style={{ fontSize: '3rem', marginBottom: 12 }}>{MATIERE_ICONS[matiere] || '📚'}</p>
              <h3>Bienvenue en {matiere} !</h3>
              <p className="text-muted" style={{ marginTop: 8 }}>
                Posez n'importe quelle question sur votre cours. Je suis là pour vous aider à comprendre et progresser.
              </p>
              <div className="flex flex-col gap-sm" style={{ marginTop: 20 }}>
                {getQuickStarts(matiere).map((q, i) => (
                  <button key={i} className="btn btn-secondary btn-sm"
                    onClick={() => { setInput(q); textareaRef.current?.focus(); }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble ${msg.role} animate-in`}>
              {msg.content}
            </div>
          ))}

          {sending && (
            <div className="chat-bubble assistant">
              <div className="typing-dots">
                <span /><span /><span />
              </div>
            </div>
          )}

          {expired && (
            <div className="card" style={{ maxWidth: 400, margin: '16px auto', textAlign: 'center', background: 'var(--gold-100)', border: '1px solid var(--gold-300)' }}>
              <p style={{ fontWeight: 600, marginBottom: 8 }}>⏰ Votre essai a expiré</p>
              <p className="text-sm text-muted">Abonnez-vous pour continuer à utiliser le tuteur IA.</p>
              <button className="btn btn-gold btn-sm" style={{ marginTop: 12 }}>Voir les tarifs</button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="chat-input-bar">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Posez votre question en ${matiere}...`}
            disabled={sending || expired}
            rows={1}
          />
          <button className="btn btn-primary" onClick={sendMessage} disabled={sending || !input.trim() || expired}>
            {sending ? '...' : '→'}
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .chat-container { width: 100vw; }
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

function getQuickStarts(matiere: string): string[] {
  const map: Record<string, string[]> = {
    'Français': ['Expliquez-moi le discours indirect', 'Comment faire un bon résumé de texte ?', 'Les figures de style'],
    'Mathématiques': ['Expliquez le théorème de Pythagore', 'Comment résoudre une équation du 1er degré ?', 'Les fractions'],
    'PCT': ['La loi d\'Ohm, c\'est quoi ?', 'Expliquez la combustion complète', 'Les forces et le mouvement'],
    'SVT': ['Comment fonctionne le système nerveux ?', 'C\'est quoi un gène ?', 'Les chaînes alimentaires'],
    'Anglais': ['Help me with present tense', 'How to write a formal letter', 'Irregular verbs practice'],
    'Histoire-Géographie': ['L\'indépendance du Dahomey', 'Les causes de la 2nde Guerre mondiale', 'Géographie du Bénin'],
    'Philosophie': ['Qu\'est-ce que la conscience ?', 'Liberté et déterminisme', 'La justice selon Platon'],
  };
  return map[matiere] || ['Sur quel chapitre travaillez-vous ?', 'J\'ai besoin d\'aide avec un exercice', 'Expliquez-moi un concept'];
}
