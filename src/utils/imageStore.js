import { uniqueId } from './uniqueId';

const DB_NAME = 'TryonHistoryDB';
// Named rather than inline, so the version and the migration that goes with it are read
// together. Bumping this is what onversionchange and onblocked in getDB exist for.
const DB_VERSION = 4;
const STORE_NAME = 'history_images';
const RESULTS_STORE_NAME = 'tryon_results';
const MAX_IMAGES = 10;
export const EXPIRY_MS = 20 * 60 * 1000; // 20 minutes

export const EVENTS = {
  PHOTO_ADDED: 'PHOTO_ADDED',
  PHOTO_PROMOTED: 'PHOTO_PROMOTED',
  PHOTO_DEACTIVATED: 'PHOTO_DEACTIVATED',
  PHOTO_DELETED: 'PHOTO_DELETED',
  HISTORY_CLEARED: 'HISTORY_CLEARED'
};

// Local listeners for same-tab notifications only
// (Cross-tab syncing removed to prevent generation crashes in other tabs)
const localListeners = new Set();

export function subscribeToImageEvents(callback) {
  // Listen to same-tab events
  localListeners.add(callback);
  
  return () => {
    localListeners.delete(callback);
  };
}

function broadcast(type, payload = {}) {
  const message = { type, ...payload };
  // Notify listeners in THIS tab only
  localListeners.forEach(cb => cb(message));
}

/**
 * One connection for the whole page, not one per call.
 *
 * Every exported function here begins with getDB(), and this used to open a brand new
 * IDBDatabase each time and never close it. A page that polls the dock every ten seconds
 * accumulates them without limit.
 *
 * Leaked connections are not merely untidy: an open connection BLOCKS a version change.
 * Measured on the version this replaces -- after ~46 leaked connections, both an upgrade to
 * version 5 and deleteDatabase() hung indefinitely, and neither fired onblocked within
 * several seconds. There was no onblocked handler either, so the open simply never settled
 * and every caller waited forever. Reloading the page was the only way out.
 *
 * So: cache the promise, hand the same connection to everyone, and give up loudly instead of
 * hanging if something else is holding the database open.
 */
let dbPromise = null;

/** Long enough for another tab to finish what it is doing; short enough not to be a hang. */
const OPEN_TIMEOUT_MS = 5000;

function getDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    let settled = false;
    const finish = (fn, value) => { if (!settled) { settled = true; fn(value); } };

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // Another tab is holding an older version open. Without this the open never settles and
    // every caller waits forever; callers all catch and fall back to something safe, so
    // failing is far better than hanging.
    request.onblocked = () => {
      console.warn('[imageStore] database upgrade blocked by another tab');
    };

    const timer = setTimeout(() => {
      dbPromise = null;
      finish(reject, new Error('IndexedDB open timed out'));
    }, OPEN_TIMEOUT_MS);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      
      let resultsStore;
      if (!db.objectStoreNames.contains(RESULTS_STORE_NAME)) {
        resultsStore = db.createObjectStore(RESULTS_STORE_NAME, { keyPath: 'id' });
      } else {
        resultsStore = e.target.transaction.objectStore(RESULTS_STORE_NAME);
      }
      
      if (!resultsStore.indexNames.contains('activeSelfieId')) {
        resultsStore.createIndex('activeSelfieId', 'activeSelfieId', { unique: false });
      }
    };
    request.onsuccess = (e) => {
      clearTimeout(timer);
      const db = e.target.result;

      // If another tab wants to change the schema, get out of its way. Holding this open is
      // exactly what caused the hang above -- and the tab doing the upgrading is often the
      // one the person is actually looking at.
      db.onversionchange = () => { db.close(); dbPromise = null; };

      // Closed for any other reason (browser evicted it, storage cleared). Drop the cached
      // promise so the next call opens a fresh one rather than using a dead handle.
      db.onclose = () => { dbPromise = null; };

      finish(resolve, db);
    };

    request.onerror = () => {
      clearTimeout(timer);
      dbPromise = null; // let the next call try again rather than caching the failure forever

      // A VersionError means another tab running a NEWER build has already upgraded the
      // database past DB_VERSION, and this tab cannot open it -- that is IndexedDB working
      // as designed, not a fault. Every caller here catches and degrades to an empty result,
      // so the page stays up; it just cannot save photographs until it is reloaded. Named
      // explicitly because otherwise it presents as "nothing happens when I pick a photo".
      if (request.error?.name === 'VersionError') {
        console.warn(
          '[imageStore] the photo store was upgraded by a newer version of this app in ' +
          'another tab. Reload the page to use it again.'
        );
      }

      finish(reject, new Error('IndexedDB error'));
    };
  });

  return dbPromise;
}

