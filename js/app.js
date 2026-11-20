/* ───────────────────────────────────────────
   ZLog · Main Application
   Rendering, events, routing, editor,
   player, theme management, and quick tags
   ─────────────────────────────────────────── */
window.ZLog = window.ZLog || {};

(function (Z) {
  'use strict';

  const { Data } = Z;

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
  let currentTrack = null;   // { title, artist, note, url, parsed }
  let readerOpen = false;
  let editorOpen = false;
  let latestLiveTrack = null; // { title, artist, nowPlaying, url }
  let lastfmTimer = null;

  /* ── DOM Cache ── */
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  const dom = {};

  function cacheDom() {
    dom.filterBar       = $('#index-nav') || $('#filter-bar');
    dom.feedColumn      = $('#feed-column');
    dom.sidebarColumn   = $('#sidebar-column');
    dom.currentlyItems  = $('#currently-items');
    dom.readerOverlay   = $('#reader-overlay');
    dom.readerContent   = $('#reader-content');
    dom.readerClose     = $('#reader-close');
    dom.editorOverlay   = $('#editor-overlay');
    dom.canvasTopbar    = $('#canvas-topbar');
    dom.canvasBackBtn   = $('#canvas-back-btn');
    dom.canvasUndoBtn   = $('#canvas-undo-btn');
    dom.canvasRedoBtn   = $('#canvas-redo-btn');
    dom.canvasFormatBlock = $('#canvas-format-block');
    dom.canvasCodeBtn   = $('#canvas-code-btn');
    dom.canvasHighlightBtn = $('#canvas-highlight-btn');
    dom.canvasLinkBtn   = $('#canvas-link-btn');
    dom.canvasImageBtn  = $('#canvas-image-btn');
    dom.canvasImageInput = $('#canvas-image-input');
    dom.canvasSoundtrackToggle = $('#canvas-soundtrack-toggle');
    dom.canvasSoundtrackStrip = $('#canvas-soundtrack-strip');
    dom.canvasSoundtrackClose = $('#canvas-soundtrack-close');
    dom.canvasQuoteBtn  = $('#canvas-quote-btn');
    dom.canvasHrBtn     = $('#canvas-hr-btn');
    dom.canvasPreviewBtn = $('#canvas-preview-btn');
    dom.canvasPublishBtn = $('#canvas-publish-btn');
    dom.canvasScrollBody = $('#canvas-scroll-body');
    dom.canvasContainer = $('#canvas-container');
    dom.canvasEditArea  = $('#canvas-edit-area');
    dom.canvasTitle     = $('#canvas-title');
    dom.canvasSubtitle  = $('#canvas-subtitle');
    dom.canvasCategoryTabs = $('#canvas-category-tabs');
    dom.canvasMdlPreview = $('#canvas-mdl-preview');
    dom.canvasMdlText   = $('#canvas-mdl-text');
    dom.canvasTrackUrl  = $('#canvas-track-url');
    dom.canvasTrackTitle = $('#canvas-track-title');
    dom.canvasTrackArtist = $('#canvas-track-artist');
    dom.canvasTrackNote = $('#canvas-track-note');
    dom.canvasTrackHint = $('#canvas-track-hint');
    dom.canvasBody      = $('#canvas-body');
    dom.canvasPreviewArea = $('#canvas-preview-area');
    dom.canvasPreviewMeta = $('#canvas-preview-meta');
    dom.canvasPreviewTitle = $('#canvas-preview-title');
    dom.canvasPreviewSubtitle = $('#canvas-preview-subtitle');
    dom.canvasPreviewSoundtrack = $('#canvas-preview-soundtrack');
    dom.canvasPreviewBody = $('#canvas-preview-body');
    dom.writeBtn        = $('#write-btn');
    dom.logoLink        = $('#logo-link');
    dom.themeToggle     = $('#theme-toggle');
    dom.themeIcon       = $('#theme-icon');
    dom.statusModal     = $('#status-modal');
    dom.editStatusBtn   = $('#edit-status-btn');
    dom.smLastfmUser    = $('#sm-lastfm-user');
    dom.smLastfmKey     = $('#sm-lastfm-key');
    dom.smLastfmTest    = $('#sm-lastfm-test');
    dom.smLastfmStatus  = $('#sm-lastfm-status');
    dom.miniPlayer      = $('#mini-player');
    dom.miniVinyl       = $('#mini-vinyl');
    dom.miniTitle       = $('#mini-title');
    dom.miniArtist      = $('#mini-artist');
    dom.miniSourceBadge = $('#mini-source-badge');
    dom.miniCloseBtn    = $('#mini-close-btn');
    dom.miniVolume      = $('#mini-volume');
    dom.directAudioBox  = $('#direct-audio-box');
    dom.directAudioEl   = $('#direct-audio-element');
    dom.directPlayBtn   = $('#direct-play-btn');
    dom.audioTimeCurrent= $('#audio-time-current');
    dom.audioTimeTotal  = $('#audio-time-total');
    dom.audioScrubber   = $('#audio-scrubber');
    dom.embedIframeBox  = $('#embed-iframe-box');
    dom.edTrackUrl      = $('#ed-track-url');
    dom.edTrackTitle    = $('#ed-track-title');
    dom.edTrackArtist   = $('#ed-track-artist');
    dom.edTrackNote     = $('#ed-track-note');
    dom.edTrackUrlHint  = $('#ed-track-url-hint');
    dom.exportBtn       = $('#export-btn');
    dom.importInput     = $('#import-input');
    dom.progressBar     = $('#reading-progress');
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
     URL PARSER & AUDIO HELPERS
     ═══════════════════════════════════════ */

  function formatAudioTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function parseTrackUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') return null;
    let url = rawUrl.trim();

    // If user pasted an iframe embed code, extract the src URL
    const iframeSrcMatch = url.match(/src=["']([^"']+)["']/i);
    if (iframeSrcMatch) {
      url = iframeSrcMatch[1];
    }

    // Direct Audio Files (.mp3, .m4a, .wav, .ogg, .aac)
    if (/\.(mp3|m4a|wav|ogg|aac)(\?.*)?$/i.test(url)) {
      return {
        type: 'audio',
        platform: 'Direct Audio',
        url: url,
        embedUrl: url
      };
    }

    // YouTube & YouTube Music
    // Matches: youtube.com/watch?v=ID, youtu.be/ID, music.youtube.com/watch?v=ID, /embed/ID, /shorts/ID
    const ytMatch = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/))([\w-]{11})/i);
    if (ytMatch && ytMatch[1]) {
      const videoId = ytMatch[1];
      const isMusic = url.includes('music.youtube.com');
      return {
        type: 'youtube',
        platform: isMusic ? 'YouTube Music' : 'YouTube',
        id: videoId,
        url: url,
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`
      };
    }

    // Spotify (tracks, albums, playlists, episodes)
    // Matches: open.spotify.com/track/ID, open.spotify.com/album/ID, with optional intl-xx path
    const spotifyMatch = url.match(/open\.spotify\.com\/(?:intl-[a-z]{2,4}\/)?(track|album|playlist|episode)\/([a-zA-Z0-9]+)/i);
    if (spotifyMatch) {
      const mediaType = spotifyMatch[1].toLowerCase();
      const mediaId = spotifyMatch[2];
      return {
        type: 'spotify',
        platform: 'Spotify',
        id: mediaId,
        mediaType: mediaType,
        url: url,
        embedUrl: `https://open.spotify.com/embed/${mediaType}/${mediaId}?utm_source=generator`
      };
    }
    if (/open\.spotify\.com\/embed\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/i.test(url)) {
      const m = url.match(/open\.spotify\.com\/embed\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/i);
      return {
        type: 'spotify',
        platform: 'Spotify',
        id: m[2],
        mediaType: m[1],
        url: url,
        embedUrl: url.includes('utm_source=generator') ? url : `${url}${url.includes('?') ? '&' : '?'}utm_source=generator`
      };
    }

    // SoundCloud
    if (/soundcloud\.com\//i.test(url)) {
      if (url.includes('w.soundcloud.com/player/')) {
        return {
          type: 'soundcloud',
          platform: 'SoundCloud',
          url: url,
          embedUrl: url
        };
      }
      return {
        type: 'soundcloud',
        platform: 'SoundCloud',
        url: url,
        embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23537E60&auto_play=true`
      };
    }

    // Fallback generic web audio link
    if (/^https?:\/\//i.test(url)) {
      return {
        type: 'generic',
        platform: 'Audio Link',
        url: url,
        embedUrl: url
      };
    }

    return null;
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
    await Data.fetchLivePosts();
    renderFeed();
  }

  async function syncLiveStatus() {
    await Data.fetchLiveStatus();
    renderCurrently();
    fetchLastFmNowPlaying();
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

    let songPillHtml = '';
    const st = entry.soundtrack;
    if (st && (st.title || st.artist || st.url || entry.song_url)) {
      const songUrl = st.url || entry.song_url;
      const title = st.title || 'Soundtrack';
      const artist = st.artist || '';
      const displayLabel = artist ? `${title} — ${artist}` : title;

      if (songUrl) {
        const fullTrack = { ...st, url: songUrl, title, artist };
        const isPlaying = isTrackPlaying(fullTrack);
        const songPillIcon = isPlaying ? ICONS.waveform : ICONS.cassette;
        songPillHtml = `
          <div class="song-pill${isPlaying ? ' playing' : ''}"
               role="button"
               tabindex="0"
               title="Play soundtrack"
               data-entry-id="${entry.id}"
               data-track='${escapeHtml(JSON.stringify(fullTrack))}'>
            <span class="pill-icon">${songPillIcon}</span>
            <span>${escapeHtml(displayLabel)}</span>
          </div>`;
      } else {
        // Clean non-playable soundtrack note
        songPillHtml = `
          <div class="song-pill song-pill--note"
               title="Soundtrack note"
               data-entry-id="${entry.id}">
            <span class="pill-icon">${ICONS.cassette}</span>
            <span>${escapeHtml(displayLabel)}</span>
          </div>`;
      }
    }

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
          <svg class="empty-state-icon" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="9" y1="13" x2="15" y2="13"/>
            <line x1="9" y1="17" x2="13" y2="17"/>
          </svg>
          <p class="empty-state-text">Cool beans — nothing written here yet.</p>
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
      if (pill.classList.contains('song-pill--note')) {
        return;
      }
      let track = null;
      if (pill.dataset.entryId) {
        const entry = Data.getEntry(pill.dataset.entryId);
        if (entry && (entry.soundtrack || entry.song_url)) {
          const st = entry.soundtrack || {};
          const songUrl = st.url || entry.song_url;
          track = {
            title: st.title || entry.title || 'Soundtrack',
            artist: st.artist || 'Unknown Artist',
            note: st.note || '',
            url: songUrl
          };
        }
      }
      if (!track && pill.dataset.track) {
        try {
          track = JSON.parse(pill.dataset.track);
        } catch (_) {}
      }
      if (track) {
        toggleTrack(track);
      }
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

    let soundtrackHtml = '';
    const st = entry.soundtrack;
    if (st && (st.title || st.artist || st.url || entry.song_url)) {
      const songUrl = st.url || entry.song_url;
      const title = st.title || 'Soundtrack';
      const artist = st.artist || 'Unknown';
      const note = st.note || '';
      const fullTrack = { ...st, url: songUrl, title, artist };
      const isPlaying = isTrackPlaying(fullTrack);

      if (songUrl) {
        const parsed = parseTrackUrl(songUrl);
        const platformName = parsed ? parsed.platform : 'Soundtrack';
        soundtrackHtml = `
          <div class="soundtrack-card">
            <div class="vinyl-art${isPlaying ? ' spinning' : ''}" id="reader-vinyl"></div>
            <div class="soundtrack-info">
              <div class="soundtrack-kicker">
                ${ICONS.cassette}
                <span>SOUNDTRACK FOR THIS ENTRY</span>
              </div>
              <div class="track-title">${escapeHtml(title)}</div>
              <div class="track-artist">${escapeHtml(artist)}</div>
              ${note ? `<div class="track-note">${escapeHtml(note)}</div>` : ''}
              <div class="soundtrack-controls">
                <button class="play-btn" id="reader-play-btn"
                        data-track='${escapeHtml(JSON.stringify(fullTrack))}'
                        aria-label="Play or Pause soundtrack"
                        title="Play soundtrack">
                  ${isPlaying ? ICONS.pause : ICONS.play}
                </button>
                <span class="soundtrack-platform-badge">${escapeHtml(platformName)}</span>
                <a href="${escapeHtml(songUrl)}" target="_blank" rel="noopener noreferrer" class="soundtrack-external-link" title="Open original link">
                  ${ICONS.externalLink}
                </a>
              </div>
            </div>
          </div>
        `;
      } else {
        // Clean non-playable soundtrack note
        soundtrackHtml = `
          <div class="soundtrack-card soundtrack-card--note">
            <div class="vinyl-art" id="reader-vinyl"></div>
            <div class="soundtrack-info">
              <div class="soundtrack-kicker">
                ${ICONS.cassette}
                <span>SOUNDTRACK NOTE</span>
              </div>
              <div class="track-title">${escapeHtml(title)}</div>
              <div class="track-artist">${escapeHtml(artist)}</div>
              ${note ? `<div class="track-note">${escapeHtml(note)}</div>` : ''}
            </div>
          </div>
        `;
      }
    }

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
        try {
          const track = JSON.parse(readerPlayBtn.dataset.track);
          toggleTrack(track);
          updateReaderPlayState(track);
        } catch (err) {
          console.warn('Reader play button error:', err);
        }
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
     SUBSTACK-STYLE WRITING CANVAS & QUICK TAGS
     ═══════════════════════════════════════ */

  let selectedCanvasCategory = null;
  let isCanvasPreviewActive = false;

  function getNextMdlNumber() {
    const allEntries = Data.loadEntries();
    const mdlEntries = allEntries.filter(e =>
      e.tags && e.tags.some(t => t.toLowerCase().trim().startsWith('might delete later'))
    );
    const nextNum = mdlEntries.length + 1;
    return String(nextNum).padStart(2, '0');
  }

  function autoGrowTextarea(el) {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }

  function renderCanvasCategoryTabs() {
    if (!dom.canvasCategoryTabs) return;
    const categories = Data.TAGS.filter(t => t !== 'All');
    dom.canvasCategoryTabs.innerHTML = categories.map(cat => {
      const isSelected = selectedCanvasCategory === cat;
      return `<button type="button" class="canvas-category-tab ${isSelected ? 'active' : ''}" data-category="${escapeHtml(cat)}">${escapeHtml(cat)}</button>`;
    }).join('');
    updateCanvasCategoryState();
  }

  function updateCanvasCategoryState() {
    if (!dom.canvasMdlPreview) return;
    if (selectedCanvasCategory === 'might delete later') {
      const nextNum = getNextMdlNumber();
      if (dom.canvasMdlText) {
        dom.canvasMdlText.innerHTML = `Will be published as: <strong>might delete later #${nextNum}</strong>`;
      }
      dom.canvasMdlPreview.style.display = 'flex';
      if (!dom.canvasTitle.value) {
        dom.canvasTitle.placeholder = `e.g. might delete later #${nextNum} (or leave blank to auto-title)`;
      }
    } else {
      dom.canvasMdlPreview.style.display = 'none';
      if (!dom.canvasTitle.value) {
        if (selectedCanvasCategory && ['nocturnal thoughts', 'rants', 'brain dump'].includes(selectedCanvasCategory)) {
          dom.canvasTitle.placeholder = `e.g. ${selectedCanvasCategory} (or leave blank to auto-title)`;
        } else {
          dom.canvasTitle.placeholder = 'Title';
        }
      }
    }
  }

  function toggleSoundtrackStrip(forceOpen) {
    if (!dom.canvasSoundtrackStrip) return;
    const isHidden = dom.canvasSoundtrackStrip.style.display === 'none' || !dom.canvasSoundtrackStrip.style.display;
    const open = forceOpen !== undefined ? forceOpen : isHidden;
    dom.canvasSoundtrackStrip.style.display = open ? 'block' : 'none';
    if (dom.canvasSoundtrackToggle) {
      dom.canvasSoundtrackToggle.classList.toggle('active', open);
    }
    if (open && dom.canvasTrackUrl) {
      dom.canvasTrackUrl.focus();
    }
  }

  function removeSoundtrackStrip() {
    if (dom.canvasTrackUrl) dom.canvasTrackUrl.value = '';
    if (dom.canvasTrackTitle) dom.canvasTrackTitle.value = '';
    if (dom.canvasTrackArtist) dom.canvasTrackArtist.value = '';
    if (dom.canvasTrackNote) dom.canvasTrackNote.value = '';
    if (dom.canvasTrackHint) {
      dom.canvasTrackHint.textContent = 'Auto-fills Song Title and Artist when link is pasted';
      dom.canvasTrackHint.style.color = 'var(--ink-muted)';
    }
    toggleSoundtrackStrip(false);
  }

  /* ── Auto-Fill Song Details via oEmbed / NoEmbed ── */
  async function handleCanvasSongUrlAutoFill() {
    const urlInput = dom.canvasTrackUrl;
    if (!urlInput) return;
    const rawUrl = urlInput.value.trim();
    if (!rawUrl || !/^https?:\/\//i.test(rawUrl)) return;

    const titleInput = dom.canvasTrackTitle;
    const artistInput = dom.canvasTrackArtist;
    if (!titleInput || !artistInput) return;

    if (titleInput.value.trim() && artistInput.value.trim()) return;

    const hintEl = dom.canvasTrackHint;
    const defaultHint = 'Auto-fills Song Title and Artist when link is pasted';
    if (hintEl) {
      hintEl.textContent = 'Fetching song details…';
      hintEl.style.color = 'var(--accent)';
    }

    try {
      let fetched = false;

      // 1. Spotify oEmbed
      if (/open\.spotify\.com\/(?:intl-[a-z]{2,4}\/)?(track|album)/i.test(rawUrl)) {
        try {
          const spotifyRes = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(rawUrl)}`);
          if (spotifyRes.ok) {
            const data = await spotifyRes.json();
            if (data && data.title) {
              if (!titleInput.value.trim()) titleInput.value = data.title;
              fetched = true;
            }
          }
        } catch (_) {}
      }

      // 2. noembed.com fallback (YouTube, YouTube Music, SoundCloud, Vimeo, etc.)
      if (!fetched) {
        const noembedRes = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(rawUrl)}`);
        if (noembedRes.ok) {
          const data = await noembedRes.json();
          if (data && !data.error) {
            const authorName = (data.author_name || '').trim();
            let rawTitle = (data.title || '').trim();

            rawTitle = rawTitle.replace(/\s*[\(\[](?:Official\s*(?:Music\s*)?(?:Video|Audio|HD|4K|Remaster|Visualizer|Lyric Video)|Music Video|Lyric Video)[\)\]]/gi, '').trim();

            let detectedArtist = authorName;
            let detectedTitle = rawTitle;

            if (rawTitle.includes(' - ')) {
              const parts = rawTitle.split(/\s+-\s+/);
              if (authorName && parts[0].toLowerCase().includes(authorName.toLowerCase())) {
                detectedArtist = authorName;
                detectedTitle = parts.slice(1).join(' - ').trim();
              } else if (parts.length >= 2) {
                detectedArtist = parts[0].trim();
                detectedTitle = parts.slice(1).join(' - ').trim();
              }
            }

            if (!titleInput.value.trim() && detectedTitle) {
              titleInput.value = detectedTitle;
            }
            if (!artistInput.value.trim() && detectedArtist) {
              artistInput.value = detectedArtist;
            }
            fetched = true;
          }
        }
      }

      if (fetched) {
        if (hintEl) {
          hintEl.textContent = 'Auto-filled Song Title & Artist from link';
          hintEl.style.color = 'var(--accent)';
        }
        showToast('Song details auto-filled from link.');
      } else {
        if (hintEl) {
          hintEl.textContent = defaultHint;
          hintEl.style.color = 'var(--ink-muted)';
        }
      }
    } catch (err) {
      console.warn('Song URL auto-fill note:', err);
      if (hintEl) {
        hintEl.textContent = defaultHint;
        hintEl.style.color = 'var(--ink-muted)';
      }
    }
  }

  /* ── Rich-Text Formatting Commands ── */
  function execCanvasCommand(command, value = null) {
    if (isCanvasPreviewActive) return;
    if (!dom.canvasBody) return;
    dom.canvasBody.focus();
    document.execCommand(command, false, value);
  }

  function handleCanvasCode() {
    if (isCanvasPreviewActive || !dom.canvasBody) return;
    dom.canvasBody.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    let parent = sel.anchorNode;
    while (parent && parent !== dom.canvasBody) {
      if (parent.nodeName === 'CODE') {
        const textNode = document.createTextNode(parent.textContent);
        parent.parentNode.replaceChild(textNode, parent);
        return;
      }
      parent = parent.parentNode;
    }

    const selectedText = range.toString();
    if (!selectedText) {
      const codeEl = document.createElement('code');
      codeEl.textContent = 'code';
      range.insertNode(codeEl);
      return;
    }

    const codeEl = document.createElement('code');
    codeEl.textContent = selectedText;
    range.deleteContents();
    range.insertNode(codeEl);
  }

  function handleCanvasHighlight() {
    if (isCanvasPreviewActive || !dom.canvasBody) return;
    dom.canvasBody.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    let parent = sel.anchorNode;
    while (parent && parent !== dom.canvasBody) {
      if (parent.nodeName === 'MARK' || (parent.classList && parent.classList.contains('matcha-highlight'))) {
        const textNode = document.createTextNode(parent.textContent);
        parent.parentNode.replaceChild(textNode, parent);
        return;
      }
      parent = parent.parentNode;
    }

    const text = range.toString();
    if (!text) return;

    const mark = document.createElement('mark');
    mark.className = 'matcha-highlight';
    mark.textContent = text;
    range.deleteContents();
    range.insertNode(mark);
  }

  function handleCanvasLink() {
    if (isCanvasPreviewActive || !dom.canvasBody) return;
    const url = prompt('Enter link URL (https://…):');
    if (!url) return;
    const cleanUrl = /^https?:\/\//i.test(url.trim()) ? url.trim() : 'https://' + url.trim();
    execCanvasCommand('createLink', cleanUrl);
  }

  function calcReadingMinutes(html) {
    const text = (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = text ? text.split(/\s+/).length : 0;
    return Math.max(1, Math.round(wordCount / 200));
  }

  function toggleCanvasPreview() {
    if (!dom.canvasPreviewArea || !dom.canvasEditArea) return;
    isCanvasPreviewActive = !isCanvasPreviewActive;

    if (isCanvasPreviewActive) {
      dom.canvasPreviewBtn.textContent = 'Edit';
      dom.canvasPreviewBtn.classList.add('active');
      dom.canvasEditArea.style.display = 'none';
      dom.canvasPreviewArea.style.display = 'block';

      const cat = selectedCanvasCategory;
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      let catLabel = '';
      if (cat) {
        if (cat === 'might delete later') {
          catLabel = `<span class="reader-category-label">— might delete later #${getNextMdlNumber()}</span> · `;
        } else {
          catLabel = `<span class="reader-category-label">— ${escapeHtml(cat)}</span> · `;
        }
      }
      const htmlBody = dom.canvasBody ? dom.canvasBody.innerHTML : '';
      const readingTime = calcReadingMinutes(htmlBody);

      if (dom.canvasPreviewMeta) {
        dom.canvasPreviewMeta.innerHTML = `${catLabel}<span>${dateStr}</span> · <span>${readingTime} min read</span>`;
      }

      let pTitle = dom.canvasTitle ? dom.canvasTitle.value.trim() : '';
      if (!pTitle && cat) {
        if (cat === 'might delete later') {
          pTitle = `might delete later #${getNextMdlNumber()}`;
        } else if (['nocturnal thoughts', 'rants', 'brain dump'].includes(cat)) {
          const mDay = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          pTitle = `${cat} — ${mDay}`;
        }
      }
      if (dom.canvasPreviewTitle) {
        dom.canvasPreviewTitle.textContent = pTitle || 'Untitled Entry';
      }

      const pSub = dom.canvasSubtitle ? dom.canvasSubtitle.value.trim() : '';
      if (dom.canvasPreviewSubtitle) {
        dom.canvasPreviewSubtitle.textContent = pSub;
        dom.canvasPreviewSubtitle.style.display = pSub ? 'block' : 'none';
      }

      if (dom.canvasPreviewSoundtrack) {
        const tTitle = dom.canvasTrackTitle ? dom.canvasTrackTitle.value.trim() : '';
        const tArtist = dom.canvasTrackArtist ? dom.canvasTrackArtist.value.trim() : '';
        const tUrl = dom.canvasTrackUrl ? dom.canvasTrackUrl.value.trim() : '';
        const tNote = dom.canvasTrackNote ? dom.canvasTrackNote.value.trim() : '';

        if (tTitle || tUrl) {
          dom.canvasPreviewSoundtrack.innerHTML = `
            <div class="song-pill song-pill--preview" style="cursor:default;">
              <span class="pill-icon">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
              </span>
              <span class="pill-title">${escapeHtml(tTitle || 'Soundtrack')}</span>
              ${tArtist ? `<span class="pill-artist">— ${escapeHtml(tArtist)}</span>` : ''}
              ${tNote ? `<span class="pill-note" style="opacity:0.75; font-size:11px; margin-left:4px;">(${escapeHtml(tNote)})</span>` : ''}
            </div>
          `;
          dom.canvasPreviewSoundtrack.style.display = 'block';
        } else {
          dom.canvasPreviewSoundtrack.style.display = 'none';
        }
      }

      if (dom.canvasPreviewBody) {
        dom.canvasPreviewBody.innerHTML = htmlBody || '<p style="color:var(--ink-muted); font-style:italic;">No writing yet…</p>';
      }

      if (dom.canvasScrollBody) dom.canvasScrollBody.scrollTop = 0;
    } else {
      dom.canvasPreviewBtn.textContent = 'Preview';
      dom.canvasPreviewBtn.classList.remove('active');
      dom.canvasEditArea.style.display = 'block';
      dom.canvasPreviewArea.style.display = 'none';
      if (dom.canvasBody) dom.canvasBody.focus();
    }
  }

  function openEditor() {
    selectedCanvasCategory = null;
    isCanvasPreviewActive = false;

    if (dom.canvasTitle) {
      dom.canvasTitle.value = '';
      dom.canvasTitle.placeholder = 'Title';
      dom.canvasTitle.style.height = 'auto';
    }
    if (dom.canvasSubtitle) {
      dom.canvasSubtitle.value = '';
      dom.canvasSubtitle.placeholder = 'Add a subtitle...';
      dom.canvasSubtitle.style.height = 'auto';
    }
    if (dom.canvasBody) {
      dom.canvasBody.innerHTML = '';
    }

    if (dom.canvasTrackUrl) dom.canvasTrackUrl.value = '';
    if (dom.canvasTrackTitle) dom.canvasTrackTitle.value = '';
    if (dom.canvasTrackArtist) dom.canvasTrackArtist.value = '';
    if (dom.canvasTrackNote) dom.canvasTrackNote.value = '';
    if (dom.canvasTrackHint) {
      dom.canvasTrackHint.textContent = 'Auto-fills Song Title and Artist when link is pasted';
      dom.canvasTrackHint.style.color = 'var(--ink-muted)';
    }
    if (dom.canvasSoundtrackStrip) dom.canvasSoundtrackStrip.style.display = 'none';
    if (dom.canvasSoundtrackToggle) dom.canvasSoundtrackToggle.classList.remove('active');

    if (dom.canvasPreviewBtn) {
      dom.canvasPreviewBtn.textContent = 'Preview';
      dom.canvasPreviewBtn.classList.remove('active');
    }
    if (dom.canvasEditArea) dom.canvasEditArea.style.display = 'block';
    if (dom.canvasPreviewArea) dom.canvasPreviewArea.style.display = 'none';

    renderCanvasCategoryTabs();

    dom.editorOverlay.classList.add('open');
    editorOpen = true;
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      if (dom.canvasTitle) dom.canvasTitle.focus();
    }, 200);
  }

  function closeEditor() {
    dom.editorOverlay.classList.remove('open');
    editorOpen = false;
    document.body.style.overflow = '';
  }

  function handleCanvasPublish() {
    let title = dom.canvasTitle ? dom.canvasTitle.value.trim() : '';

    // Smart Blank-Title Fallback
    if (!title) {
      const now = new Date();
      const monthDay = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      if (selectedCanvasCategory === 'might delete later') {
        const nextNum = getNextMdlNumber();
        title = `might delete later #${nextNum}`;
      } else if (selectedCanvasCategory === 'nocturnal thoughts') {
        title = `nocturnal thoughts — ${monthDay}`;
      } else if (selectedCanvasCategory === 'rants') {
        title = `rants — ${monthDay}`;
      } else if (selectedCanvasCategory === 'brain dump') {
        title = `brain dump — ${monthDay}`;
      } else {
        alert('Please enter a title, or pick a Quick Tag (might delete later, nocturnal thoughts, rants, brain dump) for an automatic editorial title.');
        if (isCanvasPreviewActive) toggleCanvasPreview();
        if (dom.canvasTitle) dom.canvasTitle.focus();
        return;
      }
    }

    const tags = selectedCanvasCategory ? [selectedCanvasCategory] : [];

    let soundtrack = null;
    const trackTitle = dom.canvasTrackTitle ? dom.canvasTrackTitle.value.trim() : '';
    const trackArtist = dom.canvasTrackArtist ? dom.canvasTrackArtist.value.trim() : '';
    const trackNote = dom.canvasTrackNote ? dom.canvasTrackNote.value.trim() : '';
    const trackUrl = dom.canvasTrackUrl ? dom.canvasTrackUrl.value.trim() : '';
    if (trackTitle || trackUrl) {
      soundtrack = {
        title: trackTitle || 'Soundtrack',
        artist: trackArtist || 'Unknown Artist',
        note: trackNote || '',
        url: trackUrl || null
      };
    }

    let rawBody = dom.canvasBody ? dom.canvasBody.innerHTML.trim() : '';
    if (!rawBody || rawBody === '<br>') {
      alert('Please write something in your entry before publishing.');
      if (isCanvasPreviewActive) toggleCanvasPreview();
      if (dom.canvasBody) dom.canvasBody.focus();
      return;
    }

    // Wrap plain lines in <p> if missing block markup
    if (!/<(p|h2|h3|blockquote|ul|ol|figure|div)/i.test(rawBody)) {
      rawBody = rawBody.split(/\n{2,}/).map(para => `<p>${para.trim()}</p>`).join('\n\n');
    }

    const readingTime = calcReadingMinutes(rawBody);
    const gradients = Data.coverGradients;
    const coverGradient = gradients[Math.floor(Math.random() * gradients.length)];
    const dateVal = new Date().toISOString().slice(0, 10);

    const entry = {
      title,
      subtitle: dom.canvasSubtitle ? dom.canvasSubtitle.value.trim() : '',
      date: dateVal,
      tags,
      soundtrack,
      song_url: trackUrl || null,
      body: rawBody,
      coverGradient,
      readingTime: readingTime,
      reading_time: readingTime
    };

    const publishBtnSpan = dom.canvasPublishBtn ? dom.canvasPublishBtn.querySelector('span') : null;
    if (dom.canvasPublishBtn) dom.canvasPublishBtn.disabled = true;
    if (publishBtnSpan) publishBtnSpan.textContent = 'Publishing…';

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
    }).finally(() => {
      if (dom.canvasPublishBtn) dom.canvasPublishBtn.disabled = false;
      if (publishBtnSpan) publishBtnSpan.textContent = 'Publish';
    });
  }

  /* ═══════════════════════════════════════
     REAL SONG SOUNDTRACK PLAYER
     ═══════════════════════════════════════ */

  function isTrackPlaying(soundtrack) {
    if (!currentTrack || !soundtrack) return false;
    const urlA = currentTrack.url || '';
    const urlB = soundtrack.url || '';
    if (urlA && urlB && urlA === urlB) {
      if (currentTrack.parsed && currentTrack.parsed.type === 'audio' && dom.directAudioEl) {
        return !dom.directAudioEl.paused;
      }
      return true;
    }
    if (currentTrack.title && soundtrack.title && currentTrack.title === soundtrack.title) {
      return (currentTrack.artist || '') === (soundtrack.artist || '');
    }
    return false;
  }

  function playTrack(soundtrack) {
    if (!soundtrack) return;
    const songUrl = soundtrack.url || '';
    if (!songUrl) {
      showToast('No audio link attached to this soundtrack note.');
      return;
    }

    // Toggle if same track already active
    if (currentTrack && currentTrack.url === songUrl) {
      if (currentTrack.parsed && currentTrack.parsed.type === 'audio' && dom.directAudioEl) {
        if (!dom.directAudioEl.paused) {
          dom.directAudioEl.pause();
          if (dom.miniVinyl) dom.miniVinyl.classList.remove('spinning');
          if (dom.directPlayBtn) dom.directPlayBtn.innerHTML = ICONS.play;
        } else {
          dom.directAudioEl.play().catch(() => {});
          if (dom.miniVinyl) dom.miniVinyl.classList.add('spinning');
          if (dom.directPlayBtn) dom.directPlayBtn.innerHTML = ICONS.pause;
        }
        updateAllSoundtrackPills();
        return;
      } else {
        // Toggle off for iframe track
        stopTrack();
        return;
      }
    }

    const parsed = parseTrackUrl(songUrl);
    if (!parsed) {
      showToast('Could not parse audio link.');
      return;
    }

    currentTrack = {
      title: soundtrack.title || 'Soundtrack',
      artist: soundtrack.artist || 'Unknown Artist',
      note: soundtrack.note || '',
      url: songUrl,
      parsed: parsed
    };

    // Update Header Info
    if (dom.miniTitle) dom.miniTitle.textContent = currentTrack.title;
    if (dom.miniArtist) dom.miniArtist.textContent = currentTrack.artist;
    if (dom.miniSourceBadge) dom.miniSourceBadge.textContent = parsed.platform;

    // Direct Audio vs Iframe Player
    if (parsed.type === 'audio') {
      if (dom.embedIframeBox) {
        dom.embedIframeBox.innerHTML = '';
        dom.embedIframeBox.style.display = 'none';
      }
      if (dom.directAudioBox) dom.directAudioBox.style.display = 'flex';

      if (dom.directAudioEl) {
        dom.directAudioEl.src = parsed.url;
        dom.directAudioEl.volume = dom.miniVolume ? (dom.miniVolume.value / 100) : 0.8;
        dom.directAudioEl.play().then(() => {
          if (dom.directPlayBtn) dom.directPlayBtn.innerHTML = ICONS.pause;
          if (dom.miniVinyl) dom.miniVinyl.classList.add('spinning');
        }).catch(err => {
          console.warn('Direct audio play failed:', err);
          if (dom.directPlayBtn) dom.directPlayBtn.innerHTML = ICONS.play;
        });
      }
    } else {
      // Pause and clear direct audio
      if (dom.directAudioEl) {
        dom.directAudioEl.pause();
        dom.directAudioEl.src = '';
      }
      if (dom.directAudioBox) dom.directAudioBox.style.display = 'none';
      if (dom.embedIframeBox) dom.embedIframeBox.style.display = 'block';

      // Render visible iframe at standard compact dimensions
      let iframeHtml = '';
      if (parsed.type === 'spotify') {
        iframeHtml = `<iframe style="border-radius:12px;border:0;display:block;" src="${escapeHtml(parsed.embedUrl)}" width="100%" height="80" frameborder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
      } else if (parsed.type === 'youtube') {
        iframeHtml = `<iframe width="100%" height="180" src="${escapeHtml(parsed.embedUrl)}" title="${escapeHtml(currentTrack.title)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="border-radius:12px;border:1px solid var(--border);display:block;"></iframe>`;
      } else if (parsed.type === 'soundcloud') {
        iframeHtml = `<iframe width="100%" height="120" scrolling="no" frameborder="no" allow="autoplay" style="border-radius:12px;border:0;display:block;" src="${escapeHtml(parsed.embedUrl)}"></iframe>`;
      } else {
        iframeHtml = `<iframe width="100%" height="120" style="border-radius:12px;border:1px solid var(--border);display:block;" src="${escapeHtml(parsed.embedUrl)}" allow="autoplay"></iframe>`;
      }

      if (dom.embedIframeBox) {
        dom.embedIframeBox.innerHTML = iframeHtml;
      }

      if (dom.miniVinyl) dom.miniVinyl.classList.add('spinning');
    }

    if (dom.miniPlayer) dom.miniPlayer.classList.add('visible');
    updateAllSoundtrackPills();
  }

  function stopTrack() {
    if (dom.directAudioEl) {
      dom.directAudioEl.pause();
      dom.directAudioEl.src = '';
    }
    if (dom.embedIframeBox) {
      dom.embedIframeBox.innerHTML = '';
    }
    if (dom.miniPlayer) dom.miniPlayer.classList.remove('visible');
    if (dom.miniVinyl) dom.miniVinyl.classList.remove('spinning');
    currentTrack = null;
    updateAllSoundtrackPills();
  }

  function toggleTrack(soundtrack) {
    if (isTrackPlaying(soundtrack)) {
      stopTrack();
    } else {
      playTrack(soundtrack);
    }
  }

  function updateAllSoundtrackPills() {
    // Update feed pills
    $$('.song-pill').forEach(pill => {
      let isPlaying = false;
      if (pill.dataset.entryId) {
        const entry = Data.getEntry(pill.dataset.entryId);
        if (entry) {
          const st = entry.soundtrack || {};
          const songUrl = st.url || entry.song_url;
          isPlaying = isTrackPlaying({ ...st, url: songUrl });
        }
      } else if (pill.dataset.track) {
        try {
          const t = JSON.parse(pill.dataset.track);
          isPlaying = isTrackPlaying(t);
        } catch (_) {}
      }
      pill.classList.toggle('playing', isPlaying);
      const iconSpan = pill.querySelector('.pill-icon');
      if (iconSpan) {
        iconSpan.innerHTML = isPlaying ? ICONS.waveform : ICONS.cassette;
      }
    });

    // Update reader controls if reader open
    const readerPlayBtn = $('#reader-play-btn');
    const readerVinyl = $('#reader-vinyl');
    if (readerPlayBtn) {
      let active = false;
      if (readerPlayBtn.dataset.track) {
        try {
          const t = JSON.parse(readerPlayBtn.dataset.track);
          active = isTrackPlaying(t);
        } catch (_) {}
      }
      readerPlayBtn.innerHTML = active ? ICONS.pause : ICONS.play;
      if (readerVinyl) readerVinyl.classList.toggle('spinning', active);
    }
  }

  function initDirectAudioEvents() {
    if (!dom.directAudioEl) return;

    dom.directAudioEl.addEventListener('loadedmetadata', () => {
      if (dom.audioTimeTotal) {
        dom.audioTimeTotal.textContent = formatAudioTime(dom.directAudioEl.duration);
      }
      if (dom.audioScrubber) {
        dom.audioScrubber.max = dom.directAudioEl.duration || 100;
        dom.audioScrubber.value = 0;
      }
    });

    dom.directAudioEl.addEventListener('timeupdate', () => {
      if (dom.audioTimeCurrent) {
        dom.audioTimeCurrent.textContent = formatAudioTime(dom.directAudioEl.currentTime);
      }
      if (dom.audioScrubber && !dom.audioScrubber._dragging) {
        dom.audioScrubber.value = dom.directAudioEl.currentTime;
      }
    });

    dom.directAudioEl.addEventListener('ended', () => {
      if (dom.directPlayBtn) dom.directPlayBtn.innerHTML = ICONS.play;
      if (dom.miniVinyl) dom.miniVinyl.classList.remove('spinning');
      updateAllSoundtrackPills();
    });

    if (dom.directPlayBtn) {
      dom.directPlayBtn.addEventListener('click', () => {
        if (!dom.directAudioEl) return;
        if (dom.directAudioEl.paused) {
          dom.directAudioEl.play().catch(() => {});
          dom.directPlayBtn.innerHTML = ICONS.pause;
          if (dom.miniVinyl) dom.miniVinyl.classList.add('spinning');
        } else {
          dom.directAudioEl.pause();
          dom.directPlayBtn.innerHTML = ICONS.play;
          if (dom.miniVinyl) dom.miniVinyl.classList.remove('spinning');
        }
        updateAllSoundtrackPills();
      });
    }

    if (dom.audioScrubber) {
      dom.audioScrubber.addEventListener('mousedown', () => { dom.audioScrubber._dragging = true; });
      dom.audioScrubber.addEventListener('mouseup', () => { dom.audioScrubber._dragging = false; });
      dom.audioScrubber.addEventListener('input', (e) => {
        if (dom.directAudioEl) {
          dom.directAudioEl.currentTime = Number(e.target.value);
        }
      });
    }

    if (dom.miniVolume) {
      dom.miniVolume.addEventListener('input', (e) => {
        const vol = Number(e.target.value) / 100;
        if (dom.directAudioEl) dom.directAudioEl.volume = vol;
      });
    }
  }

  function initCanvasEvents() {
    // Write Entry button opens canvas
    if (dom.writeBtn) {
      dom.writeBtn.addEventListener('click', openEditor);
    }

    // Topbar back button
    if (dom.canvasBackBtn) {
      dom.canvasBackBtn.addEventListener('click', closeEditor);
    }

    // Undo / Redo
    if (dom.canvasUndoBtn) {
      dom.canvasUndoBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        execCanvasCommand('undo');
      });
    }
    if (dom.canvasRedoBtn) {
      dom.canvasRedoBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        execCanvasCommand('redo');
      });
    }

    // Style dropdown (Body, Heading 2, Heading 3)
    if (dom.canvasFormatBlock) {
      dom.canvasFormatBlock.addEventListener('change', () => {
        const val = dom.canvasFormatBlock.value;
        execCanvasCommand('formatBlock', '<' + val + '>');
      });
    }

    // Direct command buttons (bold, italic, strikeThrough, lists)
    $$('.canvas-format-btn[data-command]').forEach(btn => {
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const cmd = btn.dataset.command;
        execCanvasCommand(cmd);
      });
    });

    // Inline Code
    if (dom.canvasCodeBtn) {
      dom.canvasCodeBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        handleCanvasCode();
      });
    }

    // Matcha Highlight
    if (dom.canvasHighlightBtn) {
      dom.canvasHighlightBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        handleCanvasHighlight();
      });
    }

    // Link
    if (dom.canvasLinkBtn) {
      dom.canvasLinkBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        handleCanvasLink();
      });
    }

    // Image Upload / URL
    if (dom.canvasImageBtn) {
      dom.canvasImageBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (isCanvasPreviewActive) return;
        const choice = confirm('Click OK to upload an image from your device, or Cancel to paste an image URL.');
        if (choice) {
          if (dom.canvasImageInput) dom.canvasImageInput.click();
        } else {
          const url = prompt('Enter image URL:');
          if (url && url.trim()) {
            execCanvasCommand('insertImage', url.trim());
          }
        }
      });
    }

    if (dom.canvasImageInput) {
      dom.canvasImageInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          execCanvasCommand('insertImage', event.target.result);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
      });
    }

    // Soundtrack toggle & remove
    if (dom.canvasSoundtrackToggle) {
      dom.canvasSoundtrackToggle.addEventListener('click', (e) => {
        e.preventDefault();
        toggleSoundtrackStrip();
      });
    }
    if (dom.canvasSoundtrackClose) {
      dom.canvasSoundtrackClose.addEventListener('click', (e) => {
        e.preventDefault();
        removeSoundtrackStrip();
      });
    }

    // Blockquote
    if (dom.canvasQuoteBtn) {
      dom.canvasQuoteBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        execCanvasCommand('formatBlock', '<blockquote>');
      });
    }

    // Section Divider
    if (dom.canvasHrBtn) {
      dom.canvasHrBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        execCanvasCommand('insertHorizontalRule');
      });
    }

    // Preview button
    if (dom.canvasPreviewBtn) {
      dom.canvasPreviewBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleCanvasPreview();
      });
    }

    // Publish button
    if (dom.canvasPublishBtn) {
      dom.canvasPublishBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleCanvasPublish();
      });
    }

    // Auto-grow textareas
    if (dom.canvasTitle) {
      dom.canvasTitle.addEventListener('input', () => autoGrowTextarea(dom.canvasTitle));
    }
    if (dom.canvasSubtitle) {
      dom.canvasSubtitle.addEventListener('input', () => autoGrowTextarea(dom.canvasSubtitle));
    }

    // Category Tabs click
    if (dom.canvasCategoryTabs) {
      dom.canvasCategoryTabs.addEventListener('click', (e) => {
        const tab = e.target.closest('.canvas-category-tab');
        if (!tab) return;
        const cat = tab.dataset.category;
        if (selectedCanvasCategory === cat) {
          selectedCanvasCategory = null;
        } else {
          selectedCanvasCategory = cat;
        }
        renderCanvasCategoryTabs();
      });
    }

    // Soundtrack URL auto-fill
    if (dom.canvasTrackUrl) {
      dom.canvasTrackUrl.addEventListener('blur', handleCanvasSongUrlAutoFill);
      dom.canvasTrackUrl.addEventListener('change', handleCanvasSongUrlAutoFill);
      dom.canvasTrackUrl.addEventListener('paste', () => {
        setTimeout(handleCanvasSongUrlAutoFill, 80);
      });
    }
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

    // Editorial Substack Canvas
    initCanvasEvents();

    // Status modal
    dom.editStatusBtn.addEventListener('click', openStatusModal);
    $('#status-modal-cancel').addEventListener('click', closeStatusModal);
    $('#status-modal-save').addEventListener('click', saveStatus);
    dom.statusModal.addEventListener('click', (e) => {
      if (e.target === dom.statusModal) closeStatusModal();
    });

    // Mini player & direct audio
    if (dom.miniCloseBtn) {
      dom.miniCloseBtn.addEventListener('click', stopTrack);
    }
    initDirectAudioEvents();

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

    // "Currently" music click → play track if link available or display toast
    dom.currentlyItems.addEventListener('click', (e) => {
      const playEl = e.target.closest('#currently-play');
      if (playEl) {
        const url = playEl.dataset.url;
        if (url) {
          const parsed = parseTrackUrl(url);
          if (parsed) {
            toggleTrack({
              title: playEl.dataset.title || 'On Repeat',
              artist: playEl.dataset.artist || 'Zee’s Playlist',
              url: url
            });
          } else {
            window.open(url, '_blank', 'noopener,noreferrer');
          }
        } else {
          showToast(`Soundtrack note: ${playEl.dataset.title || 'Where’s My Love'} — ${playEl.dataset.artist || 'SYML'}`);
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
