import { Suspense } from 'react';
import AuthForm from './AuthForm';

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #0d3b16, #1a5c2a)' }}>
        <p style={{ color: 'white' }}>Chargement...</p>
      </div>
    }>
      <AuthForm />
    </Suspense>
  );
}
