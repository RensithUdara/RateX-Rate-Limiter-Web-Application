import React from 'react'
import { Activity, BarChart3, BookOpen, KeyRound, Route, Shield, Terminal, Zap } from 'lucide-react'

const items = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'keys', label: 'API Keys', icon: KeyRound },
  { id: 'policies', label: 'Policies', icon: Shield },
  { id: 'routes', label: 'Routes', icon: Route },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'playground', label: 'Playground', icon: Terminal },
  { id: 'docs', label: 'Documentation', icon: BookOpen },
]

export function Sidebar({ currentPage, onNavigate }) {
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
        {items.map((item) => {
          const Icon = item.icon
          return (
            <button
              className={currentPage === item.id ? 'active' : ''}
              key={item.id}
              onClick={() => onNavigate(item.id)}
              type="button"
            >
              <Icon size={20} /> {item.label}
            </button>
          )
        })}
      </nav>
      <div className="connection">
        <span className="dot" />
        <div>
          <strong>Backend Connected</strong>
          <small>Telemetry enabled</small>
        </div>
      </div>
    </aside>
  )
}
