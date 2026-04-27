import { useEffect, useState } from 'react';
import { bootstrap, getRep } from './store/bootstrap';
import { useProjects } from './store/subscriptions';
import type { Rep } from './store/replicache';

export function App() {
  const [rep, setRep] = useState<Rep | null>(null);
  useEffect(() => {
    bootstrap()
      .then(() => setRep(getRep()))
      .catch((e) => console.error('bootstrap failed', e));
  }, []);

  const projects = useProjects(rep);

  return (
    <div style={{ padding: 32, fontFamily: 'var(--serif)' }}>
      <h1 style={{ fontSize: 24, fontWeight: 500 }}>PhD Dashboard — store bootstrapped</h1>
      <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-3)' }}>
        {rep ? `${projects.length} projects in store` : 'starting Replicache…'}
      </p>
      <ul style={{ fontFamily: 'var(--sans)', fontSize: 13 }}>
        {projects.map((p) => (
          <li key={p.id}>
            <strong>{p.code}</strong> — {p.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
