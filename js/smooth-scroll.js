document.addEventListener('DOMContentLoaded', function() {
    // Получаем все ссылки навигации
    const navLinks = document.querySelectorAll('.desktop-nav a, .mobile-nav a');
    
    // Добавляем обработчик для каждой ссылки
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Получаем ID целевой секции из атрибута href
            const targetId = this.getAttribute('href');
            
            // Если это не якорная ссылка, позволяем браузеру обработать клик
            if (!targetId.startsWith('#')) return;
            
            e.preventDefault();
            
            // Находим целевую секцию
            const targetSection = document.querySelector(targetId);
            if (!targetSection) return;
            
            // Вычисляем позицию секции с учетом высоты хедера
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = targetSection.offsetTop - headerHeight;
            
            // Плавно прокручиваем к секции
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Закрываем мобильное меню, если оно открыто
            const mobileNav = document.querySelector('.mobile-nav');
            const menuButton = document.querySelector('.menu-button button');
            if (mobileNav.classList.contains('active')) {
                mobileNav.classList.remove('active');
                menuButton.classList.remove('active');
            }
        });
    });
}); 