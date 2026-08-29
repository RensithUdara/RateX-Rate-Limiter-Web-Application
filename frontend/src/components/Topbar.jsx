import React, { useRef } from 'react'
import { ChevronDown, RefreshCcw, Search } from 'lucide-react'

const placeholders = {
  overview: 'Search policies, keys, routes...',
  keys: 'Search policies, keys, routes...',
  policies: 'Search policies, keys, routes...',
  routes: 'Search routes, methods, paths...',
  analytics: 'Search anything...',
  playground: 'Search endpoints, keys, routes...',
  docs: 'Search documentation...',
}

export function Topbar({ currentPage, onRefresh }) {
  const searchRef = useRef(null)

  return (
    <div className="topbar">
      <label className="search-box">
        <Search size={20} />
        <input ref={searchRef} placeholder={placeholders[currentPage] || 'Search...'} />
        <kbd onClick={() => searchRef.current?.focus()}>Ctrl</kbd>
        <kbd onClick={() => searchRef.current?.focus()}>K</kbd>
      </label>
      <button className="ghost" onClick={onRefresh} title="Refresh data"><RefreshCcw size={18} /></button>
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
