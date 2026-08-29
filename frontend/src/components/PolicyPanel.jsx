import React from 'react'
import { Plus, Shield, Trash2, Zap } from 'lucide-react'

export function PolicyPanel({ policies, newPolicy, setNewPolicy, onCreate, onDelete }) {
  return (
    <section id="policies" className="panel">
      <div className="panel-heading compact">
        <div className="heading-left">
          <span className="icon-badge"><Shield size={22} /></span>
          <div>
            <h2>Policies</h2>
            <p>Define rate limiting rules for different endpoints.</p>
          </div>
        </div>
        <Zap size={22} className="section-mark" />
      </div>
      <form onSubmit={onCreate} className="policy-form">
        <input value={newPolicy.name} onChange={(event) => setNewPolicy({ ...newPolicy, name: event.target.value })} placeholder="Policy name" />
        <select value={newPolicy.algorithm} onChange={(event) => setNewPolicy({ ...newPolicy, algorithm: event.target.value })}>
          <option value="token_bucket">Token bucket</option>
          <option value="fixed_window">Fixed window</option>
          <option value="sliding_window">Sliding window</option>
        </select>
        <input type="number" value={newPolicy.request_limit} onChange={(event) => setNewPolicy({ ...newPolicy, request_limit: Number(event.target.value) })} placeholder="Requests per window" />
        <input type="number" value={newPolicy.window_seconds} onChange={(event) => setNewPolicy({ ...newPolicy, window_seconds: Number(event.target.value) })} placeholder="Window seconds" />
        <button className="wide"><Plus size={17} /> Create Policy</button>
      </form>
      <div className="table policy-table">
        <div className="table-head">
          <span>Policy</span>
          <span>Algorithm</span>
          <span>Limit</span>
          <span>Actions</span>
        </div>
        {policies.map((policy) => (
          <div className="row policy" key={policy.id}>
            <span>{policy.name}</span>
            <span>{policy.algorithm}</span>
            <span>{policy.request_limit}/{policy.window_seconds}s</span>
            <button className="danger-icon" onClick={() => onDelete(policy.id)} title="Delete policy"><Trash2 size={15} /></button>
          </div>
        ))}
      </div>
    </section>
  )
}
