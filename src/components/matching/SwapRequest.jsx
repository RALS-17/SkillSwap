import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFirestore } from '../../hooks/useFirestore';
import { useSkills } from '../../hooks/useSkills';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, MessageSquare, ArrowRightLeft } from 'lucide-react';

const SwapRequest = () => {
  const { userId: teacherId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userData: currentUserData } = useAuth();
  const { getDocument } = useFirestore('users');
  const { createSwapRequest } = useSkills();

  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    skillRequested: '',
    skillOffered: '',
    message: '',
    preferredDay: 'Any',
    preferredTime: 'Any'
  });

  useEffect(() => {
    const fetchTeacher = async () => {
      if (!teacherId) return;
      try {
        const data = await getDocument(teacherId);
        if (data) setTeacher(data);
      } catch (err) {
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };
    fetchTeacher();
  }, [teacherId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.skillRequested || !formData.skillOffered) {
      setError("Please select both skills.");
      return;
    }

    setSubmitting(true);
    try {
      await createSwapRequest(
        currentUser.uid,
        teacherId,
        formData.skillOffered,
        formData.skillRequested,
        `Preferred Time: ${formData.preferredDay} ${formData.preferredTime}\n\n${formData.message}`
      );
      
      // Navigate to messages or a success page
      navigate('/messages', { state: { success: "Swap request sent successfully!" }});
    } catch (err) {
      setError("Failed to send request. Try again later.");
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex-center h-screen">Loading...</div>;
  if (!teacher) return <div className="flex-center h-screen text-danger">User not found.</div>;

  return (
    <div className="swap-request-page max-w-2xl mx-auto mt-8 animate-fade-in">
      <div className="glass-panel p-8">
        
        <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
          <div className="flex items-center gap-4">
             <img 
                src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserData?.displayName || 'User')}&background=random`} 
                alt="You" 
                className="w-12 h-12 rounded-full border-2 border-primary"
              />
              <div className="text-right hidden sm:block">
                <p className="font-semibold text-sm m-0">You</p>
                <p className="text-xs text-gray-500 m-0">Learner</p>
              </div>
          </div>
          
          <div className="flex flex-col items-center flex-1">
            <div className="bg-primary-light text-primary p-3 rounded-full mb-2">
              <ArrowRightLeft size={24} />
            </div>
            <span className="text-sm font-medium text-gray-500 uppercase tracking-widest">Swap</span>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="text-left hidden sm:block">
                <p className="font-semibold text-sm m-0">{teacher.displayName}</p>
                <p className="text-xs text-gray-500 m-0">Teacher</p>
              </div>
             <img 
                src={teacher.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.displayName)}&background=random`} 
                alt={teacher.displayName} 
                className="w-12 h-12 rounded-full border-2 border-secondary"
              />
          </div>
        </div>

        <h2 className="text-xl font-bold mb-6 text-center">Propose a Skill Swap</h2>
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">I want to learn:</label>
              <select 
                value={formData.skillRequested}
                onChange={(e) => setFormData({...formData, skillRequested: e.target.value})}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary"
                required
              >
                <option value="">Select a skill...</option>
                {teacher.skillsToTeach?.map((s, i) => (
                  <option key={i} value={s.name}>{s.name} ({s.level})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">I can teach in return:</label>
              <select 
                value={formData.skillOffered}
                onChange={(e) => setFormData({...formData, skillOffered: e.target.value})}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary"
                required
              >
                <option value="">Select a skill...</option>
                {currentUserData?.skillsToTeach?.map((s, i) => (
                  <option key={i} value={s.name}>{s.name} ({s.level})</option>
                ))}
              </select>
              {(!currentUserData?.skillsToTeach || currentUserData.skillsToTeach.length === 0) && (
                <p className="text-xs text-amber-600 mt-2">You haven't listed any skills to teach yet. Go to your profile to add some!</p>
              )}
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group flex items-start gap-3">
               <div className="mt-1 text-gray-400"><Calendar size={20}/></div>
               <div className="flex-1">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Day</label>
                 <select 
                   value={formData.preferredDay}
                   onChange={(e) => setFormData({...formData, preferredDay: e.target.value})}
                   className="w-full"
                 >
                   {['Any', 'Weekdays', 'Weekends', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                     <option key={d} value={d}>{d}</option>
                   ))}
                 </select>
               </div>
            </div>

            <div className="form-group flex items-start gap-3">
               <div className="mt-1 text-gray-400"><Clock size={20}/></div>
               <div className="flex-1">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time of Day</label>
                 <select 
                   value={formData.preferredTime}
                   onChange={(e) => setFormData({...formData, preferredTime: e.target.value})}
                   className="w-full"
                 >
                   {['Any', 'Mornings', 'Afternoons', 'Evenings', 'Late Night'].map(t => (
                     <option key={t} value={t}>{t}</option>
                   ))}
                 </select>
               </div>
            </div>
          </div>

          <div className="form-group pt-4 border-t border-gray-100 mt-6">
            <label className="flex items-center gap-2 font-medium mb-2">
              <MessageSquare size={18} className="text-gray-400"/> Send a message
            </label>
            <textarea 
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              placeholder={`Hi ${teacher.displayName.split(' ')[0]}, I'd love to learn ${formData.skillRequested || 'that skill'} from you!`}
              rows={4}
              className="w-full resize-none"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full py-3 text-lg mt-6 shadow-md"
            disabled={submitting || !currentUserData?.skillsToTeach?.length}
          >
            {submitting ? 'Sending Request...' : 'Send Swap Request'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default SwapRequest;
