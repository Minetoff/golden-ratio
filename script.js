/* ===== Хранилище инстансов Masonry ===== */
const masonryInstances = {};

/* ===== МОДАЛЬНОЕ ОКНО ДЛЯ ИЗОБРАЖЕНИЙ ===== */
function populateCatalog(subcategory, files) {
    const grid = document.getElementById(subcategory + '-grid');
    if (!grid) return;

    // 1) очищаем и добавляем grid-sizer
    grid.innerHTML = '<div class="grid-sizer"></div>';

    const folder = subcategory.charAt(0).toUpperCase() + subcategory.slice(1);
    files.forEach(file => {
        const imgSrc = `jewelry/${folder}/${file}`;
        const catalogItem = document.createElement('div');
        catalogItem.className = 'catalog-item';

        const link = document.createElement('a');
        link.className = 'catalog-item-link';
        link.href = 'javascript:void(0)';
        link.innerHTML = `
            <div class="catalog-item-image">
                <img src="${imgSrc}" alt="Изображение украшения">
            </div>
        `;
        link.addEventListener('click', () => openImageModal(imgSrc));
        catalogItem.appendChild(link);

        grid.appendChild(catalogItem);
    });

    // 2) ждём загрузки всех картинок и инициализируем Masonry
    imagesLoaded(grid, () => {
        const msnry = new Masonry(grid, {
            itemSelector: '.catalog-item',
            columnWidth: '.grid-sizer',
            percentPosition: true,
            gutter: 20,
            horizontalOrder: true
        });
        masonryInstances[subcategory] = msnry;
    });
}

function openImageModal(imageSrc) {
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    if (modal && modalImage) {
        modalImage.src = imageSrc;
        modal.style.display = 'flex';
    }
}

function closeImageModal() {
    const modal = document.getElementById('image-modal');
    if (modal) modal.style.display = 'none';
}

/* ===== Плавный скролл по якорям ===== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

/* ===== Обработчики формы loyalty-form ===== */
async function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const respEl = document.getElementById('form-response');

    // Валидация телефона
    const phone = formData.get('phone') || '';
    const phoneRegex = /^\+7\s?\(?\d{3}\)?\s?\d{3}[-\s]?\d{2}[-\s]?\d{2}$/;
    if (!phoneRegex.test(phone)) {
        respEl.textContent = 'Пожалуйста, введите корректный номер телефона';
        respEl.style.color = 'red';
        return;
    }

    // Валидация даты
    const birthStr = formData.get('birthdate');
    if (birthStr) {
        const birthdate = new Date(birthStr);
        if (birthdate > new Date()) {
            respEl.textContent = 'Дата рождения не может быть в будущем';
            respEl.style.color = 'red';
            return;
        }
    }

    const data = {
        name: formData.get('name'),
        phone: phone.replace(/[\s\(\)\-]/g, ''),
        birthdate: formData.get('birthdate'),
        timestamp: new Date().toISOString()
    };

    try {
        const res = await fetch('https://aged-limit-85a9.lovygin2016.workers.dev', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());

        form.reset();
        respEl.textContent = 'Спасибо! Ваша заявка принята.';
        respEl.style.color = 'green';
        setTimeout(() => respEl.textContent = '', 3000);
    } catch (err) {
        console.error(err);
        respEl.textContent = 'Произошла ошибка. Пожалуйста, попробуйте позже.';
        respEl.style.color = 'red';
    }
}

// Маска для телефона
function phoneMask(e) {
    let val = e.target.value.replace(/\D/g, '');
    if (!val) {
        e.target.value = '+7';
        return;
    }
    if (val[0] === '7') val = val.slice(1);
    let out = '+7';
    if (val.length)        out += ' (' + val.slice(0,3);
    if (val.length > 3)    out += ') ' + val.slice(3,6);
    if (val.length > 6)    out += '-' + val.slice(6,8);
    if (val.length > 8)    out += '-' + val.slice(8,10);
    e.target.value = out;
}

