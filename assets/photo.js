/* 프로필 사진 칸 (11-08 Figma 확정 `Profile Photo`)
   - 기본 프로필 = 원(80), 작가 프로필 = 사각 116×132 · 모서리 0 (11-12 각진 사진, 이전 반경 12)
   - 사진이 있으면 오른쪽 아래에 연필 배지(흰 원 32 + 선). 사진을 누르면 사진 아래 작은 팝업 메뉴: "사진 변경" / 빨간 "삭제" (`manage.html` 더보기 메뉴와 같은 모양)
   - 사진이 없을 때(11-08): 원형(기본 정보 수정) = 기본 프로필(연회색 원 + 흰 사람 그림, 마이 아바타와 같은 비율) + 연필 배지, 누르면 바로 사진 고르기 / 사각(작가 프로필) = 승인된 추가 타일 규칙(Figma `Photo Upload`·`Poster Upload`와 같음)의 상자: 흰 바탕 + 1px 선(border/primary) + 반경 12 + 가운데 플러스(24) + "사진 추가"(12/500, 간격 4). 공개 프로필 화면에서는 사진이 없으면 칸 자체가 없음
   - 사진 아래 안내 문구 없음 · 조정 화면은 확대 막대 없이 끌기 + 두 손가락 핀치(폰) · 터치패드 핀치/휠(웹) · +/− 키
   사용: root.innerHTML = PhotoPick.html('circle'|'rect', src); PhotoPick.bind(root, { kind, onDone(dataUrl) })   (삭제하면 onDone(''))
   결과는 틀에 맞게 잘라 낸 작은 JPEG(폭 360)라서 저장소에 넣어도 가벼움 */
