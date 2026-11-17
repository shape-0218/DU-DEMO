/* 개발 전달용 사본(11-17, 원본 review/poster-fit-v1/cropbox-fit.js) — '썸네일 조정' 시트에 보이는 방식 고르기를 더한 시안.
   전시(포스터)는 ?v=d(11-17 U-169부터 자동 여백 잘라내기 없음 — 부모가 올린 파일 그대로 넘김), 작품은 ?v=f 만 씀. 작품은 본 화면 assets/cropbox.js(U-167, o.modes)에 같은 시트가 들어가 있음.
   원본 assets/cropbox.js(U-160)를 덮어쓰지 않고, 이 사본 화면(screen.html)에서만 CropBox.open을 바꿔 끼움.
   ?v=now  지금 그대로(상자로 보이는 부분만 고름)
   ?v=a    [꽉 채우기 | 전체 보이기] — 전체면 남는 곳 연한 회색(상세 규칙과 같은 색, 고를 것 없음)
   ?v=b    [꽉 채우기 | 전체 보이기] + 배경색 칩 4개(포스터 색 · 흰색 · 회색 · 검정)
   ?v=c    [꽉 채우기 | 전체 보이기] — 전체면 남는 곳에 같은 포스터를 흐리게
   ?v=d    제안(11-16 조사 반영): 올릴 때 덧붙인 단색 여백은 자동으로 잘라내고(부모가 잘라낸 그림을 넘김),
           [꽉 채우기 | 전체 보이기]만 — 전체면 남는 곳은 포스터 가장자리 색(고르는 칩 없음)
   ?v=p    작품 제안(11-17 채택, work-fit-v1): 시트 모양은 d와 같음. 남는 곳 색·기준(30%)·잘라내기(흰·검정 틀만)는 부모가 계산해 PF로 넘김
   ?v=pw   작품 제안 · 흰 바탕(11-17 사용자 후보): p와 같고 목록 미리보기는 흰색, 상세 미리보기는 PF.dfill(연한 회색)
   상태는 부모(index.html)의 PF에 바로 써서 홈·탐색·상세 화면이 함께 바뀌게 함. 문구는 모두 제안. */
