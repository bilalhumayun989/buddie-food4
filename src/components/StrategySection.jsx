import { useEffect, useRef } from 'react'
import './StrategySection.css'
import heroImg from '../assets/hero.png'

// 8 cards in the final pinwheel — angle + tilt for each position
const CARDS = [
  { id: 0, bg: '#ff8c00', angle: 0,   tilt: -15, label: '31.5M' },
  { id: 1, bg: '#c0392b', angle: 45,  tilt:  20, label: '8.2M'  },
  { id: 2, bg: '#e8735a', angle: 90,  tilt:  50, label: '4.1M'  },
  { id: 3, bg: '#1a1a2e', angle: 135, tilt:  80, label: '12M'   },
  { id: 4, bg: '#2d5a1b', angle: 180, tilt: 110, label: '6.7M'  },
  { id: 5, bg: '#0a3d62', angle: 225, tilt: 140, label: '9.3M'  },
  { id: 6, bg: '#6c3483', angle: 270, tilt: 170, label: '2.8M'  },
  { id: 7, bg: '#f39c12', angle: 315, tilt: -45, label: '5.5M'  },
]

const RADIUS = 210 // final spread radius in px

// linear interpolation helper
function lerp(a, b, t) { return a + (b - a) * t }

// easing — ease-in-out cubic
function ease(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2 }

export default function StrategySection() {
  const wrapRef    = useRef(null)  // outer scroll container (tall)
  const stickyRef  = useRef(null)  // sticky inner viewport
  const cardRefs   = useRef([])
  const badgeRef   = useRef(null)
  const headlineRef = useRef(null)

  useEffect(() => {
    function onScroll() {
      const wrap = wrapRef.current
      if (!wrap) return

      const rect     = wrap.getBoundingClientRect()
      const total    = wrap.offsetHeight - window.innerHeight  // scrollable range
      const scrolled = -rect.top                               // how much scrolled into section
      // progress 0 = section just entered viewport, 1 = section fully scrolled through
      const raw      = Math.max(0, Math.min(1, scrolled / total))
      const p        = ease(raw)

      CARDS.forEach((card, i) => {
        const el = cardRefs.current[i]
        if (!el) return

        // stack state: all cards slightly offset from center
        const stackRotate = (i - 3.5) * 7
        const stackX      = (i - 3.5) * 4
        const stackY      = Math.abs(i - 3.5) * -3

        // fanned state: circle placement
        const rad    = (card.angle * Math.PI) / 180
        const fanX   = Math.cos(rad) * RADIUS
        const fanY   = Math.sin(rad) * RADIUS
        const fanRot = card.tilt

        // stagger each card's animation slightly
        const cardStart = i * 0.05
        const cardP     = ease(Math.max(0, Math.min(1, (raw - cardStart) / (1 - cardStart))))

        const x   = lerp(stackX,      fanX,   cardP)
        const y   = lerp(stackY,      fanY,   cardP)
        const rot = lerp(stackRotate, fanRot, cardP)

        el.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`
      })

      // badge: fade+scale in after 70% progress
      if (badgeRef.current) {
        const bP = Math.max(0, Math.min(1, (p - 0.7) / 0.3))
        badgeRef.current.style.transform = `translate(-50%, -50%) scale(${lerp(0, 1, bP)})`
        badgeRef.current.style.opacity   = String(bP)
      }

      // headline: slide up as cards spread
      if (headlineRef.current) {
        headlineRef.current.style.transform = `translateY(${lerp(0, -16, p)}px)`
        headlineRef.current.style.opacity   = String(lerp(1, 0.7, p))
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // run once on mount
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    /*
      The outer wrapper is TALL (300vh) so the browser has scroll room.
      The inner sticky div is 100vh and stays in view while you scroll
      through the full 300vh of the wrapper.
    */
    <div className="strategy-scroll-wrap" ref={wrapRef}>
      <div className="strategy-sticky" ref={stickyRef}>

        {/* ── Green drip at top ── */}
        <div className="drip-top" aria-hidden="true">
          <svg viewBox="0 0 1440 130" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0,0 L0,55
                 Q40,55 40,88 Q40,118 62,118 Q84,118 84,88 Q84,55 130,55
                 Q170,55 170,98 Q170,128 194,128 Q218,128 218,98 Q218,55 270,55
                 Q315,55 315,92 Q315,122 340,122 Q365,122 365,92 Q365,55 415,55
                 Q465,55 465,82 Q465,108 488,108 Q511,108 511,82 Q511,55 565,55
                 Q615,55 615,98 Q615,128 638,128 Q661,128 661,98 Q661,55 720,55
                 Q780,55 780,88 Q780,118 800,118 Q820,118 820,88 Q820,55 870,55
                 Q920,55 920,92 Q920,122 945,122 Q970,122 970,92 Q970,55 1020,55
                 Q1070,55 1070,82 Q1070,108 1093,108 Q1116,108 1116,82 Q1116,55 1165,55
                 Q1215,55 1215,98 Q1215,128 1235,128 Q1255,128 1255,98 Q1255,55 1315,55
                 Q1375,55 1375,88 Q1375,116 1395,118 Q1415,120 1425,98 Q1435,55 1440,55
                 L1440,0 Z"
              fill="#1e7d3a"
            />
          </svg>
        </div>

        {/* ── Side labels ── */}
        <div className="strategy-label strategy-label--left">
          <span className="label-small">Focus</span>
          <span className="label-main">Food Strategy</span>
        </div>
        <div className="strategy-label strategy-label--right">
          <span className="label-small">Meals Impacted</span>
          <span className="label-main">5M+</span>
        </div>

        {/* ── Center ── */}
        <div className="strategy-center">
          <h2 className="strategy-headline" ref={headlineRef}>
            FOOD THAT<br />
            <span className="headline-red">GETS DELIVERED</span> EVERY<br />
            TIME
          </h2>

          {/* Cards stage */}
          <div className="cards-stage">
            {CARDS.map((card, i) => (
              <div
                key={card.id}
                ref={el => cardRefs.current[i] = el}
                className="s-card"
                style={{
                  background: card.bg,
                  zIndex: card.id + 1,
                  // initial stacked position
                  transform: `translate(${(i - 3.5) * 4}px, ${Math.abs(i-3.5)*-3}px) rotate(${(i-3.5)*7}deg)`,
                }}
              >
                <img src={heroImg} alt="dish" className="s-card-img" />
                <div className="s-card-badge">{card.label}</div>
              </div>
            ))}

            {/* Center badge — starts hidden */}
            <div
              className="center-badge"
              ref={badgeRef}
              style={{ transform: 'translate(-50%,-50%) scale(0)', opacity: 0 }}
            >
              <span className="badge-icon">🍔</span>
              <span className="badge-text">BILLIONS<br />OF MEALS</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
