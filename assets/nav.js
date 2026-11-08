/* 하단 메뉴(넷바) 알약 이동 (11-08 사용자 선택 C, 11-09 출발 시점 보강)
   홈·탐색·마이는 서로 다른 페이지. 탭을 누르면 기다림 없이 바로 페이지를 넘기고(링크 그대로), 이전 탭 번호만 sessionStorage 에 적어 둠.
   새 페이지에서 알약이 이전 탭 자리에서 출발해 새 탭으로 이동(nav.css 의 transform 전환, 280ms·곡선 .2,0,0,1) — 매번 정지 상태에서 출발.
   아이콘 선→채움은 알약 안의 채움 아이콘 줄이 같이 움직여 알약이 지나가는 자리에서만 보임(nav.css).

   ★ 이 파일은 각 페이지 <head> 에서 먼저 불러온다(페이지 끝 X). 이유(11-09):
   · 출발 자리를 페이지 끝에서 정하면, 느린 망에서 첫 화면이 먼저 그려져 알약이 새 탭 자리에 보였다가 → 이전 자리로 되돌아가 → 이동("뚝")
     → 머리에서 <html data-nav-from> 을 먼저 달아 알약이 처음 그려질 때부터 이전 탭 자리에 있게 함(nav.css 가 --i 를 덮어씀)
   · Chrome 이 다음 페이지를 미리 그려 두면(speculationrules prerender) 탭을 누르기 전에 스크립트가 돌아 이전 탭 번호를 못 읽음
     → 미리 그린 페이지는 화면에 "활성화"될 때(prerenderingchange) 읽음
   · 움직임은 새 페이지가 실제로 화면에 나온 뒤(pagereveal, 없으면 바로) 알약이 있을 때 시작 — 안 보이는 사이에 끝나 버리지 않게
   - 움직임 줄이기 설정이면 기록도 이동도 없음. 새 탭·창으로 여는 클릭은 건드리지 않음
   - 4초가 지났거나 같은 탭이면 움직임 없이 제자리. 뒤로가기(bfcache)로 돌아오면 지금 탭에 그대로 */
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const d = document.documentElement;
  const KEY = 'du.nav', SLOTS = 3;
  let from = -1, armed = false, done = false;
  let revealed = !('PageRevealEvent' in window);          // pagereveal 을 지원하지 않으면 기다리지 않음

  const clear = () => { done = true; d.removeAttribute('data-nav-from'); d.style.removeProperty('--nav-from'); };

  // 알약이 있고 + 화면에 처음 나온 뒤에만 출발: 먼저 이전 탭 자리가 한 프레임 그려진 다음 속성을 떼면 알약이 새 탭으로 이동
  const arm = (pill) => {
    if (armed || done || !pill || !revealed) return;
    armed = true;
    requestAnimationFrame(() => requestAnimationFrame(clear));
    setTimeout(clear, 300);                                // 가려진 탭에서 rAF 가 멈춰도 이동
  };

  let pillNow = null;
  const found = () => {
    const pill = document.querySelector('.nav .pill'); if (!pill) return false;
    const links = pill.querySelectorAll('a');
    const cur = Math.max(0, [...links].findIndex((a) => a.getAttribute('aria-current') === 'page'));
    if (from >= links.length || from === cur) { clear(); return true; }
    void pill.offsetWidth;                                 // 이전 탭 자리를 먼저 반영해서 전환이 거기서 출발하게
    pillNow = pill; arm(pill); return true;
  };

  const begin = () => {
    try {
      const o = JSON.parse(sessionStorage.getItem(KEY) || 'null'); sessionStorage.removeItem(KEY);
      if (o && Date.now() - o.t < 4000 && Number.isInteger(o.from) && o.from >= 0 && o.from < SLOTS) from = o.from;
    } catch (e) {}
    if (from < 0) return;
    d.style.setProperty('--nav-from', from);
    d.setAttribute('data-nav-from', '');
    if (found()) return;
    const mo = new MutationObserver(() => { if (found()) mo.disconnect(); });   // 알약 마크업이 해석되는 즉시
    mo.observe(d, { childList: true, subtree: true });
    document.addEventListener('DOMContentLoaded', () => { mo.disconnect(); if (!pillNow && !done && !found()) clear(); }, { once: true });
  };

  if (document.prerendering) document.addEventListener('prerenderingchange', begin, { once: true });
  else begin();

  if (!revealed) {
    addEventListener('pagereveal', () => { revealed = true; arm(pillNow); });
    setTimeout(() => { revealed = true; arm(pillNow); }, 1500);   // pagereveal 을 못 받은 경우 대비
  }

  // 탭을 누르면 지금 탭 번호를 적어 둠(새 페이지에서 이어서 움직임)
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;   // 새 탭·창으로 여는 클릭은 제외
    const a = e.target.closest && e.target.closest('.nav a'); if (!a) return;
    const links = [...a.parentElement.querySelectorAll('a')];
    const i = links.indexOf(a), cur = links.findIndex((x) => x.getAttribute('aria-current') === 'page');
    if (i < 0 || cur < 0 || i === cur) return;
    try { sessionStorage.setItem(KEY, JSON.stringify({ from: cur, t: Date.now() })); } catch (x) {}
  });

  // 뒤로가기로 돌아온 페이지(bfcache)는 지금 탭에 그대로
  addEventListener('pageshow', (ev) => { if (ev.persisted) clear(); });
})();
