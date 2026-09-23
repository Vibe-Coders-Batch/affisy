import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { Search } from '@/search/Component'

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }))
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  replace.mockClear()
})

describe('Search navigation', () => {
  it('keeps the incoming query without navigating again on mount', () => {
    vi.useFakeTimers()
    render(createElement(Search, { initialQuery: 'review' }))
    expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('review')
    act(() => vi.advanceTimersByTime(1000))
    expect(replace).not.toHaveBeenCalled()
  })
  it('debounces typing and safely encodes query characters', () => {
    vi.useFakeTimers()
    render(createElement(Search, { initialQuery: '' }))
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'kn' } })
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'knife & set' } })
    act(() => vi.advanceTimersByTime(300))
    expect(replace).toHaveBeenCalledExactlyOnceWith('/search?q=knife+%26+set', { scroll: false })
  })
  it('updates from navigation and cancels a pending typed query on back/forward', () => {
    vi.useFakeTimers()
    const view = render(createElement(Search, { initialQuery: 'knife' }))
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'cookbook' } })
    view.rerender(createElement(Search, { initialQuery: 'review' }))
    act(() => vi.advanceTimersByTime(300))
    expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('review')
    expect(replace).not.toHaveBeenCalled()
  })
  it('submits immediately without a duplicate delayed navigation', () => {
    vi.useFakeTimers()
    render(createElement(Search, { initialQuery: '' }))
    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'dinners' } })
    fireEvent.submit(input.closest('form')!)
    act(() => vi.advanceTimersByTime(1000))
    expect(replace).toHaveBeenCalledExactlyOnceWith('/search?q=dinners', { scroll: false })
  })
})
