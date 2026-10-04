/**
 * NavBar: top navigation for switching between pages.
 *
 * Props:
 *   - currentPage: string ('dashboard' | 'calculator' | 'compare' | 'analytics')
 *   - onNavigate:  function(pageName) — called when user clicks a tab
 *
 * Uses CSS variables from the theme so tab colors match weather.
 */

const PAGES = [
  { key: 'dashboard',  label: 'Dashboard',  icon: '🗺' },
  { key: 'calculator', label: 'Calculator', icon: '🧮' },
  { key: 'compare',    label: 'Compare',    icon: '⚖️' },
  { key: 'analytics',  label: 'Analytics',  icon: '📊' },
]

export default function NavBar({ currentPage, onNavigate }) {
  return (
    <nav
      className="rounded-2xl border mb-6 p-2"
      style={{
        backgroundColor: 'var(--color-bg-tint, rgba(30,41,59,0.6))',
        borderColor: 'var(--color-border, #334155)',
      }}
    >
      <div className="flex flex-wrap gap-1">
        {PAGES.map((p) => {
          const active = currentPage === p.key
          return (
            <button
              key={p.key}
              onClick={() => onNavigate(p.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                active
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/40'
              }`}
              style={
                active
                  ? { backgroundColor: 'var(--color-accent, #3b82f6)' }
                  : undefined
              }
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}