/* 하단 메뉴(넷바) 알약 이동 — 대체 동작 (11-08, C2)
   브라우저가 페이지 전환 효과(View Transitions, assets/nav.css)를 지원하면 거기서 알약이 움직이므로 이 파일은 할 일 없음.
   지원하지 않는 브라우저(예: 파이어폭스)에서만: 탭을 누를 때 번호를 sessionStorage에 적어 두고 → 다음 페이지가 열릴 때 알약이 이전 탭 자리에서 시작해 새 탭으로 미끄러져 옴.
   - 아이콘 선→채움·색 전환은 nav.css 의 aria-current 규칙 그대로(시작은 이전 탭을 선택 상태로 두었다가 바꿈)
   - 움직임 줄이기 설정이면 움직임 없이 바로 자리만 바뀜. 새 페이지가 뜨는 시간만큼 기다리지 않음(페이지를 막지 않음) */
(() => {
  if ('CSSViewTransitionRule' in window) return;
  const pill = document.querySelector('.nav .pill'); if (!pill) return;
  const links = [...pill.querySelectorAll('a')]; if (!links.length) return;
  const KEY = 'du.nav';
  const cur = Math.max(0, links.findIndex((a) => a.getAttribute('aria-current') === 'page'));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const show = (i) => { links.forEach((a, k) => (k === i ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'))); pill.style.setProperty('--i', i); };

  // 이전 페이지에서 누른 탭이 있으면 거기서 출발
  let from = -1;
  try { const o = JSON.parse(sessionStorage.getItem(KEY) || 'null'); sessionStorage.removeItem(KEY); if (o && Date.now() - o.t < 4000 && Number.isInteger(o.from) && o.from >= 0 && o.from < links.length && o.from !== cur) from = o.from; } catch (e) {}
  if (from >= 0 && !reduce) {
    show(from);
    void pill.offsetWidth;                                          // 시작 자리를 먼저 그린 뒤
    let done = false; const go = () => { if (!done) { done = true; show(cur); } };
    requestAnimationFrame(() => requestAnimationFrame(go));
    setTimeout(go, 120);                                            // 가려진 탭에서 rAF 가 멈춰도 이동
  }

  // 탭을 누르면 지금 탭 번호를 적어 둠(새 페이지에서 이어서 움직임)
  links.forEach((a, i) => a.addEventListener('click', (e) => {
    if (i === cur || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    try { sessionStorage.setItem(KEY, JSON.stringify({ from: cur, t: Date.now() })); } catch (x) {}
  }));
  // 뒤로가기로 돌아온 페이지(bfcache)는 지금 탭에 그대로
  addEventListener('pageshow', (e) => { if (e.persisted) show(cur); });
})();
