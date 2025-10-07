/**
 * ================================================
 * ملف JavaScript الرئيسي - منصة سفراء الجودة
 * ================================================
 */

// ===== البيانات المخزنة محلياً =====
let currentStudent = null;
let currentUser = null;
let currentTaskId = null;

// ===== عند تحميل الصفحة =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 تم تحميل المنصة');
  checkSession();     // التحقق من وجود جلسة مسبقة
  testConnection();   // فحص الاتصال بـ Google Apps Script
});

// ===== اتصال موحّد مع GAS =====
const BASE_URL = CONFIG?.GOOGLE_APPS_SCRIPT?.WEB_APP_URL || '';

// 🔒 افتراضات آمنة
const DEFAULTS = { SESSION_MINUTES: 180 }; // 3 ساعات افتراضيًا
const SESSION_MIN = (CONFIG?.SECURITY?.SESSION_DURATION ?? DEFAULTS.SESSION_MINUTES);

// تنبيه مبكّر لو ما تم ضبط رابط GAS
if (!BASE_URL) {
  console.error('CONFIG.GOOGLE_APPS_SCRIPT.WEB_APP_URL غير مضبوط');
  setTimeout(()=> showToast('لم يتم ضبط رابط الخادم (Web App). حدّث config.js', 'error'), 0);
}

/* ===== Helpers: التقاط أعمدة بأسماء مختلفة + توحيد التاريخ + تطبيع المهام ===== */
function _cleanKey(k){ return String(k||'').toLowerCase().replace(/\s|_|-|\u200f|\u200e/g,''); }

function _pick(obj, candidates){
  if (obj == null || typeof obj !== 'object') return '';
  const keys = Object.keys(obj||{});
  // مطابقة مباشرة
  for (const c of candidates){
    if (c in obj && obj[c] != null && obj[c] !== '') return obj[c];
  }
  // مطابقة بعد تنظيف الاسم
  const map = {}; keys.forEach(k => map[_cleanKey(k)] = k);
  for (const c of candidates){
    const ck = _cleanKey(c);
    if (map[ck] !== undefined) {
      const v = obj[map[ck]];
      if (v != null && v !== '') return v;
    }
  }
  return '';
}

// يلتقط حساب التليجرام من أي عمود محتمل
function getTelegramValue(student){
  return _pick(student, ['telegram','تلغرام','تليجرام','حسابتلغرام','حسابتليجرام','Telegram']);
}

// توحيد تاريخ Google Sheets إلى YYYY-MM-DD
function _sheetDateToISO(v){
  if (v == null || v === '') return '';
  if (typeof v === 'string') return v;
  if (v instanceof Date) return v.toISOString().slice(0,10);
  if (typeof v === 'number' && isFinite(v)) {
    const ms = Math.round((v - 25569) * 86400 * 1000);
    try { return new Date(ms).toISOString().slice(0,10); } catch { return String(v); }
  }
  return String(v);
}

// تطبيع عنصر مهمة بشكل دفاعي جدًا
function normalizeTask(t) {
  if (t == null)  return { id:'', title:'', type:'-', deadline:'', description:'' };
  if (typeof t !== 'object') return { id:'', title:String(t), type:'-', deadline:'', description:'' };

  const id       = _pick(t, ['id','ID','taskId','TaskID','رقم المهمة','رقمالمهمة','المهمة','رقم']);
  const title    = _pick(t, ['title','Title','taskTitle','TaskTitle','name','Name','العنوان','عنوان','عنوان المهمة','اسم','اسم المهمة']);
  const type     = _pick(t, ['type','Type','category','Category','النوع','نوع','تصنيف']) || '-';
  const deadline = _sheetDateToISO(_pick(t, ['deadline','Deadline','due','Due','dueDate','DueDate','date','Date','الموعد النهائي','الموعد','تاريخ الاستحقاق','تاريخ التسليم','تاريخ']));
  const desc     = _pick(t, ['description','Description','desc','Desc','الوصف','شرح','تفاصيل']);

  return {
    id: String(id || ''),
    title: String(title || ''),
    type: String(type || '-'),
    deadline,
    description: String(desc || '')
  };
}

