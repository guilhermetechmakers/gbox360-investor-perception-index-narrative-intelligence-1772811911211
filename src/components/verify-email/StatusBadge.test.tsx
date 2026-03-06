import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from './StatusBadge'

describe('StatusBadge', () => {
  it('renders sent status', () => {
    render(<StatusBadge status="sent" />)
    expect(screen.getByText('Sent')).toBeInTheDocument()
  })

  it('renders delivered status', () => {
    render(<StatusBadge status="delivered" />)
    expect(screen.getByText('Delivered')).toBeInTheDocument()
  })

  it('renders bounced status', () => {
    render(<StatusBadge status="bounced" />)
    expect(screen.getByText('Bounced')).toBeInTheDocument()
  })

  it('renders unknown status', () => {
    render(<StatusBadge status="unknown" />)
    expect(screen.getByText('Unknown')).toBeInTheDocument()
  })

  it('has accessible label', () => {
    render(<StatusBadge status="sent" />)
    expect(screen.getByLabelText('Verification status: Sent')).toBeInTheDocument()
  })
})
