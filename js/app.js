/* ───────────────────────────────────────────
   ZLog · Main Application
   Rendering, events, routing, editor,
   player, theme management, and quick tags
   ─────────────────────────────────────────── */
window.ZLog = window.ZLog || {};

(function (Z) {
  'use strict';

  const { Data, Synth } = Z;

  /* ═══════════════════════════════════════
     MINIMAL 1.5PX STROKE SVG ICONS (currentColor)
     ═══════════════════════════════════════ */
  const ICONS = {
    star: `<svg class="icon-star" width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0L9.8 6.2L16 8L9.8 9.8L8 16L6.2 9.8L0 8L6.2 6.2L8 0Z"/></svg>`,
    play: `<svg class="icon-play" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="6 4 20 12 6 20 6 4"/></svg>`,
    pause: `<svg class="icon-pause" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`,
    cassette: `<svg class="icon-cassette" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><circle cx="8" cy="12" r="2.5"/><circle cx="16" cy="12" r="2.5"/><path d="M10.5 12h3"/><path d="M6 18h12"/></svg>`,
    waveform: `<svg class="icon-waveform" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10v4M7 6v12M11 3v18M15 7v10M19 5v14M23 10v4"/></svg>`,
    pin: `<svg class="icon-pin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    book: `<svg class="icon-book" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
    disc: `<svg class="icon-disc" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/></svg>`,
    yarn: `<svg class="icon-yarn" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3h10M7 21h10"/><path d="M9 3v18M15 3v18"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="15" y2="16"/></svg>`,
    sun: `<svg class="icon-sun" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
    moon: `<svg class="icon-moon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
    close: `<svg class="icon-close" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    externalLink: `<svg class="icon-external" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`
  };

  /* ── State ── */
  let activeFilter = 'All';
  let currentTrack = null;   // { title, artist, type, preset, url }
  let readerOpen = false;
  let editorOpen = false;
  let latestLiveTrack = null; // { title, artist, nowPlaying, url }
  let lastfmTimer = null;

  /* ── DOM Cache ── */
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  const dom = {};

  function cacheDom() {
    dom.filterBar     = $('#index-nav') || $('#filter-bar');
    dom.feedColumn    = $('#feed-column');
    dom.sidebarColumn = $('#sidebar-column');
    dom.currentlyItems= $('#currently-items');
    dom.readerOverlay = $('#reader-overlay');
    dom.readerContent = $('#reader-content');
    dom.readerClose   = $('#reader-close');
    dom.editorOverlay = $('#editor-overlay');
    dom.editorForm    = $('#editor-form');
    dom.editorClose   = $('#editor-close');
    dom.editorCancel  = $('#editor-cancel');
    dom.writeBtn      = $('#write-btn');
    dom.logoLink      = $('#logo-link');
    dom.themeToggle   = $('#theme-toggle');
    dom.themeIcon     = $('#theme-icon');
    dom.statusModal   = $('#status-modal');
    dom.editStatusBtn = $('#edit-status-btn');
    dom.smLastfmUser  = $('#sm-lastfm-user');
    dom.smLastfmKey   = $('#sm-lastfm-key');
    dom.smLastfmTest  = $('#sm-lastfm-test');
    dom.smLastfmStatus= $('#sm-lastfm-status');
    dom.miniPlayer    = $('#mini-player');
    dom.miniVinyl     = $('#mini-vinyl');
    dom.miniTitle     = $('#mini-title');
    dom.miniArtist    = $('#mini-artist');
    dom.miniPlayBtn   = $('#mini-play-btn');
    dom.miniCloseBtn  = $('#mini-close-btn');
    dom.miniVolume    = $('#mini-volume');
    dom.exportBtn     = $('#export-btn');
    dom.importInput   = $('#import-input');
    dom.progressBar   = $('#reading-progress');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ═══════════════════════════════════════
     THEME
     ═══════════════════════════════════════ */

  function initTheme() {
    // Force Light Mode as the default theme on load
    applyTheme('light');
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (dom.themeIcon) {
      dom.themeIcon.innerHTML = theme === 'dark' ? ICONS.sun : ICONS.moon;
    }
    Data.saveTheme(theme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  /* ═══════════════════════════════════════
     AUTHOR MODE & SUPABASE AUTH
     ═══════════════════════════════════════ */

  let currentAuthSession = null;

  async function initAuthorAuth() {
    currentAuthSession = await Data.getAuthSession();
    updateAuthorState(currentAuthSession);

    const sb = Data.getSupabase();
    if (sb) {
      sb.auth.onAuthStateChange((event, session) => {
        currentAuthSession = session;
        updateAuthorState(session);
      });
    }
  }

  function updateAuthorState(session) {
    const isAuthed = Boolean(session && session.user);
    if (isAuthed) {
      document.body.classList.add('author-mode');
      const emailEl = $('#author-session-email');
      if (emailEl) emailEl.textContent = session.user.email;
    } else {
      document.body.classList.remove('author-mode');
    }
    // Update seed button visibility if needed
    const seedContainer = $('#seed-db-container');
    if (seedContainer && seedContainer.dataset.empty === 'true') {
      seedContainer.style.display = isAuthed ? 'block' : 'none';
    }
  }

  function showToast(msg) {
    const toast = $('#toast-notice');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('visible');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('visible');
    }, 3200);
  }

  function openAuthorModal() {
    const modal = $('#author-modal');
    if (!modal) return;

    const isAuthed = Boolean(currentAuthSession && currentAuthSession.user);
    const loginForm = $('#author-login-form');
    const sessionPanel = $('#author-session-panel');
    const errorEl = $('#author-login-error');
    const emailInput = $('#author-email-input');
    const passInput = $('#author-password-input');

    if (errorEl) errorEl.textContent = '';

    if (isAuthed) {
      if (loginForm) loginForm.style.display = 'none';
      if (sessionPanel) sessionPanel.style.display = 'block';
      const emailEl = $('#author-session-email');
      if (emailEl) emailEl.textContent = currentAuthSession.user.email;
    } else {
      if (loginForm) loginForm.style.display = 'block';
      if (sessionPanel) sessionPanel.style.display = 'none';
      if (passInput) passInput.value = '';
    }

    modal.classList.add('open');
    if (!isAuthed && emailInput) {
      setTimeout(() => emailInput.focus(), 250);
    }
  }

  function closeAuthorModal() {
    const modal = $('#author-modal');
    if (modal) modal.classList.remove('open');
  }

  async function handleAuthorLoginSubmit(e) {
    e.preventDefault();
    const email = ($('#author-email-input') ? $('#author-email-input').value : '').trim();
    const password = $('#author-password-input') ? $('#author-password-input').value : '';
    const errorEl = $('#author-login-error');
    const submitBtn = $('#author-modal-submit');

    if (!email || !password) {
      if (errorEl) errorEl.textContent = 'Please enter both email and password.';
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Signing In…';
    }
    if (errorEl) errorEl.textContent = '';

    try {
      await Data.signInAuthor(email, password);
      closeAuthorModal();
      showToast('Signed in as Author.');
      await syncAndRenderPosts();
      await syncLiveStatus();
    } catch (err) {
      console.warn('Login failed:', err);
      if (errorEl) {
        errorEl.textContent = err.message || 'Invalid email or password.';
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
      }
    }
  }

  async function handleAuthorSignOut() {
    await Data.signOutAuthor();
    currentAuthSession = null;
    updateAuthorState(null);
    closeAuthorModal();
    showToast('Signed out. Public view active.');
    await syncAndRenderPosts();
  }

  async function syncAndRenderPosts() {
    const res = await Data.fetchLivePosts();
    const seedContainer = $('#seed-db-container');
    if (seedContainer) {
      seedContainer.dataset.empty = res.empty ? 'true' : 'false';
      const isAuthed = Boolean(currentAuthSession && currentAuthSession.user);
      seedContainer.style.display = (res.empty && isAuthed) ? 'block' : 'none';
    }
    renderFeed();
  }

  async function syncLiveStatus() {
    await Data.fetchLiveStatus();
    renderCurrently();
    fetchLastFmNowPlaying();
  }

  async function handleSeedDatabase() {
    const seedBtn = $('#seed-database-btn');
    if (seedBtn) {
      seedBtn.disabled = true;
      seedBtn.textContent = 'Seeding starter entries…';
    }
    try {
      await Data.seedStarterEntries();
      showToast('Starter entries seeded to Supabase!');
      await syncAndRenderPosts();
    } catch (err) {
      console.error('Seed error:', err);
      showToast('Error seeding entries: ' + (err.message || 'Check database permissions'));
    } finally {
      if (seedBtn) {
        seedBtn.disabled = false;
        seedBtn.textContent = 'Seed starter entries to database';
      }
    }
  }

  /* ═══════════════════════════════════════
     QUICK TAGS & EDITORIAL BADGES
     ═══════════════════════════════════════ */

  function formatTagBadge(tag, entryId, mdlMap) {
    const clean = tag.toLowerCase().trim();
    let label = tag;
    let modifierClass = 'entry-tag--default';

    if (clean.startsWith('might delete later')) {
      const numStr = mdlMap && entryId ? (mdlMap.get(entryId) || '#01') : '#01';
      label = `might delete later ${numStr}`;
      modifierClass = 'entry-tag--mdl';
    } else if (clean === 'nocturnal thoughts') {
      label = 'nocturnal thoughts';
      modifierClass = 'entry-tag--nocturnal';
    } else if (clean === 'rants') {
      label = 'rants';
      modifierClass = 'entry-tag--rants';
    } else if (clean === 'brain dump') {
      label = 'brain dump';
      modifierClass = 'entry-tag--braindump';
    } else if (clean === 'tiny wins') {
      label = 'tiny wins';
      modifierClass = 'entry-tag--tinywins';
    } else if (clean === 'field notes') {
      label = 'field notes';
      modifierClass = 'entry-tag--fieldnotes';
    } else if (clean === 'slow afternoons') {
      label = 'slow afternoons';
      modifierClass = 'entry-tag--slowafternoons';
    }

    return `<span class="entry-tag ${modifierClass}" data-filter-tag="${clean}">${label}</span>`;
  }

  /* ═══════════════════════════════════════
     FILTERS (Vertical Editorial Sidebar Index)
     ═══════════════════════════════════════ */

  function renderFilters() {
    if (!dom.filterBar) return;
    const allEntries = Data.loadEntries();
    dom.filterBar.innerHTML = Data.TAGS.map((tag) => {
      const count = tag.toLowerCase() === 'all'
        ? allEntries.length
        : Data.getFilteredEntries(tag).length;
      const countPadded = String(count).padStart(2, '0');
      const isActive = tag.toLowerCase() === activeFilter.toLowerCase();
      const label = tag.toLowerCase();
      return `
        <button class="index-nav-item${isActive ? ' active' : ''}" data-tag="${tag}">
          <span class="index-item-left">
            <span class="index-indicator" aria-hidden="true">—</span>
            <span class="index-label">${label}</span>
          </span>
          <span class="index-count">${countPadded}</span>
        </button>
      `;
    }).join('');
  }

  function handleFilterClick(e) {
    const item = e.target.closest('.index-nav-item, .filter-nav-btn, .filter-pill');
    if (!item) return;
    activeFilter = item.dataset.tag;
    renderFilters();
    renderFeed();
  }

  /* ═══════════════════════════════════════
     FEED
     ═══════════════════════════════════════ */

  function formatDate(dateStr) {
    if (!dateStr) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [y, m, d] = dateStr.split('-').map(Number);
      return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    const d = new Date(dateStr);
    return isNaN(d) ? dateStr : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function renderEntryCard(entry, mdlMap) {
    const coverHtml = entry.coverGradient
      ? `<div class="entry-cover"><div class="entry-cover-inner" style="background:${entry.coverGradient};"></div></div>`
      : '';

    const isPlaying = isTrackPlaying(entry.soundtrack);
    const songPillIcon = isPlaying ? ICONS.waveform : ICONS.cassette;
    const songPillHtml = entry.soundtrack
      ? `<div class="song-pill${isPlaying ? ' playing' : ''}"
              data-track='${JSON.stringify(entry.soundtrack).replace(/'/g, '&#39;')}'>
           <span class="pill-icon">${songPillIcon}</span>
           <span>${entry.soundtrack.title} — ${entry.soundtrack.artist}</span>
         </div>`
      : '';

    const tagsMetaHtml = (entry.tags || []).map(t =>
      `<span class="dot"></span>` + formatTagBadge(t, entry.id, mdlMap)
    ).join('');

    return `
      <article class="entry-card" data-entry-id="${entry.id}">
        <div class="entry-meta">
          <span>${formatDate(entry.date || entry.createdAt)}</span>
          <span class="dot"></span>
          <span>${entry.readingTime || '?'} min read</span>
          ${tagsMetaHtml}
        </div>
        ${coverHtml}
        <h2>${entry.title}</h2>
        ${entry.subtitle ? `<p class="entry-subtitle">${entry.subtitle}</p>` : ''}
        ${songPillHtml}
      </article>
    `;
  }

  function renderFeed() {
    renderFilters();
    const allEntries = Data.loadEntries();
    const mdlMap = Data.getMightDeleteLaterMap(allEntries);
    const entries = Data.getFilteredEntries(activeFilter);

    if (entries.length === 0) {
      dom.feedColumn.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            <path d="M8 7h8M8 11h6"/>
          </svg>
          <h3>No entries found</h3>
          <p>No journal entries tagged with "${activeFilter}". Click "Write Entry" to add one.</p>
        </div>
      `;
      return;
    }

    dom.feedColumn.innerHTML = entries.map(entry => renderEntryCard(entry, mdlMap)).join('');
  }

  function handleFeedClick(e) {
    // Song pill click
    const pill = e.target.closest('.song-pill');
    if (pill) {
      e.stopPropagation();
      const track = JSON.parse(pill.dataset.track);
      toggleTrack(track);
      return;
    }

    // Direct tag badge click from feed -> trigger filter
    const tagBadge = e.target.closest('.entry-tag');
    if (tagBadge && tagBadge.dataset.filterTag) {
      e.stopPropagation();
      const filterKey = tagBadge.dataset.filterTag;
      // Match against Data.TAGS
      const matched = Data.TAGS.find(t => t.toLowerCase() === filterKey || (filterKey.startsWith('might delete later') && t === 'might delete later'));
      if (matched) {
        activeFilter = matched;
        renderFilters();
        renderFeed();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    // Entry card click
    const card = e.target.closest('.entry-card');
    if (card) {
      const id = card.dataset.entryId;
      openReader(id);
    }
  }

  /* ═══════════════════════════════════════
     CURRENTLY WIDGET & LIVE MUSIC (LAST.FM)
     ═══════════════════════════════════════ */

  function extractLastFmTrack(data) {
    if (!data || !data.recenttracks || !data.recenttracks.track) return null;
    const rawTracks = data.recenttracks.track;
    const t = Array.isArray(rawTracks) ? rawTracks[0] : rawTracks;
    if (!t) return null;

    const artistName = (t.artist && (t.artist['#text'] || t.artist.name)) ||
                       (typeof t.artist === 'string' ? t.artist : 'Unknown Artist');
    const trackName = t.name || 'Unknown Track';
    const isNowPlaying = Boolean(t['@attr'] && String(t['@attr'].nowplaying).toLowerCase() === 'true');
    const trackUrl = t.url || null;

    return {
      title: trackName,
      artist: artistName,
      nowPlaying: isNowPlaying,
      url: trackUrl
    };
  }

  async function fetchLastFmNowPlaying() {
    const cfg = Data.loadLastFm();
    if (!cfg || !cfg.username || !cfg.apiKey) {
      latestLiveTrack = null;
      renderCurrently();
      return null;
    }

    try {
      const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(cfg.username)}&api_key=${encodeURIComponent(cfg.apiKey)}&format=json&limit=1`;
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) {
        console.warn('Last.fm HTTP status:', res.status);
        latestLiveTrack = null;
        renderCurrently();
        return null;
      }
      const data = await res.json();
      if (data.error) {
        console.warn('Last.fm API error:', data.message);
        latestLiveTrack = null;
        renderCurrently();
        return null;
      }

      const track = extractLastFmTrack(data);
      latestLiveTrack = track;
      renderCurrently();
      return track;
    } catch (err) {
      console.warn('Last.fm fetch error (network or offline):', err);
      latestLiveTrack = null;
      renderCurrently();
      return null;
    }
  }

  function setupLastFmPolling() {
    if (lastfmTimer) clearInterval(lastfmTimer);
    fetchLastFmNowPlaying();
    lastfmTimer = setInterval(fetchLastFmNowPlaying, 30000);
  }

  function renderCurrently() {
    const status = Data.loadStatus();

    // Determine On Repeat / Now Playing / Last Played state
    let musicLabelHtml = `${ICONS.disc} on repeat`;
    let musicTitle = 'Where’s My Love';
    let musicArtist = 'SYML';
    let musicDisplay = 'Where’s My Love — SYML';
    let musicUrl = null;
    let isExternalUrl = false;

    if (latestLiveTrack) {
      musicTitle = latestLiveTrack.title;
      musicArtist = latestLiveTrack.artist;
      musicDisplay = `${latestLiveTrack.title} — ${latestLiveTrack.artist}`;
      musicUrl = latestLiveTrack.url || null;

      if (latestLiveTrack.nowPlaying) {
        musicLabelHtml = `${ICONS.waveform} now playing <span class="pulse-dot" title="Live scrobble from Last.fm"></span>`;
      } else {
        musicLabelHtml = `${ICONS.disc} last played`;
      }
    } else {
      // Fallback to manual entry from status
      const rawRepeat = status.onRepeat || 'Where’s My Love — SYML';
      musicDisplay = rawRepeat;

      // Check if rawRepeat is a URL (e.g. YouTube Music URL)
      if (/^https?:\/\//i.test(rawRepeat.trim())) {
        isExternalUrl = true;
        musicUrl = rawRepeat.trim();
        if (rawRepeat.includes('music.youtube.com') || rawRepeat.includes('youtube.com')) {
          musicDisplay = 'YouTube Music Track';
        } else {
          try {
            const parsedUrl = new URL(rawRepeat);
            musicDisplay = parsedUrl.hostname;
          } catch (e) {
            musicDisplay = 'External Audio Link';
          }
        }
      } else if (rawRepeat.includes('—') || rawRepeat.includes('-')) {
        const parts = rawRepeat.split(/—|-/).map(s => s.trim());
        musicTitle = parts[0] || rawRepeat;
        musicArtist = parts[1] || 'Unknown';
      } else {
        musicTitle = rawRepeat;
        musicArtist = 'Zee’s Playlist';
      }
    }

    const linkIconHtml = musicUrl
      ? ` <a href="${musicUrl}" target="_blank" rel="noopener noreferrer" class="currently-link-icon" title="Open track link">${ICONS.externalLink}</a>`
      : '';

    dom.currentlyItems.innerHTML = `
      <div class="currently-item">
        <div class="currently-label">${ICONS.book} reading</div>
        <div class="currently-value">${escapeHtml(status.reading || 'The Creative Act — Rick Rubin')}</div>
      </div>
      <div class="currently-item">
        <div class="currently-label">${musicLabelHtml}</div>
        <div class="currently-value">
          <span class="currently-value-text clickable" id="currently-play"
                data-title="${escapeHtml(musicTitle)}"
                data-artist="${escapeHtml(musicArtist)}"
                data-url="${musicUrl || ''}"
                data-external="${isExternalUrl ? 'true' : 'false'}"
                title="${isExternalUrl ? 'Open link in new tab' : 'Play ambient audio'}">
            ${escapeHtml(musicDisplay)}
          </span>${linkIconHtml}
        </div>
      </div>
      <div class="currently-item">
        <div class="currently-label">${ICONS.yarn} crafting</div>
        <div class="currently-value">${escapeHtml(status.crafting || 'Chunky knit pouch with sage yarn')}</div>
      </div>
      <div class="currently-item">
        <div class="currently-label">${ICONS.star} daydreaming of</div>
        <div class="currently-value">${escapeHtml(status.daydreaming || 'Quiet greenhouse afternoons & sunlit ceramic cups')}</div>
      </div>
    `;
  }

  /* ═══════════════════════════════════════
     STATUS MODAL
     ═══════════════════════════════════════ */

  function openStatusModal() {
    const status = Data.loadStatus();
    $('#sm-reading').value     = status.reading || '';
    $('#sm-repeat').value      = status.onRepeat || '';
    $('#sm-crafting').value    = status.crafting || '';
    $('#sm-daydreaming').value = status.daydreaming || '';

    const lfm = Data.loadLastFm();
    if ($('#sm-lastfm-user')) $('#sm-lastfm-user').value = lfm.username || '';
    if ($('#sm-lastfm-key'))  $('#sm-lastfm-key').value  = lfm.apiKey || '';
    if ($('#sm-lastfm-status')) {
      $('#sm-lastfm-status').className = 'lastfm-status-msg';
      $('#sm-lastfm-status').textContent = '';
    }

    dom.statusModal.classList.add('open');
  }

  function closeStatusModal() {
    dom.statusModal.classList.remove('open');
  }

  async function saveStatus() {
    const reading = $('#sm-reading').value.trim();
    const onRepeat = $('#sm-repeat').value.trim();
    const crafting = $('#sm-crafting').value.trim();
    const daydreaming = $('#sm-daydreaming').value.trim();

    const lastfmUser = $('#sm-lastfm-user') ? $('#sm-lastfm-user').value.trim() : '';
    const lastfmApiKey = $('#sm-lastfm-key') ? $('#sm-lastfm-key').value.trim() : '';

    const newStatus = {
      reading:      reading,
      onRepeat:     onRepeat || 'Where’s My Love — SYML',
      crafting:     crafting,
      daydreaming:  daydreaming,
      lastfmUser:   lastfmUser,
      lastfmApiKey: lastfmApiKey
    };

    Data.saveLastFm({
      username: lastfmUser,
      apiKey:   lastfmApiKey
    });

    closeStatusModal();
    renderCurrently();
    setupLastFmPolling();

    try {
      await Data.saveLiveStatus(newStatus);
      showToast('Sidebar status synced to Supabase.');
    } catch (e) {
      showToast('Status saved locally.');
    }
  }

  async function handleLastFmTestConnection() {
    const user = ($('#sm-lastfm-user') ? $('#sm-lastfm-user').value : '').trim();
    const key = ($('#sm-lastfm-key') ? $('#sm-lastfm-key').value : '').trim();
    const statusEl = $('#sm-lastfm-status');
    const testBtn = $('#sm-lastfm-test');

    if (!user || !key) {
      if (statusEl) {
        statusEl.className = 'lastfm-status-msg error';
        statusEl.textContent = 'Please enter both Username and API Key.';
      }
      return;
    }

    if (testBtn) testBtn.disabled = true;
    if (statusEl) {
      statusEl.className = 'lastfm-status-msg';
      statusEl.textContent = 'Checking…';
    }

    try {
      const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(user)}&api_key=${encodeURIComponent(key)}&format=json&limit=1`;
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) {
        if (statusEl) {
          statusEl.className = 'lastfm-status-msg error';
          statusEl.textContent = `HTTP ${res.status}: Check credentials.`;
        }
        if (testBtn) testBtn.disabled = false;
        return;
      }
      const data = await res.json();
      if (data.error) {
        if (statusEl) {
          statusEl.className = 'lastfm-status-msg error';
          statusEl.textContent = data.message || 'API error: Check username or API key.';
        }
        if (testBtn) testBtn.disabled = false;
        return;
      }

      const track = extractLastFmTrack(data);
      if (statusEl) {
        statusEl.className = 'lastfm-status-msg success';
        if (track) {
          const mode = track.nowPlaying ? 'Now playing' : 'Last played';
          statusEl.textContent = `Connected! (${mode}: ${track.title} — ${track.artist})`;
        } else {
          statusEl.textContent = 'Connected! (No recent tracks found yet)';
        }
      }
    } catch (err) {
      if (statusEl) {
        statusEl.className = 'lastfm-status-msg error';
        statusEl.textContent = 'Connection failed (offline or network error).';
      }
    } finally {
      if (testBtn) testBtn.disabled = false;
    }
  }

  /* ═══════════════════════════════════════
     READER VIEW
     ═══════════════════════════════════════ */

  function openReader(entryId) {
    const allEntries = Data.loadEntries();
    const entry = allEntries.find(e => e.id === entryId);
    if (!entry) return;

    const mdlMap = Data.getMightDeleteLaterMap(allEntries);

    const soundtrackHtml = entry.soundtrack ? `
      <div class="soundtrack-card">
        <div class="vinyl-art${isTrackPlaying(entry.soundtrack) ? ' spinning' : ''}" id="reader-vinyl"></div>
        <div class="soundtrack-info">
          <div class="soundtrack-kicker">
            ${ICONS.cassette}
            <span>SOUNDTRACK FOR THIS ENTRY</span>
          </div>
          <div class="track-title">${entry.soundtrack.title}</div>
          <div class="track-artist">${entry.soundtrack.artist}</div>
          ${entry.soundtrack.note ? `<div class="track-note">${entry.soundtrack.note}</div>` : ''}
          <div class="soundtrack-controls">
            <button class="play-btn" id="reader-play-btn"
                    data-track='${JSON.stringify(entry.soundtrack).replace(/'/g, '&#39;')}'>
              ${isTrackPlaying(entry.soundtrack) ? ICONS.pause : ICONS.play}
            </button>
            <input type="range" class="volume-slider" id="reader-volume"
                   min="0" max="100" value="${Math.round(Synth.getVolume() * 100)}">
            <span style="font-size:11px;color:var(--ink-muted);">
              ${entry.soundtrack.type === 'synth' ? Synth.getPresetLabel(entry.soundtrack.preset) : 'External'}
            </span>
          </div>
        </div>
      </div>
    ` : '';

    const tagsMetaHtml = (entry.tags || []).map(t =>
      `<span class="dot"></span>` + formatTagBadge(t, entry.id, mdlMap)
    ).join('');

    // Process body — wrap plain text in <p> tags if needed
    let body = entry.body || '';
    if (!body.includes('<p>')) {
      body = body.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('\n');
    }

    dom.readerContent.innerHTML = `
      <div class="reader-header">
        <div class="entry-meta">
          <span>${formatDate(entry.date || entry.createdAt)}</span>
          <span class="dot"></span>
          <span>${entry.readingTime || '?'} min read</span>
          ${tagsMetaHtml}
        </div>
        <h1>${entry.title}</h1>
        ${entry.subtitle ? `<p class="reader-subtitle">${entry.subtitle}</p>` : ''}
      </div>

      ${soundtrackHtml}

      <hr class="stitch-divider">

      <div class="reader-body">${body}</div>

      <div class="reader-footer-actions">
        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
          <span style="font-size:12px;color:var(--ink-muted);font-style:italic;">I’ll Try Anything Once</span>
          <span class="author-badge" style="font-size:11px; padding:2px 8px;">sonic diary</span>
        </div>
        <button class="reader-delete-btn author-only" id="reader-delete-btn" data-id="${entry.id}">
          Erase from memory?
        </button>
      </div>
    `;

    dom.readerOverlay.classList.add('open');
    readerOpen = true;
    document.body.style.overflow = 'hidden';

    // Delete button inside reader (Author only)
    const deleteBtn = $('#reader-delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', async () => {
        if (confirm(`Erase "${entry.title}" from memory? Numbers in the "might delete later" series will automatically recalculate without gaps.`)) {
          await Data.deleteLivePost(entry.id);
          closeReader();
          await syncAndRenderPosts();
          showToast(`"${entry.title}" erased from memory.`);
        }
      });
    }

    // Reader soundtrack controls
    const readerPlayBtn = $('#reader-play-btn');
    if (readerPlayBtn) {
      readerPlayBtn.addEventListener('click', () => {
        const track = JSON.parse(readerPlayBtn.dataset.track);
        toggleTrack(track);
        updateReaderPlayState(track);
      });
    }

    const readerVolume = $('#reader-volume');
    if (readerVolume) {
      readerVolume.addEventListener('input', (e) => {
        Synth.setVolume(e.target.value / 100);
        dom.miniVolume.value = e.target.value;
      });
    }

    // Scroll tracking for progress bar
    dom.readerOverlay.addEventListener('scroll', updateReadingProgress);
    dom.progressBar.style.width = '0%';
  }

  function updateReaderPlayState(track) {
    const btn = $('#reader-play-btn');
    const vinyl = $('#reader-vinyl');
    if (!btn) return;

    const playing = isTrackPlaying(track);
    btn.innerHTML = playing ? ICONS.pause : ICONS.play;
    if (vinyl) {
      vinyl.classList.toggle('spinning', playing);
    }
  }

  function closeReader() {
    dom.readerOverlay.classList.remove('open');
    readerOpen = false;
    document.body.style.overflow = '';
    dom.progressBar.style.width = '0%';
    dom.readerOverlay.removeEventListener('scroll', updateReadingProgress);
  }

  function updateReadingProgress() {
    const el = dom.readerOverlay;
    const scrollTop = el.scrollTop;
    const scrollHeight = el.scrollHeight - el.clientHeight;
    if (scrollHeight <= 0) return;
    const pct = Math.min(100, (scrollTop / scrollHeight) * 100);
    dom.progressBar.style.width = pct + '%';
  }

  /* ═══════════════════════════════════════
     EDITOR & QUICK TAG SYSTEM
     ═══════════════════════════════════════ */

  function getNextMdlNumber() {
    const allEntries = Data.loadEntries();
    const mdlEntries = allEntries.filter(e =>
      e.tags && e.tags.some(t => t.toLowerCase().trim().startsWith('might delete later'))
    );
    const nextNum = mdlEntries.length + 1;
    return String(nextNum).padStart(2, '0');
  }

  function updateEditorQuickTagState() {
    const checkboxes = $$('#ed-tags .tag-checkbox:checked');
    const selectedTags = Array.from(checkboxes).map(cb => cb.value);
    const isMdlChecked = selectedTags.some(t => t.toLowerCase().startsWith('might delete later'));

    const previewBox = $('#mdl-preview-box');
    const previewText = $('#mdl-preview-text');
    const titleHint = $('#title-hint');
    const titleInput = $('#ed-title');

    if (isMdlChecked) {
      const nextNum = getNextMdlNumber();
      if (previewText) previewText.innerHTML = `Will be published as: <strong>might delete later #${nextNum}</strong>`;
      if (previewBox) previewBox.style.display = 'flex';
      if (!titleInput.value) {
        titleInput.placeholder = `e.g. might delete later #${nextNum} (or leave blank to auto-title)`;
      }
    } else {
      if (previewBox) previewBox.style.display = 'none';
      if (!titleInput.value) {
        titleInput.placeholder = "What's on your mind today? (or leave blank for auto-title)";
      }
    }

    const hasAutoTitleTag = selectedTags.some(t =>
      ['might delete later', 'nocturnal thoughts', 'rants', 'brain dump'].includes(t.toLowerCase())
    );

    if (titleHint) {
      if (hasAutoTitleTag) {
        titleHint.textContent = 'Auto-title ready if left blank';
        titleHint.style.color = 'var(--accent)';
      } else {
        titleHint.textContent = 'Optional for quick series';
        titleHint.style.color = 'var(--ink-muted)';
      }
    }
  }

  function openEditor() {
    // Render Quick Tag pills
    const tagsContainer = $('#ed-tags');
    tagsContainer.innerHTML = Data.TAGS.filter(t => t !== 'All').map(tag => `
      <input type="checkbox" class="tag-checkbox" id="edt-${tag.replace(/\s+/g,'-')}" value="${tag}">
      <label class="tag-checkbox-label" for="edt-${tag.replace(/\s+/g,'-')}" data-tag="${tag}">${tag}</label>
    `).join('');

    // Attach change listener for live preview
    tagsContainer.removeEventListener('change', updateEditorQuickTagState);
    tagsContainer.addEventListener('change', updateEditorQuickTagState);

    // Set default date (local date YYYY-MM-DD)
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    $('#ed-date').value = `${y}-${m}-${d}`;

    // Clear fields
    $('#ed-title').value = '';
    $('#ed-subtitle').value = '';
    $('#ed-track-title').value = '';
    $('#ed-track-artist').value = '';
    $('#ed-track-note').value = '';
    $('#ed-track-preset').value = 'warmRhodes';
    $('#ed-track-url').value = '';
    $('#ed-body').value = '';

    updateEditorQuickTagState();

    dom.editorOverlay.classList.add('open');
    editorOpen = true;
    document.body.style.overflow = 'hidden';
    setTimeout(() => $('#ed-title').focus(), 300);
  }

  function closeEditor() {
    dom.editorOverlay.classList.remove('open');
    editorOpen = false;
    document.body.style.overflow = '';
  }

  function handlePublish(e) {
    e.preventDefault();

    let title = $('#ed-title').value.trim();

    // Gather selected Quick Tags
    const tags = [];
    $$('#ed-tags .tag-checkbox:checked').forEach(cb => tags.push(cb.value));

    // Smart Blank-Title Fallback
    if (!title) {
      const dateVal = $('#ed-date').value || new Date().toISOString().slice(0, 10);
      let monthDay = 'Today';
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
        const [y, m, d] = dateVal.split('-').map(Number);
        monthDay = new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }

      const hasTag = (tagStr) => tags.some(t => t.toLowerCase() === tagStr.toLowerCase());

      if (hasTag('might delete later')) {
        const nextNum = getNextMdlNumber();
        title = `might delete later #${nextNum}`;
      } else if (hasTag('nocturnal thoughts')) {
        title = `nocturnal thoughts — ${monthDay}`;
      } else if (hasTag('rants')) {
        title = `rants — ${monthDay}`;
      } else if (hasTag('brain dump')) {
        title = `brain dump — ${monthDay}`;
      } else {
        alert('Please enter a title, or pick a Quick Tag (might delete later, nocturnal thoughts, rants, brain dump) for an automatic editorial title.');
        $('#ed-title').focus();
        return;
      }
    }

    // Build soundtrack object
    let soundtrack = null;
    const trackTitle = $('#ed-track-title').value.trim();
    const trackArtist = $('#ed-track-artist').value.trim();
    if (trackTitle) {
      soundtrack = {
        title: trackTitle,
        artist: trackArtist || 'Unknown',
        note: $('#ed-track-note').value.trim(),
        type: $('#ed-track-preset').value ? 'synth' : 'url',
        preset: $('#ed-track-preset').value || null,
        url: $('#ed-track-url').value.trim() || null
      };
    }

    // Process body — auto-wrap in <p> tags
    let rawBody = $('#ed-body').value.trim();
    if (rawBody && !rawBody.includes('<p>')) {
      rawBody = rawBody.split(/\n{2,}/).map(para => {
        para = para.trim();
        if (para.startsWith('<blockquote>') || para.startsWith('<figure>')) return para;
        return `<p>${para}</p>`;
      }).join('\n\n');
    }

    // Pick a random cover gradient
    const gradients = Data.coverGradients;
    const coverGradient = gradients[Math.floor(Math.random() * gradients.length)];

    const entry = {
      title,
      subtitle: $('#ed-subtitle').value.trim(),
      date: $('#ed-date').value,
      tags,
      soundtrack,
      body: rawBody,
      coverGradient
    };

    Data.insertLivePost(entry).then(() => {
      closeEditor();
      syncAndRenderPosts();
      showToast('Entry published live to Supabase!');
    }).catch(err => {
      console.warn('Publish fallback:', err);
      Data.addEntry(entry);
      closeEditor();
      renderFeed();
      showToast('Entry saved locally.');
    });
  }

  /* ═══════════════════════════════════════
     AUDIO PLAYER
     ═══════════════════════════════════════ */

  function isTrackPlaying(track) {
    if (!Synth.isPlaying() || !currentTrack) return false;
    return currentTrack.title === track.title && currentTrack.artist === track.artist;
  }

  function toggleTrack(track) {
    if (isTrackPlaying(track)) {
      // Stop
      Synth.stop();
      currentTrack = null;
      hideMiniPlayer();
      renderFeed(); // Update pill states
      return;
    }

    // Play new track
    if (track.type === 'synth' && track.preset) {
      Synth.play(track.preset);
    } else {
      Synth.play('warmRhodes');
    }

    currentTrack = track;
    showMiniPlayer(track);
    renderFeed(); // Update pill states
  }

  function showMiniPlayer(track) {
    dom.miniTitle.textContent = track.title;
    dom.miniArtist.textContent = track.artist;
    dom.miniPlayBtn.innerHTML = ICONS.pause;
    dom.miniVinyl.classList.add('spinning');
    dom.miniPlayer.classList.add('visible');
  }

  function hideMiniPlayer() {
    dom.miniPlayer.classList.remove('visible');
    dom.miniVinyl.classList.remove('spinning');
    dom.miniPlayBtn.innerHTML = ICONS.play;
  }

  function handleMiniPlayPause() {
    if (!currentTrack) return;

    if (Synth.isPlaying()) {
      Synth.stop();
      dom.miniPlayBtn.innerHTML = ICONS.play;
      dom.miniVinyl.classList.remove('spinning');

      const readerVinyl = $('#reader-vinyl');
      if (readerVinyl) readerVinyl.classList.remove('spinning');
      const readerBtn = $('#reader-play-btn');
      if (readerBtn) readerBtn.innerHTML = ICONS.play;

      renderFeed();
    } else {
      if (currentTrack.type === 'synth' && currentTrack.preset) {
        Synth.play(currentTrack.preset);
      } else {
        Synth.play('warmRhodes');
      }
      dom.miniPlayBtn.innerHTML = ICONS.pause;
      dom.miniVinyl.classList.add('spinning');

      const readerVinyl = $('#reader-vinyl');
      if (readerVinyl) readerVinyl.classList.add('spinning');
      const readerBtn = $('#reader-play-btn');
      if (readerBtn) readerBtn.innerHTML = ICONS.pause;

      renderFeed();
    }
  }

  function handleMiniClose() {
    Synth.stop();
    currentTrack = null;
    hideMiniPlayer();
    renderFeed();

    const readerVinyl = $('#reader-vinyl');
    if (readerVinyl) readerVinyl.classList.remove('spinning');
    const readerBtn = $('#reader-play-btn');
    if (readerBtn) readerBtn.innerHTML = ICONS.play;
  }

  /* ═══════════════════════════════════════
     EVENT BINDING
     ═══════════════════════════════════════ */

  function bindEvents() {
    // Theme
    dom.themeToggle.addEventListener('click', toggleTheme);

    // Logo → reset
    dom.logoLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (readerOpen) closeReader();
      if (editorOpen) closeEditor();
      activeFilter = 'All';
      renderFilters();
      renderFeed();
    });

    // Filters
    dom.filterBar.addEventListener('click', handleFilterClick);

    // Feed
    dom.feedColumn.addEventListener('click', handleFeedClick);

    // Reader
    dom.readerClose.addEventListener('click', closeReader);

    // Editor
    dom.writeBtn.addEventListener('click', openEditor);
    dom.editorClose.addEventListener('click', closeEditor);
    dom.editorCancel.addEventListener('click', closeEditor);
    dom.editorForm.addEventListener('submit', handlePublish);

    // Status modal
    dom.editStatusBtn.addEventListener('click', openStatusModal);
    $('#status-modal-cancel').addEventListener('click', closeStatusModal);
    $('#status-modal-save').addEventListener('click', saveStatus);
    dom.statusModal.addEventListener('click', (e) => {
      if (e.target === dom.statusModal) closeStatusModal();
    });

    // Mini player
    dom.miniPlayBtn.addEventListener('click', handleMiniPlayPause);
    dom.miniCloseBtn.addEventListener('click', handleMiniClose);
    dom.miniVolume.addEventListener('input', (e) => {
      Synth.setVolume(e.target.value / 100);
      const readerVol = $('#reader-volume');
      if (readerVol) readerVol.value = e.target.value;
    });

    // Export / Import
    dom.exportBtn.addEventListener('click', Data.exportAll);
    dom.importInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        await Data.importAll(file);
        renderFeed();
        renderCurrently();
        alert('Data imported successfully!');
      } catch (err) {
        alert('Import failed: ' + err.message);
      }
      e.target.value = '';
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if ($('#author-modal') && $('#author-modal').classList.contains('open')) {
          closeAuthorModal();
        } else if (dom.statusModal.classList.contains('open')) {
          closeStatusModal();
        } else if (editorOpen) {
          closeEditor();
        } else if (readerOpen) {
          closeReader();
        }
      }

      // Ctrl/Cmd + Shift + E: Author Mode toggle shortcut
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
        e.preventDefault();
        openAuthorModal();
      }
    });

    // Masthead sparkle triple-click (Subtle hidden author unlock)
    const sparkle = $('#masthead-sparkle');
    let sparkleClicks = 0;
    let sparkleTimer = null;
    if (sparkle) {
      sparkle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        sparkleClicks++;
        clearTimeout(sparkleTimer);
        sparkleTimer = setTimeout(() => {
          sparkleClicks = 0;
        }, 1400);

        if (sparkleClicks === 3) {
          sparkleClicks = 0;
          openAuthorModal();
        }
      });
    }

    // Author Login Form submission
    const loginForm = $('#author-login-form');
    if (loginForm) loginForm.addEventListener('submit', handleAuthorLoginSubmit);

    const authorCancelBtn = $('#author-modal-cancel');
    if (authorCancelBtn) authorCancelBtn.addEventListener('click', closeAuthorModal);

    const authorCloseSignedBtn = $('#author-modal-close-signed');
    if (authorCloseSignedBtn) authorCloseSignedBtn.addEventListener('click', closeAuthorModal);

    const authorSignoutModalBtn = $('#author-modal-signout');
    if (authorSignoutModalBtn) authorSignoutModalBtn.addEventListener('click', handleAuthorSignOut);

    const authorModal = $('#author-modal');
    if (authorModal) {
      authorModal.addEventListener('click', (e) => {
        if (e.target === authorModal) closeAuthorModal();
      });
    }

    // Header Sign Out pill
    const authorSignoutBtn = $('#author-signout-btn');
    if (authorSignoutBtn) {
      authorSignoutBtn.addEventListener('click', handleAuthorSignOut);
    }

    // Seed database button
    const seedDatabaseBtn = $('#seed-database-btn');
    if (seedDatabaseBtn) {
      seedDatabaseBtn.addEventListener('click', handleSeedDatabase);
    }

    // Download posts.js button (Author only)
    const downloadPostsBtn = $('#download-posts-js-btn');
    if (downloadPostsBtn) {
      downloadPostsBtn.addEventListener('click', () => {
        Data.downloadPostsJs();
        showToast('posts.js downloaded!');
      });
    }

    // Status modal test connection
    if (dom.smLastfmTest) {
      dom.smLastfmTest.addEventListener('click', handleLastFmTestConnection);
    }

    // "Currently" music click → open URL or play ambient synth
    dom.currentlyItems.addEventListener('click', (e) => {
      const playEl = e.target.closest('#currently-play');
      if (playEl) {
        const isExternal = playEl.dataset.external === 'true';
        const url = playEl.dataset.url;
        if (isExternal && url) {
          window.open(url, '_blank', 'noopener,noreferrer');
        } else {
          toggleTrack({
            title: playEl.dataset.title || 'Where’s My Love',
            artist: playEl.dataset.artist || 'SYML',
            type: 'synth',
            preset: 'warmRhodes'
          });
        }
      }
    });
  }

  /* ═══════════════════════════════════════
     INIT
     ═══════════════════════════════════════ */

  async function init() {
    cacheDom();
    initTheme();
    renderFilters();
    renderFeed();
    renderCurrently();
    setupLastFmPolling();
    bindEvents();
    await initAuthorAuth();
    await syncAndRenderPosts();
    await syncLiveStatus();

    console.log(
      '%c[demo tape] I’ll Try Anything Once %c— live Supabase connected',
      'color:#4F795B;font-weight:bold;font-size:14px;',
      'color:#6E6A63;font-size:12px;'
    );
  }

  // Start when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window.ZLog);
