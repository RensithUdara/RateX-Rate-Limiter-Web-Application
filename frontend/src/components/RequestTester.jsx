import React from 'react'
import { CheckCircle2, Clock, Code2, Copy, FileText, Lightbulb, Play, Send } from 'lucide-react'

export function RequestTester({ result, onSend }) {
  const displayResult = result || {
    status: 200,
    limit: 100,
    remaining: 90,
    retryAfter: null,
    body: {
      data: {
        products: [
          { id: 'prod_001', name: 'Wireless API', price: 19 },
          { id: 'prod_002', name: 'RateX Pro', price: 29 },
        ],
      },
    },
  }

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
          <select defaultValue="GET">
            <option>GET</option>
            <option>POST</option>
          </select>
          <input readOnly value="http://localhost:8081/v1/products" />
          <button onClick={onSend} className="send-button"><Send size={16} /> Send request</button>
        </div>
        <div className="response-tabs">
          <button className="active">Response</button>
          <button>Headers</button>
          <button>Rate Limit</button>
          <button>cURL</button>
          <span><CheckCircle2 size={15} /> {displayResult.status} OK</span>
          <span><Clock size={15} /> 324 ms</span>
          <span><FileText size={15} /> 512 B</span>
        </div>
        <pre className="code-window"><button className="copy-code" type="button"><Copy size={15} /> Copy</button>{JSON.stringify(displayResult, null, 2)}</pre>
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
            <Sample method="GET" route="/v1/products" text="Test rate limiting" />
            <Sample method="GET" route="/v1/products?page=1" text="Test with query params" />
            <Sample method="POST" route="/v1/products" text="Test different method" tone="purple" />
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

function Sample({ method, route, text, tone = 'green' }) {
  return (
    <div className="sample-request">
      <mark className={`method-badge ${tone}`}>{method}</mark>
      <div>
        <strong>{route}</strong>
        <small>{text}</small>
      </div>
      <button className="secondary-action compact-action" type="button"><Play size={13} /> Try</button>
    </div>
  )
}
