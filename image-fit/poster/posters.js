/* 검토용(푸시 대상 아님, 11-16) — 예시 포스터를 캔버스로 그려 data URL로 돌려줌.
   비율은 11-16 졸준위 인스타 304개 조사(handoff/poster-ratio-1116/REPORT.md)에서 실제로 나온 것:
   A 규격 83% · 3:4 6% · 4:5 4% · 2:3 4% · 가로 2% · 정사각 0.4%, 그리고 졸준위식 '흰 여백 정사각'(게시물 79%가 이 틀).
   글자는 가장자리 가까이(여백 32~40) 두어 '꽉 채우기'에서 날짜·장소가 잘리는 모습이 보이게 함.
   trim: 둘레가 한 가지 색 여백이면 잘라낸 사본(D 제안 '여백 자동 잘라내기'). */
window.PF_POSTERS = (() => {
  const FONT = '"Pretendard Variable", Pretendard, -apple-system, sans-serif';
  const IMG = new URL('../../assets/img/explore/opt/', document.baseURI).href;
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
    { k: 'a4', label: 'A 규격', note: '83%', file: 'p03.jpg' },
    { k: 'ig', label: '인스타용 흰 여백', note: '그대로 올리면' },
    { k: '34', label: '3:4', note: '6%' },
    { k: '45', label: '4:5', note: '4%' },
    { k: '23', label: '2:3', note: '4%' },
    { k: 'land', label: '가로', note: '2%' },
    { k: 'sq', label: '정사각', note: '0.4%' },
  ];

  const DRAW = {
    async ig() {     // 졸준위식: 1250 정사각 흰 바탕 가운데에 A 규격 포스터(세로 95.4%)
      const [cv, c] = canvas(1250, 1250, '#ffffff');
      const im = await load(IMG + 'p03.jpg');
      const h = 1192, w = Math.round(h * im.naturalWidth / im.naturalHeight);
      c.drawImage(im, Math.round((1250 - w) / 2), 29, w, h);
      return cv;
    },
    async '34'() {   // 3:4 · 사진이 위를 꽉 채우고 아래에 글자
      const [cv, c] = canvas(720, 960, '#e7e7e4');
      const im = await load(IMG + 'wk8.jpg');
      cover(c, im, { x: 0, y: 120, w: 600, h: 560 }, { x: 0, y: 0, w: 720, h: 700 });
      await text(c, '머무는 화면', 34, 790, { w: 700, px: 64, color: '#141414', ls: -0.05 });
      await text(c, '한빛대학교 영상학과 졸업전시', 36, 836, { w: 500, px: 22, color: '#3b3b3b' });
      await text(c, '2026.11.20 – 11.25', 36, 924, { w: 600, px: 24, color: '#141414', ls: 0 });
      await text(c, '한빛관 B1', 684, 924, { w: 500, px: 22, color: '#3b3b3b', align: 'right' });
      return cv;
    },
    async '45'() {   // 4:5 · 미색 바탕 + 작품 사진 + 아래 날짜
      const [cv, c] = canvas(720, 900, '#efece6');
      const im = await load(IMG + 'wk2.jpg');
      cover(c, im, { x: 80, y: 190, w: 330, h: 400 }, { x: 36, y: 236, w: 648, h: 560 });
      await text(c, '한빛대학교 섬유디자인과 졸업전시', 36, 64, { w: 500, px: 22, color: '#3a3a36' });
      await text(c, '결의 온도', 34, 190, { w: 700, px: 88, color: '#1b1b19', ls: -0.05 });
      await text(c, '2026.11.20 – 11.25', 36, 862, { w: 600, px: 26, color: '#1b1b19', ls: 0 });
      await text(c, '한빛관 B1 갤러리', 684, 862, { w: 500, px: 22, color: '#3a3a36', align: 'right' });
      return cv;
    },
    async '23'() {   // 2:3 · 검정 바탕 + 사진 + 위 제목·아래 날짜(A보다 길쭉)
      const [cv, c] = canvas(640, 960, '#121212');
      const im = await load(IMG + 'wk5.jpg');
      cover(c, im, { x: 30, y: 264, w: 540, h: 280 }, { x: 0, y: 260, w: 640, h: 440 });
      await text(c, '빛이 머문 자리', 32, 96, { w: 700, px: 56, color: '#ffffff', ls: -0.04 });
      await text(c, '한빛대학교 사진학과 졸업전시', 32, 136, { w: 500, px: 20, color: '#bdbdbd' });
      await text(c, '2026.11.20 – 11.25', 32, 898, { w: 600, px: 26, color: '#ffffff', ls: 0 });
      await text(c, '한빛관 B1', 32, 932, { w: 500, px: 20, color: '#bdbdbd' });
      return cv;
    },
    async land() {   // 가로(약 1.38) · 왼쪽 사진 + 오른쪽 글자 — 조사에서 본 가로형(1.379)과 같은 비율
      const [cv, c] = canvas(966, 700, '#fafaf8');
      const im = await load(IMG + 'wk11.jpg');
      cover(c, im, { x: 0, y: 150, w: 600, h: 650 }, { x: 0, y: 0, w: 483, h: 700 });
      await text(c, '한빛대학교 건축학과 졸업전시', 531, 96, { w: 500, px: 22, color: '#555555' });
      await text(c, '사이의 치수', 529, 196, { w: 700, px: 68, color: '#111111', ls: -0.05 });
      await text(c, '2026.11.20 – 11.25', 531, 610, { w: 600, px: 26, color: '#111111', ls: 0 });
      await text(c, '한빛관 3층 전시실', 531, 648, { w: 500, px: 22, color: '#555555' });
      return cv;
    },
    async sq() {     // 정사각 · 진한 파랑 단색 + 큰 영문 제목
      const [cv, c] = canvas(720, 720, '#2f3fd6');
      await text(c, '한빛대학교 조소과 졸업전시', 40, 66, { w: 500, px: 22, color: '#ffffff' });
      await text(c, '2026', 680, 66, { w: 600, px: 22, color: '#ffffff', align: 'right', ls: 0 });
      const px = await fitText(c, 'MATTER', 652, { w: 800, px: 200, ls: -0.05 });
      await text(c, 'SOFT', 32, 150 + px * 0.78, { w: 800, px, color: '#ffffff', ls: -0.05 });
      await text(c, 'MATTER', 32, 150 + px * 1.64, { w: 800, px, color: '#ffffff', ls: -0.05 });
      await text(c, '부드러운 물질', 40, 560, { w: 600, px: 32, color: '#ffffff' });
      await text(c, '11.20 – 11.25', 40, 676, { w: 600, px: 28, color: '#ffffff', ls: 0 });
      await text(c, '한빛관 2층', 680, 676, { w: 500, px: 24, color: '#ffffff', align: 'right' });
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
    const trimmed = t ? { src: t.cv.toDataURL('image/jpeg', 0.9), w: t.w, h: t.h, edge: edgeInfo(t.cv).hex, box: t.box } : null;
    return (cache[k] = { k: it.k, label: it.label, note: it.note, src, w, h, edge: edgeInfo(el).hex, trim: trimmed });
  }
  return { LIST, make };
})();