// مهما كان شكل data (نص/قاموس/مصفوفة) نحوله لمصفوفة
function normalizeTasksResponse(data) {
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    try {
      const p = JSON.parse(data);
      if (Array.isArray(p)) return p;
      if (p && Array.isArray(p.tasks)) return p.tasks;
      if (p && typeof p === 'object') return Object.values(p);
    } catch {}
    return [];
  }
  if (data && Array.isArray(data.tasks)) return data.tasks;
  if (data && typeof data === 'object') return Object.values(data);
  return [];
}

/* ===== API Layer (GAS) ===== */
function apiPostJSON(action, payload = {}) {
  const url = `${BASE_URL}?action=${encodeURIComponent(action)}`;
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, // لتجنب preflight
    body: JSON.stringify({ action, ...payload })
  }).then(r => r.json());
}

function apiGet(params = {}) {
  const q = new URLSearchParams(params);
  return fetch(`${BASE_URL}?${q.toString()}`, { method: 'GET' })
    .then(r => r.json());
}

function apiPost(action, payload = {}) {
  const body = new URLSearchParams({ action, ...payload });
  return fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body
  }).then(r => r.json());
}

/* ===== اتصال ===== */
async function testConnection() {
  try {
    const res = await apiGet({ action: 'test' });
    if (res.success) {
      console.log('✅ الاتصال ناجح مع Google Apps Script');
    } else {
      console.error('❌ فشل الاتصال:', res.message);
      showToast('خطأ في الاتصال بالخادم', 'error');
    }
  } catch (e) {
    console.error('❌ خطأ في الاتصال:', e);
    showToast('تعذر الاتصال بالخادم. تحقق من رابط Web App', 'error');
  }
}

/* ===== التسجيل ===== */
function startRegistration() {
  hideScreen('welcomeScreen');
  showScreen('registrationScreen');
  updateProgress(33);
}

/* ===== البحث عن المتدرب ===== */
async function searchStudent() {
  const studentId = document.getElementById('studentId').value.trim();
  if (!studentId) {
    showError('errorMessage', 'errorText', 'الرجاء إدخال الرقم التدريبي');
    return;
  }
  hideError('errorMessage');
  showLoading();
  try {
    const res = await apiGet({ action: 'getStudent', id: studentId });
    hideLoading();

    if (res.success && res.data) {
      currentStudent = res.data;
      displayStudentData(res.data);

      const tg = getTelegramValue(res.data);
      if (tg) {
        currentStudent.telegram = tg;
        saveSession(currentStudent);
        document.getElementById('successName').textContent = currentStudent.name || '';
        hideStep('step1'); hideStep('step2'); showStep('step3'); updateProgress(100);
        showToast('تم التعرف عليك — لديك حساب تليجرام مسجّل مسبقًا ✅', 'success');
      } else {
        hideStep('step1'); showStep('step2'); updateProgress(66);
        showToast('تم العثور على بياناتك — أكمل تسجيل حساب التليجرام', 'info');
      }
    } else {
      showError('errorMessage', 'errorText', res.message || 'لم يتم العثور على الرقم التدريبي');
    }
  } catch (e) {
    hideLoading();
    console.error(e);
    showError('errorMessage', 'errorText', 'حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى');
  }
}

/* ===== عرض بيانات المتدرب + تهيئة حقل التليجرام ===== */
function displayStudentData(student) {
  document.getElementById('displayName').textContent = student.name;
  document.getElementById('displayId').textContent = student.id;
  document.getElementById('displayDepartment').textContent = student.department;
  document.getElementById('displaySpecialization').textContent = student.specialization;
  document.getElementById('displayLevel').textContent = student.level;

  const tgVal = getTelegramValue(student);
  const tgInput = document.getElementById('telegram');
  if (tgVal) { tgInput.value = tgVal; tgInput.disabled = true; }
  else { tgInput.value = ''; tgInput.disabled = false; }
}

