/* 사진·포스터 위에 떠 있는 컨트롤(뒤로가기, 보기 방식 스위치, N/5 칩)이 작품을 가리지 않도록:
   가만히 있으면 서서히 사라지고, 화면을 건드리면 다시 나타남.
   - 한 장씩: 3초 가만히 있으면 뒤로가기·스위치가 사라짐, N/5 칩은 넘긴 직후에만 잠깐 보임
   - 이어서 보기(세로 스크롤): 아래로 내리면 숨고, 위로 올리거나 맨 위에서는 보임
   - 마우스를 올리거나 키보드로 초점이 가면 계속 보임, "움직임 줄이기" 설정이면 숨기지 않음
   뒤로가기 키는 없애지 않음: 공유 링크로 바로 들어온 사람도 홈으로 갈 길이 필요해서 */
window.ChromeFade = (() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CSS = `.fade-ctl, .fade-chip { transition: opacity .15s ease-out; }
.fade-idle .fade-ctl { opacity: 0; pointer-events: none; transition-duration: .4s; }
.chip-idle .fade-chip { opacity: 0; transition-duration: .4s; }
.fade-scrim { position: absolute; left: 0; right: 0; top: 0; height: 96px; z-index: 1; pointer-events: none; background: linear-gradient(to bottom, rgba(0, 0, 0, .3), rgba(0, 0, 0, 0)); }`;
  let styled = false;
  function init({ stage, root, controls = [], chip = null, scrim = true, idle = 3000, chipIdle = 1600, stackActive = () => false }) {
    if (!styled) { const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); styled = true; }
    controls.forEach((c) => c && c.classList.add('fade-ctl'));
    if (chip) chip.classList.add('fade-chip');
    if (scrim) { const sc = document.createElement('i'); sc.className = 'fade-scrim fade-ctl'; sc.setAttribute('aria-hidden', 'true'); root.insertBefore(sc, root.firstChild); }
    let t1 = 0, t2 = 0, hold = 0;
    const idleOn = (on) => root.classList.toggle('fade-idle', on && !reduce);
    const chipOn = (on) => root.classList.toggle('chip-idle', on && !reduce);
    function wake() {
      idleOn(false); chipOn(false); clearTimeout(t1); clearTimeout(t2);
      if (reduce) return;
      t1 = setTimeout(() => { if (!hold) idleOn(true); }, idle);
      t2 = setTimeout(() => { if (!hold) chipOn(true); }, chipIdle);
    }
    function peekChip() {   // 넘긴 직후에만 N/5 칩을 잠깐 보여줌 (뒤로가기·스위치는 건드리지 않음)
      chipOn(false); clearTimeout(t2);
      if (!reduce) t2 = setTimeout(() => { if (!hold) chipOn(true); }, chipIdle);
    }
    const enter = () => { hold++; wake(); }, leave = () => { hold = Math.max(0, hold - 1); wake(); };
    controls.forEach((c) => { if (!c) return; c.addEventListener('mouseenter', enter); c.addEventListener('mouseleave', leave); c.addEventListener('focusin', enter); c.addEventListener('focusout', leave); });
    stage.addEventListener('pointerdown', wake);
    stage.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse' && root.classList.contains('fade-idle')) wake(); });
    document.addEventListener('keydown', wake);
    let lastY = scrollY;
    addEventListener('scroll', () => {
      const y = scrollY, dy = y - lastY;
      if (stackActive()) {
        if (dy > 10 && y > 80) { clearTimeout(t1); clearTimeout(t2); idleOn(true); chipOn(true); lastY = y; }   // 내려가는 중엔 숨김
        else if (dy < -10 || y <= 80) { wake(); lastY = y; }                                                    // 올라가거나 맨 위면 보임
      } else lastY = y;
    }, { passive: true });
    wake();
    return { wake, peekChip };
  }
  return { init };
})();
