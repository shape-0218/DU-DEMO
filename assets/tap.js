/* 터치 영역 44 보장 (11-08, TYPE-RULES §3 "터치 영역 44 이상(보이는 크기가 작으면 투명 영역으로 확장)")
   보이는 크기는 그대로 두고, 44보다 작은 버튼·링크에만 투명한 ::after를 덧대 누르는 영역을 늘린다(레이아웃 변화 없음).
   - 이미 ::after를 쓰는 요소, 가려진 요소(크기 0)는 건너뜀 · overflow:hidden 안의 요소는 잘려서 늘어나지 않을 수 있음
   - 나중에 그려지는 요소(목록·시트)는 MutationObserver로 다시 확인 */
(() => {
  const MIN = 44;
  const st = document.createElement('style');
  st.textContent = '.tap44r { position: relative; } .tap44::after { content: ""; position: absolute; inset: var(--tv, 0) var(--th, 0); }';
  document.head.appendChild(st);
  const SEL = 'button, a[href], [role="button"], [role="tab"], summary';
  function fix(root) {
    (root || document).querySelectorAll(SEL).forEach((el) => {
      if (el.dataset.tap) return;
      const r = el.getBoundingClientRect(); if (!r.width || !r.height) return;   // 아직 안 보임 → 다음에
      const cs0 = getComputedStyle(el), bv = parseFloat(cs0.borderTopWidth) + parseFloat(cs0.borderBottomWidth), bh = parseFloat(cs0.borderLeftWidth) + parseFloat(cs0.borderRightWidth);   // ::after는 안쪽 여백 상자 기준이라 테두리만큼 보정
      const dv = Math.max(0, (MIN - (r.height - bv)) / 2), dh = Math.max(0, (MIN - (r.width - bh)) / 2);
      if (r.height >= MIN && r.width >= MIN) { el.dataset.tap = 'ok'; return; }
      if (getComputedStyle(el, '::after').content !== 'none') { el.dataset.tap = 'skip'; return; }
      if (getComputedStyle(el).position === 'static') el.classList.add('tap44r');
      el.style.setProperty('--tv', '-' + dv + 'px'); el.style.setProperty('--th', '-' + dh + 'px');
      el.classList.add('tap44'); el.dataset.tap = '1';
    });
  }
  let t;
  const later = () => { clearTimeout(t); t = setTimeout(() => fix(), 120); };
  const start = () => { fix(); new MutationObserver(later).observe(document.body, { childList: true, subtree: true }); addEventListener('resize', later); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  addEventListener('load', later);
})();
