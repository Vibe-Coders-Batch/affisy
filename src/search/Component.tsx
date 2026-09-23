'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export const Search: React.FC<{ initialQuery: string }> = ({ initialQuery }) => {
  const [value, setValue] = useState(initialQuery)
  const [sourceQuery, setSourceQuery] = useState(initialQuery)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const router = useRouter()
  // Reset on a changed URL without remounting the input and losing keyboard focus.
  if (sourceQuery !== initialQuery) {
    setSourceQuery(initialQuery)
    setValue(initialQuery)
  }
  // Opening /search?q=... must not erase the query and cause a second navigation.
  useEffect(() => {
    clearTimeout(timer.current)
    return () => clearTimeout(timer.current)
  }, [initialQuery])

  const searchURL = (query: string) =>
    query.trim() ? `/search?${new URLSearchParams({ q: query.trim() })}` : '/search'

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          clearTimeout(timer.current)
          if (value.trim() !== initialQuery) router.replace(searchURL(value), { scroll: false })
        }}
      >
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <Input
          id="search"
          type="search"
          value={value}
          onChange={(event) => {
            const next = event.target.value
            setValue(next)
            clearTimeout(timer.current)
            timer.current = setTimeout(() => {
              if (next.trim() !== initialQuery) router.replace(searchURL(next), { scroll: false })
            }, 300)
          }}
          placeholder="Search"
        />
        <button type="submit" className="sr-only">
          submit
        </button>
      </form>
    </div>
  )
}
