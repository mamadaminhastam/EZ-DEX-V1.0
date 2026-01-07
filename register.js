document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    const successMessageDiv = document.getElementById('success-message'); // دریافت المنت پیام موفقیت
    
    const firstNameInput = document.getElementById('reg-firstname');
    const lastNameInput = document.getElementById('reg-lastname');
    const usernameInput = document.getElementById('reg-username');
    const phoneInput = document.getElementById('reg-phone');
    const emailInput = document.getElementById('reg-email');
    const passwordInput = document.getElementById('reg-password');
    const confirmPasswordInput = document.getElementById('reg-confirm-password');

    // تابع نمایش خطا
    const setError = (element, message) => {
        const inputControl = element.parentElement;
        const errorDisplay = inputControl.querySelector('.error-message');
        errorDisplay.innerText = message;
        inputControl.classList.add('error');
        inputControl.classList.remove('success');
    };

    // تابع موفقیت (حذف خطا)
    const setSuccess = (element) => {
        const inputControl = element.parentElement;
        const errorDisplay = inputControl.querySelector('.error-message');
        errorDisplay.innerText = '';
        inputControl.classList.remove('error');
        inputControl.classList.add('success');
    };

    // --- توابع اعتبارسنجی (Regex) ---
    const isValidEmail = (email) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    const isValidIranianMobile = (mobile) => {
        const re = /^09[0-9]{9}$/;
        return re.test(mobile);
    };

    const isValidUsername = (username) => {
        const re = /^[a-zA-Z0-9_]{3,}$/; // فقط حروف، عدد و آندرلاین
        return re.test(username);
    };

    // --- تابع بررسی نهایی ---
    const validateInputs = () => {
        let isValid = true;

        const firstNameValue = firstNameInput.value.trim();
        const lastNameValue = lastNameInput.value.trim();
        const usernameValue = usernameInput.value.trim();
        const phoneValue = phoneInput.value.trim();
        const emailValue = emailInput.value.trim();
        const passwordValue = passwordInput.value.trim();
        const confirmPasswordValue = confirmPasswordInput.value.trim();

        // بررسی نام
        if(firstNameValue === '') {
            setError(firstNameInput, 'وارد کردن نام الزامی است');
            isValid = false;
        } else if (firstNameValue.length < 3) {
            setError(firstNameInput, 'نام باید حداقل ۳ کاراکتر باشد');
            isValid = false;
        } else {
            setSuccess(firstNameInput);
        }

        // بررسی نام خانوادگی
        if(lastNameValue === '') {
            setError(lastNameInput, 'وارد کردن نام خانوادگی الزامی است');
            isValid = false;
        } else if (lastNameValue.length < 3) {
            setError(lastNameInput, 'نام خانوادگی باید حداقل ۳ کاراکتر باشد');
            isValid = false;
        } else {
            setSuccess(lastNameInput);
        }

        // بررسی نام کاربری
        if(usernameValue === '') {
            setError(usernameInput, 'نام کاربری الزامی است');
            isValid = false;
        } else if (!isValidUsername(usernameValue)) {
            setError(usernameInput, 'حداقل ۳ کاراکتر (فقط انگلیسی و عدد)');
            isValid = false;
        } else {
            setSuccess(usernameInput);
        }

        // بررسی موبایل
        if(phoneValue === '') {
            setError(phoneInput, 'شماره موبایل الزامی است');
            isValid = false;
        } else if (!isValidIranianMobile(phoneValue)) {
            setError(phoneInput, 'فرمت شماره صحیح نیست (مثال: 09123456789)');
            isValid = false;
        } else {
            setSuccess(phoneInput);
        }

        // بررسی ایمیل
        if(emailValue === '') {
            setError(emailInput, 'ایمیل الزامی است');
            isValid = false;
        } else if (!isValidEmail(emailValue)) {
            setError(emailInput, 'ایمیل معتبر نیست');
            isValid = false;
        } else {
            setSuccess(emailInput);
        }

        // بررسی پسورد
        if(passwordValue === '') {
            setError(passwordInput, 'رمز عبور الزامی است');
            isValid = false;
        } else if (passwordValue.length < 8) {
            setError(passwordInput, 'رمز عبور باید حداقل ۸ کاراکتر باشد');
            isValid = false;
        } else {
            setSuccess(passwordInput);
        }

        // بررسی تکرار پسورد
        if(confirmPasswordValue === '') {
            setError(confirmPasswordInput, 'تکرار رمز عبور الزامی است');
            isValid = false;
        } else if (confirmPasswordValue !== passwordValue) {
            setError(confirmPasswordInput, 'رمز عبور مطابقت ندارد');
            isValid = false;
        } else {
            setSuccess(confirmPasswordInput);
        }

        return isValid;
    };

    // رویداد سابمیت فرم
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // اگر اعتبارسنجی صحیح بود
        if(validateInputs()) {
            // 1. نمایش پیام موفقیت
            successMessageDiv.innerText = 'حساب کاربری با موفقیت ساخته شد. در حال انتقال...';
            successMessageDiv.classList.add('visible'); // نمایش با افکت
            
            // 2. غیرفعال کردن دکمه سابمیت (برای جلوگیری از کلیک مجدد)
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerText = 'لطفا صبر کنید...';

            // 3. اسکرول به بالای فرم تا پیام دیده شود (اگر فرم طولانی باشد)
            successMessageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // 4. انتقال به صفحه swap.html بعد از 2 ثانیه (2000 میلی‌ثانیه)
            setTimeout(() => {
                window.location.href = 'swap.html';
            }, 2000);
        }
    });

    // UX: پاک کردن خطا هنگام تایپ
    const inputs = [firstNameInput, lastNameInput, usernameInput, phoneInput, emailInput, passwordInput, confirmPasswordInput];
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            if(input.parentElement.classList.contains('error')) {
                setSuccess(input);
            }
        });
    });
});