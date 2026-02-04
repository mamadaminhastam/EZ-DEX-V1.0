document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Elements ---
    const swapBtn = document.getElementById('swapBtn');
    const badgeElement = document.getElementById('swapCountBadge');
    const tableBody = document.querySelector('#txTable tbody');
    const amountFromInput = document.getElementById('amountFrom');
    const tokenFromSelect = document.getElementById('tokenFrom');
    const tokenToSelect = document.getElementById('tokenTo');

    // Constants
    const STORAGE_KEY_TXS = 'swap_recent_transactions';
    
    // --- تنظیمات زمان حذف (به میلی‌ثانیه) ---
    const REMOVE_TIME = 10000; // ۱۰ ثانیه (بعدا می‌تونی زیادش کنی)

    // --- 2. Functions ---

    // تابع اصلی برای آپدیت کردن عدد Badge بر اساس لیست تراکنش‌ها
    function updateBadgeFromStorage() {
        const transactions = JSON.parse(localStorage.getItem(STORAGE_KEY_TXS)) || [];
        const count = transactions.length;
        if (badgeElement) {
            badgeElement.textContent = count;
            badgeElement.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    // ذخیره تراکنش
    function saveTransaction(tx) {
        let transactions = JSON.parse(localStorage.getItem(STORAGE_KEY_TXS)) || [];
        transactions.unshift(tx);
        localStorage.setItem(STORAGE_KEY_TXS, JSON.stringify(transactions));
        updateBadgeFromStorage(); // بلافاصله عدد Badge را زیاد کن
    }

    // لود تراکنش‌ها هنگام رفرش صفحه
    function loadTransactions() {
        const transactions = JSON.parse(localStorage.getItem(STORAGE_KEY_TXS)) || [];
        const now = Date.now();
        
        tableBody.innerHTML = ''; 

        transactions.forEach(tx => {
            const timePassed = now - tx.timestamp;
            if (timePassed < REMOVE_TIME) {
                renderRow(tx, REMOVE_TIME - timePassed);
            } else {
                // اگر زمانش گذشته بود از حافظه پاک کن
                removeTxFromStorage(tx.id);
            }
        });
        updateBadgeFromStorage();
    }

    // حذف تراکنش از LocalStorage
    function removeTxFromStorage(id) {
        let transactions = JSON.parse(localStorage.getItem(STORAGE_KEY_TXS)) || [];
        transactions = transactions.filter(t => t.id !== id);
        localStorage.setItem(STORAGE_KEY_TXS, JSON.stringify(transactions));
        updateBadgeFromStorage(); // عدد Badge را کم کن
    }

    // ایجاد ردیف و مدیریت حذف خودکار
    function renderRow(tx, delay) {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td><span>${tx.id}</span></td>
            <td>${tx.pair}</td>
            <td>${tx.amount}</td>
            <td>${tx.date}</td>
            <td><span class="status pending">Processing</span></td>
            <td><button class="btn-view">View</button></td>
        `;
        tableBody.prepend(newRow);

        // تایمر برای حذف ردیف و کم کردن از Badge
        setTimeout(() => {
            newRow.style.opacity = '0';
            newRow.style.transition = '0.5s';
            setTimeout(() => {
                newRow.remove();
                removeTxFromStorage(tx.id); // حذف از حافظه و آپدیت Badge
            }, 500);
        }, delay);
    }

    // --- 3. Execution ---

    loadTransactions();

    if (swapBtn) {
        swapBtn.addEventListener('click', () => {
            const amount = amountFromInput.value;
            if (amount === "" || amount <= 0) {
                alert("Please enter a valid amount");
                return;
            }

            const now = new Date();
            const datePart = now.toISOString().split('T')[0]; 
            const timePart = now.getHours().toString().padStart(2, '0') + ":" + 
                            now.getMinutes().toString().padStart(2, '0');

            const tx = {
                id: "#TX" + Math.floor(Math.random() * 9000 + 1000),
                pair: `${tokenFromSelect.value} / ${tokenToSelect.value}`,
                amount: `${amount} ${tokenFromSelect.value}`,
                date: `${datePart} ${timePart}`,
                timestamp: Date.now() 
            };

            saveTransaction(tx);
            renderRow(tx, REMOVE_TIME);

            amountFromInput.value = '';
        });
    }
});