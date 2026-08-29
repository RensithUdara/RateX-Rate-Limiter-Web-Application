import React from 'react'
import { BookOpen, Code2, Copy, Database, ExternalLink, Gauge, Settings } from 'lucide-react'
import { PageHero } from '../components/PageHero.jsx'
import { copyText } from '../utils/clipboard.js'

export function DocsPage() {
  return (
    <div className="page-stack">
      <PageHero
        badge="Project guide"
        title="Documentation"
        description="Quick reference for running RateX and using the core API endpoints."
        bannerIcon={<BookOpen size={38} />}
        bannerTitle="Everything you need"
        bannerText="Get started quickly with setup instructions, API usage, and database configuration."
      />
      <section className="docs-grid">
        <DocCard badge="Setup" icon={<Gauge />} title="Run API" text="Start the RateX server locally." lines={['go run ./cmd/server', 'API runs on http://localhost:8081']} />
        <DocCard badge="Database" icon={<Database />} title="Migrations" text="Run database migrations for RateX." lines={['psql \"postgres://ratex:ratex@localhost:5432/ratex?sslmode=disable\" -f .\\migrations\\001_init.sql', 'psql \"postgres://ratex:ratex@localhost:5432/ratex?sslmode=disable\" -f .\\migrations\\002_observability_and_routes.sql']} />
        <DocCard badge="API Usage" icon={<Code2 />} title="Protected Endpoint" text="Example of a protected route." lines={['GET /v1/products', 'Headers: X-API-Key or IP fallback']} />
        <DocCard badge="Endpoints" icon={<Settings />} title="Admin APIs" text="Available admin endpoints." lines={['GET /api/policies', 'GET /api/route-policies', 'GET /api/events']} />
      </section>
      <section className="panel help-card full-help">
        <span className="icon-badge"><BookOpen size={24} /></span>
        <div>
          <h2>Need more details?</h2>
          <p>Check out the full documentation for advanced configuration, environment variables, and deployment guide.</p>
        </div>
        <button className="secondary-action" type="button" onClick={() => copyText('go run ./cmd/server\npsql "postgres://ratex:ratex@localhost:5432/ratex?sslmode=disable" -f .\\migrations\\001_init.sql')}>View Full Documentation <ExternalLink size={15} /></button>
      </section>
    </div>
  )
}

function DocCard({ badge, icon, title, text, lines }) {
  return (
    <article className="panel doc-card">
      <div className="panel-heading">
        <span className="icon-badge">{icon}</span>
        <button className="secondary-action compact-action" type="button" onClick={() => copyText(lines.join('\n'))}>{badge}</button>
      </div>
      <h2>{title}</h2>
      <p>{text}</p>
      {lines.map((line) => (
        <code key={line}>
          <span>{line}</span>
          <button className="copy-inline" type="button" onClick={() => copyText(line)} title="Copy"><Copy size={15} /></button>
        </code>
      ))}
    </article>
  )
}
