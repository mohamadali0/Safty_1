
import { Violation, Comment } from "../types";

// استبدل هذا الرابط بالرابط الذي حصلت عليه بعد عمل Deploy للـ Google Apps Script
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxW7PAOc3gYJPXUIpKDu-r9C7mlUnm98kom18FvY4CG32RXPf7CoVA4wQvJfELLaaDBAA/exec';

export const db = {
  /**
   * جلب البيانات مع إضافة ت Parameter زمني لمنع التخزين المؤقت (Cache)
   */
  getViolations: async (): Promise<Violation[]> => {
    try {
      // إضافة timestamp للرابط لإجبار المتصفح على جلب بيانات جديدة
      const cacheBuster = `?t=${new Date().getTime()}`;
      const response = await fetch(GOOGLE_SCRIPT_URL + cacheBuster);
      
      if (!response.ok) throw new Error("Network response was not ok");
      
      const data = await response.json();
      
      // التأكد من أن البيانات مصفوفة وفلترة الأسطر التي لا تحتوي على وصف (الأسطر الفارغة)
      if (Array.isArray(data)) {
        return data.filter(v => v.description && v.description.trim() !== "");
      }
      return [];
    } catch (error) {
      console.error("Error fetching violations:", error);
      return [];
    }
  },

  subscribeToViolations: (callback: (violations: Violation[]) => void) => {
    db.getViolations().then(callback);
    return () => {}; 
  },

  addViolation: async (violation: Violation): Promise<string> => {
    try {
      const payload = {
        action: 'ADD_VIOLATION',
        data: {
          location: violation.location,
          department: violation.department,
          category: violation.category,
          severity: violation.severity,
          description: violation.description,
          reporter: violation.reporter,
          image: violation.imageUrl
        }
      };

      // نستخدم no-cors للإرسال فقط، جوجل سيعالج البيانات حتى لو ظهر خطأ CORS في المتصفح
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      return "success";
    } catch (error) {
      console.error("Failed to add violation:", error);
      throw error;
    }
  },

  addComment: async (violationId: string, comment: Comment) => {
    try {
      const payload = {
        action: 'ADD_COMMENT',
        violationId: violationId,
        comment: comment
      };

      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  },

  getStats: async () => {
    const violations = await db.getViolations();
    const totalComments = violations.reduce((acc, v) => acc + (v.comments?.length || 0), 0);
    const reporters = Array.from(new Set(violations.map((v: any) => v.reporter)));
    
    return {
      totalViolations: violations.length,
      totalComments,
      activeReporters: reporters.length,
      lastSync: new Date().toISOString()
    };
  },

  deleteViolation: async (id: string) => {
    alert("الحذف يتم يدوياً من ملف الأكسل لضمان سلامة السجلات.");
  },

  updateViolation: async (violation: Violation) => {
    console.warn("Update requires manual change in Excel.");
  },

  clearDatabase: async () => {
    alert("يرجى مسح البيانات من ملف Google Sheet.");
  }
};
