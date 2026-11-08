/* 뒤로가기(.back)가 스크롤을 따라다니는 동안 탭 줄과 겹치지 않게 (11-09, 전시·작품 상세 공통)
   - 탭 줄이 화면 맨 위에 붙으면(= .stuck) 왼쪽에 뒤로가기 자리(44 + 간격)를 비워서 탭 글자가 가려지지 않게 함
   - 스크롤을 읽지 않고 IntersectionObserver 하나로 감시(스크롤 중 레이아웃 읽기 금지 점검표)
   - 밀리는 동안 밑줄(.ind)이 같이 따라가도록 onShift(밑줄 다시 놓기)를 짧게 반복 */
window.StickBack = (() => {
  function init({ tabs, onShift }) {
    if (!tabs || !('IntersectionObserver' in window)) return;
    const sent = document.createElement('i');
    sent.className = 'tsent'; sent.setAttribute('aria-hidden', 'true');
    tabs.parentNode.insertBefore(sent, tabs);
    let io = null, timer = 0;
    const topPx = () => parseFloat(getComputedStyle(tabs).top) || 0;
    function settle() {
      if (!onShift) return;
      const t0 = performance.now();
      onShift();
      const tick = () => { onShift(); if (performance.now() - t0 < 300) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
      clearTimeout(timer); timer = setTimeout(onShift, 330);   // 패널처럼 rAF가 멈춘 곳에서도 마지막 위치는 맞춤
    }
    function set(on) {
      if (tabs.classList.contains('stuck') === on) return;
      tabs.classList.toggle('stuck', on);
      settle();
    }
    function watch() {
      if (io) io.disconnect();
      io = new IntersectionObserver(([e]) => {
        set(!e.isIntersecting && e.boundingClientRect.top < (e.rootBounds ? e.rootBounds.top : 0));
      }, { rootMargin: `${-Math.round(topPx())}px 0px 0px 0px`, threshold: [0, 1] });
      io.observe(sent);
    }
    watch();
    addEventListener('resize', watch);   // --top 이 폭에 따라 0/64로 바뀜
  }
  return { init };
})();
