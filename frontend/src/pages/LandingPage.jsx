import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const DEMO_EMAIL = 'sbh123yadav@gmail.com'
const DEMO_PASSWORD = 'Abhishek#123'

/* ─── tiny hook: count-up on scroll into view ─── */
function useCountUp(target, duration = 1800) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const start = performance.now()
          const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1)
            const ease = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(ease * target))
            if (progress < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return [count, ref]
}

/* ─── stat badge ─── */
function StatBadge({ value, suffix, label }) {
  const [count, ref] = useCountUp(value)
  return (
    <div ref={ref} className="lp-stat">
      <span className="lp-stat-number">
        {count.toLocaleString()}
        {suffix}
      </span>
      <span className="lp-stat-label">{label}</span>
    </div>
  )
}

/* ─── feature card ─── */
function FeatureCard({ icon, title, body, delay = 0 }) {
  return (
    <div className="lp-feature-card" style={{ animationDelay: `${delay}ms` }}>
      <div className="lp-feature-icon">{icon}</div>
      <h3 className="lp-feature-title">{title}</h3>
      <p className="lp-feature-body">{body}</p>
    </div>
  )
}

/* ─── floating pill ─── */
function Pill({ children }) {
  return <span className="lp-pill">{children}</span>
}

/* ─── main component ─── */
export function LandingPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [demoLoading, setDemoLoading] = useState(false)
  const [demoError, setDemoError] = useState('')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  async function handleTryDemo() {
    setDemoLoading(true)
    setDemoError('')
    try {
      await signIn({ email: DEMO_EMAIL, password: DEMO_PASSWORD })
      navigate('/app', { replace: true })
    } catch (err) {
      setDemoError(err.message || 'Demo sign-in failed. Please try again.')
      setDemoLoading(false)
    }
  }

  return (
    <div className="lp-root">
      {/* ── animated background ── */}
      <div className="lp-bg-grid" aria-hidden="true" />
      <div className="lp-bg-orb lp-bg-orb-1" aria-hidden="true" />
      <div className="lp-bg-orb lp-bg-orb-2" aria-hidden="true" />
      <div className="lp-bg-orb lp-bg-orb-3" aria-hidden="true" />

      {/* ── NAV ── */}
      <nav className={`lp-nav ${scrolled ? 'lp-nav--scrolled' : ''}`}>
        <div className="lp-nav-inner">
          <a href="#" className="lp-logo" aria-label="Curalink Home">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <rect width="28" height="28" rx="8" fill="url(#logoGrad)" />
              <path
                d="M8 14c0-3.314 2.686-6 6-6s6 2.686 6 6-2.686 6-6 6"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="14" cy="14" r="2.5" fill="#fff" />
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00C896" />
                  <stop offset="1" stopColor="#0090FF" />
                </linearGradient>
              </defs>
            </svg>
            <span className="lp-logo-text">Curalink</span>
          </a>

          <div className="lp-nav-links">
            <a href="#features" className="lp-nav-link">Features</a>
            <a href="#how-it-works" className="lp-nav-link">How it works</a>
            <a href="#stats" className="lp-nav-link">Stats</a>
          </div>

          <div className="lp-nav-actions">
            <a href="/signin" className="lp-btn-ghost">Sign in</a>
            <button
              id="nav-demo-btn"
              onClick={handleTryDemo}
              disabled={demoLoading}
              className="lp-btn-accent"
            >
              {demoLoading ? (
                <span className="lp-spinner" />
              ) : (
                'Try Demo'
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="lp-hero" id="hero">
        <div className="lp-hero-badge">
          <span className="lp-pulse-dot" />
          AI-Powered · Medical Grade · Real-Time RAG
        </div>

        <h1 className="lp-hero-headline">
          Research Smarter.<br />
          <span className="lp-gradient-text">Heal Faster.</span>
        </h1>

        <p className="lp-hero-sub">
          Curalink is your intelligent medical research co-pilot — surfacing evidence, summarising literature,
          and delivering source-attributed answers so clinicians can focus on what matters most.
        </p>

        <div className="lp-hero-pills">
          <Pill>🧬 PubMed Integration</Pill>
          <Pill>🔬 Clinical Trials</Pill>
          <Pill>📄 RAG Pipeline</Pill>
          <Pill>🏥 HIPAA-ready</Pill>
        </div>

        {demoError && (
          <p className="lp-demo-error" role="alert">{demoError}</p>
        )}

        <div className="lp-hero-cta">
          <button
            id="hero-demo-btn"
            onClick={handleTryDemo}
            disabled={demoLoading}
            className="lp-btn-primary"
          >
            {demoLoading ? (
              <>
                <span className="lp-spinner lp-spinner--dark" />
                Signing in…
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 3l14 9-14 9V3z" fill="currentColor" />
                </svg>
                Try Demo — free
              </>
            )}
          </button>
          <a href="/signup" className="lp-btn-secondary">Create account →</a>
        </div>

        <p className="lp-hero-fine">
          No credit card needed · Demo auto-signs you in · Full workspace access
        </p>

        {/* mock terminal window */}
        <div className="lp-terminal">
          <div className="lp-terminal-bar">
            <span className="lp-dot lp-dot-red" />
            <span className="lp-dot lp-dot-yellow" />
            <span className="lp-dot lp-dot-green" />
            <span className="lp-terminal-title">Curalink Research Session</span>
          </div>
          <div className="lp-terminal-body">
            <p className="lp-terminal-line">
              <span className="lp-terminal-user">You</span>
              <span className="lp-terminal-text">What are the latest treatments for stage-III NSCLC?</span>
            </p>
            <p className="lp-terminal-line lp-terminal-line--ai">
              <span className="lp-terminal-user lp-terminal-user--ai">Curalink</span>
              <span className="lp-terminal-text">
                Based on 14 peer-reviewed sources (NEJM, Lancet Oncology, JCO), current first-line
                therapy for stage-III NSCLC involves concurrent chemoradiotherapy followed by
                durvalumab consolidation (PACIFIC trial, OS benefit 18.4 mo)…
              </span>
            </p>
            <div className="lp-terminal-sources">
              <span className="lp-source-tag">NEJM 2023</span>
              <span className="lp-source-tag">Lancet Oncol 2022</span>
              <span className="lp-source-tag">JCO 2024</span>
              <span className="lp-cursor-blink" />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="lp-stats-section" id="stats">
        <div className="lp-section-inner">
          <StatBadge value={50000} suffix="+" label="Research papers indexed" />
          <div className="lp-stats-divider" />
          <StatBadge value={98} suffix="%" label="Source attribution accuracy" />
          <div className="lp-stats-divider" />
          <StatBadge value={3} suffix="s" label="Average answer latency" />
          <div className="lp-stats-divider" />
          <StatBadge value={120} suffix="+" label="Clinical specialties covered" />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="lp-section" id="features">
        <div className="lp-section-inner lp-section-inner--col">
          <div className="lp-section-header">
            <p className="lp-section-eyebrow">Features</p>
            <h2 className="lp-section-title">Everything a clinician researcher needs</h2>
            <p className="lp-section-sub">
              Curalink combines a state-of-the-art RAG pipeline with deeply curated medical knowledge graphs so
              you always get grounded, verifiable answers.
            </p>
          </div>

          <div className="lp-feature-grid">
            <FeatureCard
              delay={0}
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="currentColor" />
                </svg>
              }
              title="Semantic RAG Search"
              body="Pinecone-backed vector search over 50K+ indexed papers delivers sub-3-second answers with precise chunk-level citations."
            />
            <FeatureCard
              delay={80}
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14l4-4h12c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" fill="currentColor" />
                </svg>
              }
              title="Conversational Sessions"
              body="Multi-turn medical conversations with full context. Resume any session and drill deeper into any finding without losing thread."
            />
            <FeatureCard
              delay={160}
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 16.17L4.83 12 3.41 13.41 9 19 21 7 19.59 5.59z" fill="currentColor" />
                </svg>
              }
              title="Source Attribution"
              body="Every answer links directly to its source paper, trial, or guideline. No hallucinations, no ambiguity — just evidence."
            />
            <FeatureCard
              delay={240}
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill="currentColor" />
                </svg>
              }
              title="Clinical Trial Matching"
              body="Automatically surfaces relevant open trials from ClinicalTrials.gov matched to patient context and diagnostic criteria."
            />
            <FeatureCard
              delay={320}
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 3h18v2H3V3zm0 4h12v2H3V7zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm0 4h18v2H3v-2z" fill="currentColor" />
                </svg>
              }
              title="Structured Summaries"
              body="Automatically generated PICO-formatted summaries, drug interaction flags, and evidence-grade ratings for every query."
            />
            <FeatureCard
              delay={400}
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm1 14.93V17h-2v-.07A8.001 8.001 0 014 9h2a6 6 0 0011.65 2H19a8.001 8.001 0 01-6 5.93z" fill="currentColor" />
                </svg>
              }
              title="Specialty Workflows"
              body="Pre-built workflows for oncology, cardiology, and 120+ other specialties — each tuned to canonical guidelines and terminology."
            />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="lp-section lp-section--alt" id="how-it-works">
        <div className="lp-section-inner lp-section-inner--col">
          <div className="lp-section-header">
            <p className="lp-section-eyebrow">How it works</p>
            <h2 className="lp-section-title">From question to evidence in seconds</h2>
          </div>
          <div className="lp-steps">
            <div className="lp-step">
              <div className="lp-step-num">01</div>
              <div className="lp-step-content">
                <h3 className="lp-step-title">Ask in plain language</h3>
                <p className="lp-step-body">Type your clinical question exactly as you'd ask a colleague. No query syntax required.</p>
              </div>
            </div>
            <div className="lp-step-connector" aria-hidden="true" />
            <div className="lp-step">
              <div className="lp-step-num">02</div>
              <div className="lp-step-content">
                <h3 className="lp-step-title">RAG retrieves evidence</h3>
                <p className="lp-step-body">Our pipeline embeds your query, retrieves the most relevant chunks, and re-ranks by clinical relevance.</p>
              </div>
            </div>
            <div className="lp-step-connector" aria-hidden="true" />
            <div className="lp-step">
              <div className="lp-step-num">03</div>
              <div className="lp-step-content">
                <h3 className="lp-step-title">LLM synthesises with citations</h3>
                <p className="lp-step-body">A medically fine-tuned LLM weaves retrieved passages into a structured, citation-linked answer.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="lp-cta-banner">
        <div className="lp-cta-inner">
          <h2 className="lp-cta-title">Ready to accelerate your research?</h2>
          <p className="lp-cta-sub">
            Join clinicians using Curalink to cut literature review time by 70%.
          </p>
          {demoError && (
            <p className="lp-demo-error" role="alert">{demoError}</p>
          )}
          <div className="lp-cta-buttons">
            <button
              id="cta-demo-btn"
              onClick={handleTryDemo}
              disabled={demoLoading}
              className="lp-btn-primary"
            >
              {demoLoading ? (
                <>
                  <span className="lp-spinner lp-spinner--dark" />
                  Signing in…
                </>
              ) : (
                'Try Demo — free'
              )}
            </button>
            <a href="/signup" className="lp-btn-secondary">Create account</a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <a href="#" className="lp-logo" aria-label="Curalink">
              <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <rect width="28" height="28" rx="8" fill="url(#logoGrad2)" />
                <path d="M8 14c0-3.314 2.686-6 6-6s6 2.686 6 6-2.686 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                <circle cx="14" cy="14" r="2.5" fill="#fff" />
                <defs>
                  <linearGradient id="logoGrad2" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#00C896" />
                    <stop offset="1" stopColor="#0090FF" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="lp-logo-text">Curalink</span>
            </a>
            <p className="lp-footer-tagline">AI-powered medical research assistant.</p>
          </div>
          <div className="lp-footer-links">
            <a href="/signin" className="lp-footer-link">Sign in</a>
            <a href="/signup" className="lp-footer-link">Sign up</a>
            <a href="#features" className="lp-footer-link">Features</a>
            <a href="#how-it-works" className="lp-footer-link">How it works</a>
          </div>
        </div>
        <p className="lp-footer-copy">© {new Date().getFullYear()} Curalink. Built for clinicians, by clinicians.</p>
      </footer>
    </div>
  )
}
