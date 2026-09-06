
import * as XLSX from "xlsx";
import { Violation } from "../types";
import { getDirectImageUrl } from "../components/ViolationCard";

/**
 * تصدير مخالفة واحدة إلى PDF بجودة عالية عبر نافذة الطباعة
 */
export const exportViolationToPDF = (violation: Violation) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const displayImage = getDirectImageUrl((violation as any).imageUrl || (violation as any).image_url);

  const html = `
    <html dir="rtl" lang="ar">
      <head>
        <title>تقرير مخالفة - ${violation.id}</title>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Tajawal', sans-serif; padding: 30px; color: #1e293b; line-height: 1.5; background: #fff; }
          .report-container { max-width: 800px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 5px solid #2563eb; padding-bottom: 15px; margin-bottom: 25px; display: flex; align-items: center; justify-content: center; flex-direction: column; }
          .title { font-size: 24px; font-weight: bold; color: #1e293b; margin-bottom: 5px; }
          .subtitle { font-size: 14px; color: #64748b; font-weight: bold; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; }
          .meta-item { background: #f8fafc; padding: 12px; border-radius: 10px; border: 1px solid #e2e8f0; }
          .label { font-size: 11px; color: #64748b; font-weight: 700; display: block; margin-bottom: 3px; text-transform: uppercase; }
          .value { font-size: 14px; font-weight: 700; color: #1e293b; }
          .section-title { font-size: 18px; font-weight: bold; margin-bottom: 12px; border-right: 5px solid #2563eb; padding-right: 12px; color: #1e293b; }
          .description-box { background: #fefce8; padding: 20px; border: 1px solid #fef08a; border-radius: 12px; margin-bottom: 25px; font-size: 15px; font-weight: 500; }
          .image-wrapper { text-align: center; margin-top: 15px; background: #f1f5f9; padding: 10px; border-radius: 15px; border: 1px solid #e2e8f0; }
          .image-wrapper img { 
            max-width: 100%; 
            max-height: 450px; /* مقاس محدد مناسب للطباعة لضمان بقاء التقرير في صفحة واحدة */
            width: auto;
            height: auto;
            object-fit: contain; 
            border-radius: 8px; 
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          }
          .footer { margin-top: 40px; padding-top: 15px; border-top: 2px solid #f1f5f9; text-align: center; font-size: 11px; color: #94a3b8; font-weight: bold; }
          @media print {
            body { padding: 0; }
            .image-wrapper { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="report-container">
          <div class="header">
            <div class="title">تقرير رصد مخالفة سلامة</div>
            <div class="subtitle">قسم السلامة - شركة مسبك الرياض</div>
          </div>
          
          <div class="meta-grid">
            <div class="meta-item"><span class="label">الرقم المرجعي</span><span class="value">#${violation.id}</span></div>
            <div class="meta-item"><span class="label">تاريخ الرصد</span><span class="value">${violation.date}</span></div>
            <div class="meta-item"><span class="label">الموقع المحدد</span><span class="value">${violation.location}</span></div>
            <div class="meta-item"><span class="label">القسم المسؤول</span><span class="value">${violation.department}</span></div>
            <div class="meta-item"><span class="label">مستوى الخطورة</span><span class="value">${violation.severity}</span></div>
            <div class="meta-item"><span class="label">نوع الخطورة</span><span class="value">${violation.category}</span></div>
          </div>

          <div class="section-title">وصف المخالفة الميداني</div>
          <div class="description-box">${violation.description}</div>

          <div class="section-title">الدليل المرئي المرفق</div>
          <div class="image-wrapper">
            <img src="${displayImage}" alt="Violation Evidence" />
          </div>

          <div class="footer">
            هذا التقرير مستخرج آلياً من نظام إدارة السلامة - شركة مسبك الرياض &copy; ${new Date().getFullYear()}
          </div>
        </div>
        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
              window.close();
            }, 800);
          };
        </script>
      </body>
    </html>
  `;
  printWindow.document.write(html);
  printWindow.document.close();
};

/**
 * تصدير البيانات إلى ملف اكسل للتقارير فقط
 */
export const exportViolationsToExcel = (violations: Violation[], filename: string = "Safety_Report.xlsx") => {
  const data = violations.map(v => ({
    "رقم المخالفة": v.id,
    "التاريخ": v.date,
    "القسم": v.department,
    "الموقع": v.location,
    "التصنيف": v.category,
    "مستوى الخطورة": v.severity,
    "الوصف": v.description,
    "المبلغ": v.reporter
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  XLSX.writeFile(workbook, filename);
};
