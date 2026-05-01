import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { Send, Zap, AlertTriangle, Info, CheckCircle, Globe } from 'lucide-react';

interface AdminPanelProps {
  currentCity: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ currentCity }) => {
  const [message, setMessage] = useState('');
  const [targetCity, setTargetCity] = useState(currentCity || 'All');
  const [targetGender, setTargetGender] = useState('Any');
  const [targetClass, setTargetClass] = useState('All');
  const [targetUserType, setTargetUserType] = useState<'parent' | 'teacher' | 'all'>('all');
  const [type, setType] = useState<'urgent' | 'info' | 'success' | 'broadcast'>('info');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const CITIES_LIST = [
    'Ahmedabad', 'Allahabad', 'Amrawati', 'Amritsar', 'Bangalore', 'Bhopal', 'Bhubaneswar', 
    'Chandigarh', 'Chennai', 'Cochin', 'Coimbatore', 'Dehradun', 'Delhi', 'Dispur', 
    'Faridabad', 'Gandhinagar', 'Ghaziabad', 'Greater Noida', 'Gurgaon', 'Guwahati', 
    'Hyderabad', 'Indore', 'Itanagar', 'Jaipur', 'Kanpur', 'Kolkata', 'Kota', 'Leh', 
    'Lucknow', 'Mangalore', 'Meerut', 'Mohali', 'Mumbai', 'Nagpur', 'Noida', 'Panchkula', 
    'Patna', 'Pondicherry', 'Pune', 'Raipur', 'Ranchi', 'Shimla', 'Srinagar', 'Surat', 
    'Thane', 'Trivandrum', 'Vadodara', 'Vellore', 'Zirakpur', 'All'
  ].sort();

  const CLASSES_LIST = ['All', '1st Std', '2nd Std', '3rd Std', '4th Std', '5th Std', '6th Std', '7th Std', '8th Std', '9th Std', '10th Std', '11th Std', '12th Std'];

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    setStatus(null);

    try {
      await addDoc(collection(db, 'alerts'), {
        message,
        city: targetCity,
        gender: targetGender,
        targetClass: targetClass,
        targetUserType: targetUserType,
        type,
        sender: 'DoAble Admin',
        timestamp: serverTimestamp(),
      });
      setMessage('');
      setStatus({ type: 'success', msg: 'Broadcast sent successfully!' });
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, 'alerts');
      setStatus({ type: 'error', msg: 'Permission Denied: Only admins can broadcast.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-slate-900 rounded-[32px] p-8 text-white">
        <h2 className="text-2xl font-black tracking-tight mb-2 flex items-center gap-2">
            <Zap className="text-amber-400" /> Admin Broadcast
        </h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Send targeted alerts to users</p>
        
        <div className="mt-8 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target City</label>
                <select 
                    value={targetCity}
                    onChange={(e) => setTargetCity(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary"
                >
                    {CITIES_LIST.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Gender</label>
                <select 
                    value={targetGender}
                    onChange={(e) => setTargetGender(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary"
                >
                    <option value="Any" className="bg-slate-900">Any Gender</option>
                    <option value="Male" className="bg-slate-900">Male Only</option>
                    <option value="Female" className="bg-slate-900">Female Only</option>
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Class</label>
                <select 
                    value={targetClass}
                    onChange={(e) => setTargetClass(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary"
                >
                    {CLASSES_LIST.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target User Role</label>
                <select 
                    value={targetUserType}
                    onChange={(e) => setTargetUserType(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary"
                >
                    <option value="all" className="bg-slate-900">All (Parents & Teachers)</option>
                    <option value="parent" className="bg-slate-900">Parents Only</option>
                    <option value="teacher" className="bg-slate-900">Teachers Only</option>
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Alert Level</label>
                <div className="flex gap-2">
                    {[
                        { id: 'info', icon: <Info size={14} />, color: 'text-blue-400' },
                        { id: 'urgent', icon: <AlertTriangle size={14} />, color: 'text-rose-400' },
                        { id: 'broadcast', icon: <Zap size={14} />, color: 'text-amber-400' },
                        { id: 'success', icon: <CheckCircle size={14} />, color: 'text-emerald-400' }
                    ].map(t => (
                        <button 
                            key={t.id}
                            onClick={() => setType(t.id as any)}
                            className={`flex-1 h-10 rounded-xl border flex items-center justify-center transition-all ${type === t.id ? 'bg-white/10 border-white/40 ' + t.color : 'border-white/5 text-slate-600'}`}
                        >
                            {t.icon}
                        </button>
                    ))}
                </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Message Body</label>
            <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your announcement here..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm font-medium focus:outline-none focus:border-primary min-h-[120px]"
            />
          </div>

          <button 
            onClick={handleSend}
            disabled={sending || !message.trim()}
            className="w-full bg-primary hover:bg-blue-500 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            {sending ? 'Processing Network...' : <><Send size={16} /> Deploy Broadcast</>}
          </button>

          {status && (
              <div className={`p-4 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {status.msg}
              </div>
          )}
        </div>
      </div>

      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] p-8">
          <h3 className="text-slate-900 font-black text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <Globe size={18} className="text-slate-400" /> API Integration Info
          </h3>
          <div className="space-y-4 text-[11px] font-bold text-slate-500 leading-relaxed">
              <p>You can connect your other apps to this alert module via Firebase SDK.</p>
              <div className="bg-white p-4 rounded-xl border border-slate-100 font-mono text-[9px] overflow-x-auto whitespace-pre">
{`// Add document to "alerts" collation
const alert = {
  message: "Hi from API",
  city: "${targetCity}",
  type: "info",
  sender: "External App",
  timestamp: serverTimestamp()
};`}
              </div>
          </div>
      </div>
    </div>
  );
};

export default AdminPanel;
