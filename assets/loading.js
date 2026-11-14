/* 디유 로딩 공용 — 스켈레톤(물결 숨쉬기) · 사진이 켜질 때. 값은 web/handoff/loading-1114/LOADING-SPEC.md
   데모 데이터는 파일 안에 있어 바로 뜨므로, 느린 응답은 주소에 ?slow(=2000ms) 또는 ?slow=밀리초 를 붙여 흉내 냄. */
(function () {
  var q = new URLSearchParams(location.search), SHOW_DELAY = 150, MIN_SHOW = 400;
  var slow = q.has('slow') ? (parseInt(q.get('slow'), 10) || 2000) : 0;
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* 막대 줄 묶음 HTML. spec = [[줄 높이 클래스, 폭 %, 위 여백 클래스], ...] */
  function bars(spec) {
    return spec.map(function (s) { return '<i class="' + s[0] + (s[2] ? ' ' + s[2] : '') + '" style="--w:' + s[1] + '%"></i>'; }).join('');
  }
  /* 물결 순서: 칸마다 --wave(열+행). 열 수는 실제 배치에서 잼 */
  function setWave(scope) {
    var items = [].slice.call(scope.querySelectorAll('.du-sk-item'));
    if (!items.length) return;
    var top0 = items[0].offsetTop, cols = Math.max(1, items.filter(function (el) { return el.offsetTop === top0; }).length);
    items.forEach(function (el, i) { el.style.setProperty('--wave', (i % cols) + Math.floor(i / cols)); });
  }
  /* 사진: 새로 받는 사진은 흐림이 걷히며 켜지고, 이미 받아 둔 사진은 그대로(바로). seen = 그 자리에 스켈레톤이 보였는지 */
  function images(scope, seen) {
    if (seen === undefined) seen = api._seen;
    [].slice.call(scope.querySelectorAll('img')).forEach(function (img, i) {
      if (img._du) return; img._du = 1;
      if (/\.svg(\?|$)/.test(img.getAttribute('src') || '')) return;
      function on() { img.classList.add('du-on'); setTimeout(function () { img.classList.remove('du-img', 'du-on'); img.style.removeProperty('--du-i'); }, 450); }
      if (img.complete && img.naturalWidth) {
        if (!seen) return;
        img.style.setProperty('--du-i', i); img.classList.add('du-img'); void img.offsetWidth; on(); return;
      }
      if (seen) img.style.setProperty('--du-i', i);
      img.classList.add('du-img');
      img.addEventListener('load', on, { once: true });
      img.addEventListener('error', function () { img.classList.add('du-fail'); }, { once: true });
    });
  }
  /* 스켈레톤 흐름: task가 150ms 안에 끝나면 스켈레톤 없이 render, 넘으면 skeleton()을 보이고(최소 400ms) render */
  function swap(scopes, task, skeleton, render, isLive) {
    var shownAt = 0, done = false;
    if (!isLive) isLive = function () { return true; };   /* 더 새로운 요청이 시작됐으면 이 요청은 조용히 끝냄 */
    var timer = setTimeout(function () {
      if (done || !isLive()) return;
      skeleton();
      scopes.forEach(function (s) { s.setAttribute('data-load', 'loading'); s.setAttribute('aria-busy', 'true'); setWave(s); });
      shownAt = performance.now();
    }, SHOW_DELAY);
    return task.then(function () {
      done = true; clearTimeout(timer);
      return shownAt ? wait(Math.max(0, MIN_SHOW - (performance.now() - shownAt))) : null;
    }).then(function () {
      if (!isLive()) return;
      api._seen = !!shownAt;
      scopes.forEach(function (s) { if (shownAt) s.setAttribute('data-load', 'done'); else s.removeAttribute('data-load'); s.removeAttribute('aria-busy'); });
      render();
      scopes.forEach(function (s) { images(s, !!shownAt); });
      api._seen = false;
      if (shownAt) setTimeout(function () { scopes.forEach(function (s) { if (s.getAttribute('data-load') === 'done') s.removeAttribute('data-load'); }); }, 700);
    });
  }
  var api = { slow: slow, wait: wait, bars: bars, setWave: setWave, images: images, swap: swap, _seen: false };
  window.DULoad = api;
})();
