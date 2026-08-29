import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Activity,
  Ban,
  BookOpen,
  ChevronDown,
  KeyRound,
  Play,
  Plus,
  RefreshCcw,
  Send,
  Server,
  Shield,
  ShieldCheck,
  Sparkles,
  Sun,
  Terminal,
  Trash2,
  Zap,
} from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import './styles.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || 'dev-admin-token'

const headers = {
  'Content-Type': 'application/json',
  'X-Admin-Token': ADMIN_TOKEN,
}

function App() {
  const [stats, setStats] = useState({ requests: 0, allowed: 0, rejected: 0 })
  const [policies, setPolicies] = useState([])
  const [keys, setKeys] = useState([])
  const [createdKey, setCreatedKey] = useState('')
  const [message, setMessage] = useState('')
  const [testResult, setTestResult] = useState(null)
  const [newPolicy, setNewPolicy] = useState({ name: '', algorithm: 'token_bucket', request_limit: 100, window_seconds: 60, burst_capacity: 100 })
  const [newKey, setNewKey] = useState({ name: 'Demo application', policy_id: '' })

  const chartData = useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => {
      const wave = index < 2 ? 0 : index < 5 ? 1 : index < 7 ? 0 : index < 10 ? 1 : 0
      return {
        t: `${index * 5}s`,
        requests: wave,
        rejected: Math.min(0.35, (stats.rejected || 0) / Math.max(1, stats.requests || 1)),
      }
    })
  }, [stats])

  async function load() {
    const [statsRes, policyRes, keyRes] = await Promise.all([
      fetch(`${API_BASE}/api/stats`),
      fetch(`${API_BASE}/api/policies`, { headers }),
      fetch(`${API_BASE}/api/keys`, { headers }),
    ])
    if (statsRes.ok) setStats(await statsRes.json())
    if (policyRes.ok) {
      const data = await policyRes.json()
      setPolicies(data)
      if (!newKey.policy_id && data[0]) setNewKey((value) => ({ ...value, policy_id: data[0].id }))
    }
    if (keyRes.ok) setKeys(await keyRes.json())
  }

  useEffect(() => {
    load().catch((error) => setMessage(error.message))
    const timer = setInterval(() => load().catch(() => {}), 5000)
    return () => clearInterval(timer)
  }, [])

  async function createPolicy(event) {
    event.preventDefault()
    const response = await fetch(`${API_BASE}/api/policies`, { method: 'POST', headers, body: JSON.stringify(newPolicy) })
    if (!response.ok) {
      setMessage(await response.text())
      return
    }
    setMessage('Policy created')
    setNewPolicy({ name: '', algorithm: 'token_bucket', request_limit: 100, window_seconds: 60, burst_capacity: 100 })
    await load()
  }

  async function createKey(event) {
    event.preventDefault()
    const response = await fetch(`${API_BASE}/api/keys`, { method: 'POST', headers, body: JSON.stringify(newKey) })
    if (!response.ok) {
      setMessage(await response.text())
      return
    }
    const data = await response.json()
    setCreatedKey(data.key)
    setMessage('API key created')
    await load()
  }

  async function revokeKey(id) {
    await fetch(`${API_BASE}/api/keys/${id}`, { method: 'DELETE', headers })
    await load()
  }

  async function deletePolicy(id) {
    const response = await fetch(`${API_BASE}/api/policies/${id}`, { method: 'DELETE', headers })
    if (!response.ok) {
      setMessage(await response.text())
      return
    }
    await load()
  }

  async function testRequest() {
    const key = createdKey || ''
    const response = await fetch(`${API_BASE}/v1/products`, { headers: key ? { 'X-API-Key': key } : {} })
    const body = await response.json().catch(() => ({}))
    setTestResult({
      status: response.status,
      limit: response.headers.get('X-RateLimit-Limit'),
      remaining: response.headers.get('X-RateLimit-Remaining'),
      retryAfter: response.headers.get('Retry-After'),
      body,
    })
    await load()
  }

  return (
    <main className="shell">
      <Sidebar />

      <section className="workspace">
        <Topbar onRefresh={load} />

        <section className="hero">
          <div className="hero-copy">
            <span className="pill">Distributed API rate limiting</span>
            <h1>Control traffic across Go instances with shared Redis state.</h1>
            <p>Simple. Scalable. Reliable. Keep your APIs fair and fast with RateX.</p>
          </div>
          <div className="scale-card" aria-label="Built for scale">
            <Server className="scale-icon" size={46} />
            <div>
              <strong>Built for scale</strong>
              <span>Distributed rate limiting for modern applications.</span>
            </div>
            <div className="wave one" />
            <div className="wave two" />
          </div>
        </section>

        {message && <div className="notice">{message}</div>}

        <section id="overview" className="metrics-grid">
          <Metric tone="blue" icon={<Activity />} label="Total Requests" value={stats.requests} />
          <Metric tone="green" icon={<ShieldCheck />} label="Allowed Requests" value={stats.allowed} />
          <Metric tone="red" icon={<Ban />} label="Rejected Requests" value={stats.rejected} />
        </section>

        <section className="panel chart-panel">
          <div className="panel-heading">
            <div className="heading-left">
              <span className="icon-badge"><Sparkles size={22} /></span>
              <div>
                <h2>Traffic Shape</h2>
                <p>Simulated traffic pattern based on active policy limits.</p>
              </div>
            </div>
            <div className="segments">
              <button className="active">1m</button>
              <button>5m</button>
              <button>15m</button>
              <button>1h</button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="trafficFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563ff" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#2563ff" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#d7e1ef" />
              <XAxis dataKey="t" tickLine={false} axisLine={{ stroke: '#b9c6d8' }} />
              <YAxis tickLine={false} axisLine={{ stroke: '#b9c6d8' }} width={36} />
              <Tooltip />
              <Area type="monotone" dataKey="requests" stroke="#1d63ff" fill="url(#trafficFill)" strokeWidth={3} />
              <Area type="monotone" dataKey="rejected" stroke="#ef4444" fill="#fee2e2" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </section>

        <section className="split-grid">
          <section id="keys" className="panel">
            <div className="panel-heading compact">
              <div className="heading-left">
                <span className="icon-badge"><KeyRound size={22} /></span>
                <div>
                  <h2>API Keys</h2>
                  <p>Create and manage API keys for your applications.</p>
                </div>
              </div>
              <button onClick={createKey} className="primary-action" title="Add key"><Plus size={17} /> Add Key</button>
            </div>
            <form onSubmit={createKey} className="key-form">
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
                    <button className="danger-icon" onClick={() => revokeKey(key.id)} title="Revoke key"><Trash2 size={15} /></button>
                  </div>
                ))}
              </div>
            )}
          </section>

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
            <form onSubmit={createPolicy} className="policy-form">
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
                  <button className="danger-icon" onClick={() => deletePolicy(policy.id)} title="Delete policy"><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
          </section>
        </section>

        <section id="tester" className="panel tester">
          <div className="heading-left">
            <span className="icon-badge"><Send size={22} /></span>
            <div>
              <h2>Request Tester</h2>
              <p>Call the protected demo endpoint and see rate-limit headers.</p>
            </div>
          </div>
          <button onClick={testRequest} className="send-button"><Play size={16} /> Send request</button>
          {testResult && <pre>{JSON.stringify(testResult, null, 2)}</pre>}
        </section>
      </section>
    </main>
  )
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <Zap size={36} />
        <div>
          <strong>RateX</strong>
          <span>API Rate Limiting</span>
        </div>
      </div>
      <nav>
        <a className="active" href="#overview"><Activity size={20} /> Overview</a>
        <a href="#keys"><KeyRound size={20} /> API Keys</a>
        <a href="#policies"><Shield size={20} /> Policies</a>
        <a href="#tester"><Terminal size={20} /> Playground</a>
        <a href="#docs"><BookOpen size={20} /> Documentation</a>
      </nav>
      <div className="connection">
        <span className="dot" />
        <div>
          <strong>Redis Connected</strong>
          <small>All systems operational</small>
        </div>
      </div>
    </aside>
  )
}

function Topbar({ onRefresh }) {
  return (
    <div className="topbar">
      <button className="ghost" onClick={onRefresh} title="Refresh data"><RefreshCcw size={18} /></button>
      <button className="ghost" title="Theme"><Sun size={18} /></button>
      <div className="profile">
        <span>RU</span>
        <div>
          <strong>Rensith</strong>
          <small>Admin</small>
        </div>
        <ChevronDown size={18} />
      </div>
    </div>
  )
}

function Metric({ icon, label, value, tone }) {
  return (
    <article className={`metric ${tone}`}>
      <span className="metric-icon">{icon}</span>
      <div>
        <p>{label}</p>
        <strong>{Number(value || 0).toLocaleString()}</strong>
        <small><Zap size={12} /> 0% <em>vs last 1 minute</em></small>
      </div>
      <MiniBars tone={tone} />
    </article>
  )
}

function MiniBars({ tone }) {
  return (
    <div className={`mini-bars ${tone}`} aria-hidden="true">
      {[35, 58, 82, 100, 72, 88].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