/* ===== IntersectionObserver для .info-block ===== */
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting && window.innerWidth <= 768) {
            entry.target.classList.add('info-block-visible');
        }
    });
}, { threshold: 0.2 });

/* ===== DOMContentLoaded: инициализация всего ===== */
document.addEventListener('DOMContentLoaded', () => {
    // Модалка
    const cls = document.querySelector('#image-modal .modal-close');
    if (cls) cls.addEventListener('click', closeImageModal);
    window.addEventListener('click', e => {
        if (e.target.id === 'image-modal') closeImageModal();
    });

    // Загрузка изображений
    fetch('list_images.php')
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(data => {
            populateCatalog('gold',   data.gold);
            populateCatalog('silver', data.silver);
            populateCatalog('stone',  data.stone);
        })
        .catch(err => console.error('Ошибка загрузки изображений:', err));

    // Главные вкладки
    const mainTabs = document.querySelectorAll('.main-tabs .tab-button');
    mainTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const cat = this.dataset.category;
            mainTabs.forEach(t => t.classList.toggle('active', t === this));
            document.getElementById('jewelry-container').style.display = cat === 'jewelry' ? 'block' : 'none';
            document.getElementById('stone-container').style.display   = cat === 'stone'   ? 'block' : 'none';

            // пересобираем masonry в активной сетке
            let key;
            if (cat === 'jewelry') {
                key = document.querySelector('.sub-tabs .sub-tab-button.active').dataset.subcategory;
            } else {
                key = 'stone';
            }
            if (masonryInstances[key]) masonryInstances[key].layout();
        });
    });

    // Суб-вкладки
    const subTabs = document.querySelectorAll('.sub-tabs .sub-tab-button');
    subTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const sub = this.dataset.subcategory;
            subTabs.forEach(t => t.classList.toggle('active', t === this));
            document.querySelectorAll('#jewelry-container .catalog-grid')
                .forEach(gr => gr.classList.remove('active'));
            document.getElementById(sub + '-grid').classList.add('active');

            // пересобираем masonry в активной сетке
            if (masonryInstances[sub]) masonryInstances[sub].layout();
        });
    });

    // Кнопки «Перейти к ...»
    document.querySelectorAll('.next-section-button').forEach(btn => {
        btn.addEventListener('click', function() {
            const tgt = this.dataset.target;
            mainTabs.forEach(t => t.classList.toggle('active', t.dataset.category === tgt));
            document.getElementById('jewelry-container').style.display = tgt === 'jewelry' ? 'block' : 'none';
            document.getElementById('stone-container').style.display   = tgt === 'stone'   ? 'block' : 'none';
            document.querySelector('.catalog-section').scrollIntoView({ behavior: 'smooth' });

            // и тут тоже пересборка masonry
            let key2;
            if (tgt === 'jewelry') {
                key2 = document.querySelector('.sub-tabs .sub-tab-button.active').dataset.subcategory;
            } else {
                key2 = 'stone';
            }
            if (masonryInstances[key2]) masonryInstances[key2].layout();
        });
    });

    // Мобильное меню
    const menuButton = document.getElementById('menuToggle');
    const mobileNav  = document.querySelector('.mobile-nav');
    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', () => {
            menuButton.classList.toggle('active');
            mobileNav.classList.toggle('active');
            document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
        });
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('active');
                menuButton.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        document.addEventListener('click', e => {
            if (!mobileNav.contains(e.target) && !menuButton.contains(e.target)) {
                mobileNav.classList.remove('active');
                menuButton.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Форма
    const form = document.getElementById('loyalty-form');
    if (form) {
        form.addEventListener('submit', handleSubmit);
        const phoneInput = document.getElementById('phone');
        if (phoneInput) phoneInput.addEventListener('input', phoneMask);
    }

    // Анимация info-block
    document.querySelectorAll('.info-block').forEach(block => observer.observe(block));
});
