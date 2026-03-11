import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ArrowRight, Zap, Users, ShieldCheck, Star, BookOpen, Music, Globe, Code, Utensils, Palette, Dumbbell } from 'lucide-react';

const SKILLS = [
  { icon: '🎸', name: 'Guitar' }, { icon: '🌍', name: 'Spanish' }, { icon: '💻', name: 'React' },
  { icon: '🍣', name: 'Sushi' }, { icon: '📷', name: 'Photography' }, { icon: '🎹', name: 'Piano' },
  { icon: '🧘', name: 'Yoga' }, { icon: '✏️', name: 'Drawing' }, { icon: '🐍', name: 'Python' },
  { icon: '🎨', name: 'Painting' }, { icon: '🍕', name: 'Baking' }, { icon: '🗣️', name: 'French' },
];

const FEATURES = [
  { icon: '⚡', cls: 'fi-v', title: 'Zero Cost',         desc: 'No subscriptions. Trade an hour of your time and expertise.' },
  { icon: '🤝', cls: 'fi-p', title: 'Mutual Matching',   desc: 'Find swap partners who want exactly what you can offer.' },
  { icon: '⭐', cls: 'fi-g', title: 'Build Reputation',  desc: 'Earn trust through reviews and verified sessions.' },
  { icon: '🔒', cls: 'fi-o', title: 'Safe & Private',    desc: 'Review profiles and connect only when you\'re ready.' },
];

const STEPS = [
  { n: '01', title: 'Create Your Profile', desc: 'List what you can teach and what you want to learn. Add your availability.' },
  { n: '02', title: 'Find a Match',        desc: 'Browse skill listings or search for a specific topic. Filter by your city.' },
  { n: '03', title: 'Swap & Learn',        desc: 'Exchange knowledge, earn skill coins, and leave a review after each session.' },
];

const Home = () => {
  const { currentUser } = useAuth();
  const doubled = [...SKILLS, ...SKILLS]; // for seamless marquee loop

  return (
    <div className="page-main" style={{ paddingTop: 0, maxWidth: '100%', padding: 0 }}>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div className="hero-blob hero-blob-3" />

        <div className="hero-content">
          <div className="hero-pill animate-fade-up">
            <span className="hero-pill-dot" />
            Now live · Join 2,400+ skill-swappers
          </div>

          <h1 className="animate-fade-up-2">
            Trade Skills.<br />
            <span className="gradient-text">Not Money.</span>
          </h1>

          <p className="hero-sub animate-fade-up-2">
            I'll teach you guitar — you teach me Spanish.
            The community-powered time bank where knowledge is the currency.
          </p>

          <div className="hero-ctas animate-fade-up-3">
            {currentUser ? (
              <Link to="/browse" className="btn btn-primary btn-xl">
                Browse Skills <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary btn-xl">
                  Get Started Free <ArrowRight size={18} />
                </Link>
                <Link to="/browse" className="btn btn-secondary btn-xl">
                  Explore Skills
                </Link>
              </>
            )}
          </div>

          <div className="hero-stats animate-fade-up-3">
            {[['2,400+', 'Active Members'], ['180+', 'Skills Listed'], ['4.9★', 'Avg. Rating'], ['100%', 'Free Forever']].map(([n, l]) => (
              <div key={l}>
                <span className="hero-stat-num">{n}</span>
                <span className="hero-stat-lbl">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Skills Marquee ── */}
      <div style={{ padding: '0 0 4rem' }}>
        <p style={{ textAlign: 'center', fontSize: '.78rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--clr-muted)', marginBottom: '1.25rem' }}>
          Skills available to swap right now
        </p>
        <div className="skills-marquee-wrap">
          <div className="skills-marquee">
            {doubled.map((s, i) => (
              <div key={i} className="marquee-chip">
                <span>{s.icon}</span> {s.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Container for sections */}
      <div className="container">

        {/* ── How it Works ── */}
        <section className="section">
          <div className="section-header">
            <span className="section-tag">How It Works</span>
            <h2>Simple as 1-2-3</h2>
            <p>SkillSwap is designed to be frictionless. No payments, no red tape — just people sharing knowledge.</p>
          </div>
          <div className="steps-grid">
            {STEPS.map(s => (
              <div key={s.n} className="step-card animate-fade-up">
                <div className="step-num">{s.n}</div>
                <h3>{s.title}</h3>
                <p style={{ fontSize: '.875rem' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section className="section">
          <div className="section-header">
            <span className="section-tag">Why SkillSwap</span>
            <h2>Built for Real Learning</h2>
            <p>Not just another app — a community that values knowledge over money.</p>
          </div>
          <div className="features-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="feature-card animate-fade-up">
                <div className={`feature-icon ${f.cls}`}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA Banner ── */}
        {!currentUser && (
          <section className="section">
            <div className="cta-banner">
              <span className="section-tag">Free Forever</span>
              <h2 style={{ marginTop: '.5rem' }}>Ready to start learning?</h2>
              <p style={{ maxWidth: '400px', margin: '.75rem auto 2rem' }}>
                Create your profile in 2 minutes and start trading skills with people in your city.
              </p>
              <Link to="/login" className="btn btn-primary btn-xl">
                Join the Community <ArrowRight size={18} />
              </Link>
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default Home;
