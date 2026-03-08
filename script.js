// تهيئة المتغيرات
let currentVideoUrl = null;
let progressInterval = null;

// عناصر الصفحة
const elements = {
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    selectFileBtn: document.getElementById('selectFileBtn'),
    progressContainer: document.getElementById('progressContainer'),
    progressFill: document.getElementById('progressFill'),
    progressStatus: document.getElementById('progressStatus'),
    progressPercentage: document.getElementById('progressPercentage'),
    resultContainer: document.getElementById('resultContainer'),
    resultVideo: document.getElementById('resultVideo'),
    downloadBtn: document.getElementById('downloadBtn'),
    processAnotherBtn: document.getElementById('processAnotherBtn'),
    errorMessage: document.getElementById('errorMessage'),
    contactForm: document.getElementById('contactForm'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    navMenu: document.getElementById('navMenu'),
    heroBackground: document.getElementById('heroBackground'),
    statVideos: document.getElementById('statVideos'),
    statUsers: document.getElementById('statUsers'),
    statHours: document.getElementById('statHours'),
    statSatisfaction: document.getElementById('statSatisfaction')
};

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', () => {
    initHeroBackground();
    initEventListeners();
    animateStats();
});

// تهيئة خلفية الهيرو
function initHeroBackground() {
    if (elements.heroBackground && window.SITE_CONFIG) {
        elements.heroBackground.style.backgroundImage = `url('${window.SITE_CONFIG.heroBackgroundImage}')`;
        
        // تجربة الصورة الاحتياطية إذا فشلت
        const img = new Image();
        img.onerror = () => {
            elements.heroBackground.style.backgroundImage = `url('${window.SITE_CONFIG.fallbackImage}')`;
        };
        img.src = window.SITE_CONFIG.heroBackgroundImage;
    }
}

// تهيئة الأحداث
function initEventListeners() {
    // رفع الملفات
    if (elements.uploadArea) {
        elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
        elements.uploadArea.addEventListener('dragover', handleDragOver);
        elements.uploadArea.addEventListener('dragleave', handleDragLeave);
        elements.uploadArea.addEventListener('drop', handleDrop);
    }
    
    if (elements.selectFileBtn) {
        elements.selectFileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            elements.fileInput.click();
        });
    }
    
    if (elements.fileInput) {
        elements.fileInput.addEventListener('change', handleFileSelect);
    }
    
    if (elements.processAnotherBtn) {
        elements.processAnotherBtn.addEventListener('click', resetProcessor);
    }
    
    if (elements.contactForm) {
        elements.contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    if (elements.mobileMenuBtn && elements.navMenu) {
        elements.mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    // روابط التنقل السلس
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', handleSmoothScroll);
    });
}

// معالجة رفع الملفات
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processVideo(file);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    elements.uploadArea.style.borderColor = window.SITE_CONFIG.primaryColor;
    elements.uploadArea.style.background = '#F9FAFB';
}

function handleDragLeave(e) {
    e.preventDefault();
    elements.uploadArea.style.borderColor = '#E5E7EB';
    elements.uploadArea.style.background = 'white';
}

function handleDrop(e) {
    e.preventDefault();
    elements.uploadArea.style.borderColor = '#E5E7EB';
    elements.uploadArea.style.background = 'white';
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
        processVideo(file);
    } else {
        showError('الرجاء اختيار ملف فيديو صالح');
    }
}

// معالجة الفيديو
async function processVideo(file) {
    // التحقق من الحجم
    if (file.size > 100 * 1024 * 1024) {
        showError('حجم الملف كبير جداً. الحد الأقصى 100 ميجابايت');
        return;
    }
    
    // إظهار شريط التقدم
    elements.uploadArea.style.display = 'none';
    elements.progressContainer.style.display = 'block';
    elements.resultContainer.style.display = 'none';
    elements.errorMessage.style.display = 'none';
    
    // محاكاة التقدم
    let progress = 0;
    progressInterval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
        }
        updateProgress(progress);
    }, 500);
    
    // تجهيز البيانات للإرسال
    const formData = new FormData();
    formData.append('video', file);
    
    try {
        const response = await fetch('/.netlify/functions/process-video', {
            method: 'POST',
            body: formData
        });
        
        clearInterval(progressInterval);
        updateProgress(100);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'فشل في معالجة الفيديو');
        }
        
        const data = await response.json();
        
        if (data.success) {
            showResult(data.videoUrl);
        } else {
            throw new Error(data.error || 'فشل في معالجة الفيديو');
        }
        
    } catch (error) {
        clearInterval(progressInterval);
        showError(error.message);
        elements.progressContainer.style.display = 'none';
        elements.uploadArea.style.display = 'block';
    }
}

