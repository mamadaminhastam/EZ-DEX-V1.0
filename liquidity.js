document.addEventListener('DOMContentLoaded', () => {
    
    // --- ۱. منطق سیستم ستاره دهی (Rating) ---
    const ratingGroups = document.querySelectorAll('.star-rating');

    ratingGroups.forEach(group => {
        const stars = group.querySelectorAll('.star-btn');

        stars.forEach(star => {
            star.addEventListener('click', (e) => {
                e.preventDefault();
                const currentIndex = parseInt(star.getAttribute('data-index'));

                // آپدیت ستاره‌های همین کارت
                stars.forEach(s => {
                    const sIndex = parseInt(s.getAttribute('data-index'));
                    const icon = s.querySelector('.material-icons');

                    if (sIndex <= currentIndex) {
                        s.classList.add('active');
                        icon.textContent = 'star';
                    } else {
                        s.classList.remove('active');
                        icon.textContent = 'star_border';
                    }
                });
            });
        });
    });

    // --- ۲. منطق دکمه Back to Top ---
    const backToTopBtn = document.getElementById('backToTop');

    window.onscroll = function() {
        if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
            backToTopBtn.style.display = "flex";
        } else {
            backToTopBtn.style.display = "none";
        }
    };

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});