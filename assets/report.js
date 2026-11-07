/* 댓글 신고 (11-07, Figma `댓글 · 개선안` 2630:29791 사유 선택 · 2630:29927 접수 토스트)
   openReport() → 가운데 모달 "신고 사유를 선택해주세요"(직접 입력 없음) → 사유 누르면 닫히고 토스트 "신고가 접수됐어요".
   모달: 폭 322(좌우 40), 반경 20, 안쪽 24/20/12, 제목 20 Bold, 사유 줄 높이 52·16/500·아래 선 #d4d4d8(마지막 제외), 딤 .42
   토스트: 검은 사각 반경 8, 14/500, 14/18 */
(() => {
  const REASONS = ['스팸·광고', '욕설·비방', '음란·불쾌한 내용', '개인정보 노출', '기타'];
  const st = document.createElement('style');
  st.textContent = `
dialog.rp { width: min(322px, calc(100vw - 80px)); padding: 24px 20px 12px; border: 0; border-radius: 20px; background: #fff; color: #18181b; text-align: left; font-family: inherit; animation: rpIn .25s cubic-bezier(.16, 1, .3, 1); }
dialog.rp::backdrop { background: rgba(0, 0, 0, .42); }
@keyframes rpIn { from { opacity: 0; transform: scale(.96); } }
.rp h2 { margin: 0 0 8px; font-size: 20px; font-weight: 700; line-height: 1.4; letter-spacing: -0.03em; }
.rp ul { margin: 0; padding: 0; list-style: none; }
.rp li { border-bottom: 1px solid #d4d4d8; } .rp li:last-child { border-bottom: 0; }
.rp li button { display: flex; align-items: center; width: 100%; height: 52px; padding: 0; font: inherit; font-size: 16px; font-weight: 500; letter-spacing: -0.03em; color: inherit; text-align: left; background: none; border: 0; cursor: pointer; transition: opacity .15s; }
.rp li button:active { opacity: .55; }
.rp-toast { position: fixed; left: 50%; bottom: calc(96px + env(safe-area-inset-bottom)); transform: translate(-50%, 12px); width: max-content; max-width: min(440px, calc(100vw - 40px)); padding: 14px 18px; border-radius: 8px; background: #000; color: #fff; font-size: 14px; font-weight: 500; line-height: 1.4; letter-spacing: -0.03em; opacity: 0; pointer-events: none; z-index: 130; transition: opacity .25s, transform .35s cubic-bezier(.16, 1, .3, 1); }
.rp-toast.on { opacity: 1; transform: translate(-50%, 0); }
@media (prefers-reduced-motion: reduce) { dialog.rp { animation: none; } .rp-toast { transition: opacity .01ms; } }`;
  document.head.appendChild(st);
  let tt = 0;
  function toast(msg) {
    let el = document.getElementById('rp-toast');
    if (!el) { el = document.createElement('div'); el.id = 'rp-toast'; el.className = 'rp-toast'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite'); document.body.appendChild(el); }
    el.textContent = msg; void el.offsetWidth; el.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('on'), 2400);
  }
  window.openReport = function (onDone) {
    const d = document.createElement('dialog'); d.className = 'rp'; d.setAttribute('aria-labelledby', 'rp-t');
    d.innerHTML = `<h2 id="rp-t">신고 사유를 선택해주세요</h2><ul>${REASONS.map((r) => `<li><button type="button" data-r="${r}">${r}</button></li>`).join('')}</ul>`;
    document.body.appendChild(d); d.showModal();
    d.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (b) { d.close(); d.remove(); toast('신고가 접수됐어요'); if (onDone) onDone(b.dataset.r); }
      else if (e.target === d) { d.close(); d.remove(); }
    });
    d.addEventListener('close', () => d.remove());
  };
})();
