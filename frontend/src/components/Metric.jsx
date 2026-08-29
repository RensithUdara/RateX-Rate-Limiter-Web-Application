import React from 'react'
import { Zap } from 'lucide-react'

export function Metric({ icon, label, value, tone }) {
  return (
    <article className={`metric ${tone}`}>
      <span className="metric-icon">{icon}</span>
      <div>
        <p>{label}</p>
        <strong>{Number(value || 0).toLocaleString()}</strong>
        <small><Zap size={12} /> live <em>last session</em></small>
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
