/**
 * ================================================
 * ملف الإعدادات - منصة سفراء الجودة
 * ================================================
 * 
 * تعليمات الإعداد:
 * 1. انسخ هذا الملف إلى config.js
 * 2. قم بتحديث القيم حسب بيئتك
 * 3. لا ترفع هذا الملف على GitHub (أضفه إلى .gitignore)
 */

const CONFIG = {
    
    // ===== إعدادات Google Apps Script =====
    GOOGLE_APPS_SCRIPT: {
        // رابط Web App الذي حصلت عليه من Google Apps Script
        WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbzmOah4qFJS6adaM-Dcx40jCjXiVvFCeOrP_6LwLQ1z95WEZqfG9ZWiPhePwqTkBu4p/exec',
        
        // مفتاح API (اختياري - للحماية الإضافية)
        API_KEY: '',
        
        // وقت انتظار الطلبات (بالميلي ثانية)
        TIMEOUT: 30000
    },
    
    // ===== إعدادات Google Sheets =====
    GOOGLE_SHEETS: {
        // معرّف ملف Google Sheets
        SHEET_ID: '1gjNQTeulX0BUatsWpdFdC4YrjkQx_s3atSCyUhBmK2w',
        
        // أسماء الصفحات
        SHEETS: {
            STUDENTS: 'المتدربين',
            TASKS: 'المهام',
            SUBMISSIONS: 'الشواهد',
            LOGS: 'السجل'
        }
    },
    
    // ===== إعدادات التطبيق =====
    APP: {
        // اسم المؤسسة
        ORGANIZATION_NAME: 'الكلية التقنية بحقل',
        
        // اسم المبادرة
        INITIATIVE_NAME: 'سفراء الجودة',
        
        // البريد الإلكتروني للدعم
        SUPPORT_EMAIL: 'fahadsaleh@tvtc.gov.sa',
        
        // رابط المنصة
        PLATFORM_URL: 'https://your-platform-url.com',
        
        // نسخة التطبيق
        VERSION: '1.0.0',
        
        // البيئة (development / production)
        ENVIRONMENT: 'development'
    },
    
    // ===== حساب الدعم =====
    SUPPORT: {
        // اسم مسؤول الدعم
        ADMIN_NAME: 'وكيل ضبط الجودة - الكلية التقنية بحقل',
        
        // حساب التليجرام
        TELEGRAM_ACCOUNT: 'https://t.me/EngFahadSaleh',
        
        // البريد الإلكتروني
        EMAIL: 'fahadsaleh@tvtc.gov.sa'
    },
    
    // ===== إعدادات الإشعارات =====
    NOTIFICATIONS: {
        // تفعيل إشعارات التليجرام
        TELEGRAM_ENABLED: false,
        
        // تفعيل إشعارات البريد الإلكتروني
        EMAIL_ENABLED: false,
        
        // عدد الأيام قبل الموعد النهائي للتذكير
        REMINDER_DAYS_BEFORE: 3,
        
        // وقت إرسال التذكيرات اليومية (بالساعة)
        DAILY_REMINDER_HOUR: 8
    },
    
    // ===== إعدادات الأمان =====
    SECURITY: {
        // كلمة مرور المشرف (يُنصح بتشفيرها)
        ADMIN_PASSWORD: 'admin123', // غيّر هذا فوراً!
        
        // تفعيل التحقق من الأصل (CORS)
        ENABLE_CORS: true,
        
        // النطاقات المسموحة
        ALLOWED_ORIGINS: [
            'https://your-platform-url.com',
            'http://localhost:8080'
        ],
        
        // مدة صلاحية الجلسة (بالدقائق)
        SESSION_DURATION: 480 // 8 ساعات
    },
    
    // ===== إعدادات الملفات =====
    FILES: {
        // الحد الأقصى لحجم الملف (بالميجابايت)
        MAX_FILE_SIZE: 10,
        
        // الامتدادات المسموحة
        ALLOWED_EXTENSIONS: [
            'pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'ppt', 'pptx'
        ],
        
        // مجلد Google Drive للتخزين
        DRIVE_FOLDER_ID: 'YOUR_DRIVE_FOLDER_ID'
    },
    
    // ===== إعدادات المهام =====
    TASKS: {
        // أنواع المهام المتاحة
        TYPES: [
            'عبارة',
            'جدارية',
            'تقرير',
            'منشور',
            'عرض',
            'فعالية',
            'ورشة عمل'
        ],
        
        // حالات الشواهد
        SUBMISSION_STATUSES: {
            PENDING: 'pending',
            APPROVED: 'approved',
            REJECTED: 'rejected'
        },
        
        // نصوص الحالات بالعربية
        STATUS_LABELS: {
            pending: 'بانتظار التقييم',
            approved: 'مقبول',
            rejected: 'مرفوض'
        }
    },
    
    // ===== الأقسام والتخصصات =====
    DEPARTMENTS: {
        'تقنية المعلومات': ['برمجة', 'شبكات', 'أمن سيبراني', 'تطبيقات الجوال'],
        'التقنية الإلكترونية': ['اتصالات', 'إلكترونيات', 'أجهزة طبية'],
        'التقنية الميكانيكية': ['صيانة', 'إنتاج', 'تبريد وتكييف'],
        'التقنية الكهربائية': ['قوى', 'آلات', 'تحكم'],
        'التقنية الإدارية': ['إدارة أعمال', 'محاسبة', 'تسويق']
    },
    
    // ===== المستويات التدريبية =====
    LEVELS: [1, 2, 3, 4, 5, 6],
    
    // ===== إعدادات واجهة المستخدم =====
    UI: {
        // الألوان الرئيسية (TVTC Colors)
        COLORS: {
            PRIMARY_BLUE: '#1e3c72',
            PRIMARY_GREEN: '#00a49a',
            DARK_BLUE: '#0b1f3a',
            SUCCESS: '#28a745',
            WARNING: '#ffc107',
            DANGER: '#dc3545'
        },
        
        // الخطوط
        FONTS: {
            PRIMARY: 'Tajawal',
            FALLBACK: 'Segoe UI, Arial, sans-serif'
        },
        
        // اللغة الافتراضية
        DEFAULT_LANGUAGE: 'ar',
        
        // اتجاه النص
        TEXT_DIRECTION: 'rtl'
    },
    
    // ===== روابط الموارد =====
    RESOURCES: {
        // رابط عرض المبادرة (PDF)
        PRESENTATION_URL: 'https://mttvtcedu-my.sharepoint.com/:b:/g/personal/fahadsaleh_tvtc_gov_sa/EXqV00eJ6QNKobcBBG2fHoMBbiWpXND0KXUKpBG15fmqiw?e=7TEG2R',
        
        // ملاحظة: تم حذف رابط العبارات المعتمدة - يستخدم فقط رابط عرض المبادرة
        
        // رابط دليل المستخدم
        USER_GUIDE_URL: 'https://drive.google.com/file/d/YOUR_FILE_ID/view',
        
        // رابط دليل المشرف
        ADMIN_GUIDE_URL: 'https://drive.google.com/file/d/YOUR_FILE_ID/view'
    },
    
    // ===== إعدادات التسجيل والمراقبة =====
    LOGGING: {
        // تفعيل التسجيل
        ENABLED: true,
        
        // مستوى التسجيل (debug / info / warning / error)
        LEVEL: 'info',
        
        // حفظ السجلات في Google Sheets
        LOG_TO_SHEETS: true,
        
        // إرسال الأخطاء الحرجة للمشرف
        NOTIFY_CRITICAL_ERRORS: true
    },
    
    // ===== إعدادات التخزين المؤقت =====
    CACHE: {
        // تفعيل التخزين المؤقت
        ENABLED: true,
        
        // مدة صلاحية الكاش (بالدقائق)
        DURATION: 30,
        
        // استخدام localStorage
        USE_LOCAL_STORAGE: true
    }
};

