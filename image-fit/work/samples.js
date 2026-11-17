/* 검토용(푸시 대상 아님, 11-16) — 작품 시안(work-fit-v1)용 예시 작품 사진. poster-fit-v1/posters.js 사본: 예시 목록만 작품으로 바꿈.
   (아래 원래 설명은 포스터 시안 것) 예시 포스터를 캔버스로 그려 data URL로 돌려줌.
   비율은 11-16 졸준위 인스타 304개 조사(handoff/poster-ratio-1116/REPORT.md)에서 실제로 나온 것:
   A 규격 83% · 3:4 6% · 4:5 4% · 2:3 4% · 가로 2% · 정사각 0.4%, 그리고 졸준위식 '흰 여백 정사각'(게시물 79%가 이 틀).
   글자는 가장자리 가까이(여백 32~40) 두어 '꽉 채우기'에서 날짜·장소가 잘리는 모습이 보이게 함.
   trim: 둘레가 한 가지 색 여백이면 잘라낸 사본(D 제안 '여백 자동 잘라내기'). */
window.PF_POSTERS = (() => {   /* 작품 시안용(이름은 포스터 시안과 같게 둬서 index가 그대로 씀) */
  const FONT = '"Pretendard Variable", Pretendard, -apple-system, sans-serif';
  const IMG = new URL('../../assets/img/', document.baseURI).href;
  const load = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  const fontReady = (w, px, text) => document.fonts.load(`${w} ${px}px "Pretendard Variable"`, text).catch(() => {});

  function cover(c, im, s, d) {
    const sr = s.w / s.h, dr = d.w / d.h;
    let { x, y, w, h } = s;
    if (sr > dr) { const nw = h * dr; x += (w - nw) / 2; w = nw; } else { const nh = w / dr; y += (h - nh) / 2; h = nh; }
    c.drawImage(im, x, y, w, h, d.x, d.y, d.w, d.h);
  }
  async function text(c, s, x, y, o) {
    await fontReady(o.w, o.px, s);
    c.font = `${o.w} ${o.px}px ${FONT}`; c.fillStyle = o.color; c.textAlign = o.align || 'left'; c.textBaseline = 'alphabetic';
    if ('letterSpacing' in c) c.letterSpacing = (o.ls != null ? o.ls : -0.03) * o.px + 'px';
    c.fillText(s, x, y);
  }
  async function fitText(c, s, maxW, o) {
    await fontReady(o.w, o.px, s);
    c.font = `${o.w} ${o.px}px ${FONT}`; if ('letterSpacing' in c) c.letterSpacing = (o.ls != null ? o.ls : -0.03) * o.px + 'px';
    const m = c.measureText(s).width; return m > maxW ? Math.floor(o.px * maxW / m) : o.px;
  }
  const canvas = (w, h, bg) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d'); c.fillStyle = bg; c.fillRect(0, 0, w, h); return [cv, c]; };

  const LIST = [
    { k: 'w34', label: '3:4', note: '카드와 같음', file: 'work/opt/main.jpg' },
    { k: 'ig', label: '인스타용 흰 여백', note: '그대로 올리면' },
    { k: 'small', label: '흰 바탕 가운데 작은 작품', note: '1.40 · 11-17 조사에서 6장' },
    { k: 'paint', label: '가로 회화', note: '1.52 · 단색 바탕', file: 'detail/opt/art-head.jpg' },
    { k: 'draw', label: '종이 드로잉', note: '4:3 · 종이 여백도 작품', file: 'work/opt/p1.jpg' },
    { k: 'tall', label: '2:3', note: '세로로 김', file: 'detail/opt/art-flower.jpg' },
    { k: 'inst', label: '설치 사진', note: '1.54 · 가장자리 여러 색', file: 'detail/opt/gallery.jpg' },
  ];

  const DRAW = {
    async ig() {     // 졸준위처럼 1250 정사각 흰 바탕 가운데에 3:4 작품 사진(세로 95.4%)을 넣은 파일
      const [cv, c] = canvas(1250, 1250, '#ffffff');
      const im = await load(IMG + 'work/opt/main.jpg');
      const h = 1192, w = Math.round(h * im.naturalWidth / im.naturalHeight);
      c.drawImage(im, Math.round((1250 - w) / 2), 29, w, h);
      return cv;
    },
    async small() {  // 11-17 실제 사진에서 본 모양: 가로 흰 바탕(1440×1028)에 작은 작품이 가운데에서 조금 비켜 놓임
      const [cv, c] = canvas(1440, 1028, '#ffffff');
      const im = await load(IMG + 'detail/opt/art-flower.jpg');
      const h = 420, w = Math.round(h * im.naturalWidth / im.naturalHeight);
      c.drawImage(im, 600, 270, w, h);
      return cv;
    },
  };

  /* 둘레에서 가장 많이 나오는 색(최빈값)과 그 비율 */
  function edgeInfo(src, S = 64) {
    const sw = src.naturalWidth || src.width, sh = src.naturalHeight || src.height, sc = S / Math.max(sw, sh);
    const W = Math.max(1, Math.round(sw * sc)), H = Math.max(1, Math.round(sh * sc));
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const c = cv.getContext('2d', { willReadFrequently: true }); c.drawImage(src, 0, 0, W, H);
    const d = c.getImageData(0, 0, W, H).data, bins = new Map(); let tot = 0;
    const add = (x, y) => { const i = (y * W + x) * 4, k = (d[i] >> 4) << 8 | (d[i + 1] >> 4) << 4 | (d[i + 2] >> 4); const e = bins.get(k) || [0, 0, 0, 0]; e[0]++; e[1] += d[i]; e[2] += d[i + 1]; e[3] += d[i + 2]; bins.set(k, e); tot++; };
    for (let i = 0; i < W; i++) { add(i, 0); add(i, H - 1); } for (let j = 0; j < H; j++) { add(0, j); add(W - 1, j); }
    let best = null; bins.forEach((e) => { if (!best || e[0] > best[0]) best = e; });
    const rgb = [best[1] / best[0], best[2] / best[0], best[3] / best[0]];
    return { rgb, hex: '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join(''), share: best[0] / tot, data: d, W, H };
  }
  /* 한 가지 색 여백이 둘레를 감싸고 있으면 그 안쪽(포스터)만 잘라냄. 조사 때 쓴 방식과 같음 */
  function trim(src) {
    const e = edgeInfo(src, 240);
    const { data: px, W, H } = e;
    /* 여백이 네 변 모두거나, 위아래 두 변만(가로 포스터를 정사각에 넣은 경우)·양옆 두 변만일 수 있음(11-16 실제 포스터로 확인) */
    const modeOf = (pts) => { const bins = new Map(); for (const [x, y] of pts) { const i = (y * W + x) * 4, k = (px[i] >> 4) << 8 | (px[i + 1] >> 4) << 4 | (px[i + 2] >> 4); const v = bins.get(k) || [0, 0, 0, 0]; v[0]++; v[1] += px[i]; v[2] += px[i + 1]; v[3] += px[i + 2]; bins.set(k, v); } let b = null; bins.forEach((v) => { if (!b || v[0] > b[0]) b = v; }); return { share: b[0] / pts.length, rgb: [b[1] / b[0], b[2] / b[0], b[3] / b[0]] }; };
    const tbPts = [], lrPts = []; for (let i = 0; i < W; i++) { tbPts.push([i, 0], [i, H - 1]); } for (let j = 0; j < H; j++) { lrPts.push([0, j], [W - 1, j]); }
    const tb = modeOf(tbPts), lr = modeOf(lrPts);
    const rgb = e.share >= 0.85 ? e.rgb : tb.share >= 0.9 ? tb.rgb : lr.share >= 0.9 ? lr.rgb : null;
    if (!rgb) return null;   // 둘레가 한 색이 아니면(사진이 꽉 찬 포스터) 손대지 않음
    const diff = (i) => Math.abs(px[i] - rgb[0]) + Math.abs(px[i + 1] - rgb[1]) + Math.abs(px[i + 2] - rgb[2]) > 36;
    const rowOn = (j) => { let n = 0; for (let i = 0; i < W; i++) if (diff((j * W + i) * 4)) n++; return n > W * 0.02; };
    const colOn = (i) => { let n = 0; for (let j = 0; j < H; j++) if (diff((j * W + i) * 4)) n++; return n > H * 0.02; };
    let t = 0, b = H - 1, l = 0, r = W - 1;
    while (t < H && !rowOn(t)) t++; while (b > t && !rowOn(b)) b--; while (l < W && !colOn(l)) l++; while (r > l && !colOn(r)) r--;
    const box = { x: l / W, y: t / H, w: (r - l + 1) / W, h: (b - t + 1) / H };
    if (box.w > 0.97 && box.h > 0.97) return null;
    const sw = src.naturalWidth || src.width, sh = src.naturalHeight || src.height;
    /* 포스터 자체의 단색 바탕(디자인 여백)을 잘못 자르지 않도록: ① 안쪽이 가운데 놓여 있고 ② 안쪽 비율이 포스터 규격(A·3:4·4:5·2:3)과 맞고
       ③ 바깥 틀과 비율이 8% 넘게 다를 때만 '덧붙인 여백'으로 봄 */
    const ir = (box.w * sw) / (box.h * sh), or = sw / sh;
    const centered = Math.abs(box.x - (1 - box.x - box.w)) < 0.03 && Math.abs(box.y - (1 - box.y - box.h)) < 0.03;
    const known = [0.707, 0.75, 0.8, 0.667].some((k) => Math.abs(ir - k) < 0.02);
    const twoSide = box.w > 0.97 || box.h > 0.97;   // 포스터가 두 변에 닿아 있음 = 틀에 맞춰 넣은 모양(인스타 정사각에 가로 포스터 등)
    if (!centered || !(known || twoSide) || Math.abs(ir - or) / or < 0.08) return null;
    const ix = box.x > 0.01 ? 0.005 : 0, iy = box.y > 0.01 ? 0.005 : 0;   // 잘라낸 쪽은 0.5% 더 안으로(경계 흰 줄 방지)
    const cw = Math.round((box.w - 2 * ix) * sw), ch = Math.round((box.h - 2 * iy) * sh), cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
    cv.getContext('2d').drawImage(src, Math.round((box.x + ix) * sw), Math.round((box.y + iy) * sh), cw, ch, 0, 0, cw, ch);
    return { cv, box, w: cw, h: ch };
  }

  const cache = {};
  async function make(k) {
    if (cache[k]) return cache[k];
    const it = LIST.find((x) => x.k === k) || LIST[0];
    let src, w, h, el;
    if (it.file) { el = await load(IMG + it.file); src = el.src; w = el.naturalWidth; h = el.naturalHeight; }
    else { el = await DRAW[it.k](); src = el.toDataURL('image/jpeg', 0.9); w = el.width; h = el.height; }
    const t = trim(el);
    const pack = (x) => { const e = edgeInfo(x.cv); return { src: x.cv.toDataURL('image/jpeg', 0.9), w: x.w, h: x.h, edge: e.hex, share: e.share, box: x.box }; };
    const trimmed = t ? pack(t) : null;
    const s = trimS(el), e0 = edgeInfo(el);
    return (cache[k] = { k: it.k, label: it.label, note: it.note, src, w, h, edge: e0.hex, share: e0.share, trim: trimmed, trimS: s ? pack(s) : null });
  }

  /* 작품 제안(11-17 채택): 둘레가 흰색·검정 한 색 틀이면 비율·위치와 상관없이 걷어 내고, 작품 둘레에 안쪽 긴 변의 4%를 여유로 남김.
     흰·검정이 아닌 단색(그림 바탕색 등)은 작품의 일부일 수 있어 그대로 둠 */
  function trimS(src) {
    const e = edgeInfo(src, 240), { data: px, W, H } = e;
    const modeOf = (pts) => { const bins = new Map(); for (const [x, y] of pts) { const i = (y * W + x) * 4, k = (px[i] >> 4) << 8 | (px[i + 1] >> 4) << 4 | (px[i + 2] >> 4); const v = bins.get(k) || [0, 0, 0, 0]; v[0]++; v[1] += px[i]; v[2] += px[i + 1]; v[3] += px[i + 2]; bins.set(k, v); } let b = null; bins.forEach((v) => { if (!b || v[0] > b[0]) b = v; }); return { share: b[0] / pts.length, rgb: [b[1] / b[0], b[2] / b[0], b[3] / b[0]] }; };
    const tbPts = [], lrPts = []; for (let i = 0; i < W; i++) { tbPts.push([i, 0], [i, H - 1]); } for (let j = 0; j < H; j++) { lrPts.push([0, j], [W - 1, j]); }
    const tb = modeOf(tbPts), lr = modeOf(lrPts);
    const rgb = e.share >= 0.85 ? e.rgb : tb.share >= 0.9 ? tb.rgb : lr.share >= 0.9 ? lr.rgb : null;
    if (!rgb) return null;
    const white = rgb.every((v) => v > 228), black = rgb.every((v) => v < 28);
    if (!white && !black) return null;
    const diff = (i) => Math.abs(px[i] - rgb[0]) + Math.abs(px[i + 1] - rgb[1]) + Math.abs(px[i + 2] - rgb[2]) > 36;
    const rowOn = (j) => { let n = 0; for (let i = 0; i < W; i++) if (diff((j * W + i) * 4)) n++; return n > W * 0.02; };
    const colOn = (i) => { let n = 0; for (let j = 0; j < H; j++) if (diff((j * W + i) * 4)) n++; return n > H * 0.02; };
    let t = 0, b = H - 1, l = 0, r = W - 1;
    while (t < H && !rowOn(t)) t++; while (b > t && !rowOn(b)) b--; while (l < W && !colOn(l)) l++; while (r > l && !colOn(r)) r--;
    const sw = src.naturalWidth || src.width, sh = src.naturalHeight || src.height;
    const bx = l / W * sw, by = t / H * sh, bw = (r - l + 1) / W * sw, bh = (b - t + 1) / H * sh, pad = Math.max(bw, bh) * 0.04;
    const x0 = Math.max(0, bx - pad), y0 = Math.max(0, by - pad), x1 = Math.min(sw, bx + bw + pad), y1 = Math.min(sh, by + bh + pad);
    if ((x1 - x0) / sw > 0.97 && (y1 - y0) / sh > 0.97) return null;
    const cw = Math.round(x1 - x0), ch = Math.round(y1 - y0), cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
    cv.getContext('2d').drawImage(src, Math.round(x0), Math.round(y0), cw, ch, 0, 0, cw, ch);
    return { cv, w: cw, h: ch, box: { x: x0 / sw, y: y0 / sh, w: (x1 - x0) / sw, h: (y1 - y0) / sh } };
  }
  return { LIST, make };
})();