const PhotoPick = (() => {
  const R = { circle: 1, rect: 116 / 132 };
  const PLUS = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 4v16M4 12h16"/></svg>';
  const USER = '<svg viewBox="0 0 59.5 65.87" aria-hidden="true"><ellipse cx="29.75" cy="15.94" rx="15.23" ry="15.94" fill="currentColor"/><path d="M0 65.87C0 49.44 13.32 36.12 29.75 36.12S59.5 49.44 59.5 65.87z" fill="currentColor"/></svg>';   // 마이 `#i-avatar`와 같은 그림(Figma `Avatar / 프로필 (무채색)`)
  const PEN ='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m4 20 1-4L16.5 4.5a2 2 0 0 1 3 3L8 19z"/><path d="m14.5 6.5 3 3"/></svg>';
  const css = `
.pp { position: relative; display: block; width: var(--w); height: var(--h); margin-inline: auto; }
.pp-b { position: relative; display: block; width: 100%; height: 100%; border-radius: var(--r); }
.pp .pf { position: absolute; inset: 0; border-radius: var(--r); overflow: hidden; box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .06); transition: transform .16s var(--ease, ease); }
.pp .pf img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.pp-b:active .pf { transform: scale(.98); }
.pp-badge { position: absolute; right: 8px; bottom: 8px; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 9999px; background: #fff; color: #18181b; box-shadow: inset 0 0 0 1px #d4d4d8; transition: transform .16s var(--ease, ease); }
.pp[data-pp="circle"] .pp-badge { right: -4px; bottom: -4px; }
.pp-badge::after { content: ""; position: absolute; inset: -6px; }
.pp-badge svg { width: 16px; height: 16px; }
.pp-b:active .pp-badge { transform: scale(.94); }
.pp.empty .pf { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; background: #fff; color: #18181b; box-shadow: inset 0 0 0 1px #d4d4d8; }
.pp.empty .pf svg { width: 24px; height: 24px; }
.pp.empty .pf .pp-lab { font-size: 12px; font-weight: 500; line-height: 1.4; color: #3f3f47; }
.pp[data-pp="circle"].empty .pf { display: block; background: #f0f0f3; color: #fff; box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .06); }
.pp[data-pp="circle"].empty .pf svg { position: absolute; left: 13.44%; top: 19.54%; width: 74.38%; height: 82.34%; }
.pp-pop { position: absolute; z-index: 30; top: calc(100% + 8px); right: 0; width: 164px; padding: 6px 0; background: #fff; border: 1px solid #d4d4d8; border-radius: 12px; box-shadow: 0 12px 32px rgba(0, 0, 0, .12); animation: ppPop .2s var(--ease, ease); }
.pp-pop button { display: block; width: 100%; height: 44px; padding: 0 16px; font-size: 14px; font-weight: 500; text-align: left; transition: background .15s; }
@media (hover: hover) { .pp-pop button:hover { background: #f4f4f5; } }
.pp-pop .del { color: #fb2c36; }
@keyframes ppPop { from { opacity: 0; transform: translateY(-4px); } }
dialog.pc { width: 100%; max-width: none; height: 100%; max-height: none; margin: 0; padding: 0; border: 0; background: #000; color: #fff; }
dialog.pc[open] { display: flex; flex-direction: column; animation: pcIn .25s cubic-bezier(.16, 1, .3, 1) both; }
@keyframes pcIn { from { opacity: 0; } }
.pc-h { flex: none; display: flex; align-items: center; justify-content: space-between; height: 56px; padding: 0 20px; margin-top: env(safe-area-inset-top); }
.pc-h button { height: 44px; font-size: 16px; font-weight: 500; color: rgba(255, 255, 255, .7); }
.pc-h .ok { font-weight: 600; color: #fff; }
.pc-s { position: relative; flex: 1; min-height: 0; max-height: 600px; margin: 24px 0 max(40px, env(safe-area-inset-bottom)); overflow: hidden; touch-action: none; user-select: none; -webkit-user-select: none; cursor: grab; outline: 0; }
.pc-s img { position: absolute; max-width: none; pointer-events: none; -webkit-user-drag: none; }
.pc-r { position: absolute; pointer-events: none; border: 2px solid #fff; box-shadow: 0 0 0 999px rgba(0, 0, 0, .62); }
@media (min-width: 900px) { dialog.pc { width: 480px; height: min(760px, 92vh); margin: auto; border-radius: 20px; overflow: hidden; } dialog.pc::backdrop { background: rgba(0, 0, 0, .42); } }
@media (prefers-reduced-motion: reduce) { dialog.pc[open], .pp-pop { animation: none; } }`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function html(kind, src) {
    const w = kind === 'circle' ? 80 : 116, h = Math.round(w / R[kind]);
    return `<div class="pp${src ? '' : ' empty'}" data-pp="${kind}" style="--w:${w}px;--h:${h}px;--r:${kind === 'circle' ? '50%' : '0'}"><button type="button" class="pp-b" aria-label="${src ? '프로필 사진 편집' : '프로필 사진 등록'}" aria-haspopup="${src ? 'menu' : 'false'}">${src ? `<span class="pf"><img src="${src}" alt=""></span><span class="pp-badge">${PEN}</span>` : kind === 'circle' ? `<span class="pf">${USER}</span><span class="pp-badge">${PEN}</span>` : `<span class="pf">${PLUS}<span class="pp-lab">사진 추가</span></span>`}</button><input type="file" accept="image/&#42;" hidden></div>`;
  }

  let dlg;
  function dialog() {
    if (dlg) return dlg;
    dlg = document.createElement('dialog'); dlg.className = 'pc'; dlg.setAttribute('aria-label', '프로필 사진 조정');
    dlg.innerHTML = '<div class="pc-h"><button type="button" data-no>취소</button><button type="button" class="ok" data-ok>완료</button></div><div class="pc-s" tabindex="0" aria-label="사진을 끌어서 위치를 맞춰요 (두 손가락·터치패드로 확대, 방향키 이동, + − 확대)"><img alt="" draggable="false"><div class="pc-r"></div></div>';
    document.body.appendChild(dlg); return dlg;
  }

  function adjust(kind, file, onDone) {
    const url = URL.createObjectURL(file), im = new Image();
    im.onerror = () => URL.revokeObjectURL(url);
    im.onload = () => {
      const d = dialog(), stage = d.querySelector('.pc-s'), img = stage.querySelector('img'), ring = stage.querySelector('.pc-r');
      const r = R[kind], nw = im.naturalWidth, nh = im.naturalHeight, cw0 = Math.min(nw, nh * r);   // 틀을 가득 채우는 가장 큰 폭(확대 1배)
      const c = { cx: nw / 2, cy: nh / 2, cw: cw0 };
      img.src = url;
      let FW, FH, SW, SH;
      const clamp = () => { c.cw = Math.max(cw0 / 3, Math.min(cw0, c.cw)); const ch = c.cw / r; c.cx = Math.max(c.cw / 2, Math.min(nw - c.cw / 2, c.cx)); c.cy = Math.max(ch / 2, Math.min(nh - ch / 2, c.cy)); };
      const paint = () => {
        SW = stage.clientWidth; SH = stage.clientHeight; FW = Math.round(kind === 'circle' ? Math.min(300, SW - 48, SH - 40) : Math.min(264, SW - 72, (SH - 40) * r)); FH = Math.round(FW / r);
        clamp(); const k = FW / c.cw;
        img.style.width = nw * k + 'px'; img.style.height = nh * k + 'px'; img.style.left = SW / 2 - c.cx * k + 'px'; img.style.top = SH / 2 - c.cy * k + 'px';
        Object.assign(ring.style, { width: FW + 'px', height: FH + 'px', left: (SW - FW) / 2 + 'px', top: (SH - FH) / 2 + 'px', borderRadius: kind === 'circle' ? '50%' : '0' });
      };
      /* 끌기(손가락 1개) · 핀치(손가락 2개) */
      const pts = new Map(); let drag = null, pinch = null;
      const dist = () => { const [a, b] = [...pts.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
      stage.onpointerdown = (e) => { stage.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (pts.size === 2) { pinch = { d: dist(), cw: c.cw }; drag = null; } else if (pts.size === 1) drag = { x: e.clientX, y: e.clientY, cx: c.cx, cy: c.cy }; };
      stage.onpointermove = (e) => {
        if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pts.size === 2 && pinch) { c.cw = pinch.cw * pinch.d / dist(); paint(); return; }
        if (!drag) return; const k = FW / c.cw; c.cx = drag.cx - (e.clientX - drag.x) / k; c.cy = drag.cy - (e.clientY - drag.y) / k; paint();
      };
      stage.onpointerup = stage.onpointercancel = (e) => { pts.delete(e.pointerId); pinch = null; drag = pts.size === 1 ? (() => { const p = [...pts.values()][0]; return { x: p.x, y: p.y, cx: c.cx, cy: c.cy }; })() : null; };
      /* 터치패드 핀치는 ctrlKey가 붙은 휠로 들어옴(작게 움직여도 부드럽게), 일반 휠은 한 칸씩 */
      stage.onwheel = (e) => { e.preventDefault(); c.cw *= e.ctrlKey ? Math.exp(e.deltaY * 0.01) : (e.deltaY > 0 ? 1.04 : 0.96); paint(); };
      stage.onkeydown = (e) => {
        const k = FW / c.cw, s = 12 / k;
        if (e.key === 'ArrowLeft') c.cx -= s; else if (e.key === 'ArrowRight') c.cx += s; else if (e.key === 'ArrowUp') c.cy -= s; else if (e.key === 'ArrowDown') c.cy += s;
        else if (e.key === '+' || e.key === '=') c.cw *= 0.96; else if (e.key === '-') c.cw *= 1.04; else return;
        e.preventDefault(); paint();
      };
      const done = () => { d.close(); URL.revokeObjectURL(url); };
      d.querySelector('[data-no]').onclick = done;
      d.querySelector('[data-ok]').onclick = () => {
        const W = 360, H = Math.round(W / r), cv = document.createElement('canvas'); cv.width = W; cv.height = H;
        const ch = c.cw / r; cv.getContext('2d').drawImage(im, c.cx - c.cw / 2, c.cy - ch / 2, c.cw, ch, 0, 0, W, H);
        const out = cv.toDataURL('image/jpeg', 0.86); done(); onDone(out);
      };
      d.oncancel = () => { URL.revokeObjectURL(url); };
      d.showModal(); paint(); stage.focus({ preventScroll: true });
    };
    im.src = url;
  }

  function bind(root, { kind, onDone }) {
    const pick = () => root.querySelector('input[type=file]').click();
    let pop = null;
    const closePop = () => { if (pop) { pop.remove(); pop = null; document.removeEventListener('click', away, true); document.removeEventListener('keydown', esc); } };
    const away = (e) => { if (pop && !pop.contains(e.target) && !e.target.closest('.pp-b')) closePop(); };
    const esc = (e) => { if (e.key === 'Escape') closePop(); };
    const hasPhoto = () => !!root.querySelector('.pf img');
    root.addEventListener('click', (e) => {
      if (e.target.closest('.pp-pop button')) {
        const b = e.target.closest('button'); closePop();
        if (b.dataset.a === 'change') pick();
        else { root.innerHTML = html(kind, ''); onDone(''); }   // 삭제 = 사진 없음(아무것도 안 그림). 다시 올릴 수 있어서 확인창 없음
        return;
      }
      if (!e.target.closest('.pp-b')) return;
      if (!hasPhoto()) { pick(); return; }
      if (pop) { closePop(); return; }
      pop = document.createElement('div'); pop.className = 'pp-pop'; pop.setAttribute('role', 'menu');
      pop.innerHTML = '<button type="button" role="menuitem" data-a="change">사진 변경</button><button type="button" role="menuitem" class="del" data-a="delete">삭제</button>';
      root.querySelector('.pp').appendChild(pop);
      setTimeout(() => { document.addEventListener('click', away, true); document.addEventListener('keydown', esc); }, 0);
    });
    root.addEventListener('change', (e) => {
      const f = e.target.files && e.target.files[0]; if (!f) return; e.target.value = '';
      adjust(kind, f, (data) => { root.innerHTML = html(kind, data); onDone(data); });
    });
  }
  return { html, bind };
})();
