const backToTopBtn = document.getElementById('backToTop');

window.onscroll = function() {
    // اگر بیشتر از 300 پیکسل اسکرول شد، دکمه را نشان بده
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        backToTopBtn.style.display = "flex";
    } else {
        backToTopBtn.style.display = "none";
    }
};

// وقتی روی دکمه کلیک شد، برو به بالای صفحه
backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});