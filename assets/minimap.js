/* 작은 지도 (11-15, U-163) — 홈 "지도 띠"가 씀.
   지도 화면(map.html)의 가상 지도와 같은 값으로 캔버스에 그리고, 같은 모양의 전시 핀을 그 위에 얹는다. 큰 그림 한 장을 옮기지 않고 보이는 만큼만 다시 그려서 가볍다.
   ★ 지도 그림 값(씨앗 7 · 구획 640 · 길 31+24 · 강 · 공원 · 큰길 · 지명)과 전시별 가상 좌표(XY)는 map.html 의 drawBg · XY 와 같아야 한다. 한쪽을 바꾸면 같이 바꿀 것.
   실제 서비스에서는 지도 SDK(정적 지도) + 전시 주소 좌표로 바뀌는 부분.
   사용: const m = DUMiniMap.make(틀, { s: (폭) => 배율, ay: 가리키는 점의 세로 자리 0~1, keep: () => ({ x, y }) });   // 틀 안에 <canvas> 와 .mpins 가 있어야 함
         m.set(전시 배열) · m.view(x, y) · m.mark(전시 번호 | null) · m.center(전시 배열) → { x, y }   /   DUMiniMap.pos(전시) → { x, y } | null */
const DUMiniMap = (() => {
  const OX = 400, OY = 500, WW = 1800, WH = 2200;
  const XY = [[470, 520], [660, 600], [330, 700], [610, 820], [250, 480], [540, 690], [760, 470], [400, 610], [200, 880], [780, 740], [300, 960]];   // DEMO.EXH 순서
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pos = (e) => (e && XY[e.i] ? { x: XY[e.i][0] + OX, y: XY[e.i][1] + OY } : null);
  let art = null;
  function build() {   // map.html drawBg 와 같은 순서로 난수를 써서 같은 그림이 나옴
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const blocks = new Path2D(), roads = new Path2D(), parks = new Path2D();
    for (let i = 0; i < 640; i++) { const w = 14 + rnd() * 34, h = 12 + rnd() * 30, x = rnd() * WW, y = rnd() * WH; blocks.rect(x, y, w, h); }
    for (let i = 0; i < 31; i++) { const y = 20 + i * 72 + (rnd() * 16 - 8), qy = y + rnd() * 24 - 12, ey = y + rnd() * 20 - 10; roads.moveTo(-10, y); roads.quadraticCurveTo(WW / 2, qy, WW + 10, ey); }
    for (let i = 0; i < 24; i++) { const x = 20 + i * 76 + (rnd() * 16 - 8), qx = x + rnd() * 24 - 12, ex = x + rnd() * 20 - 10; roads.moveTo(x, -10); roads.quadraticCurveTo(qx, WH / 2, ex, WH + 10); }
    for (const [x, y, w, h] of [[120, 120, 160, 120], [760, 140, 150, 110], [430, 960, 140, 90], [820, 520, 110, 150], [150, 700, 110, 100]]) { if (parks.roundRect) parks.roundRect(x, y, w, h, 14); else parks.rect(x, y, w, h); }
    art = { blocks, roads, parks, river: new Path2D('M-420 980 C 220 900 420 1060 640 930 S 900 860 1440 900'), ave: [new Path2D('M-420 230 L 1420 860'), new Path2D('M300 -520 L 700 1520')],
      labels: [[430, 585, '한결대학교'], [640, 405, '가온대학교'], [200, 505, '새봄여자대학교'], [300, 800, '다온대학교'], [560, 760, '예술로'], [680, 915, '봄내천'], [770, 625, '중앙시장']] };
  }
  function make(root, o) {
    if (!art) build();
    const cv = root.querySelector('canvas'), pinsEl = root.querySelector('.mpins'), g = cv.getContext('2d');
    let W = 0, H = 0, s = .5, pins = [], on = null, keep = null, drawn = '';
    const cur = { x: 900, y: 1150 };
    const fix = (p) => { const hw = W / 2 / s; return { x: clamp(p.x, hw, WW - hw), y: clamp(p.y, H * o.ay / s, WH - H * (1 - o.ay) / s) }; };   // 지도 밖이 보이지 않게
    function paint() {
      if (!W || !H) return;
      const c = fix(cur), k = s * cv.width / W, key = c.x.toFixed(1) + ',' + c.y.toFixed(1) + ',' + cv.width + ',' + cv.height;
      if (key !== drawn) {
        drawn = key;
        g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#ebebe8'; g.fillRect(0, 0, cv.width, cv.height);
        g.setTransform(k, 0, 0, k, cv.width / 2 - c.x * k, cv.height * o.ay - c.y * k);
        g.fillStyle = '#e3e3df'; g.fill(art.blocks); g.lineCap = 'butt'; g.strokeStyle = '#f6f6f4'; g.lineWidth = 3; g.stroke(art.roads);
        g.translate(OX, OY);
        g.lineCap = 'round'; g.strokeStyle = '#d9dee1'; g.lineWidth = 56; g.stroke(art.river); g.lineCap = 'butt';
        g.fillStyle = '#dfe2dc'; g.fill(art.parks);
        for (const p of art.ave) { g.strokeStyle = '#d5d5d0'; g.lineWidth = 13; g.stroke(p); g.strokeStyle = '#fbfbfa'; g.lineWidth = 10; g.stroke(p); }
        g.font = '600 11px "Pretendard Variable", Pretendard, sans-serif'; g.lineJoin = 'round'; g.lineWidth = 3; g.strokeStyle = '#ebebe8'; g.fillStyle = '#8f8f8a';
        for (const [x, y, t] of art.labels) { g.strokeText(t, x, y); g.fillText(t, x, y); }
      }
      for (const p of pins) {
        const px = W / 2 + (p.x - c.x) * s, py = H * o.ay + (p.y - c.y) * s;
        p.el.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`;
        const hid = !!keep && px - 17 < keep.x && py - 52 < keep.y && p.id !== on;   // 글자 칩 자리에 들어온 핀은 잠깐 숨김(겹쳐 보이지 않게). 켜진 핀은 숨기지 않음
        if (hid !== p.hid) { p.hid = hid; p.el.classList.toggle('hid', hid); }
      }
    }
    function size() {
      W = root.clientWidth; H = root.clientHeight; if (!W || !H) return;
      const dpr = Math.min(3, devicePixelRatio || 1); cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      s = Math.max(o.s(W), W / WW * 1.02); keep = o.keep ? o.keep() : null; drawn = ''; paint();
    }
    function set(list) {
      pins = list.map((e) => { const p = pos(e); return p && { x: p.x, y: p.y, id: e.i, e }; }).filter(Boolean);
      pinsEl.innerHTML = pins.map((p) => `<span class="mpin ${p.e.st === '전시 예정' ? 'soon' : 'live'}" style="--z:${Math.round(p.y)}"><span class="pc"><img src="${o.src(p.e)}" alt="" draggable="false" width="30" height="42"><i class="dt"></i></span></span>`).join('');
      [...pinsEl.children].forEach((el, i) => { pins[i].el = el; }); on = null; paint();
    }
    function mark(id) { if (id === on) return; on = id; for (const p of pins) p.el.classList.toggle('on', p.id === id); paint(); }
    function view(x, y) { cur.x = x; cur.y = y; paint(); }
    function center(list) {   // 전시들이 띠 가운데에 오게 하는 중심
      const ps = list.map(pos).filter(Boolean); if (!ps.length) return { x: 900, y: 1150 };
      const xs = ps.map((p) => p.x), ys = ps.map((p) => p.y);
      return { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 + (o.ay - .5) * H / s };
    }
    new ResizeObserver(size).observe(root); if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { drawn = ''; paint(); });
    return { set, mark, view, center };
  }
  return { make, pos };
})();
