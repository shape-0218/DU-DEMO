/* 끌어서 순서 바꾸기 — 작품 등록·전시 등록의 가로 사진 줄 (11-15, U-143)
   사용: Reorder.attach(바뀌지 않는 부모, { row: '.thumbs'(없으면 부모가 곧 줄), item: '.th', noun: '포스터', onMove(from, to) { 배열 순서 바꾸고 다시 그리기 } })
   - 손가락: 사진을 길게(350ms) 누르면 집힘 → 옆으로 끌기. 그 전에 8px 넘게 움직이면 줄 스크롤로 보고 놓아 줌(스크롤과 안 부딪힘)
   - 마우스·펜: 누른 채 4px 넘게 움직이면 바로 끌기
   - 키보드: 사진 칸에 초점 → Space/Enter로 집기 → ←/→로 한 칸씩 → Space/Enter/Esc로 놓기(키보드 동작은 움직임 없이 바로)
   - 움직임: transform만. 집힌 칸 scale 1.04 + 그림자, 다른 칸이 비켜남 200ms, 놓으면 제자리로 200ms(ease-out). 움직임 줄이기면 커지지 않고 바로 자리만 바뀜
   - 줄 끝 48px 안으로 끌면 줄이 저절로 넘어감. 처음·끝 칸 바깥으로는 덜 따라오게(감쇠)
   - 첫 칸 = 대표(확정 정책)는 데이터 순서로 정해지므로 다시 그리면 '대표'·'조정' 표시가 새 첫 칸으로 옮겨 감
   - 다시 그릴 때 이미 읽은 사진(img)을 그대로 옮겨 붙여 깜빡임·등장 애니메이션(rise)이 다시 나오지 않게 함 */
