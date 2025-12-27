document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Video Logic ---
    const video = document.getElementById('swapVideo');
    if (video) {
        video.addEventListener('click', () => {
            video.paused ? video.play() : video.pause();
        });
    }

    // --- 2. Elements ---
    const swapBtn = document.getElementById('swapBtn');
    const badgeElement = document.getElementById('swapCountBadge');
    const tableBody = document.querySelector('#txTable tbody');
    const amountFromInput = document.getElementById('amountFrom');
    const tokenFromSelect = document.getElementById('tokenFrom');
    const tokenToSelect = document.getElementById('tokenTo');

    // Constants for LocalStorage
    const STORAGE_KEY_COUNT = 'swap_daily_count';
    const STORAGE_KEY_DATE = 'swap_last_reset';
    const STORAGE_KEY_TXS = 'swap_recent_transactions';
    const RESET_INTERVAL = 24 * 60 * 60 * 1000; // 24 Hours
    const TX_EXPIRY = 5 * 60 * 1000; // 5 Minutes (زمان مد نظر شما)

    // --- 3. Functions ---

    // بارگذاری تعداد سواپ‌ها و ریست ۲۴ ساعته
    function loadSwapCount() {
        const lastReset = localStorage.getItem(STORAGE_KEY_DATE);
        let count = parseInt(localStorage.getItem(STORAGE_KEY_COUNT)) || 0;
        const now = Date.now();

        if (!lastReset || (now - lastReset > RESET_INTERVAL)) {
            count = 0;
            localStorage.setItem(STORAGE_KEY_COUNT, 0);
            localStorage.setItem(STORAGE_KEY_DATE, now);
            localStorage.removeItem(STORAGE_KEY_TXS); // ریست تراکنش‌ها در روز جدید
        }

        updateBadgeUI(count);
        return count;
    }

    function updateBadgeUI(count) {
        if (!badgeElement) return;
        badgeElement.textContent = count;
        badgeElement.style.display = count > 0 ? 'flex' : 'none';
    }

    // ذخیره و لود تراکنش‌ها از LocalStorage
    function saveTransaction(tx) {
        let transactions = JSON.parse(localStorage.getItem(STORAGE_KEY_TXS)) || [];
        transactions.unshift(tx); // اضافه کردن به اول آرایه
        localStorage.setItem(STORAGE_KEY_TXS, JSON.stringify(transactions));
    }

    function loadTransactions() {
        const transactions = JSON.parse(localStorage.getItem(STORAGE_KEY_TXS)) || [];
        const now = Date.now();
        
        // پاک کردن ردیف‌های قبلی (به جز استاتیک‌ها اگر مایل بودید)
        // tableBody.innerHTML = ''; 

        transactions.forEach(tx => {
            // چک کردن محدودیت ۵ دقیقه (کجای کد: TX_EXPIRY در بالا تعریف شده)
            if (now - tx.timestamp < TX_EXPIRY) {
                renderRow(tx);
            }
        });
    }

        function renderRow(tx) {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>
                    <span>${tx.id}</span> 
                    <span class="badge badge-sm"></span>
                </td>
                <td>${tx.pair}</td>
                <td>${tx.amount}</td>
                <td>${tx.date}</td>
                <td><span class="status pending">Processing</span></td>
                <td><button class="btn-view">View</button></td>
            `;
            tableBody.prepend(newRow); // اضافه کردن به ابتدای جدول
        }

    // --- 4. Execution ---

    let currentCount = loadSwapCount();
    loadTransactions();

    if (swapBtn) {
        swapBtn.addEventListener('click', () => {
            const amount = amountFromInput.value;
            if (amount === "" || amount <= 0) {
                alert("Please enter a valid amount");
                return;
            }

            // A) Update Counter
            currentCount++;
            localStorage.setItem(STORAGE_KEY_COUNT, currentCount);
            updateBadgeUI(currentCount);

            // B) Create Transaction Object
         
          
            const now = new Date();

            // ایجاد تاریخ میلادی به فرمت YYYY-MM-DD
            const datePart = now.toISOString().split('T')[0]; 

            // ایجاد ساعت به فرمت HH:MM
            const timePart = now.getHours().toString().padStart(2, '0') + ":" + 
                            now.getMinutes().toString().padStart(2, '0');

            const tx = {
                id: "#TX" + Math.floor(Math.random() * 9000 + 1000),
                pair: `${tokenFromSelect.value} / ${tokenToSelect.value}`,
                amount: `${amount} ${tokenFromSelect.value}`,
                date: `${datePart} ${timePart}`, // ترکیب تاریخ و ساعت
                timestamp: Date.now() 
            };

            // C) Save and Show
            saveTransaction(tx);
            renderRow(tx);

            amountFromInput.value = '';
        });
    }
});