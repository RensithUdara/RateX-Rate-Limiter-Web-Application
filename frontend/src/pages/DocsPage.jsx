import React from 'react'
import { BookOpen, Code2, Database, Gauge } from 'lucide-react'

export function DocsPage() {
  return (
    <div className="page-stack">
      <section className="page-header">
        <span className="pill">Project guide</span>
        <h1>Documentation</h1>
        <p>Quick reference for running RateX and using the core API endpoints.</p>
      </section>
      <section className="docs-grid">
        <DocCard icon={<Gauge />} title="Run API" lines={['go run ./cmd/server', 'API runs on http://localhost:8081']} />
        <DocCard icon={<Database />} title="Migrations" lines={['psql \"postgres://ratex:ratex@localhost:5432/ratex?sslmode=disable\" -f .\\migrations\\001_init.sql', 'psql \"postgres://ratex:ratex@localhost:5432/ratex?sslmode=disable\" -f .\\migrations\\002_observability_and_routes.sql']} />
        <DocCard icon={<Code2 />} title="Protected Endpoint" lines={['GET /v1/products', 'Headers: X-API-Key or IP fallback']} />
        <DocCard icon={<BookOpen />} title="Admin APIs" lines={['GET /api/policies', 'GET /api/route-policies', 'GET /api/events']} />
      </section>
    </div>
  )
}

function DocCard({ icon, title, lines }) {
  return (
    <article className="panel doc-card">
      <span className="icon-badge">{icon}</span>
      <h2>{title}</h2>
      {lines.map((line) => <code key={line}>{line}</code>)}
    </article>
  )
}
