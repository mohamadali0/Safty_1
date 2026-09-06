
import React, { useState } from 'react';
import { Shield, User, Lock, ArrowRight, ChevronDown, CheckCircle2 } from 'lucide-react';

interface Props {
  onLogin: (role: 'safety' | 'guest', name: string) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'safety' | 'guest'>('safety');
  const [selectedUser, setSelectedUser] = useState('فواز المطرفي');
  const [password, setPassword] = useState('');

  const safetyUsers = [
    { name: 'فواز المطرفي', password: 'fawaz@2026' },
    { name: 'فيصل القوصي', password: 'faisal@2026' }
  ];

  const handleSafetyLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = safetyUsers.find(u => u.name === selectedUser);
    if (user && password === user.password) {
      onLogin('safety', user.name);
    } else {
      alert('كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full space-y-8 bg-white/95 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl relative z-10 border border-white/20">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-yellow-500/30 mb-6 rotate-3">
            <Shield className="h-10 w-10 text-slate-900" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">نظام إدارة السلامة</h2>
          <p className="mt-2 text-sm text-slate-500 font-bold uppercase tracking-widest">شركة مسبك الرياض</p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('safety')}
            className={`flex-1 py-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'safety' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Shield className="w-4 h-4" /> موظف سلامة
          </button>
          
        </div>

        {activeTab === 'safety' ? (
          <form className="mt-8 space-y-6" onSubmit={handleSafetyLogin}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 mr-2 block uppercase tracking-wider">اسم الموظف</label>
                <div className="relative">
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="appearance-none rounded-2xl block w-full pr-12 pl-10 py-4 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-yellow-500/50 outline-none transition-all font-bold text-sm bg-slate-50"
                  >
                    {safetyUsers.map(u => <option key={u.name} value={u.name}>{u.name}</option>)}
                  </select>
                  <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 mr-2 block uppercase tracking-wider">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-2xl block w-full pr-12 pl-4 py-4 border border-slate-200 placeholder-slate-400 text-slate-900 focus:ring-2 focus:ring-yellow-500/50 outline-none transition-all font-bold text-sm bg-slate-50"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="group relative w-full flex justify-center items-center gap-3 py-4 border border-transparent text-sm font-black rounded-2xl text-slate-900 bg-yellow-500 hover:bg-yellow-400 shadow-xl shadow-yellow-500/20 transition-all active:scale-[0.98]"
            >
              دخول آمن للنظام
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        ) : (
          <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 space-y-4">
               <div className="flex items-start gap-3">
                 <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5" />
                 <p className="text-xs text-blue-800 font-bold leading-relaxed">استعراض سجل المخالفات الميداني لحظة بلحظة.</p>
               </div>
               <div className="flex items-start gap-3">
                 <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5" />
                 <p className="text-xs text-blue-800 font-bold leading-relaxed">المشاركة بكتابة الملاحظات والتعليقات البناءة.</p>
               </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Login;