// main/theme.js

document.addEventListener('DOMContentLoaded', () => {
    const themeSwitch = document.getElementById('theme-switch');
    const body = document.body;

    // تابع برای تغییر عکس‌ها
    function updateImages(isLight) {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            let src = img.getAttribute('src');
            
            if (isLight) {
                // اگر لایت مود فعال شد و عکس قبلاً -white نداشت، آن را اضافه کن
                if (!src.includes('-white')) {
                    const dotIndex = src.lastIndexOf('.');
                    const newSrc = src.slice(0, dotIndex) + '-white' + src.slice(dotIndex);
                    img.src = newSrc;
                }
            } else {
                // اگر به دارک مود برگشتیم، -white را از نام فایل حذف کن
                if (src.includes('-white')) {
                    img.src = src.replace('-white', '');
                }
            }
        });
    }

    // ۱. بررسی حافظه مرورگر هنگام لود شدن صفحه
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'light') {
        body.classList.add('light-mode');
        if (themeSwitch) themeSwitch.checked = true;
        updateImages(true); // عکس‌ها را لایت کن
    }

    // ۲. گوش دادن به تغییرات سوییچ در صفحه تنظیمات
    if (themeSwitch) {
        themeSwitch.addEventListener('change', function() {
            if (this.checked) {
                body.classList.add('light-mode');
                localStorage.setItem('theme', 'light');
                updateImages(true);
            } else {
                body.classList.remove('light-mode');
                localStorage.setItem('theme', 'dark');
                updateImages(false);
            }
        });
    }
});