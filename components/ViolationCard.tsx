
import React, { useState } from 'react';
import { MapPin, Building, Calendar, User, MessageCircle, Send, ShieldAlert, Trash2, Edit3, MoreVertical, FileDown, Eye, ImageOff, ArrowLeft } from 'lucide-react';
import { Violation, Severity } from '../types';
import { exportViolationToPDF } from '../services/exportService';

interface Props {
  violation: Violation;
  userRole: 'safety' | 'guest';
  onAddComment: (violationId: string, text: string) => void;
  onDelete?: (violationId: string) => void;
  onEdit?: (violation: Violation) => void;
  onViewDetails?: (violation: Violation) => void;
}

export const getDirectImageUrl = (url: string | undefined): string => {
  if (!url) return '';
  if (url.startsWith('data:')) return url;
  if (url.includes('drive.google.com')) {
    const fileId = url.match(/[-\w]{25,}/);
    if (fileId) {
      return `https://drive.google.com/thumbnail?id=${fileId[0]}&sz=w1000`;
    }
  }
  return url;
};

const ViolationCard: React.FC<Props> = ({ violation, userRole, onAddComment, onDelete, onEdit, onViewDetails }) => {
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [imgError, setImgError] = useState(false);

  const getSeverityStyles = (sev: Severity) => {
    switch(sev) {
      case Severity.LOW: return 'bg-blue-50 text-blue-600 border-blue-100';
      case Severity.MEDIUM: return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case Severity.HIGH: return 'bg-orange-50 text-orange-700 border-orange-100';
      case Severity.CRITICAL: return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(violation.id, newComment);
      setNewComment('');
    }
  };

  const displayImage = getDirectImageUrl((violation as any).imageUrl || (violation as any).image_url);

  return (
    <div className="group bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-300 relative">
      <div className="flex flex-col md:flex-row">
        
        {/* Image Area */}
        <div className="relative w-full md:w-80 h-56 md:h-auto bg-slate-100 overflow-hidden cursor-pointer" onClick={() => onViewDetails?.(violation)}>
          {!imgError && displayImage ? (
            <img 
              src={displayImage} 
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              alt="Violation proof" 
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
              <ImageOff className="w-10 h-10" />
              <span className="text-[10px] font-bold">بانتظار الصورة</span>
            </div>
          )}
          
          {/* Overlay Badges */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <span className={`px-3 py-1 rounded-xl text-[10px] font-black shadow-lg border backdrop-blur-md ${getSeverityStyles(violation.severity)}`}>
              خطورة {violation.severity}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-1">
               <div className="flex items-center gap-2 text-yellow-600 mb-1">
                 <ShieldAlert className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-wider">{violation.category}</span>
               </div>
               <h3 className="text-lg font-black text-slate-900 leading-tight">
                مخالفة: {violation.department}
              </h3>
            </div>
            
            {userRole === 'safety' && (
              <div className="relative">
                <button 
                  onClick={() => setShowActions(!showActions)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                {showActions && (
                  <div className="absolute left-0 mt-2 w-44 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-20 animate-in fade-in zoom-in-95 overflow-hidden">
                    <button onClick={() => { onViewDetails?.(violation); setShowActions(false); }} className="w-full text-right px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-3 font-bold transition-colors">
                      <Eye className="w-4 h-4 text-blue-500" /> عرض التفاصيل
                    </button>
                    <button onClick={() => { exportViolationToPDF(violation); setShowActions(false); }} className="w-full text-right px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-3 font-bold transition-colors">
                      <FileDown className="w-4 h-4 text-green-500" /> تحميل PDF
                    </button>
                    <div className="h-px bg-slate-100 mx-2 my-1"></div>
                    <button onClick={() => { if(confirm('حذف السجل؟')) onDelete?.(violation.id); setShowActions(false); }} className="w-full text-right px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-3 font-bold transition-colors">
                      <Trash2 className="w-4 h-4" /> حذف المخالفة
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="text-slate-600 text-sm mb-6 font-medium leading-relaxed line-clamp-2">
            {violation.description}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2.5 text-slate-500">
              <div className="p-1.5 bg-slate-50 rounded-lg"><MapPin className="w-3.5 h-3.5" /></div>
              <span className="text-xs font-bold truncate">{violation.location}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-500">
              <div className="p-1.5 bg-slate-50 rounded-lg"><Calendar className="w-3.5 h-3.5" /></div>
              <span className="text-xs font-bold truncate">{violation.date.split(',')[0]}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-500">
              <div className="p-1.5 bg-slate-50 rounded-lg"><User className="w-3.5 h-3.5" /></div>
              <span className="text-xs font-bold truncate">{violation.reporter}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-500">
              <div className="p-1.5 bg-slate-50 rounded-lg"><Building className="w-3.5 h-3.5" /></div>
              <span className="text-xs font-bold truncate">{violation.department}</span>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
            <button 
              onClick={() => setShowComments(!showComments)}
              className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs flex items-center gap-2 transition-all font-black"
            >
              <MessageCircle className="w-4 h-4" />
              {violation.comments?.length || 0} تعليقات
            </button>
            <button 
              onClick={() => onViewDetails?.(violation)}
              className="text-yellow-600 hover:text-yellow-700 text-xs font-black flex items-center gap-1 group/btn"
            >
              عرض التفاصيل الكاملة
              <ArrowLeft className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Simplified Comments Section */}
      {showComments && (
        <div className="bg-slate-50 p-6 border-t border-slate-100 animate-in slide-in-from-top-4 duration-300">
          <div className="space-y-4 max-h-60 overflow-y-auto mb-4 pr-2">
            {violation.comments?.map(comment => (
              <div key={comment.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-black text-slate-800">{comment.author}</span>
                  <span className="text-[10px] text-slate-400">{comment.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{comment.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmitComment} className="relative">
            <input 
              type="text" 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="اكتب ملاحظة أو تعليق..."
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500 outline-none transition-all font-medium"
            />
            <button 
              type="submit"
              className="absolute left-2 top-1.5 bg-slate-900 text-white p-2 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ViolationCard;