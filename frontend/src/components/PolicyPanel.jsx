import React, { useMemo, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, Pencil, Plus, RefreshCw, Search, Settings, Trash2, X } from 'lucide-react'

const emptyPolicy = { name: '', algorithm: 'token_bucket', request_limit: 100, window_seconds: 60, burst_capacity: 100 }

export function PolicyPanel({ policies, newPolicy, setNewPolicy, onCreate, onUpdate, onDelete }) {
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState('')
  const [draft, setDraft] = useState(emptyPolicy)

  const filteredPolicies = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return policies
    return policies.filter((policy) => [policy.name, policy.algorithm, `${policy.request_limit}/${policy.window_seconds}s`].some((value) => String(value).toLowerCase().includes(term)))
  }, [policies, query])

  function startEdit(policy) {
    setEditingId(policy.id)
    setDraft({
      name: policy.name,
      algorithm: policy.algorithm,
      request_limit: policy.request_limit,
      window_seconds: policy.window_seconds,
      burst_capacity: policy.burst_capacity || policy.request_limit,
    })
  }

  async function saveEdit(id) {
    await onUpdate(id, draft)
    setEditingId('')
  }

  return (
    <>
      <section id="policies" className="panel policy-create-card">
        <div className="panel-heading">
          <div className="heading-left">
            <span className="icon-badge"><Settings size={22} /></span>
            <div>
              <h2>Create Policy</h2>
              <p>Define rate limiting rules for different endpoints.</p>
            </div>
          </div>
          <button className="secondary-action reset-button" type="button" onClick={() => setNewPolicy(emptyPolicy)}><RefreshCw size={16} /> Reset</button>
        </div>
        <form onSubmit={onCreate} className="policy-form labeled">
          <label>
            <span>Policy name</span>
            <input value={newPolicy.name} onChange={(event) => setNewPolicy({ ...newPolicy, name: event.target.value })} placeholder="Enter policy name" />
          </label>
          <label>
            <span>Token bucket</span>
            <select value={newPolicy.algorithm} onChange={(event) => setNewPolicy({ ...newPolicy, algorithm: event.target.value })}>
              <option value="token_bucket">Token bucket</option>
              <option value="fixed_window">Fixed window</option>
              <option value="sliding_window">Sliding window</option>
            </select>
          </label>
          <label>
            <span>Requests per window</span>
            <input type="number" value={newPolicy.request_limit} onChange={(event) => setNewPolicy({ ...newPolicy, request_limit: Number(event.target.value) })} placeholder="100" />
          </label>
          <label>
            <span>Window (seconds)</span>
            <input type="number" value={newPolicy.window_seconds} onChange={(event) => setNewPolicy({ ...newPolicy, window_seconds: Number(event.target.value) })} placeholder="60" />
          </label>
          <button className="wide"><Plus size={17} /> Create Policy</button>
        </form>
      </section>

      <section className="panel policy-list-card">
        <div className="panel-heading">
          <div className="heading-left">
            <span className="icon-badge stack-icon"><Settings size={22} /></span>
            <div>
              <h2>Existing Policies</h2>
              <p>Manage your configured rate limiting policies.</p>
            </div>
          </div>
          <label className="table-search">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search policies..." />
          </label>
        </div>
        <div className="table policy-table">
          <div className="table-head policy-head">
            <span>Policy</span>
            <span>Algorithm</span>
            <span>Limit</span>
            <span>Actions</span>
          </div>
          {filteredPolicies.map((policy) => (
            <div className="row policy-row" key={policy.id}>
              {editingId === policy.id ? (
                <>
                  <span><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></span>
                  <span>
                    <select value={draft.algorithm} onChange={(event) => setDraft({ ...draft, algorithm: event.target.value })}>
                      <option value="token_bucket">token_bucket</option>
                      <option value="fixed_window">fixed_window</option>
                      <option value="sliding_window">sliding_window</option>
                    </select>
                  </span>
                  <span className="inline-fields">
                    <input type="number" value={draft.request_limit} onChange={(event) => setDraft({ ...draft, request_limit: Number(event.target.value), burst_capacity: Number(event.target.value) })} />
                    <input type="number" value={draft.window_seconds} onChange={(event) => setDraft({ ...draft, window_seconds: Number(event.target.value) })} />
                  </span>
                </>
              ) : (
                <>
                  <span>{policy.name}</span>
                  <span>{policy.algorithm}</span>
                  <span>{policy.request_limit}/{policy.window_seconds}s</span>
                </>
              )}
              <span className="action-pair">
                {editingId === policy.id ? (
                  <>
                    <button className="edit-icon" type="button" onClick={() => saveEdit(policy.id)} title="Save policy"><Check size={15} /></button>
                    <button className="secondary-icon" type="button" onClick={() => setEditingId('')} title="Cancel edit"><X size={15} /></button>
                  </>
                ) : (
                  <>
                    <button className="edit-icon" type="button" onClick={() => startEdit(policy)} title="Edit policy"><Pencil size={15} /></button>
                    <button className="danger-icon" type="button" onClick={() => onDelete(policy)} title="Delete policy"><Trash2 size={15} /></button>
                  </>
                )}
              </span>
            </div>
          ))}
          {filteredPolicies.length === 0 && <div className="empty-state slim">No matching policies.</div>}
          <div className="table-footer">
            <span>Showing {filteredPolicies.length ? 1 : 0} to {filteredPolicies.length} of {policies.length} policies</span>
            <div>
              <button className="pager" type="button" disabled><ChevronLeft size={17} /></button>
              <button className="pager active" type="button">1</button>
              <button className="pager" type="button" disabled><ChevronRight size={17} /></button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
