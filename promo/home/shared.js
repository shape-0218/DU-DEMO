/* 홈 새 구조 시안 공용(11-15, 검토용 · promo/home) — 머리·넷바·분류 탭·작품 고르기·지도 띠·등록·바닥글을 세 시안이 같이 씀.
   필요: promo/shared.js(BRAND 로고 조각) · assets/demo-data.js(DEMO) · assets/byline.js(Byline) · assets/minimap.js(DUMiniMap) */
const HN = (() => {
  const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const src = (e) => (e.v ? 'assets/poster-shore-thumb.jpg' : DEMO.src(e.img));
  const wsrc = (w) => `assets/img/explore/opt/${w.img}.jpg`;
  const self = location.pathname + location.search;   // 사본 안에서 로고·홈을 눌러도 이 시안에 머묾
  const ICON = {
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>',
    chev: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3.5 4.5 4.5L6 12.5"/></svg>',
    go: '<svg viewBox="0 0 12 12" aria-hidden="true" style="width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round"><path d="M3.5 8.5 8.5 3.5M4.5 3.5h4v4"/></svg>',
    pin: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 14s4.5-3.9 4.5-7.5a4.5 4.5 0 0 0-9 0C3.5 10.1 8 14 8 14z"/><circle cx="8" cy="6.5" r="1.6"/></svg>'
  };
  const TABS = [['pop', '인기 전시'], ['grad', '졸업전시'], ['live', '전시 중'], ['soon', '전시 예정'], ['end', '마감 임박']];

  function header(el) {
    el.innerHTML = `<a href="${self}" aria-label="Display U. 홈">${BRAND.wordmark('wm')}</a><a class="sch" href="explore.html" aria-label="검색">${ICON.search}</a>`;
  }
  /* 분류 탭: 밑줄 한 줄이 탭 사이를 미끄러짐(지금 홈 U-96과 같은 값). onPick(k, 처음인지) */
  function cats(el, onPick, first = 'pop') {
    el.setAttribute('role', 'tablist'); el.setAttribute('aria-label', '전시 분류');
    el.innerHTML = TABS.map(([k, t]) => `<button type="button" role="tab" data-k="${k}" aria-selected="${k === first}" tabindex="${k === first ? 0 : -1}">${t}</button>`).join('') + '<span class="ind" aria-hidden="true"></span>';
    const bs = [...el.querySelectorAll('button')], ind = el.querySelector('.ind');
    const place = () => { const b = bs.find((x) => x.getAttribute('aria-selected') === 'true'); if (b) ind.style.transform = `translateX(${b.offsetLeft + 12}px) scaleX(${b.offsetWidth - 24})`; };
    const pick = (b, silent) => {
      bs.forEach((x) => { const on = x === b; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; });
      place(); if (!silent && el.scrollWidth > el.clientWidth) el.scrollTo({ left: b.offsetLeft - (el.clientWidth - b.offsetWidth) / 2, behavior: rm ? 'auto' : 'smooth' });
      onPick(b.dataset.k, !!silent);
    };
    bs.forEach((b, i) => {
      b.addEventListener('click', () => { if (b.getAttribute('aria-selected') !== 'true') pick(b); });
      b.addEventListener('keydown', (e) => { const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return; e.preventDefault(); const n = bs[(i + d + bs.length) % bs.length]; pick(n); n.focus(); });
    });
    new ResizeObserver(place).observe(el); if (document.fonts) document.fonts.ready.then(place);
    pick(bs.find((b) => b.dataset.k === first) || bs[0], true); setTimeout(() => el.classList.add('ready'), 80);
    return { pick: (k) => pick(bs.find((b) => b.dataset.k === k)) };
  }
  /* 작품: 전시를 돌아가며 한 점씩(지금 홈 ARTWORKS와 같은 규칙) */
  function works(n = 10, list) {
    const ex = list || DEMO.EXH, by = ex.map((e) => DEMO.WORKS.filter((w) => w.e === e.i)).filter((l) => l.length), out = [];
    for (let r = 0; out.length < n && by.some((l) => l[r]); r++) by.forEach((l) => { if (l[r] && out.length < n) out.push(l[r]); });
    return out;
  }
  const wcard = (w) => `<a class="wcard" href="work.html?w=${w.i}"><span class="ph"><img src="${wsrc(w)}" alt="${esc(w.t)} 작품" width="161" height="215" loading="lazy"></span><span class="tx"><b>${esc(w.t)}</b>${Byline.html(w.a)}</span></a>`;
  const worksHead = () => `<div class="wh"><h2 id="works-title">ARTWORKS</h2><a class="more" href="explore.html?tab=works">더보기${ICON.chev}</a></div><p class="sub">전시 속 작품을 만나보세요</p>`;

  /* 지도 띠(U-163): focus(전시 번호)로 그 전시 자리로 부드럽게 옮겨 가고 핀이 켜짐, null이면 전체 */
  const MAPPED = DEMO.EXH.filter((e) => e.st !== '종료' && DUMiniMap.pos(e));
  function band(a) {
    a.innerHTML = `<span class="mm" aria-hidden="true"><canvas></canvas><span class="mpins"></span></span><span class="mchip">가까운 전시 찾기${ICON.chev}</span>`;
    const chip = a.querySelector('.mchip');
    const m = DUMiniMap.make(a.querySelector('.mm'), { s: (w) => clamp(w / 1100, .5, .8), ay: .64, src: (e) => DEMO.src(e.img), keep: () => ({ x: chip.offsetLeft + chip.offsetWidth + 24, y: chip.offsetTop + chip.offsetHeight + 10 }) });
    m.set(MAPPED);
    const cur = m.center(MAPPED); let tgt = { ...cur }, raf = 0, last = 0;
    const step = (now) => {
      const k = 1 - Math.exp(-Math.max(1, now - last) / 120); last = now;
      cur.x += (tgt.x - cur.x) * k; cur.y += (tgt.y - cur.y) * k; m.view(cur.x, cur.y);
      if (Math.abs(tgt.x - cur.x) + Math.abs(tgt.y - cur.y) > .5) raf = requestAnimationFrame(step); else raf = 0;
    };
    m.view(cur.x, cur.y);
    return {
      focus(id, instant) {
        const e = id == null ? null : DEMO.EXH.find((x) => x.i === id), p = e && DUMiniMap.pos(e);
        tgt = p && e.st !== '종료' ? { x: p.x, y: p.y } : m.center(MAPPED);
        m.mark(p && e.st !== '종료' ? id : null); a.setAttribute('href', p && e.st !== '종료' ? 'map.html?ex=' + id : 'map.html');
        if (instant || rm) { cancelAnimationFrame(raf); raf = 0; cur.x = tgt.x; cur.y = tgt.y; m.view(cur.x, cur.y); return; }
        if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); setTimeout(() => { if (raf && performance.now() - last > 300) { cur.x = tgt.x; cur.y = tgt.y; m.view(cur.x, cur.y); } }, 500); }
      }
    };
  }
  const tail = () => `<section class="reg" aria-label="전시 등록 안내"><div class="inner"><div><h2>준비 중인 전시가 있나요?</h2><p>디유에 전시와 작품을 소개해보세요</p></div><a href="exhibition-new.html">전시 등록하기${ICON.go}</a></div></section>
    <footer class="foot"><div class="inner"><a href="${self}" aria-label="Display U. 홈">${BRAND.wordmark('wm')}</a><div class="links"><a href="#">이용약관</a><i></i><a href="#">개인정보처리방침</a></div><small>© 2026 displayU. All rights reserved.</small></div></footer>`;
  /* 넷바(지금 홈과 같은 마크업 · assets/nav.css) */
  const NAV = `<nav class="nav" aria-label="하단 메뉴"><div class="pill" style="--i:0"><span class="cap" aria-hidden="true"><span class="nav-row"><span class="nav-slot"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.847 2.74991C12.3783 2.28128 11.6185 2.28128 11.1499 2.74991L2.74991 11.1499C2.28128 11.6185 2.28128 12.3783 2.74991 12.847C3.21854 13.3156 3.97834 13.3156 4.44697 12.847L4.79844 12.4955V20.3984C4.79844 21.0612 5.3357 21.5984 5.99844 21.5984H8.39844C9.06118 21.5984 9.59844 21.0612 9.59844 20.3984V17.9984C9.59844 17.3357 10.1357 16.7984 10.7984 16.7984H13.1984C13.8612 16.7984 14.3984 17.3357 14.3984 17.9984V20.3984C14.3984 21.0612 14.9357 21.5984 15.5984 21.5984H17.9984C18.6612 21.5984 19.1984 21.0612 19.1984 20.3984V12.4955L19.5499 12.847C20.0185 13.3156 20.7783 13.3156 21.247 12.847C21.7156 12.3783 21.7156 11.6185 21.247 11.1499L12.847 2.74991Z"/></svg></span><span class="nav-slot"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.59844 4.79844C6.94747 4.79844 4.79844 6.94747 4.79844 9.59844C4.79844 12.2494 6.94747 14.3984 9.59844 14.3984C12.2494 14.3984 14.3984 12.2494 14.3984 9.59844C14.3984 6.94747 12.2494 4.79844 9.59844 4.79844ZM2.39844 9.59844C2.39844 5.62199 5.62199 2.39844 9.59844 2.39844C13.5749 2.39844 16.7984 5.62199 16.7984 9.59844C16.7984 11.1534 16.3055 12.5933 15.4673 13.7703L21.247 19.5499C21.7156 20.0185 21.7156 20.7783 21.247 21.247C20.7783 21.7156 20.0185 21.7156 19.5499 21.247L13.7703 15.4673C12.5933 16.3055 11.1534 16.7984 9.59844 16.7984C5.62199 16.7984 2.39844 13.5749 2.39844 9.59844Z"/></svg></span><span class="nav-slot"><svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"/><path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z"/></svg></span></span></span>
    <a href="${self}" aria-current="page" aria-label="홈"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg></a>
    <a href="explore.html" aria-label="검색"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg></a>
    <a href="my.html" aria-label="마이"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg></a></div></nav>`;
  const nav = () => document.body.insertAdjacentHTML('beforeend', NAV);
  /* 확인용: 화면이 가려져 rAF가 멈춘 때도 끝까지 반영 */
  const frame = (fn) => { let d = false; const f = () => { if (d) return; d = true; fn(); }; requestAnimationFrame(f); setTimeout(f, 34); };
  return { rm, clamp, esc, src, wsrc, ICON, header, cats, works, wcard, worksHead, band, tail, nav, MAPPED, frame };
})();