(() => {
  const LONG = 350, SLOP = 8, MSLOP = 4, EDGE = 48, DUR = 200, LIFT = 1.04;
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = document.createElement('style');
  css.textContent = [
    '.ro-item { -webkit-touch-callout: none; -webkit-user-select: none; user-select: none; }',
    '.ro-item img { -webkit-user-drag: none; pointer-events: none; }',
    '@media (hover: hover) and (pointer: fine) { .ro-item { cursor: grab; } }',
    '.ro-on .ro-item { transition: transform 200ms cubic-bezier(.23, 1, .32, 1); }',
    '.ro-item.ro-lift { z-index: 3; transition: none; box-shadow: 0 12px 24px -8px rgba(0, 0, 0, .32), 0 2px 6px rgba(0, 0, 0, .12); cursor: grabbing; }',   /* 집힌 칸만 그림자(떠 있는 높이 표시) */
    '.ro-item.ro-drop { z-index: 3; transition: transform 200ms cubic-bezier(.23, 1, .32, 1), box-shadow 200ms cubic-bezier(.23, 1, .32, 1); }',
    '.ro-item.ro-key { z-index: 3; outline: 2px solid var(--text-primary); outline-offset: 2px; box-shadow: 0 12px 24px -8px rgba(0, 0, 0, .32); }',
    '@media (prefers-reduced-motion: reduce) { .ro-on .ro-item, .ro-item.ro-drop { transition: none; } }'
  ].join('\n');
  document.head.appendChild(css);

  /* 스크린리더용 설명·알림(화면에는 안 보임) */
  let live = null;
  function ensureSr() {
    if (live) return;
    const hint = document.createElement('p'); hint.className = 'sr'; hint.id = 'ro-hint';
    hint.textContent = '스페이스 키로 집고 왼쪽·오른쪽 화살표로 순서를 바꿔요';
    live = document.createElement('p'); live.className = 'sr'; live.setAttribute('aria-live', 'assertive');
    document.body.append(hint, live);
  }
  const say = (t) => { if (!live) return; live.textContent = ''; setTimeout(() => { live.textContent = t; }, 30); };

  function attach(root, opt) {
    if (!root || root.__ro) return; root.__ro = true; ensureSr();
    const rowOf = (el) => opt.row ? el.closest(opt.row) : root;
    const itemsIn = (row) => [...row.querySelectorAll(opt.item)].filter((n) => n.parentElement === row);
    let s = null, kb = -1;

    /* 다시 그려질 때마다 칸에 표시를 붙임 */
    const mark = () => root.querySelectorAll(opt.item).forEach((el) => {
      if (el.classList.contains('ro-item')) return;
      el.classList.add('ro-item'); el.tabIndex = 0; el.setAttribute('aria-describedby', 'ro-hint');
    });
    mark(); new MutationObserver(mark).observe(root, { childList: true, subtree: true });

    /* 순서 확정: 데이터를 바꾸고 다시 그린 뒤, 읽어 둔 사진을 옮겨 붙이고 스크롤 위치를 되돌림 */
    function commit(row, from, to, focus) {
      const sl = row.scrollLeft, old = new Map();
      itemsIn(row).forEach((t) => { const im = t.querySelector('img'); if (im) old.set(im.getAttribute('src'), im); });
      opt.onMove(from, to);
      const nrow = opt.row ? root.querySelector(opt.row) : root; if (!nrow) return;
      const list = itemsIn(nrow);
      list.forEach((t) => {
        t.style.animation = 'none';
        const im = t.querySelector('img'), keep = im && old.get(im.getAttribute('src'));
        if (keep && keep !== im) { keep.alt = im.alt; im.replaceWith(keep); old.delete(im.getAttribute('src')); }
      });
      nrow.scrollLeft = sl; mark();
      if (focus && list[to]) { list[to].focus({ preventScroll: true }); list[to].scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
      return list;
    }

    /* ---------- 손가락·마우스 ---------- */
    root.addEventListener('pointerdown', (e) => {
      if (s || e.button > 0 || !e.isPrimary) return;
      const el = e.target.closest(opt.item); if (!el || !root.contains(el) || e.target.closest('button, a, input')) return;
      const row = rowOf(el); if (!row || itemsIn(row).length < 2) return;
      s = { el, row, id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, touch: e.pointerType === 'touch', on: false };
      if (s.touch) s.timer = setTimeout(lift, LONG);
      addEventListener('pointermove', move); addEventListener('pointerup', up); addEventListener('pointercancel', up);
    });
    /* 집힌 뒤에는 페이지·줄 스크롤을 막음(이 줄 위에서만 막아서 다른 곳 스크롤에는 영향 없음) */
    const block = (e) => { if (s && s.on) e.preventDefault(); };
    root.addEventListener('touchstart', block, { passive: false });
    root.addEventListener('touchmove', block, { passive: false });
    root.addEventListener('contextmenu', (e) => { if (e.target.closest(opt.item)) e.preventDefault(); });   // 안드로이드 길게 누르기 메뉴

    function lift() {
      clearTimeout(s.timer);
      const { el, row } = s, list = itemsIn(row), rr = row.getBoundingClientRect();
      s.list = list; s.from = s.to = list.indexOf(el); s.sl0 = row.scrollLeft;
      s.lefts = list.map((n) => n.getBoundingClientRect().left - rr.left + row.scrollLeft);
      s.step = s.lefts[1] - s.lefts[0];
      s.on = true; s.moved = false;
      row.classList.add('ro-on'); el.classList.add('ro-lift'); row.style.scrollSnapType = 'none';
      if (!s.touch) { try { el.setPointerCapture(s.id); } catch (x) {} }
      if (s.touch && navigator.vibrate) navigator.vibrate(8);
      place(); loop();
    }
    function move(e) {
      if (!s || e.pointerId !== s.id) return;
      s.x = e.clientX;
      const d = Math.hypot(e.clientX - s.x0, e.clientY - s.y0);
      if (!s.on) {
        if (s.touch) { if (d > SLOP) stop(); return; }   // 길게 누르기 전에 움직이면 스크롤
        if (d <= MSLOP) return; lift();
      }
      if (e.cancelable) e.preventDefault();
      s.moved = true; place();
    }
    /* 집힌 칸은 손가락을 따라가고, 다른 칸은 들어갈 자리를 비켜 줌 */
    function place() {
      const { el, row, list, from, lefts, step } = s, n = list.length;
      let dx = (s.x - s.x0) + (row.scrollLeft - s.sl0);
      const min = lefts[0] - lefts[from], max = lefts[n - 1] - lefts[from];
      if (dx < min) dx = min + (dx - min) * 0.2; else if (dx > max) dx = max + (dx - max) * 0.2;   // 끝에서는 덜 따라옴
      const to = Math.max(0, Math.min(n - 1, Math.round((lefts[from] + dx - lefts[0]) / step)));
      s.to = to;
      el.style.transform = `translateX(${dx}px)` + (reduce() ? '' : ` scale(${LIFT})`);
      list.forEach((t, i) => {
        if (i === from) return;
        const sh = from < to && i > from && i <= to ? -step : (to < from && i >= to && i < from ? step : 0);
        t.style.transform = sh ? `translateX(${sh}px)` : '';
      });
    }
    /* 줄 양 끝 가까이 끌면 줄이 저절로 넘어감 */
    function loop() {
      if (!s || !s.on) return;
      const r = s.row.getBoundingClientRect(); let v = 0;
      if (s.x < r.left + EDGE) v = -Math.ceil((r.left + EDGE - s.x) / 4);
      else if (s.x > r.right - EDGE) v = Math.ceil((s.x - (r.right - EDGE)) / 4);
      if (v) { const b = s.row.scrollLeft; s.row.scrollLeft = b + Math.max(-12, Math.min(12, v)); if (s.row.scrollLeft !== b) place(); }
      s.raf = requestAnimationFrame(loop);
    }
    function up(e) { if (!s || e.pointerId !== s.id) return; stop(); }
    function stop() {
      removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
      clearTimeout(s.timer); cancelAnimationFrame(s.raf);
      const g = s; s = null;
      if (!g.on) return;
      const { el, row, from, to, step, list } = g;
      if (g.moved) { addEventListener('click', swallow, true); setTimeout(() => removeEventListener('click', swallow, true), 0); }   // 마우스로 끈 뒤 따라오는 클릭 한 번만 무시
      const done = () => {
        row.classList.remove('ro-on'); row.style.scrollSnapType = '';
        list.forEach((t) => { t.style.transform = ''; t.classList.remove('ro-lift', 'ro-drop'); });
        if (to !== from) { commit(row, from, to, false); say(`${to + 1}번째로 옮겼어요`); }
      };
      el.classList.remove('ro-lift');
      if (reduce()) { done(); return; }
      el.classList.add('ro-drop'); el.style.transform = `translateX(${(to - from) * step}px)`;   // 들어갈 자리로 내려앉음
      setTimeout(done, DUR + 20);
    }
    function swallow(c) { c.stopPropagation(); c.preventDefault(); }

    /* ---------- 키보드 ---------- */
    root.addEventListener('keydown', (e) => {
      const el = e.target; if (!el.classList || !el.classList.contains('ro-item')) return;
      const row = rowOf(el), list = itemsIn(row), i = list.indexOf(el);
      const drop = () => { el.classList.remove('ro-key'); kb = -1; say('놓았어요'); };
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (kb === i) drop(); else { list.forEach((t) => t.classList.remove('ro-key')); kb = i; el.classList.add('ro-key'); say(`${i + 1}번째 ${opt.noun || '사진'}을 집었어요`); }
        return;
      }
      if (kb !== i) return;
      if (e.key === 'Escape') { e.preventDefault(); drop(); return; }
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      const to = i + (e.key === 'ArrowLeft' ? -1 : 1); if (to < 0 || to >= list.length) return;
      const nl = commit(row, i, to, true); kb = to;
      if (nl && nl[to]) nl[to].classList.add('ro-key');
      say(`${to + 1}번째로 옮겼어요`);
    });
    root.addEventListener('focusout', (e) => { if (e.target.classList && e.target.classList.contains('ro-key') && !root.contains(e.relatedTarget)) { e.target.classList.remove('ro-key'); kb = -1; } });
  }
  window.Reorder = { attach };
})();
