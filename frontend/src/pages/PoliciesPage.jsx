import React from 'react'
import { PolicyPanel } from '../components/PolicyPanel.jsx'

export function PoliciesPage({ policies, newPolicy, setNewPolicy, onCreate, onDelete }) {
  return (
    <div className="page-stack">
      <section className="page-header">
        <span className="pill">Limit configuration</span>
        <h1>Policies</h1>
        <p>Create reusable rate limit rules for free, premium, enterprise, or route-specific traffic.</p>
      </section>
      <PolicyPanel policies={policies} newPolicy={newPolicy} setNewPolicy={setNewPolicy} onCreate={onCreate} onDelete={onDelete} />
    </div>
  )
}