(() => {
  const V = new URLSearchParams(location.search).get('v') || 'now';
  const PF = () => { try { return parent !== window ? parent.PF : null; } catch (e) { return null; } };
  const sync = (patch) => { const pf = PF(); if (!pf) return; Object.assign(pf, patch); try { parent.PF_sync && parent.PF_sync('sheet'); } catch (e) {} };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const GRAY = '#f4f4f5';
  const BG = [['poster', '포스터 색'], ['white', '흰색'], ['gray', '회색'], ['black', '검정']];
  const SUB = { fill: '탐색 목록과 홈에는 상자 안만 보여요', fit: '탐색 목록과 홈에도 포스터 전체가 보여요' };

  const css = document.createElement('style');
  css.textContent = `
.pf-seg { display: grid; grid-template-columns: 1fr 1fr; margin: 16px 0 0; padding: 4px; border-radius: 9999px; background: var(--bg-secondary); }
.pf-seg button { height: 40px; border-radius: 9999px; font-size: 14px; font-weight: 600; color: var(--text-secondary); transition: background-color .2s cubic-bezier(.2,0,0,1), color .2s cubic-bezier(.2,0,0,1); }
.pf-seg button[aria-checked="true"] { background: #000; color: #fff; }
.pf-seg button:focus-visible { outline: 2px solid #18181b; outline-offset: 2px; }
.pf-area { display: grid; place-items: center; margin-top: 16px; }
.pf-area > .cbx { margin: 0; }
.pf-frame { position: relative; overflow: hidden; isolation: isolate; }
.pf-frame img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; pointer-events: none; -webkit-user-drag: none; }
.pf-frame img.bl { inset: -12%; width: 124%; height: 124%; object-fit: cover; filter: blur(20px) saturate(1.15) brightness(.82); }
.pf-chips { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; margin-top: 16px; }
.pf-chips .chip { gap: 6px; }
.pf-chips .dot { width: 16px; height: 16px; border-radius: 9999px; flex: none; box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .12); }
.pf-chips .chip[aria-pressed="true"] .dot { box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .4); }
.cbx-th.pf-fit img, .cbx-dt.pf-fit img { position: absolute; inset: 0; width: 100%; height: 100%; max-width: none; max-height: none; object-fit: contain; }
.cbx-th.pf-fit, .cbx-dt.pf-fit { position: relative; overflow: hidden; isolation: isolate; }
.cbx-th.pf-fit img.bl, .cbx-dt.pf-fit img.bl { inset: -12%; width: 124%; height: 124%; object-fit: cover; filter: blur(8px) saturate(1.15) brightness(.82); }
@media (prefers-reduced-motion: reduce) { .pf-seg button { transition: none; } }`;
  document.head.appendChild(css);

  const orig = CropBox.open;
  CropBox.open = function (o) {
    if (V === 'now') return orig({ ...o, onDone: (r) => { sync({ crop: r }); o.onDone && o.onDone(r); } });
    openFit(o);
  };

  function openFit(o) {
    const R = o.ratio, fit = CropBox.fit, style = CropBox.style;
    const same = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.w - b.w) + Math.abs(a.h - b.h) < 0.002;
    const pf = PF() || {}; let mode = pf.mode || 'fill', bg = pf.bg || 'poster';
    const edge = pf.edge || GRAY;
    const colorOf = (k) => V === 'a' ? GRAY : ({ poster: edge, white: '#ffffff', gray: GRAY, black: '#000000' }[k]);
    const seg = `<div class="pf-seg" role="radiogroup" aria-label="보이는 방식"><button type="button" role="radio" data-m="fill">꽉 채우기</button><button type="button" role="radio" data-m="fit">전체 보이기</button></div>`;
    const chips = V === 'b' ? `<div class="pf-chips" role="group" aria-label="배경색">${BG.map(([k, t]) => `<button type="button" class="chip" data-bg="${k}"><span class="dot" style="background:${colorOf(k)}"></span>${t}</button>`).join('')}</div>` : '';
    const blurImg = (cls) => V === 'c' ? `<img class="bl" src="${esc(o.url)}" alt="">` : '';
    showSheet(`<h2>${esc(o.title)}</h2><p class="sub" id="pf-sub"></p>${seg}
      <div class="pf-area" id="pf-area">
        <div class="cbx" id="cbx"><img id="cbx-i" src="${esc(o.url)}" alt="" draggable="false">
          <div class="cbx-box" id="cbx-b" tabindex="0" role="group" aria-label="${esc(o.title)} (끌어서 이동, 모서리를 끌어서 크기 변경, 방향키로 이동, + − 로 크기 변경)"><span class="cbx-h" data-h="tl"></span><span class="cbx-h" data-h="tr"></span><span class="cbx-h" data-h="bl"></span><span class="cbx-h" data-h="br"></span></div></div>
        <div class="pf-frame" id="pf-frame" hidden>${blurImg()}<img src="${esc(o.url)}" alt=""></div>
      </div>${chips}
      <div class="cbx-pv2" aria-hidden="true"><figure class="cbx-f"><div class="cbx-th" id="cbx-t" style="aspect-ratio:${R}">${blurImg()}<img id="cbx-p" src="${esc(o.url)}" alt=""></div><i class="cbx-ln"></i><i class="cbx-ln s"></i><figcaption>목록</figcaption></figure><figure class="cbx-f"><div class="cbx-dt" id="pf-dt" style="aspect-ratio:${o.detail}">${blurImg()}<img src="${esc(o.url)}" alt=""></div><i class="cbx-ln" style="visibility:hidden"></i><i class="cbx-ln s" style="visibility:hidden"></i><figcaption>상세</figcaption></figure></div>
      <div class="trow"><button type="button" class="btn btn-soft" id="cbx-0">처음대로</button><button type="button" class="btn btn-dark" id="cbx-ok">완료</button></div>`, o.title, (sh) => {
      const area = sh.querySelector('#pf-area'), stage = sh.querySelector('#cbx'), im = sh.querySelector('#cbx-i'), box = sh.querySelector('#cbx-b'), frame = sh.querySelector('#pf-frame');
      const th = sh.querySelector('#cbx-t'), pv = sh.querySelector('#cbx-p'), dt = sh.querySelector('#pf-dt'), sub = sh.querySelector('#pf-sub');
      let nw = 1, nh = 1, iw = 1, ih = 1, r = null, drag = null, raf = 0;
      const MIN = 64;
      const push = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => sync({ mode, bg, crop: r && !same(r, fit(nw, nh, R)) ? { ...r } : null })); };
      const paint = () => {
        const isFit = mode === 'fit';
        const pfx = PF(); sub.textContent = (pfx && pfx.sub && pfx.sub[mode]) || SUB[mode];   // 작품 시안(work-fit-v1)은 부모가 작품용 문구를 넘김
        sh.querySelectorAll('.pf-seg button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.m === mode)));
        sh.querySelectorAll('.pf-chips .chip').forEach((b) => { const on = b.dataset.bg === bg; b.setAttribute('aria-pressed', String(on)); b.disabled = !isFit; b.style.opacity = isFit ? '' : '.4'; });
        stage.hidden = isFit; frame.hidden = !isFit;
        const col = V === 'c' ? '#000' : colorOf(bg);
        frame.style.background = col;
        th.classList.toggle('pf-fit', isFit); th.style.background = isFit ? col : '';
        pv.style.cssText = isFit ? '' : style(r);
        const dcol = (pfx && pfx.dfill) || col;   // 작품 '제안 · 흰 바탕'(pw)은 상세 미리보기만 연한 회색
        dt.classList.toggle('pf-fit', isFit); dt.style.background = isFit ? dcol : '';
        th.querySelectorAll('img.bl').forEach((x) => { x.hidden = !isFit; }); dt.querySelectorAll('img.bl').forEach((x) => { x.hidden = !isFit; });
        if (!isFit) { box.style.left = (r.x * iw) + 'px'; box.style.top = (r.y * ih) + 'px'; box.style.width = (r.w * iw) + 'px'; box.style.height = (r.h * ih) + 'px'; }
        push();
      };
      const layout = () => {
        nw = im.naturalWidth || 1; nh = im.naturalHeight || 1;
        const pc = sh, pcs = getComputedStyle(pc), W = Math.min((pc.clientWidth - parseFloat(pcs.paddingLeft) - parseFloat(pcs.paddingRight)) || 322, 420), maxH = Math.min(340, Math.round(innerHeight * 0.4));
        iw = Math.min(W, Math.round(maxH * nw / nh)); ih = Math.round(iw * nh / nw);
        stage.style.width = iw + 'px'; stage.style.height = ih + 'px';
        const fh = maxH, fw = Math.round(fh * R); frame.style.width = fw + 'px'; frame.style.height = fh + 'px';
        area.style.height = Math.max(ih, fh) + 'px';   // 두 방식을 오가도 시트 높이가 튀지 않게
        if (!r) r = (pf.crop && pf.crop.w ? { ...pf.crop } : null) || fit(nw, nh, R);
        paint();
      };
      if (im.complete && im.naturalWidth) layout(); else im.addEventListener('load', layout, { once: true });

      sh.querySelectorAll('.pf-seg button').forEach((b) => b.addEventListener('click', () => { mode = b.dataset.m; paint(); }));
      sh.querySelector('.pf-seg').addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); mode = mode === 'fill' ? 'fit' : 'fill'; paint(); sh.querySelector(`.pf-seg [data-m="${mode}"]`).focus(); } });
      sh.querySelectorAll('.pf-chips .chip').forEach((b) => b.addEventListener('click', () => { bg = b.dataset.bg; paint(); }));

      const norm = (e) => { const b = stage.getBoundingClientRect(); return { x: (e.clientX - b.left) / iw, y: (e.clientY - b.top) / ih }; };
      box.addEventListener('pointerdown', (e) => {
        try { box.setPointerCapture(e.pointerId); } catch (err) {}
        const h = e.target.closest('.cbx-h');
        drag = h ? { k: 'size', h: h.dataset.h, r0: { ...r } } : { k: 'move', p: norm(e), r0: { ...r } };
        e.preventDefault();
      });
      box.addEventListener('pointermove', (e) => {
        if (!drag) return; const p = norm(e);
        if (drag.k === 'move') { r.x = Math.min(1 - r.w, Math.max(0, drag.r0.x + (p.x - drag.p.x))); r.y = Math.min(1 - r.h, Math.max(0, drag.r0.y + (p.y - drag.p.y))); }
        else {
          const r0 = drag.r0, right = drag.h[1] === 'r', bottom = drag.h[0] === 'b';
          const ax = right ? r0.x : r0.x + r0.w, ay = bottom ? r0.y : r0.y + r0.h;
          let w = Math.max(MIN / iw, (right ? p.x - ax : ax - p.x));
          w = Math.min(w, right ? 1 - ax : ax, (bottom ? 1 - ay : ay) * R * ih / iw);
          const h = w * iw / (R * ih);
          r = { x: right ? ax : ax - w, y: bottom ? ay : ay - h, w, h };
        }
        paint();
      });
      const end = () => { drag = null; };
      box.addEventListener('pointerup', end); box.addEventListener('pointercancel', end);
      box.addEventListener('keydown', (e) => {
        const step = 0.02, mv = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
        if (mv) { e.preventDefault(); r.x = Math.min(1 - r.w, Math.max(0, r.x + mv[0])); r.y = Math.min(1 - r.h, Math.max(0, r.y + mv[1])); paint(); }
        else if (e.key === '+' || e.key === '=' || e.key === '-') {
          e.preventDefault(); const k = e.key === '-' ? 1.1 : 1 / 1.1, cx = r.x + r.w / 2, cy = r.y + r.h / 2;
          let w = Math.max(MIN / iw, r.w * k); w = Math.min(w, 1, R * ih / iw); const h = w * iw / (R * ih);
          r = { x: Math.min(1 - w, Math.max(0, cx - w / 2)), y: Math.min(1 - h, Math.max(0, cy - h / 2)), w, h }; paint();
        }
      });
      /* 처음대로 = 올렸을 때의 기본(잘리는 양이 15%를 넘으면 '전체 보이기', 배경은 포스터 색) */
      sh.querySelector('#cbx-0').addEventListener('click', () => { const p = PF(); mode = p && p.defMode ? p.defMode : 'fill'; bg = 'poster'; r = fit(nw, nh, R); paint(); });
      sh.querySelector('#cbx-ok').addEventListener('click', () => { const def = fit(nw, nh, R); push(); closeSheet(); o.onDone && o.onDone(same(r, def) ? null : { x: +r.x.toFixed(4), y: +r.y.toFixed(4), w: +r.w.toFixed(4), h: +r.h.toFixed(4) }, mode); });
    });
  }
})();
