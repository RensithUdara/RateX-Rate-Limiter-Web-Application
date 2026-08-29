import React from 'react'
import { GitBranch } from 'lucide-react'
import { PageHero } from '../components/PageHero.jsx'
import { RoutePolicyPanel } from '../components/RoutePolicyPanel.jsx'

export function RoutesPage({ routes, policies, newRoute, setNewRoute, onCreate, onUpdate, onDelete, onDocs }) {
  return (
    <div className="page-stack">
      <PageHero
        badge="Endpoint rules"
        title="Route Policies"
        description="Attach specific policies to HTTP methods and paths such as GET /v1/products."
        bannerIcon={<GitBranch size={38} />}
        bannerTitle="Fine-grained control"
        bannerText="Set custom rate limits for each endpoint and HTTP method."
      />
      <RoutePolicyPanel routes={routes} policies={policies} newRoute={newRoute} setNewRoute={setNewRoute} onCreate={onCreate} onUpdate={onUpdate} onDelete={onDelete} onDocs={onDocs} />
    </div>
  )
}
