
import React, { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, Calendar, Filter, Database, MessageSquare, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Violation } from '../types';
import { exportViolationsToExcel } from '../services/exportService';
import { db } from '../services/dbService';

interface Props {
  violations: Violation[];
}

const Reports: React.FC<Props> = ({ violations }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Using state to handle the asynchronous result of db.getStats()
  const [stats, setStats] = useState({
    totalViolations: 0,
    totalComments: 0,
    activeReporters: 0,
    lastSync: new Date().toISOString()
  });

  useEffect(() => {
    const loadStats = async () => {
      const s = await db.getStats();
      setStats(s);
    };
    loadStats();
  }, [violations]);

  const handleExportPeriod = () => {
    if (!startDate || !endDate) {
      alert("يرجى تحديد الفترة الزمنية");
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59);

    const filtered = violations.filter(v => {
      const dateParts = v.date.split(',')[0].split('/');
      const vDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
      return vDate >= start && vDate <= end;
    });

    if (filtered.length === 0) {
      alert("لا توجد سجلات في هذه الفترة");
      return;
    }
    exportViolationsToExcel(filtered, `تقرير_مخالفات_الفترة.xlsx`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* ملخص حالة قاعدة البيانات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold">إجمالي المخالفات</p>
            <p className="text-2xl font-black text-slate-800">{stats.totalViolations}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-xl text-green-600">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold">إجمالي التعليقات</p>
            <p className="text-2xl font-black text-slate-800">{stats.totalComments}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold">موظفي السلامة النشطين</p>
            <p className="text-2xl font-black text-slate-800">{stats.activeReporters}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold">آخر تحديث للقاعدة</p>
            <p className="text-[10px] font-bold text-slate-800 truncate max-w-[120px]">
              {new Date(stats.lastSync).toLocaleTimeString('ar-EG')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* تصدير التقارير */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
            <FileSpreadsheet className="text-green-600" />
            تصدير تقارير مخصصة
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-slate-500 block mb-1">من تاريخ</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-500 block mb-1">إلى تاريخ</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
                </div>
              </div>
              <button onClick={handleExportPeriod} className="w-full bg-green-600 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> تحميل ملف Excel للفترة
              </button>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-600 mb-4">يمكنك تصدير كافة محتويات قاعدة البيانات الحالية بضغطة واحدة.</p>
              <button onClick={() => exportViolationsToExcel(violations)} className="w-full bg-slate-800 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2">
                تصدير السجل الكامل
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
