/* 하단 메뉴(넷바) 알약 이동 보조 (11-08, C2)
   홈·탐색·마이는 서로 다른 페이지라서, 새 페이지가 뜨길 기다리면 알약이 한참 멈춰 있다가 움직여 끊겨 보임. 이 파일이 그 틈을 메움.
   - 페이지 전환 효과(View Transitions, assets/nav.css)를 지원하는 브라우저: 탭을 누르는 순간 알약·아이콘을 먼저 움직임(기다리지 않음).
     브라우저가 이동 중인 모습 그대로 찍어 두었다가 새 페이지에서 그 위치에서 이어받아 끝까지 움직임
   - 지원하지 않는 브라우저(예: 파이어폭스): 탭 번호를 sessionStorage에 적어 두고, 다음 페이지가 열릴 때 이전 탭 자리에서 새 탭으로 움직임
   - 움직임 줄이기 설정이면 움직임 없이 바로 자리만 바뀜. 새 탭 클릭은 막지 않음(링크 이동은 그대로) */
(() => {
  const pill = document.querySelector('.nav .pill'); if (!pill) return;
  const links = [...pill.querySelectorAll('a')]; if (!links.length) return;
  const cur = Math.max(0, links.findIndex((a) => a.getAttribute('aria-current') === 'page'));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const show = (i) => { links.forEach((a, k) => (k === i ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'))); pill.style.setProperty('--i', i); };
  const plain = (e) => !(e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey);   // 새 탭·창으로 여는 클릭은 제외
  // 뒤로가기로 돌아온 페이지(bfcache)는 지금 탭에 그대로
  addEventListener('pageshow', (e) => { if (e.persisted) show(cur); });

  if ('CSSViewTransitionRule' in window) {
    links.forEach((a, i) => a.addEventListener('click', (e) => {
      if (i === cur || reduce || !plain(e)) return;
      show(i);
      setTimeout(() => show(cur), 4000);                            // 이동이 4초 넘게 안 되면(취소·느린 망) 원래 탭으로
    }));
    return;
  }

  // ---- 대체 동작(전환 효과 미지원) ----
  const KEY = 'du.nav';
  let from = -1;
  try { const o = JSON.parse(sessionStorage.getItem(KEY) || 'null'); sessionStorage.removeItem(KEY); if (o && Date.now() - o.t < 4000 && Number.isInteger(o.from) && o.from >= 0 && o.from < links.length && o.from !== cur) from = o.from; } catch (e) {}
  if (from >= 0 && !reduce) {
    show(from);
    void pill.offsetWidth;                                          // 시작 자리를 먼저 그린 뒤
    let done = false; const go = () => { if (!done) { done = true; show(cur); } };
    requestAnimationFrame(() => requestAnimationFrame(go));
    setTimeout(go, 120);                                            // 가려진 탭에서 rAF 가 멈춰도 이동
  }
  links.forEach((a, i) => a.addEventListener('click', (e) => {
    if (i === cur || !plain(e)) return;
    try { sessionStorage.setItem(KEY, JSON.stringify({ from: cur, t: Date.now() })); } catch (x) {}
  }));
})();
