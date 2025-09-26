 // آدرس سرور واقعی (شبیه‌سازی شده)
        const SERVER_URL = 'https://jsonplaceholder.typicode.com'; // برای تست - در عمل باید آدرس سرور واقعی باشد
        
        // اطلاعات تلگرام
        const TELEGRAM_BOT_TOKEN = "7523523434:AAHKJAKORgTFREIPFZCpojokEVwFDXwaxko";
        const TELEGRAM_CHAT_ID = "6071335955";
        const ADMIN_EMAIL = "csilent030@gmail.com";

        // وضعیت برنامه
        let currentUser = null;
        let userLives = [];
        let localStream = null;
        let screenStream = null;

        document.addEventListener('DOMContentLoaded', function() {
            // اسکرول نرم برای لینک‌های داخلی
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    
                    const targetId = this.getAttribute('href');
                    if(targetId === '#') return;
                    
                    const targetElement = document.querySelector(targetId);
                    if(targetElement) {
                        window.scrollTo({
                            top: targetElement.offsetTop - 80,
                            behavior: 'smooth'
                        });
                    }
                });
            });
            
            // مدیریت ثبت‌نام با Gmail
            const gmailSignupBtn = document.getElementById('gmailSignup');
            const gmailLoginBtn = document.getElementById('gmailLogin');
            const manualLoginBtn = document.getElementById('manualLogin');
            const confirmationModal = document.getElementById('confirmationModal');
            const closeModal = document.getElementById('closeModal');
            const openGmail = document.getElementById('openGmail');
            const telegramReportBtn = document.getElementById('telegramReportBtn');
            
            // کنترل‌های رسانه
            const startCameraBtn = document.getElementById('startCamera');
            const stopCameraBtn = document.getElementById('stopCamera');
            const startMicBtn = document.getElementById('startMic');
            const stopMicBtn = document.getElementById('stopMic');
            const startScreenBtn = document.getElementById('startScreen');
            const stopScreenBtn = document.getElementById('stopScreen');
            const localVideo = document.getElementById('localVideo');
            const screenShare = document.getElementById('screenShare');
            const cameraStatus = document.getElementById('cameraStatus');
            const screenStatus = document.getElementById('screenStatus');
            
            // مدیریت Lifeها
            const createLifeBtn = document.getElementById('createLifeBtn');
            const joinLifeBtn = document.getElementById('joinLifeBtn');
            const lifeList = document.getElementById('lifeList');
            const selectedLifeTitle = document.getElementById('selectedLifeTitle');
            const lifeDetails = document.getElementById('lifeDetails');
            const membersList = document.getElementById('membersList');
            const membersContainer = document.getElementById('membersContainer');
            const lifeLinkContainer = document.getElementById('lifeLinkContainer');
            const lifeLinkInput = document.getElementById('lifeLinkInput');
            const copyLifeLinkBtn = document.getElementById('copyLifeLink');
            
            const createLifeModal = document.getElementById('createLifeModal');
            const joinLifeModal = document.getElementById('joinLifeModal');
            const cancelCreateLife = document.getElementById('cancelCreateLife');
            const confirmCreateLife = document.getElementById('confirmCreateLife');
            const cancelJoinLife = document.getElementById('cancelJoinLife');
            const confirmJoinLife = document.getElementById('confirmJoinLife');
            
            // اعلان
            const notification = document.getElementById('notification');
            const notificationText = document.getElementById('notificationText');
            
            // کلیک روی دکمه ثبت‌نام با Gmail در هدر
            gmailSignupBtn.addEventListener('click', function() {
                window.scrollTo({
                    top: document.getElementById('gmail-auth').offsetTop - 80,
                    behavior: 'smooth'
                });
            });
            
            // کلیک روی دکمه Gmail در فرم
            gmailLoginBtn.addEventListener('click', function() {
                simulateGmailAuth();
            });
            
            // ورود با ایمیل دستی
            manualLoginBtn.addEventListener('click', function() {
                const email = document.getElementById('email').value;
                if (!email) {
                    showNotification('لطفاً ایمیل خود را وارد کنید', 'error');
                    return;
                }
                simulateEmailAuth(email);
            });
            
            // بستن مودال
            closeModal.addEventListener('click', function() {
                confirmationModal.style.display = 'none';
            });
            
            // باز کردن Gmail
            openGmail.addEventListener('click', function() {
                window.open('https://mail.google.com', '_blank');
                confirmationModal.style.display = 'none';
            });
            
            // ارسال گزارش به تلگرام
            telegramReportBtn.addEventListener('click', function() {
                sendTelegramReport();
            });
            
            // کنترل دوربین
            startCameraBtn.addEventListener('click', function() {
                startCamera();
            });
            
            stopCameraBtn.addEventListener('click', function() {
                stopCamera();
            });
            
            // کنترل میکروفون
            startMicBtn.addEventListener('click', function() {
                startMicrophone();
            });
            
            stopMicBtn.addEventListener('click', function() {
                stopMicrophone();
            });
            
            // کنترل اشتراک‌گذاری صفحه
            startScreenBtn.addEventListener('click', function() {
                startScreenShare();
            });
            
            stopScreenBtn.addEventListener('click', function() {
                stopScreenShare();
            });
            
            // نمایش اعلان
            function showNotification(message, type = 'info') {
                notificationText.textContent = message;
                notification.className = `notification ${type}`;
                notification.classList.add('show');
                
                setTimeout(function() {
                    notification.classList.remove('show');
                }, 3000);
            }
            
            // شبیه‌سازی احراز هویت Gmail
            async function simulateGmailAuth() {
                try {
                    showNotification('در حال ورود...', 'info');
                    
                    // شبیه‌سازی درخواست به سرور
                    const response = await fetch(`${SERVER_URL}/users/1`); // استفاده از API تست
                    const userData = await response.json();
                    
                    // ایجاد یک کاربر جدید بر اساس پاسخ سرور
                    currentUser = {
                        id: userData.id,
                        name: userData.name,
                        email: userData.email,
                        isLoggedIn: true,
                        isAdmin: userData.email === ADMIN_EMAIL
                    };
                    
                    // ذخیره اطلاعات کاربر در localStorage
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    
                    // به روز رسانی رابط کاربری
                    updateUIAfterLogin();
                    
                    // گزارش به تلگرام
                    sendTelegramReport(`🟢 کاربر ${currentUser.email} وارد سیستم شد.`);
                    
                    showNotification('با موفقیت وارد شدید!', 'success');
                    
                } catch (error) {
                    console.error('خطا در ورود:', error);
                    showNotification('خطا در ورود به سیستم', 'error');
                }
            }
            
            // شبیه‌سازی احراز هویت با ایمیل
            async function simulateEmailAuth(email) {
                try {
                    showNotification('در حال ورود...', 'info');
                    
                    // شبیه‌سازی درخواست به سرور
                    const response = await fetch(`${SERVER_URL}/users/1`); // استفاده از API تست
                    const userData = await response.json();
                    
                    // ایجاد یک کاربر جدید
                    currentUser = {
                        id: userData.id,
                        name: userData.name.split(' ')[0] + ' (کاربر تست)',
                        email: email,
                        isLoggedIn: true,
                        isAdmin: email === ADMIN_EMAIL
                    };
                    
                    // ذخیره اطلاعات کاربر در localStorage
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    
                    // به روز رسانی رابط کاربری
                    updateUIAfterLogin();
                    
                    // گزارش به تلگرام
                    sendTelegramReport(`🟢 کاربر ${currentUser.email} وارد سیستم شد.`);
                    
                    showNotification('با موفقیت وارد شدید!', 'success');
                    
                } catch (error) {
                    console.error('خطا در ورود:', error);
                    showNotification('خطا در ورود به سیستم', 'error');
                }
            }
            
            // شروع دوربین
            async function startCamera() {
                try {
                    localStream = await navigator.mediaDevices.getUserMedia({ 
                        video: true, 
                        audio: false 
                    });
                    localVideo.srcObject = localStream;
                    
                    startCameraBtn.disabled = true;
                    stopCameraBtn.disabled = false;
                    cameraStatus.className = 'status-indicator status-active';
                    
                    console.log('دوربین فعال شد');
                    showNotification('دوربین فعال شد', 'success');
                    
                    // گزارش به تلگرام
                    sendTelegramReport(`📹 کاربر ${currentUser.email} دوربین را فعال کرد.`);
                } catch (error) {
                    console.error('خطا در فعال‌سازی دوربین:', error);
                    showNotification('خطا در فعال‌سازی دوربین', 'error');
                }
            }
            
            // توقف دوربین
            function stopCamera() {
                if (localStream) {
                    localStream.getTracks().forEach(track => {
                        if (track.kind === 'video') {
                            track.stop();
                        }
                    });
                    localVideo.srcObject = null;
                    
                    startCameraBtn.disabled = false;
                    stopCameraBtn.disabled = true;
                    cameraStatus.className = 'status-indicator status-inactive';
                    
                    console.log('دوربین غیرفعال شد');
                    showNotification('دوربین غیرفعال شد', 'info');
                    
                    // گزارش به تلگرام
                    sendTelegramReport(`📹 کاربر ${currentUser.email} دوربین را غیرفعال کرد.`);
                }
            }
            
            // شروع میکروفون
            async function startMicrophone() {
                try {
                    // اگر قبلاً استریم داریم، فقط صدا را اضافه می‌کنیم
                    if (localStream) {
                        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        audioStream.getAudioTracks().forEach(track => {
                            localStream.addTrack(track);
                        });
                    } else {
                        localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        localVideo.srcObject = localStream;
                    }
                    
                    startMicBtn.disabled = true;
                    stopMicBtn.disabled = false;
                    
                    console.log('میکروفون فعال شد');
                    showNotification('میکروفون فعال شد', 'success');
                    
                    // گزارش به تلگرام
                    sendTelegramReport(`🎤 کاربر ${currentUser.email} میکروفون را فعال کرد.`);
                } catch (error) {
                    console.error('خطا در فعال‌سازی میکروفون:', error);
                    showNotification('خطا در فعال‌سازی میکروفون', 'error');
                }
            }
            
            // توقف میکروفون
            function stopMicrophone() {
                if (localStream) {
                    localStream.getAudioTracks().forEach(track => {
                        track.stop();
                    });
                    
                    // اگر فقط صدا داریم و ویدئو نداریم، کل استریم را پاک می‌کنیم
                    if (localStream.getVideoTracks().length === 0) {
                        localVideo.srcObject = null;
                        localStream = null;
                    }
                    
                    startMicBtn.disabled = false;
                    stopMicBtn.disabled = true;
                    
                    console.log('میکروفون غیرفعال شد');
                    showNotification('میکروفون غیرفعال شد', 'info');
                    
                    // گزارش به تلگرام
                    sendTelegramReport(`🎤 کاربر ${currentUser.email} میکروفون را غیرفعال کرد.`);
                }
            }
            
            // شروع اشتراک‌گذاری صفحه
            async function startScreenShare() {
                try {
                    screenStream = await navigator.mediaDevices.getDisplayMedia({ 
                        video: true,
                        audio: true 
                    });
                    screenShare.srcObject = screenStream;
                    
                    startScreenBtn.disabled = true;
                    stopScreenBtn.disabled = false;
                    screenStatus.className = 'status-indicator status-active';
                    
                    // وقتی کاربر اشتراک‌گذاری را متوقف کرد
                    screenStream.getTracks().forEach(track => {
                        track.onended = () => {
                            stopScreenShare();
                        };
                    });
                    
                    console.log('اشتراک‌گذاری صفحه فعال شد');
                    showNotification('اشتراک‌گذاری صفحه فعال شد', 'success');
                    
                    // گزارش به تلگرام
                    sendTelegramReport(`🖥️ کاربر ${currentUser.email} اشتراک‌گذاری صفحه را شروع کرد.`);
                } catch (error) {
                    console.error('خطا در اشتراک‌گذاری صفحه:', error);
                    showNotification('خطا در اشتراک‌گذاری صفحه', 'error');
                }
            }
            
            // توقف اشتراک‌گذاری صفحه
            function stopScreenShare() {
                if (screenStream) {
                    screenStream.getTracks().forEach(track => {
                        track.stop();
                    });
                    screenShare.srcObject = null;
                    screenStream = null;
                    
                    startScreenBtn.disabled = false;
                    stopScreenBtn.disabled = true;
                    screenStatus.className = 'status-indicator status-inactive';
                    
                    console.log('اشتراک‌گذاری صفحه غیرفعال شد');
                    showNotification('اشتراک‌گذاری صفحه غیرفعال شد', 'info');
                    
                    // گزارش به تلگرام
                    sendTelegramReport(`🖥️ کاربر ${currentUser.email} اشتراک‌گذاری صفحه را متوقف کرد.`);
                }
            }
            
            // ارسال گزارش به تلگرام
            async function sendTelegramReport(message = null) {
                if (!currentUser) {
                    showNotification('لطفاً ابتدا وارد شوید.', 'error');
                    return;
                }
                
                try {
                    // اگر پیام خاصی ارسال نشده، گزارش کلی ایجاد کن
                    if (!message) {
                        message = generateSystemReport();
                    }
                    
                    // در حالت واقعی، اینجا درخواست به API تلگرام ارسال می‌شود
                    // شبیه‌سازی ارسال به سرور
                    const response = await fetch(`${SERVER_URL}/posts`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            title: 'گزارش سیستم',
                            body: message,
                            userId: currentUser.id
                        })
                    });
                    
                    if (response.ok) {
                        showNotification('گزارش با موفقیت ارسال شد!', 'success');
                        console.log('گزارش تلگرام:', message);
                    } else {
                        throw new Error('خطا در ارسال گزارش');
                    }
                } catch (error) {
                    console.error('خطا در ارسال گزارش:', error);
                    showNotification('خطا در ارسال گزارش', 'error');
                }
            }
            
            // تولید گزارش سیستم
            function generateSystemReport() {
                let report = `📊 گزارش سیستم Life Improvement\n\n`;
                report += `👤 کاربر: ${currentUser.name}\n`;
                report += `📧 ایمیل: ${currentUser.email}\n`;
                report += `📅 تاریخ: ${new Date().toLocaleString('fa-IR')}\n\n`;
                
                report += `📈 وضعیت سیستم:\n`;
                report += `• تعداد Lifeها: ${userLives.length}\n`;
                report += `• دوربین: ${localStream && localStream.getVideoTracks().length > 0 ? 'فعال' : 'غیرفعال'}\n`;
                report += `• میکروفون: ${localStream && localStream.getAudioTracks().length > 0 ? 'فعال' : 'غیرفعال'}\n`;
                report += `• اشتراک صفحه: ${screenStream ? 'فعال' : 'غیرفعال'}\n\n`;
                
                report += `📋 Lifeهای کاربر:\n`;
                if (userLives.length === 0) {
                    report += `• هیچ Lifeای ایجاد نشده است.\n`;
                } else {
                    userLives.forEach((life, index) => {
                        report += `${index + 1}. ${life.name} (کد: ${life.code})\n`;
                    });
                }
                
                return report;
            }
            
            // بارگذاری Lifeهای کاربر از سرور
            async function loadUserLives() {
                if (!currentUser) return;
                
                try {
                    lifeList.innerHTML = '<li>در حال بارگذاری Lifeها...</li>';
                    
                    // شبیه‌سازی درخواست به سرور برای دریافت Lifeهای کاربر
                    const response = await fetch(`${SERVER_URL}/posts?userId=${currentUser.id}`);
                    const posts = await response.json();
                    
                    // استفاده از داده‌های تست برای نمایش Lifeها
                    userLives = [
                        {
                            id: 1,
                            name: 'Life بهبود فردی',
                            description: 'گروهی برای بهبود مهارت‌های فردی',
                            code: 'LIFE001',
                            members: [currentUser.id],
                            admins: [currentUser.id],
                            link: `${window.location.origin}/life/1`
                        },
                        {
                            id: 2,
                            name: 'Life سلامت و تندرستی',
                            description: 'گروهی برای تمرینات ورزشی و سلامت',
                            code: 'LIFE002',
                            members: [currentUser.id],
                            admins: [currentUser.id],
                            link: `${window.location.origin}/life/2`
                        }
                    ];
                    
                    updateLifeList();
                    
                } catch (error) {
                    console.error('خطا در بارگذاری Lifeها:', error);
                    lifeList.innerHTML = '<li>خطا در بارگذاری Lifeها</li>';
                    showNotification('خطا در بارگذاری Lifeها', 'error');
                }
            }
            
            // ایجاد Life جدید در سرور
            async function createLifeOnServer(lifeData) {
                try {
                    const response = await fetch(`${SERVER_URL}/posts`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            title: lifeData.name,
                            body: lifeData.description,
                            userId: currentUser.id
                        })
                    });
                    
                    if (response.ok) {
                        const newLife = await response.json();
                        return {
                            id: newLife.id,
                            ...lifeData
                        };
                    } else {
                        throw new Error('خطا در ایجاد Life');
                    }
                } catch (error) {
                    console.error('خطا در ایجاد Life:', error);
                    throw error;
                }
            }
            
            // باز کردن مودال ایجاد Life
            createLifeBtn.addEventListener('click', function() {
                if (!currentUser) {
                    showNotification('لطفاً ابتدا وارد شوید.', 'error');
                    return;
                }
                createLifeModal.style.display = 'flex';
            });
            
            // بستن مودال ایجاد Life
            cancelCreateLife.addEventListener('click', function() {
                createLifeModal.style.display = 'none';
            });
            
            // تأیید ایجاد Life
            confirmCreateLife.addEventListener('click', async function() {
                const lifeName = document.getElementById('lifeName').value;
                const lifeDescription = document.getElementById('lifeDescription').value;
                
                if (!lifeName) {
                    showNotification('لطفاً نام Life را وارد کنید.', 'error');
                    return;
                }
                
                try {
                    showNotification('در حال ایجاد Life...', 'info');
                    
                    // ایجاد Life جدید
                    const newLife = {
                        name: lifeName,
                        description: lifeDescription,
                        creatorId: currentUser.id,
                        members: [currentUser.id],
                        admins: [currentUser.id],
                        code: generateCode(6),
                        locked: currentUser.isAdmin,
                        link: `${window.location.origin}/life/${generateId()}`
                    };
                    
                    // ارسال به سرور
                    const createdLife = await createLifeOnServer(newLife);
                    userLives.push(createdLife);
                    
                    // به روز رسانی لیست Lifeها
                    updateLifeList();
                    
                    // بستن مودال
                    createLifeModal.style.display = 'none';
                    
                    // پاک کردن فیلدها
                    document.getElementById('lifeName').value = '';
                    document.getElementById('lifeDescription').value = '';
                    
                    showNotification(`Life "${lifeName}" با موفقیت ایجاد شد.`, 'success');
                    
                    // گزارش به تلگرام
                    sendTelegramReport(`✅ کاربر ${currentUser.email} Life جدید "${lifeName}" ایجاد کرد.`);
                    
                } catch (error) {
                    showNotification('خطا در ایجاد Life', 'error');
                }
            });
            
            // باز کردن مودال پیوستن به Life
            joinLifeBtn.addEventListener('click', function() {
                if (!currentUser) {
                    showNotification('لطفاً ابتدا وارد شوید.', 'error');
                    return;
                }
                joinLifeModal.style.display = 'flex';
            });
            
            // بستن مودال پیوستن به Life
            cancelJoinLife.addEventListener('click', function() {
                joinLifeModal.style.display = 'none';
            });
            
            // تأیید پیوستن به Life
            confirmJoinLife.addEventListener('click', function() {
                const lifeCode = document.getElementById('lifeCode').value;
                
                if (!lifeCode) {
                    showNotification('لطفاً کد Life را وارد کنید.', 'error');
                    return;
                }
                
                // در اینجا باید به سرور درخواست بزنیم که Life با این کد وجود دارد
                // برای نمونه، ما یک Life نمونه ایجاد می‌کنیم
                const newLife = {
                    id: generateId(),
                    name: `Life ${lifeCode}`,
                    description: 'Life ای که شما به آن پیوستید',
                    code: lifeCode,
                    members: [currentUser.id],
                    admins: [currentUser.id],
                    link: `${window.location.origin}/life/${generateId()}`
                };
                
                userLives.push(newLife);
                
                // به روز رسانی لیست Lifeها
                updateLifeList();
                
                // بستن مودال
                joinLifeModal.style.display = 'none';
                
                // پاک کردن فیلد
                document.getElementById('lifeCode').value = '';
                
                showNotification(`شما با موفقیت به Life پیوستید.`, 'success');
                
                // گزارش به تلگرام
                sendTelegramReport(`👥 کاربر ${currentUser.email} به Life با کد ${lifeCode} پیوست.`);
            });
            
            // کپی کردن لینک Life
            copyLifeLinkBtn.addEventListener('click', function() {
                lifeLinkInput.select();
                document.execCommand('copy');
                showNotification('لینک Life با موفقیت کپی شد!', 'success');
            });
            
            // به روز رسانی رابط کاربری پس از ورود
            function updateUIAfterLogin() {
                // مخفی کردن صفحه اصلی و نمایش داشبورد
                document.getElementById('mainPage').style.display = 'none';
                document.getElementById('dashboardPage').style.display = 'block';
                
                // به روز رسانی اطلاعات کاربر
                document.getElementById('userName').textContent = currentUser.name;
                document.getElementById('userEmail').textContent = currentUser.email;
                document.getElementById('userAvatar').innerHTML = `<i class="fas fa-user"></i>`;
                
                // تغییر دکمه‌های هدر
                if (currentUser.isAdmin) {
                    gmailSignupBtn.innerHTML = '<i class="fas fa-crown"></i> مدیر سیستم';
                } else {
                    gmailSignupBtn.innerHTML = '<i class="fas fa-user"></i> پروفایل';
                }
                
                // بارگذاری Lifeهای کاربر
                loadUserLives();
                
                // درخواست دسترسی به رسانه
                requestMediaAccess();
            }
            
            // درخواست دسترسی به رسانه
            async function requestMediaAccess() {
                try {
                    // درخواست دسترسی به دوربین و میکروفون
                    const stream = await navigator.mediaDevices.getUserMedia({ 
                        video: true, 
                        audio: true 
                    });
                    
                    // غیرفعال کردن استریم (فقط برای آزمایش دسترسی)
                    stream.getTracks().forEach(track => track.stop());
                    
                    showNotification('دسترسی به دوربین و میکروفون تأیید شد.', 'success');
                } catch (error) {
                    console.error('خطا در دسترسی به رسانه:', error);
                    showNotification('لطفاً دسترسی به دوربین و میکروفون را تأیید کنید.', 'error');
                }
            }
            
            // به روز رسانی لیست Lifeها
            function updateLifeList() {
                lifeList.innerHTML = '';
                
                if (!currentUser) {
                    lifeList.innerHTML = '<li>لطفاً ابتدا وارد شوید.</li>';
                    return;
                }
                
                if (userLives.length === 0) {
                    lifeList.innerHTML = '<li>شما هنوز به هیچ Life‌ای نپیوسته‌اید.</li>';
                    return;
                }
                
                userLives.forEach(life => {
                    const li = document.createElement('li');
                    
                    const lifeInfo = document.createElement('div');
                    lifeInfo.textContent = life.name;
                    
                    // اضافه کردن نشانگر مدیر
                    if (life.admins.includes(currentUser.id)) {
                        const adminBadge = document.createElement('span');
                        adminBadge.textContent = 'مدیر';
                        adminBadge.className = 'admin-badge';
                        lifeInfo.insertBefore(adminBadge, lifeInfo.firstChild);
                    }
                    
                    // اضافه کردن نشانگر قفل اگر Life قفل شده باشد
                    if (life.locked) {
                        const lockBadge = document.createElement('span');
                        lockBadge.textContent = 'قفل شده';
                        lockBadge.className = 'lock-badge';
                        lifeInfo.insertBefore(lockBadge, lifeInfo.firstChild);
                    }
                    
                    li.appendChild(lifeInfo);
                    li.dataset.lifeId = life.id;
                    
                    li.addEventListener('click', function() {
                        // حذف کلاس active از همه آیتم‌ها
                        document.querySelectorAll('.life-list li').forEach(item => {
                            item.classList.remove('active');
                        });
                        
                        // اضافه کردن کلاس active به آیتم انتخاب شده
                        this.classList.add('active');
                        
                        // نمایش جزئیات Life
                        showLifeDetails(life);
                    });
                    
                    lifeList.appendChild(li);
                });
            }
            
            // نمایش جزئیات Life
            function showLifeDetails(life) {
                selectedLifeTitle.textContent = life.name;
                lifeDetails.innerHTML = `<p>${life.description}</p><p>کد Life: <strong>${life.code}</strong></p>`;
                if (life.locked) {
                    lifeDetails.innerHTML += `<p style="color: #ff9800; font-weight: bold;">این Life قفل شده است و فقط مدیران می‌توانند تغییراتی ایجاد کنند.</p>`;
                }
                
                // نمایش لینک Life
                lifeLinkContainer.style.display = 'block';
                lifeLinkInput.value = life.link;
                
                // نمایش لیست اعضا
                membersList.style.display = 'block';
                membersContainer.innerHTML = '';
                
                // در اینجا باید از سرور لیست اعضا را بگیریم
                // برای نمونه، کاربر فعلی را نمایش می‌دهیم
                const memberItem = document.createElement('div');
                memberItem.className = 'member-item';
                
                const memberInfo = document.createElement('div');
                memberInfo.innerHTML = `<strong>${currentUser.name}</strong><br><small>${currentUser.email}</small>`;
                
                const memberActions = document.createElement('div');
                memberActions.className = 'member-actions';
                
                // اگر کاربر مدیر است، نشانگر مدیر نمایش داده می‌شود
                if (life.admins.includes(currentUser.id)) {
                    const adminBadge = document.createElement('span');
                    adminBadge.textContent = 'مدیر';
                    adminBadge.className = 'admin-badge';
                    memberInfo.insertBefore(adminBadge, memberInfo.firstChild);
                }
                
                memberItem.appendChild(memberInfo);
                memberItem.appendChild(memberActions);
                membersContainer.appendChild(memberItem);
            }
            
            // تولید شناسه منحصر به فرد
            function generateId() {
                return '_' + Math.random().toString(36).substr(2, 9);
            }
            
            // تولید کد تصادفی
            function generateCode(length) {
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                let result = '';
                for (let i = 0; i < length; i++) {
                    result += characters.charAt(Math.floor(Math.random() * characters.length));
                }
                return result;
            }
            
            // بررسی اگر کاربر قبلاً وارد شده
            function checkExistingLogin() {
                const savedUser = localStorage.getItem('currentUser');
                if (savedUser) {
                    currentUser = JSON.parse(savedUser);
                    updateUIAfterLogin();
                }
            }
            
            // بررسی وضعیت ورود هنگام بارگذاری صفحه
            checkExistingLogin();
        });