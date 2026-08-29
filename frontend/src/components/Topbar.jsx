import React, { useRef } from 'react'
import { Bell, ChevronDown, RefreshCcw, Search, Sun } from 'lucide-react'

const placeholders = {
  overview: 'Search policies, keys, routes...',
  keys: 'Search policies, keys, routes...',
  policies: 'Search policies, keys, routes...',
  routes: 'Search routes, methods, paths...',
  analytics: 'Search anything...',
  playground: 'Search endpoints, keys, routes...',
  docs: 'Search documentation...',
}

export function Topbar({ currentPage, onRefresh, onNotify }) {
  const searchRef = useRef(null)

  function toggleTheme() {
    document.body.classList.toggle('soft-contrast')
    onNotify?.('Theme preference updated')
  }

  return (
    <div className="topbar">
      <label className="search-box">
        <Search size={20} />
        <input ref={searchRef} placeholder={placeholders[currentPage] || 'Search...'} />
        <kbd onClick={() => searchRef.current?.focus()}>Ctrl</kbd>
        <kbd onClick={() => searchRef.current?.focus()}>K</kbd>
      </label>
      <button className="ghost" onClick={onRefresh} title="Refresh data"><RefreshCcw size={18} /></button>
      <button className="ghost" type="button" onClick={toggleTheme} title="Theme"><Sun size={18} /></button>
      <button className="ghost" type="button" onClick={() => onNotify?.('No new notifications')} title="Notifications"><Bell size={18} /></button>
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
