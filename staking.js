document.addEventListener('DOMContentLoaded', () => {
    const stakeBtn = document.getElementById('stake-btn');
    const unstakeBtn = document.getElementById('unstake-btn');
    const stakeInput = document.getElementById('stake-amount');
    const unstakeInput = document.getElementById('unstake-amount');
    const balanceDisplay = document.getElementById('staked-balance'); // حالا این کار می‌کند
    const toastContainer = document.getElementById('toast-container');

    // لود کردن موجودی قبلی
    let currentBalance = parseFloat(localStorage.getItem('ezd_staked_val')) || 0;
    if(balanceDisplay) balanceDisplay.textContent = currentBalance.toLocaleString();

    // --- تابع نمایش پیام (Toast) ---
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerText = message;
        
        // اضافه کردن به صفحه
        toastContainer.appendChild(toast);

        // حذف اتوماتیک بعد از ۳ ثانیه (مطابق با زمان انیمیشن CSS)
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // تابع آپدیت موجودی
    const updateUI = (newVal) => {
        currentBalance = newVal;
        if(balanceDisplay) balanceDisplay.textContent = currentBalance.toLocaleString();
        localStorage.setItem('ezd_staked_val', currentBalance);
    };

    // --- دکمه Stake ---
    if(stakeBtn) {
        stakeBtn.addEventListener('click', () => {
            const val = parseFloat(stakeInput.value);
            
            if (!val || val <= 0) {
                showToast("لطفاً یک مقدار معتبر وارد کنید", "error");
                return;
            }

            updateUI(currentBalance + val);
            stakeInput.value = ''; 
            showToast(`${val} EZD با موفقیت استیک شد`, "success");
        });
    }

    // --- دکمه Unstake ---
    if(unstakeBtn) {
        unstakeBtn.addEventListener('click', () => {
            const val = parseFloat(unstakeInput.value);
            
            if (!val || val <= 0) {
                showToast("لطفاً یک مقدار معتبر وارد کنید", "error");
                return;
            }
            
            if (val > currentBalance) {
                showToast("موجودی استیک شده کافی نیست!", "error");
                return;
            }
            
            updateUI(currentBalance - val);
            unstakeInput.value = ''; 
            showToast(`${val} EZD برداشت شد`, "success");
        });
    }
});