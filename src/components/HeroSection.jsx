import { useEffect, useRef } from 'react'
import './HeroSection.css'
import heroImg from '../assets/hero.png'

// The 3 hero stacked cards — starting positions (stacked/fanned slightly)
export const HERO_CARDS = [
  { id: 0, bg: '#1a1a2e', stackRotate: -18, stackX: -30, stackY: 10  },
  { id: 1, bg: '#2d5a1b', stackRotate: -9,  stackX: -12, stackY: 4   },
  { id: 2, bg: '#ff8c00', stackRotate:  0,  stackX:   0, stackY: 0, isMain: true },
]

export default function HeroSection() {
  const card0 = useRef(null)
  const card1 = useRef(null)
  const card2 = useRef(null)
  const cardRefs = [card0, card1, card2]

  useEffect(() => {
    function onScroll() {
      // progress 0 = top of page, 1 = scrolled one full viewport height
      const progress = Math.min(1, window.scrollY / window.innerHeight)

      HERO_CARDS.forEach((card, i) => {
        const el = cardRefs[i].current
        if (!el) return
        // interpolate from stack position toward a "rising" position
        const rotate = card.stackRotate * (1 - progress)
        const x      = card.stackX     * (1 - progress)
        const y      = card.stackY     * (1 - progress) - progress * 40
        const scale  = 1 + progress * 0.05
        el.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section className="hero-section">

      {/* ── Top-left stats ── */}
      <div className="hero-stats">
        <div className="stat-item">
          <span className="stat-icon">🍔</span>
          <div><strong>Served over 5M+ meals</strong></div>
        </div>
        <div className="stat-item">
          <span className="stat-icon">⭐</span>
          <div><strong>Trusted by 65M+ foodies</strong></div>
        </div>
      </div>

      {/* ── Stacked cards ── */}
      <div className="hero-cards">
        {HERO_CARDS.map((card, i) => (
          <div
            key={card.id}
            ref={cardRefs[i]}
            className={`card ${card.isMain ? 'card--main' : ''}`}
            style={{
              background: card.bg,
              transform: `translate(${card.stackX}px, ${card.stackY}px) rotate(${card.stackRotate}deg)`,
              zIndex: card.id + 1,
            }}
          >
            {card.isMain && (
              <>
                <img src={heroImg} alt="Featured dish" className="card-img" />
                <div className="card-badge">🍕 31.5 M orders</div>
              </>
            )}
          </div>
        ))}

        {/* Play button */}
        <button className="play-btn" aria-label="Watch our story">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>

      {/* ── Right content ── */}
      <div className="hero-content">
        <div className="hero-chevrons" aria-hidden="true">
          <span className="chevron chevron--sm" />
          <span className="chevron chevron--lg" />
        </div>

        <h1 className="hero-headline">
          FOOD<br />
          THAT<br />
          <span className="headline-accent">DELIGHTS</span>
        </h1>

        <p className="hero-subtext">
          Unlock your cravings with our viral food delivery service — fresh meals,
          lightning-fast delivery, and unforgettable flavours!
        </p>

        <div className="hero-cta">
          <button className="cta-icon-btn" aria-label="Order now">🛵</button>
          <button className="cta-btn">Order now</button>
        </div>
      </div>

      {/* ── White drip at BOTTOM of hero (transition to next section) ── */}
      <div className="drip-bottom" aria-hidden="true">
        <svg viewBox="0 0 1440 130" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0,130 L0,75
               Q40,75 40,45 Q40,18 62,18 Q84,18 84,45 Q84,75 130,75
               Q170,75 170,35 Q170,5 194,5 Q218,5 218,35 Q218,75 270,75
               Q315,75 315,42 Q315,12 340,12 Q365,12 365,42 Q365,75 415,75
               Q465,75 465,52 Q465,28 488,28 Q511,28 511,52 Q511,75 565,75
               Q615,75 615,35 Q615,5 638,5 Q661,5 661,35 Q661,75 720,75
               Q780,75 780,45 Q780,18 800,18 Q820,18 820,45 Q820,75 870,75
               Q920,75 920,42 Q920,12 945,12 Q970,12 970,42 Q970,75 1020,75
               Q1070,75 1070,52 Q1070,28 1093,28 Q1116,28 1116,52 Q1116,75 1165,75
               Q1215,75 1215,35 Q1215,5 1235,5 Q1255,5 1255,35 Q1255,75 1315,75
               Q1375,75 1375,45 Q1375,18 1395,18 Q1415,18 1425,45 Q1435,75 1440,75
               L1440,130 Z"
            fill="#ffffff"
          />
        </svg>
      </div>

    </section>
  )
}
