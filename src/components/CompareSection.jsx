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

// ── Shared card renderer ─────────────────────────────────────────────────────
function CompareCard({ item, isActive, isExiting, behind, offset }) {
  let cls = 'cs-card'
  if (isActive)  cls += ' cs-card--active'
  if (isExiting) cls += ' cs-card--exit'
  if (behind)    cls += ` cs-card--behind cs-card--behind-${offset}`

  return (
    <div className={cls} style={{ '--cardBg': item.cardBg }} aria-label={item.label}>
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
        </div>
      </div>
    </div>
  )
}

// ── MOBILE version — click-based, no sticky scroll ───────────────────────────
function CompareMobile() {
  const [active,  setActive]  = useState(0)
  const [exiting, setExiting] = useState(null)

  function goTo(i) {
    if (i === active) return
    setExiting(active)
    setTimeout(() => setExiting(null), 480)
    setActive(i)
  }
  function prev() { goTo(Math.max(0, active - 1)) }
  function next() { goTo(Math.min(N - 1, active + 1)) }

  const item = ITEMS[active]

  return (
    <div className="cmp-mobile">
      {/* ── Header ── */}
      <div className="cmp-mobile-header">
        <p className="eyebrow">More than ordinary.</p>
        <h2 className="compare-headline">SEE THE<br />DIFFERENCE.</h2>
      </div>

      {/* ── Card + nav ── */}
      <div className="cmp-mobile-card-area">
        <button className="cmp-mobile-arrow" onClick={prev} disabled={active === 0} aria-label="Previous">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>

        <div className="cmp-mobile-stack">
          {ITEMS.map((it, i) => {
            const isAct  = i === active
            const isExit = i === exiting
            const offset = (i - active + N) % N
            const behind = offset > 0 && offset < 3
            if (!isAct && !isExit && !behind) return null
            return (
              <CompareCard
                key={i}
                item={it}
                isActive={isAct}
                isExiting={isExit}
                behind={behind}
                offset={offset}
              />
            )
          })}
        </div>

        <button className="cmp-mobile-arrow" onClick={next} disabled={active === N - 1} aria-label="Next">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      {/* ── Dots ── */}
      <div className="cmp-dots" style={{ justifyContent: 'center' }}>
        {ITEMS.map((_, i) => (
          <span
            key={i}
            className={`cmp-dot ${i === active ? 'cmp-dot--active' : ''}`}
            onClick={() => goTo(i)}
            style={{ cursor: 'pointer' }}
          />
        ))}
      </div>

      {/* ── Feature label ── */}
      <p className="cmp-mobile-label">{item.label}</p>

      {/* ── Benefits table ── */}
      <div className="cmp-mobile-table-wrap">
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
                style={{ '--ri': i, opacity: 1, transform: 'none' }}
                onClick={() => goTo(i)}
              >
                <td className="td-label">{row.label}</td>
                <td className="td-us">
                  <span className={`check-pill ${active === i ? 'check-pill--lit' : ''}`}>✓</span>
                </td>
                <td className="td-them"><span className="cross-mark">✗</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── DESKTOP version — scroll-driven sticky ───────────────────────────────────
function CompareDesktop() {
  const wrapRef    = useRef(null)
  const stickyRef  = useRef(null)
  const [active,   setActive]  = useState(0)
  const [exiting,  setExiting] = useState(null)
  const lastIdxRef = useRef(0)

  useEffect(() => {
    function tick() {
      const wrap = wrapRef.current
      if (!wrap) return
      const rect  = wrap.getBoundingClientRect()
      const total = wrap.offsetHeight - window.innerHeight
      if (total <= 0) return
      const raw = Math.max(0, Math.min(1, -rect.top / total))
      const idx = Math.min(N - 1, Math.floor(raw * N))

      if (idx !== lastIdxRef.current) {
        setExiting(lastIdxRef.current)
        setTimeout(() => setExiting(null), 520)
        setActive(idx)
        lastIdxRef.current = idx
      }

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
    <div className="compare-outer" ref={wrapRef}>
      <section className="compare-section" ref={stickyRef}>

        {/* LEFT */}
        <div className="compare-left">
          <div className="card-stack">
            {ITEMS.map((item, i) => {
              const isActive  = i === active
              const isExiting = i === exiting
              const offset    = (i - active + N) % N
              const behind    = offset > 0 && offset < 3
              if (!isActive && !isExiting && !behind) return null
              return (
                <CompareCard
                  key={i}
                  item={item}
                  isActive={isActive}
                  isExiting={isExiting}
                  behind={behind}
                  offset={offset}
                />
              )
            })}
          </div>
        </div>

        {/* RIGHT */}
        <div className="compare-right">
          <p className="eyebrow">More than ordinary.</p>
          <h2 className="compare-headline">SEE THE<br />DIFFERENCE.</h2>

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
                  <td className="td-them"><span className="cross-mark">✗</span></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="cmp-dots">
            {ITEMS.map((_, i) => (
              <span key={i} className={`cmp-dot ${i === active ? 'cmp-dot--active' : ''}`} />
            ))}
          </div>
        </div>

      </section>
    </div>
  )
}

// ── Root export — picks layout by screen width ────────────────────────────────
export default function CompareSection() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  )

  useEffect(() => {
    function onResize() { setIsMobile(window.innerWidth <= 768) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return isMobile ? <CompareMobile /> : <CompareDesktop />
}
