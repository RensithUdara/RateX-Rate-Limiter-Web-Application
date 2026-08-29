import React from 'react'
import { KeyRound, Plus, Trash2 } from 'lucide-react'

export function KeyPanel({ keys, policies, newKey, setNewKey, createdKey, onCreate, onRevoke }) {
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
      </form>
      {createdKey && <code className="secret">{createdKey}</code>}
      {keys.length === 0 ? (
        <div className="empty-state">
          <KeyRound size={28} />
          <span>API keys you create will appear here.</span>
          <small>Use API keys to authenticate your applications.</small>
        </div>
      ) : (
        <div className="table key-table">
          {keys.map((key) => (
            <div className="row" key={key.id}>
              <span>{key.name}</span>
              <span>{key.key_prefix}</span>
              <span>{key.policy_name}</span>
              <button className="danger-icon" onClick={() => onRevoke(key.id)} title="Revoke key"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
