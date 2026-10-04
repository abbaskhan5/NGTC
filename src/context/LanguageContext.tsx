import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';

interface LanguageContextType {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Brand
    brandName: 'NGTC ERP',
    brandTagline: 'Transport & Enterprise Solutions',
    brandCountry: 'Kingdom of Saudi Arabia',
    
    // Top Bar
    goodMorning: 'Good morning',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    searchPlaceholder: 'Search vehicles, drivers, contracts, trips (⌘K)...',
    notifications: 'Notifications',
    markAllRead: 'Mark all as read',
    noNotifications: 'No unread notifications',
    viewAllAlerts: 'View all compliance alerts',
    switchRole: 'Switch Persona',
    signOut: 'Sign Out',
    myProfile: 'My Profile',
    settings: 'Settings',

    // Nav
    navDashboard: 'Dashboard',
    navOrganization: 'Organization',
    navBranches: 'Branches',
    navDepartments: 'Departments',
    navCustomers: 'Customers',
    navVendors: 'Vendors',
    navEmployees: 'Employees',
    navContracts: 'Contracts & Projects',
    navAllContracts: 'All Contracts',
    navActiveContracts: 'Active Contracts',
    navExpiringContracts: 'Expiring Contracts',
    navProjects: 'Projects',
    navTransport: 'Transport',
    navOverview: 'Overview',
    navSchoolTransport: 'School Transport',
    navUniversityTransport: 'University Transport',
    navLaborTransport: 'Labor Transport',
    navCorporateTransport: 'Corporate Transport',
    navRoutes: 'Routes',
    navTrips: 'Trips',
    navFleet: 'Fleet Management',
    navVehicles: 'Vehicles',
    navMaintenance: 'Maintenance',
    navFuel: 'Fuel Management',
    navDrivers: 'Drivers',
    navDriverRoster: 'Driver Directory',
    navDriverAssignments: 'Assignments',
    navHR: 'Human Resources',
    navAttendance: 'Attendance',
    navLeave: 'Leave Management',
    navPayroll: 'Payroll',
    navEducation: 'Education',
    navSchools: 'Schools',
    navUniversities: 'Universities',
    navStudents: 'Students',
    navConstruction: 'Construction',
    navTravel: 'Travel Agency',
    navFinance: 'Finance',
    navInvoices: 'Invoices',
    navExpenses: 'Expenses',
    navDocuments: 'Documents',
    navGPS: 'GPS Tracking',
    navReports: 'Reports',
    navAuditLogs: 'Audit Logs',
    navUsers: 'Users & RBAC',

    // KPIs
    kpiTotalVehicles: 'Total Fleet',
    kpiActiveVehicles: 'Active Fleet',
    kpiMaintenance: 'In Maintenance',
    kpiTotalDrivers: 'Total Drivers',
    kpiActiveDrivers: 'Active Drivers',
    kpiTripsToday: 'Trips Today',
    kpiActiveProjects: 'Active Projects',
    kpiActiveContracts: 'Active Contracts',
    kpiMonthlyRevenue: 'Monthly Revenue',
    kpiMonthlyExpenses: 'Monthly Expenses',
    kpiGrossProfit: 'Gross Profit',
    kpiExpiringAlerts: 'Expiring Alerts',

    // Sections
    secDivisions: 'Business Divisions Performance',
    secRevenueExpenses: 'Revenue vs Operating Expenses',
    secFleetStatus: 'Fleet Readiness Distribution',
    secTripStatus: 'Today\'s Dispatch Progress',
    secComplianceAlerts: 'Urgent Expiry & Compliance Alerts',
    secRecentActivity: 'Live Operations & Audit Trail',

