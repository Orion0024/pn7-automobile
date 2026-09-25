/* ==========================================================
   PN7 Automobile — APPLICATION LOGIC
   ==========================================================
   ဒီဖိုင်က ကုဒ် logic အားလုံး ပါတယ်။
   မလိုအပ်ရင် ဒီဖိုင်ကို မပြင်ပါနဲ့။
   Settings ပြင်ချင်ရင် config.js ကို ပြင်ပါ။
   ========================================================== */

(function () {
  'use strict';

  /* ---------- Short helpers ---------- */
  const $  = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollBehavior = reduceMotion ? 'auto' : 'smooth';

  /* ---------- State ---------- */
  let allCars = [];
  let currentFilter = 'All';
  let currentSearch = '';
  let lastFocused = null;
  let dataSource = 'unknown';   // 'cache' | 'live' | 'fallback'
  let isFetching = false;

  /* ---------- DOM references ---------- */
  const grid         = $('#car-grid');
  const statusEl     = $('#results-status');
  const searchInput  = $('#search-input');
  const filterBtns   = $$('.filter-btn');
  const refreshBtn   = $('#refresh-btn');
  const dataStatusEl = $('#data-status');

  const modal         = $('#car-modal');
  const modalContent  = $('#modal-content');
  const modalTitle    = $('#modal-car-title');
  const modalMainImg  = $('#modal-main-image');
  const modalViewLbl  = $('#modal-view-label');
  const modalSpecs    = $('#modal-specs-list');
  const modalThumbs   = $('#modal-thumbnails');
  const modalContact  = $('#modal-contact-btn');
  const modalCall     = $('#modal-call-btn');
  const modalDesc     = $('#modal-description');
  const modalStock    = $('#modal-stock');

  /* ---------- View definitions ---------- */
  const VIEWS = [
    { key: 'front',    label: 'Front View' },
    { key: 'back',     label: 'Back View' },
    { key: 'interior', label: 'Interior' },
    { key: 'left',     label: 'Left Side' },
    { key: 'right',    label: 'Right Side' }
  ];

  const CARD_SPECS = [
    { icon: 'speed',                       value: c => c.engine },
    { icon: 'event',                       value: c => c.model },
    { icon: 'airline_seat_recline_normal', value: c => c.seats + ' Seats' },
    { icon: 'bolt',                        value: c => c.hp }
  ];

  const MODAL_SPECS = [
    { icon: 'speed',                       label: 'Engine Power',           value: c => c.engine },
    { icon: 'calendar_month',              label: 'Model Year',             value: c => c.model },
    { icon: 'airline_seat_recline_normal', label: 'Seating Capacity',       value: c => c.seats + ' Seats' },
    { icon: 'bolt',                        label: 'Horsepower',             value: c => c.hp },
    { icon: 'account_tree',                label: 'Transmission',           value: c => c.gear },
    { icon: 'straighten',                  label: 'Dimensions (L x W x H)', value: c => c.dimensions },
    { icon: 'height',                      label: 'Ground Clearance',       value: c => c.groundClearance }
  ];

  /* ==========================================================
     CACHE (localStorage)
     ========================================================== */
  function readCache() {
    try {
      const raw = localStorage.getItem(CONFIG.cacheKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.data)) return null;
      return parsed;   // { data: [...], timestamp: 123456 }
    } catch (e) {
      console.warn('Cache read error:', e);
      return null;
    }
  }

  function writeCache(cars) {
    try {
      localStorage.setItem(CONFIG.cacheKey, JSON.stringify({
        data: cars,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('Cache write error:', e);
    }
  }

  function isCacheFresh(cache) {
    if (!cache) return false;
    return (Date.now() - cache.timestamp) < CONFIG.cacheDurationMs;
  }

  /* ==========================================================
     FETCH from SheetDB
     ========================================================== */
  async function fetchFromSheetDB() {
    if (!CONFIG.sheetdbUrl || CONFIG.sheetdbUrl.includes('YOUR_API_ID')) {
      throw new Error('SheetDB URL not configured');
    }

    const res = await fetch(CONFIG.sheetdbUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) throw new Error('SheetDB HTTP ' + res.status);

    const json = await res.json();

    // SheetDB က array ပြန်တယ်။ တချို့ config က { data: [...] } ပြန်တယ်။
    const rows = Array.isArray(json) ? json : (json.data || []);
    if (!Array.isArray(rows)) throw new Error('Unexpected SheetDB response');

    return rows.map(normalizeCar).filter(Boolean);
  }

  /* ==========================================================
     NORMALIZE — SheetDB row → internal format
     ========================================================== */
  function normalizeCar(row) {
    if (!row || !row.name) return null;

    return {
      id:              Number(row.id) || Math.random(),
      brand:           String(row.brand || '').trim(),
      name:            String(row.name || '').trim(),
      engine:          String(row.engine || '').trim(),
      model:           String(row.model || '').trim(),
      seats:           Number(row.seats) || 5,
      hp:              String(row.hp || '').trim(),
      gear:            String(row.gear || '').trim(),
      dimensions:      String(row.dimensions || '').trim(),
      groundClearance: String(row.groundClearance || '').trim(),
      stock:           String(row.stock || 'In Stock').trim(),
      description:     String(row.description || '').trim(),
      images: {
        front:    row.image_front    || row.imageFront    || '',
        back:     row.image_back     || row.imageBack     || '',
        interior: row.image_interior || row.imageInterior || '',
        left:     row.image_left     || row.imageLeft     || '',
        right:    row.image_right    || row.imageRight    || ''
      }
    };
  }

  /* ==========================================================
     LOAD — cache → SheetDB → fallback
     ========================================================== */
  async function loadCars(forceRefresh) {
    forceRefresh = forceRefresh === true;

    if (forceRefresh) {
      // Refresh နှိပ်ရင် SheetDB ကနေ အတင်းဆွဲ
      setDataStatus('loading');
      try {
        const fresh = await fetchFromSheetDB();
        if (fresh.length > 0) {
          allCars = fresh;
          writeCache(fresh);
          dataSource = 'live';
          setDataStatus('live');
          renderCars();
          flashRefreshBtn('success');
          return;
        }
        throw new Error('Empty data');
      } catch (e) {
        console.warn('Refresh failed:', e);
        flashRefreshBtn('error');
        setDataStatus(dataSource === 'fallback' ? 'fallback' : 'error');
        // ရှိပြီးသား data ကို ဆက်ထား
        return;
      }
    }

    // Cache ရှိလား?
    const cache = readCache();

    if (cache && cache.data.length > 0) {
      allCars = cache.data;
      dataSource = 'cache';
      setDataStatus('cache');
      renderCars();

      // Cache က fresh ဖြစ်သေးရင် SheetDB မခေါ်
      if (isCacheFresh(cache)) return;

      // Cache က ရက်လွန်နေရင် background မှာ ဆွဲ (silent)
      silentlyRevalidate();
      return;
    }

    // Cache မရှိ — SheetDB ခေါ်
    setDataStatus('loading');
    try {
      const fresh = await fetchFromSheetDB();
      if (fresh.length > 0) {
        allCars = fresh;
        writeCache(fresh);
        dataSource = 'live';
        setDataStatus('live');
        renderCars();
        return;
      }
      throw new Error('Empty data');
    } catch (e) {
      console.warn('SheetDB failed, using fallback:', e);
      allCars = FALLBACK_CARS;
      dataSource = 'fallback';
      setDataStatus('fallback');
      renderCars();
    }
  }

  async function silentlyRevalidate() {
    if (isFetching) return;
    isFetching = true;
    try {
      const fresh = await fetchFromSheetDB();
      if (fresh.length > 0) {
        allCars = fresh;
        writeCache(fresh);
        dataSource = 'live';
        setDataStatus('live');
        renderCars();
      }
    } catch (e) {
      console.warn('Silent revalidate failed:', e);
    } finally {
      isFetching = false;
    }
  }

  /* ==========================================================
     DATA STATUS INDICATOR
     ========================================================== */
  function setDataStatus(state) {
    if (!dataStatusEl) return;
    const map = {
      loading:  { text: 'Loading…',   color: 'text-slate-400' },
      live:     { text: 'Live',       color: 'text-green-400' },
      cache:    { text: 'Cached',     color: 'text-blue-400' },
      fallback: { text: 'Offline',    color: 'text-yellow-400' },
      error:    { text: 'Error',      color: 'text-red-400' }
    };
    const s = map[state] || map.error;
    dataStatusEl.textContent = s.text;
    dataStatusEl.className = 'text-xs font-medium ' + s.color + ' hidden sm:inline';
  }

  function flashRefreshBtn(state) {
    if (!refreshBtn) return;
    const icon = refreshBtn.querySelector('.material-symbols-outlined');
    if (!icon) return;

    if (state === 'loading') {
      icon.textContent = 'progress_activity';
      icon.classList.add('animate-spin');
      refreshBtn.disabled = true;
    } else {
      icon.classList.remove('animate-spin');
      refreshBtn.disabled = false;

      if (state === 'success') {
        icon.textContent = 'check_circle';
        icon.classList.add('text-green-400');
        setTimeout(() => {
          icon.textContent = 'refresh';
          icon.classList.remove('text-green-400');
        }, 2000);
      } else if (state === 'error') {
        icon.textContent = 'error';
        icon.classList.add('text-red-400');
        setTimeout(() => {
          icon.textContent = 'refresh';
          icon.classList.remove('text-red-400');
        }, 3000);
      }
    }
  }

  /* ==========================================================
     RENDER — car grid
     ========================================================== */
  function renderCars() {
    const term = currentSearch.trim().toLowerCase();

    const filtered = allCars.filter(car => {
      const matchBrand = currentFilter === 'All' || car.brand === currentFilter;
      const matchName  = car.name.toLowerCase().includes(term);
      return matchBrand && matchName;
    });

    grid.innerHTML = '';

    if (filtered.length === 0) {
      grid.innerHTML =
        '<p class="col-span-full text-center text-slate-400 py-10">No vehicles found matching your criteria.</p>';
      statusEl.textContent = 'No vehicles found.';
      return;
    }

    statusEl.textContent =
      filtered.length + ' vehicle' + (filtered.length === 1 ? '' : 's') + ' shown.';

    const frag = document.createDocumentFragment();
    filtered.forEach(car => frag.appendChild(buildCard(car)));
    grid.appendChild(frag);
  }

  function buildCard(car) {
    const article = document.createElement('article');
    const isSoldOut = car.stock.toLowerCase().includes('sold');
    article.className =
      'glass-card glass-card--interactive rounded-2xl overflow-hidden group flex flex-col h-full' +
      (isSoldOut ? ' opacity-60' : '');

    const chips = CARD_SPECS.map(s => `
      <div class="bg-white/5 border border-white/10 px-2.5 py-2 rounded-lg flex items-center gap-2">
        <span class="material-symbols-outlined text-[16px] text-blue-400" aria-hidden="true">${s.icon}</span>
        <span class="text-xs font-medium text-slate-200">${escapeHtml(s.value(car))}</span>
      </div>`).join('');

    const stockBadge = buildStockBadge(car.stock);
    const frontImg = car.images.front || '';

    article.innerHTML = `
      <button type="button"
              class="relative h-56 w-full overflow-hidden bg-black/20 text-left"
              data-car-id="${car.id}"
              aria-label="View details for ${escapeHtml(car.name)}">
        ${frontImg
          ? `<img src="${escapeHtml(frontImg)}" alt="${escapeHtml(car.name)} — front view"
                  width="800" height="600" loading="lazy" decoding="async"
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">`
          : `<div class="w-full h-full flex items-center justify-center text-slate-600">
               <span class="material-symbols-outlined text-6xl" aria-hidden="true">directions_car</span>
             </div>`}
        <span class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" aria-hidden="true"></span>
        <span class="absolute top-3 right-3">${stockBadge}</span>
        <span class="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <span class="text-xl font-bold text-white shadow-sm">${escapeHtml(car.name)}</span>
        </span>
      </button>

      <div class="p-5 flex-grow flex flex-col justify-between">
        <div class="grid grid-cols-2 gap-2 mb-6">${chips}</div>

        <div class="flex gap-2">
          <button type="button" data-car-id="${car.id}"
                  class="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-colors">
            Details
          </button>
          <a href="tel:${CONFIG.contact.phone1}"
             class="flex-1 py-2.5 rounded-xl border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-1">
            <span class="material-symbols-outlined text-[18px]" aria-hidden="true">call</span>
            Call
          </a>
        </div>
      </div>
    `;

    return article;
  }

  function buildStockBadge(stock) {
    const s = (stock || '').toLowerCase();
    let cls = 'bg-green-500/20 text-green-300 border-green-500/40';
    let icon = 'check_circle';

    if (s.includes('pre') || s.includes('order')) {
      cls = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      icon = 'schedule';
    } else if (s.includes('sold')) {
      cls = 'bg-red-500/20 text-red-300 border-red-500/40';
      icon = 'cancel';
    }

    return `
      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium backdrop-blur-md ${cls}">
        <span class="material-symbols-outlined text-[14px]" aria-hidden="true">${icon}</span>
        ${escapeHtml(stock || 'In Stock')}
      </span>`;
  }

  /* ==========================================================
     MODAL
     ========================================================== */
  const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

  function openModal(id) {
    const car = allCars.find(c => c.id === id);
    if (!car) return;

    lastFocused = document.activeElement;

    modalTitle.textContent = car.name;

    // Stock badge
    modalStock.innerHTML = buildStockBadge(car.stock);

    // Description
    if (car.description) {
      modalDesc.textContent = car.description;
      modalDesc.classList.remove('hidden');
    } else {
      modalDesc.classList.add('hidden');
    }

    // Specs
    modalSpecs.innerHTML = MODAL_SPECS.map((s, i) => `
      <li class="flex justify-between items-center ${i < MODAL_SPECS.length - 1 ? 'border-b border-white/5 pb-3' : ''}">
        <span class="text-slate-400 flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]" aria-hidden="true">${s.icon}</span>
          ${s.label}
        </span>
        <span class="text-white font-medium text-right ml-2">${escapeHtml(s.value(car))}</span>
      </li>`).join('');

    // Images
    setMainImage(car.images.front, 'Front View', car.name);

    modalThumbs.innerHTML = '';
    VIEWS.forEach((view, index) => {
      const url = car.images[view.key];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className =
        'flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ' +
        (index === 0 ? 'border-blue-500' : 'border-transparent opacity-60 hover:opacity-100');
      btn.setAttribute('aria-label', car.name + ' — ' + view.label);
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
        setMainImage(url, view.label, car.name);
      });

      if (url) {
        const img = document.createElement('img');
        img.src = url;
        img.alt = '';
        img.width = 160;
        img.height = 128;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.className = 'w-full h-full object-cover';
        btn.appendChild(img);
      } else {
        btn.innerHTML = '<div class="w-full h-full flex items-center justify-center text-slate-600"><span class="material-symbols-outlined text-2xl">image</span></div>';
      }

      modalThumbs.appendChild(btn);
    });

    // Show
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
    if (!url) {
      modalMainImg.src = '';
      modalMainImg.alt = carName + ' — no image';
      modalViewLbl.textContent = 'No Image';
      return;
    }
    modalMainImg.classList.add('is-fading');
    setTimeout(() => {
      modalMainImg.src = url;
      modalMainImg.alt = carName + ' — ' + label.toLowerCase();
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

    setTimeout(() => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }, reduceMotion ? 0 : 300);

    if (restoreFocus && lastFocused && document.contains(lastFocused)) {
      lastFocused.focus({ preventScroll: true });
    }
    lastFocused = null;
  }

  /* ==========================================================
     EVENT WIRING
     ========================================================== */
  function wireEvents() {

    // --- Card click (delegated)
    grid.addEventListener('click', e => {
      const trigger = e.target.closest('[data-car-id]');
      if (!trigger) return;
      // "Call" link ကို နှိပ်ရင် modal မဖွင့်ပါနဲ့
      if (e.target.closest('a[href^="tel:"]')) return;
      openModal(Number(trigger.getAttribute('data-car-id')));
    });

    // --- Search (debounced)
    let searchTimer = null;
    searchInput.addEventListener('input', e => {
      const value = e.target.value;
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        currentSearch = value;
        renderCars();
      }, 180);
    });

    // --- Filters
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.classList.remove('is-active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.a