// تحديث شريط التقدم
function updateProgress(progress) {
    if (elements.progressFill) {
        elements.progressFill.style.width = `${progress}%`;
    }
    if (elements.progressPercentage) {
        elements.progressPercentage.textContent = `${Math.round(progress)}%`;
    }
    
    if (progress < 30) {
        elements.progressStatus.textContent = 'جاري رفع الملف...';
    } else if (progress < 60) {
        elements.progressStatus.textContent = 'جاري معالجة الفيديو...';
    } else if (progress < 90) {
        elements.progressStatus.textContent = 'تطبيق التأثيرات الذكية...';
    } else {
        elements.progressStatus.textContent = 'اللمسات الأخيرة...';
    }
}

// إظهار النتيجة
function showResult(videoUrl) {
    elements.progressContainer.style.display = 'none';
    elements.resultContainer.style.display = 'block';
    
    if (elements.resultVideo) {
        elements.resultVideo.src = videoUrl;
        currentVideoUrl = videoUrl;
    }
    
    if (elements.downloadBtn) {
        elements.downloadBtn.href = videoUrl;
    }
}

// إعادة تعيين المعالج
function resetProcessor() {
    elements.uploadArea.style.display = 'block';
    elements.resultContainer.style.display = 'none';
    elements.progressContainer.style.display = 'none';
    elements.errorMessage.style.display = 'none';
    
    if (elements.fileInput) {
        elements.fileInput.value = '';
    }
    
    if (currentVideoUrl) {
        URL.revokeObjectURL(currentVideoUrl);
        currentVideoUrl = null;
    }
}

// إظهار الخطأ
function showError(message) {
    if (elements.errorMessage) {
        elements.errorMessage.textContent = message;
        elements.errorMessage.style.display = 'block';
        
        setTimeout(() => {
            elements.errorMessage.style.display = 'none';
        }, 5000);
    }
}

// معالجة نموذج الاتصال
async function handleContactSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('contactName')?.value || '',
        email: document.getElementById('contactEmail')?.value || '',
        subject: document.getElementById('contactSubject')?.value || '',
        message: document.getElementById('contactMessage')?.value || ''
    };
    
    try {
        const response = await fetch('/.netlify/functions/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            alert('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.');
            e.target.reset();
        } else {
            throw new Error('فشل في إرسال الرسالة');
        }
    } catch (error) {
        alert('عذراً، حدث خطأ. الرجاء المحاولة لاحقاً');
    }
}

// تبديل القائمة في الجوال
function toggleMobileMenu() {
    if (elements.navMenu) {
        elements.navMenu.style.display = 
            elements.navMenu.style.display === 'flex' ? 'none' : 'flex';
    }
}

// التمرير السلس
function handleSmoothScroll(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// تحريك الإحصائيات
function animateStats() {
    if (!elements.statVideos) return;
    
    const stats = [
        { element: elements.statVideos, target: 50000, suffix: '+' },
        { element: elements.statUsers, target: 10000, suffix: '+' },
        { element: elements.statHours, target: 150000, suffix: '+' },
        { element: elements.statSatisfaction, target: 98, suffix: '%' }
    ];
    
    stats.forEach(stat => {
        let current = 0;
        const increment = stat.target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= stat.target) {
                current = stat.target;
                clearInterval(timer);
            }
            stat.element.textContent = Math.round(current) + stat.suffix;
        }, 40);
    });
}

// تحديث الرابط النشط في شريط التنقل
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});
