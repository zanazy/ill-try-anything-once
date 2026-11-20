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
    crafting:     'Chunky knit pouch with sage yarn',
    daydreaming:  'Quiet greenhouse afternoons & sunlit ceramic cups',
    lastfmUser:   '',
    lastfmApiKey: ''
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

  /* ── Seed entries ── */
  const seedEntries = [
    {
      id: 'entry-mdl-001',
      title: 'might delete later #01',
      subtitle: 'half-formed thoughts on keramik & coffee mugs at 1:40 AM',
      date: '2026-11-18',
      tags: ['might delete later', 'brain dump'],
      readingTime: 3,
      coverGradient: coverGradients[3],
      soundtrack: {
        title: 'midnight tape hiss',
        artist: 'Quiet Bedroom Tape Recording',
        note: 'Just the ceiling fan and a soft electric piano loop while trying to fall asleep.',
        type: 'synth',
        preset: 'lofiPiano'
      },
      body: `<p>I keep looking at this handmade ceramic mug I picked up at a weekend pottery pop-up. It’s slightly lopsided. The rim isn’t a true circle—if you put a caliper to it, you’d probably find an 8mm variance across the diameter. In my first-year ergonomics class, that would have gotten me a polite lecture on user safety and lip seal.</p>

<p>Yet it’s the only mug in my room that I reach for every single morning. Your thumb finds the small thumbprint depression where the potter held it before bisque firing. It’s not an ergonomic feature designed in CAD; it’s just the trace of someone’s hand saying <em>I was here, I shaped this, and then I moved on.</em></p>

<blockquote>Maybe good design isn't about eliminating human friction, but choosing which human marks are worth preserving.</blockquote>

<p>I’m writing this on my phone with the brightness cranked down to minimum because the hallway light is buzzing again. Tomorrow morning I’ll probably wake up, look at this draft, cringe at how earnest it sounds, and want to hit delete. But tonight it feels true enough to keep for at least twenty-four hours.</p>`,
      createdAt: '2026-11-18T01:40:00+07:00'
    },

    {
      id: 'entry-001',
      title: 'Sunday Yarn & Sunbeams in the Park',
      subtitle: 'On the quiet luxury of doing nothing productive on a sunlit afternoon',
      date: '2026-11-16',
      tags: ['slow afternoons', 'tiny wins'],
      readingTime: 6,
      coverGradient: coverGradients[0],
      soundtrack: {
        title: 'Daydream',
        artist: 'Miki Matsubara (Lo-Fi Edit)',
        note: 'This one lives in the golden-hour part of my brain — warm, unhurried, slightly nostalgic. Perfect for sitting cross-legged with yarn.',
        type: 'synth',
        preset: 'warmRhodes'
      },
      body: `<p>There's a bench in the park where the afternoon light comes through the canopy just right — not too bright, not too dappled, just this warm amber wash that makes everything look like it was shot on expired Kodak Gold. I've claimed it as mine every Sunday for the past month.</p>

<p>I bring the knitting bag. The chunky wool, the bamboo needles Mama gave me (they smell like her sewing room back home), and whatever I'm reading that week. Today it's just the yarn and the light and the quiet hum of the park doing its thing around me.</p>

<blockquote>There's something radical about making something with your hands when every tool you use professionally lives on a screen. The yarn doesn't have an undo button. Every stitch is a small commitment.</blockquote>

<p>I've been thinking about this a lot lately — how my design thesis is all about generative systems and cultural memory in digital spaces, but my weekends are increasingly analog. It's not a contradiction. I think the hands remember things the cursor doesn't. When I knit, I'm processing. The repetitive motion is meditative, yes, but it's also computational in its own way. Loop, pull, loop, pull. Pattern recognition made physical.</p>

<p>A kid ran past chasing a cat — orange and white, like Jeruk back home — and I lost count of my stitches. Had to unravel two rows. I didn't mind. That's part of the practice. In design school they teach you to iterate, but iteration on screen feels clinical. Unraveling yarn feels forgiving. The material holds no grudge.</p>

<p>The pouch is coming along. It's chunky, a bit uneven, definitely not Pinterest-worthy. But it'll hold my earbuds and maybe a lip balm, and every time I use it I'll remember this specific quality of November light, the way the breeze moved through the bamboo stand behind the bench, the distant sound of someone practicing guitar badly and beautifully at the same time.</p>

<p>I packed up when the light turned that particular shade of pre-sunset violet. Walked home with the yarn trailing slightly from my bag. A neighbor smiled at me. I smiled back. Some Sundays are just for collecting these small, warm, unhurried moments and carrying them gently into the week ahead.</p>`,
      createdAt: '2026-11-16T14:30:00+07:00'
    },

    {
      id: 'entry-nocturnal-001',
      title: 'nocturnal thoughts — Nov 14',
      subtitle: 'The particular indigo of the city after the street stalls pack up',
      date: '2026-11-14',
      tags: ['nocturnal thoughts'],
      readingTime: 4,
      coverGradient: coverGradients[4],
      soundtrack: {
        title: 'Night Indigo',
        artist: 'Quiet Rhodes Ambience',
        note: 'The neighborhood settles down after midnight. This is the background tone.',
        type: 'synth',
        preset: 'warmRhodes'
      },
      body: `<p>There’s a ten-minute window around 1:30 AM when the neighborhood suddenly drops its volume by about twenty decibels. The last motorbike has rattled down the main road, the food cart on the corner has extinguished its stove with a hiss of steam, and the city turns that deep, mineral slate-blue that doesn’t exist anywhere on an sRGB swatch.</p>

<p>In design school, we talk endlessly about visual hierarchy—what demands your eye first, how contrast guides behavior. But night in this city has no hierarchy. Everything bleeds together into silhouettes: laundry drying on balcony rails, telephone wires sagging under the weight of old wet rain, the neon cross of the pharmacy casting a faint mint haze over the street puddle.</p>

<blockquote>At night, the city stops performing for anyone. It just breathes.</blockquote>

<p>I left my sketchbook open on the floor next to my mattress. The ceiling fan is drawing lazy circles in the warm humid air. Jeruk is probably asleep on the foot of my bed back home right now, curled like a comma on my old fleece blanket. I miss the quiet chill tonight, but there’s a peaceful companionship in knowing that countless other people are also staring at their ceilings, waiting for their minds to quiet down.</p>`,
      createdAt: '2026-11-14T01:30:00+07:00'
    },

    {
      id: 'entry-rants-001',
      title: 'rants — bad cafe typography',
      subtitle: 'Why is every third coffee shop stretching neo-grotesque type to within an inch of its life?',
      date: '2026-11-12',
      tags: ['rants', 'field notes'],
      readingTime: 4,
      coverGradient: coverGradients[5],
      soundtrack: {
        title: 'Coffee Shop Static',
        artist: 'Vinyl & Drizzle',
        note: 'Espresso machine hiss and rain outside the window.',
        type: 'synth',
        preset: 'rainCrackle'
      },
      body: `<p>I am begging trendy coffee shop owners to confiscate Illustrator’s transform tool from whoever designed their menu boards. Please. I am on my knees in front of this acrylic counter.</p>

<p>There is a specific epidemic happening in minimalist coffee shops. A venue will spend eighty million on Danish oak chairs, exposed concrete walls textured with artisanal plaster, and a custom espresso machine that costs more than my annual tuition. And then—right above the counter where you place your order—they slap up a laser-cut sign set in Helvetica or Neue Haas Grotesk that has been horizontally stretched by approximately 140%.</p>

<blockquote>Every time a designer horizontally scales a typeface instead of choosing an actual extended cut, a typographer’s soul gets trapped in a raster grid.</blockquote>

<p>The stems get thicker on the horizontals than the verticals. The O becomes an awkward squashed egg. The kerning between the 'r' and the 'y' in 'Pastry' looks like a canyon. Why do we obsess over the micro-origin of single-estate beans, but treat the letters that describe them like elastic bands to be pulled until they snap?</p>

<p>I drank my flat white in mild silent protest. The coffee was excellent, which almost made me angrier. Great coffee deserves letters that have dignity.</p>`,
      createdAt: '2026-11-12T16:20:00+07:00'
    },

    {
      id: 'entry-002',
      title: 'Notes on Cultural Memory & Generative AI',
      subtitle: 'Fragments from my thesis notebook — what happens when machines dream from our visual archive?',
      date: '2026-11-10',
      tags: ['field notes', 'brain dump'],
      readingTime: 8,
      coverGradient: coverGradients[1],
      soundtrack: {
        title: 'Quiet Study',
        artist: 'Ambient Piano Loop',
        note: 'I write my thesis notes to this kind of sound — just enough texture to keep the silence from becoming loud, not enough melody to distract.',
        type: 'synth',
        preset: 'lofiPiano'
      },
      body: `<p>My thesis advisor asked me a question last Tuesday that I still haven't stopped turning over: "When a generative model produces an image that references traditional patterns, whose memory is it drawing from?" I wrote it on a sticky note and put it on my bedroom wall next to thirty other sticky notes. The wall is becoming its own generative system.</p>

<p>Here's what I'm circling around: cultural memory isn't just what we remember. It's the visual, sonic, tactile residue of lived experience, passed through generations, embedded in craft, in architecture, in the way a corner warung arranges its sign. When a diffusion model is trained on millions of images scraped from the internet, it absorbs all of this — but flattened. Decontextualized. The pattern becomes a "style" divorced from the hands that made it, the ceremonies it was made for, the specific indigo that comes from specific plants grown in specific soil.</p>

<blockquote>I keep returning to this metaphor: generative AI doesn't remember. It pattern-matches. And there's a profound difference between memory and pattern-matching, even when the outputs look identical.</blockquote>

<p>I've been collecting examples. Last week I prompted three different models to generate "traditional textile design." The results were technically competent — recognizable motifs, pleasing compositions. But there was something uncanny about them. Like someone describing a dream of textile rather than the cloth itself. The motif was there but the rhythm was wrong. The spacing felt algorithmic rather than gestural.</p>

<p>My friend Dika, who studies anthropology, says I'm romanticizing human craft. "Traditional makers also follow patterns," she argues. "They also replicate." She's right, technically. But I think there's something in the replication-with-variation that human hands produce — the slight wobble of the tool, the way the dye bleeds differently depending on humidity — that constitutes a kind of knowledge. Embodied knowledge. The kind that lives in muscle memory and can't be fully captured in a training dataset.</p>

<p>For my thesis project, I'm building a visual essay — part interactive website, part printed zine — that places AI-generated interpretations of visual culture alongside their source traditions. Not to condemn the AI, but to make visible what gets lost in translation. The gap between pattern and memory. The ghost in the machine's output.</p>

<p>I think the most interesting design question of our generation isn't "can AI make beautiful things?" — it obviously can. It's "what do we lose when beauty becomes statistically optimized?" And maybe more importantly: "what do we choose to keep making by hand, and why?"</p>

<p>The sticky note wall grows. The thesis deadline approaches. The questions get better even as the answers stay elusive. I think that might be the point.</p>`,
      createdAt: '2026-11-10T21:15:00+07:00'
    },

    {
      id: 'entry-003',
      title: 'Commuter Line Windows on the Way Home',
      subtitle: 'Transit thoughts from the train — on the particular beauty of going-between',
      date: '2026-11-03',
      tags: ['field notes', 'slow afternoons'],
      readingTime: 7,
      coverGradient: coverGradients[2],
      soundtrack: {
        title: 'Rain on Glass',
        artist: 'Ambient Train Recording',
        note: 'The train in the rain is its own kind of music. I recorded this on my phone once — raindrops on the window mixed with the rhythm. This synth version gets close.',
        type: 'synth',
        preset: 'rainCrackle'
      },
      body: `<p>The 15:42 afternoon train is my favorite. Not because of the timing — it's the tail end of the lunch rush, still crowded enough that you have to stand — but because of the light. By the time the train clears the junction and starts the long crawl, the afternoon sun hits the windows at this low angle that turns everything inside the carriage golden. Even the scratched acrylic windows become beautiful. Even the ads glow.</p>

<p>I make this trip every other week. Commuter line to home — or maybe home to home, since I'm not sure anymore which place holds that title. My little studio room has my desk, my laptop, my ongoing projects. My room back home has my cat, Jeruk, my mother's cooking, and the particular quality of quiet that comes from being slightly removed from the center of things.</p>

<blockquote>The commuter line is a liminal space and I mean that without any of the internet's irony. It is genuinely a space between identities, between responsibilities, between versions of myself. On the train, I am neither the design student nor the daughter. I'm just someone looking out a window.</blockquote>

<p>Today it's raining. The windows are streaked and the world outside becomes impressionist — all blurred light and moving color. A woman next to me is sleeping with her head against the window, and each raindrop that hits the glass near her temple seems impossibly gentle, as though the weather is being careful with her.</p>

<p>I've started keeping a transit sketchbook. Not drawings, really — more like texture studies. I'll spend the whole ride capturing the pattern of a fellow passenger's shirt, or the way rust blooms on the overhead handrail brackets, or the specific typography of station signage (station signage uses this condensed sans-serif that feels very nostalgic; I find it endearing). My Visual Communication professors would probably call this "field research." I just call it paying attention.</p>

<p>The train stops. Half the carriage empties and I finally get a seat. The rain has stopped and the late afternoon is doing that thing where the sky can't decide between gray and gold. Through the window I watch a kid on an overpass wave at the train. I wave back even though he definitely can't see me through the tinted glass. Some gestures are worth making regardless of whether they're received.</p>

<p>A few more stops to go. I put in my earbuds, press play on the lo-fi rain playlist I've been curating, and open my knitting bag. The yarn is a soft mossy green. The train rocks gently. The needles click. The world slides past like a film I've seen many times but keep finding new details in.</p>

<p>By the time we pull into the station, the sky is properly dark and the yarn pouch has grown two more inches. Jeruk will be waiting by the door. Some journeys are about the destination. This one has always been about the going.</p>`,
      createdAt: '2026-11-03T16:45:00+07:00'
    }
  ];

  /* ── Storage helpers ── */

  function loadEntries() {
    // Respect statically published posts (from posts.js) when available
    const activeSeed = (typeof window !== 'undefined' && window.ZLOG_POSTS && Array.isArray(window.ZLOG_POSTS) && window.ZLOG_POSTS.length > 0)
      ? window.ZLOG_POSTS
      : seedEntries;

    try {
      const raw = localStorage.getItem(ENTRIES_KEY);
      if (raw) {
        let stored = JSON.parse(raw);

        // Sanitize: remove any legacy location field and sync clean location-free starter entries
        let modified = false;
        const seedMap = new Map(activeSeed.map(s => [s.id, s]));

        stored.forEach(e => {
          if ('location' in e) {
            delete e.location;
            modified = true;
          }
          // If this is a starter/published entry, sync its clean location-free text and botanical art
          if (seedMap.has(e.id)) {
            const seed = seedMap.get(e.id);
            e.title = seed.title;
            e.subtitle = seed.subtitle;
            e.body = seed.body;
            e.soundtrack = seed.soundtrack;
            e.coverGradient = seed.coverGradient;
            modified = true;
          } else {
            // For custom entries, sanitize any location mentions
            if (e.body && (e.body.includes('Palmerah') || e.body.includes('Cimahi') || e.body.includes('Taman Langsat') || e.body.includes('Jakarta'))) {
              e.body = e.body.replace(/Palmerah/g, 'my neighborhood')
                             .replace(/Cimahi/g, 'back home')
                             .replace(/Jakarta/g, 'the city')
                             .replace(/Taman Langsat/g, 'the park');
              modified = true;
            }
          }
        });

        // Ensure all published entries from activeSeed exist in stored
        const existingIds = new Set(stored.map(e => e.id));
        const missingFromSeed = activeSeed.filter(s => !existingIds.has(s.id));
        if (missingFromSeed.length > 0) {
          stored = [...stored, ...missingFromSeed];
          stored.sort((a, b) => {
            const timeA = new Date(a.date ? `${a.date}T00:00:00` : (a.createdAt || 0)).getTime();
            const timeB = new Date(b.date ? `${b.date}T00:00:00` : (b.createdAt || 0)).getTime();
            return timeB - timeA;
          });
          modified = true;
        }

        if (modified) {
          saveEntries(stored);
        }
        return stored;
      }
    } catch (e) { console.warn('ZLog: failed to load entries', e); }
    // First run — seed from published posts
    saveEntries(activeSeed);
    return [...activeSeed];
  }

  function saveEntries(entries) {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
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
        if ('location' in parsed) {
          delete parsed.location;
          changed = true;
        }
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
      soundtrack = typeof row.soundtrack === 'string' ? JSON.parse(row.soundtrack) : row.soundtrack;
    }
    let tags = [];
    if (Array.isArray(row.tags)) {
      tags = row.tags;
    } else if (typeof row.tags === 'string') {
      try { tags = JSON.parse(row.tags); } catch (e) { tags = [row.tags]; }
    }
    return {
      id: String(row.id),
      title: row.title || '',
      subtitle: row.subtitle || '',
      date: row.date || (row.created_at ? row.created_at.slice(0, 10) : ''),
      tags: tags,
      readingTime: row.reading_time || row.readingTime || 3,
      coverGradient: row.cover_gradient || row.coverGradient || null,
      soundtrack: soundtrack,
      body: row.body || '',
      createdAt: row.created_at || row.createdAt || new Date().toISOString()
    };
  }

  async function fetchLivePosts() {
    const sb = getSupabase();
    if (!sb) {
      return { posts: loadEntries(), fromDb: false, empty: false, error: 'No Supabase client' };
    }
    try {
      const { data, error } = await sb
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('ZLog: Supabase fetch posts warning:', error.message);
        return { posts: loadEntries(), fromDb: false, empty: false, error: error.message };
      }

      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map(mapPostRow).filter(Boolean);
        saveEntries(mapped);
        return { posts: mapped, fromDb: true, empty: false, error: null };
      } else {
        // Table exists but has 0 posts
        return { posts: loadEntries(), fromDb: true, empty: true, error: null };
      }
    } catch (err) {
      console.warn('ZLog: Supabase fetch posts error (offline):', err);
      return { posts: loadEntries(), fromDb: false, empty: false, error: err.message };
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
          crafting:    data.crafting || currentLocal.crafting || defaultStatus.crafting,
          daydreaming: data.daydreaming || currentLocal.daydreaming || defaultStatus.daydreaming,
          lastfmUser:  data.lastfm_user || data.lastfmUser || currentLocal.lastfmUser || '',
          lastfmApiKey:data.lastfm_key || data.lastfmApiKey || currentLocal.lastfmApiKey || ''
        };
        saveStatus(merged);
        if (merged.lastfmUser || merged.lastfmApiKey) {
          saveLastFm({ username: merged.lastfmUser, apiKey: merged.lastfmApiKey });
        }
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
        reading:     newStatus.reading || '',
        on_repeat:   newStatus.onRepeat || '',
        crafting:    newStatus.crafting || '',
        lastfm_user: newStatus.lastfmUser || '',
        lastfm_key:  newStatus.lastfmApiKey || ''
      };
      const { error } = await sb.from('site_status').upsert(row);
      if (error) {
        console.warn('ZLog: Supabase site_status upsert warning:', error.message);
      }
    } catch (err) {
      console.warn('ZLog: Supabase site_status save error:', err);
    }
  }

  async function insertLivePost(entry) {
    const sb = getSupabase();
    if (!sb) {
      return addEntry(entry);
    }

    const row = {
      title: entry.title,
      subtitle: entry.subtitle || '',
      date: entry.date,
      tags: entry.tags || [],
      reading_time: entry.readingTime || 1,
      cover_gradient: entry.coverGradient || null,
      soundtrack: entry.soundtrack || null,
      body: entry.body || '',
      created_at: entry.createdAt || new Date().toISOString()
    };

    const { data, error } = await sb.from('posts').insert([row]).select();
    if (error) {
      console.error('ZLog: Supabase insert post error:', error);
      throw error;
    }
    const created = data && data[0] ? mapPostRow(data[0]) : entry;
    const current = loadEntries();
    current.unshift(created);
    saveEntries(current);
    return created;
  }

  async function deleteLivePost(id) {
    const sb = getSupabase();
    if (sb) {
      try {
        const { error } = await sb.from('posts').delete().eq('id', id);
        if (error) {
          console.warn('ZLog: Supabase delete post warning:', error.message);
        }
      } catch (err) {
        console.warn('ZLog: Supabase delete error:', err);
      }
    }
    deleteEntry(id);
  }

  async function seedStarterEntries() {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase client not initialized');

    const rows = seedEntries.map(e => ({
      title: e.title,
      subtitle: e.subtitle || '',
      date: e.date,
      tags: e.tags || [],
      reading_time: e.readingTime || 3,
      cover_gradient: e.coverGradient || null,
      soundtrack: e.soundtrack || null,
      body: e.body || '',
      created_at: e.createdAt || new Date().toISOString()
    }));

    const { data, error } = await sb.from('posts').insert(rows).select();
    if (error) {
      console.error('ZLog: Supabase seed error:', error);
      throw error;
    }
    return data;
  }

  /* ── Supabase Auth ── */

  async function getAuthSession() {
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
    if (!sb) throw new Error('Supabase client not available. Check network.');
    const { data, error } = await sb.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });
    if (error) throw error;
    setAuthorMode(true);
    return data;
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
    deleteLivePost,
    seedStarterEntries,
    getAuthSession,
    signInAuthor,
    signOutAuthor,
    loadEntries,
    saveEntries,
    addEntry,
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
