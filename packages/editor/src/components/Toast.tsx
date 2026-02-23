import React, { useEffect, useState } from 'react'

export interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
}

interface ToastProps {
  toast: ToastMessage
  onClose: (id: string) => void
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      // Wait for animation to finish before removing
      setTimeout(() => onClose(toast.id), 300)
    }, toast.duration || 3000)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onClose])

  const bgColor =
    toast.type === 'success'
      ? 'var(--color-success)'
      : toast.type === 'error'
        ? 'var(--color-error)'
        : 'var(--color-primary)'

  const style: React.CSSProperties = {
    backgroundColor: 'var(--bg-elevated)',
    borderLeft: `4px solid ${bgColor}`,
    padding: 'var(--space-md)',
    borderRadius: 'var(--radius-sm)',
    boxShadow: 'var(--shadow-md)',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    minWidth: '250px',
    marginBottom: 'var(--space-sm)',
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    pointerEvents: 'auto',
  }

  return (
    <div style={style}>
      <span style={{ fontSize: '1.2em' }}>
        {toast.type === 'success' ? '✅' : toast.type === 'error' ? '⚠' : 'ℹ'}
      </span>
      <span>{toast.message}</span>
    </div>
  )
}
