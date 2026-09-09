'use client'

import React, { FormEvent, useState } from 'react'

type Props = {
  buttonLabel?: string | null
  formID?: string
  placeholder?: string | null
  privacyNote?: string | null
}

export function NewsletterSignup({ buttonLabel, formID, placeholder, privacyNote }: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!formID) return
    setStatus('loading')

    try {
      const response = await fetch('/api/form-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form: formID,
          submissionData: [{ field: 'email', value: email }],
        }),
      })

      if (!response.ok) throw new Error('Subscription failed')
      setEmail('')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <form className="mt-4" onSubmit={submit}>
      <div className="flex gap-2">
        <label className="sr-only" htmlFor="newsletter-email">
          Email address
        </label>
        <input
          className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          id="newsletter-email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder={placeholder || 'Enter your email address'}
          required
          type="email"
          value={email}
        />
        <button
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          disabled={!formID || status === 'loading'}
          type="submit"
        >
          {status === 'loading' ? 'Sending…' : buttonLabel || 'Subscribe'}
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {status === 'success'
          ? 'Thanks! You are on the list.'
          : status === 'error'
            ? 'Something went wrong. Please try again.'
            : privacyNote}
      </p>
    </form>
  )
}
