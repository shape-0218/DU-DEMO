/* 문의하기 시트 (11-25 U-193) — 홈 바닥글 '문의하기'를 누르면 마이 드로어와 같은 문의 시트를 띄움
   모양은 my.html `.sheet.bot` 문의 시트와 같게(손잡이 40×4 · 제목 20 Bold · '자주 묻는 질문 ›' 16 · 56 · 주소 16/500 · [주소 복사 · 메일 보내기] 44 · 반경 12),
   폰은 아래에 붙는 시트, 768 이상은 가운데 480 카드. 주소 복사 → 시트 닫고 토스트 "주소를 복사했어요"(승인된 토스트: 검정 반경 8 · 14/500 · 가운데).
   쓰는 법: <a href="#" data-contact>문의하기</a> + <script src="assets/contact.js"></script>  (window.Contact.open()으로도 열 수 있음)
   결정: 시안 review/contact-v2 · CHANGELOG W-28 7차(드로어 A · 누르면 문의 시트) */
(() => {
  const MAIL = 'displayu.official@gmail.com';   // 약관의 문의 창구
  const css = document.createElement('style');
  css.textContent = `
.ct-dlg { position: fixed; inset: auto 0 0 0; width: 100%; max-width: 100%; margin: 0; padding: 12px 20px max(16px, env(safe-area-inset-bottom)); border: 0; border-radius: 20px 20px 0 0; background: #fff; color: var(--text-primary, #18181b); max-height: 92dvh; overflow-y: auto; animation: ctUp .35s cubic-bezier(.16, 1, .3, 1); }
.ct-dlg::backdrop { background: rgba(0, 0, 0, .42); animation: ctFade .25s ease; }
.ct-dlg.out { animation: ctDown .22s cubic-bezier(.16, 1, .3, 1) forwards; }
.ct-dlg.out::backdrop { animation: ctFadeOut .22s ease forwards; }
@media (min-width: 768px) { .ct-dlg { inset: auto auto 6vh 50%; width: 480px; margin-left: -240px; border-radius: 20px; } }
@keyframes ctUp { from { transform: translateY(24px); opacity: 0; } }
@keyframes ctDown { to { transform: translateY(24px); opacity: 0; } }
@keyframes ctFade { from { opacity: 0; } }
@keyframes ctFadeOut { to { opacity: 0; } }
.ct-dlg .ct-gr { width: 40px; height: 4px; margin: 2px auto 14px; border-radius: 4px; background: #d4d4d8; }
.ct-dlg h2 { margin: 0; font-size: 20px; font-weight: 700; line-height: 1.4; letter-spacing: -0.03em; }
.ct-dlg .ct-faq { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 56px; margin-top: 16px; border-block: 1px solid var(--bg-teritary, #f0f0f3); font-size: 16px; font-weight: 500; line-height: 1.4; letter-spacing: -0.03em; color: var(--text-primary, #18181b); text-decoration: none; }
.ct-dlg .ct-faq svg { flex: none; width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
@media (hover: hover) { .ct-dlg .ct-faq:hover span { text-decoration: underline; text-underline-offset: 3px; } }
.ct-dlg .ct-mail { margin: 16px 0 0; font-size: 16px; font-weight: 500; line-height: 1.4; letter-spacing: -0.03em; word-break: break-all; user-select: all; }
.ct-dlg .ct-acts { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 24px; }
.ct-dlg .ct-btn { display: grid; place-items: center; height: 44px; padding: 0; border: 0; border-radius: 12px; background: var(--text-primary, #18181b); color: #fafafa; font: inherit; font-size: 14px; font-weight: 600; letter-spacing: -0.03em; text-decoration: none; cursor: pointer; touch-action: manipulation; transition: transform .16s cubic-bezier(.16, 1, .3, 1); }
.ct-dlg .ct-btn.sub { background: var(--bg-secondary, #f4f4f5); color: var(--text-primary, #18181b); }
.ct-dlg .ct-btn:active { transform: scale(.96); }
.ct-toast { position: fixed; left: 50%; bottom: calc(110px + env(safe-area-inset-bottom)); transform: translate(-50%, 16px); opacity: 0; pointer-events: none; z-index: 95; padding: 14px 18px; border-radius: 8px; background: #000; color: #fff; font-size: 14px; font-weight: 500; line-height: 1.4; letter-spacing: -0.03em; white-space: nowrap; transition: opacity .25s, transform .35s cubic-bezier(.16, 1, .3, 1); }
.ct-toast.on { opacity: 1; transform: translate(-50%, 0); }
@media (prefers-reduced-motion: reduce) { .ct-dlg, .ct-dlg::backdrop, .ct-dlg.out, .ct-dlg.out::backdrop { animation: none; } .ct-toast, .ct-dlg .ct-btn { transition: none; } }
`;
  document.head.appendChild(css);

  let tt;
  function toast(msg) {
    let t = document.querySelector('.ct-toast');
    if (!t) { t = document.createElement('div'); t.className = 'ct-toast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2200);
  }

  function open() {
    const old = document.querySelector('.ct-dlg'); if (old) old.remove();
    const d = document.createElement('dialog');
    d.className = 'ct-dlg'; d.setAttribute('aria-labelledby', 'ct-t');
    d.innerHTML = `<div class="ct-gr" aria-hidden="true"></div><h2 id="ct-t">문의하기</h2>
      <a class="ct-faq" href="terms.html?doc=faq"><span>자주 묻는 질문</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></a>
      <p class="ct-mail">${MAIL}</p>
      <div class="ct-acts"><button type="button" class="ct-btn sub" data-copy>주소 복사</button><a class="ct-btn" href="mailto:${MAIL}" data-send>메일 보내기</a></div>`;
    let closing = false;
    const close = () => {
      if (closing) return; closing = true;
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) { d.close(); d.remove(); return; }
      d.classList.add('out'); setTimeout(() => { d.close(); d.remove(); }, 220);
    };
    d.querySelector('[data-copy]').addEventListener('click', async () => { try { await navigator.clipboard.writeText(MAIL); } catch (e) {} close(); toast('주소를 복사했어요'); });
    d.querySelector('[data-send]').addEventListener('click', () => setTimeout(close, 300));
    d.addEventListener('click', (e) => {   // 바깥 어두운 영역을 눌렀을 때만 닫기
      if (e.target !== d) return; const r = d.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close();
    });
    d.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
    document.body.appendChild(d); d.showModal();
    return d;
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('[data-contact]');
    if (!a) return; e.preventDefault(); open();
  });
  window.Contact = { open };
})();
