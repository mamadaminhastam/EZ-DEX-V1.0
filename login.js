/*
    Login client-side script
    - هدف: اعتبارسنجی فرم ورود در سمت کاربر، نمایش پیام‌های خطا/موفقیت و جلوگیری از ارسال فرم در صورت داده‌های نامعتبر.
    - چرایی: بهبود تجربه کاربری و جلوگیری از درخواست‌های غیرضروری به سرور قبل از اینکه داده‌ها حداقلی معتبر شوند.
*/
document.addEventListener('DOMContentLoaded', () => {
    /* بخش: دسترسی به عناصر صفحه و مقادیر اولیه
         چرا: باید المان‌های فرم را پیدا کنیم تا روی آنها رویدادها و اعتبارسنجی انجام شود. اگر کانتینر وجود نداشته باشد، اسکریپت کاری انجام نمی‌دهد. */
    const container = document.querySelector('.login-container');
    if (!container) return;

    const form = container.querySelector('form');
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');

    /* بخش: ایجاد یا گرفتن المان پیام موفقیت
       چرا: برای اطلاع‌رسانی به کاربر هنگام فرآیند ورود نیاز به یک محل مشخص برای نمایش پیام داریم. اگر المان وجود ندارد، آن را می‌سازیم و با استایل‌های ایمن درج می‌کنیم تا محتوای فرم جابه‌جا یا پوشانده نشود. */
    let successMessageDiv = document.getElementById('login-success-message');
    if (!successMessageDiv) {
        successMessageDiv = document.createElement('div');
        successMessageDiv.id = 'login-success-message';
        successMessageDiv.className = 'success-message';
        successMessageDiv.setAttribute('role', 'status');
        // Inline styles to avoid overlapping the inputs and ensure message pushes content down
        successMessageDiv.style.position = 'relative';
        successMessageDiv.style.zIndex = '2';
        successMessageDiv.style.padding = '10px 12px';
        successMessageDiv.style.marginBottom = '12px';
        successMessageDiv.style.borderRadius = '8px';
        successMessageDiv.style.background = 'var(--color-overlay)';
        successMessageDiv.style.color = 'var(--color-text)';
        form.parentElement.insertBefore(successMessageDiv, form);
    }

    /* بخش: توابع نمایش خطا و موفقیت برای هر فیلد
       چرا: جداسازی وظایف UI باعث می‌شود اعتبارسنجی تمیز و قابل‌استفاده مجدد باشد؛ این توابع پیام خطا را نمایش یا پاک می‌کنند و کلاس‌های وضعیت را تنظیم می‌کنند. */
    const setError = (element, message) => {
        const inputControl = element.parentElement;
        let errorDisplay = inputControl.querySelector('.error-message');
        if (!errorDisplay) {
            errorDisplay = document.createElement('div');
            errorDisplay.className = 'error-message';
            inputControl.appendChild(errorDisplay);
        }
        errorDisplay.innerText = message;
        inputControl.classList.add('error');
        inputControl.classList.remove('success');
    };

    const setSuccess = (element) => {
        const inputControl = element.parentElement;
        const errorDisplay = inputControl.querySelector('.error-message');
        if (errorDisplay) errorDisplay.innerText = '';
        inputControl.classList.remove('error');
        inputControl.classList.add('success');
    };

    /* بخش: توابع کمکی اعتبارسنجی (Regex)
       چرا: قوانین فرمت ایمیل و نام‌کاربری را متمرکز می‌کنیم تا در صورت نیاز به‌راحتی قابل‌تغییر باشند. */
    const isValidEmail = (email) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    const isValidUsername = (username) => {
        const re = /^[a-zA-Z0-9_]{3,}$/;
        return re.test(username);
    };

    /* بخش: تابع اصلی اعتبارسنجی فیلدها
       چرا: تمام قوانین فیلدها را اینجا بررسی می‌کنیم و با فراخوانی setError/setSuccess وضعیت و پیام مناسب نمایش داده می‌شود. در نهایت true/false برمی‌گرداند تا تصمیم ارسال فرم گرفته شود. */
    const validateInputs = () => {
        let ok = true;
        const loginValue = emailInput.value.trim();
        const passwordValue = passwordInput.value.trim();

        if (loginValue === '') {
            setError(emailInput, 'ایمیل یا نام کاربری الزامی است');
            ok = false;
        } else if (!isValidEmail(loginValue) && !isValidUsername(loginValue)) {
            setError(emailInput, 'ایمیل یا نام کاربری معتبر نیست');
            ok = false;
        } else {
            setSuccess(emailInput);
        }

        if (passwordValue === '') {
            setError(passwordInput, 'رمز عبور الزامی است');
            ok = false;
        } else if (passwordValue.length < 8) {
            setError(passwordInput, 'رمز عبور باید حداقل ۸ کاراکتر باشد');
            ok = false;
        } else {
            setSuccess(passwordInput);
        }

        return ok;
    };

    /* بخش: هندلر ارسال فرم
       چرا: از ارسال پیش‌فرض جلوگیری می‌کنیم، ابتدا اعتبارسنجی می‌کنیم، سپس برای UX پیام "در حال ورود" نمایش داده و دکمه ارسال قفل می‌شود. در سناریوی نمونه پس از تأخیر کوتاه کاربر به صفحه سواپ هدایت می‌شود. */
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateInputs()) {
            successMessageDiv.innerText = 'در حال ورود...';
            successMessageDiv.classList.add('visible');

            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = 'لطفا صبر کنید...';
            }

            setTimeout(() => {
                // On successful login, redirect to swap page (placeholder)
                window.location.href = 'swap.html';
            }, 1000);
        }
    });

    /* بخش: پاک‌سازی خطا هنگام تایپ (UX)
       چرا: وقتی کاربر شروع به اصلاح فیلد می‌کند، پیام خطا حذف شده و وضعیت ورودی به حالت آماده تغییر می‌کند تا تجربه تعاملی بهتری داشته باشد. */
    [emailInput, passwordInput].forEach(input => {
        input.addEventListener('input', () => {
            if (input.parentElement.classList.contains('error')) {
                setSuccess(input);
            }
        });
    });
});
