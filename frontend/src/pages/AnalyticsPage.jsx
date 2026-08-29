import React from 'react'
import { TrafficChart } from '../components/TrafficChart.jsx'
import { EventsPanel } from '../components/EventsPanel.jsx'

export function AnalyticsPage({ chartData, events, topRoutes }) {
  return (
    <div className="page-stack">
      <section className="page-header">
        <span className="pill">Observability</span>
        <h1>Analytics</h1>
        <p>Inspect request history, rejected traffic, and the busiest protected routes.</p>
      </section>
      <TrafficChart data={chartData} />
      <EventsPanel events={events} topRoutes={topRoutes} />
    </div>
  )
}
