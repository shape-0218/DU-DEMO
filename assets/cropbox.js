/* 노출 범위 상자 (11-06): 사진을 확대·이동으로 맞추는 대신, "보이는 부분"을 상자로 보여주고 그 상자를 옮기거나 크기를 바꿔서 정함.
   - 상자는 정해진 비율(작품 카드 3:4, 전시 포스터 402:568)로 고정. 사진 밖으로 나가지 않음. 기본 = 사진 가운데를 가장 크게 자른 상자(= 카드가 원래 보여주던 모습)
   - 값은 사진 전체를 1로 본 비율 {x, y, w, h}. 카드·포스터 칸에서는 CropBox.style(rect)를 <img>에 붙이면 그 부분만 칸을 채움(칸은 position:relative; overflow:hidden)
   - 사용: CropBox.open({ url, ratio, title, sub, preview, rect, onDone(rect|null) })  (flow.js의 showSheet 사용). onDone(null) = 처음대로(기본 상자)
   - 조작: 상자를 끌어 옮김 / 네 모서리를 끌어 크기 변경(비율 유지) / 키보드: 방향키 이동, + − 크기 */
const CropBox = (() => {
  const css = `
.cbx { position: relative; margin: 16px auto 0; overflow: hidden; border-radius: 8px; background: #f4f4f5; touch-action: none; user-select: none; -webkit-user-select: none; }   /* 11-08 상세 무대(연한 회색)에 맞춰 조정 무대도 같은 색 */
.cbx > img { display: block; width: 100%; height: 100%; pointer-events: none; -webkit-user-drag: none; }
.cbx-box { position: absolute; box-sizing: border-box; border: 2px solid #fff; box-shadow: 0 0 0 9999px rgba(0, 0, 0, .55); cursor: grab; touch-action: none; outline: 0; }
.cbx-box:active { cursor: grabbing; }
.cbx-box:focus-visible { box-shadow: 0 0 0 9999px rgba(0, 0, 0, .55), 0 0 0 2px #18181b; }
.cbx-box::before { content: ""; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(to right, transparent calc(33.33% - .5px), rgba(255,255,255,.4) calc(33.33% - .5px), rgba(255,255,255,.4) calc(33.33% + .5px), transparent calc(33.33% + .5px), transparent calc(66.66% - .5px), rgba(255,255,255,.4) calc(66.66% - .5px), rgba(255,255,255,.4) calc(66.66% + .5px), transparent calc(66.66% + .5px)), linear-gradient(to bottom, transparent calc(33.33% - .5px), rgba(255,255,255,.4) calc(33.33% - .5px), rgba(255,255,255,.4) calc(33.33% + .5px), transparent calc(33.33% + .5px), transparent calc(66.66% - .5px), rgba(255,255,255,.4) calc(66.66% - .5px), rgba(255,255,255,.4) calc(66.66% + .5px), transparent calc(66.66% + .5px)); }
.cbx-h { position: absolute; width: 44px; height: 44px; touch-action: none; }
.cbx-h::after { content: ""; position: absolute; width: 16px; height: 16px; border: 0 solid #fff; }
.cbx-h[data-h="tl"] { left: -2px; top: -2px; cursor: nwse-resize; } .cbx-h[data-h="tl"]::after { left: 4px; top: 4px; border-width: 4px 0 0 4px; }
.cbx-h[data-h="tr"] { right: -2px; top: -2px; cursor: nesw-resize; } .cbx-h[data-h="tr"]::after { right: 4px; top: 4px; border-width: 4px 4px 0 0; }
.cbx-h[data-h="bl"] { left: -2px; bottom: -2px; cursor: nesw-resize; } .cbx-h[data-h="bl"]::after { left: 4px; bottom: 4px; border-width: 0 0 4px 4px; }
.cbx-h[data-h="br"] { right: -2px; bottom: -2px; cursor: nwse-resize; } .cbx-h[data-h="br"]::after { right: 4px; bottom: 4px; border-width: 0 4px 4px 0; }
.cbx-pv { display: flex; align-items: center; gap: 12px; margin-top: 16px; }
.cbx-th { position: relative; flex: none; width: 72px; border-radius: 8px; overflow: hidden; background: #f4f4f5; }
.cbx-th img { position: absolute; max-width: none; pointer-events: none; }
.cbx-tx { display: grid; gap: 2px; font-size: 12px; font-weight: 500; line-height: 1.4; color: var(--text-secondary); }
.cbx-tx b { font-size: 14px; font-weight: 600; color: var(--text-primary); }`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  /* 사진 가운데를 비율 R로 가장 크게 자른 상자 */
  const fit = (nw, nh, R) => { if (nw / nh >= R) { const w = R * nh / nw; return { x: (1 - w) / 2, y: 0, w, h: 1 }; } const h = nw / (R * nh); return { x: 0, y: (1 - h) / 2, w: 1, h }; };
  /* 칸을 상자 부분만으로 채우는 <img> 스타일 */
  const style = (r) => `position:absolute;max-width:none;object-fit:fill;width:${(100 / r.w).toFixed(3)}%;height:${(100 / r.h).toFixed(3)}%;left:${(-r.x / r.w * 100).toFixed(3)}%;top:${(-r.y / r.h * 100).toFixed(3)}%`;
  const clean = (r) => (r && [r.x, r.y, r.w, r.h].every((v) => typeof v === 'number' && isFinite(v)) && r.w > 0 && r.h > 0 && r.x >= -1e-6 && r.y >= -1e-6 && r.x + r.w <= 1 + 1e-6 && r.y + r.h <= 1 + 1e-6) ? r : null;

  function open(o) {
    const R = o.ratio, same = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.w - b.w) + Math.abs(a.h - b.h) < 0.002;
    showSheet(`<h2>${esc(o.title)}</h2><p class="sub">${esc(o.sub)}</p>
      <div class="cbx" id="cbx"><img id="cbx-i" src="${esc(o.url)}" alt="" draggable="false">
        <div class="cbx-box" id="cbx-b" tabindex="0" role="group" aria-label="${esc(o.title)} (끌어서 이동, 모서리를 끌어서 크기 변경, 방향키로 이동, + − 로 크기 변경)"><span class="cbx-h" data-h="tl"></span><span class="cbx-h" data-h="tr"></span><span class="cbx-h" data-h="bl"></span><span class="cbx-h" data-h="br"></span></div></div>
      <div class="cbx-pv"><div class="cbx-th" id="cbx-t" style="aspect-ratio:${R}"><img id="cbx-p" src="${esc(o.url)}" alt=""></div><div class="cbx-tx"><b>${esc(o.preview || '이렇게 보여요')}</b><span id="cbx-n"></span></div></div>
      <div class="trow"><button type="button" class="btn btn-soft" id="cbx-0">처음대로</button><button type="button" class="btn btn-dark" id="cbx-ok">완료</button></div>`, o.title, (sh) => {
      const stage = sh.querySelector('#cbx'), im = sh.querySelector('#cbx-i'), box = sh.querySelector('#cbx-b'), pv = sh.querySelector('#cbx-p'), note = sh.querySelector('#cbx-n');
      let nw = 1, nh = 1, iw = 1, ih = 1, r = null, drag = null;
      const MIN = 64;
      const paint = () => {
        box.style.left = (r.x * iw) + 'px'; box.style.top = (r.y * ih) + 'px'; box.style.width = (r.w * iw) + 'px'; box.style.height = (r.h * ih) + 'px';
        pv.style.cssText = style(r);
        note.textContent = same(r, fit(nw, nh, R)) ? '사진 가운데가 보여요' : '고른 부분이 보여요';
      };
      const layout = () => {
        nw = im.naturalWidth || 1; nh = im.naturalHeight || 1;
        const W = Math.min(stage.parentElement.clientWidth || 322, 420), maxH = Math.min(340, Math.round(innerHeight * 0.4));
        iw = Math.min(W, Math.round(maxH * nw / nh)); ih = Math.round(iw * nh / nw);
        stage.style.width = iw + 'px'; stage.style.height = ih + 'px';
        if (!r) r = clean(o.rect) || fit(nw, nh, R);
        paint();
      };
      if (im.complete && im.naturalWidth) layout(); else im.addEventListener('load', layout, { once: true });
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
          const ax = right ? r0.x : r0.x + r0.w, ay = bottom ? r0.y : r0.y + r0.h;       // 고정되는 반대쪽 모서리
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
      sh.querySelector('#cbx-0').addEventListener('click', () => { r = fit(nw, nh, R); paint(); });
      sh.querySelector('#cbx-ok').addEventListener('click', () => { const def = fit(nw, nh, R); closeSheet(); o.onDone && o.onDone(same(r, def) ? null : { x: +r.x.toFixed(4), y: +r.y.toFixed(4), w: +r.w.toFixed(4), h: +r.h.toFixed(4) }); });
    });
  }
  return { open, fit, style };
})();
