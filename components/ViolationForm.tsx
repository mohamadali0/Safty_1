
import React, { useState, useRef } from 'react';
import { Camera, MapPin, Building, AlertTriangle, FileText, Send, Sparkles, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { Department, Category, Severity, Violation } from '../types';
import { analyzeViolation } from '../services/geminiService';

interface Props {
  onAddViolation: (v: Violation) => Promise<void>;
  onCancel: () => void;
  initialData?: Violation;
}

/**
 * ViolationForm Component for creating and editing safety violations.
 */
const ViolationForm: React.FC<Props> = ({ onAddViolation, onCancel, initialData }) => {
  const [image, setImage] = useState<string | null>(initialData?.imageUrl || null);
  const [description, setDescription] = useState(initialData?.description || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [department, setDepartment] = useState<Department>(initialData?.department || Department.PRODUCTION);
  const [category, setCategory] = useState<Category>(initialData?.category || Category.PPE);
  const [severity, setSeverity] = useState<Severity>(initialData?.severity || Severity.MEDIUM);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle image capture/selection.
   */
  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiAnalyze = async () => {
    if (!image || !description) {
      alert("يرجى التقاط صورة أو اختيارها وكتابة وصف أولاً ليتمكن الذكاء الاصطناعي من التحليل");
      return;
    }
    setIsAnalyzing(true);
    try {
      const result = await analyzeViolation(image, description);
      if (result) {
        setSeverity(result.suggestedSeverity);
        setCategory(result.suggestedCategory);
        setAiAdvice(result.expertAdvice);
      }
    } catch (e) {
      console.error("AI Analysis failed", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!image) {
      alert("يجب إرفاق صورة للمخالفة (كاميرا أو استوديو)");
      return;
    }

    setIsSubmitting(true);
    
    // ضبط الوقت ليكون GMT+3 (توقيت الرياض)
    const timestamp = new Date().toLocaleString('ar-EG', { timeZone: 'Asia/Riyadh' });

    const violationData: Violation = {
      id: initialData?.id || "",
      imageUrl: image,
      date: initialData?.date || timestamp,
      location,
      department,
      category,
      severity,
      description,
      reporter: initialData?.reporter || "موظف السلامة",
      comments: initialData?.comments || []
    };

    try {
      await onAddViolation(violationData);
    } catch (error) {
      console.error("Submission error in form:", error);
      alert("حدث خطأ أثناء حفظ البيانات. يرجى التحقق من اتصال الإنترنت.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <AlertTriangle className="w-6 h-6" />
          {initialData ? 'تعديل مخالفة' : 'تسجيل مخالفة جديدة'}
        </h2>
        <button type="button" onClick={onCancel} className="text-white hover:bg-blue-700 rounded-full p-1 transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div 
          className="relative aspect-video rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all group" 
          onClick={() => fileInputRef.current?.click()}
        >
          {image ? (
            <img src={image} className="absolute inset-0 w-full h-full object-cover" alt="Selected violation" />
          ) : (
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-4">
                <Camera className="w-12 h-12 text-slate-300 group-hover:text-blue-400 transition-colors" />
                <div className="h-8 w-px bg-slate-200"></div>
                <ImageIcon className="w-12 h-12 text-slate-300 group-hover:text-blue-400 transition-colors" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-black">اضغط لالتقاط صورة أو الاختيار من الاستوديو</p>
                <p className="text-slate-400 text-[10px] mt-1 font-bold">يدعم ملفات الصور (JPG, PNG)</p>
              </div>
            </div>
          )}
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleCapture} 
            className="hidden" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 flex items-center gap-2 uppercase tracking-widest">
              <MapPin className="w-4 h-4 text-blue-500" /> مكان المخالفة
            </label>
            <input 
              type="text" 
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-sm"
              placeholder="مثال: المستودع الشمالي - بوابة 3"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 flex items-center gap-2 uppercase tracking-widest">
              <Building className="w-4 h-4 text-blue-500" /> القسم المسؤول
            </label>
            <select 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
              value={department}
              onChange={(e) => setDepartment(e.target.value as Department)}
            >
              {Object.values(Department).map(dep => <option key={dep} value={dep}>{dep}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 flex items-center gap-2 uppercase tracking-widest">
              <AlertTriangle className="w-4 h-4 text-blue-500" /> التصنيف
            </label>
            <select 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
            >
              {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 flex items-center gap-2 uppercase tracking-widest">
              <AlertTriangle className="w-4 h-4 text-blue-500" /> مستوى الخطورة
            </label>
            <select 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as Severity)}
            >
              {Object.values(Severity).map(sev => <option key={sev} value={sev}>{sev}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 flex items-center gap-2 uppercase tracking-widest">
            <FileText className="w-4 h-4 text-blue-500" /> وصف تفصيلي للمخالفة
          </label>
          <textarea 
            required
            rows={3}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none font-bold text-sm"
            placeholder="اكتب ما الذي حدث بالضبط..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {aiAdvice && (
          <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl animate-in fade-in">
            <p className="text-purple-800 text-[10px] font-black flex items-center gap-2 mb-1 uppercase tracking-widest">
              <Sparkles className="w-4 h-4" /> توصية الذكاء الاصطناعي:
            </p>
            <p className="text-purple-700 text-xs leading-relaxed font-bold">{aiAdvice}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="flex-[2] bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-blue-200"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                جاري الحفظ والرفع...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" /> 
                {initialData ? 'حفظ التعديلات' : 'تسجيل المخالفة الآن'}
              </>
            )}
          </button>
          
          <button 
            type="button"
            onClick={handleAiAnalyze}
            disabled={isAnalyzing || isSubmitting}
            className="flex-1 px-6 py-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-200"
          >
            {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            تحليل ذكي
          </button>
        </div>
      </form>
    </div>
  );
};

export default ViolationForm;
