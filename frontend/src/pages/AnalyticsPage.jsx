import React from 'react'
import { Activity, Ban, CalendarDays, Clock, ShieldCheck } from 'lucide-react'
import { Metric } from '../components/Metric.jsx'
import { TrafficChart } from '../components/TrafficChart.jsx'
import { EventsPanel } from '../components/EventsPanel.jsx'

export function AnalyticsPage({ stats, chartData, events, topRoutes, activeRange, onRangeChange, onLoadMore }) {
  return (
    <div className="page-stack">
      <section className="analytics-heading">
        <section className="page-header">
          <span className="pill">Observability</span>
          <h1>Analytics</h1>
          <p>Inspect request history, rejected traffic, and the busiest protected routes.</p>
        </section>
        <div className="range-select">
          <button className="secondary-action" type="button" onClick={() => onRangeChange(activeRange === '30m' ? '1h' : activeRange === '1h' ? '6h' : activeRange === '6h' ? '24h' : '30m')}><CalendarDays size={16} /> Last {activeRange === '30m' ? '30 minutes' : activeRange}</button>
          <small>Showing data for the selected range.</small>
        </div>
      </section>
      <section className="metrics-grid analytics-metrics">
        <Metric tone="blue" icon={<Activity />} label="Total Requests" value={stats.requests} />
        <Metric tone="green" icon={<ShieldCheck />} label="Allowed Requests" value={stats.allowed} />
        <Metric tone="red" icon={<Ban />} label="Rejected Requests" value={stats.rejected} />
        <Metric tone="purple" icon={<Clock />} label="Avg. Response Time" value="0 ms" />
      </section>
      <TrafficChart data={chartData} activeRange={activeRange} onRangeChange={onRangeChange} />
      <EventsPanel events={events} topRoutes={topRoutes} onViewAllRequests={onLoadMore} />
    </div>
  )
}
