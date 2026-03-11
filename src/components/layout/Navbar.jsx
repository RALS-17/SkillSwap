import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, Search, MessageSquare, User, LogOut, Menu, X, Zap } from 'lucide-react';

const Navbar = () => {
  const { currentUser, logout, userData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try { await logout(); navigate('/login'); } catch (e) { console.error(e); }
  };

  const navLinks = [
    { name: 'Home',    path: '/',        icon: Home          },
    { name: 'Browse',  path: '/browse',  icon: Search        },
    ...(currentUser ? [
      { name: 'Messages', path: '/messages', icon: MessageSquare },
      { name: 'Profile',  path: '/profile',  icon: User          },
    ] : []),
  ];

  const isActive = (p) => location.pathname === p;

  const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.displayName || 'U')}&background=7c3aed&color=fff`;

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* Logo */}
        <Link to="/" className="nav-logo">
          <div className="nav-logo-icon"><Zap size={17} /></div>
          SkillSwap
        </Link>

        {/* Desktop links */}
        <div className="nav-links">
          {navLinks.map(l => {
            const Icon = l.icon;
            return (
              <Link key={l.path} to={l.path} className={`nav-link ${isActive(l.path) ? 'active' : ''}`}>
                <Icon size={15} /> {l.name}
              </Link>
            );
          })}
        </div>

        {/* Desktop actions */}
        <div className="nav-actions hide-mobile">
          {currentUser ? (
            <>
              <img
                src={currentUser.photoURL || avatarFallback}
                alt="avatar"
                className="nav-avatar"
                onClick={() => navigate('/profile')}
              />
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">Sign In</Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="btn btn-ghost btn-sm nav-mobile-toggle"
          onClick={() => setMenuOpen(o => !o)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`nav-mobile-menu ${menuOpen ? 'open' : ''}`}>
        {navLinks.map(l => {
          const Icon = l.icon;
          return (
            <Link
              key={l.path}
              to={l.path}
              className={`nav-mobile-link ${isActive(l.path) ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <Icon size={17} /> {l.name}
            </Link>
          );
        })}

        <div className="nav-divider" />
        {currentUser ? (
          <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="nav-mobile-link" style={{ border: 'none', cursor: 'pointer', background: 'transparent', width: '100%', textAlign: 'left' }}>
            <LogOut size={17} /> Logout
          </button>
        ) : (
          <Link to="/login" className="nav-mobile-link" onClick={() => setMenuOpen(false)}>
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
