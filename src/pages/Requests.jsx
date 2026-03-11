import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';
import { useChat } from '../hooks/useChat';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, CheckCircle2, X } from 'lucide-react';

const Requests = () => {
  const { currentUser, userData } = useAuth();
  const { getDocuments, updateDocument, getDocument } = useFirestore('swapRequests');
  const { getOrCreateChat } = useChat();
  const navigate = useNavigate();
  const [tab, setTab] = useState('incoming');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const load = async () => {
      try {
        const all = await getDocuments();
        setRequests(all.filter(r => r.fromUserId === currentUser.uid || r.toUserId === currentUser.uid));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [currentUser]);

  const incoming = requests.filter(r => r.toUserId   === currentUser?.uid);
  const outgoing = requests.filter(r => r.fromUserId === currentUser?.uid);
  const displayed = tab === 'incoming' ? incoming : outgoing;

  const update = async (id, status, request) => {
    await updateDocument(id, { status });
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    
    // If accepted, create a chat room
    if (status === 'accepted') {
      try {
        const { getDocument: getUserDoc } = useFirestore('users');
        const fromUser = await getUserDoc(request.fromUserId);
        const toUser = await getUserDoc(request.toUserId);
        
        await getOrCreateChat(
          request.fromUserId,
          request.toUserId,
          { displayName: fromUser.displayName, photoURL: fromUser.photoURL },
          { displayName: toUser.displayName, photoURL: toUser.photoURL }
        );
      } catch (error) {
        console.error('Error creating chat:', error);
      }
    }
  };

  const StatusBadge = ({ status }) => {
    const map = { pending: 'badge-yellow', accepted: 'badge-green', declined: 'badge-red', completed: 'badge-violet' };
    return <span className={`badge ${map[status] || 'badge-yellow'}`}>{status}</span>;
  };

  return (
    <div className="page-main animate-fade-up">
      <h1 style={{ marginBottom: '.5rem' }}>Swap Requests</h1>
      <p style={{ marginBottom: '2rem' }}>Manage your incoming and outgoing skill swap requests.</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '.25rem', background: 'var(--clr-surface)', padding: '.25rem', borderRadius: 'var(--r-md)', border: '1px solid var(--clr-border)', width: 'fit-content', marginBottom: '1.5rem' }}>
        {['incoming', 'outgoing'].map(t => (
          <button
            key={t}
            className={`msg-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
            style={{ padding: '.45rem 1.25rem', textTransform: 'capitalize', border: 'none' }}
          >
            {t} {t === 'incoming' ? `(${incoming.length})` : `(${outgoing.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner" /></div>
      ) : displayed.length === 0 ? (
        <div className="empty-state glass" style={{ padding: '4rem 2rem' }}>
          <MessageSquare size={48} />
          <h3>No {tab} requests yet</h3>
          <p>{tab === 'incoming' ? "When someone requests a skill swap with you, it'll appear here." : 'Browse skills and send a swap request to get started!'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {displayed.map(req => (
            <div key={req.id} className="glass" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.75rem' }}>
                    <StatusBadge status={req.status} />
                    <span style={{ fontSize: '.8rem', color: 'var(--clr-muted)', fontWeight: 600 }}>
                      {req.createdAt?.toDate?.().toLocaleDateString() || 'Recently'}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '.35rem' }}>
                    <span style={{ color: 'var(--clr-accent)' }}>{req.skillRequested}</span>
                    {' ↔ '}
                    <span style={{ color: '#f472b6' }}>{req.skillOffered}</span>
                  </h3>
                  {req.message && (
                    <p style={{ fontSize: '.85rem', marginTop: '.5rem', padding: '.75rem', background: 'rgba(255,255,255,.03)', borderRadius: 'var(--r-md)', border: '1px solid var(--clr-border)' }}>
                      "{req.message}"
                    </p>
                  )}
                </div>

                {tab === 'incoming' && req.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '.5rem', flexShrink: 0 }}>
                    <button className="btn btn-danger btn-sm" onClick={() => update(req.id, 'declined', req)}>
                      <X size={14} /> Decline
                    </button>
                    <button className="btn btn-primary btn-sm" style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }} onClick={() => update(req.id, 'accepted', req)}>
                      <CheckCircle2 size={14} /> Accept
                    </button>
                  </div>
                )}

                {req.status === 'accepted' && (
                  <button 
                    className="btn btn-secondary btn-sm" 
                    onClick={() => navigate('/messages')}
                  >
                    <MessageSquare size={14} /> Go to Messages
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Requests;
