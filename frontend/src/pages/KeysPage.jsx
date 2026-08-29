import React from 'react'
import { ExternalLink, KeyRound, Shield } from 'lucide-react'
import { KeyPanel } from '../components/KeyPanel.jsx'

export function KeysPage({ keys, policies, newKey, setNewKey, createdKey, onCreate, onRevoke }) {
  return (
    <div className="page-stack">
      <section className="page-hero">
        <PageHeader title="API Keys" description="Issue, review, and revoke API credentials for client applications." />
        <div className="feature-banner">
          <span className="banner-icon"><KeyRound size={42} /></span>
          <div>
            <strong>Secure your APIs</strong>
            <p>Use API keys to authenticate your applications and control access.</p>
          </div>
          <div className="wave one" />
          <div className="wave two" />
        </div>
      </section>
      <KeyPanel keys={keys} policies={policies} newKey={newKey} setNewKey={setNewKey} createdKey={createdKey} onCreate={onCreate} onRevoke={onRevoke} />
      <section className="help-grid">
        <HelpCard icon={<KeyRound />} title="Need help?" text="Check out our documentation to learn more about API key management and best practices." action="View Documentation" />
        <HelpCard icon={<Shield />} title="Best Practices" text="Keep your API keys secure and never expose them in client-side code." action="Learn More" />
      </section>
    </div>
  )
}

function PageHeader({ title, description }) {
  return (
    <section className="page-header">
      <span className="pill">Access control</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  )
}

function HelpCard({ icon, title, text, action }) {
  return (
    <article className="panel help-card">
      <span className="icon-badge">{icon}</span>
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      <button className="secondary-action">{action} <ExternalLink size={15} /></button>
    </article>
  )
}
