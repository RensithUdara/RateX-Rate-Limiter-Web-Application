import React from 'react'
import { Activity, Ban, Server, ShieldCheck } from 'lucide-react'
import { Metric } from '../components/Metric.jsx'
import { TrafficChart } from '../components/TrafficChart.jsx'
import { EventsPanel } from '../components/EventsPanel.jsx'

export function OverviewPage({ stats, chartData, events, topRoutes, activeRange, onRangeChange }) {
  return (
    <div className="page-stack overview-page">
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
            <span>Route policies, telemetry, API keys, and live enforcement.</span>
          </div>
          <div className="wave one" />
          <div className="wave two" />
        </div>
      </section>

      <section className="metrics-grid">
        <Metric tone="blue" icon={<Activity />} label="Total Requests" value={stats.requests} />
        <Metric tone="green" icon={<ShieldCheck />} label="Allowed Requests" value={stats.allowed} />
        <Metric tone="red" icon={<Ban />} label="Rejected Requests" value={stats.rejected} />
      </section>

      <TrafficChart data={chartData} activeRange={activeRange} onRangeChange={onRangeChange} />
      <EventsPanel events={events.slice(0, 8)} topRoutes={topRoutes} />
    </div>
  )
}