// Internal helper to get all without modifying
async function getAllRecords() {
  const db = await getDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => resolve([]);
  });
}

export async function getAllHistory() {
  try {
    const records = await getAllRecords();
    const now = Date.now();
    const valid = [];
    let needsTx = false;

    for (const record of records) {
      if (now - record.lastUsedAt > EXPIRY_MS) {
        needsTx = true;
      } else {
        valid.push(record);
      }
    }
    
    if (needsTx) {
      const db = await getDB();
      const tx = db.transaction([STORE_NAME, RESULTS_STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const resultsStore = tx.objectStore(RESULTS_STORE_NAME);
      for (const record of records) {
        if (now - record.lastUsedAt > EXPIRY_MS) {
          store.delete(record.id);
          // Cascade delete associated results
          const req = resultsStore.getAll();
          req.onsuccess = () => {
            const allResults = req.result || [];
            allResults.forEach(res => {
              if (res.activeSelfieId === record.id) resultsStore.delete(res.id);
            });
          };
        }
      }
      await new Promise((resolve) => {
        tx.oncomplete = resolve;
        tx.onerror = resolve;
      });
    }
    
    // Return sorted by recency (newest first)
    return valid.sort((a, b) => b.lastUsedAt - a.lastUsedAt);
  } catch (e) {
    console.warn('getAllHistory error', e);
    return [];
  }
}

export async function getActiveImage() {
  try {
    const records = await getAllHistory();
    return records.find(r => r.isActive) || null;
  } catch (e) {
    return null;
  }
}

export async function saveToHistory(file) {
  try {
    const db = await getDB();
    await getAllHistory(); // purges anything past the expiry, in its own transaction

    const newRecord = {
      // Was Date.now().toString(), which two photographs picked in the same millisecond
      // shared -- and put() silently overwrote one with the other.
      id: uniqueId('img-'),
      file,
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
      isActive: true
    };

    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    // Read INSIDE the transaction, not before it.
    //
    // This used to work from a snapshot taken beforehand, which was invisible while ids
    // collided (concurrent saves overwrote each other down to a single row, so "one active"
    // was true by accident). With ids fixed, all of them survive -- and each one had
    // deactivated only the photo its own stale snapshot knew about, leaving every one of
    // them marked active. IndexedDB serialises readwrite transactions on a store, so reading
    // here sees the previous save's writes and the invariant actually holds.
    const existing = store.getAll();
    existing.onsuccess = () => {
      const records = existing.result || [];

      // Exactly one active photo, whatever else is going on.
      for (const record of records) {
        if (record.isActive) {
          record.isActive = false;
          store.put(record);
        }
      }

      // Trim oldest-first until there is room. The old version deleted a single row no
      // matter how far over the limit it was, so a history that got ahead never came back.
      if (records.length >= MAX_IMAGES) {
        const oldestFirst = [...records].sort((a, b) => a.lastUsedAt - b.lastUsedAt);
        oldestFirst.slice(0, records.length - MAX_IMAGES + 1)
          .forEach(record => store.delete(record.id));
      }

      // Written last, inside the same read, so it cannot be undone by the deactivation
      // sweep above or removed by the trim.
      store.put(newRecord);
    };

    return new Promise((resolve) => {
      tx.oncomplete = () => {
        broadcast(EVENTS.PHOTO_ADDED, { imageId: newRecord.id });
        resolve(newRecord);
      };
      tx.onerror = () => resolve(null);
    });
  } catch (e) {
    console.warn('saveToHistory error', e);
    return null;
  }
}

export async function promoteToActive(id) {
  try {
    const db = await getDB();

    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    let promotedRecord = null;

    // Read inside the transaction, for the same reason as saveToHistory: two promotions in
    // flight together each worked from a snapshot taken before either had written, so both
    // photos ended up active and "the active photo" became whichever the sort happened to
    // put first.
    const existing = store.getAll();
    existing.onsuccess = () => {
      for (const record of existing.result || []) {
        if (record.id === id) {
          record.isActive = true;
          record.lastUsedAt = Date.now();
          promotedRecord = record;
          store.put(record);
        } else if (record.isActive) {
          record.isActive = false;
          store.put(record);
        }
      }
    };

    return new Promise((resolve) => {
      tx.oncomplete = () => {
        // null when the id was not there -- the caller can tell "promoted" from "gone".
        if (promotedRecord) broadcast(EVENTS.PHOTO_PROMOTED, { imageId: id });
        resolve(promotedRecord);
      };
      tx.onerror = () => resolve(null);
    });
  } catch(e) {
    return null;
  }
}

export async function deactivateActiveImage() {
  try {
    const db = await getDB();
    const records = await getAllRecords();
    
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    let deactivatedId = null;
    for (const record of records) {
      if (record.isActive) {
        record.isActive = false;
        deactivatedId = record.id;
        store.put(record);
      }
    }
    
    return new Promise((resolve) => {
      tx.oncomplete = () => {
        if (deactivatedId) broadcast(EVENTS.PHOTO_DEACTIVATED, { imageId: deactivatedId });
        resolve(true);
      };
      tx.onerror = () => resolve(false);
    });
  } catch(e) {
    return false;
  }
}

export async function deleteHistoryImage(id) {
  try {
    const db = await getDB();
    const tx = db.transaction([STORE_NAME, RESULTS_STORE_NAME], 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    
    const resultsStore = tx.objectStore(RESULTS_STORE_NAME);
    const req = resultsStore.getAll();
    req.onsuccess = () => {
      const allResults = req.result || [];
      allResults.forEach(res => {
        if (res.activeSelfieId === id) resultsStore.delete(res.id);
      });
    };
    
    return new Promise((resolve) => {
      tx.oncomplete = () => {
        broadcast(EVENTS.PHOTO_DELETED, { imageId: id });
        resolve(true);
      };
      tx.onerror = () => resolve(false);
    });
  } catch(e) {
    return false;
  }
}

export async function clearAllHistory() {
  try {
    const db = await getDB();
    const tx = db.transaction([STORE_NAME, RESULTS_STORE_NAME], 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const resultsStore = tx.objectStore(RESULTS_STORE_NAME);
    store.clear();
    resultsStore.clear();
    
    return new Promise((resolve) => {
      tx.oncomplete = () => {
        broadcast(EVENTS.HISTORY_CLEARED);
        resolve(true);
      };
      tx.onerror = () => resolve(false);
    });
  } catch (e) {
    return false;
  }
}

// ==========================================
// TRY-ON RESULTS CAROUSEL STORAGE ENGINE
// ==========================================

export async function pingSelfieActivity(selfieId) {
  if (!selfieId) return;
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(selfieId);
    req.onsuccess = () => {
      const record = req.result;
      if (record) {
        record.lastUsedAt = Date.now();
        store.put(record);
      }
    };
  } catch (e) {
    console.warn('pingSelfieActivity error', e);
  }
}

export async function saveTryonResult({ activeSelfieId, garmentImageUrl, resultImageUrl }) {
  try {
    const db = await getDB();
    const tx = db.transaction(RESULTS_STORE_NAME, 'readwrite');
    const store = tx.objectStore(RESULTS_STORE_NAME);
    
    const newRecord = {
      // Same collision as saveToHistory: two results finishing together became one.
      id: uniqueId('res-'),
      activeSelfieId,
      garmentImageUrl,
      resultImageUrl,
      createdAt: Date.now()
    };
    
    store.put(newRecord);
    
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(newRecord);
      tx.onerror = () => resolve(null);
    });
  } catch (e) {
    console.warn('saveTryonResult error', e);
    return null;
  }
}

export async function updateTryonResult(id, updates) {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(RESULTS_STORE_NAME, 'readwrite');
      const store = tx.objectStore(RESULTS_STORE_NAME);
      const req = store.get(id);
      
      req.onsuccess = () => {
        const record = req.result;
        if (!record) return resolve(null);
        
        const updatedRecord = { ...record, ...updates };
        const putReq = store.put(updatedRecord);
        
        putReq.onsuccess = () => resolve(updatedRecord);
        putReq.onerror = () => resolve(null);
      };
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    console.warn('updateTryonResult error', e);
    return null;
  }
}

export async function getTryonResultsBySelfie(selfieId) {
  if (!selfieId) return [];
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(RESULTS_STORE_NAME, 'readonly');
      const store = tx.objectStore(RESULTS_STORE_NAME);
      const index = store.index('activeSelfieId');
      const req = index.getAll(selfieId);
      req.onsuccess = () => {
        const matching = req.result || [];
        // Sort newest first
        resolve(matching.sort((a, b) => b.createdAt - a.createdAt));
      };
      req.onerror = () => resolve([]);
    });
  } catch (e) {
    console.warn('getTryonResultsBySelfie error', e);
    return [];
  }
}

export async function deleteTryonResult(resultId) {
  try {
    const db = await getDB();
    const tx = db.transaction(RESULTS_STORE_NAME, 'readwrite');
    const store = tx.objectStore(RESULTS_STORE_NAME);
    store.delete(resultId);
    
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch(e) {
    return false;
  }
}
