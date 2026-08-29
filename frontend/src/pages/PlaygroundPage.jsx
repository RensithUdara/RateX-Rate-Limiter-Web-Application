import React from 'react'
import { Play } from 'lucide-react'
import { PageHero } from '../components/PageHero.jsx'
import { RequestTester } from '../components/RequestTester.jsx'

export function PlaygroundPage({ result, onSend }) {
  return (
    <div className="page-stack">
      <PageHero
        badge="Live testing"
        title="Playground"
        description="Send requests to the protected demo endpoint and inspect status codes plus rate limit headers."
        bannerIcon={<Play size={38} />}
        bannerTitle="Test rate limits in real time"
        bannerText="See how RateX responds with headers, limits, and status codes."
      />
      <RequestTester result={result} onSend={onSend} />
    </div>
  )
}
