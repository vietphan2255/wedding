export function AoDaiIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 3l3 2 3-2" />
      <path d="M12 5v3" />
      <path d="M8 8l-2 13h12L16 8" />
      <path d="M12 8c-1.5 2-1.5 11 0 13" />
      <path d="M8 10h8" />
    </svg>
  )
}

export function SuitIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 3l5 4 5-4" />
      <path d="M7 3v18" />
      <path d="M17 3v18" />
      <path d="M12 7l-2 5 2 4 2-4-2-5z" />
    </svg>
  )
}

export function CocktailIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 4h14l-7 8z" />
      <path d="M12 12v8" />
      <path d="M8 20h8" />
      <path d="M18 5l2-2" />
    </svg>
  )
}

const ICONS = {
  aodai: AoDaiIcon,
  formal: SuitIcon,
  cocktail: CocktailIcon,
}

export default function DressIcon({ kind = 'formal', size = 18 }) {
  const Cmp = ICONS[kind] || SuitIcon
  return <Cmp size={size} />
}