/* ===== تسجيل حساب التليجرام (منع التكرار) ===== */
async function submitRegistration() {
  const already = getTelegramValue(currentStudent);
  if (already) {
    showToast('حساب التليجرام مسجّل مسبقًا لهذا المتدرب.', 'info');
    document.getElementById('successName').textContent = currentStudent.name || '';
    hideStep('step2'); showStep('step3'); updateProgress(100);
    return;
  }

  const telegramInput = document.getElementById('telegram');
  const errBoxId = 'errorMessage2';
  const errTxtId = 'errorText2';
  hideError(errBoxId);

  const raw = (telegramInput.value || '').trim();
  if (!raw) return showError(errBoxId, errTxtId, 'الرجاء إدخال حساب التليجرام');
  if (!/^@?[A-Za-z0-9_]{5,32}$/.test(raw)) return showError(errBoxId, errTxtId, 'أدخل اسم مستخدم صحيح مثل @username');

  const username = raw.startsWith('@') ? raw : '@' + raw;

  showLoading();
  try {
    const res = await apiPostJSON('registerStudent', { id: currentStudent.id, telegram: username });
    if (!res || !res.success) {
      const msg = (res && res.message) ? res.message : 'حدث خطأ في التسجيل';
      showError(errBoxId, errTxtId, msg);
      return;
    }
    currentStudent.telegram = username;
    saveSession(currentStudent);

    document.getElementById('successName').textContent = currentStudent.name || '';
    hideStep('step2'); showStep('step3'); updateProgress(100);
    showToast('تم التسجيل بنجاح! 🎉', 'success');
  } catch (e) {
    console.error('submitRegistration error:', e);
    showError(errBoxId, errTxtId, 'تعذر الاتصال بالخادم');
  } finally {
    hideLoading();
  }
}

/* ===== عرض المهام ===== */
async function viewTasks() {
  showLoading();
  try {
    const res = await apiGet({ action: 'getStudentTasks', studentId: currentStudent.id });

    // لوج للتشخيص داخل الدالة فقط
    console.log('raw tasks payload:', res.data, Array.isArray(res.data) ? 'array' : typeof res.data);

    if (!res.success) throw new Error(res.message || 'تعذر جلب المهام');

    currentStudent.tasks = normalizeTasksResponse(res.data);
    hideScreen('registrationScreen');
    showScreen('studentDashboard');

    await loadSubmissions(currentStudent.id);
    displayTasks();
    updateStats();
  } catch (e) {
    console.error(e);
    showToast('خطأ في تحميل المهام', 'error');
  } finally {
    hideLoading();
  }
}

/* ===== تحميل لوحة التحكم ===== */
async function loadDashboard() {
  document.getElementById('dashboardName').textContent = currentStudent.name;
  document.getElementById('dashboardDept').textContent = currentStudent.department;
  document.getElementById('dashboardLevel').textContent = currentStudent.level;

  showLoading();
  try {
    const tasksRes = await apiGet({ action: 'getStudentTasks', studentId: currentStudent.id });
    currentStudent.tasks = tasksRes.success ? normalizeTasksResponse(tasksRes.data) : [];

    await loadSubmissions(currentStudent.id);
    displayTasks();
    updateStats();
  } catch (e) {
    console.error(e);
    showToast('تعذر تحميل لوحة التحكم', 'error');
  } finally {
    hideLoading();
  }
}

/* ===== تحميل الشواهد ===== */
async function loadSubmissions(studentId) {
  try {
    let res = await apiGet({ action: 'getSubmissions', studentId });
    if (!res.success && !Array.isArray(res.data)) {
      res = await apiGet({ action: 'getSubmissions' });
    }
    const rows = Array.isArray(res.data) ? res.data : [];
    currentStudent.submissions = rows.filter(s => String(s.studentId) == String(studentId));
  } catch (e) {
    console.error('خطأ في تحميل الشواهد:', e);
    currentStudent.submissions = [];
  }
}

