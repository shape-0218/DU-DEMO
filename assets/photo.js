/* 프로필 사진 칸 (11-07 확정): 사진 올리기 한 가지 방식(시트 없음).
   틀을 누르면 바로 사진 고르기 → 틀 안에서 사진을 끌어 옮기고 살짝(1~2배) 확대 → 완료. 안내 글·미리보기 없음.
   - 기본 프로필 = 원(80, Figma `Avatar Upload`와 같음), 작가 프로필 = 둥근 사각 116×132 · 반경 12 (Figma `작가 프로필 · 본인`)
   - 사진이 없으면 기본 이미지(연회색 바탕 + 사람 그림). 등록 배지는 + (카메라는 촬영으로 읽혀서 쓰지 않음)
   사진이 있을 때만 틀 아래에 작은 "삭제"(= 기본 이미지로 되돌리기)가 나옴
   사용: root.innerHTML = PhotoPick.html('circle'|'rect', src, '아래 한 줄 글(없으면 생략)'); PhotoPick.bind(root, { kind, onDone(dataUrl) })
   결과는 틀에 맞게 잘라 낸 작은 JPEG(폭 360)라서 저장소에 넣어도 가벼움 */
const PhotoPick = (() => {
  const R = { circle: 1, rect: 116 / 132 };
  const AV = '<svg viewBox="0 0 34 34" aria-hidden="true"><circle cx="17" cy="13" r="6" fill="currentColor"/><path d="M4 34c1.2-8 6.6-12 13-12s11.8 4 13 12z" fill="currentColor"/></svg>';
  const IMG = '<svg viewBox="0 0 12 12" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 1v10M1 6h10"/></svg>';   // + 배지: Figma `Avatar Upload`와 같음(24 원, #9f9fa9, 흰 + 12)
  const css = `
.pp { display: grid; justify-items: center; }
.pp-b { position: relative; display: block; border-radius: 9999px; }
.pp-b[data-k="rect"] { border-radius: 12px; }
.pp .pf { position: relative; display: grid; place-items: end center; width: var(--w); height: var(--h); border-radius: var(--r); overflow: hidden; background: #f0f0f3; color: #fafafa; box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .06); transition: transform .16s var(--ease, ease); }
.pp .pf svg { width: calc(var(--w) * .88); height: calc(var(--w) * .88); }
.pp .pf img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.pp-b:active .pf { transform: scale(.98); }
.pp-badge { position: absolute; right: 0; bottom: 0; width: 24px; height: 24px; display: grid; place-items: center; border-radius: 9999px; background: #9f9fa9; color: #fafafa; }
.pp[data-pp="rect"] .pp-badge { right: 8px; bottom: 8px; }
.pp-badge svg { width: 12px; height: 12px; }
.pp-del { height: 44px; padding: 0 12px; font-size: 14px; font-weight: 500; color: #71717b; border-radius: 8px; transition: color .2s, transform .16s var(--ease, ease); }
.pp-del:hover { color: #18181b; }
.pp-del:active { transform: scale(.97); }
.pp-del[hidden] { display: none; }
.pp-del + small { margin-top: 0; }
.pp small { margin-top: 20px; font-size: 12px; font-weight: 500; line-height: 1.4; color: #71717b; text-align: center; }
dialog.pc { width: 100%; max-width: none; height: 100%; max-height: none; margin: 0; padding: 0; border: 0; background: #000; color: #fff; }
dialog.pc[open] { display: flex; flex-direction: column; animation: pcIn .25s cubic-bezier(.16, 1, .3, 1) both; }
@keyframes pcIn { from { opacity: 0; } }
.pc-h { flex: none; display: flex; align-items: center; justify-content: space-between; height: 56px; padding: 0 20px; margin-top: env(safe-area-inset-top); }
.pc-h button { height: 44px; font-size: 16px; font-weight: 500; color: rgba(255, 255, 255, .7); }
.pc-h .ok { font-weight: 600; color: #fff; }
.pc-s { position: relative; flex: 1; min-height: 0; max-height: 520px; margin-top: 24px; overflow: hidden; touch-action: none; user-select: none; -webkit-user-select: none; cursor: grab; outline: 0; }
.pc-s img { position: absolute; max-width: none; pointer-events: none; -webkit-user-drag: none; }
.pc-r { position: absolute; pointer-events: none; border: 2px solid #fff; box-shadow: 0 0 0 999px rgba(0, 0, 0, .62); }
.pc-z { flex: none; padding: 20px 56px max(40px, env(safe-area-inset-bottom)); }
.pc-z input { width: 100%; height: 44px; accent-color: #fff; }
@media (min-width: 900px) { dialog.pc { width: 480px; height: min(760px, 92vh); margin: auto; border-radius: 20px; overflow: hidden; } dialog.pc::backdrop { background: rgba(0, 0, 0, .42); } }
@media (prefers-reduced-motion: reduce) { dialog.pc[open] { animation: none; } }`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function html(kind, src, hint) {
    const w = kind === 'circle' ? 80 : 116, h = Math.round(w / R[kind]);
    return `<div class="pp" data-pp="${kind}"><button type="button" class="pp-b" data-k="${kind}" aria-label="프로필 사진 등록"><span class="pf" style="--w:${w}px;--h:${h}px;--r:${kind === 'circle' ? '50%' : '12px'}">${src ? `<img src="${src}" alt="">` : AV}</span><span class="pp-badge">${IMG}</span></button><button type="button" class="pp-del"${src ? '' : ' hidden'}>삭제</button>${hint ? `<small>${hint}</small>` : ''}<input type="file" accept="image/&#42;" hidden></div>`;
  }

  let dlg;
  function dialog() {
    if (dlg) return dlg;
    dlg = document.createElement('dialog'); dlg.className = 'pc'; dlg.setAttribute('aria-label', '프로필 사진 조정');
    dlg.innerHTML = '<div class="pc-h"><button type="button" data-no>취소</button><button type="button" class="ok" data-ok>완료</button></div><div class="pc-s" tabindex="0" aria-label="사진을 끌어서 위치를 맞춰요 (방향키 이동, + − 확대)"><img alt="" draggable="false"><div class="pc-r"></div></div><div class="pc-z"><input type="range" min="1" max="2" step="0.01" value="1" aria-label="확대"></div>';
    document.body.appendChild(dlg); return dlg;
  }

  function adjust(kind, file, onDone) {
    const url = URL.createObjectURL(file), im = new Image();
    im.onerror = () => URL.revokeObjectURL(url);
    im.onload = () => {
      const d = dialog(), stage = d.querySelector('.pc-s'), img = stage.querySelector('img'), ring = stage.querySelector('.pc-r'), rg = d.querySelector('input');
      const r = R[kind], nw = im.naturalWidth, nh = im.naturalHeight, cw0 = Math.min(nw, nh * r);   // 틀을 가득 채우는 가장 큰 폭(확대 1배)
      const c = { cx: nw / 2, cy: nh / 2, cw: cw0 };
      img.src = url; rg.value = 1;
      let FW, FH, SW, SH;
      const clamp = () => { c.cw = Math.max(cw0 / 2, Math.min(cw0, c.cw)); const ch = c.cw / r; c.cx = Math.max(c.cw / 2, Math.min(nw - c.cw / 2, c.cx)); c.cy = Math.max(ch / 2, Math.min(nh - ch / 2, c.cy)); };
      const paint = () => {
        SW = stage.clientWidth; SH = stage.clientHeight; FW = Math.round(kind === 'circle' ? Math.min(300, SW - 48, SH - 40) : Math.min(264, SW - 72, (SH - 40) * r)); FH = Math.round(FW / r);
        clamp(); const k = FW / c.cw;
        img.style.width = nw * k + 'px'; img.style.height = nh * k + 'px'; img.style.left = SW / 2 - c.cx * k + 'px'; img.style.top = SH / 2 - c.cy * k + 'px';
        Object.assign(ring.style, { width: FW + 'px', height: FH + 'px', left: (SW - FW) / 2 + 'px', top: (SH - FH) / 2 + 'px', borderRadius: kind === 'circle' ? '50%' : '12px' });
        rg.value = cw0 / c.cw;
      };
      let drag = null;
      stage.onpointerdown = (e) => { stage.setPointerCapture(e.pointerId); drag = { x: e.clientX, y: e.clientY, cx: c.cx, cy: c.cy }; };
      stage.onpointermove = (e) => { if (!drag) return; const k = FW / c.cw; c.cx = drag.cx - (e.clientX - drag.x) / k; c.cy = drag.cy - (e.clientY - drag.y) / k; paint(); };
      stage.onpointerup = stage.onpointercancel = () => { drag = null; };
      stage.onwheel = (e) => { e.preventDefault(); c.cw *= e.deltaY > 0 ? 1.04 : 0.96; paint(); };
      stage.onkeydown = (e) => {
        const k = FW / c.cw, s = 12 / k;
        if (e.key === 'ArrowLeft') c.cx -= s; else if (e.key === 'ArrowRight') c.cx += s; else if (e.key === 'ArrowUp') c.cy -= s; else if (e.key === 'ArrowDown') c.cy += s;
        else if (e.key === '+' || e.key === '=') c.cw *= 0.96; else if (e.key === '-') c.cw *= 1.04; else return;
        e.preventDefault(); paint();
      };
      rg.oninput = () => { c.cw = cw0 / +rg.value; paint(); };
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
    const del = root.querySelector('.pp-del');
    root.addEventListener('click', (e) => {
      if (e.target.closest('.pp-b')) root.querySelector('input[type=file]').click();
      else if (e.target.closest('.pp-del')) { root.querySelector('.pf').innerHTML = AV; del.hidden = true; onDone(''); }   // 삭제 = 기본 이미지로 되돌리기 (사진은 다시 올릴 수 있어서 확인창 없음)
    });
    root.addEventListener('change', (e) => {
      const f = e.target.files && e.target.files[0]; if (!f) return; e.target.value = '';
      adjust(kind, f, (data) => { const pf = root.querySelector('.pf'); pf.innerHTML = `<img src="${data}" alt="">`; del.hidden = false; onDone(data); });
    });
  }
  return { html, bind };
})();
