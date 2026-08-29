import React, { useEffect, useMemo, useState } from 'react'
import {
  createKey,
  createPolicy,
  createRoutePolicy,
  deletePolicy,
  deleteRoutePolicy,
  getEvents,
  getKeys,
  getPolicies,
  getRoutePolicies,
  getStats,
  getTimeline,
  getTopRoutes,
  revokeKey,
  sendDemoRequest,
} from './api.js'
import { EventsPanel } from './components/EventsPanel.jsx'
import { Sidebar } from './components/Sidebar.jsx'
import { Topbar } from './components/Topbar.jsx'
import { AnalyticsPage } from './pages/AnalyticsPage.jsx'
import { DocsPage } from './pages/DocsPage.jsx'
import { KeysPage } from './pages/KeysPage.jsx'
import { OverviewPage } from './pages/OverviewPage.jsx'
import { PlaygroundPage } from './pages/PlaygroundPage.jsx'
import { PoliciesPage } from './pages/PoliciesPage.jsx'
import { RoutesPage } from './pages/RoutesPage.jsx'

export function App() {
  const [stats, setStats] = useState({ requests: 0, allowed: 0, rejected: 0 })
  const [timeline, setTimeline] = useState([])
  const [topRoutes, setTopRoutes] = useState([])
  const [events, setEvents] = useState([])
  const [policies, setPolicies] = useState([])
  const [routePolicies, setRoutePolicies] = useState([])
  const [keys, setKeys] = useState([])
  const [createdKey, setCreatedKey] = useState('')
  const [message, setMessage] = useState('')
  const [testResult, setTestResult] = useState(null)
  const [currentPage, setCurrentPage] = useState('overview')
  const [newPolicy, setNewPolicy] = useState({ name: '', algorithm: 'token_bucket', request_limit: 100, window_seconds: 60, burst_capacity: 100 })
  const [newKey, setNewKey] = useState({ name: 'Demo application', policy_id: '' })
  const [newRoute, setNewRoute] = useState({ method: 'GET', route_pattern: '/v1/products', policy_id: '' })

  const chartData = useMemo(() => {
    if (timeline.length > 0) {
      return timeline.map((point) => ({
        t: new Date(point.bucket).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        allowed: point.allowed,
        rejected: point.rejected,
      }))
    }
    return Array.from({ length: 12 }, (_, index) => {
      const wave = index < 2 ? 0 : index < 5 ? 1 : index < 7 ? 0 : index < 10 ? 1 : 0
      return { t: `${index * 5}s`, allowed: wave, rejected: 0 }
    })
  }, [timeline])

  async function load() {
    const [statsData, policyData, keyData, eventData, routeData, topRouteData, timelineData] = await Promise.all([
      getStats(),
      getPolicies(),
      getKeys(),
      getEvents(30),
      getRoutePolicies(),
      getTopRoutes(),
      getTimeline(),
    ])
    setStats(statsData)
    setPolicies(policyData)
    setKeys(keyData)
    setEvents(eventData)
    setRoutePolicies(routeData)
    setTopRoutes(topRouteData)
    setTimeline(timelineData)
    if (!newKey.policy_id && policyData[0]) setNewKey((value) => ({ ...value, policy_id: policyData[0].id }))
    if (!newRoute.policy_id && policyData[0]) setNewRoute((value) => ({ ...value, policy_id: policyData[0].id }))
  }

  useEffect(() => {
    load().catch((error) => setMessage(error.message))
    const timer = setInterval(() => load().catch(() => {}), 5000)
    return () => clearInterval(timer)
  }, [])

  async function handleCreatePolicy(event) {
    event.preventDefault()
    try {
      await createPolicy(newPolicy)
      setMessage('Policy created')
      setNewPolicy({ name: '', algorithm: 'token_bucket', request_limit: 100, window_seconds: 60, burst_capacity: 100 })
      await load()
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function handleCreateKey(event) {
    event.preventDefault()
    try {
      const data = await createKey(newKey)
      setCreatedKey(data.key)
      setMessage('API key created')
      await load()
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function handleCreateRoutePolicy(event) {
    event.preventDefault()
    try {
      await createRoutePolicy(newRoute)
      setMessage('Route policy attached')
      await load()
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function handleSendRequest() {
    try {
      setTestResult(await sendDemoRequest(createdKey))
      await load()
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function action(fn) {
    try {
      await fn()
      await load()
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <main className="shell">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <section className="workspace">
        <Topbar onRefresh={load} />

        {message && <div className="notice">{message}</div>}

        {currentPage === 'overview' && <OverviewPage stats={stats} chartData={chartData} events={events} topRoutes={topRoutes} />}
        {currentPage === 'keys' && <KeysPage keys={keys} policies={policies} newKey={newKey} setNewKey={setNewKey} createdKey={createdKey} onCreate={handleCreateKey} onRevoke={(id) => action(() => revokeKey(id))} />}
        {currentPage === 'policies' && <PoliciesPage policies={policies} newPolicy={newPolicy} setNewPolicy={setNewPolicy} onCreate={handleCreatePolicy} onDelete={(id) => action(() => deletePolicy(id))} />}
        {currentPage === 'routes' && <RoutesPage routes={routePolicies} policies={policies} newRoute={newRoute} setNewRoute={setNewRoute} onCreate={handleCreateRoutePolicy} onDelete={(id) => action(() => deleteRoutePolicy(id))} />}
        {currentPage === 'analytics' && <AnalyticsPage chartData={chartData} events={events} topRoutes={topRoutes} />}
        {currentPage === 'playground' && <PlaygroundPage result={testResult} onSend={handleSendRequest} />}
        {currentPage === 'docs' && <DocsPage />}
      </section>
    </main>
  )
}
