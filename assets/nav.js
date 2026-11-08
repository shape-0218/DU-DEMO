/* 하단 메뉴(넷바) 알약 이동 (11-08, 사용자 선택 C)
   홈·탐색·마이는 서로 다른 페이지. 탭을 누르면 기다림 없이 바로 페이지를 넘기고(링크 그대로), 번호만 sessionStorage에 적어 둠.
   새 페이지가 뜨면 알약이 이전 탭 자리에서 출발해 새 탭으로 이동(nav.css 의 transform 전환, 280ms·곡선 .2,0,0,1) — 매번 정지 상태에서 출발.
   아이콘 선→채움은 알약 안의 채움 아이콘 줄이 같이 움직여 알약이 지나가는 자리에서만 보임(nav.css), 여기서는 --i 만 바꾸면 됨.
   - 움직임 줄이기 설정이면 움직임 없이 바로 자리만 바뀜. 새 탭·창으로 여는 클릭은 건드리지 않음
   - 4초가 지났거나 같은 탭이면 움직임 없이 제자리. 뒤로가기(bfcache)로 돌아오면 지금 탭에 그대로 */
(() => {
  const pill = document.querySelector('.nav .pill'); if (!pill) return;
  const links = [...pill.querySelectorAll('a')]; if (!links.length) return;
  const cur = Math.max(0, links.findIndex((a) => a.getAttribute('aria-current') === 'page'));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const plain = (e) => !(e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey);   // 새 탭·창으로 여는 클릭은 제외
  const KEY = 'du.nav';
  // 이전 페이지에서 누른 탭이 있으면 거기서 출발
  let from = -1;
  try { const o = JSON.parse(sessionStorage.getItem(KEY) || 'null'); sessionStorage.removeItem(KEY); if (o && Date.now() - o.t < 4000 && Number.isInteger(o.from) && o.from >= 0 && o.from < links.length && o.from !== cur) from = o.from; } catch (e) {}
  if (from >= 0 && !reduce) {
    pill.style.setProperty('--i', from);                            // 이전 탭 자리에서 시작
    void pill.offsetWidth;                                          // 시작 자리를 먼저 반영한 뒤
    let done = false; const go = () => { if (!done) { done = true; pill.style.setProperty('--i', cur); } };
    requestAnimationFrame(() => requestAnimationFrame(go));
    setTimeout(go, 60);                                             // 가려진 탭에서 rAF 가 멈춰도 이동
  }
  // 탭을 누르면 지금 탭 번호를 적어 둠(새 페이지에서 이어서 움직임)
  links.forEach((a, i) => a.addEventListener('click', (e) => {
    if (i === cur || !plain(e)) return;
    try { sessionStorage.setItem(KEY, JSON.stringify({ from: cur, t: Date.now() })); } catch (x) {}
  }));
  // 뒤로가기로 돌아온 페이지(bfcache)는 지금 탭에 그대로
  addEventListener('pageshow', (e) => { if (e.persisted) pill.style.setProperty('--i', cur); });
})();
