/* 사진·영상 올리기 공용 (전시 포스터, 작품 이미지) — flow.js 다음에 불러옴
   규칙(정책안, ❓ 개발 협의): 영상은 한 곳(전시 포스터 5장 중, 작품 10개 중)에 1개, 포스터 영상 30초·200MB, 작품 영상 3분·500MB, MP4·MOV·WEBM.
   영상은 목록·카드에서는 썸네일(정지 이미지)로만 보이고, 홈 대표 포스터와 상세 화면에서만 움직임. 썸네일은 영상 장면 또는 올린 이미지. */
const MEDIA = {
  maxImageMB: 20, maxVideos: 1,
  /* 영상 한도(11-03 정책안): 포스터는 홈·상세에서 반복 재생되는 짧은 영상, 작품은 감상용 */
  poster: { sec: 30, mb: 200 }, work: { sec: 180, mb: 500 },
  isVideo: (f) => /^video\//.test(f.type) || /\.(mp4|mov|m4v|webm)$/i.test(f.name),
  isImage: (f) => /^image\//.test(f.type) || /\.(heic|heif)$/i.test(f.name)
};
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/* 영상 파일 → { url, duration, thumb } (장면 한 컷을 작은 이미지로 뽑음). 읽을 수 없으면 reject */
function readVideo(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file), v = document.createElement('video');
    v.muted = true; v.preload = 'auto'; v.playsInline = true; v.src = url;
    let done = false;
    const fail = () => { if (done) return; done = true; clearTimeout(to); URL.revokeObjectURL(url); rej(new Error('read')); };
    const to = setTimeout(fail, 10000); /* 읽지 못하는 파일은 10초 안에 포기 */
    v.onerror = fail;
    v.onloadedmetadata = () => {
      const d = v.duration;
      if (!isFinite(d)) return fail();
      v.currentTime = Math.min(1, d / 10); /* 첫 장면이 검정일 때가 많아서 조금 뒤 */
    };
    v.onseeked = () => { if (done) return; done = true; clearTimeout(to); res({ url, duration: v.duration, thumb: frameOf(v), w: v.videoWidth, h: v.videoHeight }); };
  });
}
/* 영상 한 장면 → 작은 JPEG(긴 변 480) */
function frameOf(v) {
  const k = 480 / Math.max(v.videoWidth, v.videoHeight), c = document.createElement('canvas');
  c.width = Math.round(v.videoWidth * k); c.height = Math.round(v.videoHeight * k);
  c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
  try { return c.toDataURL('image/jpeg', .75); } catch (e) { return null; }
}
/* 이미지 파일 → 작은 JPEG(긴 변 480). 읽을 수 없으면(HEIC 등) null */
function imageThumb(file) {
  return new Promise((res) => {
    const url = URL.createObjectURL(file), im = new Image();
    im.onload = () => { const k = 480 / Math.max(im.width, im.height), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(url); try { res(c.toDataURL('image/jpeg', .75)); } catch (e) { res(null); } };
    im.onerror = () => { URL.revokeObjectURL(url); res(null); };
    im.src = url;
  });
}

/* 썸네일 바꾸기 시트: 영상에서 장면 고르기 / 이미지 올리기. item = { url, duration, thumb } → onDone(thumbDataURL) */
function thumbSheet(item, onDone) {
  let cur = item.thumb;
  const s = showSheet(`<h2>썸네일 선택</h2><p class="sub">목록과 카드에서는 영상이 이 이미지로 보여요</p>
    <div class="tsel"><video id="tv" src="${item.url}" muted playsinline preload="auto" aria-label="영상 미리보기"></video></div>
    <label class="trange"><span>장면 고르기</span><input id="tr" type="range" min="0" max="${Math.floor(item.duration * 10)}" value="0" aria-valuetext="0초"></label>
    <div class="trow"><button type="button" class="btn btn-soft" id="tup">이미지 올리기</button><button type="button" class="btn btn-dark" id="tok">이 장면으로 선택</button></div>
    <input type="file" id="tfile" accept="image/jpeg,image/png,image/webp" hidden>`, '썸네일 선택', (sh) => {
    const v = sh.querySelector('#tv'), r = sh.querySelector('#tr');
    let up = null;
    r.addEventListener('input', () => { up = null; v.currentTime = r.value / 10; r.setAttribute('aria-valuetext', `${(r.value / 10).toFixed(1)}초`); });
    v.addEventListener('seeked', () => { if (!up) cur = frameOf(v) || cur; });
    sh.querySelector('#tup').addEventListener('click', () => sh.querySelector('#tfile').click());
    sh.querySelector('#tfile').addEventListener('change', async (e) => {
      const f = e.target.files[0]; if (!f) return;
      if (f.size > MEDIA.maxImageMB * 1024 * 1024) { toast('썸네일 이미지는 20MB 이하로 올려주세요'); return; }
      const t = await imageThumb(f); if (!t) { toast('이 이미지는 불러오지 못했어요'); return; }
      up = t; cur = t; v.poster = t; v.removeAttribute('src'); v.load(); r.disabled = true; toast('올린 이미지를 썸네일로 써요');
    });
    sh.querySelector('#tok').addEventListener('click', () => { closeSheet(); onDone(cur); });
  });
  return s;
}
const mediaCss = document.createElement('style');
mediaCss.textContent = `
.tsel { margin-top: 16px; display: grid; place-items: center; border-radius: 12px; background: #000; overflow: hidden; }
.tsel video { display: block; width: 100%; max-height: 32vh; object-fit: contain; }
.trange { display: grid; gap: 8px; margin-top: 16px; font-size: 12px; font-weight: 600; }
.trange input { width: 100%; accent-color: #18181b; height: 28px; }
.trow { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 16px; }
.vbadge { position: absolute; left: 6px; top: 6px; display: inline-flex; align-items: center; gap: 3px; height: 20px; padding: 0 6px 0 4px; border-radius: 4px; background: rgba(0,0,0,.72); color: #fff; font-size: 11px; font-weight: 600; font-variant-numeric: tabular-nums; }
.vbadge .i { width: 10px; height: 10px; fill: currentColor; stroke: none; }
.th .chg { position: absolute; right: 6px; bottom: 6px; height: 22px; padding: 0 8px; border-radius: 6px; background: rgba(255,255,255,.92); font-size: 11px; font-weight: 600; }
`;
document.head.appendChild(mediaCss);
