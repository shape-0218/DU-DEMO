/* 큰 파일(포스터 영상·사진 원본)을 브라우저 저장소(IndexedDB)에 보관 — 등록 화면 → 전시 미리보기로 이어주는 데모용
   localStorage(약 5MB)에는 영상이 안 들어가서 따로 둠. 쓸 수 없는 환경(사생활 보호 모드 등)이면 조용히 실패하고 썸네일로만 보임 */
const blobDB = (() => {
  const open = () => new Promise((res, rej) => {
    try {
      const r = indexedDB.open('du.media', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('b');
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    } catch (e) { rej(e); }
  });
  const run = (mode, fn) => open().then((db) => new Promise((res, rej) => {
    const tx = db.transaction('b', mode), req = fn(tx.objectStore('b'));
    tx.oncomplete = () => { db.close(); res(req && req.result); }; tx.onerror = tx.onabort = () => { db.close(); rej(tx.error); };
  }));
  return {
    put: (key, blob) => run('readwrite', (s) => s.put(blob, key)).then(() => true, () => false),
    get: (key) => run('readonly', (s) => s.get(key)).then((v) => v || null, () => null),
    delPrefix: (prefix) => run('readwrite', (s) => { const r = s.openCursor(); r.onsuccess = () => { const c = r.result; if (c) { if (String(c.key).startsWith(prefix)) c.delete(); c.continue(); } }; return r; }).catch(() => {})
  };
})();
