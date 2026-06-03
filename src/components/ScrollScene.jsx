import { useEffect, useRef } from 'react'
import './ScrollScene.css'

const ANCHOR_INDEX = 0

const CARDS = [
  { id: 0, bg: '#ff8c00', angle: 270, label: '31.5M', img: '/images/buns-and-wraps.png' },
  { id: 1, bg: '#c0392b', angle: 315, label: '8.2M',  img: '/images/Chicken.jpg'        },
  { id: 2, bg: '#e8735a', angle: 0,   label: '4.1M',  img: '/images/chips.jpg'           },
  { id: 3, bg: '#1a1a2e', angle: 45,  label: '12M',   img: '/images/coca-cola.jpg'       },
  { id: 4, bg: '#2d5a1b', angle: 90,  label: '6.7M',  img: '/images/ketchup.jpg'         },
  { id: 5, bg: '#0a3d62', angle: 135, label: '9.3M',  img: '/images/RTE-cookingoil.jpg'  },
  { id: 6, bg: '#6c3483', angle: 180, label: '2.8M',  img: '/images/Farma-Bites.jpg'     },
  { id: 7, bg: '#f39c12', angle: 225, label: '5.5M',  img: '/images/Deepio.png'          },
]

function cardFanRotation(angleDeg) { return angleDeg + 90 }
function clamp(v, lo, hi)          { return Math.max(lo, Math.min(hi, v)) }
function lerp(a, b, t)             { return a + (b - a) * t }
function ease(t) {
  t = clamp(t, 0, 1)
  return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2
}
function range(raw, s, e) { return ease(clamp((raw - s) / (e - s), 0, 1)) }

// Shared nav markup used in both desktop and mobile renders
function HeroNav() {
  return (
    <nav className="hero-nav">
      <div className="nav-links">
        <a href="#">Expertise</a>
        <a href="#">Work</a>
        <a href="#">About</a>
        <a href="#">Contact</a>
      </div>
      <div className="nav-logo">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#f5e642">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
        </svg>
        BUDDIEFOOD
      </div>
      <div className="nav-actions">
        <button className="nav-lang">English ⌵</button>
        <button className="nav-contact">Contact us</button>
      </div>
    </nav>
  )
}

