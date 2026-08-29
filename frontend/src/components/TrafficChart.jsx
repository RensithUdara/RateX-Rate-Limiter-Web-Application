import React from 'react'
import { Sparkles } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const ranges = ['30m', '1h', '6h', '24h']

export function TrafficChart({ data, activeRange = '30m', onRangeChange = () => {} }) {
  return (
    <section className="panel chart-panel">
      <div className="panel-heading">
        <div className="heading-left">
          <span className="icon-badge"><Sparkles size={22} /></span>
          <div>
            <h2>Traffic Shape</h2>
            <p>Live request timeline from backend telemetry.</p>
          </div>
        </div>
        <div className="segments">
          {ranges.map((range) => (
            <button
              className={activeRange === range ? 'active' : ''}
              key={range}
              onClick={() => onRangeChange(range)}
              type="button"
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={230}>
        <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
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
          <Area type="monotone" dataKey="allowed" stroke="#1d63ff" fill="url(#trafficFill)" strokeWidth={3} />
          <Area type="monotone" dataKey="rejected" stroke="#ef4444" fill="#fee2e2" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </section>
  )
}
