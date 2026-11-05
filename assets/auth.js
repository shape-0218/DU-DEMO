/* 로그인 필요 안내 (데모) — 비로그인 상태에서 로그인이 필요한 동작을 누르면 현재 화면 위에 띄움
   폰·태블릿(768 미만)은 바텀시트, 웹(768 이상)은 가운데 모달 (11-05 사용자 결정)
   문구·버튼은 Figma `Sheet Content / 로그인 안내` 2638:29526 그대로. 소셜 로그인은 카카오·Google 두 가지.
   데모라 실제 로그인은 없고, 버튼을 누르면 로그인된 것으로 바꾼 뒤 누르려던 동작을 이어서 실행함.
   상태: localStorage `du.auth` ('1' 로그인 / '0' 비로그인, 기본 로그인). 주소 ?login=0 / ?login=1 로 바꿀 수 있음.
   로그인이 필요한 것(기능명세 3-3): 마이 진입, 저장, 좋아요, 댓글(후기·방명록 작성·댓글 좋아요·답글) + 전시 등록·관리 화면 */
(() => {
  const KEY = 'du.auth';
  let mem = true;
  const ok = () => { try { const v = localStorage.getItem(KEY); return v === null ? mem : v !== '0'; } catch (e) { return mem; } };
  const set = (v) => { mem = v; try { localStorage.setItem(KEY, v ? '1' : '0'); } catch (e) {} };
  const q = new URLSearchParams(location.search);
  if (q.get('login') === '0') set(false);
  if (q.get('login') === '1') set(true);

  const page = (location.pathname.split('/').pop() || 'index.html').replace(/\?.*$/, '');
  const PROTECTED = ['my.html', 'manage.html', 'hub.html', 'team.html', 'works.html', 'section.html', 'verify.html', 'exhibition-new.html', 'work-new.html'];
  const GATE = '.save, #like, .like, .act .lk, .act button, a[href^="my.html"], a[href^="manage.html"], a[href^="hub.html"], a[href^="team.html"], a[href^="works.html"], a[href^="section.html"], a[href^="verify.html"], a[href^="exhibition-new.html"], a[href^="work-new.html"]';

  const css = document.createElement('style');
  css.textContent = `
.au-modal { width: min(322px, calc(100vw - 80px)); max-width: none; padding: 24px 20px 20px; border: 0; border-radius: 20px; background: #fff; color: var(--text-primary, #18181b); text-align: left; box-shadow: 0 10px 40px rgba(0,0,0,.12); }
.au-modal::backdrop { background: rgba(0,0,0,.45); }
.au-modal[open] { animation: au-in .22s cubic-bezier(.2,.8,.2,1); }
@keyframes au-in { from { opacity: 0; transform: translateY(8px) scale(.98); } }
@media (prefers-reduced-motion: reduce) { .au-modal[open] { animation: none; } }
.au-grab { display: none; }
/* 폰·태블릿(768 미만)은 바텀시트: 아래에 붙고 위쪽만 둥글게, 손잡이 표시 (Figma 비로그인 · 로그인 유도 2638:29542) */
@media (max-width: 767px) {
  .au-modal { position: fixed; inset: auto 0 0 0; margin: 0; width: 100%; max-width: 100%; padding: 12px 20px calc(20px + env(safe-area-inset-bottom)); border-radius: 20px 20px 0 0; box-shadow: none; }
  .au-modal[open] { animation: au-up .3s cubic-bezier(.2,.8,.2,1); }
  .au-grab { display: block; width: 36px; height: 4px; margin: 0 auto 20px; border-radius: 9999px; background: var(--bg-teritary, #e4e4e7); }
}
@keyframes au-up { from { transform: translateY(100%); } }
@media (prefers-reduced-motion: reduce) { .au-modal[open] { animation: none; } }
.au-modal h2 { font-size: 20px; line-height: 1.4; font-weight: 600; letter-spacing: -0.03em; }
.au-modal p { margin-top: 6px; font-size: 14px; line-height: 1.5; color: var(--text-secondary, #52525b); word-break: keep-all; text-wrap: pretty; }
.au-btns { display: grid; gap: 8px; margin-top: 20px; }
.au-btns button { position: relative; display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; height: 54px; border-radius: 12px; font: inherit; font-size: 16px; font-weight: 600; cursor: pointer; transition: transform .15s, filter .2s; }
.au-btns button:active { transform: scale(.98); }
.au-btns svg { position: absolute; left: 18px; width: 20px; height: 20px; }
.au-kakao { border: 0; background: #FEE500; color: rgba(0,0,0,.85); }
.au-kakao:hover { filter: brightness(.97); }
.au-google { border: 1px solid var(--border-primary, #e4e4e7); background: #fff; color: var(--text-primary, #18181b); }
.au-google:hover { background: var(--bg-secondary, #f4f4f5); }
.au-skip { display: block; margin: 16px auto 0; padding: 4px 8px; border: 0; background: none; font: inherit; font-size: 12px; font-weight: 500; color: var(--text-teritary, #71717a); cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
`;
  document.head.appendChild(css);

  const KAKAO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4C7 4 3 7.1 3 10.9c0 2.4 1.6 4.6 4.1 5.8l-.9 3.4c-.1.3.3.6.6.4l4-2.6c.4 0 .8.1 1.2.1 5 0 9-3.1 9-6.9S17 4 12 4z" fill="#000"/></svg>';
  const GOOGLE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z"/><path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.7V6.6H1.4a12 12 0 0 0 0 10.8z"/><path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8z"/></svg>';

  let dlg = null;
  function open(onLogin, onSkip) {
    if (dlg) dlg.remove();
    dlg = document.createElement('dialog');
    dlg.className = 'au-modal'; dlg.setAttribute('aria-labelledby', 'au-t'); dlg.setAttribute('aria-describedby', 'au-d');
    dlg.innerHTML = `<span class="au-grab" aria-hidden="true"></span><h2 id="au-t">로그인이 필요해요</h2><p id="au-d">로그인하면 저장한 전시·작품·작가를 모아볼 수 있어요</p>
      <div class="au-btns"><button type="button" class="au-kakao" data-p="kakao">${KAKAO}카카오로 시작하기</button><button type="button" class="au-google" data-p="google">${GOOGLE}Google로 시작하기</button></div>
      <button type="button" class="au-skip">비회원으로 계속 둘러보기</button>`;
    const d = dlg; let done = false;
    const finish = (loggedIn) => {
      if (done) return; done = true;
      if (d.open) d.close(); d.remove(); if (dlg === d) dlg = null;
      if (loggedIn) { set(true); if (onLogin) onLogin(); } else if (onSkip) onSkip();
    };
    d.querySelectorAll('.au-btns button').forEach((b) => b.addEventListener('click', () => finish(true)));
    d.querySelector('.au-skip').addEventListener('click', () => finish(false));
    d.addEventListener('click', (e) => { /* 바깥 어두운 영역을 눌렀을 때만 닫기(모달 안쪽 여백은 제외) */
      if (e.target !== d) return; const r = d.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) finish(false);
    });
    d.addEventListener('cancel', (e) => { e.preventDefault(); finish(false); });
    d.addEventListener('close', () => finish(false));
    document.body.appendChild(d); d.showModal();
  }

  // 로그인이 필요한 버튼·링크: 누르기 전에 가로채서 모달, 로그인하면 원래 동작을 이어서
  document.addEventListener('click', (e) => {
    if (ok()) return;
    const el = e.target.closest && e.target.closest(GATE);
    if (!el || el.disabled || el.closest('.au-modal')) return;
    e.preventDefault(); e.stopImmediatePropagation();
    open(() => { if (el.tagName === 'A') location.href = el.href; else el.click(); });
  }, true);
  // 후기·방명록 글 입력칸: 누르는 순간(포커스 전에) 막고 모달, 키보드로 들어온 경우는 focusin에서 막음
  const INPUT = 'input[aria-label$="글 입력"], textarea[aria-label$="글 입력"]';
  document.addEventListener('pointerdown', (e) => {
    if (ok()) return;
    const el = e.target.closest && e.target.closest(INPUT);
    if (!el || el.disabled) return;
    e.preventDefault(); open(() => el.focus());
  }, true);
  document.addEventListener('focusin', (e) => {
    if (dlg) return;
    if (ok()) return;
    const el = e.target.closest && e.target.closest('input[aria-label$="글 입력"], textarea[aria-label$="글 입력"]');
    if (!el || el.disabled) return;
    el.blur(); open(() => el.focus());
  }, true);
  // 로그인해야만 들어올 수 있는 화면에 바로 들어온 경우
  const guard = () => { if (!ok() && PROTECTED.includes(page)) open(() => location.reload(), () => { location.href = 'home.html'; }); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', guard); else guard();

  window.Auth = { ok, open, logout: () => set(false), login: () => set(true) };
})();
