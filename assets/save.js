/* 저장 버튼 공용 (전시 저장 · 작품 저장 · 작가 저장) — 같은 규칙으로 동작
   - 저장 전: "{전시|작품|작가} 저장" + 북마크 윤곽 / 저장 후: "저장됨" + 채운 북마크 + 회색 바탕, 다시 누르면 취소(확인 모달 없음)
   - 저장하면 "보관함에 저장했어요 · 보기"(마이 보관함 해당 탭으로), 취소하면 "저장을 취소했어요"
   - 값은 브라우저 저장소(du.saved)에 둬서 새로고침해도 유지(데모용). 비로그인 → 로그인 시트는 아직 연결 안 함 */
const SaveBtn = (() => {
  const TABS = { 전시: '', 작품: '&tab=works', 작가: '&tab=artists' };
  let el, tm;
  const read = () => { try { return JSON.parse(localStorage.getItem('du.saved') || '{}'); } catch (e) { return {}; } };
  const write = (v) => { try { localStorage.setItem('du.saved', JSON.stringify(v)); } catch (e) {} };
  const css = document.createElement('style');
  css.textContent = `
.save.is-saved { background: #f0f0f3 !important; color: #18181b !important; }
.save.is-saved:hover { background: #e4e4e7 !important; }
.save .i { transition: transform .3s cubic-bezier(.16,1,.3,1); }
.save[aria-pressed="true"] .i { fill: currentColor; }
.save-toast { position: fixed; left: 50%; bottom: calc(96px + env(safe-area-inset-bottom)); transform: translate(-50%, 12px); display: flex; align-items: center; gap: 14px; width: max-content; max-width: min(440px, calc(100vw - 40px)); padding: 14px 18px; border-radius: 8px; background: #000; color: #fff; font-size: 14px; font-weight: 500; line-height: 1.4; opacity: 0; pointer-events: none; z-index: 120; transition: opacity .25s, transform .35s cubic-bezier(.16,1,.3,1); }
.save-toast.on { opacity: 1; transform: translate(-50%, 0); pointer-events: auto; }
.save-toast a { flex: none; font-weight: 600; text-decoration: underline; text-underline-offset: 3px; }
@media (min-width: 900px) { .save-toast { bottom: 32px; } }`;
  document.head.appendChild(css);
  function toast(msg, href) {
    if (!el) { el = document.createElement('div'); el.className = 'save-toast'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite'); document.body.appendChild(el); }
    el.innerHTML = '<span></span>' + (href ? `<a href="${href}">보기</a>` : '');
    el.firstChild.textContent = msg; el.classList.add('on');
    clearTimeout(tm); tm = setTimeout(() => el.classList.remove('on'), 3200);
  }
  function init(buttons, { kind, id }) {
    const list = [...buttons];
    const textNode = (b) => [...b.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
    const paint = (on) => list.forEach((b) => {
      b.classList.toggle('is-saved', on); b.setAttribute('aria-pressed', String(on));
      const t = textNode(b); if (t) t.textContent = on ? '저장됨' : `${kind} 저장`;
      b.setAttribute('aria-label', on ? `${kind} 저장 취소` : `${kind} 저장`);
    });
    const key = kind + ':' + id;
    paint(!!read()[key]);
    list.forEach((b) => b.addEventListener('click', () => {
      const s = read(), on = !s[key];
      if (on) s[key] = 1; else delete s[key];
      write(s); paint(on);
      toast(on ? '보관함에 저장했어요' : '저장을 취소했어요', on ? `my.html?state=after${TABS[kind]}` : '');
    }));
  }
  return { init };
})();
