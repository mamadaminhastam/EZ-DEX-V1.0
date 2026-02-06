document.addEventListener('DOMContentLoaded', () => {
    
    const cards = document.querySelectorAll('.liquidity-card');



    // --- ۲. منطق دکمه Back to Top ---
    const backToTopBtn = document.getElementById('backToTop');
    window.onscroll = function() {
        if (backToTopBtn) {
            if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
                backToTopBtn.style.display = "flex";
            } else {
                backToTopBtn.style.display = "none";
            }
        }
    };
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- ۳. منطق فیلتر، جستجو و مرتب‌سازی ---
    const searchInput = document.getElementById('searchPool');
    const chips = document.querySelectorAll('.chip');
    const sortSelect = document.querySelector('.sort-dropdown');

    function filterPools() {
        if (!searchInput) return;
        const searchTerm = searchInput.value.toLowerCase().trim();//btc,BTC
        const activeChip = document.querySelector('.chip.active');
        const activeCategory = activeChip ? activeChip.textContent.trim() : 'همه';//روی کدام دمکه کلیک کردی ؟ 

        cards.forEach(card => {
            const poolName = card.getAttribute('data-name') ? card.getAttribute('data-name').toLowerCase() : "";
            const poolCategory = card.getAttribute('data-category');
            
            const matchesSearch = poolName.includes(searchTerm);
            const matchesCategory = (activeCategory === 'همه' || poolCategory === activeCategory);

            card.style.display = (matchesSearch && matchesCategory) ? "flex" : "none";
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterPools);//برای جست و جوی لحظه ای 
    }

    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            //اول از همه active  رو از روی همه بر میداره 
            chips.forEach(c => c.classList.remove('active'));
            //فعال کردن چیپ کلیک شده
            chip.classList.add('active');
            //اجرای فیلتر
            filterPools();
        });
    });

    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            const value = sortSelect.value;
            const grid = document.querySelector('.pair-grid');
            const cardsArray = Array.from(document.querySelectorAll('.liquidity-card'));

            cardsArray.sort((a, b) => {
                if (value === 'apr') {
                    const aprA = parseFloat(a.querySelector('.apr').textContent.replace(/[^\d.]/g, ''));
                    const aprB = parseFloat(b.querySelector('.apr').textContent.replace(/[^\d.]/g, ''));
                    return aprB - aprA;
                } 
                else if (value === 'tvl') {
                    const parseTVL = (text) => {
                        const num = parseFloat(text.replace(/[^\d.]/g, ''));
                        if (text.includes('M')) return num * 1000000;
                        if (text.includes('K')) return num * 1000;
                        return num;
                    };
                    const tvlA = parseTVL(a.querySelector('.card-stats .value').textContent);
                    const tvlB = parseTVL(b.querySelector('.card-stats .value').textContent);
                    return tvlB - tvlA;
                }
                return 0;
            });

            cardsArray.forEach(card => grid.appendChild(card));//جابه جایی فیزیکی در صفحه 
        });
    }

    // --- ۴. منطق انتقال هوشمند به صفحه جزئیات ---
    // در فایل liquidity.js - بخش ۴
    cards.forEach(card => {
        const actionBtn = card.querySelector('.btn-primary-sm');
        if (actionBtn) {
            actionBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const rawName = card.getAttribute('data-name') || "ETH";
            const coinSymbol = rawName.trim().split(' ')[0].toUpperCase();
            
            // استخراج مقادیر از کارت
            const apr = card.querySelector('.apr').textContent.trim();
            const tvl = card.querySelector('.card-stats .value').textContent.trim();
            const vol = "24.1M"; // اگر ولوم را در کارت داری، مشابه بالا استخراج کن

            // ارسال همه مقادیر در آدرس
            window.location.href = `pool-detail.html?coin=${coinSymbol}&apr=${encodeURIComponent(apr)}&tvl=${encodeURIComponent(tvl)}&vol=${vol}`;
        });
     }
    });
});