// ===== دوال مساعدة للوصول إلى الإعدادات =====

/**
 * الحصول على قيمة إعداد محدد
 */
function getConfig(path) {
    const keys = path.split('.');
    let value = CONFIG;
    
    for (const key of keys) {
        if (value[key] === undefined) {
            console.warn(`Configuration key not found: ${path}`);
            return null;
        }
        value = value[key];
    }
    
    return value;
}

/**
 * التحقق من صحة الإعدادات
 */
function validateConfig() {
    const errors = [];
    
    // التحقق من Google Apps Script URL
    if (!CONFIG.GOOGLE_APPS_SCRIPT.WEB_APP_URL || 
        CONFIG.GOOGLE_APPS_SCRIPT.WEB_APP_URL === 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec') {
        errors.push('يجب تحديث GOOGLE_APPS_SCRIPT.WEB_APP_URL');
    }
    
    // التحقق من Telegram Bot Token
    if (CONFIG.NOTIFICATIONS.TELEGRAM_ENABLED && !CONFIG.TELEGRAM.BOT_TOKEN) {
        errors.push('يجب تحديث TELEGRAM.BOT_TOKEN إذا كانت الإشعارات مفعّلة');
    }
    
    // التحقق من كلمة مرور المشرف
    if (CONFIG.SECURITY.ADMIN_PASSWORD === 'admin123') {
        console.warn('⚠️ تحذير: يُنصح بتغيير كلمة مرور المشرف الافتراضية!');
    }
    
    if (errors.length > 0) {
        console.error('❌ أخطاء في الإعدادات:', errors);
        return false;
    }
    
    console.log('✅ الإعدادات صحيحة');
    return true;
}

/**
 * طباعة ملخص الإعدادات
 */
function printConfigSummary() {
    console.log('📋 ملخص إعدادات المنصة:');
    console.log('========================');
    console.log(`المؤسسة: ${CONFIG.APP.ORGANIZATION_NAME}`);
    console.log(`المبادرة: ${CONFIG.APP.INITIATIVE_NAME}`);
    console.log(`النسخة: ${CONFIG.APP.VERSION}`);
    console.log(`البيئة: ${CONFIG.APP.ENVIRONMENT}`);
    console.log(`إشعارات Telegram: ${CONFIG.NOTIFICATIONS.TELEGRAM_ENABLED ? 'مفعّلة' : 'معطّلة'}`);
    console.log('========================');
}

// تصدير الإعدادات
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, getConfig, validateConfig, printConfigSummary };
}

// التحقق من الإعدادات عند التحميل
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', function() {
        if (CONFIG.APP.ENVIRONMENT === 'development') {
            printConfigSummary();
            validateConfig();
        }
    });
}
