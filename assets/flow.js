/* 전시 등록 · 내 전시 관리 · 전시 관리(허브) 공용 스크립트
   - 서버가 없어서 브라우저 저장소(localStorage)에 전시 목록을 저장해 화면끼리 값을 이어줌(데모용)
   - 저장소를 못 쓰는 환경이면 메모리로만 동작 */
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const q = new URLSearchParams(location.search);

/* ---------- 아이콘 ---------- */
document.body.insertAdjacentHTML('afterbegin', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <symbol id="i-back" viewBox="0 0 24 24"><path d="m15 5-7 7 7 7"/></symbol>
  <symbol id="i-chev" viewBox="0 0 24 24"><path d="m9 5 7 7-7 7"/></symbol>
  <symbol id="i-chev-l" viewBox="0 0 24 24"><path d="m15 5-7 7 7 7"/></symbol>
  <symbol id="i-updown" viewBox="0 0 24 24"><path d="m8 9.5 4-4 4 4M8 14.5l4 4 4-4"/></symbol>
  <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol>
  <symbol id="i-close" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></symbol>
  <symbol id="i-check" viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></symbol>
  <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></symbol>
  <symbol id="i-more" viewBox="0 0 24 24"><circle cx="5.5" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="18.5" cy="12" r="1.3" fill="currentColor" stroke="none"/></symbol>
  <symbol id="i-cal" viewBox="0 0 24 24"><rect x="4" y="5.5" width="16" height="14" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/></symbol>
  <symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 21s6.5-5.6 6.5-10.5a6.5 6.5 0 0 0-13 0C5.5 15.4 12 21 12 21z"/><circle cx="12" cy="10.5" r="2.3"/></symbol>
  <symbol id="i-folder" viewBox="0 0 24 24"><path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2.2h7a2 2 0 0 1 2 2v7.3a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/><path d="M3.5 10.5h17"/></symbol>
  <symbol id="i-team" viewBox="0 0 24 24"><circle cx="9" cy="8.5" r="3.2"/><path d="M3 19c.4-3.4 2.9-5.2 6-5.2s5.6 1.8 6 5.2"/><path d="M15.5 5.6a3 3 0 0 1 0 5.8M17.5 14c2 .5 3.2 2.1 3.5 5"/></symbol>
  <symbol id="i-pencil" viewBox="0 0 24 24"><path d="m4 20 1-4L16.5 4.5a2 2 0 0 1 2.8 0l.2.2a2 2 0 0 1 0 2.8L8 19z"/><path d="m14.5 6.5 3 3"/></symbol>
  <symbol id="i-play" viewBox="0 0 24 24"><path d="M7 4.8v14.4L19 12z" fill="currentColor" stroke="none"/></symbol>
  <symbol id="i-lock" viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></symbol>
</defs></svg>`);
document.body.insertAdjacentHTML('beforeend', '<div class="toast" id="toast" role="status" aria-live="polite"></div>');

/* ---------- 토스트 ---------- */
let tt;
function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2600); }

/* ---------- 모달 · 시트 ---------- */
function modal({ title, body, list, warn, acts }) {
  const d = document.createElement('dialog'); d.className = 'modal'; d.setAttribute('aria-labelledby', 'md-t');
  d.innerHTML = `<h2 id="md-t">${esc(title)}</h2>${body ? `<p>${esc(body)}</p>` : ''}${list ? `<ul>${list.map((l) => `<li>· ${esc(l)}</li>`).join('')}</ul>` : ''}${warn ? `<div class="warn"><b>${esc(warn[0])}</b><span>${esc(warn[1])}</span></div>` : ''}<div class="acts"></div>`;
  const box = d.querySelector('.acts');
  acts.forEach((a) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn ' + a.cls; b.textContent = a.label; b.addEventListener('click', () => { d.close(); if (a.fn) a.fn(); }); box.appendChild(b); });
  d.addEventListener('close', () => d.remove());
  d.addEventListener('click', (e) => { if (e.target === d) d.close(); });
  document.body.appendChild(d); d.showModal(); return d;
}
let openSheet = null;
function showSheet(html, label, onOpen) {
  closeSheet();
  const scrim = document.createElement('div'); scrim.className = 'scrim';
  const s = document.createElement('div'); s.className = 'sheet'; s.setAttribute('role', 'dialog'); s.setAttribute('aria-modal', 'true'); s.setAttribute('aria-label', label);
  s.innerHTML = '<div class="grab"></div>' + html;
  document.body.append(scrim, s); document.body.classList.add('lock');
  scrim.addEventListener('click', closeSheet);
  openSheet = { scrim, s };
  s.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });
  if (onOpen) onOpen(s);
  const f = s.querySelector('input, button:not(.grab)'); if (f && !s.querySelector('[data-nofocus]')) f.focus({ preventScroll: true });
  return s;
}
function closeSheet() { if (!openSheet) return; openSheet.scrim.remove(); openSheet.s.remove(); openSheet = null; document.body.classList.remove('lock'); }

/* ---------- 저장소 ---------- */
let mem = {};
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); if (v != null) return JSON.parse(v); } catch (e) {} return k in mem ? mem[k] : d; },
  set(k, v) { mem[k] = v; try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  del(k) { delete mem[k]; try { localStorage.removeItem(k); } catch (e) {} }
};
/* 데모용 전시 4개: Figma `내 전시 관리` 1766:24897의 값 그대로 */
const SEED = [
  { id: 'e1', status: 'prep', role: 'owner', myName: '고상준', title: '빛의 결 | 조용한 흐름', org: '한결대학교 사진동아리', start: '2026-06-10', end: '2026-06-20', place: '디스플레이U 갤러리 1관', poster: 'assets/img/explore/opt/ex1.jpg', works: 2, sections: 3, members: 3, pending: 1, pubWork: 'start', pubCont: 'approve' },
  { id: 'e2', status: 'live', role: 'member', myName: '고상준', title: '손끝의 지도', org: '한결대학교 시각디자인학과', start: '2026-05-23', end: '2026-05-30', place: '한결대학교 진달래홀', poster: 'assets/img/explore/opt/ex2.jpg', works: 6, sections: 3, members: 5, pending: 0, pubWork: 'start', pubCont: 'approve' },
  { id: 'e3', status: 'review', role: 'manager', myName: '고상준', title: '여넥스', org: '한결대학교 시각디자인학과', start: '2026-05-28', end: '2026-06-05', place: '진달래홀', poster: 'assets/img/explore/opt/ex0.jpg', posterVideo: true, works: 2, sections: 3, members: 3, pending: 1, pubWork: 'start', pubCont: 'approve' },
  { id: 'e4', status: 'reject', role: 'member', myName: '고상준', title: '움직임의 기록', org: '한결대학교 시각디자인학과', start: '2026-07-01', end: '2026-07-10', place: '디스플레이U 갤러리 2관', poster: 'assets/img/explore/opt/ex4.jpg', works: 2, sections: 3, members: 3, pending: 1, pubWork: 'start', pubCont: 'approve', rejectNote: '이미지 출처를 확인할 수 없어요 수정한 뒤 다시 요청해 주세요' }
];
if (q.get('reset')) store.del('du.exh');
const exhibitions = () => { let l = store.get('du.exh', null); if (!Array.isArray(l)) { l = SEED; store.set('du.exh', l); } return l; };
const saveExhibitions = (l) => store.set('du.exh', l);
const ROLE = { owner: '대표자', manager: '관리자', member: '팀원' };
const STATUS = { prep: '준비 중', review: '심사 중', reject: '반려', live: '공개 중' };
const md = (iso) => iso ? iso.slice(5).replace('-', '.') : '';
const range = (e) => `${md(e.start)} - ${md(e.end)}`;

/* ---------- 화면 공통 ---------- */
function stepper(el, cur) { /* cur: 1 = 등록 요청 중(생성 완료), 2 = 승인 후 공개 중(요청 완료) */
  el.style.setProperty('--p', cur === 1 ? .5 : 1);
  const chk = '<svg class="i" aria-hidden="true"><use href="#i-check"/></svg>';
  const dot = (state, n) => state === 'ok' ? chk : state === 'cur' ? '' : n;
  const st = [cur >= 1 ? 'ok' : 'cur', cur === 1 ? 'cur' : 'ok', cur === 2 ? 'cur' : 'nxt'];
  el.innerHTML = ['준비하기', '등록 요청', '승인 후 공개'].map((t, i) => `<li class="${st[i]}"${st[i] === 'cur' ? ' aria-current="step"' : ''}><span class="dot">${dot(st[i], i + 1)}</span>${t}</li>`).join('');
}
