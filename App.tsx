
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, LayoutGrid, Shield, LogOut, FileText, RefreshCw, Search, ChevronDown, Filter, X, ArrowUpNarrowWide, ArrowDownWideNarrow, Calendar, Building, AlertCircle } from 'lucide-react';
import { Violation, Comment, Department, Category } from './types';
import ViolationForm from './components/ViolationForm';
import ViolationCard from './components/ViolationCard';
import Login from './components/Login';
import Reports from './components/Reports';
import ViolationDetailModal from './components/ViolationDetailModal';
import { db } from './services/dbService';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<'safety' | 'guest' | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [violations, setViolations] = useState<Violation[]>([]);
  const [view, setView] = useState<'feed' | 'report' | 'reports'>('feed');
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  
  // حالات التصفية والترتيب
  const [showFilters, setShowFilters] = useState(false);
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const loadData = async (resetCount = false) => {
    setIsLoading(true);
    try {
      const data = await db.getViolations();
      setViolations(data);
      if (resetCount) setVisibleCount(5);
    } catch (e) {
      console.error("Error loading data", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedRole = localStorage.getItem('userRole');
    const savedName = localStorage.getItem('userName');
    if (savedRole) {
      setUserRole(savedRole as any);
      setUserName(savedName || "");
      loadData(true);
    }
  }, []);

  const handleLogin = (role: 'safety' | 'guest', name: string) => {
    setUserRole(role);
    setUserName(name);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userName', name);
    loadData(true);
  };

  const handleLogout = () => {
    setUserRole(null);
    setUserName('');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    setView('feed');
  };

  const handleAddViolation = async (v: Violation) => {
    v.reporter = userName;
    await db.addViolation(v);
    setView('feed');
    setTimeout(() => loadData(true), 2000);
  };

  const handleAddComment = async (violationId: string, text: string) => {
    // ضبط الوقت ليكون GMT+3 (توقيت الرياض)
    const timestamp = new Date().toLocaleTimeString('ar-EG', { timeZone: 'Asia/Riyadh' });

    const newComment: Comment = {
      id: Date.now().toString(),
      author: userName,
      text,
      timestamp: timestamp
    };
    await db.addComment(violationId, newComment);
    setTimeout(() => loadData(false), 1500);
  };

  // معالجة البيانات (تصفية + ترتيب)
  const processedViolations = useMemo(() => {
    let result = [...violations];

    // 1. التصفية حسب النص
    if (searchTerm) {
      const lowTerm = searchTerm.toLowerCase();
      result = result.filter(v => 
        v.location.toLowerCase().includes(lowTerm) ||
        v.description.toLowerCase().includes(lowTerm) ||
        v.department.toLowerCase().includes(lowTerm)
      );
    }

    // 2. التصفية حسب القسم
    if (filterDept !== 'all') {
      result = result.filter(v => v.department === filterDept);
    }

    // 3. التصفية حسب التصنيف
    if (filterCat !== 'all') {
      result = result.filter(v => v.category === filterCat);
    }

    // 4. التصفية حسب التاريخ
    if (startDate || endDate) {
      result = result.filter(v => {
        try {
          const [datePart] = v.date.split(',');
          const [d, m, y] = datePart.trim().split('/').map(Number);
          const vDate = new Date(y, m - 1, d);
          
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate) : null;
          if (end) end.setHours(23, 59, 59);

          if (start && vDate < start) return false;
          if (end && vDate > end) return false;
          return true;
        } catch (e) {
          return true;
        }
      });
    }

    // 5. الترتيب
    result.sort((a, b) => {
      try {
        const dateA = new Date(a.date.split(',')[0].split('/').reverse().join('-')).getTime();
        const dateB = new Date(b.date.split(',')[0].split('/').reverse().join('-')).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      } catch(e) {
        return 0;
      }
    });

    return result;
  }, [violations, searchTerm, filterDept, filterCat, startDate, endDate, sortOrder]);

  const resetFilters = () => {
    setFilterDept('all');
    setFilterCat('all');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
    setVisibleCount(5);
  };

  if (!userRole) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased">
      <header className="bg-slate-900 text-white shadow-2xl sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-2.5 rounded-2xl shadow-lg shadow-yellow-500/20">
              <Shield className="w-7 h-7 text-slate-900" />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tight">مسبك الرياض</h1>
              <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest -mt-1">نظام السلامة والبيئة</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden md:flex flex-col items-end ml-4">
               <span className="text-xs font-bold text-slate-300">{userName}</span>
               <span className="text-[10px] text-slate-500 font-medium">{userRole === 'safety' ? 'موظف سلامة' : 'زائر'}</span>
             </div>
            <button onClick={() => loadData(false)} className="p-2.5 hover:bg-white/10 rounded-xl transition-colors">
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin text-yellow-400' : 'text-slate-400'}`} />
            </button>
            <button onClick={handleLogout} className="p-2.5 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all text-slate-400">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-6 mb-24">
        {view === 'report' ? (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
            <ViolationForm onAddViolation={handleAddViolation} onCancel={() => setView('feed')} />
          </div>
        ) : view === 'reports' ? (
          <div className="animate-in fade-in duration-500">
            <Reports violations={violations} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Search and Main Controls */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 group">
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <Search className="w-5 h-5 text-slate-400 group-focus-within:text-yellow-500 transition-colors" />
                </div>
                <input 
                  type="text"
                  placeholder="ابحث عن موقع، قسم، أو وصف مخالفة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-12 pl-4 py-4 rounded-2xl border-0 bg-white shadow-xl shadow-slate-200/50 outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all font-medium text-slate-800"
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-6 py-4 rounded-2xl font-black text-sm flex items-center gap-2 transition-all shadow-xl ${showFilters ? 'bg-yellow-500 text-slate-900 shadow-yellow-500/20' : 'bg-white text-slate-600 shadow-slate-200/50'}`}
                >
                  <Filter className="w-5 h-5" />
                  عوامل التصفية
                </button>
                <button 
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  className="px-4 py-4 bg-white text-slate-600 rounded-2xl shadow-xl shadow-slate-200/50 font-black text-sm flex items-center justify-center transition-all hover:bg-slate-50"
                  title={sortOrder === 'desc' ? 'الأحدث أولاً' : 'الأقدم أولاً'}
                >
                  {sortOrder === 'desc' ? <ArrowDownWideNarrow className="w-5 h-5" /> : <ArrowUpNarrowWide className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 animate-in slide-in-from-top-4 duration-300 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                    <Building className="w-4 h-4" /> القسم المسؤول
                  </label>
                  <select 
                    value={filterDept}
                    onChange={(e) => { setFilterDept(e.target.value); setVisibleCount(5); }}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/30 font-bold text-sm"
                  >
                    <option value="all">كافة الأقسام</option>
                    {Object.values(Department).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                    <AlertCircle className="w-4 h-4" /> نوع المخالفة
                  </label>
                  <select 
                    value={filterCat}
                    onChange={(e) => { setFilterCat(e.target.value); setVisibleCount(5); }}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/30 font-bold text-sm"
                  >
                    <option value="all">كافة الأنواع</option>
                    {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                    <Calendar className="w-4 h-4" /> الفترة الزمنية
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => { setStartDate(e.target.value); setVisibleCount(5); }}
                      className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                    />
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => { setEndDate(e.target.value); setVisibleCount(5); }}
                      className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>
                </div>

                <div className="md:col-span-3 pt-4 border-t border-slate-50 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400">
                    تم العثور على {processedViolations.length} سجلات
                  </span>
                  <button 
                    onClick={resetFilters}
                    className="text-red-500 hover:text-red-600 text-xs font-black flex items-center gap-1 transition-colors"
                  >
                    <X className="w-4 h-4" /> إعادة تعيين الكل
                  </button>
                </div>
              </div>
            )}

            {/* Violation Feed */}
            <div className="grid grid-cols-1 gap-6">
              {processedViolations.length > 0 ? (
                processedViolations.slice(0, visibleCount).map(v => (
                  <ViolationCard 
                    key={v.id} 
                    violation={v} 
                    userRole={userRole} 
                    onAddComment={handleAddComment}
                    onViewDetails={setSelectedViolation}
                  />
                ))
              ) : (
                <div className="py-20 text-center space-y-4 bg-white rounded-3xl shadow-sm border border-slate-100">
                   <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Search className="w-10 h-10 text-slate-200" />
                   </div>
                   <h3 className="text-xl font-black text-slate-800">لا توجد نتائج</h3>
                   <p className="text-slate-500 font-bold max-w-xs mx-auto text-sm leading-relaxed">لم يتم العثور على سجلات تطابق عوامل التصفية المحددة حالياً.</p>
                   <button onClick={resetFilters} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl transition-transform active:scale-95">عرض السجل الكامل</button>
                </div>
              )}
              
              {visibleCount < processedViolations.length && (
                <button 
                  onClick={() => setVisibleCount(prev => prev + 5)}
                  className="w-full py-5 bg-white hover:bg-slate-50 border-2 border-slate-100 text-slate-600 font-black rounded-3xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] group"
                >
                  <ChevronDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" /> 
                  عرض المزيد من المخالفات ({processedViolations.length - visibleCount} متبقية)
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {selectedViolation && (
        <ViolationDetailModal violation={selectedViolation} onClose={() => setSelectedViolation(null)} />
      )}

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-slate-900/95 backdrop-blur-xl border border-white/10 h-16 rounded-3xl flex items-center justify-around z-40 shadow-2xl px-2">
        <button 
          onClick={() => { setView('feed'); setShowFilters(false); }} 
          className={`flex flex-col items-center justify-center w-16 h-12 rounded-2xl transition-all ${view === 'feed' ? 'bg-yellow-500 text-slate-900 shadow-lg shadow-yellow-500/20' : 'text-slate-400 hover:text-white'}`}
        >
          <LayoutGrid className="w-6 h-6" />
          <span className="text-[9px] font-black mt-0.5">الرئيسية</span>
        </button>
        
        {userRole === 'safety' && (
          <button 
            onClick={() => setView('report')} 
            className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 p-4 rounded-full -mt-12 shadow-2xl shadow-yellow-500/40 border-4 border-slate-100 transition-all hover:scale-110 active:scale-95"
          >
            <Plus className="w-8 h-8 stroke-[3]" />
          </button>
        )}
        
        {userRole === 'safety' && (
          <button 
            onClick={() => setView('reports')} 
            className={`flex flex-col items-center justify-center w-16 h-12 rounded-2xl transition-all ${view === 'reports' ? 'bg-yellow-500 text-slate-900 shadow-lg shadow-yellow-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            <FileText className="w-6 h-6" />
            <span className="text-[9px] font-black mt-0.5">التقارير</span>
          </button>
        )}
      </nav>
    </div>
  );
};

export default App;
