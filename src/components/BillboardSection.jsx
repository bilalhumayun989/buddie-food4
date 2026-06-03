import { useEffect, useRef, useState, useCallback } from 'react'
import './BillboardSection.css'

const BASE = [
  { id: 0, stars: 5, title: 'Life-changing flavours!',  text: 'Every order feels like a restaurant experience at home. The food arrives hot, fresh and absolutely delicious.',   name: 'Tanya K.',  verified: true },
  { id: 1, stars: 5, title: 'Best delivery in town.',   text: 'Fastest delivery I have ever seen. The packaging is perfect and the food never disappoints — 10 out of 10.',      name: 'Rahul M.',  verified: true },
  { id: 2, stars: 5, title: 'Obsessed with this app!',  text: 'I order three times a week and the quality is always consistent. BuddiFood has completely spoiled me.',           name: 'Sara J.',   verified: true },
  { id: 3, stars: 5, title: 'Fresh every single time.', text: 'The ingredients taste farm-fresh. You can actually taste the difference in quality compared to other services.',   name: 'James L.',  verified: true },
  { id: 4, stars: 5, title: 'Worth every penny!',       text: 'Premium food at fair prices. The variety is incredible and customer support is always on point.',                  name: 'Priya S.',  verified: true },
]

const N        = BASE.length
const TILES    = [...BASE, ...BASE, ...BASE]
const MID_START = N

function mod(n, m) { return ((n % m) + m) % m }

// Card width changes per breakpoint — read from CSS via JS
function getCardW() {
  return window.innerWidth <= 480 ? 160 : window.innerWidth <= 870 ? 190 : 260
}
function getCardGap() {
  return window.innerWidth <= 870 ? 12 : 20
}

export default function BillboardSection() {
  const sectionRef    = useRef(null)
  const trackRef      = useRef(null)
  const timerRef      = useRef(null)
  const [offsetIdx,    setOffsetIdx]    = useState(0)
  const [noTransition, setNoTransition] = useState(false)
  const [visible,      setVisible]      = useState(false)

  const getX = useCallback((idx) => {
    const w = getCardW()
    const g = getCardGap()
    const step = w + g
    const halfCard = w / 2
    return -(MID_START + idx) * step
  }, [])

  // Intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  // Seamless loop
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

  // Auto-advance — disabled on mobile
  const startAuto = useCallback(() => {
    clearInterval(timerRef.current)
    if (window.innerWidth > 870) {
      timerRef.current = setInterval(() => {
        setOffsetIdx(i => i + 1)
      }, 2600)
    }
  }, [])

  useEffect(() => {
    startAuto()
    window.addEventListener('resize', startAuto)
    return () => {
      clearInterval(timerRef.current)
      window.removeEventListener('resize', startAuto)
    }
  }, [startAuto])

  function prev() { setOffsetIdx(i => i - 1); startAuto() }
  function next() { setOffsetIdx(i => i + 1); startAuto() }

  const centerTileIdx = mod(MID_START + offsetIdx, TILES.length)
  const centerDataId  = TILES[centerTileIdx].id
  const translateX    = getX(offsetIdx)

  return (
    <section
      className={`bb-section ${visible ? 'bb--visible' : ''}`}
      ref={sectionRef}
    >
      <div className="bb-bg" />
      <div className="bb-overlay" />

      {/* Headline behind cards */}
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

      {/* Bottom: nav + track + dots */}
      <div className="bb-bottom">
        <div className="bb-nav">
          <button className="bb-nav-btn" onClick={prev} aria-label="Previous">‹</button>
          <button className="bb-nav-btn" onClick={next} aria-label="Next">›</button>
        </div>

        <div className="bb-viewport">
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
                <div key={`${i}-${t.id}`} className={`bb-card ${isCenter ? 'bb-card--center' : 'bb-card--side'}`}>
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
          <div className="bb-fade-left" />
          <div className="bb-fade-right" />
        </div>

        <div className="bb-dots">
          {BASE.map((_, i) => (
            <button
              key={i}
              className={`bb-dot ${i === centerDataId ? 'bb-dot--active' : ''}`}
              onClick={() => { setOffsetIdx(o => o + i - centerDataId); startAuto() }}
              aria-label={`Card ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
