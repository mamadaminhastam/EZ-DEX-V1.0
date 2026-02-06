document.addEventListener('DOMContentLoaded', () => {

    // گرفتن المان ها  از html
    const swapBtn = document.getElementById('swapBtn');
    const badgeElement = document.getElementById('swapCountBadge');
    const tableBody = document.querySelector('#txTable tbody');
    const amountFromInput = document.getElementById('amountFrom');
    const tokenFromSelect = document.getElementById('tokenFrom');
    const tokenToSelect = document.getElementById('tokenTo');
    const tickerContent = document.getElementById('tickerContent');

    const STORAGE_KEY_TXS = 'swap_recent_transactions';


    const REMOVE_TIME = 10000;

    //local storage میشه استوریج داخل مرورگر 

    /*
      قیمت زنده: تابع‌های کمکی برای گرفتن قیمت هر توکن برحسب USDT از API بایننس
      - ایده: برای محاسبه مقدار "To" همیشه قیمت هر توکن را به معادل USDT تبدیل می‌کنیم
        و سپس نسبت قیمت‌ها را برای تبدیل بین هر دو توکن به‌دست می‌آوریم.
      - دلایل: ساده‌ترین راه برای پشتیبانی از هر جفت دلخواه بدون نیاز به API جفت اختصاصی.
      - کش ساده محلی برای جلوگیری از درخواست‌های پشت سر هم.
    */
    const PRICE_TTL = 5000; // ms
    const priceCache = {};

    // نگاشت نام‌های داخلی به سینبول‌های بایننس (در صورت نیاز می‌توانید گسترش دهید)
    const BINANCE_SYMBOL_MAP = {
        'ETH': 'ETHUSDT',
        'USDT': null, // USDT as quote (price = 1)
        'WBTC': 'WBTCUSDT',
        'WETH': 'WETHUSDT',
        'BTC': 'BTCUSDT'
    };

    async function fetchPriceFromBinance(symbol) {
        // symbol is Binance symbol like ETHUSDT
        try {
            const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=' + symbol);
            if (!res.ok) throw new Error('Network');
            const data = await res.json();
            return parseFloat(data.price);
        } catch (e) {
            console.warn('Failed to fetch price for', symbol, e);
            return null;
        }
    }

    async function getUSDTPrice(token) {
        // USDT price is 1
        if (!token) return null;
        if (token === 'USDT') return 1;

        const binSym = BINANCE_SYMBOL_MAP[token] || (token + 'USDT');
        if (!binSym) return null;

        const now = Date.now();
        const cached = priceCache[binSym];
        if (cached && (now - cached.ts) < PRICE_TTL) {
            return cached.price;
        }

        const price = await fetchPriceFromBinance(binSym);
        if (price != null) priceCache[binSym] = { price, ts: now };
        return price;
    }

    // محاسبه و به‌روزرسانی مقدار فیلد "To" بر اساس قیمت زنده
    async function updateAmountTo() {
        const amountStr = amountFromInput.value;
        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0) {
            amountToInput.value = '';
            return;
        }

        const from = tokenFromSelect.value;
        const to = tokenToSelect.value;

        try {
            const [priceFromUSDT, priceToUSDT] = await Promise.all([getUSDTPrice(from), getUSDTPrice(to)]);
            if (priceFromUSDT == null || priceToUSDT == null) {
                // couldn't fetch prices
                amountToInput.value = '';
                return;
            }

            // amountTo = amount * (priceFromUSDT / priceToUSDT)
            const result = amount * (priceFromUSDT / priceToUSDT);
            // rounding: show up to 6 decimals, trim trailing zeros
            amountToInput.value = parseFloat(result.toFixed(6)).toString();
        } catch (e) {
            console.warn('updateAmountTo error', e);
            amountToInput.value = '';
        }
    }

///////////////////////////////////////////////////////////////////////////////////////////////////////////

    function updateBadgeFromStorage() {
        const transactions = JSON.parse(localStorage.getItem(STORAGE_KEY_TXS)) || [];// به ارایه تبدیل میشه که بدونیم چندتاس
        const count = transactions.length;
        if (badgeElement) {
            badgeElement.textContent = count;//عدد بج
            badgeElement.style.display = count > 0 ? 'flex' : 'none'; // عدد کمتر یک رو در بج نمایش نده 
        }
    }


    function saveTransaction(tx) {
        let transactions = JSON.parse(localStorage.getItem(STORAGE_KEY_TXS)) || [];

        transactions.unshift(tx);//unshift  چون به اول لیست اضافه بشه تراکنش
        //دوباره ذخیره میشه به صورت متن 

        localStorage.setItem(STORAGE_KEY_TXS, JSON.stringify(transactions));
        updateBadgeFromStorage();
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

                removeTxFromStorage(tx.id);
            }
        });
        updateBadgeFromStorage();
    }


    function removeTxFromStorage(id) {
        let transactions = JSON.parse(localStorage.getItem(STORAGE_KEY_TXS)) || [];
        //تراکنش هایی رو نگه دار که ایدیشون با ایدی تابعی که من صدا زدم یکی نباشه 
        transactions = transactions.filter(t => t.id !== id);
        localStorage.setItem(STORAGE_KEY_TXS, JSON.stringify(transactions));
        updateBadgeFromStorage(); // عدد Badge را کم کن
    }

    // ساخت و نمایش ردیف تراکنش 
    function renderRow(tx, delay) {
        const newRow = document.createElement('tr');//ساخت ردیف که هنوز ما نمیبینیم 
        //پر کردن محتوای ردیف
        // مقادیر از پایین در تراکنش گرفته میشن
        newRow.innerHTML = `
            <td><span>${tx.id}</span></td>
            <td>${tx.pair}</td>
            <td>${tx.amount}</td>
            <td>${tx.date}</td>
            <td><span class="status pending">Processing</span></td>
            <td><button class="btn-view">View</button></td>
        `;
        //از prepend  که اول لیست بیاد 
        tableBody.prepend(newRow);//چسباندن ردیف به جدول

        //نرم ردیفمون حذف میشه 
        setTimeout(() => {
            newRow.style.opacity = '0';//طی نیم ثانیه اروم اورم محو بشه 
            newRow.style.transition = '0.5s';
            setTimeout(() => {
                newRow.remove();
                removeTxFromStorage(tx.id); // حذف از حافظه و آپدیت Badge
            }, 500);
        }, delay);// این بخش باعث میشه اگه صفحه رو رفرش کردیم، تایمر از 10 ثانیه شروع نشه و فقط زمان باقی‌مانده رو حساب کنه 
    }

    loadTransactions();

    if (swapBtn) {
        swapBtn.addEventListener('click', () => {
            const amount = amountFromInput.value;
            if (amount === "" || amount <= 0) {
                alert("Please enter a valid amount");
                return;
            }
            //ساخت شناسنامه تراکنش     
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
            amountToInput.value = '';
        });
    }

    // Update amountTo on user changes (live price calculation)
    const amountToInput = document.getElementById('amountTo');
    if (amountFromInput) amountFromInput.addEventListener('input', () => { updateAmountTo(); });
    if (tokenFromSelect) tokenFromSelect.addEventListener('change', () => { updateAmountTo(); });
    if (tokenToSelect) tokenToSelect.addEventListener('change', () => { updateAmountTo(); });

    // initial compute if value exists
    updateAmountTo();

                try {
                const justRegistered = sessionStorage.getItem('justRegistered');
                const user = sessionStorage.getItem('registeredUser');
                if (justRegistered === 'true') {
                    // create a small banner above main
                    const banner = document.createElement('div');
                    banner.className = 'register-success-banner';
                    banner.style.position = 'relative';
                    banner.style.zIndex = '3';
                    banner.style.maxWidth = '1100px';
                    banner.style.margin = '12px auto';
                    banner.style.padding = '10px 14px';
                    banner.style.borderRadius = '8px';
                    banner.style.background = --color-background;
                    banner.style.color = 'var(--color-text)';
                    banner.style.textAlign = 'center';
                    banner.innerText = (user ? user + '، ' : '') + 'ثبت نام با موفقیت انجام شد. خوش آمدی!';
                    const main = document.querySelector('main.container');
                    if (main) main.parentElement.insertBefore(banner, main);
                    // remove flag so it doesn't show again
                    sessionStorage.removeItem('justRegistered');
                    sessionStorage.removeItem('registeredUser');
                    // auto-hide after 4s
                    setTimeout(() => banner.remove(), 4000);
                }
            } catch (e) { }
  
    

