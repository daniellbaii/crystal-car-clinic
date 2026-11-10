/* ==========================================================================
   Crystal Car Clinic: interactions
   Vanilla JS, no dependencies. Motion is reserved for a few deliberate
   moments (hero word glint, price change, ceramic before/after,
   process line, gallery depth). All content is visible without JS, and
   motion is removed for prefers-reduced-motion.
   ========================================================================== */
(() => {
  'use strict';

  /* ---------- Helpers ---------- */
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const reduce = () => mqReduce.matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const mqDesktop = matchMedia('(min-width: 768px)');
  const mqWideProcess = matchMedia('(min-width: 960px)');
  const mqPriceCarousel = matchMedia('(max-width: 959px)');
  const fmt = (n) => '$' + Math.round(n).toLocaleString('en-AU');

  /* ---------- Odometer: each digit rolls through a 0–9 strip to its value.
     Screen readers get the plain value; the rolling strips are hidden from them. ---------- */
  function createOdometer(el) {
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    const vis = document.createElement('span');
    vis.className = 'odo';
    vis.setAttribute('aria-hidden', 'true');
    el.textContent = '';
    el.append(sr, vis);
    let shape = null; // digit/symbol pattern, e.g. "$d,ddd"; rebuild only when it changes
    const build = (str) => {
      vis.textContent = '';
      // zero-width anchor gives the row a real text baseline (clipped columns don't have one)
      const anchor = document.createElement('span');
      anchor.className = 'odo-sym';
      anchor.textContent = '​';
      vis.appendChild(anchor);
      [...str].forEach((ch) => {
        if (/\d/.test(ch)) {
          const col = document.createElement('span');
          col.className = 'odo-col';
          const strip = document.createElement('span');
          strip.className = 'odo-strip';
          for (let d = 0; d <= 9; d++) { const s = document.createElement('span'); s.textContent = d; strip.appendChild(s); }
          col.appendChild(strip);
          vis.appendChild(col);
        } else {
          const s = document.createElement('span');
          s.className = 'odo-sym';
          s.textContent = ch;
          vis.appendChild(s);
        }
      });
    };
    return {
      set(str, animate = true) {
        sr.textContent = str;
        const nextShape = str.replace(/\d/g, 'd');
        const rebuilt = nextShape !== shape;
        if (rebuilt) { build(str); shape = nextShape; }
        const digits = [...str].filter((c) => /\d/.test(c)).map(Number);
        $$('.odo-strip', vis).forEach((strip, i) => {
          const target = `translateY(${-digits[i] * 10}%)`;
          if (!animate || reduce()) {
            strip.style.transition = 'none';
            strip.style.transform = target;
            void strip.offsetWidth;
            strip.style.transition = '';
            return;
          }
          strip.style.transitionDelay = `${i * 45}ms`;
          if (rebuilt) requestAnimationFrame(() => requestAnimationFrame(() => { strip.style.transform = target; })); // roll up from 0
          else strip.style.transform = target;
        });
      },
    };
  }

  /* ---------- Business data (edit prices / zones here) ---------- */
  const SIZES = ['Hatch / small car', 'Sedan / small SUV', 'Large SUV / 4WD / ute', 'Van / 7-seater'];
  const PACKAGES = {
    wash:      { name: 'Crystal Wash',          prices: [129, 149, 169, 189] },
    signature: { name: 'Signature Detail',      prices: [349, 389, 439, 489] },
    enhance:   { name: 'Paint Enhancement',     prices: [649, 729, 819, 899] },
    ceramic2:  { name: 'Crystal Shield 2-Year', prices: [990, 1090, 1190, 1290] },
    ceramic5:  { name: 'Crystal Shield 5-Year', prices: [1490, 1640, 1790, 1940] },
    ceramic9:  { name: 'Crystal Shield 9-Year', prices: [2190, 2390, 2590, 2790] },
  };
  const ADDONS = {
    engine:     { name: 'Engine bay detail',     price: 69 },
    headlights: { name: 'Headlight restoration', price: 119 },
    pet:        { name: 'Pet hair removal',      price: 49 },
    odour:      { name: 'Odour elimination',     price: 89 },
    glass:      { name: 'Glass ceramic coating', price: 129 },
    wheels:     { name: 'Wheel ceramic coating', price: 149 },
  };
  const ZONES = {
    1: { fee: 0,  label: 'Zone 1 · free travel' },
    2: { fee: 25, label: 'Zone 2 · +$25 travel' },
    3: { fee: 45, label: 'Zone 3 · +$45 travel' },
  };
  const SUBURBS = {
    // Generated from drive times out of Willetton (see README "Service area"): <20 min, 20–40 min, 40–60 min
    1: ['Alfred Cove', 'Applecross', 'Ardross', 'Attadale', 'Atwell', 'Aubin Grove', 'Bateman', 'Beaconsfield', 'Beckenham', 'Beeliar', 'Belmont', 'Bentley', 'Bibra Lake', 'Bicton', 'Booragoon', 'Brentwood', 'Bull Creek', 'Burswood', 'Canning Vale', 'Cannington', 'Carlisle', 'Champion Lakes', 'Cloverdale', 'Cockburn Central', 'Como', 'Coolbellup', 'East Cannington', 'East Fremantle', 'East Victoria Park', 'Ferndale', 'Forrestdale', 'Forrestfield', 'Fremantle', 'Gosnells', 'Hamilton Hill', 'Hammond Park', 'Harrisdale', 'Haynes', 'High Wycombe', 'Hilton', 'Huntingdale', 'Jandakot', 'Karawara', 'Kardinya', 'Kensington', 'Kenwick', 'Kewdale', 'Lake Coogee', 'Langford', 'Lathlain', 'Leederville', 'Leeming', 'Lynwood', 'Maddington', 'Manning', 'Melville', 'Mount Pleasant', 'Murdoch', 'Myaree', 'North Fremantle', 'North Lake', 'North Perth', 'Northbridge', 'O\'Connor', 'Orange Grove', 'Palmyra', 'Parkwood', 'Perth', 'Perth Airport', 'Piara Waters', 'Queens Park', 'Redcliffe', 'Riverton', 'Rivervale', 'Rossmoyne', 'Salter Point', 'Samson', 'Seville Grove', 'Shelley', 'South Fremantle', 'South Lake', 'South Perth', 'Southern River', 'Spearwood', 'St James', 'Subiaco', 'Success', 'Thornlie', 'Treeby', 'Victoria Park', 'Waterford', 'Wattle Grove', 'Wattleup', 'Welshpool', 'West Leederville', 'West Perth', 'White Gum Valley', 'Willagee', 'Willetton', 'Wilson', 'Winthrop', 'Yangebup'],
    2: ['Alexander Heights', 'Anketell', 'Armadale', 'Ascot', 'Ashfield', 'Aveley', 'Balcatta', 'Baldivis', 'Balga', 'Ballajura', 'Banjup', 'Baskerville', 'Bassendean', 'Bayswater', 'Bedford', 'Bedfordale', 'Beechboro', 'Beldon', 'Belhus', 'Bellevue', 'Bennett Springs', 'Bertram', 'Bickley', 'Boya', 'Brabham', 'Brookdale', 'Bushmead', 'Byford', 'Calista', 'Camillo', 'Canning Mills', 'Cardup', 'Carine', 'Carmel', 'Casuarina', 'Caversham', 'Churchlands', 'City Beach', 'Claremont', 'Connolly', 'Coogee', 'Coolbinia', 'Cooloongup', 'Cottesloe', 'Craigie', 'Crawley', 'Cullacabardee', 'Currambine', 'Daglish', 'Dalkeith', 'Darch', 'Darling Downs', 'Darlington', 'Dayton', 'Dianella', 'Doubleview', 'Duncraig', 'East Perth', 'East Rockingham', 'Eden Hill', 'Edgewater', 'Ellenbrook', 'Embleton', 'Floreat', 'Girrawheen', 'Glen Forrest', 'Glendalough', 'Gnangara', 'Gooseberry Hill', 'Greenmount', 'Greenwood', 'Guildford', 'Gwelup', 'Hacketts Gully', 'Hamersley', 'Hazelmere', 'Heathridge', 'Helena Valley', 'Henderson', 'Henley Brook', 'Herdsman', 'Herne Hill', 'Highgate', 'Hilbert', 'Hillarys', 'Hillman', 'Hocking', 'Hope Valley', 'Hovea', 'Inglewood', 'Innaloo', 'Jane Brook', 'Jolimont', 'Joondalup', 'Joondanna', 'Kalamunda', 'Kallaroo', 'Karragullen', 'Karrakatta', 'Karrinyup', 'Kelmscott', 'Kiara', 'Kings Park', 'Kingsley', 'Koondoola', 'Koongamia', 'Kwinana Beach', 'Kwinana Town Centre', 'Landsdale', 'Leda', 'Lesmurdie', 'Lexia', 'Lockridge', 'Madeley', 'Mahogany Creek', 'Maida Vale', 'Malaga', 'Mandogalup', 'Marangaroo', 'Mardella', 'Marmion', 'Martin', 'Maylands', 'Medina', 'Menora', 'Middle Swan', 'Midland', 'Midvale', 'Millendon', 'Mirrabooka', 'Morley', 'Mosman Park', 'Mount Claremont', 'Mount Hawthorn', 'Mount Lawley', 'Mount Nasura', 'Mount Richon', 'Mullaloo', 'Mundaring', 'Mundijong', 'Munster', 'Naval Base', 'Nedlands', 'Nollamara', 'Noranda', 'North Beach', 'North Coogee', 'Oakford', 'Ocean Reef', 'Oldbury', 'Orelia', 'Osborne Park', 'Padbury', 'Parkerville', 'Parmelia', 'Pearsall', 'Peppermint Grove', 'Peron', 'Piesse Brook', 'Postans', 'Rockingham', 'Roleystone', 'Safety Bay', 'Sawyers Valley', 'Scarborough', 'Shenton Park', 'Shoalwater', 'Sorrento', 'South Guildford', 'Stirling', 'Stoneville', 'Stratton', 'Swan View', 'Swanbourne', 'The Spectacles', 'Trigg', 'Tuart Hill', 'Upper Swan', 'Viveash', 'Waikiki', 'Walliston', 'Wandi', 'Wangara', 'Warnbro', 'Warwick', 'Watermans Bay', 'Wellard', 'Wembley', 'Wembley Downs', 'West Swan', 'Westminster', 'Whitby', 'Whiteman', 'Woodbridge', 'Woodlands', 'Woodvale', 'Wungong', 'Yokine'],
    3: ['Alkimos', 'Ashby', 'Ashendon', 'Banksia Grove', 'Barragup', 'Beechina', 'Brigadoon', 'Bullsbrook', 'Burns Beach', 'Butler', 'Carabooda', 'Carramar', 'Chidlow', 'Clarkson', 'Coodanup', 'Dudley Park', 'Eglinton', 'Erskine', 'Falcon', 'Furnissdale', 'Gidgegannup', 'Golden Bay', 'Greenfields', 'Halls Head', 'Hopeland', 'Iluka', 'Jandabup', 'Jarrahdale', 'Jindalee', 'Karnup', 'Karrakup', 'Keysbrook', 'Kinross', 'Lakelands', 'Madora Bay', 'Mandurah', 'Mariginiup', 'Meadow Springs', 'Melaleuca', 'Merriwa', 'Mindarie', 'Morangup', 'Mount Helena', 'Muchea', 'Nambeelup', 'Neerabup', 'North Dandalup', 'North Yunderup', 'Nowergup', 'Parklands', 'Paulls Valley', 'Pickering Brook', 'Pinjar', 'Pinjarra', 'Port Kennedy', 'Quinns Rocks', 'Ravenswood', 'Red Hill', 'Ridgewood', 'San Remo', 'Secret Harbour', 'Serpentine', 'Silver Sands', 'Sinagra', 'Singleton', 'South Yunderup', 'Stake Hill', 'Tamala Park', 'Tapping', 'The Vines', 'Wanneroo', 'Wooroloo', 'Woottating', 'Yanchep'],
  };
  const ZONE_OF = new Map();
  const SUBURB_NAMES = [];
  Object.entries(SUBURBS).forEach(([z, list]) => list.forEach((s) => { ZONE_OF.set(s.toLowerCase(), +z); SUBURB_NAMES.push(s); }));

  /* ---------- Shared state ---------- */
  const header = $('[data-header]');
  const progressBar = $('[data-progress]');
  const heroMedia = $('[data-parallax]');
  const mobileCta = $('[data-mobile-cta]');
  const galleryImgs = $$('[data-g-parallax]');
  let menuOpen = false;

  /* ==========================================================================
     Scroll loop: header state, progress, hero + gallery depth, process line
     ========================================================================== */
  let ticking = false;

  function onFrame() {
    ticking = false;
    const y = window.scrollY;
    const vh = innerHeight;

    header.classList.toggle('is-scrolled', y > 40); // header stays put (sticky); it only gains a backdrop

    const max = document.documentElement.scrollHeight - vh;
    progressBar.style.transform = `scaleX(${max > 0 ? clamp(y / max, 0, 1) : 0})`;

    const motionOk = !reduce() && mqDesktop.matches;
    if (heroMedia && motionOk && finePointer && y < vh * 1.2) {
      heroMedia.style.transform = `translate3d(0, ${y * 0.22}px, 0)`;
    }
    // Gallery: each photo drifts slightly within its frame (depth, not decoration)
    if (motionOk) {
      galleryImgs.forEach((img) => {
        const r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const p = clamp((r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2), -1, 1);
        img.style.transform = `translate3d(0, ${(-p * r.height * 0.06).toFixed(1)}px, 0)`;
      });
    }

    updateProcess();
    updateMobileCta(y);
  }
  const requestFrame = () => { if (!ticking) { ticking = true; requestAnimationFrame(onFrame); } };
  window.addEventListener('scroll', requestFrame, { passive: true });
  window.addEventListener('resize', requestFrame, { passive: true });

  /* ==========================================================================
     Mobile menu
     ========================================================================== */
  const navToggle = $('[data-nav-toggle]');
  const menu = $('[data-mobile-menu]');
  $$('nav a', menu).forEach((a, i) => a.style.setProperty('--i', i));

  function openMenu() {
    menuOpen = true;
    menu.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close menu');
    document.body.classList.add('is-locked');
    header.classList.add('menu-active');
    mobileCta && mobileCta.classList.remove('is-visible');
  }
  function closeMenu(returnFocus = true) {
    if (!menuOpen) return;
    menuOpen = false;
    menu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('is-locked');
    header.classList.remove('menu-active');
    setTimeout(() => { if (!menuOpen) menu.hidden = true; }, 340);
    if (returnFocus) navToggle.focus();
  }
  navToggle.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (!menuOpen) return;
    if (e.key === 'Escape') { closeMenu(); return; }
    if (e.key === 'Tab') { // focus trap: toggle + menu links
      const items = [navToggle, ...$$('a', menu)];
      const i = items.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
      else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
      else if (i === -1) { e.preventDefault(); items[0].focus(); }
    }
  });
  matchMedia('(min-width: 1100px)').addEventListener('change', (e) => { if (e.matches) closeMenu(false); });

  /* ==========================================================================
     Hero: text and photo paint immediately (fast LCP). Once the photo has
     decoded, the photo settles into place and "clarity," glints once.
     ========================================================================== */
  const hero = $('.hero');
  const heroImg = $('[data-hero-img]');
  let heroStarted = false;
  const startHero = () => { if (heroStarted) return; heroStarted = true; hero.classList.add('is-loaded'); };
  if (!heroImg || heroImg.complete) requestAnimationFrame(startHero);
  else {
    heroImg.addEventListener('load', startHero, { once: true });
    heroImg.addEventListener('error', startHero, { once: true });
    setTimeout(startHero, 2500);
  }

  /* ==========================================================================
     Logo: a highlight runs along each facet. Once on load, then on mouse hover
     or keyboard focus only (never on click or tap).
     ========================================================================== */
  const brands = $$('.brand');
  const glintLogo = (b) => {
    if (reduce()) return;
    b.classList.remove('is-glinting');
    void b.getBoundingClientRect();
    b.classList.add('is-glinting');
  };
  brands.forEach((b) => {
    b.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') glintLogo(b); });
    b.addEventListener('focus', () => { if (b.matches(':focus-visible')) glintLogo(b); }); // keyboard focus, not a mouse click
  });
  if (brands[0]) setTimeout(() => glintLogo(brands[0]), 700);

  /* ==========================================================================
     Glint words ("clarity," + the section-title words).
     Desktop: when the cursor comes within ~220px, a highlight fades in and
     eases along the word to follow it; it fades out as the cursor leaves.
     Touch: each section word sweeps once when its heading is well into view.
     ========================================================================== */
  const glintWords = $$('[data-glint]');
  if (glintWords.length && !reduce()) {
    if (finePointer) {
      const RADIUS = 220;
      const words = glintWords.map((el) => ({ el, gx: -40, gi: 0, tx: -40, ti: 0, onScreen: true }));
      let px = -1e5, py = -1e5, raf = 0;
      const tick = () => {
        raf = 0;
        let moving = false;
        words.forEach((w) => {
          if (!w.onScreen && w.gi < 0.005) return;
          const r = w.el.getBoundingClientRect();
          const dx = px < r.left ? r.left - px : px > r.right ? px - r.right : 0;
          const dy = py < r.top ? r.top - py : py > r.bottom ? py - r.bottom : 0;
          const near = clamp(1 - Math.hypot(dx, dy) / RADIUS, 0, 1);
          w.ti = near * near * (3 - 2 * near); // smoothstep: gentle at the edge, full over the word
          if (w.ti > 0) w.tx = clamp(((px - r.left) / r.width) * 100, -35, 135);
          w.gx += (w.tx - w.gx) * 0.2;
          w.gi += (w.ti - w.gi) * 0.14;
          w.el.style.setProperty('--gx', `${w.gx.toFixed(1)}%`);
          w.el.style.setProperty('--gi', w.gi.toFixed(3));
          if (Math.abs(w.tx - w.gx) > 0.3 || Math.abs(w.ti - w.gi) > 0.004) moving = true;
        });
        if (moving) raf = requestAnimationFrame(tick);
      };
      const schedule = () => { if (!raf) raf = requestAnimationFrame(tick); };
      window.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse') return;
        px = e.clientX;
        py = e.clientY;
        schedule();
      }, { passive: true });
      // Words move under a still cursor while scrolling; the cursor leaving the window fades them out
      window.addEventListener('scroll', () => { if (px > -1e4) schedule(); }, { passive: true });
      document.documentElement.addEventListener('mouseleave', () => { px = py = -1e5; schedule(); });
      if ('IntersectionObserver' in window) {
        const gio = new IntersectionObserver((entries) => entries.forEach((e) => {
          const w = words.find((x) => x.el === e.target);
          if (w) w.onScreen = e.isIntersecting;
        }));
        glintWords.forEach((el) => gio.observe(el));
      }
    } else if ('IntersectionObserver' in window) {
      const sio = new IntersectionObserver((entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-sweep');
        sio.unobserve(e.target);
      }), { rootMargin: '0px 0px -40% 0px', threshold: 0 }); // fires as the word's top crosses ~60% up the screen
      glintWords.filter((el) => !el.classList.contains('shine')).forEach((el) => sio.observe(el));
    }
  }

  /* ==========================================================================
     Pointer light on pricing cards + magnetic primary buttons (desktop only)
     ========================================================================== */
  if (finePointer) {
    $$('[data-spotlight]').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
    if (!reduce()) {
      $$('[data-magnetic]').forEach((btn) => {
        btn.addEventListener('pointermove', (e) => {
          const r = btn.getBoundingClientRect();
          const x = (e.clientX - (r.left + r.width / 2)) * 0.22;
          const y = (e.clientY - (r.top + r.height / 2)) * 0.35;
          btn.style.translate = `${clamp(x, -10, 10)}px ${clamp(y, -6, 6)}px`;
        });
        btn.addEventListener('pointerleave', () => { btn.style.translate = ''; });
      });
    }
  }

  /* ==========================================================================
     Package prices: vehicle size switch
     ========================================================================== */
  const sizeSwitch = $('[data-size-switch]');
  const pill = sizeSwitch && $('.size-pill', sizeSwitch);
  let viewSize = 1;
  let pillAt = null;
  // (3) Rolling price digits
  const priceOdos = $$('[data-price]').map((el) => ({ el, odo: createOdometer(el) }));

  // (4) Liquid pill: stretches toward the chosen size, overshoots slightly, settles
  function movePill(to, animate) {
    if (!pill) return;
    const from = pillAt;
    pillAt = to;
    const end = `translateX(${to * 100}%)`;
    pill.getAnimations().forEach((a) => a.cancel());
    pill.style.transform = end;
    if (!animate || reduce() || from === null || from === to) return;
    const dist = Math.abs(to - from);
    const mid = (from + to) / 2;
    pill.animate([
      { transform: `translateX(${from * 100}%) scaleX(1)` },
      { transform: `translateX(${mid * 100}%) scaleX(${1 + dist * 0.6})`, offset: 0.42 },
      { transform: `translateX(${to * 100}%) scaleX(0.9)`, offset: 0.76 },
      { transform: `translateX(${to * 100}%) scaleX(1.04)`, offset: 0.9 },
      { transform: end },
    ], { duration: 480 + dist * 70, easing: 'cubic-bezier(.45,.05,.25,1)' });
  }

  function setViewSize(idx, animate) {
    viewSize = idx;
    movePill(idx, animate);
    priceOdos.forEach(({ el, odo }) => odo.set(el.dataset.prices.split(',')[idx], animate));
  }
  if (sizeSwitch) {
    sizeSwitch.addEventListener('change', (e) => setViewSize(+e.target.value, true));
    const checked = $('input:checked', sizeSwitch);
    if (checked) setViewSize(+checked.value, false);
  }

  /* ==========================================================================
     Package cards on phones: swipeable, with a pager
     ========================================================================== */
  const priceTrack = $('[data-price-track]');
  const priceDots = $$('[data-price-dots] button');
  if (priceTrack && priceDots.length) {
    const cards = $$('.price-card', priceTrack);
    const offsetFor = (card) => {
      const tr = priceTrack.getBoundingClientRect();
      const cr = card.getBoundingClientRect();
      return cr.left - tr.left + priceTrack.scrollLeft - (priceTrack.clientWidth - cr.width) / 2;
    };
    const setActive = (i) => priceDots.forEach((d, k) => d.setAttribute('aria-current', String(k === i)));
    priceDots.forEach((dot, i) => dot.addEventListener('click', () => {
      priceTrack.scrollTo({ left: offsetFor(cards[i]), behavior: reduce() ? 'auto' : 'smooth' });
      setActive(i);
    }));
    let raf = 0;
    priceTrack.addEventListener('scroll', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const mid = priceTrack.getBoundingClientRect().left + priceTrack.clientWidth / 2;
        let best = 0, bestD = Infinity;
        cards.forEach((c, i) => {
          const r = c.getBoundingClientRect();
          const d = Math.abs(r.left + r.width / 2 - mid);
          if (d < bestD) { bestD = d; best = i; }
        });
        setActive(best);
      });
    }, { passive: true });
    // Open on the most popular package
    const featured = cards.findIndex((c) => c.classList.contains('is-featured'));
    const initCarousel = () => {
      if (!mqPriceCarousel.matches) return;
      priceTrack.scrollLeft = offsetFor(cards[featured]);
      setActive(featured);
    };
    initCarousel();
    mqPriceCarousel.addEventListener('change', initCarousel);
  }

  /* ==========================================================================
     Ceramic before / after
     ========================================================================== */
  const compare = $('[data-compare]');
  const compareRange = $('[data-compare-range]');
  if (compare && compareRange) {
    let touched = false;
    let dragging = false;
    let startX = 0, startY = 0, pointerType = 'mouse';
    const setPos = (v) => { compare.style.setProperty('--pos', `${v}%`); compareRange.value = Math.round(v); };
    const fromEvent = (e) => {
      const r = compare.getBoundingClientRect();
      return clamp(((e.clientX - r.left) / r.width) * 100, 0, 100);
    };

    // Keyboard / assistive tech: the native range input
    compareRange.addEventListener('input', () => { touched = true; setPos(+compareRange.value); });
    compareRange.style.pointerEvents = 'none';

    // Mouse moves immediately; touch waits for horizontal intent so vertical scrolling is never hijacked
    compare.addEventListener('pointerdown', (e) => {
      touched = true;
      pointerType = e.pointerType;
      startX = e.clientX; startY = e.clientY;
      if (pointerType === 'mouse') {
        e.preventDefault(); // no native image drag or text selection stealing the gesture
        dragging = true;
        compare.classList.add('is-dragging');
        setPos(fromEvent(e));
        try { compare.setPointerCapture(e.pointerId); } catch (err) { /* pointer already released */ }
      }
    });
    compare.addEventListener('pointermove', (e) => {
      if (!dragging && pointerType !== 'mouse' && e.buttons !== 0) {
        if (Math.abs(e.clientX - startX) > 6 && Math.abs(e.clientX - startX) > Math.abs(e.clientY - startY)) {
          dragging = true;
          compare.classList.add('is-dragging');
          try { compare.setPointerCapture(e.pointerId); } catch (err) { /* pointer already released */ }
        }
      }
      if (dragging) setPos(fromEvent(e));
    });
    const end = (e) => {
      if (!dragging && pointerType !== 'mouse' && e.type === 'pointerup' && Math.abs(e.clientX - startX) < 6 && Math.abs(e.clientY - startY) < 6) {
        setPos(fromEvent(e)); // a tap jumps the divider
      }
      dragging = false;
      compare.classList.remove('is-dragging');
    };
    compare.addEventListener('pointerup', end);
    compare.addEventListener('pointercancel', end);
    compare.addEventListener('dragstart', (e) => e.preventDefault()); // the photos are never draggable

    // One-time hint that the divider can be dragged
    if ('IntersectionObserver' in window && !reduce()) {
      const hio = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        hio.disconnect();
        setTimeout(() => {
          if (touched) return;
          const keys = [[0, 50], [0.35, 24], [0.75, 74], [1, 50]];
          const dur = 2800;
          const t0 = performance.now();
          const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
          const tick = (t) => {
            if (touched) return; // user interaction always wins
            const p = clamp((t - t0) / dur, 0, 1);
            let k = 0;
            while (k < keys.length - 2 && p > keys[k + 1][0]) k++;
            const [p0, v0] = keys[k];
            const [p1, v1] = keys[k + 1];
            setPos(v0 + (v1 - v0) * ease(clamp((p - p0) / (p1 - p0), 0, 1)));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }, 600);
      }, { threshold: 0.5 });
      hio.observe(compare);
    }
  }

  /* ==========================================================================
     Process timeline: progress line + lit steps
     ========================================================================== */
  const processTrack = $('[data-process]');
  const processFill = $('[data-process-fill]');
  const processSteps = $$('.process-step');
  function updateProcess() {
    if (!processTrack) return;
    const r = processTrack.getBoundingClientRect();
    const vh = innerHeight;
    if (mqWideProcess.matches) {
      const p = clamp((vh * 0.85 - r.top) / (vh * 0.45), 0, 1);
      processFill.style.transform = `scaleX(${p})`;
      processSteps.forEach((s, i) => s.classList.toggle('is-lit', p >= i / (processSteps.length - 1) - 0.02));
    } else {
      const p = clamp((vh * 0.65 - r.top) / r.height, 0, 1);
      processFill.style.transform = `scaleY(${p})`;
      processSteps.forEach((s) => s.classList.toggle('is-lit', p * r.height >= s.offsetTop - 4));
    }
  }

  /* ==========================================================================
     Reviews: one pull quote at a time, user-controlled (no auto-rotation)
     ========================================================================== */
  const tWrap = $('[data-testimonials]');
  const tNav = $('[data-testimonials-nav]');
  if (tWrap && tNav) {
    const items = $$('.testimonial', tWrap);
    const idxEl = $('[data-t-index]', tNav);
    $('[data-t-total]', tNav).textContent = String(items.length).padStart(2, '0');
    let current = 0;
    const show = (i) => {
      current = (i + items.length) % items.length;
      items.forEach((it, k) => {
        const on = k === current;
        it.classList.toggle('is-active', on);
        it.setAttribute('aria-hidden', String(!on));
      });
      idxEl.textContent = String(current + 1).padStart(2, '0');
    };
    tWrap.classList.add('is-enhanced');
    tWrap.setAttribute('aria-live', 'polite');
    tNav.hidden = false;
    show(0);
    $('[data-t-prev]', tNav).addEventListener('click', () => show(current - 1));
    $('[data-t-next]', tNav).addEventListener('click', () => show(current + 1));
    let sx = 0, sy = 0;
    tWrap.addEventListener('pointerdown', (e) => { sx = e.clientX; sy = e.clientY; });
    tWrap.addEventListener('pointerup', (e) => {
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (e.pointerType !== 'mouse' && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(current + (dx < 0 ? 1 : -1));
    });
  }

  /* ==========================================================================
     (8) Nav: one underline slides to the active section, or previews the
     hovered / focused link, then returns
     ========================================================================== */
  const nav = $('.nav');
  const navLinks = $$('.nav a');
  if (nav && navLinks.length) {
    const ind = document.createElement('span');
    ind.className = 'nav-indicator';
    ind.setAttribute('aria-hidden', 'true');
    nav.appendChild(ind);
    let navActive = null;
    let navHover = null;
    let shown = false;
    const place = (link) => {
      if (!link || !link.offsetWidth) { ind.style.opacity = '0'; shown = false; return; }
      const pad = parseFloat(getComputedStyle(link).paddingLeft) || 0;
      const x = link.offsetLeft + pad;
      const w = Math.max(0, link.offsetWidth - pad * 2);
      if (!shown) { // grow in place rather than sliding in from the left edge
        ind.style.transition = 'none';
        ind.style.transform = `translateX(${x}px) scaleX(0)`;
        void ind.offsetWidth;
        ind.style.transition = '';
      }
      shown = true;
      ind.style.opacity = '1';
      ind.style.transform = `translateX(${x}px) scaleX(${w / 100})`;
    };
    const refresh = () => place(navHover || navActive);
    navLinks.forEach((a) => {
      a.addEventListener('pointerenter', () => { navHover = a; refresh(); });
      a.addEventListener('focus', () => { navHover = a; refresh(); });
      a.addEventListener('blur', () => { navHover = null; refresh(); });
    });
    nav.addEventListener('pointerleave', () => { navHover = null; refresh(); });
    window.addEventListener('resize', refresh, { passive: true });

    if ('IntersectionObserver' in window) {
      const map = new Map(navLinks.map((a) => [a.getAttribute('href').slice(1), a]));
      const nio = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          const link = map.get(e.target.id);
          if (!link) return;
          if (e.isIntersecting) {
            navLinks.forEach((l) => l.classList.remove('is-active'));
            link.classList.add('is-active');
            navActive = link;
          } else {
            link.classList.remove('is-active');
            if (navActive === link) navActive = null;
          }
        });
        refresh();
      }, { rootMargin: '-45% 0px -50% 0px' });
      map.forEach((_, id) => { const sec = document.getElementById(id); if (sec) nio.observe(sec); });
    }
  }

  /* ==========================================================================
     Section labels: the facet glints once, after the section has properly
     arrived (label ~40% of the way up the screen), not as it peeks in
     ========================================================================== */
  if ('IntersectionObserver' in window && !reduce()) {
    const kio = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-glint');
      kio.unobserve(e.target);
    }), { rootMargin: '0px 0px -40% 0px', threshold: 1 });
    $$('main .kicker').forEach((k) => kio.observe(k));
  }

  /* ==========================================================================
     (7) Desktop: phone and email links copy to the clipboard with a
     confirmation (desktops rarely have a dialler). Touch devices are unchanged.
     ========================================================================== */
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);
  let toastTimer = 0;
  function showToast(msg) {
    toast.innerHTML = '<span class="toast-icon" aria-hidden="true"><svg class="icon"><use href="#i-check"/></svg></span><span></span>';
    toast.lastChild.textContent = msg;
    toast.classList.remove('is-visible');
    void toast.offsetWidth;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2800);
  }
  const prettyPhone = (href) => {
    let d = href.replace(/^tel:/, '').replace(/\D/g, '');
    if (d.startsWith('61')) d = '0' + d.slice(2);
    return d.length === 10 ? `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}` : d;
  };
  if (finePointer && navigator.clipboard && window.isSecureContext) {
    $$('a[href^="tel:"], a[href^="mailto:"]').forEach((a) => {
      const href = a.getAttribute('href');
      const isTel = href.startsWith('tel:');
      const value = isTel ? prettyPhone(href) : decodeURIComponent(href.slice(7).split('?')[0]);
      a.dataset.copy = '';
      a.title = isTel ? `Click to copy ${value}` : `Click to copy ${value}`;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        navigator.clipboard.writeText(value)
          .then(() => showToast(isTel ? `Number copied: ${value}` : `Email copied: ${value}`))
          .catch(() => { window.location.href = href; }); // fall back to the normal link
      });
    });
  }

  /* ==========================================================================
     Mobile sticky CTA: show after the hero, hide near the quote form / footer
     ========================================================================== */
  const quoteSection = $('#quote');
  const footer = $('.site-footer');
  let ctaBlocked = false;
  if ('IntersectionObserver' in window && mobileCta) {
    const blockers = new Set();
    const bio = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? blockers.add(e.target) : blockers.delete(e.target)));
      ctaBlocked = blockers.size > 0;
      updateMobileCta(window.scrollY);
    });
    [quoteSection, footer].forEach((el) => el && bio.observe(el));
  }
  function updateMobileCta(y) {
    if (!mobileCta) return;
    mobileCta.classList.toggle('is-visible', y > innerHeight * 0.7 && !ctaBlocked && !menuOpen);
  }

  /* ==========================================================================
     Gallery lightbox (native <dialog>)
     ========================================================================== */
  const lightbox = $('[data-lightbox]');
  const galleryBtns = $$('[data-gallery] .g-btn');
  if (lightbox && galleryBtns.length && typeof lightbox.showModal === 'function') {
    const lbImg = $('[data-lightbox-img]', lightbox);
    const lbCap = $('[data-lightbox-cap]', lightbox);
    let current = 0;
    let opener = null;
    let loadToken = 0;
    let closing = false;

    // Simple fade in: backdrop, controls and photo fade together
    const open = (i) => {
      opener = galleryBtns[i];
      show(i);
      lightbox.showModal();
      document.body.classList.add('is-locked');
      requestAnimationFrame(() => lightbox.classList.add('is-open'));
    };

    // Simple fade out (also used for Esc and clicks outside the photo)
    const close = async () => {
      if (!lightbox.open || closing) return;
      closing = true;
      lightbox.classList.remove('is-open');
      if (!reduce()) await wait(320);
      closing = false;
      lightbox.close();
    };

    const show = (i) => {
      current = (i + galleryBtns.length) % galleryBtns.length;
      const btn = galleryBtns[current];
      const token = ++loadToken;
      lbImg.classList.add('is-loading');
      lbCap.textContent = btn.dataset.caption || '';
      const pre = new Image();
      pre.onload = pre.onerror = () => {
        if (token !== loadToken) return; // a newer image was requested
        lbImg.src = btn.dataset.full;
        lbImg.alt = btn.querySelector('img').alt;
        requestAnimationFrame(() => lbImg.classList.remove('is-loading'));
      };
      pre.src = btn.dataset.full;
    };
    galleryBtns.forEach((btn, i) => btn.addEventListener('click', () => open(i)));
    $('[data-lightbox-close]', lightbox).addEventListener('click', close);
    $('[data-lightbox-prev]', lightbox).addEventListener('click', () => show(current - 1));
    $('[data-lightbox-next]', lightbox).addEventListener('click', () => show(current + 1));
    lightbox.addEventListener('cancel', (e) => { e.preventDefault(); close(); }); // Esc fades out too
    lightbox.addEventListener('close', () => {
      lightbox.classList.remove('is-open');
      closing = false;
      document.body.classList.remove('is-locked');
      opener && opener.focus({ preventScroll: true });
    });
    lightbox.addEventListener('click', (e) => {
      const t = e.target;
      if (t === lightbox || t.classList.contains('lightbox-figure') || t.classList.contains('lightbox-bg')) close();
    });
    lightbox.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') show(current + 1);
      if (e.key === 'ArrowLeft') show(current - 1);
    });
    let sx = 0, sy = 0;
    lightbox.addEventListener('pointerdown', (e) => { sx = e.clientX; sy = e.clientY; });
    lightbox.addEventListener('pointerup', (e) => {
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (e.pointerType !== 'mouse' && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(current + (dx < 0 ? 1 : -1));
    });
  }

  /* ==========================================================================
     Quote wizard + live estimate
     ========================================================================== */
  const form = $('[data-quote]');
  if (form) initQuote(form);

  function initQuote(form) {
    const steps = $$('.step', form);
    const indicators = $$('[data-step-ind]', form);
    const bar = $('[data-steps-bar]', form);
    const btnPrev = $('[data-prev]', form);
    const btnNext = $('[data-next]', form);
    const btnSubmit = $('[data-submit]', form);
    const alertEl = $('[data-form-alert]', form);
    const success = $('[data-success]', form);
    const els = form.elements;
    const N = steps.length;
    let step = 1;

    const est = {
      vehicle: $('[data-est="vehicle"]'),
      package: $('[data-est="package"]'),
      addons: $('[data-est="addons"]'),
      travel: $('[data-est="travel"]'),
      total: $('[data-est-total]'),
      mini: $('[data-est-mini]', form),
      live: $('[data-est-live]'),
    };
    const zoneHint = $('[data-zone-hint]', form);
    const zoneHintDefault = zoneHint ? zoneHint.textContent : '';

    // Suburb suggestions
    const dl = $('[data-suburb-list]', form);
    if (dl) {
      const frag = document.createDocumentFragment();
      [...SUBURB_NAMES].sort((a, b) => a.localeCompare(b)).forEach((s) => {
        const o = document.createElement('option');
        o.value = s;
        frag.appendChild(o);
      });
      dl.appendChild(frag);
    }

    // Earliest preferred date = tomorrow (local time)
    const dateInput = $('[data-min-today]', form);
    if (dateInput) {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      const pad = (n) => String(n).padStart(2, '0');
      dateInput.min = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }

    // Errors are announced when they appear
    $$('[data-error-for]', form).forEach((el) => el.setAttribute('role', 'alert'));

    /* ----- State ----- */
    function getState() {
      const fd = new FormData(form);
      const size = fd.get('vehicle_size');
      const suburb = (fd.get('suburb') || '').toString().trim();
      return {
        size: size === null ? null : +size,
        vehicle: (fd.get('vehicle') || '').toString().trim(),
        pkg: fd.get('package'),
        addons: fd.getAll('addons'),
        suburb,
        zone: ZONE_OF.get(suburb.toLowerCase()) || null,
        date: fd.get('preferred_date'),
        time: fd.get('preferred_time'),
      };
    }
    function totalFor(s) {
      if (s.size === null || !s.pkg) return null;
      let t = PACKAGES[s.pkg].prices[s.size];
      s.addons.forEach((a) => { t += ADDONS[a].price; });
      if (s.zone) t += ZONES[s.zone].fee;
      return t;
    }

    /* ----- Estimate rendering ----- */
    // (3) The estimate totals roll like the package prices
    const totalOdo = createOdometer(est.total);
    const miniOdo = createOdometer(est.mini);
    let liveTimer = 0;
    const setText = (el, text) => {
      if (!el || el.textContent === text) return;
      el.textContent = text;
      if (!reduce()) { el.classList.remove('is-flash'); void el.offsetWidth; el.classList.add('is-flash'); }
    };
    let lastTotal;
    function animateTotal(to) {
      if (to === lastTotal) return;
      lastTotal = to;
      const text = to === null ? '$—' : fmt(to);
      totalOdo.set(text, to !== null);
      miniOdo.set(text, to !== null);
    }
    function render() {
      const s = getState();
      $$('[data-pkg-price]', form).forEach((el) => {
        const p = PACKAGES[el.dataset.pkgPrice].prices;
        el.textContent = s.size === null ? `from ${fmt(p[0])}` : fmt(p[s.size]);
      });
      setText(est.vehicle, s.size === null ? 'Not selected' : SIZES[s.size]);
      setText(est.package, s.pkg ? PACKAGES[s.pkg].name : 'Not selected');
      setText(est.addons, s.addons.length ? s.addons.map((a) => ADDONS[a].name).join(', ') : 'None');
      if (!s.suburb) setText(est.travel, 'Enter your suburb');
      else if (s.zone) setText(est.travel, ZONES[s.zone].fee ? `+${fmt(ZONES[s.zone].fee)}` : 'Free');
      else setText(est.travel, 'To be confirmed');

      if (zoneHint) {
        if (s.zone) { zoneHint.textContent = `${s.suburb}: ${ZONES[s.zone].label}.`; zoneHint.classList.add('is-zone'); }
        else if (s.suburb.length > 2) { zoneHint.textContent = `We’ll confirm travel for ${s.suburb} when we reply.`; zoneHint.classList.remove('is-zone'); }
        else { zoneHint.textContent = zoneHintDefault; zoneHint.classList.remove('is-zone'); }
      }

      const total = totalFor(s);
      animateTotal(total);
      clearTimeout(liveTimer);
      liveTimer = setTimeout(() => {
        if (est.live) est.live.textContent = total === null ? '' : `Estimated total ${fmt(total)}`;
      }, 700);
      return s;
    }

    /* ----- Validation ----- */
    const showError = (name, msg) => {
      const el = $(`[data-error-for="${name}"]`, form);
      if (el) { el.textContent = msg; el.hidden = false; }
      const field = els.namedItem(name);
      if (field && field.setAttribute) field.setAttribute('aria-invalid', 'true');
    };
    const clearError = (name) => {
      const el = $(`[data-error-for="${name}"]`, form);
      if (el) { el.textContent = ''; el.hidden = true; }
      const field = els.namedItem(name);
      if (field && field.removeAttribute) field.removeAttribute('aria-invalid');
    };
    const rules = {
      vehicle_size: () => (getState().size === null ? 'Please choose your vehicle size to continue.' : ''),
      package: () => (!getState().pkg ? 'Please choose a service to continue.' : ''),
      suburb: () => (els.namedItem('suburb').value.trim().length < 2 ? 'Please enter your suburb so we can confirm travel.' : ''),
      name: () => (els.namedItem('name').value.trim().length < 2 ? 'Please enter your name.' : ''),
      phone: () => {
        const v = els.namedItem('phone').value.replace(/[\s()-]/g, '');
        if (!v) return 'Please enter a phone number so we can confirm your booking.';
        return /^(\+?61|0)[2-478]\d{8}$/.test(v) ? '' : 'Please enter a valid Australian number, e.g. 0412 345 678.';
      },
      email: () => {
        const v = els.namedItem('email').value.trim();
        if (!v) return 'Please enter your email address.';
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Please check your email address, e.g. name@example.com.';
      },
    };
    const stepFields = { 1: ['vehicle_size'], 2: ['package'], 3: [], 4: ['suburb'], 5: ['name', 'phone', 'email'] };
    const focusTarget = (name) => {
      const f = els.namedItem(name);
      if (!f) return null;
      return f instanceof RadioNodeList ? f[0] : f;
    };
    function validateStep(n) {
      let first = null;
      stepFields[n].forEach((name) => {
        const msg = rules[name]();
        if (msg) { showError(name, msg); if (!first) first = name; }
        else clearError(name);
      });
      if (first) { const t = focusTarget(first); t && t.focus(); return false; }
      return true;
    }
    ['suburb', 'name', 'phone', 'email'].forEach((name) => {
      const f = els.namedItem(name);
      if (!f) return;
      let dirty = false;
      f.addEventListener('input', () => {
        dirty = true;
        if (f.getAttribute('aria-invalid') === 'true' && !rules[name]()) clearError(name);
      });
      f.addEventListener('blur', () => {
        if (!dirty) return;
        const msg = rules[name]();
        msg ? showError(name, msg) : clearError(name);
      });
    });
    form.addEventListener('change', (e) => {
      if (e.target.name === 'vehicle_size') clearError('vehicle_size');
      if (e.target.name === 'package') clearError('package');
    });

    /* ----- Step navigation ----- */
    function goTo(n, { focus = true } = {}) {
      const prev = step;
      step = clamp(n, 1, N);
      steps.forEach((s) => {
        const k = +s.dataset.step;
        const active = k === step;
        s.hidden = !active;
        s.classList.toggle('is-active', active);
        s.classList.remove('is-entering', 'is-back');
        if (active && prev !== step && !reduce()) {
          void s.offsetWidth;
          s.classList.add('is-entering');
          if (step < prev) s.classList.add('is-back');
        }
      });
      indicators.forEach((li) => {
        const k = +li.dataset.stepInd;
        if (k === step) li.setAttribute('aria-current', 'step');
        else li.removeAttribute('aria-current');
        li.classList.toggle('is-done', k < step);
      });
      bar.style.transform = `scaleX(${step / N})`;
      btnPrev.hidden = step === 1;
      btnNext.hidden = step === N;
      btnSubmit.hidden = step !== N;
      alertEl.hidden = true;
      if (focus) {
        const title = $('.step-title', steps[step - 1]);
        const r = form.getBoundingClientRect();
        if (r.top < 0 || r.top > innerHeight * 0.6) {
          form.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'start' });
        }
        title && title.focus({ preventScroll: true });
      }
    }
    btnNext.addEventListener('click', () => { if (validateStep(step)) goTo(step + 1); });
    btnPrev.addEventListener('click', () => goTo(step - 1));

    // Package buttons around the page pre-fill the wizard
    $$('[data-choose]').forEach((link) => {
      link.addEventListener('click', () => {
        if (form.classList.contains('is-complete')) restart(false);
        const radio = $(`input[name="package"][value="${link.dataset.choose}"]`, form);
        if (radio) radio.checked = true;
        if (link.closest('.price-card')) { // pricing cards carry the size being viewed
          const sizeRadio = $(`input[name="vehicle_size"][value="${viewSize}"]`, form);
          if (sizeRadio) sizeRadio.checked = true;
        }
        clearError('package');
        clearError('vehicle_size');
        render();
        goTo(getState().size === null ? 1 : 3, { focus: false });
      });
    });

    /* ----- Submit ----- */
    function buildSummary(s, total) {
      return [
        `Vehicle: ${s.size === null ? '-' : SIZES[s.size]}${s.vehicle ? ` (${s.vehicle})` : ''}`,
        `Service: ${s.pkg ? PACKAGES[s.pkg].name : '-'}`,
        `Extras: ${s.addons.length ? s.addons.map((a) => ADDONS[a].name).join(', ') : 'None'}`,
        `Suburb: ${s.suburb}${s.zone ? ` (Zone ${s.zone})` : ' (zone to confirm)'}`,
        `Preferred: ${s.date || 'Any date'}, ${s.time || 'Flexible'}`,
        `Estimate: ${total === null ? '-' : fmt(total)}`,
      ].join(' | ');
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (step !== N) { if (validateStep(step)) goTo(step + 1); return; } // Enter key advances
      if (!validateStep(N)) return;

      const s = getState();
      const total = totalFor(s);
      $('[data-hidden-estimate]', form).value = total === null ? '' : fmt(total);
      $('[data-hidden-summary]', form).value = buildSummary(s, total);

      alertEl.hidden = true;
      btnSubmit.classList.add('is-loading');
      btnSubmit.setAttribute('aria-busy', 'true');
      $('.btn-label', btnSubmit).textContent = 'Sending…';

      const demo = form.action.includes('your-form-id');
      try {
        if (demo) {
          await wait(1100);
          console.info('[Crystal Car Clinic] Demo mode: add your Formspree ID to the form action to receive real enquiries.', Object.fromEntries(new FormData(form)));
        } else {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 15000);
          const res = await fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: { Accept: 'application/json' },
            signal: controller.signal,
          });
          clearTimeout(timer);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
        }
        const firstName = els.namedItem('name').value.trim().split(' ')[0] || '';
        $('h3', success).textContent = firstName ? `Thank you, ${firstName}. Your request is in.` : 'Thank you. Your request is in.';
        $('[data-success-summary]', success).textContent = `${s.pkg ? PACKAGES[s.pkg].name : ''} · ${SIZES[s.size]} · ${s.suburb} · Estimated ${total === null ? '' : fmt(total)}`;
        form.classList.add('is-complete');
        success.hidden = false;
        success.focus({ preventScroll: true });
        if (form.getBoundingClientRect().top < 0) form.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'start' });
      } catch (err) {
        alertEl.textContent = 'Sorry, we couldn’t send your request just now. Please try again, or call us on 0491 570 156.';
        alertEl.hidden = false;
      } finally {
        btnSubmit.classList.remove('is-loading');
        btnSubmit.removeAttribute('aria-busy');
        $('.btn-label', btnSubmit).textContent = 'Send my quote request';
      }
    });

    function restart(focus = true) {
      form.reset();
      Object.keys(rules).forEach(clearError);
      form.classList.remove('is-complete');
      success.hidden = true;
      render();
      goTo(1, { focus });
    }
    $('[data-restart]', form).addEventListener('click', () => restart(true));

    form.addEventListener('input', render);
    form.addEventListener('change', render);
    render();
    goTo(1, { focus: false });
  }

  /* ---------- Misc ---------- */
  const year = $('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  onFrame();
})();
