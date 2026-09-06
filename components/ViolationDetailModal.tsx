
import React, { useState } from 'react';
import { X, MapPin, Building, Calendar, User, ShieldAlert, FileDown, MessageCircle, AlertTriangle, ImageOff, ArrowRight } from 'lucide-react';
import { Violation, Severity } from '../types';
import { exportViolationToPDF } from '../services/exportService';
import { getDirectImageUrl } from './ViolationCard';

interface Props {
  violation: Violation;
  onClose: () => void;
}

const ViolationDetailModal: React.FC<Props> = ({ violation, onClose }) => {
  const [imgError, setImgError] = useState(false);
  
  const getSeverityColor = (sev: Severity) => {
    switch(sev) {
      case Severity.LOW: return 'bg-blue-100 text-blue-700 border-blue-200';
      case Severity.MEDIUM: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case Severity.HIGH: return 'bg-orange-100 text-orange-700 border-orange-200';
      case Severity.CRITICAL: return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const displayImage = getDirectImageUrl((violation as any).imageUrl || (violation as any).image_url);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6 overflow-y-auto bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-5xl bg-white h-full sm:h-auto sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all sm:hidden"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
            <div className="hidden sm:block p-2 bg-yellow-100 rounded-xl">
              <ShieldAlert className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">تفاصيل المخالفة</h2>
              <p className="text-[10px] sm:text-xs text-slate-500 font-bold">رقم السجل: {violation.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => exportViolationToPDF(violation)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 text-xs font-black rounded-xl hover:bg-blue-100 transition-colors"
              title="تحميل التقرير"
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline">تصدير PDF</span>
            </button>
            <button 
              onClick={onClose}
              className="hidden sm:flex p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Image Section */}
            <div className="lg:col-span-7 bg-slate-950 aspect-video lg:h-[600px] overflow-hidden flex items-center justify-center p-2 sm:p-4">
              {!imgError && displayImage ? (
                <img 
                  src={displayImage} 
                  onError={() => setImgError(true)}
                  className="max-w-full max-h-full object-contain shadow-2xl rounded-lg border border-white/5" 
                  alt="Violation Proof" 
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-600 py-20">
                  <ImageOff className="w-16 h-16" />
                  <span className="font-bold">تعذر عرض الدليل المصور</span>
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="lg:col-span-5 p-6 sm:p-8 space-y-6">
              
              <div className="flex flex-wrap gap-2">
                <span className={`px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-black border uppercase ${getSeverityColor(violation.severity)}`}>
                  الخطورة: {violation.severity}
                </span>
                <span className="px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-black bg-slate-100 text-slate-700 border border-slate-200">
                  {violation.category}
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" /> وصف الحالة
                </h3>
                <div className="bg-yellow-50/30 p-5 rounded-2xl border border-yellow-100/50 text-slate-800 leading-relaxed font-bold text-sm sm:text-base">
                  {violation.description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 mb-1 font-black">الموقع</p>
                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="font-bold text-xs truncate">{violation.location}</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 mb-1 font-black">القسم</p>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="font-bold text-xs truncate">{violation.department}</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 mb-1 font-black">التاريخ</p>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="font-bold text-xs truncate">{violation.date}</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 mb-1 font-black">المبلغ</p>
                  <div className="flex items-center gap-2 text-slate-700">
                    <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="font-bold text-xs truncate">{violation.reporter}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100 pb-20 sm:pb-0">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-blue-500" /> الملاحظات ({violation.comments ? violation.comments.length : 0})
                </h3>
                <div className="space-y-3">
                  {violation.comments && violation.comments.map(comment => (
                    <div key={comment.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-black text-slate-700">{comment.author}</span>
                        <span className="text-[10px] text-slate-400">{comment.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">{comment.text}</p>
                    </div>
                  ))}
                  {(!violation.comments || violation.comments.length === 0) && (
                    <p className="text-center py-4 text-slate-400 italic text-[11px]">لا توجد ملاحظات إضافية.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t border-slate-100 p-4 sticky bottom-0 z-20 sm:rounded-b-3xl">
          <button 
            onClick={onClose}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-slate-200"
          >
            <ArrowRight className="w-5 h-5" />
            العودة إلى سجل المخالفات
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViolationDetailModal;
