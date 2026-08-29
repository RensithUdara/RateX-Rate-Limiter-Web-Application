import React from 'react'
import { Activity, BookOpen, KeyRound, Route, Shield, Terminal, Zap } from 'lucide-react'

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <Zap size={36} />
        <div>
          <strong>RateX</strong>
          <span>API Rate Limiting</span>
        </div>
      </div>
      <nav>
        <a className="active" href="#overview"><Activity size={20} /> Overview</a>
        <a href="#keys"><KeyRound size={20} /> API Keys</a>
        <a href="#policies"><Shield size={20} /> Policies</a>
        <a href="#routes"><Route size={20} /> Routes</a>
        <a href="#tester"><Terminal size={20} /> Playground</a>
        <a href="#docs"><BookOpen size={20} /> Documentation</a>
      </nav>
      <div className="connection">
        <span className="dot" />
        <div>
          <strong>Backend Connected</strong>
          <small>Telemetry enabled</small>
        </div>
      </div>
    </aside>
  )
}
