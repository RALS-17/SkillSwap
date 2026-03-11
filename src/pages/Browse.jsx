import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, ChevronRight } from 'lucide-react';
import { useSkills } from '../hooks/useSkills';
import { useAuth } from '../hooks/useAuth';

const CATS = ['All', 'Music', 'Languages', 'Tech', 'Cooking', 'Art', 'Fitness', 'Other'];

const Browse = () => {
  const { currentUser } = useAuth();
  const { searchTeachers, loading } = useSkills();
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async (term = '', category = '') => {
    const results = await searchTeachers(term || undefined, category || undefined);
    setTeachers(results.filter(t => t.id !== currentUser?.uid));
  };

  const doSearch = (e) => {
    e.preventDefault();
    loadTeachers(search, cat === 'All' ? '' : cat.toLowerCase());
  };

  const handleCat = (c) => {
    setCat(c);
    loadTeachers(search, c === 'All' ? '' : c.toLowerCase());
  };

  const avatarFor = (u) =>
    u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.displayName || 'U')}&background=7c3aed&color=fff`;

  return (
    <div className="page-main">

      {/* Header */}
      <div className="browse-header">
        <h1 className="animate-fade-up" style={{ marginBottom: '.5rem' }}>Discover Skills</h1>
        <p className="animate-fade-up-2" style={{ marginBottom: '1.75rem', fontSize: '1rem' }}>
          Browse skill-swappers in your community. Find the perfect match.
        </p>

        {/* Search bar */}
        <form onSubmit={doSearch}>
          <div className="search-bar-wrap animate-fade-up-2" style={{ maxWidth: '560px' }}>
            <Search size={18} style={{ color: 'var(--clr-muted)', flexShrink: 0 }} />
            <input
              id="skill-search-input"
              type="text"
              placeholder="Search for a skill (e.g. Guitar, Python…)"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
              {loading ? '…' : 'Search'}
            </button>
          </div>
        </form>
      </div>

      {/* Category pills */}
      <div className="category-pills">
        {CATS.map(c => (
          <button key={c} className={`cat-pill ${cat === c ? 'active' : ''}`} onClick={() => handleCat(c)}>
            {c}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="loading-screen">
          <div className="spinner" />
          <p>Finding swap partners…</p>
        </div>
      ) : teachers.length === 0 ? (
        <div className="empty-state">
          <Search size={48} />
          <h3>No swap partners found</h3>
          <p>Try a different skill or category. More people join every day!</p>
        </div>
      ) : (
        <div className="teachers-grid">
          {teachers.map(t => (
            <Link key={t.id} to={`/profile/${t.id}`} className="teacher-card">
              {/* Banner */}
              <div className="tc-banner">
                <div className="tc-banner-overlay" />
              </div>

              <div className="tc-body">
                <div className="tc-avatar-wrap">
                  <img src={avatarFor(t)} alt={t.displayName} className="tc-avatar" />
                </div>

                <div className="tc-name">{t.displayName}</div>

                <div className="tc-meta">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '.25rem' }}>
                    <MapPin size={12} /> {t.location || 'Remote'}
                  </span>
                  {t.rating && (
                    <span className="tc-rating">
                      <Star size={12} style={{ fill: 'currentColor' }} /> {t.rating.toFixed(1)}
                    </span>
                  )}
                </div>

                <p className="tc-bio">{t.bio || 'No bio yet.'}</p>

                {t.skillsToTeach?.length > 0 && (
                  <div>
                    <div className="tc-skills-label">Teaches</div>
                    <div className="tc-skill-tags">
                      {t.skillsToTeach.slice(0, 4).map((s, i) => (
                        <span key={i} className="tc-skill-tag">{s.name}</span>
                      ))}
                      {t.skillsToTeach.length > 4 && (
                        <span style={{ fontSize: '.73rem', color: 'var(--clr-muted)', alignSelf: 'center' }}>
                          +{t.skillsToTeach.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {t.skillsToLearn?.length > 0 && (
                  <p style={{ fontSize: '.78rem', color: 'var(--clr-muted)', marginTop: '.6rem' }}>
                    <strong style={{ color: 'var(--clr-text)', fontWeight: 600 }}>Wants to learn:</strong>{' '}
                    {t.skillsToLearn.map(s => s.name).join(', ')}
                  </p>
                )}

                <div className="tc-footer">
                  <span className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                    View Profile <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Browse;
