document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.login-container');
    if (!container) return;

    const form = container.querySelector('form');
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');

    // --- تابع نمایش Toast (جایگزین Alert و پیام پیش‌فرض) ---
    function showToast(message, type = 'success') {
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerText = message;
        
        toastContainer.appendChild(toast);
        setTimeout(() => { toast.remove(); }, 3000);
    }

    const setError = (element, message) => {
        const inputControl = element.parentElement;
        inputControl.classList.add('error');
        // نمایش پیام خطا با Toast به جای متن زیر اینپوت (اختیاری)
        showToast(message, 'error');
    };

    const setSuccess = (element) => {
        const inputControl = element.parentElement;
        inputControl.classList.remove('error');
    };

    // اعتبار سنجی ایمیل و یوزرنیم
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isValidUsername = (username) => /^[a-zA-Z0-9_]{3,}$/.test(username);

    const validateInputs = () => {
        let ok = true;
        const loginValue = emailInput.value.trim();
        const passwordValue = passwordInput.value.trim();

        // چک کردن خالی بودن فیلد ایمیل
        if (loginValue === '') {
            setError(emailInput, 'لطفاً ایمیل یا نام کاربری را وارد کنید');
            ok = false;
        } else if (!isValidEmail(loginValue) && !isValidUsername(loginValue)) {
            setError(emailInput, 'فرمت ایمیل یا نام کاربری صحیح نیست');
            ok = false;
        } else {
            setSuccess(emailInput);
        }

        // چک کردن خالی بودن فیلد رمز عبور
        if (passwordValue === '') {
            setError(passwordInput, 'لطفاً رمز عبور را وارد کنید');
            ok = false;
        } else if (passwordValue.length < 8) {
            setError(passwordInput, 'رمز عبور باید حداقل ۸ کاراکتر باشد');
            ok = false;
        } else {
            setSuccess(passwordInput);
        }

        return ok;
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (validateInputs()) {
            const submitBtn = form.querySelector('button[type="submit"]');
            showToast('در حال تایید اطلاعات...', 'success');

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = 'لطفا صبر کنید...';
            }

            setTimeout(() => {
                window.location.href = 'swap.html';
            }, 1500);
        }
    });

    // پاک کردن وضعیت خطا هنگام تایپ مجدد
    [emailInput, passwordInput].forEach(input => {
        input.addEventListener('input', () => {
            if (input.parentElement.classList.contains('error')) {
                setSuccess(input);
            }
        });
    });
});