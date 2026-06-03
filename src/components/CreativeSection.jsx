import { useEffect, useRef, useState } from 'react'
import './CreativeSection.css'

const CARDS = [
  { id: 0, bg: '#e8c9a0', label: '2.2M',  startX: -0.4, endX: -0.7,  startY:  0.1, endY:  0.3, stayAtEnd: false, img: '/images/RTE-cookingoil.jpg' },
  { id: 1, bg: '#1a1a2e', label: '7.5M',  startX:  0.3, endX:  0.8,  startY: -0.2, endY:  0.1, stayAtEnd: false, img: '/images/Farma-Bites.jpg'    },
  { id: 2, bg: '#e8735a', label: '5.2M',  startX:  0.2, endX: -0.5,  startY: -0.1, endY: -0.3, stayAtEnd: false, img: '/images/ketchup.jpg'         },
  { id: 3, bg: '#f5e642', label: '9.1M',  startX: -0.3, endX:  0.6,  startY:  0.2, endY:  0.4, stayAtEnd: false, img: '/images/chips.jpg'            },
  { id: 4, bg: '#ff8c00', label: '31.5M', startX: -0.4, endX: -0.36, startY:  0.0, endY:  0.0, stayAtEnd: true,  img: '/images/Chicken.jpg'          },
  { id: 5, bg: '#2d5a1b', label: '16.2M', startX:  0.4, endX:  0.36, startY:  0.1, endY:  0.2, stayAtEnd: true,  img: '/images/buns-and-wraps.png'   },
]

const LINES = [
  { text: 'CONVERSION-LED <g>CREATIVE</g>',         at: 0.00 },
  { text: '<g>DIRECTION</g> TO MAKE SURE YOU GO',   at: 0.35 },
  { text: 'VIRAL AS WELL AS GROW YOUR BUSINESS',    at: 0.65 },
]

const SLICE = 0.35
const GAP   = -0.20

function cardRange(i) {
  if (i < 4) return i * (SLICE + GAP)
  return 4 * (SLICE + GAP)
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }
function lerp(a, b, t)    { return a + (b - a) * t }
function ease(t) {
  t = clamp(t, 0, 1)
  return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2
}
function range(raw, s, e) { return ease(clamp((raw - s) / (e - s), 0, 1)) }

