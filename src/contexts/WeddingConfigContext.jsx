import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { db, isConfigured } from '../firebase/config.js'

export const DEFAULT_CONFIG = {
  dates: {
    vuquyStart: '2026-07-26T09:00:00+07:00',
    vuquyEnd: '2026-07-26T12:00:00+07:00',
    thanhhonStart: '2026-08-02T18:00:00+07:00',
    thanhhonEnd: '2026-08-02T22:00:00+07:00',
    rsvpDeadline: '2026-06-30',
  },
  story: [
    {
      id: 'default-1',
      year: '2019',
      title_en: 'First met',
      title_vi: 'Lần đầu gặp gỡ',
      body_en:
        'A mutual friend introduced us at a tiny café in District 1. Two iced coffees and four hours of conversation later, we both knew.',
      body_vi:
        'Một người bạn chung giới thiệu tụi mình trong một quán cà phê nhỏ ở Quận 1. Hai ly cà phê đá và bốn tiếng đồng hồ trò chuyện, cả hai đều đã biết.',
      img: 'https://picsum.photos/seed/vn-story-1/900/1100',
      order: 0,
    },
    {
      id: 'default-2',
      year: '2021',
      title_en: 'First trip together',
      title_vi: 'Chuyến đi đầu tiên',
      body_en:
        'Đà Lạt in the rain — borrowed umbrellas, a shared raincoat, and the kind of laughter that turns strangers into family.',
      body_vi:
        'Đà Lạt trong cơn mưa — một chiếc dù mượn, một chiếc áo mưa chung, và tiếng cười biến người lạ thành gia đình.',
      img: 'https://picsum.photos/seed/vn-story-2/900/1100',
      order: 1,
    },
    {
      id: 'default-3',
      year: '2024',
      title_en: 'The proposal',
      title_vi: 'Lời cầu hôn',
      body_en:
        'On a quiet rooftop with the city humming below, the answer was yes before the question was finished.',
      body_vi:
        'Trên một sân thượng yên tĩnh giữa lòng thành phố, câu trả lời đã có trước khi câu hỏi kịp kết thúc.',
      img: 'https://picsum.photos/seed/vn-story-3/900/1100',
      order: 2,
    },
    {
      id: 'default-4',
      year: '2025',
      title_en: 'Lễ Đính Hôn',
      title_vi: 'Lễ Đính Hôn',
      body_en:
        'Surrounded by family, tea, and red envelopes — a promise made official under the eyes of our ancestors.',
      body_vi:
        'Bên gia đình, trà sen và những phong bao đỏ — một lời hứa chính thức dưới sự chứng giám của tổ tiên.',
      img: 'https://picsum.photos/seed/vn-story-4/900/1100',
      order: 3,
    },
  ],
  gallery: Array.from({ length: 12 }, (_, i) => ({
    id: `default-${i + 1}`,
    src:
      i % 5 === 0
        ? `https://picsum.photos/seed/vn-gallery-${i + 1}/900/1300`
        : i % 3 === 0
        ? `https://picsum.photos/seed/vn-gallery-${i + 1}/1300/900`
        : `https://picsum.photos/seed/vn-gallery-${i + 1}/1000/1000`,
    tall: i % 5 === 0,
    order: i,
  })),
}

function sortByOrder(list) {
  return [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

function toArray(node) {
  if (!node) return []
  return Object.entries(node).map(([id, value]) => ({ id, ...value }))
}

const WeddingConfigContext = createContext({
  config: DEFAULT_CONFIG,
  loading: true,
  source: 'default',
})

export function WeddingConfigProvider({ children }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState('default')

  useEffect(() => {
    if (!isConfigured || !db) {
      setLoading(false)
      return
    }
    const unsub = onValue(
      ref(db, 'config'),
      (snap) => {
        const data = snap.val()
        if (!data) {
          setConfig(DEFAULT_CONFIG)
          setSource('default')
        } else {
          setConfig({
            dates: { ...DEFAULT_CONFIG.dates, ...(data.dates || {}) },
            story:
              data.story && Object.keys(data.story).length > 0
                ? sortByOrder(toArray(data.story))
                : DEFAULT_CONFIG.story,
            gallery:
              data.gallery && Object.keys(data.gallery).length > 0
                ? sortByOrder(toArray(data.gallery))
                : DEFAULT_CONFIG.gallery,
          })
          setSource('firebase')
        }
        setLoading(false)
      },
      (err) => {
        console.error('[config] subscription failed', err)
        setLoading(false)
      },
    )
    return () => unsub()
  }, [])

  const value = useMemo(() => ({ config, loading, source }), [config, loading, source])
  return (
    <WeddingConfigContext.Provider value={value}>
      {children}
    </WeddingConfigContext.Provider>
  )
}

export const useWeddingConfig = () => useContext(WeddingConfigContext)