    // Common
    sar: 'SAR',
    status: 'Status',
    actions: 'Actions',
    active: 'Active',
    idle: 'Idle',
    maintenance: 'Maintenance',
    inactive: 'Inactive',
    urgent: 'Urgent',
    warning: 'Warning',
    info: 'Info',
    viewDetails: 'View Details',
    export: 'Export CSV',
    filter: 'Filter',
    refresh: 'Refresh Data',
    resetSeed: 'Reset Demo Data',
  },
  ar: {
    // Brand
    brandName: 'نظام نجد للنقل (NGTC)',
    brandTagline: 'حلول النقل وإدارة المؤسسات',
    brandCountry: 'المملكة العربية السعودية',

    // Top Bar
    goodMorning: 'صباح الخير',
    goodAfternoon: 'مساء الخير',
    goodEvening: 'مساء الخير',
    searchPlaceholder: 'بحث في المركبات، السائقين، العقود، والرحلات (⌘K)...',
    notifications: 'التنبيهات والإشعارات',
    markAllRead: 'تحديد الكل كمقروء',
    noNotifications: 'لا توجد تنبيهات جديدة',
    viewAllAlerts: 'عرض جميع تنبيهات الامتثال',
    switchRole: 'تبديل الصلاحية',
    signOut: 'تسجيل الخروج',
    myProfile: 'ملفي الشخصي',
    settings: 'الإعدادات',

    // Nav
    navDashboard: 'لوحة القيادة',
    navOrganization: 'الهيكل التنظيمي',
    navBranches: 'الفروع',
    navDepartments: 'الأقسام',
    navCustomers: 'العملاء',
    navVendors: 'الموردين',
    navEmployees: 'الموظفون',
    navContracts: 'العقود والمشاريع',
    navAllContracts: 'جميع العقود',
    navActiveContracts: 'العقود النشطة',
    navExpiringContracts: 'عقود قاربت على الانتهاء',
    navProjects: 'المشاريع',
    navTransport: 'إدارة النقل',
    navOverview: 'نظرة عامة',
    navSchoolTransport: 'النقل المدرسي',
    navUniversityTransport: 'النقل الجامعي',
    navLaborTransport: 'نقل العمال والموظفين',
    navCorporateTransport: 'النقل المؤسسي',
    navRoutes: 'المسارات',
    navTrips: 'الرحلات اليومية',
    navFleet: 'إدارة الأسطول',
    navVehicles: 'المركبات والحافلات',
    navMaintenance: 'الصيانة الدورية',
    navFuel: 'إدارة الوقود',
    navDrivers: 'السائقين',
    navDriverRoster: 'دليل السائقين',
    navDriverAssignments: 'التوزيع والتعيين',
    navHR: 'الموارد البشرية',
    navAttendance: 'الحضور والانصراف',
    navLeave: 'الإجازات',
    navPayroll: 'الرواتب والأجور',
    navEducation: 'التعليم',
    navSchools: 'المدارس',
    navUniversities: 'الجامعات',
    navStudents: 'الطلاب والطالبات',
    navConstruction: 'المشاريع الإنشائية',
    navTravel: 'وكالة السفر والسياحة',
    navFinance: 'المالية والحسابات',
    navInvoices: 'الفواتير',
    navExpenses: 'المصروفات التشغيلية',
    navDocuments: 'إدارة الوثائق',
    navGPS: 'التتبع الفوري (GPS)',
    navReports: 'التقارير الإدارية',
    navAuditLogs: 'سجل العمليات والرقابة',
    navUsers: 'المستخدمون والصلاحيات',

    // KPIs
    kpiTotalVehicles: 'إجمالي الأسطول',
    kpiActiveVehicles: 'الأسطول العامل',
    kpiMaintenance: 'تحت الصيانة',
    kpiTotalDrivers: 'إجمالي السائقين',
    kpiActiveDrivers: 'السائقون المتاحون',
    kpiTripsToday: 'رحلات اليوم',
    kpiActiveProjects: 'المشاريع الجارية',
    kpiActiveContracts: 'العقود السارية',
    kpiMonthlyRevenue: 'الإيراد الشهري',
    kpiMonthlyExpenses: 'المصروفات التشغيلية',
    kpiGrossProfit: 'مجمل الأرباح',
    kpiExpiringAlerts: 'تنبيهات الانتهاء',

    // Sections
    secDivisions: 'أداء قطاعات الأعمال والتشغيل',
    secRevenueExpenses: 'مقارنة الإيرادات بالمصروفات التشغيلية',
    secFleetStatus: 'جاهزية وتوزيع الأسطول',
    secTripStatus: 'سير ومتابعة رحلات اليوم',
    secComplianceAlerts: 'تنبيهات الامتثال وصلاحيات الوثائق',
    secRecentActivity: 'سجل العمليات والرقابة المباشرة',

    // Common
    sar: 'ريال سعودي',
    status: 'الحالة',
    actions: 'الإجراءات',
    active: 'نشط',
    idle: 'متاح',
    maintenance: 'صيانة',
    inactive: 'غير نشط',
    urgent: 'عاجل',
    warning: 'تنبيه',
    info: 'إشعار',
    viewDetails: 'عرض التفاصيل',
    export: 'تصدير البيانات',
    filter: 'تصفية',
    refresh: 'تحديث البيانات',
    resetSeed: 'إعادة ضبط البيانات',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('ngtc_lang') as Language) || 'en';
  });

  const direction: Direction = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    localStorage.setItem('ngtc_lang', language);
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }, [language, direction]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const t = (key: string, fallback?: string): string => {
    return translations[language][key] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
