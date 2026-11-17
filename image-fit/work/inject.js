/* 검토용(푸시 대상 아님, 11-16) — 비교 페이지(index.html)가 메인·탐색·전시 상세·작품 상세 iframe에 넣는 스크립트.
   첫 번째 작품의 대표 사진을 예시 사진으로 바꾸고, 부모의 상태(parent.PF)대로 보여 줌(포스터 D안과 같은 규칙).
   PF = { v: 'now'|'d', src, w, h, edge, mode: 'fill'|'fit', crop } */
(() => {
  const page = (location.pathname.split('/').pop() || '').replace(/\?.*$/, '');
  const S = () => { try { return parent.PF; } catch (e) { return null; } };
  const GRAY = '#f4f4f5';
  const cropStyle = (r) => `position:absolute;max-width:none;object-fit:fill;width:${(100 / r.w).toFixed(3)}%;height:${(100 / r.h).toFixed(3)}%;left:${(-r.x / r.w * 100).toFixed(3)}%;top:${(-r.y / r.h * 100).toFixed(3)}%`;

  /* box = 비율이 정해진 칸, img = 칸 안의 그림. detail이면 '꽉 채우기'여도 상세 규칙(전체 + 연한 회색).
     z-index를 주지 않아 칸 위에 덮이는 것(배지·그라데이션 등)은 지금처럼 위에 남음 */
  function paint(box, img, st, detail) {
    if (img.getAttribute('src') !== st.src) img.src = st.src;
    img.removeAttribute('srcset'); img.style.opacity = '1'; img.style.transform = '';
    if (getComputedStyle(box).position === 'static') box.style.position = 'relative';
    box.style.overflow = 'hidden';
    const fit = st.mode === 'fit';
    if (!fit && !detail) {
      img.style.cssText = st.crop ? cropStyle(st.crop) : 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover';
      box.style.background = ''; return;
    }
    img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain';
    box.style.background = fit ? (detail && st.dfill ? st.dfill : st.edge) : GRAY;   // dfill: 상세만 다른 색(제안 · 흰 바탕 = 상세 연한 회색)
  }

  function apply() {
    const st = S(); if (!st || !st.src) return;
    let box = null;
    if (page === 'home.html') box = document.querySelector('#art-row .art .im > div');
    else if (page === 'explore.html') box = document.querySelector('.card.wk .im > div');
    else if (page === 'exhibition.html') box = document.querySelector('#works .w .im > div') || document.querySelector('.w .im > div');
    else if (page === 'work.html') box = document.querySelector('.stage .slide');
    if (!box) return;
    let img = box.querySelector(':scope > img');
    if (!img || box.querySelector('video')) { box.innerHTML = '<img alt="작품 사진">'; img = box.querySelector('img'); }
    paint(box, img, st, page === 'work.html');
    /* 처음 한 번: 메인은 ARTWORKS 줄, 전시 상세는 작품 탭이 보이게 iframe 안에서 스크롤 */
    /* scrollIntoView는 바깥 비교 페이지까지 같이 내려 버려서, iframe 자기 창만 스크롤 */
    if (!window.__pfScrolled && (page === 'home.html' || page === 'exhibition.html')) { window.__pfScrolled = true; setTimeout(() => { const r = box.getBoundingClientRect(); window.scrollTo(0, Math.max(0, scrollY + r.top - (innerHeight - r.height) / 2)); }, 300); }
  }
  window.PF_apply = apply;
  apply();
  let t = 0;
  new MutationObserver(() => { clearTimeout(t); t = setTimeout(apply, 40); }).observe(document.body, { childList: true, subtree: true });
})();
