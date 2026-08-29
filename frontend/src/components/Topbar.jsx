import React from 'react'
import { ChevronDown, RefreshCcw, Sun } from 'lucide-react'

export function Topbar({ onRefresh }) {
  return (
    <div className="topbar">
      <button className="ghost" onClick={onRefresh} title="Refresh data"><RefreshCcw size={18} /></button>
      <button className="ghost" title="Theme"><Sun size={18} /></button>
      <div className="profile">
        <span>RU</span>
        <div>
          <strong>Rensith</strong>
          <small>Admin</small>
        </div>
        <ChevronDown size={18} />
      </div>
    </div>
  )
}
