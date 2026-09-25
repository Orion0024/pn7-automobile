(function () {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scrollBehavior = reduceMotion ? 'auto' : 'smooth';

    /* ---------------- Year ---------------- */
    document.getElementById('year').textContent = new Date().getFullYear();

    /* ---------------- Logo → top ---------------- */
    document.getElementById('logo-btn').addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: scrollBehavior });
    });

    /* ---------------- Mobile menu ---------------- */
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu    = document.getElementById('mobile-menu');

    function setMobileMenu(open) {
        mobileMenu.classList.toggle('hidden', !open);
        mobileMenuBtn.setAttribute('aria-expanded', String(open));
        mobileMenuBtn.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
        const icon = mobileMenuBtn.querySelector('.material-symbols-outlined');
        if (icon) icon.textContent = open ? 'close' : 'menu';
    }

    mobileMenuBtn.addEventListener('click', () => {
        setMobileMenu(mobileMenu.classList.contains('hidden'));
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => setMobileMenu(false));
    });

    /* ---------------- Configs ---------------- */
    const CARD_SPECS = [
        { icon: 'speed',                     value: c => c.engine },
        { icon: 'event',                     value: c => c.model },
        { icon: 'airline_seat_recline_normal', value: c => `${c.seats} Seats` },
        { icon: 'bolt',                      value: c => c.hp }
    ];

    const MODAL_SPECS = [
        { icon: 'speed',                     label: 'Engine Power',              value: c => c.engine },
        { icon: 'calendar_month',            label: 'Model Year',                value: c => c.model },
        { icon: 'airline_seat_recline_normal', label: 'Seating Capacity',        value: c => `${c.seats} Seats` },
        { icon: 'bolt',                      label: 'Horsepower',                value: c => c.hp },
        { icon: 'account_tree',              label: 'Transmission',              value: c => c.gear },
        { icon: 'straighten',                label: 'Dimensions (L x W x H)',    value: c => c.dimensions },
        { icon: 'height',                    label: 'Ground Clearance',          value: c => c.groundClearance }
    ];

    /* ---------------- DOM refs ---------------- */
    const grid          = document.getElementById('car-grid');
    const statusEl      = document.getElementById('results-status');
    const searchInput   = document.getElementById('search-input');
    const filterBtns    = Array.from(document.querySelectorAll('.filter-btn'));

    const modal         = document.getElementById('car-modal');
    const modalContent  = document.getElementById('modal-content');
    const modalTitle    = document.getElementById('modal-car-title');
    const modalMainImg  = document.getElementById('modal-main-image');
    const modalViewLbl  = document.getElementById('modal-view-label');
    const modalSpecs    = document.getElementById('modal-specs-list');
    const modalThumbs   = document.getElementById('modal-thumbnails');
    const modalContact  = document.getElementById('modal-contact-btn');

    let cars = [];
    let currentFilter = 'All';
    let currentSearch = '';
    let lastFocused   = null;

    /* ---------------- Fetch Data ---------------- */
    async function fetchCarsData() {
        try {
            const response = await fetch('./cars.json');
            if (!response.ok) throw new Error('Network response was not ok');
            cars = await response.json();
            renderCars();
        } catch (error) {
            console.error('Error fetching car data:', error);
            grid.innerHTML = '<p class="col-span-full text-center text-slate-400 py-10">Failed to load vehicle data. Please try again later.</p>';
        }
    }

    /* ---------------- Render grid ---------------- */
    function renderCars() {
        const term = currentSearch.trim().toLowerCase();
        const filtered = cars.filter(car =>
            (currentFilter === 'All' || car.brand === currentFilter) &&
            car.name.toLowerCase().includes(term)
        );

        grid.innerHTML = '';

        if (filtered.length === 0) {
            grid.innerHTML = '<p class="col-span-full text-center text-slate-400 py-10">No vehicles found matching your criteria.</p>';
            statusEl.textContent = 'No vehicles found.';
            return;
        }

        statusEl.textContent = `${filtered.length} vehicle${filtered.length === 1 ? '' : 's'} shown.`;

        const frag = document.createDocumentFragment();

        filtered.forEach(car => {
            const article = document.createElement('article');
            article.className = 'glass-card glass-card--interactive rounded-2xl overflow-hidden group flex flex-col h-full';

            const chips = CARD_SPECS.map(s => `
                <div class="bg-white/5 border border-white/10 px-2.5 py-2 rounded-lg flex items-center gap-2">
                    <span class="material-symbols-outlined text-[16px] text-blue-400" aria-hidden="true">${s.icon}</span>
                    <span class="text-xs font-medium text-slate-200">${s.value(car)}</span>
                </div>`).join('');

            // Array ထဲက ပထမဆုံးပုံကို Card မျက်နှာစာအဖြစ် သုံးပါမယ်
            const coverImage = car.images && car.images.length > 0 ? car.images[0].link : '';

            article.innerHTML = `
                <button type="button"
                        class="relative h-56 w-full overflow-hidden bg-black/20 text-left"
                        data-car-id="${car.id}"
                        aria-label="View details for ${car.name}">
                    <img src="${coverImage}"
                         alt="${car.name}"
                         width="800" height="600"
                         loading="lazy" decoding="async"
                         class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                    <span class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" aria-hidden="true"></span>
                    <span class="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                        <span class="text-xl font-bold text-white shadow-sm">${car.name}</span>
                    </span>
                </button>

                <div class="p-5 flex-grow flex flex-col justify-between">
                    <div class="grid grid-cols-2 gap-2 mb-6">${chips}</div>
                    <div class="flex gap-2">
                        <button type="button" data-car-id="${car.id}" class="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-colors">
                            Details
                        </button>
                        <a href="#contact" class="flex-1 py-2.5 rounded-xl border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-1 group-hover:border-blue-500/50 group-hover:text-blue-300">
                            Contact
                            <span class="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_outward</span>
                        </a>
                    </div>
                </div>
            `;
            frag.appendChild(article);
        });
        grid.appendChild(frag);
    }

    grid.addEventListener('click', e => {
        const trigger = e.target.closest('[data-car-id]');
        if (!trigger) return;
        openModal(Number(trigger.getAttribute('data-car-id')));
    });

    /* ---------------- Search ---------------- */
    let searchTimer = null;
    searchInput.addEventListener('input', e => {
        const value = e.target.value;
        window.clearTimeout(searchTimer);
        searchTimer = window.setTimeout(() => {
            currentSearch = value;
            renderCars();
        }, 180);
    });

    /* ---------------- Filters (Bug Fixed) ---------------- */
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // အရင် Active ဖြစ်နေတဲ့ Button ကနေ Active ဖြုတ်မယ်
            filterBtns.forEach(b => {
                b.classList.remove('is-active', 'bg-blue-600', 'border-blue-500');
                b.classList.add('border-white/10', 'glass-card');
                b.setAttribute('aria-pressed', 'false');
            });
            
            // အခု Click လိုက်တဲ့ Button ကို Active ဖြစ်စေမယ်
            btn.classList.add('is-active', 'bg-blue-600', 'border-blue-500');
            btn.classList.remove('border-white/10', 'glass-card');
            btn.setAttribute('aria-pressed', 'true');

            currentFilter = btn.getAttribute('data-filter');
            renderCars();
        });
    });

    /* ---------------- Modal & Dynamic Images ---------------- */
    const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

    function openModal(id) {
        const car = cars.find(c => c.id === id);
        if (!car) return;

        lastFocused = document.activeElement;
        modalTitle.textContent = car.name;

        modalSpecs.innerHTML = MODAL_SPECS.map((s, i) => `
            <li class="flex justify-between items-center ${i < MODAL_SPECS.length - 1 ? 'border-b border-white/5 pb-3' : ''}">
                <span class="text-slate-400 flex items-center gap-2">
                    <span class="material-symbols-outlined text-[18px]" aria-hidden="true">${s.icon}</span>
                    ${s.label}
                </span>
                <span class="text-white font-medium text-right ml-2">${s.value(car)}</span>
            </li>`).join('');

        // Modal ရဲ့ ပုံပြတဲ့အပိုင်း (Dynamic Image Array)
        modalThumbs.innerHTML = '';
        
        if(car.images && car.images.length > 0) {
            // ပထမဆုံးပုံကို Main ပုံအနေနဲ့ အရင်ပြထားမယ်
            setMainImage(car.images[0].link, car.images[0].label, car.name);

            car.images.forEach((imgObj, index) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ' +
                                (index === 0 ? 'border-blue-500' : 'border-transparent opacity-60 hover:opacity-100');
                btn.setAttribute('aria-label', `${car.name} — ${imgObj.label}`);
                btn.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');

                btn.addEventListener('click', () => {
                    Array.from(modalThumbs.children).forEach(c => {
                        c.classList.remove('border-blue-500');
                        c.classList.add('border-transparent', 'opacity-60');
                        c.setAttribute('aria-pressed', 'false');
                    });
                    btn.classList.remove('border-transparent', 'opacity-60');
                    btn.classList.add('border-blue-500');
                    btn.setAttribute('aria-pressed', 'true');

                    setMainImage(imgObj.link, imgObj.label, car.name);
                });

                const img = document.createElement('img');
                img.src = imgObj.link;
                img.alt = '';
                img.width = 160;
                img.height = 128;
                img.loading = 'lazy';
                img.className = 'w-full h-full object-cover';
                btn.appendChild(img);

                modalThumbs.appendChild(btn);
            });
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';

        void modal.offsetWidth;

        modal.classList.remove('opacity-0');
        modalContent.classList.remove('scale-95');

        const first = modalContent.querySelector(FOCUSABLE);
        if (first) first.focus({ preventScroll: true });
    }

    function setMainImage(url, label, carName) {
        modalMainImg.classList.add('is-fading');
        window.setTimeout(() => {
            modalMainImg.src = url;
            modalMainImg.alt = `${carName} — ${label.toLowerCase()}`;
            modalViewLbl.textContent = label;
            modalMainImg.classList.remove('is-fading');
        }, reduceMotion ? 0 : 150);
    }

    function closeModal(options) {
        const opts = options || {};
        const restoreFocus = opts.restoreFocus !== false;
        document.body.style.overflow = '';
        modal.classList.add('opacity-0');
        modalContent.classList.add('scale-95');

        window.setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }, reduceMotion ? 0 : 300);

        if (restoreFocus && lastFocused && document.contains(lastFocused)) {
            lastFocused.focus({ preventScroll: true });
        }
        lastFocused = null;
    }

    modal.querySelectorAll('[data-close-modal]').forEach(el => {
        el.addEventListener('click', () => closeModal());
    });

    document.addEventListener('keydown', e => {
        if (modal.classList.contains('hidden')) return;
        if (e.key === 'Escape') {
            e.preventDefault();
            closeModal();
            return;
        }
        if (e.key === 'Tab') {
            const focusables = Array.from(modalContent.querySelectorAll(FOCUSABLE)).filter(el => el.offsetParent !== null);
            if (focusables.length === 0) return;
            const first = focusables[0];
            const last  = focusables[focusables.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });

    modalContact.addEventListener('click', () => {
        closeModal({ restoreFocus: false });
        const target = document.getElementById('contact');
        window.setTimeout(() => {
            target.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
        }, 0);
    });

    // Run Initialization
    fetchCarsData();

})();
