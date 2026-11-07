/* 공유 (11-08 밤 사용자 결정 — 무신사·크림처럼 기기가 주는 공유 창을 그대로 씀)
   상세 화면(전시·작품)의 공유 버튼(.share)을 누르면 아이폰은 iOS 공유 시트, 갤럭시는 안드로이드 공유 창이 뜸(Web Share API).
   - 우리가 그린 공유 시트(카카오톡/링크 복사)는 없음 · 제목·설명 같은 글자도 안 만듦
   - 공유 창을 지원하지 않는 브라우저(데스크톱 일부, http 주소)에서는 링크만 조용히 복사(안내 문구 없음 — 사용자 확인 11-08 밤)
   - 사용자가 공유 창을 그냥 닫은 경우(AbortError)는 아무 일도 하지 않음 */
(() => {
  async function copy(url) {
    try { await navigator.clipboard.writeText(url); } catch (e) { const ta = document.createElement('textarea'); ta.value = url; ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (x) {} ta.remove(); }
  }
  async function share() {
    const data = { title: document.title, url: location.href };
    if (navigator.share && (!navigator.canShare || navigator.canShare(data))) {
      try { await navigator.share(data); } catch (e) { if (e && e.name === 'AbortError') return; copy(data.url); }   // 닫기 = 취소, 그 밖의 실패만 복사로 대신
      return;
    }
    copy(data.url);
  }
  document.addEventListener('click', (e) => { const b = e.target.closest('.share'); if (!b || b.disabled) return; e.preventDefault(); share(); });
})();
