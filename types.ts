
export enum Severity {
  LOW = 'منخفضة',
  MEDIUM = 'متوسطة',
  HIGH = 'عالية',
  CRITICAL = 'حرجة'
}

export enum Department {
  PRODUCTION = 'الانتاج',
  MAINTENANCE = 'الصيانة',
  WAREHOUSE = 'المستودعات',
  QUALITY = 'الجودة',
  ADMINISTRATION = 'الادارة',
  PROJECTS = 'ادارة المشاريع',
  IT = 'تقنية المعلومات',
  HR = 'الموارد البشرية',
  SUPPORT = 'الخدمات المساندة',
  OTHER = 'غير ذلك'
}
export enum Category {
  PPE = 'أدوات الوقاية الشخصية',
  EQUIPMENT = 'سلامة المعدات والأدوات',
  ENVIRONMENT = 'نظافة البيئة والترتيب',
  FIRE_SAFETY = 'السلامة من الحريق',
  NEAR_MISS = 'حادث وشيك',
  CHEMICAL = 'المخاطر الكيميائية',
  ELECTRICAL = 'المخاطر الكهربائية',
  POSITIVE = 'ملاحظة ايجابية',
  UNSAFE_ACT = 'سلوك غير آمن',
  UNSAFE_CONDITION = 'حالة غير آمنة'
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface Violation {
  id: string;
  imageUrl: string;
  date: string;
  location: string;
  department: Department;
  category: Category;
  severity: Severity;
  description: string;
  reporter: string;
  comments: Comment[];
}
