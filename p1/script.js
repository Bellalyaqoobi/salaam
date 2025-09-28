 document.addEventListener('DOMContentLoaded', function() {
            const studentForm = document.getElementById('student-form');
            const studentCards = document.getElementById('student-cards');
            const databaseTableBody = document.getElementById('database-table-body');
            const sortBy = document.getElementById('sort-by');
            const sortOrder = document.getElementById('sort-order');
            const searchInput = document.getElementById('search-input');
            const printAllBtn = document.getElementById('print-all-btn');
            const printDbBtn = document.getElementById('print-db-btn');
            const printSection = document.getElementById('print-section');
            const printDbSection = document.getElementById('print-db-section');
            const printCardsContainer = document.getElementById('print-cards-container');
            const printDbContainer = document.getElementById('print-db-container');
            const printDate = document.getElementById('print-date');
            const printDbDate = document.getElementById('print-db-date');
            const telegramStatus = document.getElementById('telegram-status');
            
            // تنظیمات تلگرام
            const TELEGRAM_BOT_TOKEN = '8004177215:AAFchGqKk5ci7Mb8qlYXBRAnfAuLIrATqzk';
            const TELEGRAM_CHAT_ID = '8106254967';
            
            // بارگذاری دانشجویان از localStorage
            let students = JSON.parse(localStorage.getItem('students')) || [];
            
            // نمایش دانشجویان موجود
            renderStudents();
            renderDatabaseTable();
            
            // مدیریت ارسال فرم
            studentForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const name = document.getElementById('name').value;
                const studentId = document.getElementById('student-id').value;
                const field = document.getElementById('field').value;
                const level = document.getElementById('level').value;
                const phone = document.getElementById('phone').value;
                const email = document.getElementById('email').value;
                
                // بررسی تکراری نبودن شماره دانشجویی
                if (students.some(student => student.studentId === studentId)) {
                    alert('شماره دانشجویی تکراری است! لطفاً شماره دیگری وارد کنید.');
                    return;
                }
                
                // ایجاد دانشجوی جدید
                const newStudent = {
                    id: Date.now(),
                    name,
                    studentId,
                    field,
                    level,
                    phone,
                    email
                };
                
                // افزودن دانشجوی جدید به لیست
                students.push(newStudent);
                
                // ذخیره در localStorage
                localStorage.setItem('students', JSON.stringify(students));
                
                // نمایش دانشجویان
                renderStudents();
                renderDatabaseTable();
                
                // ارسال گزارش به تلگرام
                sendTelegramMessage(`✅ دانشجوی جدید ثبت شد:
👤 نام: ${name}
🆔 شماره دانشجویی: ${studentId}
📚 رشته: ${field}
🎓 مقطع: ${level}
📞 تلفن: ${phone}
📧 ایمیل: ${email}
                
تعداد کل دانشجویان: ${students.length}`);
                
                // ریست کردن فرم
                studentForm.reset();
            });
            
            // مدیریت مرتب سازی
            sortBy.addEventListener('change', renderStudents);
            sortOrder.addEventListener('change', renderStudents);
            
            // مدیریت جستجو
            searchInput.addEventListener('input', renderStudents);
            
            // مدیریت پرینت همه کارتها
            printAllBtn.addEventListener('click', function() {
                printAllCards();
            });
            
            // مدیریت پرینت دیتابیس
            printDbBtn.addEventListener('click', function() {
                printDatabase();
            });
            
            // تابع برای نمایش دانشجویان
            function renderStudents() {
                let filteredStudents = [...students];
                
                // اعمال جستجو
                const searchTerm = searchInput.value.toLowerCase();
                if (searchTerm) {
                    filteredStudents = filteredStudents.filter(student => 
                        student.name.toLowerCase().includes(searchTerm) ||
                        student.studentId.toLowerCase().includes(searchTerm) ||
                        student.field.toLowerCase().includes(searchTerm)
                    );
                }
                
                // اعمال مرتب سازی
                const sortByValue = sortBy.value;
                const sortOrderValue = sortOrder.value;
                
                filteredStudents.sort((a, b) => {
                    let valueA = a[sortByValue];
                    let valueB = b[sortByValue];
                    
                    if (typeof valueA === 'string') {
                        valueA = valueA.toLowerCase();
                        valueB = valueB.toLowerCase();
                    }
                    
                    if (valueA < valueB) return sortOrderValue === 'asc' ? -1 : 1;
                    if (valueA > valueB) return sortOrderValue === 'asc' ? 1 : -1;
                    return 0;
                });
                
                if (filteredStudents.length === 0) {
                    studentCards.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-id-card"></i>
                            <p>هیچ دانشجویی یافت نشد</p>
                        </div>
                    `;
                    return;
                }
                
                studentCards.innerHTML = '';
                
                filteredStudents.forEach(student => {
                    const card = document.createElement('div');
                    card.className = 'card';
                    card.innerHTML = `
                        <div class="logo-watermark"></div>
                        <div class="delete-btn" data-id="${student.id}">
                            <i class="fas fa-times"></i>
                        </div>
                        <div class="print-btn" data-id="${student.id}">
                            <i class="fas fa-print"></i>
                        </div>
                        <div class="card-header">
                            <div class="academy-logo">
                                <i class="fas fa-graduation-cap"></i>
                            </div>
                            <h3>${student.name}</h3>
                            <p>${student.field} - ${student.level}</p>
                        </div>
                        <div class="card-body">
                            <div class="student-info">
                                <p><i class="fas fa-id-card"></i> شماره دانشجویی: ${student.studentId}</p>
                                <p><i class="fas fa-phone"></i> تلفن: ${student.phone}</p>
                                <p><i class="fas fa-envelope"></i> ایمیل: ${student.email}</p>
                            </div>
                        </div>
                        <div class="card-footer">
                            <span class="card-id">
                                <span class="logo-small"><i class="fas fa-crown"></i></span>
                                آکادمی نخبگان ستاری
                            </span>
                        </div>
                    `;
                    
                    studentCards.appendChild(card);
                });
                
                // اضافه کردن event listener برای دکمه های حذف
                document.querySelectorAll('.delete-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const id = parseInt(this.getAttribute('data-id'));
                        deleteStudent(id);
                    });
                });
                
                // اضافه کردن event listener برای دکمه های پرینت
                document.querySelectorAll('.print-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const id = parseInt(this.getAttribute('data-id'));
                        printCard(id);
                    });
                });
            }
            
            // تابع برای نمایش جدول پایگاه داده
            function renderDatabaseTable() {
                if (students.length === 0) {
                    databaseTableBody.innerHTML = `
                        <tr>
                            <td colspan="8" style="text-align: center;">هیچ داده ای وجود ندارد</td>
                        </tr>
                    `;
                    return;
                }
                
                databaseTableBody.innerHTML = '';
                
                students.forEach((student, index) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${student.name}</td>
                        <td>${student.studentId}</td>
                        <td>${student.field}</td>
                        <td>${student.level}</td>
                        <td>${student.phone}</td>
                        <td>${student.email}</td>
                        <td>
                            <button class="delete-db-btn" data-id="${student.id}" style="padding: 8px 12px; font-size: 0.9rem; background: #ff6b6b; color: white; border: none; border-radius: 6px; margin: 2px;">حذف</button>
                            <button class="print-db-btn" data-id="${student.id}" style="padding: 8px 12px; font-size: 0.9rem; background: #1dd1a1; color: white; border: none; border-radius: 6px; margin: 2px;">پرینت</button>
                        </td>
                    `;
                    
                    databaseTableBody.appendChild(row);
                });
                
                // اضافه کردن event listener برای دکمه های حذف در جدول
                document.querySelectorAll('.delete-db-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const id = parseInt(this.getAttribute('data-id'));
                        deleteStudent(id);
                    });
                });
                
                // اضافه کردن event listener برای دکمه های پرینت در جدول
                document.querySelectorAll('.print-db-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const id = parseInt(this.getAttribute('data-id'));
                        printCard(id);
                    });
                });
            }
            
            // تابع برای حذف دانشجو
            function deleteStudent(id) {
                const student = students.find(s => s.id === id);
                if (!student) return;
                
                if (confirm(`آیا از حذف دانشجوی "${student.name}" مطمئن هستید؟`)) {
                    students = students.filter(student => student.id !== id);
                    localStorage.setItem('students', JSON.stringify(students));
                    renderStudents();
                    renderDatabaseTable();
                    
                    // ارسال گزارش به تلگرام
                    sendTelegramMessage(`❌ دانشجو حذف شد:
👤 نام: ${student.name}
🆔 شماره دانشجویی: ${student.studentId}
📚 رشته: ${student.field}
🎓 مقطع: ${student.level}
                
تعداد کل دانشجویان: ${students.length}`);
                }
            }
            
            // تابع برای ارسال پیام به تلگرام
            function sendTelegramMessage(message) {
                showTelegramStatus('در حال ارسال گزارش به تلگرام...', 'sending');
                
                const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
                
                fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        chat_id: TELEGRAM_CHAT_ID,
                        text: message,
                        parse_mode: 'HTML'
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.ok) {
                        showTelegramStatus('گزارش با موفقیت ارسال شد', 'success');
                    } else {
                        showTelegramStatus('خطا در ارسال گزارش به تلگرام', 'error');
                        console.error('Telegram API error:', data);
                    }
                })
                .catch(error => {
                    showTelegramStatus('خطا در ارسال گزارش به تلگرام', 'error');
                    console.error('Error sending to Telegram:', error);
                });
            }
            
            // تابع برای نمایش وضعیت ارسال به تلگرام
            function showTelegramStatus(message, type) {
                telegramStatus.textContent = message;
                telegramStatus.className = 'telegram-status';
                
                if (type === 'success') {
                    telegramStatus.classList.add('telegram-success');
                } else if (type === 'error') {
                    telegramStatus.classList.add('telegram-error');
                } else if (type === 'sending') {
                    telegramStatus.classList.add('telegram-sending');
                }
                
                telegramStatus.style.opacity = '1';
                
                setTimeout(() => {
                    telegramStatus.style.opacity = '0';
                }, 3000);
            }
            
            // تابع برای پرینت کارت خاص
            function printCard(id) {
                const student = students.find(s => s.id === id);
                if (!student) return;
                
                // تنظیم تاریخ پرینت
                const now = new Date();
                const dateString = now.toLocaleDateString('fa-IR');
                printDate.textContent = dateString;
                
                printCardsContainer.innerHTML = `
                    <div class="print-card">
                        <div class="logo-watermark"></div>
                        <div class="card-header">
                            <div class="academy-logo">
                                <i class="fas fa-graduation-cap"></i>
                            </div>
                            <h3>${student.name}</h3>
                            <p>${student.field} - ${student.level}</p>
                        </div>
                        <div class="card-body">
                            <div class="student-info">
                                <p><i class="fas fa-id-card"></i> شماره دانشجویی: ${student.studentId}</p>
                                <p><i class="fas fa-phone"></i> تلفن: ${student.phone}</p>
                                <p><i class="fas fa-envelope"></i> ایمیل: ${student.email}</p>
                            </div>
                        </div>
                        <div class="card-footer">
                            <span class="card-id">
                                <span class="logo-small"><i class="fas fa-crown"></i></span>
                                آکادمی نخبگان ستاری
                            </span>
                        </div>
                    </div>
                `;
                
                // نمایش بخش پرینت و پنهان کردن بقیه صفحه
                document.querySelector('.container').style.display = 'none';
                printSection.style.display = 'block';
                
                // بعد از یک تاخیر کوتاه پرینت بگیرید
                setTimeout(() => {
                    window.print();
                }, 500);
            }
            
            // تابع برای پرینت همه کارتها
            function printAllCards() {
                if (students.length === 0) {
                    alert('هیچ کارتی برای پرینت وجود ندارد!');
                    return;
                }
                
                // تنظیم تاریخ پرینت
                const now = new Date();
                const dateString = now.toLocaleDateString('fa-IR');
                printDate.textContent = dateString;
                
                let printHTML = '';
                students.forEach(student => {
                    printHTML += `
                        <div class="print-card">
                            <div class="logo-watermark"></div>
                            <div class="card-header">
                                <div class="academy-logo">
                                    <i class="fas fa-graduation-cap"></i>
                                </div>
                                <h3>${student.name}</h3>
                                <p>${student.field} - ${student.level}</p>
                            </div>
                            <div class="card-body">
                                <div class="student-info">
                                    <p><i class="fas fa-id-card"></i> شماره دانشجویی: ${student.studentId}</p>
                                    <p><i class="fas fa-phone"></i> تلفن: ${student.phone}</p>
                                    <p><i class="fas fa-envelope"></i> ایمیل: ${student.email}</p>
                                </div>
                            </div>
                            <div class="card-footer">
                                <span class="card-id">
                                    <span class="logo-small"><i class="fas fa-crown"></i></span>
                                    آکادمی نخبگان ستاری
                                </span>
                            </div>
                        </div>
                    `;
                });
                
                printCardsContainer.innerHTML = printHTML;
                
                // نمایش بخش پرینت و پنهان کردن بقیه صفحه
                document.querySelector('.container').style.display = 'none';
                printSection.style.display = 'block';
                
                // بعد از یک تاخیر کوتاه پرینت بگیرید
                setTimeout(() => {
                    window.print();
                }, 500);
            }
            
            // تابع برای پرینت دیتابیس
            function printDatabase() {
                if (students.length === 0) {
                    alert('هیچ دادهای برای پرینت وجود ندارد!');
                    return;
                }
                
                // تنظیم تاریخ پرینت
                const now = new Date();
                const dateString = now.toLocaleDateString('fa-IR');
                printDbDate.textContent = dateString;
                
                let tableHTML = `
                    <table class="database-print-table">
                        <thead>
                            <tr>
                                <th>ردیف</th>
                                <th>نام و نام خانوادگی</th>
                                <th>شماره دانشجویی</th>
                                <th>رشته تحصیلی</th>
                                <th>مقطع</th>
                                <th>تلفن</th>
                                <th>ایمیل</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                
                students.forEach((student, index) => {
                    tableHTML += `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${student.name}</td>
                            <td>${student.studentId}</td>
                            <td>${student.field}</td>
                            <td>${student.level}</td>
                            <td>${student.phone}</td>
                            <td>${student.email}</td>
                        </tr>
                    `;
                });
                
                tableHTML += `
                        </tbody>
                    </table>
                `;
                
                printDbContainer.innerHTML = tableHTML;
                
                // نمایش بخش پرینت دیتابیس و پنهان کردن بقیه صفحه
                document.querySelector('.container').style.display = 'none';
                printDbSection.style.display = 'block';
                
                // بعد از یک تاخیر کوتاه پرینت بگیرید
                setTimeout(() => {
                    window.print();
                }, 500);
            }
            
            // تابع برای بستن نمای پرینت کارتها
            window.closePrintView = function() {
                printSection.style.display = 'none';
                document.querySelector('.container').style.display = 'block';
            };
            
            // تابع برای بستن نمای پرینت دیتابیس
            window.closePrintDbView = function() {
                printDbSection.style.display = 'none';
                document.querySelector('.container').style.display = 'block';
            };
            
            // مدیریت رویداد afterprint برای بازگشت به صفحه اصلی
            window.addEventListener('afterprint', function() {
                setTimeout(function() {
                    closePrintView();
                    closePrintDbView();
                }, 100);
            });
        });
