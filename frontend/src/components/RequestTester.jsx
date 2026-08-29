import React from 'react'
import { Play, Send } from 'lucide-react'

export function RequestTester({ result, onSend }) {
  return (
    <section id="tester" className="panel tester">
      <div className="heading-left">
        <span className="icon-badge"><Send size={22} /></span>
        <div>
          <h2>Request Tester</h2>
          <p>Call the protected demo endpoint and see rate-limit headers.</p>
        </div>
      </div>
      <button onClick={onSend} className="send-button"><Play size={16} /> Send request</button>
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </section>
  )
}
