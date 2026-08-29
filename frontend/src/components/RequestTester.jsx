import React, { useMemo, useState } from 'react'
import { CheckCircle2, Clock, Code2, Copy, FileText, Lightbulb, Play, Send } from 'lucide-react'
import { copyText } from '../utils/clipboard.js'

export function RequestTester({ result, onSend }) {
  const [method, setMethod] = useState('GET')
  const [url, setUrl] = useState('http://localhost:8081/v1/products')
  const [activeTab, setActiveTab] = useState('response')

  const displayResult = result || {
    status: 200,
    statusText: 'OK',
    limit: 100,
    remaining: 90,
    retryAfter: null,
    durationMs: 324,
    sizeBytes: 512,
    body: {
      data: {
        products: [
          { id: 'prod_001', name: 'Wireless API', price: 19 },
          { id: 'prod_002', name: 'RateX Pro', price: 29 },
        ],
      },
    },
  }

  const tabContent = useMemo(() => {
    const headers = {
      'X-RateLimit-Limit': displayResult.limit,
      'X-RateLimit-Remaining': displayResult.remaining,
      'Retry-After': displayResult.retryAfter,
    }
    const curl = `curl -X ${method} "${url}" -H "X-API-Key: YOUR_API_KEY"`
    const tabs = {
      response: JSON.stringify(displayResult.body ?? displayResult, null, 2),
      headers: JSON.stringify(headers, null, 2),
      rate: JSON.stringify({
        status: displayResult.status,
        limit: displayResult.limit,
        remaining: displayResult.remaining,
        retryAfter: displayResult.retryAfter || 'not limited',
      }, null, 2),
      curl,
    }
    return tabs[activeTab]
  }, [activeTab, displayResult, method, url])

  function trySample(nextMethod, nextUrl) {
    setMethod(nextMethod)
    setUrl(`http://localhost:8081${nextUrl}`)
  }

  const ok = displayResult.status >= 200 && displayResult.status < 300

  return (
    <section className="playground-grid">
      <section id="tester" className="panel tester-console">
        <div className="panel-heading">
          <div className="heading-left">
            <span className="icon-badge"><Send size={22} /></span>
            <div>
              <h2>Request Tester</h2>
              <p>Call the protected demo endpoint and see rate-limit headers.</p>
            </div>
          </div>
        </div>
        <div className="request-line">
          <select value={method} onChange={(event) => setMethod(event.target.value)}>
            {['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].map((item) => <option key={item}>{item}</option>)}
          </select>
          <input value={url} onChange={(event) => setUrl(event.target.value)} />
          <button type="button" onClick={() => onSend(method, url)} className="send-button"><Send size={16} /> Send request</button>
        </div>
        <div className="response-tabs">
          <Tab id="response" activeTab={activeTab} onChange={setActiveTab}>Response</Tab>
          <Tab id="headers" activeTab={activeTab} onChange={setActiveTab}>Headers</Tab>
          <Tab id="rate" activeTab={activeTab} onChange={setActiveTab}>Rate Limit</Tab>
          <Tab id="curl" activeTab={activeTab} onChange={setActiveTab}>cURL</Tab>
          <span className={ok ? 'ok-status' : 'error-status'}><CheckCircle2 size={15} /> {displayResult.status} {displayResult.statusText || ''}</span>
          <span><Clock size={15} /> {displayResult.durationMs || 0} ms</span>
          <span><FileText size={15} /> {displayResult.sizeBytes || 0} B</span>
        </div>
        <pre className="code-window"><button className="copy-code" type="button" onClick={() => copyText(tabContent)}><Copy size={15} /> Copy</button>{tabContent}</pre>
      </section>

      <aside className="playground-side">
        <section className="panel">
          <div className="heading-left">
            <span className="icon-badge"><Code2 size={22} /></span>
            <div>
              <h2>Example Requests</h2>
              <p>Try these sample requests.</p>
            </div>
          </div>
          <div className="sample-list">
            <Sample method="GET" route="/v1/products" text="Test rate limiting" onTry={trySample} />
            <Sample method="GET" route="/v1/products?page=1" text="Test with query params" onTry={trySample} />
            <Sample method="POST" route="/v1/products" text="Test different method" tone="purple" onTry={trySample} />
          </div>
        </section>
        <section className="panel checklist-card">
          <div className="heading-left">
            <span className="icon-badge"><Lightbulb size={22} /></span>
            <div>
              <h2>What to Look For</h2>
              <p>Check these in the response.</p>
            </div>
          </div>
          {['HTTP status code (200, 429, etc.)', 'Rate limit headers (X-RateLimit-*)', 'Remaining requests count', 'Retry-After header (if limited)', 'Response time and payload'].map((item) => (
            <span className="check-item" key={item}><CheckCircle2 size={16} /> {item}</span>
          ))}
        </section>
      </aside>
    </section>
  )
}

function Tab({ id, activeTab, onChange, children }) {
  return <button type="button" className={activeTab === id ? 'active' : ''} onClick={() => onChange(id)}>{children}</button>
}

function Sample({ method, route, text, tone = 'green', onTry }) {
  return (
    <div className="sample-request">
      <mark className={`method-badge ${tone}`}>{method}</mark>
      <div>
        <strong>{route}</strong>
        <small>{text}</small>
      </div>
      <button className="secondary-action compact-action" type="button" onClick={() => onTry(method, route)}><Play size={13} /> Try</button>
    </div>
  )
}
