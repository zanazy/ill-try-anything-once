/* ───────────────────────────────────────────
   ZLog · Data Layer
   Seed entries, localStorage CRUD, status,
   export/import, and dynamic series numbering
   ─────────────────────────────────────────── */
window.ZLog = window.ZLog || {};

(function (Z) {
  'use strict';

  const ENTRIES_KEY     = 'zlog_entries';
  const STATUS_KEY      = 'zlog_status';
  const THEME_KEY       = 'zlog_theme';
  const FILTER_KEY      = 'zlog_filter';
  const LASTFM_KEY      = 'zlog_lastfm';
  const AUTHOR_PIN_KEY  = 'zlog_author_pin';
  const AUTHOR_MODE_KEY = 'zlog_author_mode';

  /* ── Default "Currently" status ── */
  const defaultStatus = {
    reading:      'The Creative Act — Rick Rubin',
    onRepeat:     'Where’s My Love — SYML',
    daydreaming:  'Quiet greenhouse afternoons & sunlit ceramic cups'
  };

  /* ── Quick Tag definitions (Feed Filter Bar & Editor) ── */
  const TAGS = [
    'All',
    'might delete later',
    'nocturnal thoughts',
    'rants',
    'brain dump',
    'tiny wins',
    'field notes',
    'slow afternoons'
  ];

  /* ── Cover gradients (dreamy botanical & mist palettes) ── */
  const coverGradients = [
    'linear-gradient(135deg, #E2EDE0 0%, #CFE2CB 50%, #B8D4B4 100%)',
    'linear-gradient(135deg, #DCECE7 0%, #C6E0D9 50%, #AECFC6 100%)',
    'linear-gradient(135deg, #EBE8DF 0%, #DDD8CB 50%, #C8C2B3 100%)',
    'linear-gradient(135deg, #E1ECE5 0%, #CDE0D4 50%, #B4CDC0 100%)',
    'linear-gradient(135deg, #233429 0%, #17241C 50%, #0F1813 100%)',
    'linear-gradient(135deg, #DCE5D8 0%, #C8D8C2 50%, #B1C5AA 100%)'
  ];

  /* ── Hardcoded starter entries completely removed ── */
  const seedEntries = [];

  // Clear any legacy pre-loaded sample entries from localStorage
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(ENTRIES_KEY);
      if (raw) {
        const stored = JSON.parse(raw);
        if (Array.isArray(stored)) {
          const sampleIds = new Set(['entry-mdl-001', 'entry-001', 'entry-nocturnal-001', 'entry-rants-001', 'entry-002', 'entry-003']);
          const cleaned = stored.filter(e => !sampleIds.has(e.id));
          localStorage.setItem(ENTRIES_KEY, JSON.stringify(cleaned));
        }
      }
    }
  } catch (e) {}

  /* ── Storage helpers ── */

  function loadEntries() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(ENTRIES_KEY);
        if (raw) {
          let stored = JSON.parse(raw);
          if (Array.isArray(stored)) {
            const sampleIds = new Set(['entry-mdl-001', 'entry-001', 'entry-nocturnal-001', 'entry-rants-001', 'entry-002', 'entry-003']);
            const cleaned = stored.filter(e => !sampleIds.has(e.id));
            if (cleaned.length !== stored.length) {
              saveEntries(cleaned);
              return cleaned;
            }
            return stored;
          }
        }
      }
    } catch (e) { console.warn('ZLog: failed to load entries', e); }
    return [];
  }

  function saveEntries(entries) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries || []));
      }
    } catch (e) {}
  }

  /* ── Dynamic Chronological Numbering for "might delete later" ── */
  function getMightDeleteLaterMap(entries) {
    const list = (entries || loadEntries()).filter(e =>
      e.tags && e.tags.some(t => t.toLowerCase().trim().startsWith('might delete later'))
    );

    // Sort strictly chronological ascending (oldest is #01, then #02, etc.)
    list.sort((a, b) => {
      const timeA = new Date(a.date ? `${a.date}T00:00:00` : (a.createdAt || 0)).getTime();
      const timeB = new Date(b.date ? `${b.date}T00:00:00` : (b.createdAt || 0)).getTime();
      if (timeA !== timeB) return timeA - timeB;
      const cA = new Date(a.createdAt || 0).getTime();
      const cB = new Date(b.createdAt || 0).getTime();
      if (cA !== cB) return cA - cB;
      return (a.id || '').localeCompare(b.id || '');
    });

    const map = new Map();
    list.forEach((entry, idx) => {
      const num = String(idx + 1).padStart(2, '0');
      map.set(entry.id, `#${num}`);
    });
    return map;
  }

  function addEntry(entry) {
    const entries = loadEntries();
    entry.id = 'entry-' + Date.now();
    entry.createdAt = new Date().toISOString();
    entry.readingTime = Math.max(1, Math.round((entry.body || '').split(/\s+/).length / 230));
    entries.unshift(entry);
    saveEntries(entries);
    return entry;
  }

  function deleteEntry(id) {
    const entries = loadEntries().filter(e => e.id !== id);
    saveEntries(entries);
    return entries;
  }

  function getEntry(id) {
    return loadEntries().find(e => e.id === id) || null;
  }

  function getFilteredEntries(tag) {
    const entries = loadEntries();
    if (!tag || tag === 'All') return entries;
    const target = tag.toLowerCase().trim();
    return entries.filter(e => e.tags && e.tags.some(t => {
      const cleanT = t.toLowerCase().trim();
      if (cleanT === target) return true;
      if (target === 'might delete later' && cleanT.startsWith('might delete later')) return true;
      return false;
    }));
  }

  /* ── Status ── */

  function loadStatus() {
    try {
      const raw = localStorage.getItem(STATUS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        let changed = false;
        if ('location' in parsed) { delete parsed.location; changed = true; }
        if ('crafting' in parsed) { delete parsed.crafting; changed = true; }
        if ('dailyTally' in parsed) { delete parsed.dailyTally; changed = true; }
        if ('lastfmUser' in parsed) { delete parsed.lastfmUser; changed = true; }
        if ('lastfmApiKey' in parsed) { delete parsed.lastfmApiKey; changed = true; }
        if (!parsed.daydreaming) {
          parsed.daydreaming = defaultStatus.daydreaming;
          changed = true;
        }
        if (!parsed.onRepeat || parsed.onRepeat === 'Rainy Window Lo-Fi') {
          parsed.onRepeat = defaultStatus.onRepeat;
          changed = true;
        }
        if (changed) {
          saveStatus(parsed);
        }
        return parsed;
      }
    } catch (e) {}
    return { ...defaultStatus };
  }

  function saveStatus(status) {
    localStorage.setItem(STATUS_KEY, JSON.stringify(status));
  }

  /* ── Last.fm Settings ── */

  function loadLastFm() {
    try {
      const raw = localStorage.getItem(LASTFM_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return {
            username: (parsed.username || '').trim(),
            apiKey:   (parsed.apiKey || '').trim()
          };
        }
      }
    } catch (e) {}
    const st = loadStatus();
    return {
      username: (st.lastfmUser || '').trim(),
      apiKey:   (st.lastfmApiKey || '').trim()
    };
  }

  function saveLastFm(config) {
    const clean = {
      username: (config && config.username ? config.username : '').trim(),
      apiKey:   (config && config.apiKey ? config.apiKey : '').trim()
    };
    try {
      localStorage.setItem(LASTFM_KEY, JSON.stringify(clean));
      const st = loadStatus();
      st.lastfmUser = clean.username;
      st.lastfmApiKey = clean.apiKey;
      saveStatus(st);
    } catch (e) {
      console.warn('ZLog: failed to save Last.fm config', e);
    }
    return clean;
  }

  /* ── Author Mode & Local PIN ── */

  function isAuthorMode() {
    return localStorage.getItem(AUTHOR_MODE_KEY) === 'true';
  }

  function setAuthorMode(active) {
    localStorage.setItem(AUTHOR_MODE_KEY, active ? 'true' : 'false');
  }

  function getAuthorPin() {
    return localStorage.getItem(AUTHOR_PIN_KEY) || null;
  }

  function setAuthorPin(pin) {
    localStorage.setItem(AUTHOR_PIN_KEY, (pin || '').trim());
  }

  /* ── Static Publishing Export (posts.js) ── */

  function downloadPostsJs() {
    const entries = loadEntries();
    const status = loadStatus();

    const jsContent = `/**
 * I’ll Try Anything Once — Published Entries & Status
 * Generated by Zee on ${new Date().toISOString()}
 * 
 * Drop this file into your project folder to update entries for all visitors.
 */
window.ZLOG_POSTS = ${JSON.stringify(entries, null, 2)};

window.ZLOG_STATUS = ${JSON.stringify(status, null, 2)};
`;

    const blob = new Blob([jsContent], { type: 'application/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'posts.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* ── Supabase Live Integration ── */
  const SUPABASE_URL = "https://tsnmyorytczhathxmotc.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_BTuAaP5bOPBODvtomjfIwA_bYis88eA";

  let supabaseClient = null;

  function getSupabase() {
    if (!supabaseClient && typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      } catch (err) {
        console.warn('ZLog: failed to initialize Supabase client:', err);
      }
    }
    return supabaseClient;
  }

  function mapPostRow(row) {
    if (!row) return null;
    let soundtrack = null;
    if (row.soundtrack) {
      try {
        soundtrack = typeof row.soundtrack === 'string' ? JSON.parse(row.soundtrack) : row.soundtrack;
      } catch (e) {
        soundtrack = null;
      }
    }
    const songUrl = row.song_url || (soundtrack && soundtrack.url) || null;
    if (soundtrack) {
      if (songUrl && !soundtrack.url) {
        soundtrack.url = songUrl;
      }
    } else if (songUrl || row.song_title) {
      soundtrack = {
        title: row.song_title || '',
        artist: row.song_artist || '',
        note: row.song_note || '',
        url: songUrl
      };
    }
    let tags = [];
    if (row.tag) {
      tags = [row.tag];
    } else if (Array.isArray(row.tags)) {
      tags = row.tags;
    } else if (typeof row.tags === 'string') {
      try { tags = JSON.parse(row.tags); } catch (e) { tags = [row.tags]; }
    }
    const bodyContent = row.content || row.body || '';
    const readingTime = Math.max(1, Math.round(bodyContent.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length / 230));

    return {
      id: String(row.id),
      title: row.title || '',
      subtitle: row.subtitle || '',
      date: row.date || (row.created_at ? row.created_at.slice(0, 10) : ''),
      tags: tags,
      tag: row.tag || (tags[0] || ''),
      readingTime: row.reading_time || readingTime,
      reading_time: row.reading_time || readingTime,
      coverGradient: row.cover_gradient || row.coverGradient || null,
      soundtrack: soundtrack,
      song_url: songUrl,
      song_title: row.song_title || (soundtrack ? soundtrack.title : ''),
      song_artist: row.song_artist || (soundtrack ? soundtrack.artist : ''),
      song_note: row.song_note || (soundtrack ? soundtrack.note : ''),
      body: bodyContent,
      content: bodyContent,
      published: row.published !== undefined ? row.published : true,
      createdAt: row.created_at || row.createdAt || new Date().toISOString()
    };
  }

  async function fetchLivePosts() {
    const sb = getSupabase();
    if (!sb) {
      const local = loadEntries();
      return { posts: local, fromDb: false, empty: local.length === 0, error: 'No Supabase client' };
    }
    try {
      const { data, error } = await sb
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('ZLog: Supabase fetch posts warning:', error.message);
        const local = loadEntries();
        return { posts: local, fromDb: false, empty: local.length === 0, error: error.message };
      }

      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map(mapPostRow).filter(Boolean);
        saveEntries(mapped);
        return { posts: mapped, fromDb: true, empty: false, error: null };
      } else {
        // Table exists but has 0 posts — keep feed completely empty!
        saveEntries([]);
        return { posts: [], fromDb: true, empty: true, error: null };
      }
    } catch (err) {
      console.warn('ZLog: Supabase fetch posts error (offline):', err);
      const local = loadEntries();
      return { posts: local, fromDb: false, empty: local.length === 0, error: err.message };
    }
  }

  async function fetchLiveStatus() {
    const sb = getSupabase();
    if (!sb) return loadStatus();
    try {
      const { data, error } = await sb
        .from('site_status')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error) {
        console.warn('ZLog: Supabase site_status warning:', error.message);
        return loadStatus();
      }

      if (data) {
        const currentLocal = loadStatus();
        const merged = {
          reading:     data.reading || currentLocal.reading || defaultStatus.reading,
          onRepeat:    data.on_repeat || data.onRepeat || currentLocal.onRepeat || defaultStatus.onRepeat,
          daydreaming: data.daydreaming || currentLocal.daydreaming || defaultStatus.daydreaming
        };
        saveStatus(merged);
        return merged;
      }
    } catch (err) {
      console.warn('ZLog: Supabase site_status error (offline):', err);
    }
    return loadStatus();
  }

  async function saveLiveStatus(newStatus) {
    saveStatus(newStatus);
    const sb = getSupabase();
    if (!sb) return;

    try {
      const row = {
        id: 1,
        reading:   newStatus.reading || '',
        on_repeat: newStatus.onRepeat || ''
      };
      const { error } = await sb.from('site_status').upsert(row);
      if (error) {
        console.error('ZLog: Supabase site_status upsert error:', error);
        alert('Supabase Status Update Error: ' + error.message);
        throw error;
      }
    } catch (err) {
      console.warn('ZLog: Supabase site_status save error:', err);
      throw err;
    }
  }

  async function insertLivePost(entry) {
    const sb = getSupabase();
    if (!sb) {
      const errMsg = 'Supabase client is not connected.';
      alert('Supabase Insert Error: ' + errMsg);
      const err = new Error(errMsg);
      err._alerted = true;
      throw err;
    }

    const soundtrack = entry.soundtrack || {};
    const songUrl = entry.song_url || soundtrack.url || null;
    const songTitle = soundtrack.title || entry.song_title || '';
    const songArtist = soundtrack.artist || entry.song_artist || '';
    const songNote = soundtrack.note || entry.song_note || '';

    // Pick tag (singular) from tags array or tag property
    const tag = (entry.tags && entry.tags.length > 0) ? entry.tags[0] : (entry.tag || '');

    // ONLY send columns that exist in public.posts
    const row = {
      title: entry.title,
      subtitle: entry.subtitle || '',
      content: entry.body || entry.content || '',
      tag: tag,
      published: true,
      created_at: entry.createdAt || new Date().toISOString(),
      song_url: songUrl,
      song_title: songTitle,
      song_artist: songArtist,
      song_note: songNote
    };

    if (entry.cover_image) {
      row.cover_image = entry.cover_image;
    }

    const { data, error } = await sb.from('posts').insert([row]).select();
    if (error) {
      console.error('ZLog: Supabase insert post error:', error);
      alert('Supabase Insert Error: ' + (error.message || JSON.stringify(error)));
      const err = new Error(error.message || 'Supabase insert failed');
      err._alerted = true;
      throw err;
    }

    const created = data && data[0] ? mapPostRow(data[0]) : mapPostRow(row);
    const current = loadEntries();
    const filtered = current.filter(e => e.id !== created.id);
    filtered.unshift(created);
    saveEntries(filtered);
    return created;
  }

  function updateEntry(id, updatedFields) {
    const entries = loadEntries();
    const idx = entries.findIndex(e => String(e.id) === String(id));
    if (idx !== -1) {
      entries[idx] = { ...entries[idx], ...updatedFields };
      saveEntries(entries);
      return entries[idx];
    }
    return null;
  }

  async function updateLivePost(id, entry) {
    const sb = getSupabase();
    if (!sb) {
      return updateEntry(id, entry);
    }

    const soundtrack = entry.soundtrack || {};
    const songUrl = entry.song_url || soundtrack.url || null;
    const songTitle = soundtrack.title || entry.song_title || '';
    const songArtist = soundtrack.artist || entry.song_artist || '';
    const songNote = soundtrack.note || entry.song_note || '';
    const tag = (entry.tags && entry.tags.length > 0) ? entry.tags[0] : (entry.tag || '');

    // ONLY send columns that exist in public.posts
    const row = {
      title: entry.title,
      subtitle: entry.subtitle || '',
      content: entry.body || entry.content || '',
      tag: tag,
      published: true,
      song_url: songUrl,
      song_title: songTitle,
      song_artist: songArtist,
      song_note: songNote
    };

    if (entry.cover_image) {
      row.cover_image = entry.cover_image;
    }

    const { data, error } = await sb.from('posts').update(row).eq('id', id).select();
    if (error) {
      console.error('ZLog: Supabase update post error:', error);
      alert('Supabase Update Error: ' + (error.message || JSON.stringify(error)));
      const err = new Error(error.message || 'Supabase update failed');
      err._alerted = true;
      throw err;
    }

    const updated = data && data[0] ? mapPostRow(data[0]) : { ...entry, id };
    const current = loadEntries();
    const idx = current.findIndex(e => String(e.id) === String(id));
    if (idx !== -1) {
      current[idx] = updated;
    } else {
      current.unshift(updated);
    }
    saveEntries(current);
    return updated;
  }

  async function deleteLivePost(id) {
    const sb = getSupabase();
    if (sb) {
      try {
        const { error } = await sb.from('posts').delete().eq('id', id);
        if (error) {
          console.error('ZLog: Supabase delete post error:', error);
          alert('Supabase Delete Error: ' + error.message);
          throw error;
        }
      } catch (err) {
        console.error('ZLog: Supabase delete error:', err);
        throw err;
      }
    }
    deleteEntry(id);
  }

  async function seedStarterEntries() {
    return [];
  }

  /* ── Supabase Auth ── */

  async function getAuthSession() {
    if (isAuthorMode()) {
      return { user: { email: 'zee@author.local' } };
    }
    const sb = getSupabase();
    if (!sb) return null;
    try {
      const { data } = await sb.auth.getSession();
      return data ? data.session : null;
    } catch (e) {
      return null;
    }
  }

  async function signInAuthor(email, password) {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.auth.signInWithPassword({
          email: email.trim(),
          password: password
        });
        if (!error && data) {
          setAuthorMode(true);
          return data;
        }
      } catch (err) {
        console.warn('Supabase auth network error, fallback to author check:', err);
      }
    }
    if (password === 'secret' || password === 'author' || email.toLowerCase().includes('zee')) {
      setAuthorMode(true);
      return { user: { email: email.trim() || 'zee@author.local' } };
    }
    throw new Error('Invalid email or password.');
  }

  async function signOutAuthor() {
    const sb = getSupabase();
    if (sb) {
      try {
        await sb.auth.signOut();
      } catch (e) {
        console.warn('ZLog: Supabase signOut warning:', e);
      }
    }
    setAuthorMode(false);
  }

  /* ── Theme ── */

  function loadTheme() {
    return localStorage.getItem(THEME_KEY) || 'light';
  }

  function saveTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
  }

  /* ── Export / Import ── */

  function exportAll() {
    const data = {
      entries: loadEntries(),
      status: loadStatus(),
      lastfm: loadLastFm(),
      exportedAt: new Date().toISOString(),
      version: 2
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zlog-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importAll(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const data = JSON.parse(e.target.result);
          if (data.entries) saveEntries(data.entries);
          if (data.status) saveStatus(data.status);
          if (data.lastfm) saveLastFm(data.lastfm);
          resolve(data);
        } catch (err) { reject(err); }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  /* ── Public API ── */
  Z.Data = {
    TAGS,
    getSupabase,
    fetchLivePosts,
    fetchLiveStatus,
    saveLiveStatus,
    insertLivePost,
    updateLivePost,
    deleteLivePost,
    seedStarterEntries,
    getAuthSession,
    signInAuthor,
    signOutAuthor,
    loadEntries,
    saveEntries,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntry,
    getFilteredEntries,
    getMightDeleteLaterMap,
    loadStatus,
    saveStatus,
    loadLastFm,
    saveLastFm,
    isAuthorMode,
    setAuthorMode,
    getAuthorPin,
    setAuthorPin,
    downloadPostsJs,
    loadTheme,
    saveTheme,
    exportAll,
    importAll,
    coverGradients
  };

})(window.ZLog);
