import React from 'react'
import { ChevronLeft, ChevronRight, Pencil, Plus, RefreshCw, Search, Settings, Trash2 } from 'lucide-react'

export function PolicyPanel({ policies, newPolicy, setNewPolicy, onCreate, onDelete }) {
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
          <button className="secondary-action reset-button" type="button"><RefreshCw size={16} /> Reset</button>
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
            <input placeholder="Search policies..." />
          </label>
        </div>
        <div className="table policy-table">
          <div className="table-head policy-head">
            <span>Policy</span>
            <span>Algorithm</span>
            <span>Limit</span>
            <span>Actions</span>
          </div>
          {policies.map((policy) => (
            <div className="row policy-row" key={policy.id}>
              <span>{policy.name}</span>
              <span>{policy.algorithm}</span>
              <span>{policy.request_limit}/{policy.window_seconds}s</span>
              <span className="action-pair">
                <button className="edit-icon" type="button" title="Edit policy"><Pencil size={15} /></button>
                <button className="danger-icon" onClick={() => onDelete(policy.id)} title="Delete policy"><Trash2 size={15} /></button>
              </span>
            </div>
          ))}
          <div className="table-footer">
            <span>Showing 1 to {policies.length} of {policies.length} policies</span>
            <div>
              <button className="pager" type="button"><ChevronLeft size={17} /></button>
              <button className="pager active" type="button">1</button>
              <button className="pager" type="button"><ChevronRight size={17} /></button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
