// ===== Работа с localStorage (база данных) =====

const DB = {
    getUsers() {
        return JSON.parse(localStorage.getItem('users')) || [];
    },
    setUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
    },
    getApplications() {
        return JSON.parse(localStorage.getItem('applications')) || [];
    },
    setApplications(apps) {
        localStorage.setItem('applications', JSON.stringify(apps));
    },
    getCurrentUser() {
        return JSON.parse(sessionStorage.getItem('currentUser')) || null;
    },
    setCurrentUser(user) {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
    },
    logout() {
        sessionStorage.removeItem('currentUser');
    },
    findUserByLogin(login) {
        return this.getUsers().find(u => u.login === login);
    },
    findUserById(id) {
        return this.getUsers().find(u => u.id === id);
    },
    getApplicationsByUser(userId) {
        return this.getApplications().filter(a => a.userId === userId);
    },
    getApplicationById(id) {
        return this.getApplications().find(a => a.id === id);
    },
    addApplication(app) {
        const apps = this.getApplications();
        app.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        apps.push(app);
        this.setApplications(apps);
        return app;
    },
    updateApplication(id, updates) {
        const apps = this.getApplications();
        const index = apps.findIndex(a => a.id === id);
        if (index !== -1) {
            apps[index] = { ...apps[index], ...updates };
            this.setApplications(apps);
            return apps[index];
        }
        return null;
    },
    addUser(user) {
        const users = this.getUsers();
        user.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        users.push(user);
        this.setUsers(users);
        return user;
    }
};

// ===== Утилиты =====

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getStatusBadge(status) {
    const map = {
        'Новая': 'badge-warning',
        'Идет обучение': 'badge-primary',
        'Обучение завершено': 'badge-success'
    };
    return map[status] || 'badge-gray';
}

// ===== Уведомления (тосты) =====

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer') || (() => {
        const c = document.createElement('div');
        c.id = 'toastContainer';
        c.className = 'toast-container';
        document.body.appendChild(c);
        return c;
    })();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(30px)';
        toast.style.transition = '0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ===== Бургер-меню =====

function initBurger() {
    const burger = document.getElementById('burgerBtn');
    const nav = document.getElementById('navLinks');

    if (burger && nav) {
        burger.addEventListener('click', () => {
            nav.classList.toggle('open');
        });

        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('open');
            });
        });
    }
}

// ===== Проверка авторизации =====

function checkAuth(redirectTo = 'login.html') {
    const user = DB.getCurrentUser();
    if (!user) {
        window.location.href = redirectTo;
        return null;
    }
    return user;
}

function checkAdmin(redirectTo = 'login.html') {
    const user = DB.getCurrentUser();
    if (!user || user.role !== 'admin') {
        window.location.href = redirectTo;
        return null;
    }
    return user;
}

// ===== Выход из системы =====

function logoutUser() {
    DB.logout();
    showToast('Вы вышли из системы', 'info');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 400);
}

// ===== Инициализация демо-данных =====

function initDemoData() {
    const users = DB.getUsers();
    if (users.length === 0) {
        DB.addUser({
            login: 'Admin26',
            password: 'Demo20',
            fullName: 'Администратор',
            phone: '+7 (999) 999-99-99',
            email: 'admin@uchus.ru',
            role: 'admin'
        });

        DB.addUser({
            login: 'user1',
            password: 'password123',
            fullName: 'Иван Петров',
            phone: '+7 (912) 345-67-89',
            email: 'ivan@mail.ru',
            role: 'user'
        });

        const user = DB.findUserByLogin('user1');
        if (user) {
            DB.addApplication({
                userId: user.id,
                course: 'Курс повышения квалификации',
                startDate: '2026-07-15',
                payment: 'Предоплата по QR-коду',
                status: 'Новая',
                createdAt: new Date().toISOString()
            });
            DB.addApplication({
                userId: user.id,
                course: 'Курс по охране труда',
                startDate: '2026-06-10',
                payment: 'Оплата картой МИР',
                status: 'Идет обучение',
                createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
            });
        }
    }
}

// ===== Слайдер =====

function initSlider() {
    const slides = document.querySelector('.slides');
    const dotsContainer = document.querySelector('.slider-dots');
    const prevBtn = document.querySelector('.slider-btn.prev');
    const nextBtn = document.querySelector('.slider-btn.next');

    if (!slides) return;

    const slideElements = slides.querySelectorAll('.slide');
    const total = slideElements.length;
    let current = 0;
    let interval;

    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        slideElements.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = `dot ${i === 0 ? 'active' : ''}`;
            dot.dataset.index = i;
            dot.addEventListener('click', () => goTo(i));
            dotsContainer.appendChild(dot);
        });
    }

    function goTo(index) {
        if (index < 0) index = total - 1;
        if (index >= total) index = 0;
        current = index;
        slides.style.transform = `translateX(-${current * 100}%)`;

        document.querySelectorAll('.dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === current);
        });
    }

    function next() {
        goTo(current + 1);
    }

    function prev() {
        goTo(current - 1);
    }

    function startAuto() {
        stopAuto();
        interval = setInterval(next, 3000);
    }

    function stopAuto() {
        clearInterval(interval);
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { prev();
        startAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { next();
        startAuto(); });

    const slider = document.querySelector('.slider-section');
    if (slider) {
        slider.addEventListener('mouseenter', stopAuto);
        slider.addEventListener('mouseleave', startAuto);
    }

    startAuto();
    return { goTo, next, prev, startAuto, stopAuto };
}

// ===== Инициализация при загрузке =====

document.addEventListener('DOMContentLoaded', () => {
    initBurger();
    initDemoData();

    if (document.querySelector('.slides')) {
        initSlider();
    }

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
    });
});

// ===== Экспорт =====
window.DB = DB;
window.showToast = showToast;
window.checkAuth = checkAuth;
window.checkAdmin = checkAdmin;
window.formatDate = formatDate;
window.getStatusBadge = getStatusBadge;
window.generateId = generateId;
window.logoutUser = logoutUser;
window.initSlider = initSlider;