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
});