// ── MOBILE: premium dark layout with featured card + scroll strip ─────────────
function CreativeMobile() {
  const [active, setActive] = useState(0)

  const card = CARDS[active]

  return (
    <div className="cs-mobile">
      {/* Dark hero area */}
      <div className="cs-mobile-hero">
        {/* Pill */}
        <div className="cs-mobile-pill">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          brand + growth alignment
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        </div>

        {/* Headline */}
        <h2 className="cs-mobile-headline">
          CONVERSION-LED <span className="hl-green">CREATIVE</span><br />
          <span className="hl-green">DIRECTION</span> TO MAKE<br />
          SURE YOU GO VIRAL
        </h2>

        {/* Featured big card */}
        <div className="cs-mobile-featured" style={{ background: card.bg }}>
          <img src={card.img} alt="" className="cs-mobile-featured-img" />
          <div className="cs-mobile-featured-badge">
            <span className="cs-mb-label">orbits</span>
            <span className="cs-mb-val">{card.label}</span>
          </div>
        </div>
      </div>

      {/* Horizontal scrollable card strip */}
      <div className="cs-mobile-strip-wrap">
        <p className="cs-mobile-strip-title">Our Product Range</p>
        <div className="cs-mobile-strip">
          {CARDS.map((c, i) => (
            <button
              key={c.id}
              className={`cs-mobile-thumb ${i === active ? 'cs-mobile-thumb--active' : ''}`}
              style={{ background: c.bg }}
              onClick={() => setActive(i)}
              aria-label={`Card ${i + 1}`}
            >
              <img src={c.img} alt="" className="cs-mobile-thumb-img" />
              <div className="cs-mobile-thumb-badge">{c.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── DESKTOP: full scroll animation ───────────────────────────────────────────
function CreativeDesktop() {
  const wrapRef     = useRef(null)
  const cardRefs    = useRef([])
  const headlineRef = useRef(null)

  useEffect(() => {
    function tick() {
      const wrap = wrapRef.current
      if (!wrap) return

      const rect  = wrap.getBoundingClientRect()
      const total = wrap.offsetHeight - window.innerHeight
      const raw   = clamp(-rect.top / total, 0, 1)

      const vw = window.innerWidth
      const vh = window.innerHeight

      // Headline lines
      if (headlineRef.current) {
        const lines = headlineRef.current.querySelectorAll('.hl-line')
        lines.forEach((lineEl, li) => {
          const lineAt  = LINES[li]?.at ?? 0
          const lineEnd = lineAt + 0.10
          const lp = range(raw, lineAt, lineEnd)
          lineEl.style.opacity   = String(lp)
          lineEl.style.transform = `translateY(${lerp(22, 0, lp)}px)`
        })
        headlineRef.current.style.opacity = raw >= 0.01 ? '1' : '0'
      }

      // Cards
      CARDS.forEach((card, i) => {
        const el = cardRefs.current[i]
        if (!el) return

        const start  = cardRange(i)
        const peak   = start + SLICE * 0.5
        const finish = start + SLICE

        const pIn  = range(raw, start, peak)
        const pOut = range(raw, peak,  finish)

        let scale
        if (pIn < 1)             scale = lerp(0.15, 1.0, pIn)
        else if (card.stayAtEnd) scale = lerp(1.0, 1.1, pOut)
        else                     scale = lerp(1.0, 2.5, pOut)

        const blur = pIn < 1
          ? lerp(15, 0, pIn)
          : card.stayAtEnd ? 0 : lerp(0, 5, pOut)

        const opacity = pIn < 1
          ? lerp(0, 1, pIn)
          : card.stayAtEnd ? 1 : lerp(1, 0, range(raw, peak + (finish-peak)*0.5, finish))

        const pTotal = range(raw, start, finish)
        const x = lerp(card.startX * vw, card.endX * vw, pTotal)
        const y = lerp(card.startY * vh, card.endY * vh, pTotal)
        const rot = lerp(0, (card.endX - card.startX) * 30, pTotal)

        el.style.zIndex    = String(pIn < 1 ? 5 + Math.round(pIn * 15) : 20 - Math.round(pOut * 10))
        el.style.transform = `translate(${x}px, ${y}px) scale(${scale}) rotate(${rot}deg)`
        el.style.filter    = blur > 0.4 ? `blur(${blur.toFixed(1)}px)` : 'none'
        el.style.opacity   = String(Math.max(0, opacity))
      })
    }

    window.addEventListener('scroll', tick, { passive: true })
    tick()
    return () => window.removeEventListener('scroll', tick)
  }, [])

  return (
    <div className="cs-wrap" ref={wrapRef}>
      <div className="cs-sticky">
        <h2 className="cs-headline" ref={headlineRef} style={{ opacity: 0 }}>
          {LINES.map((line, li) => (
            <span
              key={li}
              className="hl-line"
              style={{ opacity: 0, transform: 'translateY(22px)', display: 'block', transition: 'none' }}
              dangerouslySetInnerHTML={{
                __html: line.text
                  .replace(/<g>/g,  '<span class="hl-green">')
                  .replace(/<\/g>/g, '</span>')
              }}
            />
          ))}
        </h2>

        <div className="cs-cards-layer">
          {CARDS.map((card, i) => (
            <div
              key={card.id}
              ref={el => { cardRefs.current[i] = el }}
              className="cs-card"
              style={{ background: card.bg, opacity: 0, transform: 'translate(0,0) scale(0.08)', filter: 'blur(12px)', zIndex: 1 }}
            >
              <img src={card.img} alt="" className="cs-card-img" />
              <div className="cs-card-badge">
                <span className="orbits-label">orbits</span>
                <span className="orbits-val">{card.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Root: pick layout by screen width ────────────────────────────────────────
export default function CreativeSection() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  )

  useEffect(() => {
    function onResize() { setIsMobile(window.innerWidth <= 768) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return isMobile ? <CreativeMobile /> : <CreativeDesktop />
}
