/* 하단 메뉴(넷바) 불 이동 모션 (11-07)
   홈·검색·마이는 서로 다른 페이지라서, 누른 탭 번호를 sessionStorage에 적어 두고 → 다음 페이지가 열릴 때 불(조명)이 이전 탭 자리에서 시작해 새 탭으로 미끄러져 옴.
   - 불 = tab-bar.svg(위의 흰 막대 + 아래로 퍼지는 빛). 페이지마다 탭 안에 따로 박혀 있던 것을 하나로 합쳐 pill 안에서 움직임
   - 아이콘은 불이 지나가면서 같이 밝아지고(켜짐) 어두워짐(꺼짐)
   - 누른 뒤 새 페이지가 뜨는 시간만큼 지연 없이 바로 이동(페이지를 막지 않음). 움직임 줄이기 설정이면 바로 자리만 바뀜
   - 노트북에서 폭이 바뀌면(리사이즈) 불 자리를 다시 맞춤 */
(() => {
  /* 브라우저가 페이지 전환 효과(View Transitions, assets/nav.css)를 지원하면 거기서 불이 움직이므로 이 파일은 할 일 없음 */
  if ('CSSViewTransitionRule' in window) return;
  const pill = document.querySelector('.nav .pill'); if (!pill) return;
  const links = [...pill.querySelectorAll('a')]; if (!links.length) return;
  const KEY = 'du.nav';
  const kind = (a) => { const l = a.getAttribute('aria-label') || ''; return l === '홈' ? 'home' : l === '검색' ? 'search' : 'user'; };
  const cur = Math.max(0, links.findIndex((a) => a.getAttribute('aria-current') === 'page'));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const st = document.createElement('style');
  st.textContent = `
.nav .pill { position: relative; }
.nav .lamp { position: absolute; left: 0; top: 0; width: 56px; height: 47px; pointer-events: none; will-change: transform; transition: transform .52s cubic-bezier(.16, 1, .3, 1); }
.nav .lamp.jump { transition: none; }
.nav a .ic { position: relative; transition: opacity .35s cubic-bezier(.16, 1, .3, 1), filter .35s cubic-bezier(.16, 1, .3, 1); }
.nav a .ic[data-k="home"] { opacity: .55; filter: none; }
.nav a .ic[data-k="home"].on { opacity: 1; }
.nav a .ic[data-k="search"], .nav a .ic[data-k="user"] { opacity: 1; filter: brightness(1); }
.nav a .ic[data-k="search"].on, .nav a .ic[data-k="user"].on { filter: brightness(2.4); }
@media (prefers-reduced-motion: reduce) { .nav .lamp, .nav a .ic { transition: none; } }`;
  document.head.appendChild(st);

  // 페이지마다 따로 박혀 있던 불은 지우고 하나로
  pill.querySelectorAll('img.bar, img.bar-i').forEach((n) => n.remove());
  const lamp = document.createElement('img'); lamp.className = 'lamp jump'; lamp.src = 'assets/img/tab-bar.svg'; lamp.alt = ''; lamp.width = 56; lamp.height = 47; lamp.setAttribute('aria-hidden', 'true');
  pill.prepend(lamp);
  const icons = links.map((a) => { const i = a.querySelector('img.ic'); if (i) { i.removeAttribute('style'); i.dataset.k = kind(a); } return i; });
  const at = (i) => `translate3d(${links[i].offsetLeft}px, ${links[i].offsetTop}px, 0)`;
  const mark = (i) => icons.forEach((ic, k) => ic && ic.classList.toggle('on', k === i));

  // 이전 페이지에서 누른 탭이 있으면 거기서 출발
  let from = -1;
  try { const o = JSON.parse(sessionStorage.getItem(KEY) || 'null'); sessionStorage.removeItem(KEY); if (o && Date.now() - o.t < 4000 && Number.isInteger(o.from) && o.from >= 0 && o.from < links.length && o.from !== cur) from = o.from; } catch (e) {}
  if (from >= 0 && !reduce) {
    lamp.style.transform = at(from); mark(from);
    void lamp.offsetWidth;                                        // 시작 자리를 먼저 그린 뒤
    requestAnimationFrame(() => requestAnimationFrame(() => { lamp.classList.remove('jump'); lamp.style.transform = at(cur); mark(cur); }));
  } else { lamp.style.transform = at(cur); mark(cur); requestAnimationFrame(() => lamp.classList.remove('jump')); }

  // 탭을 누르면 지금 탭 번호를 적어 둠(새 페이지에서 이어서 움직임)
  links.forEach((a, i) => a.addEventListener('click', (e) => {
    if (i === cur || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    try { sessionStorage.setItem(KEY, JSON.stringify({ from: cur, t: Date.now() })); } catch (x) {}
  }));
  // 크기가 바뀌면 불 자리만 다시(움직임 없이)
  addEventListener('resize', () => { lamp.classList.add('jump'); lamp.style.transform = at(cur); void lamp.offsetWidth; lamp.classList.remove('jump'); });
  // 뒤로가기로 돌아온 페이지(bfcache)는 지금 탭에 그대로
  addEventListener('pageshow', (e) => { if (e.persisted) { lamp.classList.add('jump'); lamp.style.transform = at(cur); mark(cur); void lamp.offsetWidth; lamp.classList.remove('jump'); } });
})();