/* ===== عرض المهام على الواجهة ===== */
function displayTasks() {
  const tasksList = document.getElementById('tasksList');
  tasksList.innerHTML = '';

  const tasks = normalizeTasksResponse(currentStudent.tasks).map(normalizeTask);

  if (tasks.length === 0) {
    tasksList.innerHTML = '<p class="no-tasks">لا توجد مهام مخصصة حالياً</p>';
    return;
  }

  tasks.forEach(task => {
    const submission = (currentStudent.submissions || []).find(s => String(s.taskId) == String(task.id));
    const card = createTaskCard(task, submission);
    tasksList.appendChild(card);
  });
}

/* ===== إنشاء بطاقة مهمة ===== */
function createTaskCard(task, submission) {
  const div = document.createElement('div');
  div.className = 'task-card';

  let statusBadge = '';
  if (submission) {
    if (submission.status === 'approved') statusBadge = '<span class="status-badge approved">✓ مقبول</span>';
    else if (submission.status === 'pending') statusBadge = '<span class="status-badge pending">⏳ بانتظار التقييم</span>';
    else statusBadge = '<span class="status-badge rejected">✗ مرفوض</span>';
  } else {
    statusBadge = '<span class="status-badge remaining">⚠ متبقية</span>';
  }

  div.innerHTML = `
    <div class="task-header">
      <h3 class="task-title"></h3>
      ${statusBadge}
    </div>
    <div class="task-details">
      <p><i class="fas fa-tag"></i> ${task.type || '-'}</p>
      <p><i class="fas fa-calendar"></i> الموعد: ${task.deadline || '-'}</p>
    </div>
    <p class="task-description"></p>
    <div class="task-actions"></div>
  `;

  // أدخل النصوص بأمان
  div.querySelector('.task-title').textContent = task.title || '';
  div.querySelector('.task-description').textContent = task.description || '';

  const actions = div.querySelector('.task-actions');
  const btn = document.createElement('button');

  if (submission?.status === 'approved') {
    btn.className = 'btn-disabled';
    btn.disabled = true;
    btn.textContent = 'تم الإنجاز';
  } else if (submission?.status === 'pending') {
    btn.className = 'btn-disabled';
    btn.disabled = true;
    btn.textContent = 'تم الرفع';
  } else {
    btn.className = 'btn-primary btn-small';
    btn.textContent = submission ? 'إعادة الرفع' : 'رفع الشاهد';
    btn.addEventListener('click', () => openUploadModal(task.id, task.title || `مهمة ${task.id}`));
  }

  actions.appendChild(btn);
  return div;
}


/* ===== نافذة الرفع ===== */
function openUploadModal(taskId, taskTitle) {
  currentTaskId = taskId;
  document.getElementById('modalTaskTitle').textContent = taskTitle;
  document.getElementById('uploadModal').classList.add('active');
}
function closeUploadModal() {
  document.getElementById('uploadModal').classList.remove('active');
  const f = document.getElementById('evidenceFile');
  const u = document.getElementById('fileUrl');
  if (f) f.value = '';
  if (u) u.value = '';
}


