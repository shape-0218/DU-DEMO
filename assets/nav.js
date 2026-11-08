/* 하단 메뉴(넷바) 알약 이동 보조 (11-08, C3 + 모션 교체)
   홈·탐색·마이는 서로 다른 페이지라서, 새 페이지가 뜨길 기다리면 알약이 멈춰 있다가 움직이거나 중간에 멈칫함. 이 파일이 그 틈을 메움.
   - 페이지 전환 효과(View Transitions, assets/nav.css)를 지원하는 브라우저
     1) 탭을 누르는 순간 알약·아이콘을 먼저 움직임(기다리지 않음)
     2) 페이지가 넘어갈 때(pageswap) 알약이 얼마나 갔는지(경과 시간)를 적어 두고, 새 페이지(pagereveal)에서 전환의 시간·곡선을
        "같은 곡선의 남은 구간"으로 바꿔 줌 → 새 페이지가 늦게 떠도 속도가 끊기거나 다시 출발하지 않고 한 번에 이어짐
   - 지원하지 않는 브라우저(예: 파이어폭스): 탭 번호를 sessionStorage에 적어 두고, 다음 페이지가 열릴 때 이전 탭 자리에서 새 탭으로 움직임
   - 움직임 줄이기 설정이면 움직임 없이 바로 자리만 바뀜. 새 탭·창으로 여는 클릭은 건드리지 않음(링크 이동은 그대로)
   곡선·시간은 nav.css 의 --nav-ease(.2,0,0,1)·--nav-dur(.4s)와 같아야 함 */
(() => {
  const pill = document.querySelector('.nav .pill'); if (!pill) return;
  const links = [...pill.querySelectorAll('a')]; if (!links.length) return;
  const cur = Math.max(0, links.findIndex((a) => a.getAttribute('aria-current') === 'page'));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const show = (i) => { links.forEach((a, k) => (k === i ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'))); pill.style.setProperty('--i', i); };
  const plain = (e) => !(e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey);   // 새 탭·창으로 여는 클릭은 제외
  const KEY = 'du.nav', DUR = 400;
  const get = () => { try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
  const put = (o) => { try { sessionStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} };
  // 뒤로가기로 돌아온 페이지(bfcache)는 지금 탭에 그대로
  addEventListener('pageshow', (e) => { if (e.persisted) show(cur); });

  if ('CSSViewTransitionRule' in window) {
    // cubic-bezier(.2, 0, 0, 1) — nav.css 의 --nav-ease 와 같은 곡선
    const bez = (x1, y1, x2, y2) => (x) => {
      let lo = 0, hi = 1;
      for (let k = 0; k < 30; k++) { const t = (lo + hi) / 2; const bx = 3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t; if (bx < x) lo = t; else hi = t; }
      const t = (lo + hi) / 2; return 3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t;
    };
    const ease = bez(.2, 0, 0, 1);

    links.forEach((a, i) => a.addEventListener('click', (e) => {
      if (i === cur || reduce || !plain(e)) return;
      show(i);
      put({ t0: Date.now() });
      setTimeout(() => { show(cur); }, 4000);                       // 이동이 4초 넘게 안 되면(취소·느린 망) 원래 탭으로
    }));
    // 이 페이지를 떠나는 순간: 알약이 얼마나 갔는지(경과 시간) 기록
    addEventListener('pageswap', () => { const o = get(); if (o && o.t0) put({ t0: o.t0, e: Date.now() - o.t0 }); });
    // 새 페이지: 전환의 시간·곡선을 남은 구간으로 맞춤(전환이 시작하기 전에 변수를 채워야 함)
    addEventListener('pagereveal', () => {
      const o = get(); try { sessionStorage.removeItem(KEY); } catch (e) {}
      if (!o || !(o.e >= 0) || Date.now() - o.t0 > 3000) return;
      const u0 = Math.min(o.e / DUR, .98), f0 = ease(u0), N = 24, pts = [];
      for (let k = 0; k <= N; k++) pts.push(((ease(u0 + (k / N) * (1 - u0)) - f0) / (1 - f0)).toFixed(4));
      const s = document.documentElement.style;
      s.setProperty('--navcap-dur', Math.max(80, Math.round(DUR * (1 - u0))) + 'ms');
      s.setProperty('--navcap-ease', 'linear(' + pts.join(',') + ')');
    });
    return;
  }

  // ---- 대체 동작(전환 효과 미지원) ----
  let from = -1;
  const o = get(); try { sessionStorage.removeItem(KEY); } catch (e) {}
  if (o && Date.now() - o.t < 4000 && Number.isInteger(o.from) && o.from >= 0 && o.from < links.length && o.from !== cur) from = o.from;
  if (from >= 0 && !reduce) {
    show(from);
    void pill.offsetWidth;                                          // 시작 자리를 먼저 그린 뒤
    let done = false; const go = () => { if (!done) { done = true; show(cur); } };
    requestAnimationFrame(() => requestAnimationFrame(go));
    setTimeout(go, 120);                                            // 가려진 탭에서 rAF 가 멈춰도 이동
  }
  links.forEach((a, i) => a.addEventListener('click', (e) => {
    if (i === cur || !plain(e)) return;
    put({ from: cur, t: Date.now() });
  }));
})();
