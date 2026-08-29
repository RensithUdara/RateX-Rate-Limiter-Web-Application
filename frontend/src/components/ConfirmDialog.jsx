import React from 'react'
import { AlertTriangle, X } from 'lucide-react'

export function ConfirmDialog({ confirm, onCancel, onConfirm }) {
  if (!confirm) return null

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onCancel}>
      <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="dialog-close" type="button" onClick={onCancel} aria-label="Close confirmation"><X size={17} /></button>
        <span className="dialog-icon"><AlertTriangle size={24} /></span>
        <h2 id="confirm-title">{confirm.title}</h2>
        <p>{confirm.message}</p>
        <div className="dialog-actions">
          <button className="secondary-action compact-action" type="button" onClick={onCancel}>Cancel</button>
          <button className="danger-action compact-action" type="button" onClick={onConfirm}>{confirm.confirmText || 'Delete'}</button>
        </div>
      </section>
    </div>
  )
}
