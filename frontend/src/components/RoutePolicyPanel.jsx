import React from 'react'
import { Plus, Route, Trash2 } from 'lucide-react'

export function RoutePolicyPanel({ routes, policies, newRoute, setNewRoute, onCreate, onDelete }) {
  return (
    <section id="routes" className="panel">
      <div className="panel-heading compact">
        <div className="heading-left">
          <span className="icon-badge"><Route size={22} /></span>
          <div>
            <h2>Route Policies</h2>
            <p>Override limits for specific methods and paths.</p>
          </div>
        </div>
      </div>
      <form onSubmit={onCreate} className="route-form">
        <select value={newRoute.method} onChange={(event) => setNewRoute({ ...newRoute, method: event.target.value })}>
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>DELETE</option>
        </select>
        <input value={newRoute.route_pattern} onChange={(event) => setNewRoute({ ...newRoute, route_pattern: event.target.value })} placeholder="/v1/products" />
        <select value={newRoute.policy_id} onChange={(event) => setNewRoute({ ...newRoute, policy_id: event.target.value })}>
          {policies.map((policy) => <option key={policy.id} value={policy.id}>{policy.name}</option>)}
        </select>
        <button className="primary-action"><Plus size={17} /> Attach</button>
      </form>
      <div className="table route-table">
        <div className="table-head route-head">
          <span>Method</span>
          <span>Route</span>
          <span>Policy</span>
          <span>Actions</span>
        </div>
        {routes.map((route) => (
          <div className="row route-row" key={route.id}>
            <span>{route.method}</span>
            <span>{route.route_pattern}</span>
            <span>{route.policy_name || route.policy_id}</span>
            <button className="danger-icon" onClick={() => onDelete(route.id)} title="Delete route policy"><Trash2 size={15} /></button>
          </div>
        ))}
      </div>
    </section>
  )
}
