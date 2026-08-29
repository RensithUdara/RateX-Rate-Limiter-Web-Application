import React from 'react'
import { ListFilter } from 'lucide-react'

export function EventsPanel({ events, topRoutes }) {
  return (
    <section className="split-grid">
      <section className="panel">
        <div className="panel-heading compact">
          <div className="heading-left">
            <span className="icon-badge"><ListFilter size={22} /></span>
            <div>
              <h2>Recent Requests</h2>
              <p>Latest protected endpoint decisions.</p>
            </div>
          </div>
        </div>
        <div className="event-list">
          {events.map((event) => (
            <div className="event-item" key={event.id}>
              <span className={event.allowed ? 'status allowed' : 'status rejected'}>{event.allowed ? 'Allowed' : 'Rejected'}</span>
              <strong>{event.method} {event.route}</strong>
              <small>{event.identity_type} {event.identity_value} | {event.policy_name} | {event.duration_ms}ms</small>
            </div>
          ))}
          {events.length === 0 && <div className="empty-state slim">No request events yet.</div>}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading compact">
          <div className="heading-left">
            <span className="icon-badge"><ListFilter size={22} /></span>
            <div>
              <h2>Top Routes</h2>
              <p>Most active routes in the last hour.</p>
            </div>
          </div>
        </div>
        <div className="table route-usage">
          <div className="table-head usage-head">
            <span>Route</span>
            <span>Allowed</span>
            <span>Rejected</span>
            <span>Total</span>
          </div>
          {topRoutes.map((route) => (
            <div className="row usage-row" key={route.route}>
              <span>{route.route}</span>
              <span>{route.allowed}</span>
              <span>{route.rejected}</span>
              <span>{route.total}</span>
            </div>
          ))}
        </div>
      </section>
    </section>
  )
}