/* ===== رفع الشاهد ===== */
/* ===== رفع الشاهد (نسخة مصحّحة) ===== */
async function submitEvidence() {
  const fileInput = document.getElementById('evidenceFile');
  const urlInput  = document.getElementById('fileUrl');
  const file      = fileInput?.files?.[0] || null;
  const link      = (urlInput?.value || '').trim();

  // 1) حراس أساسيين
  if (!currentTaskId || !currentStudent?.id) {
    showToast('بيانات المهمة أو المتدرب غير مكتملة', 'error');
    return;
  }
  if (!file && !link) {
    showToast('اختر ملفًا أو أدخل رابطًا', 'warning');
    return;
  }

  showLoading();
  try {
    if (file) {
      // 2) تحقق من الملف
      const v = validateFile(file);
      if (!v.ok) { showToast(v.msg, 'error'); return; }

      // 3) تحويل إلى dataURL
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result); // data:*/*;base64,....
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // 4) رفع إلى GAS (يحفظ في درايف + يسجل الشاهد)
      const res = await apiPostJSON('uploadEvidence', {
        studentId: currentStudent.id,
        taskId: currentTaskId,
        filename: file.name,
        dataUrl
      });
      if (!res || !res.success) {
        showToast(res?.message || 'تعذر رفع الملف', 'error');
        return;
      }
      showToast('تم رفع الملف وتسجيل الشاهد ✅', 'success');

    } else {
      // ——— مسار الرابط القديم ———
      if (!/^https?:\/\//i.test(link)) {
        showToast('الرجاء إدخال رابط صحيح يبدأ بـ http أو https', 'error');
        return;
      }
      const res = await apiPostJSON('saveSubmission', {
        studentId: currentStudent.id,
        taskId: currentTaskId,
        fileUrl: link
      });
      if (!res || !res.success) {
        showToast(res?.message || 'تعذر تسجيل الشاهد بالرابط', 'error');
        return;
      }
      showToast('تم تسجيل الشاهد بالرابط ✅', 'success');
    }

    // 5) تنظيف وإغلاق
    closeUploadModal();
    if (fileInput) fileInput.value = '';
    if (urlInput)  urlInput.value  = '';

    // 6) تحديث لوحة الطالب
    await loadSubmissions(currentStudent.id);
    displayTasks();
    updateStats();

  } catch (err) {
    console.error('submitEvidence error:', err);
    showToast('حدث خطأ أثناء رفع الشاهد', 'error');
  } finally {
    hideLoading();
  }
}


function validateFile(file) {
  if (!file) return { ok: false, msg: 'الرجاء اختيار ملف' };
  const maxMB = (CONFIG?.FILES?.MAX_FILE_SIZE ?? 10);
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > maxMB) return { ok: false, msg: `حجم الملف يتجاوز ${maxMB}MB` };
  const allowed = (CONFIG?.FILES?.ALLOWED_EXTENSIONS ?? ['pdf','jpg','jpeg','png','doc','docx','ppt','pptx']);
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (!allowed.includes(ext)) return { ok: false, msg: `امتداد غير مسموح (${ext})` };
  return { ok: true };
}


/* ===== الإحصائيات ===== */
function updateStats() {
  const tasks = normalizeTasksResponse(currentStudent.tasks);
  const total = tasks.length;
  const subs = currentStudent.submissions || [];
  const approved = subs.filter(s => s.status === 'approved').length;
  const pending  = subs.filter(s => s.status === 'pending').length;
  const remaining = Math.max(total - approved - pending, 0);

  document.getElementById('totalTasks').textContent = total;
  document.getElementById('completedTasks').textContent = approved;
  document.getElementById('pendingTasks').textContent = pending;
  document.getElementById('remainingTasks').textContent = remaining;
}

/* ===== الجلسات ===== */
function logout() {
  if (confirm('هل تريد تسجيل الخروج؟')) {
    clearSession();
    location.reload();
  }
}

function saveSession(student) {
  try {
    const sessionData = { student, timestamp: new Date().getTime() };
    localStorage.setItem('quality_session', JSON.stringify(sessionData));
  } catch (error) {
    console.error('خطأ في حفظ الجلسة:', error);
  }
}

function checkSession() {
  try {
    const sessionData = JSON.parse(localStorage.getItem('quality_session'));
    if (sessionData && sessionData.student) {
      const timestamp = sessionData.timestamp;
      const now = new Date().getTime();
      const hoursPassed = (now - timestamp) / (1000 * 60 * 60);
      if (hoursPassed < (SESSION_MIN / 60)) {
        currentStudent = sessionData.student;
        hideScreen('welcomeScreen');
        showScreen('studentDashboard');
        loadDashboard();
      }
    }
  } catch (error) {
    console.error('خطأ في فحص الجلسة:', error);
  }
}

function clearSession() {
  localStorage.removeItem('quality_session');
  currentStudent = null;
}

