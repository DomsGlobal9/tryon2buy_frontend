const DB_NAME = 'TryonHistoryDB';
const STORE_NAME = 'history_images';
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

function getDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2); // bumped version to purge old schema
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = () => reject('IndexedDB error');
  });
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
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      for (const record of records) {
        if (now - record.lastUsedAt > EXPIRY_MS) {
          store.delete(record.id);
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
    const records = await getAllHistory(); // automatically deletes expired ones
    
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    // Make any existing active image inactive
    const active = records.find(r => r.isActive);
    if (active) {
      active.isActive = false;
      store.put(active);
    }
    
    // Capacity check
    if (records.length >= MAX_IMAGES) {
      // Sort by lastUsedAt ascending (oldest first)
      const sorted = [...records].sort((a, b) => a.lastUsedAt - b.lastUsedAt);
      const toDelete = sorted[0];
      if (toDelete) {
        store.delete(toDelete.id);
      }
    }
    
    const newRecord = {
      id: Date.now().toString(),
      file,
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
      isActive: true
    };
    
    store.put(newRecord);
    
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
    const records = await getAllRecords();
    
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    let promotedRecord = null;
    
    for (const record of records) {
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
    
    return new Promise((resolve) => {
      tx.oncomplete = () => {
        broadcast(EVENTS.PHOTO_PROMOTED, { imageId: id });
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
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    
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
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    
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
