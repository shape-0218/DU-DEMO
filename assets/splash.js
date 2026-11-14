/* 디유 스플래시 — 홈에 처음 들어올 때(세션당 1번) 로고 조각이 올라와 완성된 뒤, 홈의 검은 영역이 아래에서 올라오며 로고가 헤더 자리로 이동.
   값은 web/handoff/loading-1114/SPEC.md 와 같음. 주소에 ?splash 를 붙이면 언제든 다시 보임(시험용).
   body 맨 앞에서 불러야 홈이 비치지 않음: <body><script src="assets/splash.js"></script> */
(function () {
  var SPLASH_SVG = '<svg class="sp-logo" viewBox="0 0 124 28.3059" aria-hidden="true" focusable="false"><defs><clipPath id="spCwBase"><rect x="-4" y="-4" width="132" height="27.2"/></clipPath><clipPath id="spCwFull"><rect x="-4" y="-0.2" width="132" height="29"/></clipPath><clipPath id="spCwNone"><rect x="-4" y="-40" width="132" height="80"/></clipPath></defs><g clip-path="url(#spCwBase)"><path class="sp-p" style="--dy:24px;--ov:-0.45px;--d:0ms;--t:760ms" d="M0 22.2812V2.29672H7.05864C14.0867 2.29672 17.7536 6.29972 17.7536 12.2889C17.7536 18.2782 14.0867 22.2812 7.05864 22.2812H0ZM4.95022 17.6976H7.05864C11.0616 17.6976 12.7422 15.6197 12.7422 12.2889C12.7422 8.9582 11.0616 6.88031 7.05864 6.88031H4.95022V17.6976Z"/></g><g clip-path="url(#spCwBase)"><path class="sp-p" style="--dy:19px;--ov:-0.45px;--d:70ms;--t:700ms" d="M20.6211 5.867C18.9405 5.867 17.6876 4.61415 17.6876 2.9335C17.6876 1.25285 18.9405 0 20.6211 0C22.3017 0 23.5546 1.25285 23.5546 2.9335C23.5546 4.61415 22.3017 5.867 20.6211 5.867ZM18.3293 22.3374V7.24208H22.9129V22.3374H18.3293Z"/></g><g clip-path="url(#spCwBase)"><path class="sp-p" style="--dy:19px;--ov:-0.45px;--d:125ms;--t:700ms" d="M29.8644 22.2556C25.9837 22.2556 23.478 20.1777 23.4169 17.2748H27.9393C27.9699 18.0693 28.5505 18.4665 29.8033 18.4665C31.2089 18.4665 31.6673 17.9776 31.6673 17.3359C31.6673 16.3275 30.5672 16.2358 29.1616 16.0219C27.0837 15.7163 23.6614 15.1969 23.6614 11.5606C23.6614 8.50482 26.0754 6.36581 29.8339 6.36581C33.5924 6.36581 35.9147 8.53538 36.0063 11.255H31.545C31.4228 10.5522 30.8117 10.1549 29.895 10.1549C28.7644 10.1549 28.306 10.7355 28.306 11.3467C28.306 12.2634 29.4061 12.3856 30.8117 12.5995C32.9812 12.9051 36.3119 13.4857 36.3119 17.0609C36.3119 20.1777 33.7451 22.2556 29.8644 22.2556Z"/></g><g clip-path="url(#spCwFull)"><path class="sp-p" style="--dy:-31px;--ov:0.45px;--d:175ms;--t:740ms" d="M37.4223 28.3059V14.4635C37.4223 9.39098 40.8446 6.36581 45.4587 6.36581C50.2562 6.36581 53.6174 9.63544 53.6174 14.4941C53.6174 19.7499 49.7062 22.2556 46.2838 22.2556C44.4809 22.2556 42.9531 21.5528 42.0058 20.2083V28.3059H37.4223ZM45.4893 17.9776C47.5672 17.9776 48.9728 16.4803 48.9728 14.3107C48.9728 12.1411 47.5672 10.6438 45.4893 10.6438C43.4114 10.6438 42.0058 12.1411 42.0058 14.3107C42.0058 16.4803 43.4114 17.9776 45.4893 17.9776Z"/></g><g clip-path="url(#spCwBase)"><path class="sp-p" style="--dy:26px;--ov:-0.45px;--d:225ms;--t:720ms" d="M54.61 22.3322V0.636485H59.1936V22.3322H54.61Z"/></g><g clip-path="url(#spCwBase)"><path class="sp-p" style="--dy:19px;--ov:-0.45px;--d:270ms;--t:690ms" d="M67.6424 22.2556C64.2811 22.2556 60.3393 19.7499 60.3393 14.4941C60.3393 9.63544 63.7006 6.36581 68.498 6.36581C73.2343 6.36581 76.5345 9.51321 76.5345 14.4635V21.8584H72.3176V19.3527C71.5231 21.2167 69.8119 22.2556 67.6424 22.2556ZM68.4674 17.9776C70.5453 17.9776 71.9509 16.4803 71.9509 14.3107C71.9509 12.1411 70.5453 10.6438 68.4674 10.6438C66.3896 10.6438 64.9839 12.1411 64.9839 14.3107C64.9839 16.4803 66.3896 17.9776 68.4674 17.9776Z"/></g><g clip-path="url(#spCwFull)"><path class="sp-p" style="--dy:-31px;--ov:0.45px;--d:320ms;--t:740ms" d="M85.0018 28.049C81.4266 28.049 78.4626 26.399 77.6987 22.671H82.2822C82.7405 23.6794 83.535 24.0766 85.0018 24.0766C87.0185 24.0766 87.9047 23.1293 87.9047 20.8375V19.3402C87.0491 20.6542 85.7351 21.357 84.1462 21.357C80.9682 21.357 77.5764 19.218 77.5764 13.6871V6.10892H82.16V13.6871C82.16 16.0706 83.3211 17.079 85.0323 17.079C86.6824 17.079 87.9047 16.0095 87.9047 13.6871V6.10892H92.4882V20.6847C92.4882 25.9406 89.1269 28.049 85.0018 28.049Z"/></g><g clip-path="url(#spCwBase)"><path class="sp-p" style="--dy:24px;--ov:-0.45px;--d:385ms;--t:720ms" d="M109.001 22.6094C103.501 22.6094 100.446 19.3703 100.446 14.2062V2.2277H105.396V14.2062C105.396 16.6507 106.526 18.0258 108.971 18.0258C111.477 18.0258 112.607 16.6813 112.607 14.2062V2.2277H117.435V14.2062C117.435 19.3398 114.41 22.6094 109.001 22.6094Z"/></g><g clip-path="url(#spCwNone)"><path class="sp-p sp-dot" style="--dy:-16px;--ov:-0.45px;--d:540ms;--t:640ms" d="M118.907 17.5072H124V22.6H118.907Z"/></g></svg>';
  var KEY = 'du-splash', force = /[?&]splash(=|&|$)/.test(location.search), seen = false;
  try { seen = sessionStorage.getItem(KEY) === '1'; } catch (e) {}
  if (seen && !force) return;
  try { sessionStorage.setItem(KEY, '1'); } catch (e) {}

  var root = document.documentElement, body = document.body;
  var rm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ANIM_END = rm ? 300 : 1180, HOLD = 150, MOVE = rm ? 0 : 720;     /* 조각 완성 · 머묾 · 연결 */
  var meta = document.querySelector('meta[name="theme-color"]'), themeOld = meta && meta.getAttribute('content');
  var finished = false;

  root.classList.add('sp-pre');
  if (meta) meta.setAttribute('content', '#ffffff');
  body.insertAdjacentHTML('afterbegin', '<div id="du-splash" aria-hidden="true">' + SPLASH_SVG + '</div>');
  var sp = document.getElementById('du-splash');
  void sp.offsetWidth;
  sp.className = 'run' + (rm ? ' rm' : '');

  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  /* 앱 틀이 준비됐는지: 스켈레톤이 떠 있거나, 첫 포스터 사진이 도착(최대 2.5초). 데이터는 기다리지 않음 */
  function ready() {
    return new Promise(function (res) {
      var t = 0;
      (function tick() {
        var im = document.querySelector('#rail .slot img'), sk = document.querySelector('#rail .du-sk-item');
        if (sk || (im && im.complete && im.naturalWidth) || t >= 2500) return res();   /* 스켈레톤이 떠 있으면 데이터를 기다리지 않고 바로 이어짐 */
        t += 50; setTimeout(tick, 50);
      })();
    });
  }
  /* 홈 헤더 로고까지의 거리를 재서 넣음(소수점·화면 폭 오차 없이 겹치게) */
  function measure() {
    var a = sp.querySelector('.sp-logo').getBoundingClientRect(), h = document.querySelector('.head .logo img');
    if (!h) return;
    var b = h.getBoundingClientRect();
    sp.style.setProperty('--sp-dx', (b.left - a.left) + 'px');
    sp.style.setProperty('--sp-dy', (b.top - a.top) + 'px');
    root.style.setProperty('--sp-H', innerHeight + 'px');
  }
  function cleanup() {
    if (finished) return; finished = true;
    root.classList.add('sp-landed');
    if (sp.parentNode) sp.parentNode.removeChild(sp);
    if (meta && themeOld) meta.setAttribute('content', themeOld);
    setTimeout(function () { root.classList.remove('sp-pre', 'sp-go', 'sp-landed'); root.style.removeProperty('--sp-H'); }, 30);
  }
  Promise.all([wait(ANIM_END + HOLD), ready()]).then(function () {
    scrollTo(0, 0); measure();
    root.classList.add('sp-go');
    if (meta && themeOld) meta.setAttribute('content', themeOld);
    return wait(MOVE + 30);
  }).then(cleanup);
  setTimeout(cleanup, 7000);   /* 안전장치: 무슨 일이 있어도 홈이 갇히지 않게 */
})();