/* ===== دوال مساعدة للواجهة ===== */
function showScreen(id){ document.getElementById(id).classList.add('active'); }
function hideScreen(id){ document.getElementById(id).classList.remove('active'); }
function showStep(id){ document.getElementById(id).classList.add('active'); }
function hideStep(id){ document.getElementById(id).classList.remove('active'); }
function updateProgress(percent){
  document.getElementById('progressFill').style.width = percent + '%';
  document.getElementById('progressPercent').textContent = percent;
}
function showError(containerId, textId, message){
  document.getElementById(containerId).classList.remove('hidden');
  document.getElementById(textId).textContent = message;
}
function hideError(containerId){
  document.getElementById(containerId).classList.add('hidden');
}
function showLoading(){ document.getElementById('loadingOverlay').classList.remove('hidden'); }
function hideLoading(){ document.getElementById('loadingOverlay').classList.add('hidden'); }
function showToast(message, type = 'info'){
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ===== تحميل الملفات ===== */
function downloadFile(type) {
  let url = '';
  if (type === 'presentation') url = CONFIG.RESOURCES.PRESENTATION_URL;
  else if (type === 'phrases') url = CONFIG.RESOURCES.PHRASES_URL;

  if (url) window.open(url, '_blank');
  else showToast('الرابط غير متوفر حالياً', 'warning');
}

/* ===== لوحة تحكم المشرف ===== */
function showAdminLogin() {
  const password = prompt('كلمة مرور المشرف:');
  if (password === CONFIG.SECURITY.ADMIN_PASSWORD) {
    hideScreen('welcomeScreen');
    showScreen('adminDashboard');
    loadAdminDashboard();
  } else if (password) {
    alert('كلمة المرور غير صحيحة');
  }
}

async function loadAdminDashboard() { showAdminTab('overview'); }

function showAdminTab(tab) {
  document.querySelectorAll('.admin-tabs .tab-btn').forEach(btn => {
    const onClick = btn.getAttribute('onclick') || '';
    btn.classList.toggle('active', onClick.includes(`'${tab}'`));
  });

  const content = document.getElementById('adminContent');
  content.innerHTML = '<div class="loading">جاري التحميل...</div>';

  if (tab === 'overview') loadOverview();
  else if (tab === 'students') loadStudents();
  else if (tab === 'submissions') loadSubmissionsForAdmin();
}

async function loadOverview() {
  try {
    const res = await apiGet({ action: 'getStatistics' });
    if (res.success) {
      const stats = res.data || {};
      const content = document.getElementById('adminContent');
      content.innerHTML = `
        <div class="stats-grid">
          <div class="stat-card"><h3>${stats.totalStudents ?? 0}</h3><p>إجمالي المتدربين</p></div>
          <div class="stat-card"><h3>${stats.registeredStudents ?? 0}</h3><p>المسجلين</p></div>
          <div class="stat-card"><h3>${stats.totalSubmissions ?? 0}</h3><p>الشواهد المرفوعة</p></div>
          <div class="stat-card"><h3>${stats.pendingSubmissions ?? 0}</h3><p>بانتظار التقييم</p></div>
        </div>`;
    }
  } catch (e) {
    console.error('خطأ في تحميل النظرة العامة:', e);
  }
}

async function loadStudents() {
  const container = document.getElementById('adminContent');
  container.innerHTML = '<div class="loading">جاري تحميل المتدربين...</div>';
  try {
    const res = await apiGet({ action: 'getStudents' });
    if (!res?.success) throw new Error(res?.message || 'تعذر جلب المتدربين');

    const rows = Array.isArray(res.data) ? res.data : [];
    if (rows.length === 0) {
      container.innerHTML = '<p class="empty">لا توجد بيانات متدربين.</p>';
      return;
    }

    // جدول بسيط
    const table = document.createElement('table');
    table.className = 'admin-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th>الرقم التدريبي</th>
          <th>الاسم</th>
          <th>القسم</th>
          <th>التخصص</th>
          <th>المستوى</th>
          <th>تليجرام</th>
          <th>تاريخ التسجيل</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');

    rows.forEach(s => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${s.id || ''}</td>
        <td>${s.name || ''}</td>
        <td>${s.department || ''}</td>
        <td>${s.specialization || ''}</td>
        <td>${s.level ?? ''}</td>
        <td>${s.telegram || ''}</td>
        <td>${s.registrationDate || ''}</td>
      `;
      tbody.appendChild(tr);
    });

    // (اختياري) مربع بحث سريع
    const search = document.createElement('input');
    search.type = 'search';
    search.placeholder = 'ابحث بالاسم أو الرقم التدريبي...';
    search.className = 'admin-search';
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      Array.from(tbody.rows).forEach(r => {
        const txt = r.textContent.toLowerCase();
        r.style.display = txt.includes(q) ? '' : 'none';
      });
    });

    container.innerHTML = '';
    container.appendChild(search);
    container.appendChild(table);

  } catch (e) {
    console.error('loadStudents error:', e);
    container.innerHTML = `<p class="error">فشل تحميل المتدربين: ${e.message}</p>`;
  }
}


async function loadSubmissionsForAdmin() {
  const container = document.getElementById('adminContent');
  container.innerHTML = '<div class="loading">جاري تحميل الشواهد...</div>';
  try {
    const res = await apiGet({ action: 'getSubmissions' });
    if (!res?.success) throw new Error(res?.message || 'تعذر جلب الشواهد');

    const subs = Array.isArray(res.data) ? res.data : [];
    if (subs.length === 0) {
      container.innerHTML = '<p class="empty">لا توجد شواهد.</p>';
      return;
    }

    const table = document.createElement('table');
    table.className = 'admin-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th>ID</th>
          <th>الرقم التدريبي</th>
          <th>رقم المهمة</th>
          <th>الرابط/الملف</th>
          <th>التاريخ</th>
          <th>الحالة</th>
          <th>ملاحظات</th>
          <th>إجراءات</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');

    subs.forEach(s => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${s.id}</td>
        <td>${s.studentId}</td>
        <td>${s.taskId}</td>
        <td>${s.fileUrl ? `<a href="${s.fileUrl}" target="_blank">فتح</a>` : '-'}</td>
        <td>${s.date || ''}</td>
        <td>${(CONFIG?.TASKS?.STATUS_LABELS?.[s.status]) || s.status || ''}</td>
        <td>${s.notes || ''}</td>
        <td class="actions"></td>
      `;
      const actions = tr.querySelector('.actions');

      const notesInput = document.createElement('input');
      notesInput.type = 'text';
      notesInput.placeholder = 'ملاحظات (اختياري)';
      notesInput.value = s.notes || '';
      notesInput.style.minWidth = '160px';

      const approveBtn = document.createElement('button');
      approveBtn.className = 'btn-success btn-small';
      approveBtn.textContent = 'قبول';
      approveBtn.onclick = async () => {
        await updateSubmissionStatus(s.id, 'approved', notesInput.value);
      };

      const rejectBtn = document.createElement('button');
      rejectBtn.className = 'btn-danger btn-small';
      rejectBtn.textContent = 'رفض';
      rejectBtn.onclick = async () => {
        await updateSubmissionStatus(s.id, 'rejected', notesInput.value);
      };

      actions.appendChild(notesInput);
      actions.appendChild(approveBtn);
      actions.appendChild(rejectBtn);

      tbody.appendChild(tr);
    });

    container.innerHTML = '';
    container.appendChild(table);

  } catch (e) {
    console.error('loadSubmissionsForAdmin error:', e);
    container.innerHTML = `<p class="error">فشل تحميل الشواهد: ${e.message}</p>`;
  }
}

async function updateSubmissionStatus(id, status, notes='') {
  try {
    const res = await apiPostJSON('updateSubmissionStatus', { id, status, notes });
    if (!res?.success) {
      showToast(res?.message || 'تعذر تحديث الحالة', 'error');
      return;
    }
    showToast('تم تحديث الحالة بنجاح', 'success');
    // أعد التحميل لتحديث القائمة
    loadSubmissionsForAdmin();
  } catch (e) {
    console.error('updateSubmissionStatus error:', e);
    showToast('حدث خطأ أثناء التحديث', 'error');
  }
}


function showNotifications() {
  showToast('لا توجد إشعارات جديدة', 'info');
}
