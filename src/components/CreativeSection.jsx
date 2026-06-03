import { useEffect, useRef } from 'react'
import './CreativeSection.css'

// ─── THE LOGIC ────────────────────────────────────────────────────────────────
// Cards are stacked at the center, far in the "background" (tiny, blurred).
// As you scroll, one card at a time zooms TOWARD the viewer (scale grows).
// It reaches full size at center-screen, then keeps zooming FORWARD until it
// goes off-screen past the viewer (scale > 1, opacity fades to 0).
//
// The card's X position ONLY shifts slightly to left or right as it zooms past
// (like a car passing you — it starts centered, ends slightly to one side).
//
// Last 2 cards stop before flying off — they land at left/right positions.
// ─────────────────────────────────────────────────────────────────────────────
const CARDS = [
  {
    id: 0, bg: '#e8c9a0', label: '2.2M',
    startX: -0.4, endX: -0.7, startY: 0.1, endY: 0.3, stayAtEnd: false,
    img: '/images/RTE-cookingoil.jpg',
  },
  {
    id: 1, bg: '#1a1a2e', label: '7.5M',
    startX: 0.3, endX: 0.8, startY: -0.2, endY: 0.1, stayAtEnd: false,
    img: '/images/Farma-Bites.jpg',
  },
  {
    id: 2, bg: '#e8735a', label: '5.2M',
    startX: 0.2, endX: -0.5, startY: -0.1, endY: -0.3, stayAtEnd: false,
    img: '/images/ketchup.jpg',
  },
  {
    id: 3, bg: '#f5e642', label: '9.1M',
    startX: -0.3, endX: 0.6, startY: 0.2, endY: 0.4, stayAtEnd: false,
    img: '/images/chips.jpg',
  },
  {
    id: 4, bg: '#ff8c00', label: '31.5M',
    startX: -0.4, endX: -0.36, startY: 0.0, endY: 0.0, stayAtEnd: true,
    img: '/images/Chicken.jpg',
  },
  {
    id: 5, bg: '#2d5a1b', label: '16.2M',
    startX: 0.4, endX: 0.36, startY: 0.1, endY: 0.2, stayAtEnd: true,
    img: '/images/buns-and-wraps.png',
  },
]

// Headline lines revealed progressively
const LINES = [
  { text: 'CONVERSION-LED <g>CREATIVE</g>',             at: 0.00 },
  { text: '<g>DIRECTION</g> TO MAKE SURE YOU GO',       at: 0.35 },
  { text: 'VIRAL AS WELL AS GROW YOUR BUSINESS',        at: 0.65 },
]

// Each card occupies a time-slice of the scroll range
const SLICE = 0.35   // longer slice to keep cards on screen longer
const GAP   = -0.20  // negative gap means cards heavily overlap in time

function cardRange(i) {
  // cards 4 & 5 come together at the end
  if (i < 4) return i * (SLICE + GAP)
  return 4 * (SLICE + GAP)  // both start at same time
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }
function lerp(a, b, t)    { return a + (b - a) * t }
function ease(t) {
  t = clamp(t, 0, 1)
  return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2
}
function range(raw, s, e) { return ease(clamp((raw - s) / (e - s), 0, 1)) }

export default function CreativeSection() {
  const wrapRef     = useRef(null)
  const cardRefs    = useRef([])
  const headlineRef = useRef(null)
  const pillRef     = useRef(null)

  useEffect(() => {
    function tick() {
      const wrap = wrapRef.current
      if (!wrap) return

      const rect  = wrap.getBoundingClientRect()
      const total = wrap.offsetHeight - window.innerHeight
      const raw   = clamp(-rect.top / total, 0, 1)

      const vw = window.innerWidth
      const vh = window.innerHeight

      // ── Pill ──────────────────────────────────────────────────────
      if (pillRef.current) {
        const p = range(raw, 0, 0.06)
        pillRef.current.style.opacity   = String(p)
        pillRef.current.style.transform = `translateY(${lerp(12, 0, p)}px)`
      }

      // ── Headline ──────────────────────────────────────────────────
      // Each line fades+slides in at its own scroll position
      // Lines stay visible once shown — they don't disappear
      if (headlineRef.current) {
        const lines = headlineRef.current.querySelectorAll('.hl-line')
        lines.forEach((lineEl, li) => {
          const lineAt  = LINES[li]?.at ?? 0
          const lineEnd = lineAt + 0.10
          const lp = range(raw, lineAt, lineEnd)
          lineEl.style.opacity   = String(lp)
          lineEl.style.transform = `translateY(${lerp(22, 0, lp)}px)`
        })
        // Always keep headline container visible once any line has appeared
        headlineRef.current.style.opacity = raw >= 0.01 ? '1' : '0'
      }

      // ── Cards ──────────────────────────────────────────────────────
      CARDS.forEach((card, i) => {
        const el = cardRefs.current[i]
        if (!el) return

        const start  = cardRange(i)
        const peak   = start + SLICE * 0.5   // card is at full size here
        const finish = start + SLICE          // card has exited / settled

        // Two sub-progress values:
        const pIn  = range(raw, start, peak)    // 0→1: approaching from behind
        const pOut = range(raw, peak,  finish)  // 0→1: passing and exiting

        // ── SCALE ──
        // Approaching: tiny (0.15) → full size (1.0)
        // Exiting (non-staying): full → zooms past viewer (2.2) then opacity drops
        // Exiting (staying): full → settles at 1.1
        let scale
        if (pIn < 1) {
          scale = lerp(0.15, 1.0, pIn)
        } else if (card.stayAtEnd) {
          scale = lerp(1.0, 1.1, pOut)
        } else {
          scale = lerp(1.0, 2.5, pOut)   // zooms huge past viewer
        }

        // ── BLUR ──
        // Far background → sharp at peak → slight blur as it recedes to side
        const blur = pIn < 1
          ? lerp(15, 0, pIn)
          : card.stayAtEnd ? lerp(0, 0, pOut) : lerp(0, 5, pOut)

        // ── OPACITY ──
        // Fades in from background, then fades OUT as it zooms past (non-staying)
        const opacity = pIn < 1
          ? lerp(0, 1, pIn)
          : card.stayAtEnd ? 1 : lerp(1, 0, range(raw, peak + (finish-peak)*0.5, finish))

        // ── X & Y POSITION ──
        // Lerp from startX to endX over the total progress
        const pTotal = range(raw, start, finish)
        const x = lerp(card.startX * vw, card.endX * vw, pTotal)
        const y = lerp(card.startY * vh, card.endY * vh, pTotal)

        // ── ROTATION ──
        // Slight tilt based on X movement direction
        const rotDiff = card.endX - card.startX
        const rot = lerp(0, rotDiff * 30, pTotal)

        // ── Z-INDEX ──
        // On top while approaching, behind others while exiting
        el.style.zIndex    = String(pIn < 1
          ? 5 + Math.round(pIn * 15)
          : 20 - Math.round(pOut * 10))

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

        {/* <div className="cs-pill" ref={pillRef} style={{ opacity: 0 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          brand + growth alignment
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        </div> */}

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

        {/* All cards stacked at center — JS zooms them forward one by one */}
        <div className="cs-cards-layer">
          {CARDS.map((card, i) => (
            <div
              key={card.id}
              ref={el => cardRefs.current[i] = el}
              className="cs-card"
              style={{
                background: card.bg,
                opacity: 0,
                transform: 'translate(0,0) scale(0.08)',
                filter: 'blur(12px)',
                zIndex: 1,
              }}
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