export default function ScrollScene() {
  const wrapRef      = useRef(null)
  const cardRefs     = useRef([])
  const badgeRef     = useRef(null)
  const stratBgRef   = useRef(null)
  const stratTextRef = useRef(null)
  const headlineRef  = useRef(null)
  const subRef       = useRef(null)
  const labelsRef    = useRef(null)

  useEffect(() => {
    // ── On mobile skip all animation, show static layout ──────────
    if (window.innerWidth <= 768) return

    function tick() {
      const wrap = wrapRef.current
      if (!wrap) return

      const rect  = wrap.getBoundingClientRect()
      const total = wrap.offsetHeight - window.innerHeight
      const raw   = clamp(-rect.top / total, 0, 1)

      const vh = window.innerHeight
      const vw = window.innerWidth

      const RADIUS     = clamp(vw * 0.13, 150, 210)
      const fanCenterY = vh * 0.30
      const stackY     = fanCenterY - RADIUS

      const heroEndY   = vh * 0.12
      const heroStartY = -vh * 0.05
      const heroStartX = -vw * 0.22

      const moveP   = range(raw, 0.00, 0.38)
      const textP   = range(raw, 0.28, 0.58)
      const gatherP = range(raw, 0.36, 0.52)

      // White bg slides up
      if (stratBgRef.current) {
        stratBgRef.current.style.transform = `translateY(${lerp(100, 0, moveP)}%)`
        stratBgRef.current.style.opacity   = String(clamp(moveP * 2, 0, 1))
      }

      // Headline
      if (headlineRef.current) {
        headlineRef.current.style.opacity   = String(textP)
        headlineRef.current.style.transform = `translateY(${lerp(28, 0, textP)}px)`
      }

      // Subtext
      if (subRef.current) {
        const sP = range(raw, 0.34, 0.62)
        subRef.current.style.opacity   = String(sP)
        subRef.current.style.transform = `translateY(${lerp(20, 0, sP)}px)`
      }

      // Side labels
      if (labelsRef.current) {
        labelsRef.current.style.opacity = String(range(raw, 0.32, 0.52))
      }

      // Cards: hero → stack → fan
      CARDS.forEach((card, i) => {
        const el = cardRefs.current[i]
        if (!el) return

        const sRotate = (i - 3.5) * 4
        const sX      = (i - 3.5) * 3
        const sY      = Math.abs(i - 3.5) * -1.5

        const movedX  = lerp(heroStartX + sX, 0,       moveP)
        const movedY  = lerp(heroStartY + sY, heroEndY, moveP)

        const atStackX = lerp(movedX, 0,      gatherP)
        const atStackY = lerp(movedY, stackY, gatherP)

        const isAnchor = i === ANCHOR_INDEX
        const cardFanP = isAnchor ? 0 : range(raw, 0.54 + (i % 4) * 0.025, 0.98)

        const rad    = (card.angle * Math.PI) / 180
        const fanX   = Math.cos(rad) * RADIUS
        const fanY   = Math.sin(rad) * RADIUS + fanCenterY
        const fanRot = cardFanRotation(card.angle)

        const finalX = isAnchor ? atStackX : lerp(atStackX, fanX, cardFanP)
        const finalY = isAnchor ? atStackY : lerp(atStackY, fanY, cardFanP)
        const finalR = isAnchor
          ? lerp(sRotate, fanRot, gatherP)
          : lerp(sRotate, fanRot, cardFanP)

        el.style.transform = `translate(${finalX}px, ${finalY}px) rotate(${finalR}deg)`
      })

      // Badge
      if (badgeRef.current) {
        const bP = range(raw, 0.72, 0.92)
        badgeRef.current.style.transform =
          `translate(-50%, calc(-50% + ${fanCenterY}px)) scale(${lerp(0, 1, bP)})`
        badgeRef.current.style.opacity = String(bP)
      }
    }

    window.addEventListener('scroll', tick, { passive: true })
    window.addEventListener('resize', tick, { passive: true })
    tick()
    return () => {
      window.removeEventListener('scroll', tick)
      window.removeEventListener('resize', tick)
    }
  }, [])

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768

  // ── MOBILE: static hero — no scroll magic ────────────────────────────────
  if (isMobile) {
    return (
      <div className="ss-mobile">
        <div className="ss-mobile-hero">
          <HeroNav />
          <div className="ss-mobile-body">
            <div className="ss-mobile-text">
              <h1 className="hero-headline">
                FOOD<br />THAT<br /><span className="hl-yellow">DELIGHTS</span>
              </h1>
              <p className="hero-subtext">
                Fresh meals, lightning-fast delivery, and unforgettable flavours!
              </p>
              <div className="hero-cta-row">
                <button className="cta-pill">Order now</button>
              </div>
              <div className="ss-mobile-stats">
                <div className="stat-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f5e642" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M12 6v6l4 2"/></svg>
                  <strong>Served over 5M+ meals</strong>
                </div>
                <div className="stat-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f5e642" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <strong>Trusted by 65M+ foodies</strong>
                </div>
              </div>
            </div>

            {/* Product image grid — 4 cards in a 2×2 grid */}
            <div className="ss-mobile-grid">
              {CARDS.slice(0, 4).map(card => (
                <div key={card.id} className="ss-mobile-card" style={{ background: card.bg }}>
                  <img src={card.img} alt="" className="ss-card-img" />
                  <div className="ss-card-badge">{card.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Strategy section — static on mobile */}
        <div className="ss-mobile-strat">
          <h2 className="strat-headline">
            <span className="hl-red">GETS DELIVERED</span> EVERY<br />TIME YOUR SUPPLIES
          </h2>
          <p className="strat-sub">Freshness guaranteed, every single order.</p>
        </div>
      </div>
    )
  }

  // ── DESKTOP: full scroll animation ───────────────────────────────────────
  const initVh = typeof window !== 'undefined' ? window.innerHeight : 900
  const initVw = typeof window !== 'undefined' ? window.innerWidth : 1440
  const initialHeroStartY = -initVh * 0.05
  const initialHeroStartX = -initVw * 0.22

  return (
    <div className="ss-wrap" ref={wrapRef}>
      <div className="ss-sticky">

        {/* ══ HERO GREEN BG ══ */}
        <div className="ss-hero-bg">
          <HeroNav />

          <div className="hero-stats">
            <div className="stat-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f5e642" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M12 6v6l4 2"/></svg>
              <strong>Served over 5M+ meals</strong>
            </div>
            <div className="stat-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f5e642" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <strong>Trusted by 65M+ foodies</strong>
            </div>
          </div>

          <div className="hero-content">
            <h1 className="hero-headline">
              FOOD<br />THAT<br /><span className="hl-yellow">DELIGHTS</span>
            </h1>
            <p className="hero-subtext">Fresh meals, lightning-fast delivery, and unforgettable flavours!</p>
            <div className="hero-cta-row">
              <button className="cta-icon" aria-label="Order now">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0f3d1f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
              </button>
              <button className="cta-pill">Order now</button>
            </div>
          </div>

          <div className="hero-drip" aria-hidden="true">
            <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,120 L0,70 Q50,70 50,42 Q50,16 72,16 Q94,16 94,42 Q94,70 144,70 Q194,70 194,38 Q194,8 218,8 Q242,8 242,38 Q242,70 296,70 Q346,70 346,44 Q346,16 370,16 Q394,16 394,44 Q394,70 446,70 Q496,70 496,50 Q496,26 520,26 Q544,26 544,50 Q544,70 596,70 Q650,70 650,38 Q650,8 674,8 Q698,8 698,38 Q698,70 752,70 Q806,70 806,42 Q806,16 828,16 Q850,16 850,42 Q850,70 902,70 Q952,70 952,44 Q952,16 976,16 Q1000,16 1000,44 Q1000,70 1052,70 Q1104,70 1104,50 Q1104,26 1128,26 Q1152,26 1152,50 Q1152,70 1204,70 Q1256,70 1256,38 Q1256,8 1278,8 Q1300,8 1300,38 Q1300,70 1354,70 Q1406,70 1406,42 Q1406,16 1426,20 Q1440,24 1440,70 L1440,120 Z" fill="#ffffff" />
            </svg>
          </div>
        </div>

        {/* ══ STRATEGY WHITE BG ══ */}
        <div className="ss-strat-bg" ref={stratBgRef} style={{ transform: 'translateY(100%)', opacity: 0 }}>
          <div className="strat-drip-top" aria-hidden="true">
            <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,0 L0,50 Q50,50 50,80 Q50,106 72,106 Q94,106 94,80 Q94,50 144,50 Q194,50 194,84 Q194,112 218,112 Q242,112 242,84 Q242,50 296,50 Q346,50 346,78 Q346,106 370,106 Q394,106 394,78 Q394,50 446,50 Q496,50 496,70 Q496,92 520,92 Q544,92 544,70 Q544,50 596,50 Q650,50 650,84 Q650,112 674,112 Q698,112 698,84 Q698,50 752,50 Q806,50 806,80 Q806,106 828,106 Q850,106 850,80 Q850,50 902,50 Q952,50 952,78 Q952,106 976,106 Q1000,106 1000,78 Q1000,50 1052,50 Q1104,50 1104,70 Q1104,92 1128,92 Q1152,92 1152,70 Q1152,50 1204,50 Q1256,50 1256,84 Q1256,112 1278,112 Q1300,112 1300,84 Q1300,50 1354,50 Q1406,50 1406,80 Q1406,106 1426,100 Q1440,96 1440,50 L1440,0 Z" fill="#1e7d3a" />
            </svg>
          </div>

          <div className="strat-labels" ref={labelsRef} style={{ opacity: 0 }}>
            <div className="strat-label-left">
              <span className="lbl-small">Focus</span>
              <span className="lbl-main">Food Strategy</span>
            </div>
            <div className="strat-label-right">
              <span className="lbl-small">Meals Impacted</span>
              <span className="lbl-main">5M+</span>
            </div>
          </div>

          <div className="strat-text" ref={stratTextRef}>
            <h2 className="strat-headline" ref={headlineRef} style={{ opacity: 0, transform: 'translateY(28px)' }}>
              <span className="hl-red">GETS DELIVERED</span> EVERY<br />TIME YOUR SUPPLIES
            </h2>
            <p className="strat-sub" ref={subRef} style={{ opacity: 0, transform: 'translateY(20px)' }}>
              Freshness guaranteed, every single order.
            </p>
          </div>
        </div>

        {/* ══ CARDS ══ */}
        <div className="ss-cards-layer">
          {CARDS.map((card, i) => (
            <div
              key={card.id}
              ref={el => { cardRefs.current[i] = el }}
              className="ss-card"
              style={{
                background: card.bg,
                zIndex: i === ANCHOR_INDEX ? 20 : i + 1,
                transform: `translate(${initialHeroStartX + (i - 3.5) * 4}px, ${initialHeroStartY + Math.abs(i - 3.5) * -2}px) rotate(${(i - 3.5) * 5}deg)`,
              }}
            >
              <img src={card.img} alt="" className="ss-card-img" />
              <div className="ss-card-badge">{card.label}</div>
            </div>
          ))}

          {/* <div className="ss-badge" ref={badgeRef} style={{ transform: 'translate(-50%, 60px) scale(0)', opacity: 0 }}>
            <span>🍔</span>
            <span className="badge-txt">BILLIONS<br />OF MEALS</span>
          </div> */}
        </div>

      </div>
    </div>
  )
}
