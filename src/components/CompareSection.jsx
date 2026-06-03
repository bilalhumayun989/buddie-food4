import { useEffect, useRef, useState } from 'react'
import './CompareSection.css'

const ITEMS = [
  {
    label:    'Fresh ingredients every order',
    cardBg:   '#ff8c00',
    cardImg:  '/images/Chicken.jpg',
    cardTitle:'FRESH FOOD\nEVERY TIME',
    tag:      '🥗 Farm Fresh',
  },
  {
    label:    'Conversion-focused delivery',
    cardBg:   '#c0392b',
    cardImg:  '/images/buns-and-wraps.png',
    cardTitle:'BOOSTING\nORDERS\nWITH FOOD',
    tag:      '🍔 Top Seller',
  },
  {
    label:    'Clear pricing & no hidden fees',
    cardBg:   '#1a6e32',
    cardImg:  '/images/Farma-Bites.jpg',
    cardTitle:'CLEAR\nPRICING\nGUARANTEED',
    tag:      '💚 Transparent',
  },
  {
    label:    'Real-time tracking & updates',
    cardBg:   '#0a3d62',
    cardImg:  '/images/RTE-cookingoil.jpg',
    cardTitle:'REAL-TIME\nTRACKING\nALL DAY',
    tag:      '📍 Live Track',
  },
  {
    label:    'Transparent delivery reporting',
    cardBg:   '#6c3483',
    cardImg:  '/images/chips.jpg',
    cardTitle:'TRANSPARENT\nREPORTING',
    tag:      '📊 Full Report',
  },
]

const N = ITEMS.length

export default function CompareSection() {
  const wrapRef       = useRef(null)   // the tall scroll container
  const stickyRef     = useRef(null)   // the sticky inner panel
  const [active,   setActive]  = useState(0)
  const [exiting,  setExiting] = useState(null)
  const lastIdxRef = useRef(0)

  // ── Sticky scroll driver ─────────────────────────────────────────
  useEffect(() => {
    function tick() {
      const wrap = wrapRef.current
      if (!wrap) return

      const rect  = wrap.getBoundingClientRect()
      const total = wrap.offsetHeight - window.innerHeight   // scrollable range in px
      if (total <= 0) return

      // raw: 0 at very top of section, 1 at very bottom
      const raw = Math.max(0, Math.min(1, -rect.top / total))

      // Map raw 0→1 to card index 0→N-1
      const idx = Math.min(N - 1, Math.floor(raw * N))

      if (idx !== lastIdxRef.current) {
        const prev = lastIdxRef.current
        setExiting(prev)
        setTimeout(() => setExiting(null), 520)
        setActive(idx)
        lastIdxRef.current = idx
      }

      // Visibility class for entrance animation
      const sticky = stickyRef.current
      if (sticky && !sticky.classList.contains('compare--visible')) {
        sticky.classList.add('compare--visible')
      }
    }

    window.addEventListener('scroll', tick, { passive: true })
    tick()
    return () => window.removeEventListener('scroll', tick)
  }, [])

  return (
    /* Tall outer wrapper — gives scroll room for all N cards */
    <div className="compare-outer" ref={wrapRef}>

      {/* Sticky panel — stays fixed in viewport while user scrolls */}
      <section className="compare-section" ref={stickyRef}>

        {/* ══ LEFT — card stack ══════════════════════════════ */}
        <div className="compare-left">
          <div className="card-stack">
            {ITEMS.map((item, i) => {
              const isActive  = i === active
              const isExiting = i === exiting
              const offset    = (i - active + N) % N
              const behind    = offset > 0 && offset < 3

              if (!isActive && !isExiting && !behind) return null

              let cls = 'cs-card'
              if (isActive)  cls += ' cs-card--active'
              if (isExiting) cls += ' cs-card--exit'
              if (behind)    cls += ` cs-card--behind cs-card--behind-${offset}`

              return (
                <div
                  key={i}
                  className={cls}
                  style={{ '--cardBg': item.cardBg }}
                  aria-label={item.label}
                >
                  <div className="cs-card-inner">
                    <div className="cs-tag">{item.tag}</div>
                    <div className="cs-img-wrap">
                      <img src={item.cardImg} alt={item.label} className="cs-img" />
                    </div>
                    <h3 className="cs-title">
                      {item.cardTitle.split('\n').map((line, li) => (
                        <span key={li}>{line}<br /></span>
                      ))}
                    </h3>
                    <div className="cs-footer">
                      <span className="cs-brand">BuddieFood</span>
                      <span className="cs-progress">{active + 1} / {N}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ══ RIGHT — headline + table ═══════════════════════ */}
        <div className="compare-right">
          <p className="eyebrow">More than ordinary.</p>
          <h2 className="compare-headline">
            SEE THE<br />DIFFERENCE.
          </h2>

          <table className="compare-table" role="table">
            <thead>
              <tr>
                <th className="th-benefit">Benefits</th>
                <th className="th-us"><span className="us-pill">🍔 BuddieFood</span></th>
                <th className="th-them">Others</th>
              </tr>
            </thead>
            <tbody>
              {ITEMS.map((row, i) => (
                <tr
                  key={i}
                  className={`cmp-row ${active === i ? 'cmp-row--active' : ''}`}
                  style={{ '--ri': i }}
                >
                  <td className="td-label">{row.label}</td>
                  <td className="td-us">
                    <span className={`check-pill ${active === i ? 'check-pill--lit' : ''}`}>✓</span>
                  </td>
                  <td className="td-them">
                    <span className="cross-mark">✗</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Scroll progress dots */}
          <div className="cmp-dots">
            {ITEMS.map((_, i) => (
              <span
                key={i}
                className={`cmp-dot ${i === active ? 'cmp-dot--active' : ''}`}
              />
            ))}
          </div>
        </div>

      </section>
    </div>
  )
}
