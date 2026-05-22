import { useTheme } from '../contexts/ThemeContext.jsx'

const SWATCHES = {
  blush: ['#F4E4E1', '#B8C5A6'],
  dark: ['#2A1F23', '#C9A961'],
  modern: ['#E8DDD0', '#C97B5D'],
}

const LABELS = {
  blush: 'Blush',
  dark: 'Noir',
  modern: 'Modern',
}

export default function ThemeSwitcher() {
  const { theme, themes, setTheme } = useTheme()
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-line bg-bg/70 backdrop-blur p-1">
      {themes.map((t) => {
        const active = t === theme
        return (
          <button
            key={t}
            onClick={() => setTheme(t)}
            aria-label={`Switch to ${LABELS[t]} theme`}
            aria-pressed={active}
            className={`group flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] tracking-[0.18em] uppercase transition ${
              active ? 'bg-ink text-bg' : 'text-muted hover:text-ink'
            }`}
          >
            <span className="flex">
              <span
                className="w-2 h-2 rounded-full ring-1 ring-black/5"
                style={{ background: SWATCHES[t][0] }}
              />
              <span
                className="w-2 h-2 -ml-0.5 rounded-full ring-1 ring-black/5"
                style={{ background: SWATCHES[t][1] }}
              />
            </span>
            <span className="hidden sm:inline">{LABELS[t]}</span>
          </button>
        )
      })}
    </div>
  )
}
