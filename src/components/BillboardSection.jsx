import { useEffect, useRef, useState, useCallback } from 'react'
import './BillboardSection.css'

const BASE = [
  { id: 0, stars: 5, title: 'Life-changing flavours!',  text: 'Every order feels like a restaurant experience at home. The food arrives hot, fresh and absolutely delicious.',            name: 'Tanya K.',  verified: true },
  { id: 1, stars: 5, title: 'Best delivery in town.',   text: 'Fastest delivery I have ever seen. The packaging is perfect and the food never disappoints — 10 out of 10.',           name: 'Rahul M.',  verified: true },
  { id: 2, stars: 5, title: 'Obsessed with this app!',  text: 'I order three times a week and the quality is always consistent. BuddiFood has completely spoiled me.',                name: 'Sara J.',   verified: true },
  { id: 3, stars: 5, title: 'Fresh every single time.', text: 'The ingredients taste farm-fresh. You can actually taste the difference in quality compared to other services.',        name: 'James L.',  verified: true },
  { id: 4, stars: 5, title: 'Worth every penny!',       text: 'Premium food at fair prices. The variety is incredible and customer support is always on point.',                       name: 'Priya S.',  verified: true },
]

const CARD_W   = 260   // card width px
const CARD_GAP = 20    // gap between cards px
const STEP     = CARD_W + CARD_GAP
const N        = BASE.length
const AUTO_MS  = 2600

// Build a big repeated array so we always have cards to scroll into view
// We keep 3 copies: [copy A][copy B][copy C]
// Start in the middle copy so we can scroll both directions
const TILES = [...BASE, ...BASE, ...BASE]
const MID_START = N  // index in TILES where the "real" first card is

function mod(n, m) { return ((n % m) + m) % m }

export default function BillboardSection() {
  const sectionRef  = useRef(null)
  const trackRef    = useRef(null)
  const timerRef    = useRef(null)

  const [offsetIdx, setOffsetIdx] = useState(0)
  const [noTransition, setNoTransition] = useState(false)
  const [visible,   setVisible]   = useState(false)

  // The track's X position: each card step moves STEP px left
  // Center the middle card: offset so card[MID_START] is at center
  // We compute base offset to center card index MID_START
  const getX = (idx) => {
    // How far the track has moved: idx steps * STEP px, negative = moved left
    return -(MID_START + idx) * STEP
  }

  // ── Intersection observer ────────────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  // ── Seamless loop: after transition, if we've drifted N steps, snap back N ──
  const handleTransitionEnd = useCallback(() => {
    setOffsetIdx(prev => {
      if (prev >= N) {
        setNoTransition(true)
        requestAnimationFrame(() => requestAnimationFrame(() => setNoTransition(false)))
        return prev - N
      }
      if (prev <= -N) {
        setNoTransition(true)
        requestAnimationFrame(() => requestAnimationFrame(() => setNoTransition(false)))
        return prev + N
      }
      return prev
    })
  }, [])

  // ── Auto-advance ─────────────────────────────────────────────────
  const startAuto = useCallback(() => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setOffsetIdx(i => i + 1)
    }, AUTO_MS)
  }, [])

  useEffect(() => {
    startAuto()
    return () => clearInterval(timerRef.current)
  }, [startAuto])

  // ── Manual nav ───────────────────────────────────────────────────
  function prev() {
    setOffsetIdx(i => i - 1)
    startAuto()
  }
  function next() {
    setOffsetIdx(i => i + 1)
    startAuto()
  }

  // Which TILES index is currently at center slot?
  const centerTileIdx = mod(MID_START + offsetIdx, TILES.length)
  const centerDataId  = TILES[centerTileIdx].id

  // Compute translateX — no transition when we silently reset
  const translateX = getX(offsetIdx)

  return (
    <section
      className={`bb-section ${visible ? 'bb--visible' : ''}`}
      ref={sectionRef}
    >
      <div className="bb-bg" />
      <div className="bb-overlay" />

      {/* ── Headline behind cards ── */}
      <div className="bb-headline-wrap">
        <div className="bb-pill">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          Customer Reviews
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </div>
        <h2 className="bb-headline">
          WHAT OUR CUSTOMERS<br />
          <span className="bb-headline-accent">TELL ABOUT US</span>
        </h2>
      </div>

      {/* ── Bottom: nav + scrolling track + dots ── */}
      <div className="bb-bottom">
        <div className="bb-nav">
          <button className="bb-nav-btn" onClick={prev} aria-label="Previous">‹</button>
          <button className="bb-nav-btn" onClick={next} aria-label="Next">›</button>
        </div>

        {/* Viewport window — clips the overflowing cards */}
        <div className="bb-viewport">
          {/* The actual moving track */}
          <div
            ref={trackRef}
            className={`bb-track${noTransition ? ' bb-track--no-transition' : ''}`}
            style={{ transform: `translateX(${translateX}px)` }}
            onTransitionEnd={handleTransitionEnd}
          >
            {TILES.map((t, i) => {
              const isCenter = TILES[i].id === centerDataId &&
                               i === mod(MID_START + offsetIdx, TILES.length)
              return (
                <div
                  key={`${i}-${t.id}`}
                  className={`bb-card ${isCenter ? 'bb-card--center' : 'bb-card--side'}`}
                >
                  <div className="bb-stars">{'★'.repeat(t.stars)}</div>
                  <h3 className="bb-card-title">{t.title}</h3>
                  <p className="bb-card-text">{t.text}</p>
                  <div className="bb-card-footer">
                    <span className="bb-card-name">{t.name}</span>
                    {t.verified && <span className="bb-verified">✓ Verified</span>}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Edge fade masks to make cards "disappear" toward edges */}
          <div className="bb-fade-left"  />
          <div className="bb-fade-right" />
        </div>

        {/* Dots */}
        <div className="bb-dots">
          {BASE.map((_, i) => (
            <button
              key={i}
              className={`bb-dot ${i === centerDataId ? 'bb-dot--active' : ''}`}
              onClick={() => {
                const diff = i - centerDataId
                setOffsetIdx(o => o + diff)
                startAuto()
              }}
              aria-label={`Card ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
