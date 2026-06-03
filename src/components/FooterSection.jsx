import { useEffect, useRef, useState } from 'react'
import './FooterSection.css'

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v))
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

export default function FooterSection() {
  const wrapRef    = useRef(null)
  const bigTextRef = useRef(null)
  const topRef     = useRef(null)
  const [email, setEmail] = useState('')

  useEffect(() => {
    function tick() {
      const wrap = wrapRef.current
      const big  = bigTextRef.current
      const top  = topRef.current
      if (!wrap || !big || !top) return

      const rect = wrap.getBoundingClientRect()
      const winH = window.innerHeight

      // Footer not in view yet — keep everything hidden
      if (rect.top > winH) {
        top.style.opacity   = '0'
        top.style.transform = 'translateY(32px)'
        big.style.transform = 'translateY(110%)'
        big.style.opacity   = '0'
        return
      }

      // Progress: 0 when footer top hits viewport bottom → 1 when ~55% scrolled in
      const enterStart = winH
      const enterEnd   = winH * 0.35
      const raw        = clamp((enterStart - rect.top) / (enterStart - enterEnd), 0, 1)

      const topP = easeOutCubic(clamp(raw / 0.35, 0, 1))
      top.style.opacity   = String(topP)
      top.style.transform = `translateY(${(1 - topP) * 32}px)`

      // Big text rises from below the clip — only after top content starts showing
      const textRaw = clamp((raw - 0.12) / 0.55, 0, 1)
      const textP   = easeOutCubic(textRaw)
      big.style.transform = `translateY(${(1 - textP) * 110}%)`
      big.style.opacity   = String(textP)
    }

    window.addEventListener('scroll', tick, { passive: true })
    window.addEventListener('resize', tick, { passive: true })
    tick()
    return () => {
      window.removeEventListener('scroll', tick)
      window.removeEventListener('resize', tick)
    }
  }, [])

  function handleSubscribe(e) {
    e.preventDefault()
    if (email.trim()) {
      alert(`Thanks for subscribing with ${email}!`)
      setEmail('')
    }
  }

  return (
    <footer className="ft-wrap" ref={wrapRef}>

      <div className="ft-accent" aria-hidden="true" />

      <div className="ft-inner">
        <div className="ft-top" ref={topRef}>

          <div className="ft-left">
            <p className="ft-tagline">
              Made for Food Lovers.<br />
              Built for Storytellers.
            </p>

            <p className="ft-subscribe-label">Newsletter</p>
            <form className="ft-subscribe" onSubmit={handleSubscribe}>
              <input
                type="email"
                className="ft-input"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                aria-label="Email address"
              />
              <button type="submit" className="ft-btn">Subscribe</button>
            </form>

            <p className="ft-legal">© 2025 BuddieFood. All Rights Reserved.</p>
          </div>

          <div className="ft-links">
            <div className="ft-col">
              <h4 className="ft-col-title">Company</h4>
              <ul className="ft-col-list">
                <li><a href="#">Our Expertise</a></li>
                <li><a href="#">Pricing</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Contact Us</a></li>
              </ul>
            </div>
            <div className="ft-col">
              <h4 className="ft-col-title">Social</h4>
              <ul className="ft-col-list">
                <li><a href="#">Instagram</a></li>
                <li><a href="#">X</a></li>
                <li><a href="#">LinkedIn</a></li>
              </ul>
            </div>
          </div>

        </div>

        <div className="ft-bigtext-clip" aria-hidden="true">
          <div className="ft-bigtext" ref={bigTextRef}>
            BUDDIEFOOD<span className="ft-reg">®</span>
          </div>
        </div>
      </div>

    </footer>
  )
}
