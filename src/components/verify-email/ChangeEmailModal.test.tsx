import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ChangeEmailModal } from './ChangeEmailModal'

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  })
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('ChangeEmailModal', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('renders with current email', () => {
    render(
      <ChangeEmailModal
        open={true}
        onOpenChange={() => {}}
        currentEmail="user@example.com"
      />,
      { wrapper }
    )
    expect(screen.getByText(/Current: user@example.com/)).toBeInTheDocument()
  })

  it('shows validation error for empty email', async () => {
    const user = userEvent.setup()
    render(
      <ChangeEmailModal
        open={true}
        onOpenChange={() => {}}
        currentEmail="old@example.com"
      />,
      { wrapper }
    )
    await user.click(screen.getByRole('button', { name: /Update & send verification/ }))
    await waitFor(() => {
      expect(screen.getByText(/Email required/)).toBeInTheDocument()
    })
  })

  it('handles null/empty currentEmail', () => {
    render(
      <ChangeEmailModal
        open={true}
        onOpenChange={() => {}}
        currentEmail=""
      />,
      { wrapper }
    )
    expect(screen.getByText(/Current: —/)).toBeInTheDocument()
  })
})
