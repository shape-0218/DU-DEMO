/* 전시 작업(전시작·전시 콘텐츠)·팀원 관리 데모 데이터 — flow.js 다음에 불러옴
   서버가 없어서 전시마다 브라우저 저장소(`du.d.<전시id>`)에 작품·섹션·팀원을 저장하고, 바뀔 때마다 `du.exh` 목록의 개수(작품·섹션·참여·초대 대기)도 같이 맞춤.
   처음 열면 Figma `전시 작업 · 개편안` 2081:32997·`팀원 관리` 1709:22995의 예시 이름·섹션으로 채움(가상 데이터). 초기화: ?reset=1 */
const ExData = (() => {
  const IMG = 'assets/img/explore/opt/';
  /* U-180(11-20): 작품을 전시마다 따로 — 펼쳐지는 장면(e2)은 공개 전시와 같은 작품·작가, 나머지는 그 전시 포스터 결의 작업 사진이 없어 '나'의 작품 사진을 씀 */
  const WBY = { e2: [['접으면 달라지는 지도', '윤서아', 'wk19', ['김서윤']], ['장면을 넘기는 극장', '윤서아', 'wk20']], e3: [['접으면 달라지는 지도', '윤서아', 'wk19'], ['장면을 넘기는 극장', '윤서아', 'wk20']], e4: [['장면을 넘기는 극장', '윤서아', 'wk20']] };
  const SBY = { e2: [['전시 리플렛', ['c10_1', 'c10_1_2', 'c10_1_3']], ['종이접기 워크숍', ['c10_2', 'c10_2_2', 'c10_2_3']], ['전시장 내부', ['c10_3', 'c10_3_2', 'c10_3_3']]], e3: [['활자 견본', ['c10_1', 'c10_1_2']]] };
  const W = [['접으면 달라지는 지도', '이정우', 'wk19'], ['이동하는 묘상', '박서준', 'wk3'], ['빛으로 기록한 화단', '이준호', 'wk1'], ['쌓아 올린 호흡', '김수현', 'wk21'], ['빈칸의 하루', '최유성', 'wk17'], ['되감는 계단', '이서윤', 'wk7'], ['비가 지난 가방', '오민석', 'wk13'], ['오후의 빈방', '문재이', 'wk5'], ['골목의 다음 칸', '강태오', 'wk9']];
  const S = [['전시 카드·브로셔·가이드', 3], ['전시장 내부 사진', 12], ['준비 과정/BTS', 2], ['작가 인터뷰', 8], ['관람 안내', 1]];   // 11-15 U-151 섹션 설명 삭제·사진 1장 이상(준비 과정 0 → 2)
  const key = (id) => 'du.d.' + id;
  if (new URLSearchParams(location.search).get('reset')) { try { Object.keys(localStorage).filter((k) => k.startsWith('du.d.')).forEach((k) => localStorage.removeItem(k)); } catch (e) {} }

  function seed(e) {
    const works = (WBY[e.id] || []).slice(0, e.works || 0).map(([t, a, f, co], i) => ({ id: 'w' + i, title: t, author: [a, ...(co || [])].join(', '), img: IMG + f + '.jpg', mine: a === (e.myName || '윤서아'), fields: ['그래픽'], year: e.start ? e.start.slice(0, 4) : '2026', medium: '' }));
    const secs = (SBY[e.id] || []).slice(0, e.sections || 0).map(([t, ph], i) => ({ id: 's' + i, title: t, photos: ph.map((p) => 'assets/img/content/opt/' + p + '.jpg') }));
    const me = { id: 'm_me', name: e.myName || '윤서아', nick: 'seoa', role: e.role, me: true };
    const others = [{ id: 'm1', name: '김도윤', nick: 'doyoon', role: 'owner' }, { id: 'm2', name: '서유진', nick: 'yujinarchive', role: 'manager' }, { id: 'm3', name: '한여름', nick: 'summerhan', role: 'member' }, { id: 'm4', name: '박이안', nick: 'ianworks', role: 'member' }];
    const rest = others.filter((o) => !(o.role === 'owner' && e.role === 'owner') && !(o.role === 'manager' && e.role === 'manager'));
    const members = [me, ...rest].slice(0, Math.max(1, e.members || 1));
    const pending = [{ id: 'p1', nick: 'yoonsl' }, { id: 'p2', nick: 'minjaec' }].slice(0, e.pending || 0);
    return { works, secs, team: { link: true, members, pending } };
  }
  function get(e) { let d = store.get(key(e.id), null); if (!d || !d.team) { d = seed(e); store.set(key(e.id), d); } return d; }
  function save(e, d) {
    store.set(key(e.id), d);
    saveExhibitions(exhibitions().map((x) => x.id === e.id ? { ...x, works: d.works.length, sections: d.secs.length, members: d.team.members.length, pending: d.team.pending.length } : x));
  }
  function addWork(exId, w) { const e = exhibitions().find((x) => x.id === exId); if (!e) return; const d = get(e); d.works.unshift({ id: 'w' + Date.now().toString(36), fields: [], year: '', medium: '', ...w }); save(e, d); }
  function updateWork(exId, wid, patch) { const e = exhibitions().find((x) => x.id === exId); if (!e) return; const d = get(e); d.works = d.works.map((x) => x.id === wid ? { ...x, ...patch } : x); save(e, d); }
  return { get, save, addWork, updateWork, seed, IMG, W };
})();
