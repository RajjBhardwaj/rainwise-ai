/**
 * ReviewsSection.jsx — Live user-submitted reviews (Feature: Task 2)
 *
 * Fetches reviews from GET /api/reviews on mount.
 * Lets users submit a new review via a collapsible form → POST /api/reviews.
 *
 * On successful submit:
 *  - New review is prepended to the list immediately (optimistic local state)
 *  - Form is cleared and collapsed
 *
 * On backend error:
 *  - Error message shown inline; form stays open so the user can retry
 *
 * No new dependencies — uses existing axios client.
 */

import { useState, useEffect } from 'react'
import { getReviews, submitReview } from '../api/client'

// ---------------------------------------------------------------------------
// Star rating selector
// ---------------------------------------------------------------------------
function StarSelector({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-2xl transition-transform hover:scale-110 ${
            star <= value ? 'text-amber-400' : 'text-slate-600'
          }`}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Single review card
// ---------------------------------------------------------------------------
function ReviewCard({ review }) {
  const initials = review.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  // Format date: "Sep 2026"
  const dateLabel = review.created_at
    ? new Date(review.created_at).toLocaleDateString('en-IN', {
        month: 'short',
        year: 'numeric',
      })
    : ''

  return (
    <div className="bg-[var(--color-bg-tint)] rounded-2xl p-5 border border-[var(--color-border)]">
      {/* Stars */}
      <div className="text-amber-400 text-sm mb-3">
        {'★'.repeat(review.rating)}
        <span className="text-slate-600">{'★'.repeat(5 - review.rating)}</span>
      </div>

      {/* Message */}
      <p className="text-slate-200 text-sm leading-relaxed mb-4">
        &ldquo;{review.message}&rdquo;
      </p>

      {/* Author row */}
      <div className="flex items-center gap-3 pt-3 border-t border-slate-700">
        <div className="w-9 h-9 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
          {initials}
        </div>
        <div>
          <div className="text-white font-medium text-sm">{review.name}</div>
          {review.location && (
            <div className="text-slate-500 text-xs">{review.location}</div>
          )}
        </div>
        {dateLabel && (
          <div className="ml-auto text-slate-600 text-xs">{dateLabel}</div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Submit form
// ---------------------------------------------------------------------------
const EMPTY_FORM = { name: '', location: '', message: '', rating: 5 }

function ReviewForm({ onSubmitted }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (form.message.trim().length < 10) {
      setError('Review must be at least 10 characters.')
      return
    }

    setSubmitting(true)
    try {
      const saved = await submitReview({
        name: form.name.trim(),
        location: form.location.trim(),
        message: form.message.trim(),
        rating: form.rating,
      })
      setForm(EMPTY_FORM)
      onSubmitted(saved)
    } catch (err) {
      const detail =
        err.response?.data?.detail || err.message || 'Could not submit review.'
      setError(detail)
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full bg-slate-900 text-white border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-accent)] transition'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1.5">
            Your name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={100}
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Anita Sharma"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1.5">
            City / region <span className="text-slate-600">(optional)</span>
          </label>
          <input
            type="text"
            maxLength={100}
            value={form.location}
            onChange={(e) => set('location', e.target.value)}
            placeholder="e.g. Dombivli, Maharashtra"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1.5">Rating</label>
        <StarSelector value={form.rating} onChange={(r) => set('rating', r)} />
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1.5">
          Your experience <span className="text-red-400">*</span>
        </label>
        <textarea
          required
          minLength={10}
          maxLength={1000}
          rows={4}
          value={form.message}
          onChange={(e) => set('message', e.target.value)}
          placeholder="Tell us how rainwater harvesting worked for you — savings, system size, impact on your household or farm…"
          className={`${inputClass} resize-none`}
        />
        <div className="text-xs text-slate-600 mt-1 text-right">
          {form.message.length} / 1000
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-2.5 text-sm text-red-300">
          ❌ {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !form.name.trim()}
        className="bg-[var(--color-accent)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition"
      >
        {submitting ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function ReviewsSection() {
  const [reviews, setReviews] = useState([])
  const [fetchState, setFetchState] = useState('loading') // 'loading' | 'ok' | 'error'
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    getReviews()
      .then((data) => {
        setReviews(data)
        setFetchState('ok')
      })
      .catch(() => setFetchState('error'))
  }, [])

  function handleNewReview(savedReview) {
    // Prepend the new review so it appears first without a full refetch
    setReviews((prev) => [savedReview, ...prev])
    setShowForm(false)
  }

  return (
    <section className="mt-10">
      {/* Section header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">💬 Community Reviews</h2>
          <p className="text-slate-400 text-sm mt-1">
            Real experiences from homeowners, farmers, and societies.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-accent)] hover:bg-[var(--color-bg-tint)] transition"
        >
          {showForm ? '✕ Cancel' : '✏️ Share your story'}
        </button>
      </div>

      {/* Collapsible submit form */}
      {showForm && (
        <div className="bg-[var(--color-bg-tint)] rounded-2xl p-6 border border-[var(--color-border)] mb-6">
          <h3 className="font-semibold text-white mb-4">Write a review</h3>
          <ReviewForm onSubmitted={handleNewReview} />
        </div>
      )}

      {/* Review list */}
      {fetchState === 'loading' && (
        <div className="text-slate-500 text-sm">Loading reviews…</div>
      )}

      {fetchState === 'error' && (
        <div className="text-slate-500 text-sm">
          Could not load reviews — make sure the backend is running.
        </div>
      )}

      {fetchState === 'ok' && reviews.length === 0 && (
        <div className="text-slate-500 text-sm">
          No reviews yet. Be the first to share your story!
        </div>
      )}

      {fetchState === 'ok' && reviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      )}
    </section>
  )
}
