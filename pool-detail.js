document.addEventListener('DOMContentLoaded', () => {
    // ۱. استخراج اطلاعات از URL
    const urlParams = new URLSearchParams(window.location.search);
    const coin = (urlParams.get('coin') || 'ETH').toUpperCase();
    const apr = urlParams.get('apr') || '0%';
    const tvl = urlParams.get('tvl') || '$0.0';
    const vol = urlParams.get('vol') || '$0.0';

    // ۲. آپدیت کردن متن‌های داینامیک در HTML
    const poolNameElement = document.getElementById('poolName');
    if (poolNameElement) poolNameElement.textContent = `${coin} / USDT`;

    const tokenALabel = document.getElementById('tokenALabel');
    if (tokenALabel) tokenALabel.textContent = coin;

    const aprElement = document.querySelector('.pool-stats-row .value.success') || 
                       document.querySelector('.stat-item .success');
    if (aprElement) aprElement.textContent = apr;

    const dataValues = document.querySelectorAll('.pool-data-grid .value');
    if (dataValues.length >= 2) {
        dataValues[0].textContent = tvl;
        dataValues[1].textContent = vol;
    }

    // ۳. منطق قیمت لحظه‌ای واقعی از Binance
    const livePriceElement = document.getElementById('livePrice');
    
    function fetchRealPrice() {
        const symbol = `${coin}USDT`;
        fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`)
            .then(res => res.json())
            .then(data => {
                if (data.price) {
                    const price = parseFloat(data.price);
                    // فرمت‌دهی: اگر قیمت بالا بود با کاما، اگر خیلی کم بود با اعشار بیشتر
                    livePriceElement.textContent = price > 1 
                        ? `$${price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` 
                        : `$${price.toFixed(4)}`;
                }
            })
            .catch(err => console.error("Price Fetch Error:", err));
    }

    fetchRealPrice(); // اجرای اولیه
    setInterval(fetchRealPrice, 5000); // آپدیت هر ۵ ثانیه

    // ۴. لود کردن نمودار TradingView (بدون تغییر در ویژگی‌ها)
    if (typeof TradingView !== 'undefined') {
        new TradingView.widget({
            "width": "100%",
            "height": 480,
            "symbol": `BINANCE:${coin}USDT`,
            "interval": "D",
            "timezone": "Etc/UTC",
            "theme": "dark",
            "style": "1",
            "locale": "en",
            "toolbar_bg": "#f1f3f6",
            "enable_publishing": false,
            "hide_top_toolbar": false,
            "save_image": false,
            "container_id": "tradingview_widget"
        });
    }
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