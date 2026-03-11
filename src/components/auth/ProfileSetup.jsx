import React, { useState, useRef, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { MapPin, User, FileText, X, Zap } from 'lucide-react';

const STEP_LABELS = ['Basic Info', 'Teach', 'Learn'];

const ProfileSetup = () => {
  const { currentUser, setUserData } = useAuth();
  const navigate = useNavigate();
  const [step, setStep]   = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    displayName: currentUser?.displayName || '',
    bio: '',
    location: '',
  });
  const [teachSkills, setTeachSkills] = useState([]);
  const [learnSkills, setLearnSkills] = useState([]);
  const [teachInput, setTeachInput]   = useState('');
  const [learnInput, setLearnInput]   = useState('');

  const addSkill = (list, setList, input, setInput) => {
    const v = input.trim();
    if (v && !list.find(s => s.name.toLowerCase() === v.toLowerCase())) {
      setList(prev => [...prev, { skillId: v.toLowerCase(), name: v, level: 'intermediate' }]);
    }
    setInput('');
  };

  const removeSkill = (list, setList, idx) => {
    setList(list.filter((_, i) => i !== idx));
  };

  const handleKeyDown = (e, list, setList, input, setInput) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      addSkill(list, setList, input, setInput);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const profileData = {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: form.displayName,
        photoURL: currentUser.photoURL || null,
        bio: form.bio,
        location: form.location,
        skillsToTeach: teachSkills,
        skillsToLearn: learnSkills,
        rating: 5.0,
        profileComplete: true,
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'users', currentUser.uid), profileData);
      setUserData(profileData);
      navigate('/browse');
    } catch (e) {
      console.error(e);
      setError('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-page animate-fade-up" style={{ marginTop: '2rem' }}>

      {/* Progress */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '.6rem', marginBottom: '2rem' }}>
        {STEP_LABELS.map((l, i) => (
          <React.Fragment key={l}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: i <= step ? 'linear-gradient(135deg,#7c3aed,#ec4899)' : 'var(--clr-surface)',
                border: `1px solid ${i <= step ? 'transparent' : 'var(--clr-border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '.75rem', fontWeight: 700,
                color: i <= step ? '#fff' : 'var(--clr-muted)',
                transition: 'all .25s',
              }}>{i + 1}</div>
              <span style={{ fontSize: '.8rem', fontWeight: 600, color: i === step ? 'var(--clr-text)' : 'var(--clr-muted)' }}>{l}</span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div style={{ width: 32, height: 1, background: 'var(--clr-border)', alignSelf: 'center' }} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="setup-card">
        <div className="setup-header">
          <div className="nav-logo-icon" style={{ margin: '0 auto 1rem', width: 48, height: 48, borderRadius: 14, fontSize: '1.2rem' }}>
            <Zap size={20} />
          </div>
          <h2 style={{ fontSize: '1.4rem' }}>Build Your Profile</h2>
          <p style={{ marginTop: '.25rem' }}>
            {step === 0 && 'Tell the community who you are.'}
            {step === 1 && 'What skills can you teach others?'}
            {step === 2 && 'What would you love to learn?'}
          </p>
        </div>

        <div className="setup-body">
          {error && <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>{error}</div>}

          {/* Step 0: Basic Info */}
          {step === 0 && (
            <div>
              <div className="form-group">
                <label><User size={12} style={{ display: 'inline', marginRight: 4 }} />Display Name</label>
                <input
                  type="text"
                  value={form.displayName}
                  onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                  placeholder="How should we call you?"
                  required
                />
              </div>
              <div className="form-group">
                <label><MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="City or neighborhood (e.g. Manila, BGC)"
                  required
                />
              </div>
              <div className="form-group">
                <label><FileText size={12} style={{ display: 'inline', marginRight: 4 }} />Short Bio</label>
                <textarea
                  rows={4}
                  value={form.bio}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="I'm a software engineer who loves cooking on weekends…"
                  required
                />
              </div>
            </div>
          )}

          {/* Step 1: Teach */}
          {step === 1 && (
            <div>
              <p style={{ marginBottom: '1rem', fontSize: '.9rem' }}>
                Press <kbd style={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: 4, padding: '1px 5px', fontSize: '.8em' }}>Enter</kbd> or <kbd style={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: 4, padding: '1px 5px', fontSize: '.8em' }}>,</kbd> after each skill to add it.
              </p>
              <div className="form-group">
                <label>Skills You Can Teach</label>
                <div
                  className="skill-tag-input-wrap"
                  onClick={e => e.currentTarget.querySelector('input')?.focus()}
                >
                  {teachSkills.map((s, i) => (
                    <span key={i} className="skill-tag-item">
                      {s.name}
                      <button type="button" onClick={() => removeSkill(teachSkills, setTeachSkills, i)}><X size={11} /></button>
                    </span>
                  ))}
                  <input
                    className="skill-inline-input"
                    placeholder={teachSkills.length === 0 ? 'Guitar, React, Spanish…' : ''}
                    value={teachInput}
                    onChange={e => setTeachInput(e.target.value)}
                    onKeyDown={e => handleKeyDown(e, teachSkills, setTeachSkills, teachInput, setTeachInput)}
                    onBlur={() => { if (teachInput.trim()) addSkill(teachSkills, setTeachSkills, teachInput, setTeachInput); }}
                  />
                </div>
              </div>
              {teachSkills.length === 0 && (
                <p style={{ fontSize: '.8rem', color: 'var(--clr-danger)' }}>Please add at least one skill you can teach.</p>
              )}
            </div>
          )}

          {/* Step 2: Learn */}
          {step === 2 && (
            <div>
              <p style={{ marginBottom: '1rem', fontSize: '.9rem' }}>
                What would you love to learn? Add as many as you like.
              </p>
              <div className="form-group">
                <label>Skills You Want to Learn</label>
                <div
                  className="skill-tag-input-wrap"
                  onClick={e => e.currentTarget.querySelector('input')?.focus()}
                >
                  {learnSkills.map((s, i) => (
                    <span key={i} className="skill-tag-item" style={{ background: 'rgba(244,114,182,.12)', borderColor: 'rgba(244,114,182,.3)', color: '#f472b6' }}>
                      {s.name}
                      <button type="button" onClick={() => removeSkill(learnSkills, setLearnSkills, i)}><X size={11} /></button>
                    </span>
                  ))}
                  <input
                    className="skill-inline-input"
                    placeholder={learnSkills.length === 0 ? 'Piano, French, Baking…' : ''}
                    value={learnInput}
                    onChange={e => setLearnInput(e.target.value)}
                    onKeyDown={e => handleKeyDown(e, learnSkills, setLearnSkills, learnInput, setLearnInput)}
                    onBlur={() => { if (learnInput.trim()) addSkill(learnSkills, setLearnSkills, learnInput, setLearnInput); }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Nav Buttons */}
          <div style={{ display: 'flex', gap: '.75rem', marginTop: '2rem', justifyContent: 'space-between' }}>
            {step > 0 ? (
              <button type="button" onClick={() => setStep(s => s - 1)} className="btn btn-secondary">
                ← Back
              </button>
            ) : <div />}

            {step < 2 ? (
              <button
                type="button"
                className="btn btn-primary"
                disabled={step === 0 && (!form.displayName || !form.location || !form.bio)}
                onClick={() => {
                  if (step === 1 && teachSkills.length === 0) return;
                  setStep(s => s + 1);
                }}
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                disabled={loading}
                onClick={handleSubmit}
              >
                {loading ? 'Saving…' : '🚀 Complete Setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
