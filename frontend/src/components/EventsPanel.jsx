import React from 'react'
import { ArrowRight, BarChart3, Database, FileText, Trophy } from 'lucide-react'

export function EventsPanel({ events, topRoutes, onViewAllRequests, onViewAllRoutes }) {
  return (
    <section className="split-grid">
      <section className="panel">
        <div className="panel-heading compact">
          <div className="heading-left">
            <span className="icon-badge"><Database size={22} /></span>
            <div>
              <h2>Recent Requests</h2>
              <p>Latest protected endpoint decisions.</p>
            </div>
          </div>
          <button className="secondary-action compact-action" type="button" onClick={onViewAllRequests}>View all <ArrowRight size={15} /></button>
        </div>
        <div className="event-list">
          {events.map((event) => (
            <div className="event-item" key={event.id}>
              <span className={event.allowed ? 'status allowed' : 'status rejected'}>{event.allowed ? 'Allowed' : 'Rejected'}</span>
              <strong>{event.method} {event.route}</strong>
              <small>{event.identity_type} {event.identity_value} | {event.policy_name} | {event.duration_ms}ms</small>
            </div>
          ))}
          {events.length === 0 && (
            <div className="empty-state slim">
              <FileText size={30} />
              <span>No request events yet.</span>
              <small>Requests will appear here once traffic is received.</small>
            </div>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading compact">
          <div className="heading-left">
            <span className="icon-badge"><Trophy size={22} /></span>
            <div>
              <h2>Top Routes</h2>
              <p>Most active routes in the last hour.</p>
            </div>
          </div>
          <button className="secondary-action compact-action" type="button" onClick={onViewAllRoutes || onViewAllRequests}>View all <ArrowRight size={15} /></button>
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
          {topRoutes.length === 0 && (
            <div className="empty-state slim">
              <BarChart3 size={30} />
              <span>No route data yet.</span>
              <small>Top routes will appear here once traffic is received.</small>
            </div>
          )}
        </div>
      </section>
    </section>
  )
}
