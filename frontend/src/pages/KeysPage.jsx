import React from 'react'
import { KeyPanel } from '../components/KeyPanel.jsx'

export function KeysPage({ keys, policies, newKey, setNewKey, createdKey, onCreate, onRevoke }) {
  return (
    <div className="page-stack">
      <PageHeader title="API Keys" description="Issue, review, and revoke API credentials for client applications." />
      <KeyPanel keys={keys} policies={policies} newKey={newKey} setNewKey={setNewKey} createdKey={createdKey} onCreate={onCreate} onRevoke={onRevoke} />
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
