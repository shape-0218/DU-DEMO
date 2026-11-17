/* 검토용(푸시 대상 아님, 11-16) — 비교 페이지(index.html)가 홈·탐색·전시 상세 iframe에 넣는 스크립트.
   첫 번째 전시의 대표 포스터를 예시 포스터로 바꾸고, 부모의 상태(parent.PF)대로 보여 줌.
   PF = { v: 'now'|'a'|'b'|'c', src, w, h, edge, mode: 'fill'|'fit', bg: 'poster'|'white'|'gray'|'black', crop } */
(() => {
  const page = (location.pathname.split('/').pop() || '').replace(/\?.*$/, '');
  const S = () => { try { return parent.PF; } catch (e) { return null; } };
  const GRAY = '#f4f4f5';
  const css = document.createElement('style');
  css.textContent = `.pf-blur { position: absolute; inset: -12%; width: 124% !important; height: 124% !important; max-width: none; object-fit: cover !important; filter: blur(24px) saturate(1.15) brightness(.82); pointer-events: none; }
.pf-host { isolation: isolate; }`;
  document.head.appendChild(css);

  const color = (st) => st.v === 'a' ? GRAY : ({ poster: st.edge, white: '#ffffff', gray: GRAY, black: '#000000' }[st.bg] || st.edge);
  const cropStyle = (r) => `position:absolute;max-width:none;object-fit:fill;width:${(100 / r.w).toFixed(3)}%;height:${(100 / r.h).toFixed(3)}%;left:${(-r.x / r.w * 100).toFixed(3)}%;top:${(-r.y / r.h * 100).toFixed(3)}%`;

  /* box = 비율이 정해진 칸(overflow hidden), img = 칸 안의 그림. detail이면 '꽉 채우기'여도 상세 규칙(전체 + 연한 회색) */
  function paint(box, img, st, detail) {
    box.classList.add('pf-host');
    let blur = box.querySelector(':scope > .pf-blur');
    if (img.getAttribute('src') !== st.src) img.src = st.src;
    img.removeAttribute('srcset'); img.style.opacity = '1';
    const fit = st.mode === 'fit';
    if (!fit && !detail) {
      img.style.cssText = st.crop ? cropStyle(st.crop) : 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover';
      box.style.background = ''; if (blur) blur.remove(); return;
    }
    /* z-index를 주지 않음: 홈의 그라데이션(.shade-active)·옆 포스터 어둡게(.dim·.shade-side)·순위 숫자가 지금처럼 포스터 위에 그대로 덮여야 함(11-16 사용자).
       흐린 배경은 칸의 맨 앞 자식이라 순서만으로 포스터 뒤에 깔림 */
    img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain';
    if (fit && st.v === 'c') {
      if (!blur) { blur = document.createElement('img'); blur.className = 'pf-blur'; blur.alt = ''; blur.setAttribute('aria-hidden', 'true'); box.insertBefore(blur, box.firstChild); }
      if (blur.getAttribute('src') !== st.src) blur.src = st.src;
      box.style.background = '#000';
    } else {
      if (blur) blur.remove();
      box.style.background = fit ? color(st) : GRAY;
    }
  }

  function apply() {
    const st = S(); if (!st || !st.src) return;
    if (page === 'home.html') {
      const poster = document.querySelector('.rail .slot .poster'); if (!poster) return;
      const img = poster.querySelector(':scope > img'); if (!img) return;
      poster.querySelectorAll('video').forEach((v) => { v.pause && v.pause(); v.remove(); });
      paint(poster, img, st, false);
    } else if (page === 'explore.html') {
      const box = document.querySelector('.card.ex .im > div'); if (!box) return;
      const img = box.querySelector('img'); if (!img) return;
      paint(box, img, st, false);
    } else if (page === 'exhibition.html') {
      const ps = document.querySelector('.poster .ps'); if (!ps) return;
      let img = ps.querySelector(':scope > img');
      if (!img || ps.querySelector('video')) { ps.innerHTML = '<img alt="전시 포스터">'; img = ps.querySelector('img'); }
      ps.style.position = 'relative'; ps.style.overflow = 'hidden';
      paint(ps, img, st, true);
    }
  }
  window.PF_apply = apply;
  apply();
  /* 페이지가 다시 그리면(스켈레톤 → 실제, 탭 전환) 다시 적용 */
  let t = 0;
  new MutationObserver(() => { clearTimeout(t); t = setTimeout(apply, 40); }).observe(document.body, { childList: true, subtree: true });
})();
