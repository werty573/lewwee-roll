(() => {
  const WA = '18687490503';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const money = n => '$' + n.toLocaleString('en-US');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Stock (real prices from the November stock post, TT$) ---------- */
  const G = 'Gallon (4.73 L)', Q = 'Quart (946 mL)';
  const P = [
    { id: 'msb', brand: 'Mobil', name: 'Mobil Super Synthetic Blend', size: G, type: 'gal', grades: ['5W-30', '10W-30', '10W-40'], tiers: [['Single', 1, 290], ['Case of 3', 3, 810], ['3 cases', 9, 2380]] },
    { id: 'mfs', brand: 'Mobil', name: 'Mobil Full Synthetic', size: G, type: 'gal', grades: ['0W-20', '10W-30'], tiers: [['Single', 1, 370], ['Case of 3', 3, 1050], ['2 cases', 6, 2070]] },
    { id: 'ams', brand: 'AMSOIL', name: 'AMSOIL Synthetic Motor Oil', size: G, type: 'gal', grades: ['0W-20', '5W-30', '10W-30'], tiers: [['Single', 1, 360], ['Case of 3', 3, 1050], ['3 cases', 9, 3015]] },
    { id: 'shu', brand: 'Shell', name: 'Shell Helix Ultra', size: G, type: 'gal', grades: ['0W-20', '5W-30', '5W-40'], tiers: [['Single', 1, 380], ['Case of 3', 3, 1110], ['3 cases', 9, 3240]] },
    { id: 'm1q', brand: 'Mobil 1', name: 'Mobil 1 Advanced Full Synthetic', size: Q, type: 'qt', grades: ['0W-8', '0W-20', '5W-30', '5W-50', '10W-40', '15W-50'], tiers: [['Single', 1, 130], ['Case of 6', 6, 750]] },
    { id: 'vfs', brand: 'Valvoline', name: 'Valvoline Full Synthetic', size: G, type: 'gal', grades: ['0W-20'], tiers: [['Single', 1, 395], ['Case of 3', 3, 1125]] },
    { id: 'cedge', brand: 'Castrol', name: 'Castrol EDGE', size: Q, type: 'qt', grades: ['5W-30'], tiers: [['Single', 1, 95], ['Case of 6', 6, 540]] },
    { id: 'vmx', brand: 'Valvoline', name: 'Valvoline MaxLife ATF', size: G, type: 'atf', grades: ['ATF'], tiers: [['Single', 1, 280], ['Case of 3', 3, 780]] },
    { id: 'shx7', brand: 'Shell', name: 'Shell Helix HX7', size: G, type: 'gal', grades: ['10W-30', '10W-40'], tiers: [['Single', 1, 350]] },
    { id: 'tsyn', brand: 'Toyota', name: 'Toyota Genuine Synthetic', size: Q, type: 'qt', grades: ['0W-20'], tiers: [['Single', 1, 95], ['Case of 6', 6, 540]] },
    { id: 'm1t', brand: 'Mobil 1', name: 'Mobil 1 Truck & SUV Turbo Diesel', size: Q, type: 'diesel', grades: ['5W-40'], tiers: [['Single', 1, 130], ['Case of 6', 6, 750]] },
    { id: 'ctx', brand: 'Castrol', name: 'Castrol Transmax ATF/CVT Universal', size: Q, type: 'atf', grades: ['ATF/CVT'], tiers: [['Single', 1, 90], ['Case of 6', 6, 480]] },
    { id: 'tmo', brand: 'Toyota', name: 'Toyota Genuine Motor Oil', size: Q, type: 'qt', grades: ['10W-30'], tiers: [['Single', 1, 85]] },
    { id: 'upg', brand: 'Ultra Plus', name: 'Ultra Plus Motor Oil', size: G, type: 'gal', grades: ['10W-30', '15W-40', 'Autotrans 3'], tiers: [['Single', 1, 180]] },
    { id: 'upq', brand: 'Ultra Plus', name: 'Ultra Plus Synthetic', size: Q, type: 'qt', grades: ['0W-20', '5W-30', '10W-30'], tiers: [['Single', 1, 70]] },
    { id: 'upc', brand: 'Ultra Plus', name: 'Ultra Plus Universal ATF-CVT', size: Q, type: 'atf', grades: ['ATF/CVT'], tiers: [['Single', 1, 70]] },
    { id: 'upm', brand: 'Ultra Plus', name: 'Ultra Plus Motor Oil', size: Q, type: 'qt', grades: ['10W-30', '15W-40', '20W-50'], tiers: [['Single', 1, 55]] },
    { id: 'dlv', brand: 'Mobil Delvac', name: 'Mobil Delvac 1300 Super', size: G, type: 'diesel', grades: ['15W-40'], tiers: [] },
  ];
  const TYPES = [['all', 'All'], ['gal', 'Gallons'], ['qt', 'Quarts'], ['atf', 'ATF / CVT'], ['diesel', 'Diesel']];
  const FINDER = ['0W-20', '5W-30', '10W-30', '10W-40', '5W-40', '15W-40', 'ATF/CVT'];
  const LIMIT = 8;
  const CAN = { gal: 'GAL', qt: 'QT', atf: 'ATF', diesel: 'DSL' };

  const state = { type: 'all', grade: null, all: false, open: null };
  const pick = {}; // per product: grade, tier, qty

  const matchGrade = (p, g) => !g || (g === 'ATF/CVT' ? p.type === 'atf' : p.grades.includes(g));
  const list = () => P.filter(p => (state.type === 'all' || p.type === state.type) && matchGrade(p, state.grade));

  const typesEl = $('#types');
  const renderTypes = () => {
    typesEl.innerHTML = TYPES.map(([k, l]) => {
      const n = P.filter(p => (k === 'all' || p.type === k) && matchGrade(p, state.grade)).length;
      return `<button class="type" role="tab" aria-selected="${state.type === k}" data-type="${k}">${l}<small>${n}</small></button>`;
    }).join('');
  };
  typesEl.addEventListener('click', e => {
    const b = e.target.closest('.type'); if (!b) return;
    state.type = b.dataset.type; state.all = false; render();
  });

  const gradesEl = $('#grades');
  gradesEl.innerHTML = `<button class="grade" data-g="">Any grade</button>` + FINDER.map(g => `<button class="grade" data-g="${g}">${g}</button>`).join('');
  gradesEl.addEventListener('click', e => {
    const b = e.target.closest('.grade'); if (!b) return;
    setGrade(b.dataset.g || null);
  });
  function setGrade(g) {
    state.grade = g; state.type = 'all'; state.all = !!g; state.open = null;
    P.forEach(p => { if (g && p.grades.includes(g)) (pick[p.id] ||= {}).grade = g; });
    render();
  }
  $('#clearGrade').addEventListener('click', () => { state.grade = null; state.type = 'all'; state.all = false; render(); });

  const prodEl = $('#products');
  function row(p) {
    const s = (pick[p.id] ||= {});
    s.grade ||= p.grades[0]; s.tier ??= 0; s.qty ||= 1;
    const single = p.tiers[0] ? p.tiers[0][2] : 0;
    const isOpen = state.open === p.id;
    const sizeShort = p.size.split(' ')[0];
    const meta = `${sizeShort} · ${p.grades.length > 1 ? p.grades.length + ' grades' : p.grades[0]}${p.tiers.length > 1 ? ' · case price' : ''}`;
    const price = p.tiers.length ? `<small>${p.tiers.length > 1 ? 'from' : 'each'}</small><b>${money(single)}</b>` : `<span class="poa">Ask price</span>`;
    let body = '';
    if (isOpen) {
      const grades = p.grades.length > 1
        ? p.grades.map(g => `<button class="cg" aria-pressed="${s.grade === g}" data-grade="${g}">${g}</button>`).join('')
        : `<span class="cg static">${p.grades[0]}</span>`;
      const tiers = p.tiers.length ? `<div><p class="pb-lab">Pack</p><div class="tiers" role="radiogroup" aria-label="${p.name} pack">` + p.tiers.map(([l, u, pr], i) => {
        const sv = u > 1 ? single * u - pr : 0;
        return `<label class="tier"><input type="radio" name="t-${p.id}" value="${i}" ${s.tier === i ? 'checked' : ''}><span class="tier-l">${l}${sv > 0 ? `<small>Save ${money(sv)}</small>` : ''}</span><span class="tier-p">${money(pr)}</span></label>`;
      }).join('') + '</div></div>'
        : `<p class="ask-price">Price on request. <a href="https://wa.me/${WA}?text=${encodeURIComponent('Hi Lewwee Roll, what is the price for ' + p.name + ' ' + p.grades[0] + '?')}" target="_blank" rel="noopener">Ask on WhatsApp</a></p>`;
      const foot = p.tiers.length ? `<div class="pb-foot">
          <div class="qty"><button data-q="-1" aria-label="Less">−</button><output>${s.qty}</output><button data-q="1" aria-label="More">+</button></div>
          <button class="btn btn-go add"><i class="ph-bold ph-plus"></i> Add to slip</button></div>` : '';
      body = `<div class="prod-body" id="pb-${p.id}"><div><p class="pb-lab">Grade</p><div class="cgs">${grades}</div></div>${tiers}${foot}</div>`;
    }
    return `<li class="prod" data-id="${p.id}" open-state="${isOpen ? 'open' : ''}">
      <button class="prod-row" aria-expanded="${isOpen}" aria-controls="pb-${p.id}">
        <span class="can" data-t="${p.type}" aria-hidden="true">${CAN[p.type]}</span>
        <span class="prod-main"><b>${p.name}</b><small>${meta}</small></span>
        <span class="prod-price">${price}</span>
        <i class="ph-bold ph-caret-down chev" aria-hidden="true"></i>
      </button>${body}</li>`;
  }
  function render() {
    renderTypes();
    const L = list();
    const shown = state.all ? L : L.slice(0, LIMIT);
    prodEl.innerHTML = shown.map(row).join('');
    prodEl.hidden = L.length === 0;
    $('#empty').hidden = L.length > 0;
    const more = $('#showMore');
    more.hidden = state.all || L.length <= LIMIT;
    more.textContent = `Show all ${L.length} lines`;
    $('#resultCount').textContent = `${L.length} ${L.length === 1 ? 'line' : 'lines'}${state.grade ? ' in ' + state.grade : ''}`;
    $$('.grade').forEach(b => b.setAttribute('aria-pressed', (b.dataset.g || null) === state.grade));
  }
  $('#showMore').addEventListener('click', () => { state.all = true; render(); });

  prodEl.addEventListener('click', e => {
    const li = e.target.closest('.prod'); if (!li) return;
    const p = P.find(x => x.id === li.dataset.id), s = pick[p.id];
    if (e.target.closest('.prod-row')) {
      state.open = state.open === p.id ? null : p.id; render();
      const el = prodEl.querySelector(`[data-id="${p.id}"] .prod-row`); el && el.focus({ preventScroll: true });
      return;
    }
    const g = e.target.closest('.cg[data-grade]');
    if (g) { s.grade = g.dataset.grade; $$('.cg', li).forEach(b => b.setAttribute('aria-pressed', b === g)); return; }
    const q = e.target.closest('[data-q]');
    if (q) { s.qty = Math.max(1, Math.min(99, s.qty + +q.dataset.q)); $('.qty output', li).textContent = s.qty; return; }
    const add = e.target.closest('.add');
    if (add) {
      const [label, units, price] = p.tiers[s.tier];
      addLine({ pid: p.id, name: p.name, grade: s.grade, tier: label, units, price, size: p.size.split(' ')[0], qty: s.qty });
      add.classList.add('done'); add.innerHTML = '<i class="ph-bold ph-check"></i> Added';
      setTimeout(() => { add.classList.remove('done'); add.innerHTML = '<i class="ph-bold ph-plus"></i> Add to slip'; }, 1400);
    }
  });
  prodEl.addEventListener('change', e => {
    const r = e.target.closest('input[type=radio]'); if (!r) return;
    pick[r.closest('.prod').dataset.id].tier = +r.value;
  });

  /* ---------- Order slip ---------- */
  let slip = [];
  try { slip = JSON.parse(localStorage.getItem('lr-slip') || '[]'); } catch (e) {}
  const save = () => { try { localStorage.setItem('lr-slip', JSON.stringify(slip)); } catch (e) {} };
  function addLine(l) {
    const k = l.pid + l.grade + l.tier;
    const ex = slip.find(x => x.pid + x.grade + x.tier === k);
    ex ? ex.qty += l.qty : slip.push(l);
    save(); renderSlip(true);
    toast(`${l.qty} × ${l.name} ${l.grade} added`);
  }
  const total = () => slip.reduce((a, l) => a + l.price * l.qty, 0);
  const count = () => slip.reduce((a, l) => a + l.qty, 0);
  function renderSlip(bump) {
    $('#slipCount').textContent = count();
    if (bump && !reduce) { const b = $('#openSlip'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
    $('#slipItems').innerHTML = slip.map((l, i) => `<li>
      <span class="si-name">${l.name}</span><span class="si-price">${money(l.price * l.qty)}</span>
      <span class="si-meta">${l.grade} · ${l.tier} (${l.units} ${l.size.toLowerCase()}${l.units > 1 ? 's' : ''})</span><span></span>
      <div class="si-ctrl"><div class="qty"><button data-i="${i}" data-d="-1" aria-label="Less">−</button><output>${l.qty}</output><button data-i="${i}" data-d="1" aria-label="More">+</button></div>
      <button class="si-remove" data-rm="${i}">Remove</button></div></li>`).join('');
    $('#slipEmpty').hidden = slip.length > 0;
    $('#orderForm').hidden = slip.length === 0;
    $('#slipTotal').textContent = money(total());
    $('#barCount').textContent = count() + (count() === 1 ? ' item' : ' items');
    $('#barTotal').textContent = money(total());
    $('#slipbar').hidden = slip.length === 0;
  }
  $('#slipItems').addEventListener('click', e => {
    const d = e.target.closest('[data-d]'), rm = e.target.closest('[data-rm]');
    if (d) { const l = slip[+d.dataset.i]; l.qty = Math.max(1, l.qty + +d.dataset.d); }
    else if (rm) slip.splice(+rm.dataset.rm, 1);
    else return;
    save(); renderSlip();
  });

  const slipEl = $('#slip'), scrim = $('#scrim');
  let lastFocus = null;
  function openSlip() {
    lastFocus = document.activeElement;
    scrim.hidden = false; slipEl.inert = false; slipEl.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => { scrim.classList.add('on'); slipEl.classList.add('on'); });
    document.body.style.overflow = 'hidden';
    setTimeout(() => $('#closeSlip').focus(), 50);
  }
  function closeSlip() {
    scrim.classList.remove('on'); slipEl.classList.remove('on');
    slipEl.inert = true; slipEl.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => { scrim.hidden = true; }, reduce ? 0 : 300);
    lastFocus && lastFocus.focus();
  }
  $('#openSlip').addEventListener('click', openSlip);
  $('#slipbar').addEventListener('click', openSlip);
  $('#closeSlip').addEventListener('click', closeSlip);
  scrim.addEventListener('click', closeSlip);
  addEventListener('keydown', e => { if (e.key === 'Escape' && slipEl.classList.contains('on')) closeSlip(); });

  const areaWrap = $('#oAreaWrap');
  $('#fulfil').addEventListener('change', e => { areaWrap.hidden = e.target.value !== 'Delivery'; });

  $('#orderForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#oName'), area = $('#oArea'), err = $('#orderErr');
    const fulfil = $('input[name=fulfil]:checked').value, pay = $('input[name=pay]:checked').value;
    $$('.field', e.target).forEach(f => f.classList.remove('bad'));
    if (!name.value.trim()) { name.parentElement.classList.add('bad'); err.textContent = 'Add your name so we know who the order is for.'; name.focus(); return; }
    if (fulfil === 'Delivery' && !area.value.trim()) { area.parentElement.classList.add('bad'); err.textContent = 'Add your delivery area.'; area.focus(); return; }
    err.textContent = '';
    const lines = slip.map(l => `- ${l.qty} x ${l.name} ${l.grade}, ${l.tier}: ${money(l.price * l.qty)}`);
    const msg = [`Hi Lewwee Roll, new order from ${name.value.trim()}:`, ...lines, `Estimated total: ${money(total())} TTD`,
      fulfil === 'Delivery' ? `Delivery to: ${area.value.trim()}` : 'Curbside pickup in Curepe', `Paying by: ${pay}`].join('\n');
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });

  /* ---------- "Ask" links on shelf / tools ---------- */
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-ask]'); if (!a) return;
    e.preventDefault();
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent('Hi Lewwee Roll, I am asking about ' + a.dataset.ask + '.')}`, '_blank', 'noopener');
  });

  /* ---------- Suzuki part request ---------- */
  const yearSel = $('#pYear');
  const y0 = 2026;
  yearSel.innerHTML = '<option value="">Choose</option>' + Array.from({ length: 30 }, (_, i) => `<option>${y0 - i}</option>`).join('');
  $('#partForm').addEventListener('submit', e => {
    e.preventDefault();
    const part = $('#pPart'), year = $('#pYear'), model = $('#pModel'), err = $('#partErr');
    const bad = [part, year, model].filter(x => !x.value.trim());
    $$('.field', e.target).forEach(m => m.classList.remove('bad'));
    if (bad.length) { bad.forEach(b => b.closest('.field').classList.add('bad')); err.textContent = 'Add the part, model and year.'; bad[0].focus(); return; }
    err.textContent = '';
    const cond = $('input[name=cond]:checked').value, ch = $('#pChassis').value.trim();
    const msg = `Hi Lewwee Roll, I need a ${part.value.trim()} for a ${year.value} ${model.value}. Condition: ${cond}.${ch ? ' Chassis no: ' + ch + '.' : ''} Price and availability please?`;
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });

  /* ---------- Delivery areas (from his own area list) ---------- */
  const REG = {
    'North & East': ['Barataria', 'Belmont', 'Carenage', 'Cascade', 'Chaguaramas', 'Curepe', "D'Abadie", 'Diego Martin', 'El Dorado', 'El Socorro', 'Glencoe', 'Morvant', 'Mt Hope', 'Petit Valley', 'Piarco', 'Port of Spain', 'San Juan', 'St Anns', 'St Augustine', 'St Clair', 'Santa Cruz', 'Sangre Grande', 'Spring Village'],
    Central: ['Carapichaima', 'Chaguanas', 'Charlieville', 'Chase Village', 'Claxton Bay', 'Couva', 'Cunupia', 'Edinburgh', 'Endeavour', 'Enterprise', 'Felicity'],
    South: ['Cedros', 'Chatham', 'Erin', 'Fyzabad', 'Golconda', 'Guapo', 'Gulf View', 'Iere Village', 'La Brea', 'La Romaine', 'Marabella', 'Monkey Town', 'Palmiste Park', 'Penal', 'Point-a-Pierre', 'Point Fortin', 'Princes Town', 'Rousillac', 'San Fernando', 'South Oropouche'],
  };
  const ALL = Object.values(REG).flat();
  $('#areaList').innerHTML = ALL.map(a => `<option value="${a}">`).join('');
  const regEl = $('#regions');
  regEl.innerHTML = Object.entries(REG).map(([r, as]) => `<div class="region"><b>${r}</b><div>${as.slice(0, 8).map(a => `<span data-a="${a}">${a}</span>`).join('')}${as.length > 8 ? `<span class="more-n">+${as.length - 8} more</span>` : ''}</div></div>`).join('');
  const norm = s => s.toLowerCase().replace(/[^a-z]/g, '');
  $('#areaForm').addEventListener('submit', e => {
    e.preventDefault();
    const v = $('#areaIn').value.trim(), out = $('#areaOut');
    $$('.region span', regEl).forEach(s => s.classList.remove('hit'));
    if (!v) { out.className = 'check-out'; out.textContent = 'Type your area first.'; return; }
    const hit = ALL.find(a => norm(a) === norm(v)) || ALL.find(a => norm(a).startsWith(norm(v)) && norm(v).length > 2);
    if (hit) {
      out.className = 'check-out yes';
      out.innerHTML = `<i class="ph-bold ph-check-circle"></i> Yes, we deliver to ${hit}.`;
      const s = $(`.region span[data-a="${CSS.escape(hit)}"]`, regEl); if (s) s.classList.add('hit');
    } else {
      out.className = 'check-out';
      out.innerHTML = `Not on our list yet. <a href="https://wa.me/${WA}?text=${encodeURIComponent('Hi, do you deliver to ' + v + '?')}" target="_blank" rel="noopener">Ask about ${v.replace(/[<>&"]/g, '')}</a>`;
    }
  });

  /* ---------- Theme ---------- */
  const themeBtn = $('#theme'), root = document.documentElement;
  const syncTheme = () => {
    const dark = root.dataset.theme === 'dark';
    themeBtn.innerHTML = `<i class="ph ph-${dark ? 'sun' : 'moon'}"></i>`;
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  };
  themeBtn.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('lr-theme', root.dataset.theme); } catch (e) {}
    syncTheme();
  });
  syncTheme();

  /* ---------- Toast ---------- */
  let tt;
  function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('on'), 1800); }

  /* ---------- Reveal + active dept + slip bar hiding ---------- */
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.rv').forEach(el => io.observe(el));

  const links = $$('.nav a');
  const secIO = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + en.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['oil', 'care', 'suzuki', 'workshop', 'courier'].forEach(id => secIO.observe(document.getElementById(id)));

  // hide floating slip bar over forms and footer so it never covers inputs
  const covering = new Set();
  const barIO = new IntersectionObserver(es => {
    es.forEach(en => en.isIntersecting ? covering.add(en.target) : covering.delete(en.target));
    $('#slipbar').classList.toggle('away', covering.size > 0);
  });
  ['#partForm', '#areaForm', '.foot', '.hero'].forEach(s => barIO.observe($(s)));

  /* ---------- Phone menu ---------- */
  const menu = $('#menu'), menuBtn = $('#menuBtn');
  const setMenu = on => { menu.hidden = !on; menuBtn.setAttribute('aria-expanded', on); menuBtn.innerHTML = `<i class="ph ph-${on ? 'x' : 'list'}"></i>`; };
  menuBtn.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  $('#slipBrowse').addEventListener('click', closeSlip);

  const filt = $('.filters');
  new IntersectionObserver(([en]) => filt.classList.toggle('stuck', en.intersectionRatio < 1), { rootMargin: '-80px 0px 0px 0px', threshold: [1] }).observe(filt);

  render();
  renderSlip();
})();
