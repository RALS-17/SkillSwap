import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';
import { MapPin, Star, MessageCircle, ArrowRightLeft, CheckCircle, BookOpen } from 'lucide-react';

const LEVEL_COLOR = { beginner: 'badge-green', intermediate: 'badge-yellow', advanced: 'badge-violet' };

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userData: me } = useAuth();
  const { getDocument, loading } = useFirestore('users');
  const [profile, setProfile] = useState(null);
  const isOwn = !userId || userId === currentUser?.uid;

  useEffect(() => {
    const fetch = async () => {
      if (isOwn && me) { setProfile(me); return; }
      const target = userId || currentUser?.uid;
      if (target) { const d = await getDocument(target); setProfile(d); }
    };
    fetch();
  }, [userId, currentUser, me]);

  const avatarSrc = (p) =>
    p?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(p?.displayName || 'U')}&background=7c3aed&color=fff`;

  if (loading || !profile) {
    return <div className="loading-screen"><div className="spinner" /><p>Loading profile…</p></div>;
  }

  return (
    <div className="page-main animate-fade-up">

      {/* ── Cover + Info Card ── */}
      <div className="profile-card">
        <div className="profile-cover">
          <div className="profile-cover-overlay" />
        </div>
        <div className="profile-card-body">
          <div className="profile-avatar-row">
            <img src={avatarSrc(profile)} alt={profile.displayName} className="profile-avatar" />
            <div style={{ display: 'flex', gap: '.75rem' }}>
              {isOwn ? (
                <Link to="/setup" className="btn btn-secondary btn-sm">Edit Profile</Link>
              ) : (
                <>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate('/messages')}>
                    <MessageCircle size={15} /> Message
                  </button>
                  <Link to={`/swap-request/${profile.id || userId}`} className="btn btn-primary btn-sm">
                    <ArrowRightLeft size={15} /> Request Swap
                  </Link>
                </>
              )}
            </div>
          </div>

          <h2 className="profile-name">{profile.displayName}</h2>

          <div className="profile-meta">
            {profile.location && (
              <span className="profile-meta-item"><MapPin size={14} /> {profile.location}</span>
            )}
            {profile.rating && (
              <span className="profile-meta-item">
                <Star size={14} style={{ color: 'var(--clr-warning)', fill: 'var(--clr-warning)' }} />
                {profile.rating.toFixed(1)} rating
              </span>
            )}
            <span className="badge badge-green">
              <CheckCircle size={12} /> Verified
            </span>
          </div>

          <p className="profile-bio">{profile.bio || 'No bio added yet.'}</p>
        </div>
      </div>

      {/* ── Skills Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

        {/* Teaching */}
        <div className="glass" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1.25rem' }}>
            <div className="feature-icon fi-v" style={{ width: 40, height: 40, borderRadius: 10, marginBottom: 0, flexShrink: 0 }}>
              <span style={{ fontSize: '1rem' }}>🎓</span>
            </div>
            <div>
              <h3 style={{ marginBottom: 0, fontSize: '1rem' }}>I Can Teach</h3>
              <p style={{ fontSize: '.78rem', margin: 0 }}>{profile.skillsToTeach?.length || 0} skills listed</p>
            </div>
          </div>

          {profile.skillsToTeach?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              {profile.skillsToTeach.map((s, i) => (
                <div key={i} className="profile-skill-row">
                  <div>
                    <div className="profile-skill-name" style={{ textTransform: 'capitalize' }}>{s.name}</div>
                    <div className="profile-skill-level" style={{ textTransform: 'capitalize' }}>{s.level}</div>
                  </div>
                  <span className={`badge ${LEVEL_COLOR[s.level] || 'badge-violet'}`} style={{ textTransform: 'capitalize', fontSize: '.7rem' }}>{s.level}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '.85rem' }}>No skills listed yet.</p>
          )}
        </div>

        {/* Learning */}
        <div className="glass" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1.25rem' }}>
            <div className="feature-icon fi-p" style={{ width: 40, height: 40, borderRadius: 10, marginBottom: 0, flexShrink: 0 }}>
              <span style={{ fontSize: '1rem' }}>📚</span>
            </div>
            <div>
              <h3 style={{ marginBottom: 0, fontSize: '1rem' }}>Want to Learn</h3>
              <p style={{ fontSize: '.78rem', margin: 0 }}>{profile.skillsToLearn?.length || 0} interests</p>
            </div>
          </div>

          {profile.skillsToLearn?.length ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
              {profile.skillsToLearn.map((s, i) => (
                <span key={i} className="badge badge-pink" style={{ textTransform: 'capitalize' }}>{s.name}</span>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '.85rem' }}>No interests listed yet.</p>
          )}
        </div>
      </div>

      {/* ── Reviews placeholder ── */}
      <div className="glass" style={{ padding: '1.5rem', marginTop: '1.25rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Reviews</h3>
        <div className="empty-state" style={{ padding: '2rem' }}>
          <Star size={36} />
          <h3>No reviews yet</h3>
          <p>Reviews will appear here after completed skill swaps.</p>
        </div>
      </div>

    </div>
  );
};

export default Profile;
