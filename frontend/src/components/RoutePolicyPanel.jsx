import React from 'react'
import { BookOpen, ChevronLeft, ChevronRight, HelpCircle, List, Pencil, Plus, Route, Search, Trash2 } from 'lucide-react'

export function RoutePolicyPanel({ routes, policies, newRoute, setNewRoute, onCreate, onDelete }) {
  return (
    <>
      <section id="routes" className="panel route-create-card">
        <div className="panel-heading">
          <div className="heading-left">
            <span className="icon-badge"><Route size={22} /></span>
            <div>
              <h2>Add Route Policy</h2>
              <p>Define a route and attach a policy to control request limits.</p>
            </div>
          </div>
          <button className="secondary-action compact-action" type="button"><BookOpen size={16} /> View Examples</button>
        </div>
        <form onSubmit={onCreate} className="route-form labeled">
          <label>
            <span>HTTP Method</span>
            <select value={newRoute.method} onChange={(event) => setNewRoute({ ...newRoute, method: event.target.value })}>
              <option>GET</option>
              <option>POST</option>
              <option>PUT</option>
              <option>DELETE</option>
            </select>
          </label>
          <label>
            <span>Route Path</span>
            <input value={newRoute.route_pattern} onChange={(event) => setNewRoute({ ...newRoute, route_pattern: event.target.value })} placeholder="/v1/products" />
            <small>Use path parameters for dynamic routes, e.g. /v1/users/:id</small>
          </label>
          <label>
            <span>Policy</span>
            <select value={newRoute.policy_id} onChange={(event) => setNewRoute({ ...newRoute, policy_id: event.target.value })}>
              {policies.map((policy) => <option key={policy.id} value={policy.id}>{policy.name}</option>)}
            </select>
          </label>
          <button className="primary-action attach-button"><Plus size={17} /> Attach Policy</button>
        </form>
      </section>

      <section className="panel route-list-card">
        <div className="panel-heading">
          <div className="heading-left">
            <span className="icon-badge"><List size={22} /></span>
            <div>
              <h2>Configured Route Policies</h2>
              <p>List of endpoint specific rate limiting rules.</p>
            </div>
          </div>
          <label className="table-search">
            <Search size={18} />
            <input placeholder="Search routes..." />
          </label>
        </div>
        <div className="table route-table">
          <div className="table-head route-head">
            <span>Method</span>
            <span>Route</span>
            <span>Policy</span>
            <span>Limit</span>
            <span>Actions</span>
          </div>
          {routes.map((route) => {
            const policy = policies.find((item) => item.id === route.policy_id)
            return (
              <div className="row route-row" key={route.id}>
                <span><mark className="method-badge">{route.method}</mark></span>
                <span>{route.route_pattern}</span>
                <span><mark>{route.policy_name || route.policy_id}</mark></span>
                <span>{policy ? `${policy.request_limit}/${policy.window_seconds}s` : '-'}</span>
                <span className="action-pair">
                  <button className="edit-icon" type="button" title="Edit route policy"><Pencil size={15} /></button>
                  <button className="danger-icon" onClick={() => onDelete(route.id)} title="Delete route policy"><Trash2 size={15} /></button>
                </span>
              </div>
            )
          })}
          {routes.length === 0 && <div className="empty-state slim">No route policies configured yet.</div>}
          <div className="table-footer">
            <span>Showing 1 to {routes.length} of {routes.length} routes</span>
            <div>
              <button className="pager" type="button"><ChevronLeft size={17} /></button>
              <button className="pager active" type="button">1</button>
              <button className="pager" type="button"><ChevronRight size={17} /></button>
            </div>
          </div>
        </div>
      </section>

      <section className="panel help-card full-help">
        <span className="icon-badge"><HelpCircle size={24} /></span>
        <div>
          <h2>Need help?</h2>
          <p>Check out our documentation to learn more about route policies and examples.</p>
        </div>
        <button className="secondary-action">View Documentation</button>
      </section>
    </>
  )
}
