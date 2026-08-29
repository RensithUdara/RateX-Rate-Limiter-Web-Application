import React from 'react'
import { RequestTester } from '../components/RequestTester.jsx'

export function PlaygroundPage({ result, onSend }) {
  return (
    <div className="page-stack">
      <section className="page-header">
        <span className="pill">Live testing</span>
        <h1>Playground</h1>
        <p>Send requests to the protected demo endpoint and inspect status codes plus rate limit headers.</p>
      </section>
      <RequestTester result={result} onSend={onSend} />
    </div>
  )
}
