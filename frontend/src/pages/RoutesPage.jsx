import React from 'react'
import { RoutePolicyPanel } from '../components/RoutePolicyPanel.jsx'

export function RoutesPage({ routes, policies, newRoute, setNewRoute, onCreate, onDelete }) {
  return (
    <div className="page-stack">
      <section className="page-header">
        <span className="pill">Endpoint rules</span>
        <h1>Route Policies</h1>
        <p>Attach specific policies to HTTP methods and paths such as GET /v1/products.</p>
      </section>
      <RoutePolicyPanel routes={routes} policies={policies} newRoute={newRoute} setNewRoute={setNewRoute} onCreate={onCreate} onDelete={onDelete} />
    </div>
  )
}
