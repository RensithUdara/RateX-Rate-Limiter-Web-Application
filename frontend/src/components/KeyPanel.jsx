import React from 'react'
import { ChevronLeft, ChevronRight, Copy, KeyRound, Plus, Trash2 } from 'lucide-react'
import { copyText } from '../utils/clipboard.js'

export function KeyPanel({ keys, policies, newKey, setNewKey, createdKey, onCreate, onRevoke, onCopy }) {
  async function handleCopy(value) {
    await copyText(value)
    onCopy?.()
  }

  return (
    <section id="keys" className="panel">
      <div className="panel-heading compact">
        <div className="heading-left">
          <span className="icon-badge"><KeyRound size={22} /></span>
          <div>
            <h2>API Keys</h2>
            <p>Create and manage API keys for your applications.</p>
          </div>
        </div>
        <button onClick={onCreate} className="primary-action" title="Add key"><Plus size={17} /> Add Key</button>
      </div>
      <form onSubmit={onCreate} className="key-form">
        <input value={newKey.name} onChange={(event) => setNewKey({ ...newKey, name: event.target.value })} placeholder="Demo application" />
        <select value={newKey.policy_id} onChange={(event) => setNewKey({ ...newKey, policy_id: event.target.value })}>
          {policies.map((policy) => <option key={policy.id} value={policy.id}>{policy.name}</option>)}
        </select>
        <button className="primary-action create-key-button"><KeyRound size={17} /> Create Key</button>
      </form>
      {createdKey && <code className="secret">{createdKey}<button type="button" onClick={() => handleCopy(createdKey)} title="Copy full API key"><Copy size={15} /></button></code>}
      {keys.length === 0 ? (
        <div className="empty-state">
          <KeyRound size={28} />
          <span>API keys you create will appear here.</span>
          <small>Use API keys to authenticate your applications.</small>
        </div>
      ) : (
        <div className="table key-table">
          <div className="table-head key-head">
            <span>Application</span>
            <span>API Key</span>
            <span>Environment</span>
            <span>Created At</span>
            <span>Actions</span>
          </div>
          {keys.map((key) => (
            <div className="row key-row" key={key.id}>
              <span>{key.name}</span>
              <span className="key-copy">{key.key_prefix}<button type="button" onClick={() => handleCopy(key.key_prefix)} title="Copy API key prefix"><Copy size={15} /></button></span>
              <span><mark>{key.policy_name || 'default'}</mark></span>
              <span>{formatDate(key.created_at)}</span>
              <button className="danger-icon" type="button" onClick={() => onRevoke(key.id)} title="Revoke key"><Trash2 size={15} /></button>
            </div>
          ))}
          <div className="table-footer">
            <span>Showing 1 of {keys.length}</span>
            <div>
              <button className="pager" type="button" disabled><ChevronLeft size={17} /></button>
              <button className="pager" type="button" disabled><ChevronRight size={17} /></button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function formatDate(value) {
  if (!value) return 'Just now'
  return new Date(value).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
