/* 작가 이름 표기 (11-06 확정): 카드에서는 이름을 최대한 다 보여주고, 카드 폭을 넘칠 때만 넘치는 만큼 "외 N명"으로 줄임.
   - 사용: Byline.html(['김서윤','박도현']) → 문자열(span) 을 카드 안에 넣으면 자동으로 폭을 재서 맞춤.
   - 규칙: ① 이름은 ", "로 이어 한 줄 ② 한 줄에 다 들어가면 전부 ③ 넘치면 보이는 이름 + " 외 N명" (N = 가려진 사람 수)
           ④ 첫 이름 하나도 못 들어가면 말줄임(…)  ⑤ 폭이 바뀌면(회전·창 크기·글꼴 로딩) 다시 맞춤
   - 작품 상세 화면의 작가 표기(4명까지 전부, 5명부터 3명 + 외 N명)는 이 규칙과 별개로 유지. */
const Byline = (() => {
  const css = '.by{display:block;min-width:0;max-width:100%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}';
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const html = (names) => `<span class="by" data-by="${esc(names.join('|'))}">${esc(names.join(', '))}</span>`;
  const label = (names, k) => (k >= names.length ? names.join(', ') : `${names.slice(0, k).join(', ')} 외 ${names.length - k}명`);
  function fit(el) {
    const names = (el.dataset.by || '').split('|').filter(Boolean); if (!names.length) return;
    const w = el.clientWidth; if (!w) return;                 // 숨겨진 상태는 보일 때 다시
    if (el.dataset.w === String(w)) return; el.dataset.w = w;
    el.textContent = label(names, names.length);
    if (el.scrollWidth <= w + 0.5) return;
    for (let k = names.length - 1; k >= 1; k--) { el.textContent = label(names, k); if (el.scrollWidth <= w + 0.5) return; }
    el.textContent = label(names, 1);                          // 하나도 안 들어가면 CSS 말줄임
  }
  let t = 0;
  function run(root) { (root || document).querySelectorAll('.by[data-by]').forEach(fit); }
  const later = () => { clearTimeout(t); t = setTimeout(() => run(), 30); };
  addEventListener('resize', () => { document.querySelectorAll('.by[data-by]').forEach((e) => delete e.dataset.w); later(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { document.querySelectorAll('.by[data-by]').forEach((e) => delete e.dataset.w); run(); });
  new MutationObserver(later).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState !== 'loading') later(); else document.addEventListener('DOMContentLoaded', later);
  return { html, fit: run, label };
})();
