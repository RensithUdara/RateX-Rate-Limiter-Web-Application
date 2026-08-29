import React, { useMemo, useState } from 'react'
import { BookOpen, Check, ChevronLeft, ChevronRight, HelpCircle, List, Pencil, Plus, Route, Search, Trash2, X } from 'lucide-react'

const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

export function RoutePolicyPanel({ routes, policies, newRoute, setNewRoute, onCreate, onUpdate, onDelete, onDocs }) {
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState('')
  const [draft, setDraft] = useState({ method: 'GET', route_pattern: '', policy_id: '', enabled: true })

  const filteredRoutes = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return routes
    return routes.filter((route) => [route.method, route.route_pattern, route.policy_name].some((value) => String(value || '').toLowerCase().includes(term)))
  }, [routes, query])

  function startEdit(route) {
    setEditingId(route.id)
    setDraft({ method: route.method, route_pattern: route.route_pattern, policy_id: route.policy_id, enabled: route.enabled !== false })
  }

  async function saveEdit(id) {
    await onUpdate(id, draft)
    setEditingId('')
  }

  function fillExample() {
    setNewRoute({ ...newRoute, method: 'GET', route_pattern: '/v1/products', policy_id: newRoute.policy_id || policies[0]?.id || '' })
  }

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
          <button className="secondary-action compact-action" type="button" onClick={fillExample}><BookOpen size={16} /> View Examples</button>
        </div>
        <form onSubmit={onCreate} className="route-form labeled">
          <label>
            <span>HTTP Method</span>
            <select value={newRoute.method} onChange={(event) => setNewRoute({ ...newRoute, method: event.target.value })}>
              {methods.map((method) => <option key={method}>{method}</option>)}
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
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search routes..." />
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
          {filteredRoutes.map((route) => {
            const policy = policies.find((item) => item.id === route.policy_id)
            return (
              <div className="row route-row" key={route.id}>
                {editingId === route.id ? (
                  <>
                    <span>
                      <select value={draft.method} onChange={(event) => setDraft({ ...draft, method: event.target.value })}>
                        {methods.map((method) => <option key={method}>{method}</option>)}
                      </select>
                    </span>
                    <span><input value={draft.route_pattern} onChange={(event) => setDraft({ ...draft, route_pattern: event.target.value })} /></span>
                    <span>
                      <select value={draft.policy_id} onChange={(event) => setDraft({ ...draft, policy_id: event.target.value })}>
                        {policies.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                      </select>
                    </span>
                    <span>{policy ? `${policy.request_limit}/${policy.window_seconds}s` : '-'}</span>
                  </>
                ) : (
                  <>
                    <span><mark className="method-badge">{route.method}</mark></span>
                    <span>{route.route_pattern}</span>
                    <span><mark>{route.policy_name || route.policy_id}</mark></span>
                    <span>{policy ? `${policy.request_limit}/${policy.window_seconds}s` : '-'}</span>
                  </>
                )}
                <span className="action-pair">
                  {editingId === route.id ? (
                    <>
                      <button className="edit-icon" type="button" onClick={() => saveEdit(route.id)} title="Save route policy"><Check size={15} /></button>
                      <button className="secondary-icon" type="button" onClick={() => setEditingId('')} title="Cancel edit"><X size={15} /></button>
                    </>
                  ) : (
                    <>
                      <button className="edit-icon" type="button" onClick={() => startEdit(route)} title="Edit route policy"><Pencil size={15} /></button>
                      <button className="danger-icon" type="button" onClick={() => onDelete(route)} title="Delete route policy"><Trash2 size={15} /></button>
                    </>
                  )}
                </span>
              </div>
            )
          })}
          {filteredRoutes.length === 0 && <div className="empty-state slim">{routes.length === 0 ? 'No route policies configured yet.' : 'No matching routes.'}</div>}
          <div className="table-footer">
            <span>Showing {filteredRoutes.length ? 1 : 0} to {filteredRoutes.length} of {routes.length} routes</span>
            <div>
              <button className="pager" type="button" disabled><ChevronLeft size={17} /></button>
              <button className="pager active" type="button">1</button>
              <button className="pager" type="button" disabled><ChevronRight size={17} /></button>
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
        <button className="secondary-action" type="button" onClick={onDocs}>View Documentation</button>
      </section>
    </>
  )
}
