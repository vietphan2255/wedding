import { useLanguage } from '../contexts/LanguageContext.jsx'

export default function LanguageToggle() {
  const { lang, langs, setLang } = useLanguage()
  return (
    <div className="inline-flex items-center rounded-full border border-line bg-bg/70 backdrop-blur p-1">
      {langs.map((l) => {
        const active = l === lang
        return (
          <button
            key={l}
            onClick={() => setLang(l)}
            aria-label={`Switch language to ${l.toUpperCase()}`}
            aria-pressed={active}
            className={`px-2.5 py-1 rounded-full text-[11px] tracking-[0.18em] uppercase transition ${
              active ? 'bg-ink text-bg' : 'text-muted hover:text-ink'
            }`}
          >
            {l}
          </button>
        )
      })}
    </div>
  )
}