// --- تنظیمات پیشرفته فوتر (نسخه نهایی) ---
    const TICKER_SYMBOLS = [
        'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT', 
        'DOTUSDT', 'AVAXUSDT', 'MATICUSDT', 'XRPUSDT', 'LINKUSDT'
    ];
    
    const coinIcons = {
        'BTC': 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
        'ETH': 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
        'BNB': 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
        'SOL': 'https://cryptologos.cc/logos/solana-sol-logo.png',
        'ADA': 'https://cryptologos.cc/logos/cardano-ada-logo.png',
        'DOT': 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png',
        'AVAX': 'https://cryptologos.cc/logos/avalanche-avax-logo.png',
        'MATIC': 'https://cryptologos.cc/logos/polygon-matic-logo.png',
        'XRP': 'https://cryptologos.cc/logos/xrp-xrp-logo.png',
        'LINK': 'https://cryptologos.cc/logos/chainlink-link-logo.png'
    };

    function initTicker() {
        if (!tickerContent) return;
        let singleLoopHtml = ''; // ابتدا یک دور کامل را می‌سازیم
        
        // ۱. ساخت محتوای یک دور
        TICKER_SYMBOLS.forEach(symbol => {
            const name = symbol.replace('USDT', '');
            singleLoopHtml += `
                <div class="ticker-item">
                    <img src="${coinIcons[name]}" alt="${name}">
                    <span>${name}</span>
                    <span class="price-val" data-symbol="${symbol}">---</span>
                </div>
            `;
        });

        // اضافه کردن BTC.D و Gas به همان یک دور
        singleLoopHtml += `
            <div class="ticker-item">
                <img src="https://cryptologos.cc/logos/bitcoin-btc-logo.png" style="filter: grayscale(100%) sepia(100%) hue-rotate(320deg) saturate(500%);"> 
                <span>BTC.D</span>
                <span class="price-val" data-special="btcd" style="color: #F59E0B;">54.2%</span>
            </div>
            <div class="ticker-item">
                <span class="gas-icon">⛽</span>
                <span>Gas</span>
                <span class="price-val" data-special="gas" style="color: #6366f1;">15 Gwei</span>
            </div>
        `;

        // حالا این یک دور را "دقیقاً ۲ بار" پشت سر هم تکرار می‌کنیم
        tickerContent.innerHTML =
        singleLoopHtml.repeat(4);
    }

    async function updateTickerPrices() {
        try {
            // دریافت قیمت‌ها از بایننس
            const response = await fetch('https://api.binance.com/api/v3/ticker/price');
            const allPrices = await response.json();
            
            // آپدیت قیمت کوین‌ها
            TICKER_SYMBOLS.forEach(symbol => {
                const coinData = allPrices.find(p => p.symbol === symbol);
                if (coinData) {
                    const price = parseFloat(coinData.price).toLocaleString();
                    const priceElements = document.querySelectorAll(`[data-symbol="${symbol}"]`);
                    priceElements.forEach(el => {
                        // فقط اگر عدد تغییر کرده آپدیت کن (جلوگیری از لرزش)
                        if(el.textContent !== `$${price}`) { 
                            el.textContent = `$${price}`;
                        }
                    });
                }
            });

            // آپدیت دامیننس (شبیه‌سازی نوسان زنده)
            // عدد بین 53.8 تا 54.5 تغییر می‌کند
            const fakeBtcd = (53.8 + Math.random() * 0.7).toFixed(2);
            document.querySelectorAll(`[data-special="btcd"]`).forEach(el => {
                el.textContent = `${fakeBtcd}%`;
            });

            // آپدیت گس فی (شبیه‌سازی نوسان زنده)
            // عدد بین 12 تا 25 تغییر می‌کند
            const fakeGas = Math.floor(Math.random() * (25 - 12 + 1) + 12);
            document.querySelectorAll(`[data-special="gas"]`).forEach(el => {
                el.textContent = `${fakeGas} Gwei`;
            });

        } catch (e) { console.warn("Ticker update failed", e); }
    }

    initTicker();
    updateTickerPrices();
    // هر ۶۰ ثانیه آپدیت کن تا تداخل انیمیشن پیش نیاید
    setInterval(updateTickerPrices, 240000);
});   