// ==UserScript==
// @name         sea-zag
// @namespace    sea-zag
// @version      0.7.0-pre.71
// @description  Draws a bathymetric sea between the zig-zag.fm archipelagos: depth = distance from land, terrain = layered noise, rendered tile-aligned behind the map.
// @match        https://www.zig-zag.fm/*
// @grant        none
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/rich0664/sea-zag/pre-release/dist/sea-zag.user.js
// @downloadURL  https://raw.githubusercontent.com/rich0664/sea-zag/pre-release/dist/sea-zag.user.js
// ==/UserScript==

(() => {
const seaConsts = {"version":"0.7.0-pre.71","assetVersion":"2026-11-17a","whaleVersion":"1","assetBase":"https://raw.githubusercontent.com/rich0664/sea-zag/pre-release/dist","map":{"id":64,"stamp":"2026-11-01T22-21-31Z","w":7749,"h":5254},"pipelineStamp":"fb94ef28e9d3","distMax":600,"alongScale":1.03,"heightLo":0.1606,"heightHi":1,"auxScale":2,"flowCell":16,"speedCell":4,"backingCap":2560,"baseline":{"shore":16,"shelf":26,"flow":3.7,"wave":2.5,"spec":0.035,"specPow":14.5,"specMode":2,"specSize":0.76,"specInvert":0.02,"specFloor":0.3,"grain":0.04,"foam":0.25,"deep":0.6,"swell":0.008,"adir":254,"aspeed":1.42,"ascale":0.156,"bdir":45,"bspeed":1.16,"bscale":0.046,"par":0.78,"pom":5,"dslow":0.91,"win":0.58,"wout":0.82,"cycle":7,"warp":2.1,"wbias":1,"deflect":1,"deflectReach":50},"curves":{"pc":[0,0.187,0.339,0.578,1],"sc":[0,0.057,0.274,0.492,0.926],"wc":[0,0.187,0.426,0.594,1]},"meshVersion":"4"};

/* ---- sea-core.js ---- */
const MODE_IDS = ['baseline', 'medium', 'low', 'extra-low', 'static'];



const FRAME_CAPS = [0, 60, 30];



const BACKGROUND_MS = 2000;




const MIN_TEXTURE_SIZE = 8192;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function shaderCapable(webgl2, maxTextureSize) {
  return !!webgl2 && Number(maxTextureSize) >= MIN_TEXTURE_SIZE;
}




const SNAP_AT = 100;
const SNAP_WINDOW = 2;



function snapTo(v, targets, window = SNAP_WINDOW) {
  const at = targets && targets.length ? targets[0] : SNAP_AT;
  if (v === null || v === undefined || v === '') return at;
  const n = Number(v);
  if (!isFinite(n)) return at;
  for (const t of targets) if (Math.abs(n - t) <= window) return t;
  return n;
}

function snapPercent(v, at = SNAP_AT, window = SNAP_WINDOW) {
  return snapTo(v, [at], window);
}





function bezierEase(x1, y1, x2, y2) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const curveX = t => ((ax * t + bx) * t + cx) * t;
  const curveY = t => ((ay * t + by) * t + cy) * t;
  const slopeX = t => (3 * ax * t + 2 * bx) * t + cx;
  return x => {
    const p = Math.min(1, Math.max(0, Number(x) || 0));
    if (p === 0 || p === 1) return p;
    let t = p;
    for (let i = 0; i < 6; i++) {
      const dx = curveX(t) - p;
      if (Math.abs(dx) < 1e-5) return curveY(t);
      const d = slopeX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= dx / d;
    }
    
    let lo = 0;
    let hi = 1;
    t = p;
    for (let i = 0; i < 20; i++) {
      const v = curveX(t);
      if (Math.abs(v - p) < 1e-5) break;
      if (v < p) lo = t; else hi = t;
      t = (lo + hi) / 2;
    }
    return curveY(t);
  };
}





const OCEAN_LAYER_RE = /(^|\/)ocean-depth$/;

function isPirateOceanLayer(layer) {
  const id = layer && layer.id;
  return typeof id === 'string' && OCEAN_LAYER_RE.test(id);
}




function withoutPirateOcean(layers) {
  if (!Array.isArray(layers)) return layers;
  const kept = layers.filter(l => !isPirateOceanLayer(l));
  return kept.length === layers.length ? layers : kept;
}




const UPDATE_CHECK_MS = 15 * 60 * 1000;

function parseScriptVersion(text) {
  const m = /^\/\/\s*@version\s+(\S+)/m.exec(String(text || ''));
  return m ? m[1] : null;
}





function versionParts(v) {
  const m = /^(\d+(?:\.\d+)*)(?:-([0-9A-Za-z.-]+))?$/.exec(String(v ?? '').trim());
  if (!m) return null;
  return {
    nums: m[1].split('.').map(Number),
    pre: m[2] ? m[2].split('.') : null,
  };
}

function compareVersions(a, b) {
  const pa = versionParts(a);
  const pb = versionParts(b);
  if (!pa || !pb) return 0;
  const n = Math.max(pa.nums.length, pb.nums.length);
  for (let i = 0; i < n; i++) {
    const d = (pa.nums[i] || 0) - (pb.nums[i] || 0);
    if (d) return d > 0 ? 1 : -1;
  }
  if (!pa.pre && !pb.pre) return 0;
  if (!pa.pre) return 1;             
  if (!pb.pre) return -1;
  const m = Math.max(pa.pre.length, pb.pre.length);
  for (let i = 0; i < m; i++) {
    const x = pa.pre[i];
    const y = pb.pre[i];
    if (x === undefined) return -1;
    if (y === undefined) return 1;
    const nx = Number(x);
    const ny = Number(y);
    if (isFinite(nx) && isFinite(ny)) {
      if (nx !== ny) return nx > ny ? 1 : -1;
    } else if (x !== y) {
      return x > y ? 1 : -1;
    }
  }
  return 0;
}

const isNewer = (remote, local) => compareVersions(remote, local) > 0;



function num(raw, fallback) {
  if (raw === null || raw === undefined || raw === '') return fallback;
  const v = Number(raw);
  return isFinite(v) ? v : fallback;
}





function modeSettings(id) {
  if (!MODE_IDS.includes(id)) throw new Error(`unknown sea mode: ${id}`);
  if (id === 'static') {
    return { shader: false, renderScale: 1, uniforms: null, defines: null };
  }

  const uniforms = {
    ...seaConsts.baseline,
    flowMode: 1,        
    noiseLayers: 2,
    travelMax: 0,
    snap: 1,
  };
  const defines = {};   
  if (id !== 'baseline') {
    uniforms.par = 0;
    uniforms.pom = 1;
    defines.HAS_PARALLAX = 0;   
  }
  if (id === 'low' || id === 'extra-low') {
    uniforms.warp = 0;
    uniforms.flowMode = 0;
    uniforms.noiseLayers = 1;
    
    
    defines.HAS_WARP = 0;       
    defines.NOISE_LAYERS = 1;
    defines.FLOW_LOD = 0;       
  }
  return {
    shader: true, renderScale: id === 'extra-low' ? 0.5 : 1, uniforms, defines,
  };
}




const TEX_BYTES = { colour: 4, dist: 1, aux: 3, flow: 3, speed: 1 };
const CURVE_BYTES = 3 * 128 * 4;




function vramBytes(sizes) {
  let bytes = CURVE_BYTES;
  for (const [key, perTexel] of Object.entries(TEX_BYTES)) {
    const s = sizes && sizes[key];
    if (!s) continue;
    bytes += Number(s[0]) * Number(s[1]) * perTexel;
  }
  return bytes;
}



function pickMode(saved, env) {
  if (MODE_IDS.includes(saved)) return saved;
  return shaderCapable(env.webgl2, env.maxTextureSize) &&
    !env.coarsePointer && !env.narrow
    ? 'baseline'
    : 'static';
}

function parseState(raw) {
  const r = raw || {};
  return {
    mode: MODE_IDS.includes(r.mode) ? r.mode : '',
    on: !(r.on === false || r.on === '0' || r.on === 'false'),
    opacity: clamp(num(r.opacity, 1), 0, 1),
    
    brightness: clamp(num(r.brightness, 110) / 100, 0.5, 1.5),
    
    hue: clamp(num(r.hue, 0), -180, 180),
    sat: clamp(num(r.sat, 100), 0, 120),
    
    fps30: !(r.fps30 === false || r.fps30 === '0' || r.fps30 === 'false'),
    
    frameCap: FRAME_CAPS.includes(Number(r.frameCap)) ? Number(r.frameCap) : 0,
    
    staticWhenHidden:
      !(r.staticWhenHidden === false || r.staticWhenHidden === '0' ||
        r.staticWhenHidden === 'false'),
  };
}

function renderSize(cssW, cssH, dpr, renderScale) {
  const k = Math.min(1, seaConsts.backingCap / Math.max(cssW * dpr, cssH * dpr));
  const w = Math.max(1, Math.round(cssW * dpr * k * renderScale));
  const h = Math.max(1, Math.round(cssH * dpr * k * renderScale));
  return { w, h, scale: w / cssW };
}



function cameraUniforms(vs, cssW, cssH, backingW, backingH) {
  const pad = vs.padding || {};
  const dx = clamp(((pad.left || 0) + cssW - (pad.right || 0)) / 2, 0, cssW) - cssW / 2;
  const dy = clamp(((pad.top || 0) + cssH - (pad.bottom || 0)) / 2, 0, cssH) - cssH / 2;
  const scale = backingW / cssW;
  return {
    zoomPx: 2 ** vs.zoom * scale,
    centerX: (cssW / 2 + dx) * scale,
    
    
    centerY: backingH - (cssH / 2 + dy) * scale,
    viewW: backingW,
    viewH: backingH,
  };
}







function frameInterval(adaptive, moving, cap) {
  const capMs = Number(cap) > 0 ? 1000 / Number(cap) : 0;
  const idleMs = adaptive && !moving ? 1000 / 30 : 0;
  return Math.max(capMs, idleMs);
}



function fpsGate(now, nextAt, adaptive, moving, cap) {
  const interval = frameInterval(adaptive, moving, cap);
  if (!interval) {
    
    
    return { draw: true, nextAt: adaptive && moving ? 0 : nextAt };
  }
  const draw = now >= nextAt - 1;
  return { draw, nextAt: draw ? now + interval : nextAt };
}



function backgroundDue(awaySince, now, threshold = BACKGROUND_MS) {
  return awaySince > 0 && now - awaySince >= threshold;
}






const INTRO_REVEAL_MS = 3600;
const INTRO_WAVE_AT = 0.95;        
const INTRO_WAVE_START_MS = 3150;  
const INTRO_WAVE_MS = 2000;
const INTRO_TOTAL_MS = INTRO_WAVE_START_MS + INTRO_WAVE_MS;

const smoothstep = x => x * x * (3 - 2 * x);


function introRampsAt(elapsedMs) {
  const t = Math.max(0, Number(elapsedMs) || 0);
  return {
    reveal: smoothstep(clamp(t / INTRO_REVEAL_MS, 0, 1)),
    wave: smoothstep(clamp((t - INTRO_WAVE_START_MS) / INTRO_WAVE_MS, 0, 1)),
    grain: clamp(t / INTRO_TOTAL_MS, 0, 1),
    flow: clamp(t / INTRO_TOTAL_MS, 0, 1),
  };
}

function assetUrl(name, base = seaConsts.assetBase,
  version = seaConsts.assetVersion ?? seaConsts.version, versionDir = false) {
  return versionDir ? `${base}/assets/${version}/${name}` : `${base}/${name}?v=${version}`;
}








function assetSourceList(name, {
  base = seaConsts.assetBase,
  assetVersion = seaConsts.assetVersion,
  rootVersion = assetVersion,
  inlinedVersion = seaConsts.assetVersion,
  pointerLoaded = false,
} = {}) {
  const root = assetUrl(name, base, rootVersion, false);
  if (!pointerLoaded) return [root];
  const dir = assetUrl(name, base, assetVersion, true);
  return String(assetVersion) === String(inlinedVersion) ? [dir, root] : [dir];
}





function paintHold() {
  let resolve;
  const promise = new Promise(r => { resolve = r; });
  let settled = false;
  return {
    promise,
    settled: () => settled,
    settle(value) {
      if (settled) return false;
      settled = true;
      resolve(value);
      return true;
    },
  };
}





const POINTER_FILE = 'sea-zag-assets.json';



const MANIFEST_CHECK_MS = 5 * 60 * 1000;




const STAMP_RE =
  /\/(?:maps|community-maps|supporter-maps|user-maps)\/[^/]+\/(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}Z)(?:-[0-9a-fA-F]+)?\//;

function extractMapStamp(pathOrUrl) {
  const m = STAMP_RE.exec(String(pathOrUrl || ''));
  return m ? m[1] : null;
}




function pickLiveMainEntry(manifest) {
  const entries = manifest && Array.isArray(manifest.main) ? manifest.main : [];
  let best = null;
  for (const e of entries) {
    if (!e) continue;
    const stamp = extractMapStamp(e.png_url || e.base_url);
    if (!stamp) continue;
    if (!best || stamp > best.stamp) {
      best = {
        map_id: Number(e.map_id),
        stamp,
        png_url: e.png_url || '',
        base_url: e.base_url || '',
      };
    }
  }
  return best;
}

function pointerUrl(base = seaConsts.assetBase) {
  return `${base}/${POINTER_FILE}`;
}



function positive(raw, fallback) {
  const v = Number(raw);
  return isFinite(v) && v > 0 ? v : Number(fallback);
}

function pointerText(raw, fallback) {
  return typeof raw === 'string' && raw ? raw : String(fallback ?? '');
}





function parsePointer(raw, fallback = seaConsts) {
  const p = raw && typeof raw === 'object' ? raw : {};
  const fb = fallback || {};
  const map = p.map && typeof p.map === 'object' ? p.map : {};
  const fbMap = fb.map || {};
  return {
    schema: 1,
    assetVersion: pointerText(p.assetVersion, fb.assetVersion ?? fb.version),
    whaleVersion: pointerText(p.whaleVersion, fb.whaleVersion),
    meshVersion: pointerText(p.meshVersion, fb.meshVersion),
    map: {
      kind: pointerText(map.kind, fbMap.kind ?? 'exploration'),
      id: positive(map.id, fbMap.id),
      stamp: pointerText(map.stamp, fbMap.stamp),
      w: positive(map.w, fbMap.w),
      h: positive(map.h, fbMap.h),
    },
    pipelineStamp: pointerText(p.pipelineStamp, fb.pipelineStamp),
    distMax: positive(p.distMax, fb.distMax),
    alongScale: positive(p.alongScale, fb.alongScale),
    heightLo: positive(p.heightLo, fb.heightLo),
    heightHi: positive(p.heightHi, fb.heightHi),
    auxScale: positive(p.auxScale, fb.auxScale),
    flowCell: positive(p.flowCell, fb.flowCell),
    speedCell: positive(p.speedCell, fb.speedCell),
  };
}





const EXPLORATION_BASE_RE = /\/maps\/[^/]+\/[^/]+\/base\.bin\.br(?:[?#]|$)/;



function newestBaseStamp(urls) {
  let best = null;
  for (const u of Array.isArray(urls) ? urls : []) {
    const s = String(u || '');
    if (!EXPLORATION_BASE_RE.test(s)) continue;
    const stamp = extractMapStamp(s);
    if (stamp && (!best || stamp > best)) best = stamp;
  }
  return best;
}




function checkMapGate({ pointerStamp, timingUrls = [], cacheUrls = [], manifest = null } = {}) {
  const timingStamp = newestBaseStamp(timingUrls);
  const manifestEntry = pickLiveMainEntry(manifest);
  const manifestStamp = manifestEntry ? manifestEntry.stamp : null;
  const cacheStamp = newestBaseStamp(cacheUrls);
  const pointer = pointerStamp || null;
  const differs = s => s && s !== pointer;

  
  
  if (timingStamp && manifestStamp && (differs(timingStamp) || differs(manifestStamp))) {
    return differs(timingStamp)
      ? { status: 'outdated', liveStamp: timingStamp, source: 'timing' }
      : { status: 'outdated', liveStamp: manifestStamp, source: 'manifest' };
  }

  const [liveStamp, source] = timingStamp
    ? [timingStamp, 'timing']
    : manifestStamp
      ? [manifestStamp, 'manifest']
      : cacheStamp
        ? [cacheStamp, 'cache']
        : [null, 'none'];

  if (!liveStamp || !pointer) return { status: 'unknown', liveStamp: null, source: 'none' };
  return {
    status: liveStamp === pointer ? 'match' : 'outdated', liveStamp, source,
  };
}




const OUTDATED_TEXT = 'sea out of date';
const OUTDATED_TILE_W = 220;
const OUTDATED_TILE_H = 110;

function outdatedTileLayout(cssW, cssH, dpr = 1) {
  return {
    tileW: OUTDATED_TILE_W,
    tileH: OUTDATED_TILE_H,
    
    cols: Math.ceil(Math.max(1, cssW) / OUTDATED_TILE_W) + 2,
    rows: Math.ceil(Math.max(1, cssH) / OUTDATED_TILE_H) + 2,
    fontPx: 13,
    alpha: 0.22,
    angleRad: -12 * Math.PI / 180,
    
    
    dpr: Math.max(1, Math.min(2, Number(dpr) || 1)),
  };
}

/* ---- whale-core.js ---- */
const WHALE_MAGIC = 0x5748414c;   
const WHALE_VERSION = 1;
const WHALE_HEADER = 16;
const WHALE_RECORD = 8;

const whaleClamp = (v, a, b) => Math.max(a, Math.min(b, v));




function parseWhaleRoute(buf) {
  const bytes = buf instanceof ArrayBuffer
    ? new Uint8Array(buf)
    : new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  if (bytes.byteLength < WHALE_HEADER) {
    throw new Error(`whale route: ${bytes.byteLength} bytes is shorter than the ${WHALE_HEADER}-byte header`);
  }
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  const magic = dv.getUint32(0, true);
  if (magic !== WHALE_MAGIC) {
    throw new Error(`whale route: bad magic 0x${magic.toString(16)}`);
  }
  const version = dv.getUint16(4, true);
  if (version !== WHALE_VERSION) {
    throw new Error(`whale route: unsupported version ${version}`);
  }
  const dtSec = dv.getUint16(6, true);
  if (!(dtSec > 0)) throw new Error('whale route: dtSec must be positive');
  const count = dv.getUint32(8, true);
  if (!(count > 0)) throw new Error('whale route: count must be positive');
  const expected = WHALE_HEADER + WHALE_RECORD * count;
  if (bytes.byteLength !== expected) {
    throw new Error(
      `whale route: ${bytes.byteLength} bytes, expected ${expected} for ${count} records`,
    );
  }

  const x = new Uint16Array(count);
  const y = new Uint16Array(count);
  const depth = new Uint8Array(count);
  for (let i = 0; i < count; i++) {
    const off = WHALE_HEADER + WHALE_RECORD * i;
    x[i] = dv.getUint16(off, true);
    y[i] = dv.getUint16(off + 2, true);
    depth[i] = dv.getUint8(off + 4);
    
  }

  return {
    dtSec,
    count,
    maxDepth: dv.getUint16(12, true) / 16,
    seed: dv.getUint16(14, true),
    loopDuration: count * dtSec,
    x,
    y,
    depth,
  };
}


function catmull(p0, p1, p2, p3, u) {
  const u2 = u * u;
  const u3 = u2 * u;
  return 0.5 * (
    2 * p1 +
    (p2 - p0) * u +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * u2 +
    (3 * p1 - p0 - 3 * p2 + p3) * u3
  );
}

function catmullSlope(p0, p1, p2, p3, u) {
  const u2 = u * u;
  return 0.5 * (
    (p2 - p0) +
    2 * (2 * p0 - 5 * p1 + 4 * p2 - p3) * u +
    3 * (3 * p1 - p0 - 3 * p2 + p3) * u2
  );
}





function sampleWhale(route, tSec) {
  const { dtSec, count, loopDuration } = route;
  let t = tSec % loopDuration;
  if (t < 0) t += loopDuration;

  const fi = t / dtSec;
  const i0 = Math.floor(fi);
  
  
  const i = i0 % count;
  const u = fi - i0;

  const im1 = i === 0 ? count - 1 : i - 1;
  const i1 = i + 1 === count ? 0 : i + 1;
  const i2 = i1 + 1 === count ? 0 : i1 + 1;

  const x = (k) => route.x[k] / 8;
  const y = (k) => route.y[k] / 8;

  const dx = catmullSlope(x(im1), x(i), x(i1), x(i2), u);
  const dy = catmullSlope(y(im1), y(i), y(i1), y(i2), u);
  const d0 = route.depth[i] / 16;
  const d1 = route.depth[i1] / 16;

  return {
    x: catmull(x(im1), x(i), x(i1), x(i2), u),
    y: catmull(y(im1), y(i), y(i1), y(i2), u),
    depth: d0 + (d1 - d0) * u,
    heading: Math.atan2(dy, dx),
  };
}




function whaleUniforms(pose, shape) {
  const present = pose !== null && pose !== undefined;
  const depth = present ? pose.depth : 0;
  return {
    pose: present ? [pose.x, pose.y, pose.heading, pose.depth] : [0, 0, 0, 0],
    shape: [shape.halfLen, shape.halfWid, whaleClamp(1 - depth / 1.5, 0, 1), present ? 1 : 0],
  };
}



function clockOffset(serverEpochSec, rttMs, localEpochSec) {
  return serverEpochSec + rttMs / 2000 - localEpochSec;
}

/* ---- whale-mesh.js ---- */
const WMESH_MAGIC = 0x48575a57; 
const WMESH_VERSION = 2;
const WMESH_POSES = 3;          

function parseWhaleMesh(buf) {
  const dv = new DataView(buf);
  if (buf.byteLength < 32) throw new Error('whale mesh: short header');
  if (dv.getUint32(0, true) !== WMESH_MAGIC) throw new Error('whale mesh: bad magic');
  const version = dv.getUint32(4, true);
  if (version !== WMESH_VERSION) throw new Error(`whale mesh: version ${version}`);
  const nverts = dv.getUint32(8, true);
  const ntri = dv.getUint32(12, true);
  const nswim = dv.getUint32(16, true);
  const npose = dv.getUint32(20, true);
  if (!nverts || !ntri || !nswim || npose !== WMESH_POSES) {
    throw new Error('whale mesh: bad counts');
  }
  let off = 28;
  const idxBytes = ntri * 3 * 2;
  if (off + idxBytes > buf.byteLength) throw new Error('whale mesh: short indices');
  const idx = new Uint16Array(ntri * 3);
  for (let i = 0; i < idx.length; i++) idx[i] = dv.getUint16(off + i * 2, true);
  off += idxBytes;
  off += (4 - (off % 4)) % 4;
  const take = n => {
    if (off + n * 4 > buf.byteLength) throw new Error('whale mesh: short data');
    const a = new Float32Array(buf, off, n);
    off += n * 4;
    return a;
  };
  const mat = take(5);
  const rest = take(nverts * 3);
  const swim = take(nswim * nverts * 3);
  const poses = take(npose * nverts * 3);
  
  
  
  
  let hx = 0, hy = 0, zlo = Infinity, zhi = -Infinity;
  const scan = (a) => {
    for (let i = 0; i < a.length; i += 3) {
      hx = Math.max(hx, Math.abs(a[i]));
      hy = Math.max(hy, Math.abs(a[i + 1]));
      if (a[i + 2] < zlo) zlo = a[i + 2];
      if (a[i + 2] > zhi) zhi = a[i + 2];
    }
  };
  scan(rest); scan(swim);
  
  
  const MARGIN = 1.02;
  hx *= MARGIN; hy *= MARGIN;
  return {
    nverts, ntri, nswim, npose, idx, rest, swim, poses, half: [hx, hy],
    zrange: [zlo, zhi],
    base: [mat[0], mat[1], mat[2]], rough: mat[3], metal: mat[4],
  };
}



function poseWhale(mesh, phase, turn, surf, out) {
  const n = mesh.nverts;
  out = out || new Float32Array(n * 3);
  const swim = mesh.swim, per = n * 3;
  let f = ((phase % 1) + 1) % 1 * mesh.nswim;
  const i0 = Math.floor(f) % mesh.nswim;
  const i1 = (i0 + 1) % mesh.nswim;
  const a = f - Math.floor(f);
  for (let i = 0; i < per; i++) {
    out[i] = swim[i0 * per + i] * (1 - a) + swim[i1 * per + i] * a;
  }
  
  
  
  const rest = mesh.rest;
  const tw = Math.min(1, Math.abs(turn));
  if (tw > 0.001) {
    
    
    const off = (turn > 0 ? 1 : 2) * per;
    const src = mesh.poses.subarray(off, off + per);
    for (let i = 0; i < per; i++) out[i] += (src[i] - rest[i]) * tw;
  }
  const sw = Math.min(1, Math.max(0, surf));
  if (sw > 0.001) {
    const src = mesh.poses.subarray(0, per);
    for (let i = 0; i < per; i++) out[i] += (src[i] - rest[i]) * sw;
  }
  return out;
}



function rasterWhale(mesh, pos, opts) {
  const w = opts.w || 16, h = opts.h || 8;
  const out = opts.out || new Uint8Array(w * h * 4);
  out.fill(0);
  
  
  
  
  
  
  const scale = opts.scale ||
    (0.5 / Math.max(1e-6, mesh.half[0], mesh.half[1] * (w / h)));
  const base = opts.base || mesh.base;
  
  
  const zmin = mesh.zrange[0], zmax = mesh.zrange[1];
  const zr = Math.max(1e-6, zmax - zmin);
  
  
  
  const px = x => w / 2 + x * scale * w;
  const py = y => h / 2 - y * scale * w;
  const zbuf = new Float32Array(w * h).fill(-Infinity);
  const lx = -0.45, ly = 0.55, lz = 0.72;
  const ln = Math.hypot(lx, ly, lz);
  const hx = lx, hy = ly, hz = lz + 1;
  const hn = Math.hypot(hx, hy, hz);
  const shin = 12;
  const maxDepth = opts.maxDepth || 14;
  const shine = Math.max(0, 1 - (opts.depth || 0) / maxDepth);

  
  
  const vn = new Float32Array(mesh.nverts * 3);
  for (let t = 0; t < mesh.ntri; t++) {
    const ia = mesh.idx[t * 3], ib = mesh.idx[t * 3 + 1], ic = mesh.idx[t * 3 + 2];
    const ux = pos[ib * 3] - pos[ia * 3], uy = pos[ib * 3 + 1] - pos[ia * 3 + 1],
      uz = pos[ib * 3 + 2] - pos[ia * 3 + 2];
    const vx = pos[ic * 3] - pos[ia * 3], vy = pos[ic * 3 + 1] - pos[ia * 3 + 1],
      vz = pos[ic * 3 + 2] - pos[ia * 3 + 2];
    const nx0 = uy * vz - uz * vy, ny0 = uz * vx - ux * vz, nz0 = ux * vy - uy * vx;
    for (const i of [ia, ib, ic]) {
      vn[i * 3] += nx0; vn[i * 3 + 1] += ny0; vn[i * 3 + 2] += nz0;
    }
  }
  for (let i = 0; i < mesh.nverts; i++) {
    const l = Math.hypot(vn[i * 3], vn[i * 3 + 1], vn[i * 3 + 2]) || 1;
    vn[i * 3] /= l; vn[i * 3 + 1] /= l; vn[i * 3 + 2] /= l;
  }
  for (let t = 0; t < mesh.ntri; t++) {
    const ia = mesh.idx[t * 3], ib = mesh.idx[t * 3 + 1], ic = mesh.idx[t * 3 + 2];
    const ax = px(pos[ia * 3]), ay = py(pos[ia * 3 + 1]), az = pos[ia * 3 + 2];
    const bx = px(pos[ib * 3]), by = py(pos[ib * 3 + 1]), bz = pos[ib * 3 + 2];
    const cx = px(pos[ic * 3]), cy = py(pos[ic * 3 + 1]), cz = pos[ic * 3 + 2];
    const area = (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
    if (Math.abs(area) < 1e-9) continue;
    const x0 = Math.max(0, Math.floor(Math.min(ax, bx, cx)));
    const x1 = Math.min(w - 1, Math.ceil(Math.max(ax, bx, cx)));
    const y0 = Math.max(0, Math.floor(Math.min(ay, by, cy)));
    const y1 = Math.min(h - 1, Math.ceil(Math.max(ay, by, cy)));
    const ax3 = ia * 3, bx3 = ib * 3, cx3 = ic * 3;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const sx = x + 0.5, sy = y + 0.5;
        const w0 = ((bx - sx) * (cy - sy) - (cx - sx) * (by - sy)) / area;
        const w1 = ((cx - sx) * (ay - sy) - (ax - sx) * (cy - sy)) / area;
        const w2 = 1 - w0 - w1;
        if (w0 < -0.02 || w1 < -0.02 || w2 < -0.02) continue;
        const z = w0 * az + w1 * bz + w2 * cz;
        const k = y * w + x;
        if (z <= zbuf[k]) continue;
        zbuf[k] = z;
        const hgt = Math.min(1, Math.max(0.02, (z - zmin) / zr));
        
        let nx = w0 * vn[ax3] + w1 * vn[bx3] + w2 * vn[cx3];
        let ny = w0 * vn[ax3 + 1] + w1 * vn[bx3 + 1] + w2 * vn[cx3 + 1];
        let nz = w0 * vn[ax3 + 2] + w1 * vn[bx3 + 2] + w2 * vn[cx3 + 2];
        const nl = Math.hypot(nx, ny, nz) || 1;
        nx /= nl; ny /= nl; nz /= nl;
        if (nz < 0) { nx = -nx; ny = -ny; nz = -nz; }
        const lam = Math.max(0, (nx * lx + ny * ly + nz * lz) / ln);
        const spec = shine * Math.min(0.9,
          Math.pow(Math.max(0, (nx * hx + ny * hy + nz * hz) / hn), shin));
        const shade = 0.30 + 0.70 * lam;
        const r = base[0] * shade + spec * 0.22;
        const g = base[1] * shade + spec * 0.22;
        const b = base[2] * shade + spec * 0.26;
        out[k * 4] = Math.min(255, Math.round(r * 255));
        out[k * 4 + 1] = Math.min(255, Math.round(g * 255));
        out[k * 4 + 2] = Math.min(255, Math.round(b * 255));
        out[k * 4 + 3] = Math.round(hgt * 255);
      }
    }
  }
  return out;
}

/* ---- sea-glsl.js ---- */
const VERT = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
// Quality variants. sea-core's modeSettings #defines these per tier, so a tier
// that does not use a feature does not pay to execute it. The defaults are the
// full baseline, so the sandbox and any plain caller keep everything.
#ifndef HAS_PARALLAX
#define HAS_PARALLAX 1
#endif
#ifndef HAS_WARP
#define HAS_WARP 1
#endif
#ifndef NOISE_LAYERS
#define NOISE_LAYERS 2
#endif
#ifndef FLOW_LOD
#define FLOW_LOD 1
#endif
precision highp float;
precision highp sampler2D;
out vec4 outColor;

uniform sampler2D uColour, uAux, uDist, uFlow, uSpeedTex, uCurve, uSliceCurve, uWarpCurve;
uniform vec2 uTarget, uSize, uFlowSize, uSpeedSize, uAuxSpan, uCenter;
uniform float uFlowCell;   // map tiles per coarse flow texel
uniform float uZoom, uTime, uDistMax;
uniform float uShoreW, uShelf, uFlowSpeed, uGrain, uFoam, uDeep, uSwell, uSnap, uWaveSpeed, uFlowMode, uZoomCss;
uniform float uCycle;   // seconds for one advection cycle
uniform float uDeflect, uDeflectReach;   // the bake's coastal bend (bake.py)
uniform float uTravelMax;                // cap on one cycle's advection (0 = none)
uniform float uWarp, uWarpBias;          // surface distortion: amount, depth bias
uniform float uSpec, uSpecPow, uSpecSize, uSpecInvert;  // surface highlight
uniform float uSpecMode;   // 0 add, 1 screen, 2 water-coloured, 3 multiply
uniform vec2 uDirA, uDirB;
uniform float uSpeedA, uSpeedB, uScaleA, uScaleB;
uniform float uParallax, uDeepSlow, uWaveIn, uWaveOut, uPomLayers;
uniform float uAlongScale, uBrightness, uNoiseLayers;
uniform float uHue, uSat;       // colour controls: degrees, percent
uniform float uSpecFloor;       // extra highlight on water too dark to catch it
uniform float uReveal;          // 0..1 depth-masked intro (deep water first)
uniform vec4 uWhalePose;        // x, y, heading (rad), depth (tiles below water)
uniform vec4 uWhaleShape;       // half length, half width, surface fade, enabled
uniform vec4 uWhaleWake;        // x, y, strength, radius: the ring left behind
uniform sampler2D uWhaleTex;     // 16x8 body target: RGB colour, A height
uniform vec2 uWhaleHalf;         // body half extents in tiles (x, y)
uniform float uWhaleHeight;      // body height in tiles (A = 0..1 of this)

// ---- map border -------------------------------------------------------------
// Everything here is in map texels (one texel per cell), so the trim scales
// with zoom like the rest of the sea: the water bleeds BLEED_TILES past the
// rectangle, then a 9-texel band: black, line, black, 3-texel zigzag, black,
// line, black. The band is a solid opaque-black backing, the zigzag's unpainted
// cells included; only past it does the page show through.
const float BLEED_TILES = 6.0;
const float BORDER_BLACK_IN = 1.0;
const float BORDER_LINE1 = 1.0;
const float BORDER_BLACK1 = 1.0;
const float BORDER_ZIG = 3.0;
const float BORDER_BLACK2 = 1.0;
const float BORDER_LINE2 = 1.0;
const float BORDER_BLACK_OUT = 1.0;

// Deepest baked route depth (maxDepth = 222/16 = 13.875 tiles), rounded up.
// Only normalises the whale's surface coupling; the shader never sees maxDepth.
const float WHALE_MAX_DEPTH = 14.0;

// How much of the water's own colour tints the body: 0 = natural, 1 = the sea
// exactly. The owner asked for roughly 70-80%, not a complete recolour.
const float WHALE_TINT = 0.4;

// The least the water tints a submerged body, reached within 0.6 tiles of the
// surface. The exponential fog alone was invisible there.
const float WHALE_TINT_FLOOR = 0.22;

// How far the body's baked shadows wash out toward the water once submerged.
// Under water a near-black rim reads as a hole in the sea rather than a shadow,
// so the dark end of the shading picks up the water colour; the lit side keeps
// its own.
const float WHALE_SHADOW_WASH = 0.45;

// The hue rotation every browser's CSS hue-rotate() uses, so the 2D fallback and
// the shader land on the same colours. Rotates about the grey axis; luminance
// survives.
vec3 hueRotate(vec3 c, float degrees) {
  float a = radians(degrees);
  float s = sin(a);
  float k = cos(a);
  mat3 m = mat3(
    0.213 + k * 0.787 - s * 0.213,
    0.213 - k * 0.213 + s * 0.143,
    0.213 - k * 0.213 - s * 0.787,
    0.715 - k * 0.715 - s * 0.715,
    0.715 + k * 0.285 + s * 0.140,
    0.715 - k * 0.715 + s * 0.715,
    0.072 - k * 0.072 + s * 0.928,
    0.072 - k * 0.072 - s * 0.283,
    0.072 + k * 0.928 + s * 0.072
  );
  return max(m * c, vec3(0.0));
}

// A whale never rests on the seabed: the deepest it may sink is this fraction of
// the local water depth, so shallow water makes it surface instead of going
// black under the (absolute) pose depth. 0.85 leaves a little clearance below.
// Ground depth is measured in the same tiles as the whale: depth01 * this. The
// body is then held WHALE_SEABED_GAP above the ground, so "ground 10 tiles"
// means the deepest the whale can be there is 9.
const float WHALE_SEABED_GAP = 1.0;


// Whale ring shore width, in tiles. The ring uses the coast's own wave
// frequencies and noise (never a uShoreW / WHALE_SHORE_W ratio: 6.4x would put
// the wavelength below one texel and alias on the 1-tile grid), so its band
// shows about one crest line instead of the coast's several. The shelf width is
// derived from the same ratio, so widening this widens the whole ring.
// Easy to tune.
const float WHALE_SHORE_W = 3.5;

// The wake's shelf width, in tiles: the soft glow just inside its circle.
const float WHALE_WAKE_SHELF = 2.5;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i), b = hash(i + vec2(1, 0));
  float c = hash(i + vec2(0, 1)), d = hash(i + vec2(1, 1));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p) {
  return 0.58 * vnoise(p) + 0.30 * vnoise(p * 2.03 + 11.1)
       + 0.12 * vnoise(p * 4.01 + 23.7);
}
// Ashima / Gustavson 2D simplex noise, roughly -1..1
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                 + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
float parCurve(float d) {
  return texture(uCurve, vec2(clamp(d, 0.0, 1.0), 0.5)).r;
}
// where the i-th POM slice samples, as a depth fraction 0..1. Linear = even
// spacing; flattening the curve bunches the slices together there, steepening
// it spreads them out.
float sliceCurveAt(float t) {
  return texture(uSliceCurve, vec2(clamp(t, 0.0, 1.0), 0.5)).r;
}
// how much of the distortion a pixel at this depth gets
float warpCurveAt(float t) {
  return texture(uWarpCurve, vec2(clamp(t, 0.0, 1.0), 0.5)).r;
}
// parallax is a scale about the view centre: a point at depth d is sampled at
// (target + (w-target)*(1-par)). Linear in w, so there is no singularity or
// shear at the centre -- it is the flat-map equivalent of a layer further away.
vec2 parShift(vec2 w, float depth) {
#if HAS_PARALLAX
  // depth is a map-space quantity: scale the parallax with zoom so the same
  // number of map tiles shifts at every zoom (3.2 is the reference zoom)
  float k = uParallax * parCurve(depth) * (uZoomCss / 3.2);
  return (uTarget - w) * k;
#else
  return vec2(0.0);
#endif
}
// world position to sample the base colour at, for parallax depth dep
// (0 = surface, 1 = deepest). The shift is a per-texel quantity, so snapping
// the result to a texel centre moves a whole texel rigidly instead of
// resampling the seabed smoothly at screen resolution.
vec2 parPos(vec2 p, float dep) {
#if HAS_PARALLAX
  vec2 w = p + parShift(p, dep);
  return mix(w, floor(w) + 0.5, uSnap);
#else
  return mix(p, floor(p) + 0.5, uSnap);
#endif
}

// The map's depth palette (tools/sea_editor.py, preset interesting_v2), as a
// colour by depth fraction. Only the whale uses it: the sea itself samples the
// baked colour texture.
vec3 depthRamp(float t) {
  const float S[9] = float[9](0.001, 0.03, 0.07, 0.12, 0.20, 0.32, 0.46, 0.66, 1.0);
  const vec3 C[9] = vec3[9](
    vec3(0.290, 0.494, 0.612), vec3(0.227, 0.408, 0.525),
    vec3(0.176, 0.337, 0.455), vec3(0.137, 0.275, 0.384),
    vec3(0.110, 0.224, 0.322), vec3(0.086, 0.180, 0.263),
    vec3(0.067, 0.141, 0.208), vec3(0.047, 0.098, 0.145),
    vec3(0.027, 0.051, 0.071));
  vec3 c = C[0];
  for (int i = 1; i < 9; i++) {
    c = mix(c, C[i], smoothstep(S[i - 1], S[i], t));
  }
  return c;
}

// ---- shore waves ------------------------------------------------------------
// One model for the coast's wave/foam band and the whale ring. Both call it at
// the coast's spatial frequencies and noise; only the shore width, shelf width,
// distance and wet mask differ. Distances are in tiles.
struct ShoreParams {
  vec2 p;            // noise position (map texels)
  vec2 flow;         // current direction
  float travel;      // one cycle's advection distance
  float ph1, ph2;    // the two advection phases
  float w1, w2;      // their cross-fade weights
  float d;           // distance to the shore/contour
  float w;           // shore width
  float shelfW;      // shelf glow width
  float wetMul;      // 1 in water; the coast passes its wet mask
  float dir;         // +1: crests run in to the coast; -1: radiate outwards
};
struct ShoreWaves {
  float crest;       // inbound + outbound crest, before the shore mask
  float shore;       // 1 at the shore, 0 at the shore width
  float edge;        // thin wet-line mask (already wet-scaled)
  float lap;         // wet-line breakup factor
  float shelf;       // shelf glow modulation (already wet-scaled)
};
ShoreWaves shoreWaves(ShoreParams s) {
  vec2 n1 = s.p;
  vec2 wet1 = s.p - s.flow * (s.travel * 0.30 * s.ph1);
  vec2 wet2 = s.p - s.flow * (s.travel * 0.30 * s.ph2);
  vec2 sh1 = s.p - s.flow * (s.travel * 0.40 * s.ph1);
  vec2 sh2 = s.p - s.flow * (s.travel * 0.40 * s.ph2);
  float lap2 = fbm(wet1 * 0.90 + 17.0) * s.w1
             + fbm(wet2 * 0.90 + 17.0) * s.w2;
  // Wobble the isolines so crests wander.
  float wob = (fbm(n1 * 0.14 + 31.0) - 0.5) * 2.2;
  float breakup = smoothstep(0.05, 0.60, fbm(n1 * 0.05 + 5.0));
  // Two trains: one runs in, one runs out, with separate wavelengths, speeds
  // and slow phase offsets so the cycles are not in lockstep.
  float phIn = (fbm(n1 * 0.045 + 7.0) - 0.5) * 6.2832;
  float phOut = (fbm(n1 * 0.055 + 23.0) - 0.5) * 6.2832;
  float wIn = sin((s.d + wob) * 1.05
                  + uTime * uWaveSpeed + phIn);
  float wOut = sin((s.d + wob * 1.3) * 0.74
                   - uTime * uWaveSpeed * 0.63 + phOut);
  float cIn = pow(max(wIn, 0.0), 3.0);
  float cOut = smoothstep(0.10, 0.90, wOut) * 0.55;
  float crest = (cIn * uWaveIn + cOut * uWaveOut) * breakup;
  float edge = (1.0 - smoothstep(0.0, 0.85, s.d)) * s.wetMul;
  float lap = 0.30 + 0.95 * smoothstep(0.34, 0.80, lap2);
  float shore = 1.0 - smoothstep(0.0, s.w, s.d);
  float shelfMask = 1.0 - smoothstep(0.0, s.shelfW, s.d);
  float shelfN = fbm(sh1 * 0.12 + 3.0) * s.w1
               + fbm(sh2 * 0.12 + 3.0) * s.w2 - 0.5;
  return ShoreWaves(crest, shore, edge, lap, shelfN * (shelfMask * s.wetMul));
}

void main() {
  // y is bottom-origin, like gl_FragCoord: the sea's texture rows run south at
  // row 0 to north at the last row, so world y grows upward on screen. (The
  // prototype's y-down world was mirrored against the real map; R17.)
  vec2 world = uTarget + vec2(gl_FragCoord.x - uCenter.x,
                              gl_FragCoord.y - uCenter.y) / uZoom;
  // effects live on the texture's own pixel grid (1 texel = 1 tile), not on
  // the screen grid, so the grain matches the map's grain at every zoom
  vec2 p = mix(world, floor(world) + 0.5, uSnap);
  float d = texture(uDist, p / uSize).r;
  d = d * d * uDistMax;                     // back to tiles
  vec4 aux0 = texture(uAux, p / uAuxSpan);
  float depth01 = aux0.r;                   // 0 shallow .. 1 deep, from the height map
  // coarse 16-tile field, the 1:1 bake, or an LOD that uses the coarse field
  // and rebuilds the coastal detail from the distance field (no extra bytes)
  vec4 fcoarse = texture(uFlow, p / (uFlowCell * uFlowSize));
  vec2 cdir = fcoarse.rg * 2.0 - 1.0;
  float cspd = fcoarse.b;
  vec2 flow;
  float fspeed;
#if FLOW_LOD
  if (uFlowMode > 0.5) {
    // LOD: the raw 16-tile gyre, bent toward the along-coast direction that the
    // bake stores in aux.GB (rotate90 of the blurred distance gradient, faded
    // to zero where that gradient is ill-defined). Same inputs the 1:1 bake
    // uses, so the two agree instead of the shader re-deriving it per pixel.
    vec2 along = (texture(uAux, p / uAuxSpan).gb * 2.0 - 1.0) * uAlongScale;
    // blend the *raw* interpolated gyre, not its direction: where two cells
    // disagree its length is < 1, and the generator weighs the bend against
    // that length. Normalising first over-rotates exactly where currents meet.
    vec2 cm = cdir;
    float near = uDeflect * exp(-d / max(1.0, uDeflectReach));
    vec2 bl = mix(cm, along, near);
    float bls = length(bl);
    flow = bls > 1e-4 ? bl / bls : cm;
    // speed: the baked field itself, 4 tiles/texel over the full map.
    fspeed = texture(uSpeedTex, p / (4.0 * uSpeedSize)).r;
  } else {
    // coarse only: no along blend, the gyre's own speed
    float m = length(cdir);
    flow = m > 1e-4 ? cdir / m : vec2(0.0);
    fspeed = cspd;
  }
#else
  {
    // coarse only: no along blend, the gyre's own speed
    float m = length(cdir);
    flow = m > 1e-4 ? cdir / m : vec2(0.0);
    fspeed = cspd;
  }
#endif
  float wet = step(0.0001, d);

  // ---- advection cycle (shared by the shore lap, the shelf and open water) ----
  // The current pushes the pattern, but only for one cycle's worth of travel;
  // a second copy starts half a cycle behind and the two are cross-faded, so a
  // copy always resets while its weight is zero and the displacement stays
  // bounded. Without this the offset grows forever and steady currents smear
  // the noise into long streaks.
  float ph1 = fract(uTime / uCycle);
  float ph2 = fract(uTime / uCycle + 0.5);
  float w1 = 1.0 - abs(2.0 * ph1 - 1.0);
  float w2 = 1.0 - w1;
  // one cycle's travel is capped: at large flow x cycle the displacement gets
  // long enough that the folds around a pole cross several texels and crease
  float cycleTravel = min(fspeed * uFlowSpeed * uCycle,
                          uTravelMax > 0.0 ? uTravelMax : 1e6);

  // ---- open water: two noise layers crossing, then sliding with the current ----
  // (never the depth gradient: only the shore waves use distance)
  float deep = smoothstep(0.06, 0.75, d / uDistMax);
  float shallow = 1.0 - depth01;
  vec2 q = p;                                // the noise is not parallaxed
  float slow = mix(uDeepSlow, 1.0, shallow);
  // two-phase advection: the current moves the combined noise for one cycle's
  // travel only, and the second copy half a cycle behind is cross-faded in as
  // the first fades out - so it reads as endless without ever stretching
  float travel = cycleTravel * slow;
  vec2 s1 = q - flow * (travel * ph1);
  vec2 s2 = q - flow * (travel * ph2);
  // each layer also scrolls on its own fixed heading at its own speed and
  // scale (no rotation, no stretch)
  vec2 scrollA = uDirA * (uTime * uSpeedA);
  vec2 scrollB = uDirB * (uTime * uSpeedB);
  float nA = snoise((s1 - scrollA) * uScaleA) * w1 + snoise((s2 - scrollA) * uScaleA) * w2;
  // cross-fading two copies halves the contrast at the crossover; undo it so
  // the grain does not pulse once per cycle
  float amp = inversesqrt(w1 * w1 + w2 * w2);
#if NOISE_LAYERS > 1
  // the tier keeps the second layer in the build; the uniform can still turn it
  // off (the sandbox's layer control), so both remain live
  float nB = 0.0;
  float n = nA * amp;
  if (uNoiseLayers > 1.5) {
    nB = snoise((s1 - scrollB) * uScaleB) * w1
       + snoise((s2 - scrollB) * uScaleB) * w2;
    n = (nA + nB) * 0.5 * amp;
  }
#else
  float nB = 0.0;                            // one layer: A alone, no B sample
  float n = nA * amp;
#endif

  // surface distortion: the two noise layers warp where the seabed is sampled,
  // so the bed swims under the water. The depth bias is what keeps the shallow
  // end still: weight 0 at the surface, 1 in the deep, via the warp curve.
#if HAS_WARP
  float wdep = mix(1.0, warpCurveAt(depth01), uWarpBias);
  vec2 warp = vec2(nA, nB) * (uWarp * wdep);
#else
  vec2 warp = vec2(0.0);                  // the whale's refraction reads it too
#endif
  // everything parallax-related is computed from this displaced position
  vec2 base = p + warp;

  // parallax the base colour map, anchored to the view centre: deep water is
  // pulled slightly toward the centre (smaller features), so it reads as
  // further away; the screen centre itself never moves
#if HAS_PARALLAX
  int N = int(uPomLayers + 0.5);
  vec3 col = texture(uColour, parPos(base, depth01) / uSize).rgb;
  if (N > 1) {
    // POM: ray from the top of the height range down; the first slice below
    // the terrain is the hit, and the two slices bracketing it are mixed by
    // the crossing fraction (soft edge, still occluded)
    float hPrev = 1.0;
    vec2 uvPrev = parPos(base, 0.0);
    float terPrev = 1.0 - texture(uAux, uvPrev / uAuxSpan).r;
    bool hit = false;
    for (int i = 0; i < 12; i++) {
      if (i >= N) break;
      // the slice curve decides where this step samples along the depth
      // range: where it is flat the slices crowd together, where it is steep
      // they are sparse
      float dep = sliceCurveAt((float(i) + 1.0) / float(N));
      float hRay = 1.0 - dep;
      vec2 sp = parPos(base, dep);
      float hTer = 1.0 - texture(uAux, sp / uAuxSpan).r;
      if (hRay <= hTer) {
        float a = hPrev, b = hRay;
        for (int k = 0; k < 4; k++) {
          float hm = 0.5 * (a + b);
          vec2 uvm = parPos(base, 1.0 - hm);
          float tm = 1.0 - texture(uAux, uvm / uAuxSpan).r;
          if (hm <= tm) b = hm; else a = hm;
        }
        vec2 uvHit = parPos(base, 1.0 - b);
        float above = hPrev - terPrev;
        float below = hRay - hTer;
        float frac = clamp(above / max(above - below, 1e-6), 0.0, 1.0);
        // blend the two slice positions by the crossing fraction and take one
        // sample: continuous in frac, so no slice banding
        vec2 hitPos = mix(uvPrev, uvHit, frac);
        col = texture(uColour, hitPos / uSize).rgb;
        hit = true;
        break;
      }
      hPrev = hRay;
      uvPrev = sp;
      terPrev = hTer;
    }
    if (!hit) {
      col = texture(uColour, parPos(base, 1.0) / uSize).rgb;
    }
  }
#else
  vec3 col = texture(uColour, parPos(base, depth01) / uSize).rgb;
#endif

  // ---- shore: wave crests travel in towards land ----
  // distance isolines are parallel to the coast, so advancing the phase makes
  // each crest move to a smaller d: waves breaking on the shore. The same
  // model is used by the whale ring below.
  ShoreWaves coast = shoreWaves(ShoreParams(
    p, flow, cycleTravel, ph1, ph2, w1, w2,
    d, uShoreW, uShelf, wet, 1.0));
  float shore = coast.shore * wet;
  col += vec3(0.58, 0.80, 0.94) * coast.crest * shore * uFoam;

  // thin wet line on the first texel, broken by the same noise
  col += vec3(0.62, 0.84, 0.98) * coast.edge * coast.lap * uFoam * 0.8;

  // the baked shelf glow breathes on its own, much wider than the wet line
  col *= 1.0 + coast.shelf * uFoam * 1.1;

  float grainN = fbm(q * 0.1 + 7.0) - 0.5;
  float dither = hash(floor(q)) - 0.5;
  float onWater = wet * (1.0 - shore * 0.85);
  col *= 1.0 + (n * 1.2 + grainN * 0.16)
               * uGrain * 1.2 * onWater * (1.0 - 0.45 * deep);
  col *= 1.0 + dither * uGrain * 0.25 * onWater;

  // ---- depth: darker, slightly cooler, with a huge slow swell ----
  col *= mix(1.0, uDeep, deep * wet);
  // a cooler, slightly richer blue with depth (no blur needed)
  col = mix(col, col * vec3(0.82, 0.94, 1.12) + vec3(0.0, 0.004, 0.010),
            deep * 0.55 * wet);
  float swell = fbm(p * 0.018 + vec2(uTime * 0.015, 13.0)) - 0.5;
  col *= 1.0 + swell * uSwell * deep * wet;

  // ---- surface highlight ----
  // Not a real specular: the crests of the open-water noise, raised to a power so
  // only the peaks catch, masked by a feathered disc centred on the middle of the
  // view. A vignette rather than a pattern: the light gathers under the eye and
  // falls off toward the edges, and uSpecInvert flips it to a ring at the rim.
  // Additive, so it can only brighten. No extra texture fetches.
  float pxPerCssS = max(uZoom / max(uZoomCss, 1e-4), 1e-4);
  // radius as a multiple of the view's half height, so the same number looks the
  // same on a phone and a desktop
  float halfH = uCenter.y / pxPerCssS;
  float rad = max(uSpecSize, 0.02) * halfH;
  float rr = length(gl_FragCoord.xy - uCenter) / pxPerCssS / max(rad, 1.0);
  // a full gradient, not a plateau: 1 at the centre falling steadily to 0 at the
  // rim, so the light reads as a vignette rather than a disc with soft edges
  float disc = 1.0 - smoothstep(0.0, 1.0, rr);
  float specMask = mix(disc, 1.0 - disc, clamp(uSpecInvert, 0.0, 1.0));
  // the noise only reaches ~0.6 at its crests, so map that range to 0..1 before
  // the power: otherwise pow() flattens everything and nothing catches
  float crest = smoothstep(0.10, 0.70, n);
  // the broad sheen is the crest itself; the glints are only its peaks
  float spec = mix(pow(crest, max(uSpecPow, 1.0)), crest, 0.35);
  float s = uSpec * spec * specMask * onWater;
  vec3 lightTint = vec3(0.74, 0.87, 1.0);
  int specMode = int(uSpecMode + 0.5);
  if (specMode == 1) {
    // screen: lifts the dark water, leaves what is already bright alone, so the
    // highlight reads as sheen rather than a wash
    col = 1.0 - (1.0 - col) * (1.0 - lightTint * s);
  } else if (specMode == 2) {
    // carries the water's own colour: the glints pick up the hue under them
    // instead of turning everything pale white. Scaling by col alone starves
    // the deep water, which is exactly where the glints read best, so a floor
    // takes over as the pixel darkens.
    float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
    float dark = 1.0 - smoothstep(0.0, 0.22, lum);
    col += s * (col * 2.0 + lightTint * (0.12 + uSpecFloor * dark));
  } else if (specMode == 3) {
    // warm: the screen lift again, on a warm tint, so the sea reads sunlit
    // instead of moonlit against the cold water
    col = 1.0 - (1.0 - col) * (1.0 - vec3(1.0, 0.92, 0.78) * s);
  } else {
    col += lightTint * s;
  }

  // ---- whale ---------------------------------------------------------------
  // The body rides its own parallax layer. The sea draws a layer at depth k by
  // sampling from p + (target - p) * k, so a point of that layer at w appears on
  // screen at target + (w - target) / (1 - k): magnified about the view centre.
  // Drawing the whale there makes it part of that layer, so anything drawn above
  // it (coast tiles, shallower water) conceals it.
  //
  // There is deliberately NO cap on that offset. A cap saturates the shift for
  // anything far from the centre, which is what made the body look like it was
  // floating instead of sitting in its layer; with the exact mapping it simply
  // moves as far as the layer does (and may leave the view when very deep).
  // The gate below is only a draw bound, not a limit on the shift.
  // The sea under the *whale*, sampled once at its own position. Using the
  // per-pixel depth01 made the body's effective depth (and so its cap, tint and
  // fog) change as it moved around the screen.
  float whaleSeabed01 = clamp(texture(uAux, uWhalePose.xy / uAuxSpan).r, 0.0, 1.0);
  float whaleD01Pre = clamp(min(uWhalePose.w,
    max(0.0, whaleSeabed01 * WHALE_MAX_DEPTH - WHALE_SEABED_GAP))
    / WHALE_MAX_DEPTH, 0.0, 1.0);
  float whaleK = uParallax * parCurve(whaleD01Pre) * (uZoomCss / 3.2);
  vec2 whaleAt = uWhalePose.xy
    + (uWhalePose.xy - uTarget) * (whaleK / max(1.0 - whaleK, 1e-3));
  vec2 whaleBox = abs(p - whaleAt);
  if (uWhaleShape.w > 0.5 && max(whaleBox.x, whaleBox.y) < 34.0) {
    float whaleDepth = uWhalePose.w;

    // The pose depth is absolute (tiles below the waterline), but the sea under
    // the whale may be far shallower. Cap it to a fraction of the local baked
    // depth so the body never sinks through the seabed: in shallow water it
    // surfaces and shallows instead of turning pitch black. uWhalePose.w stays
    // the raw pose depth for the debug/stats contract.
    float whaleDepthEff = min(whaleDepth,
      max(0.0, whaleSeabed01 * WHALE_MAX_DEPTH - WHALE_SEABED_GAP));

    // The warp is depth-scaled the other way: at depth 0 the body is anchored to
    // the surface (a breach shows no warp), while a deep body refracts with the
    // surface waves. The parallax shift grows with depth, like the water at that
    // depth, so the body reads as under the surface; it is clamped because
    // unclamped it is a view-centre radial scale that leaves the gate.
    float whaleD01 = clamp(whaleDepthEff / WHALE_MAX_DEPTH, 0.0, 1.0);
    vec2 wq = p + clamp(warp * whaleD01, vec2(-3.0), vec2(3.0));

    // Local frame from the continuous pose: +X along the heading, +Y across.
    // The ellipse rotates with the heading; the sampling grid does not.
    vec2 rel = wq - whaleAt;
    float hc = cos(uWhalePose.z), hs = sin(uWhalePose.z);
    vec2 wl = vec2(rel.x * hc + rel.y * hs, -rel.x * hs + rel.y * hc);

    // The body comes from the baked 3D mesh: the page skins it and rasterises a
    // small colour+height target (RGB = shaded body, A = height above the body
    // base, 0 = empty). Sampling it at p keeps the pixels on the sea's texel
    // grid; the mesh supplies the silhouette, the poses and the shading.
    float halfLen = uWhaleHalf.x;
    float halfWid = uWhaleHalf.y;
    vec2 uvW = vec2(0.5) + 0.5 * wl / vec2(halfLen, halfWid);
    // Outside the target there is no body: reject the sample instead of
    // clamping it. Clamping to the edge stretched whatever texel sat on the
    // border (the fins) into a line across the whale.
    vec2 inRange = step(vec2(0.0), uvW) * step(uvW, vec2(1.0));
    vec4 wtex = texture(uWhaleTex, clamp(uvW, 0.0, 1.0));
    // A is the body height 0..1 of uWhaleHeight, 0 = empty; 0.5 is the body's
    // mid-plane, which floats on the waterline at depth 0.
    float bodyMask = step(0.5 / 255.0, wtex.a) * inRange.x * inRange.y;
    // Terrain occludes: a body at depth d is behind any ground shallower than d,
    // so a bank, a shelf or the coast hides it. Per pixel, because the ground
    // varies across the body, while its own depth stays the single value above.
    float groundHere = clamp(depth01, 0.0, 1.0) * WHALE_MAX_DEPTH;
    bodyMask *= step(whaleDepthEff, groundHere);
    float zTop = (wtex.a - 0.5) * uWhaleHeight - whaleDepthEff;
    vec3 bodyCol = wtex.rgb;

    // Signed distance to the body outline, for the ring only. The ellipse
    // follows the mesh's proportions (uWhaleHalf), so the ring hugs the body.
    float r2 = (wl.x * wl.x) / (halfLen * halfLen)
             + (wl.y * wl.y) / (halfWid * halfWid);
    float dWhale = (r2 - 1.0)
      / max(2.0 * length(vec2(wl.x / (halfLen * halfLen),
                              wl.y / (halfWid * halfWid))), 1e-4);

    // Submerged: fog toward the shaded sea colour and pass the surface grain
    // over it. Breached: the body sits above the grain. The fog and waterline
    // weights are per texel like the shading.
    float submerged = max(0.0, -zTop);
    float fog = 1.0 - exp(-submerged * 0.22);
    float breach = smoothstep(0.0, 0.30, zTop);
    // Just under the surface the exponential is still ~0, which left the body
    // looking dry until it was a couple of tiles down. A floor brings the
    // water colour in as soon as the body is submerged (and only then: an
    // aerial breach stays its own colour).
    float under = clamp(-zTop / 0.6, 0.0, 1.0);
    fog = max(fog, WHALE_TINT_FLOOR * under);
    // The rim and the belly are baked dark, which is correct in the air and
    // wrong underwater: the darker a texel is, the more of the water's own
    // colour it takes on, so the silhouette stops being an outline of black.
    float bodyLum = dot(bodyCol, vec3(0.2126, 0.7152, 0.0722));
    float bodyShade = 1.0 - smoothstep(0.02, 0.30, bodyLum);
    fog = clamp(fog + WHALE_SHADOW_WASH * bodyShade * under, 0.0, 1.0);
    float gWhale = (1.0 + (n * 1.2 + grainN * 0.16) * uGrain * 1.2 * onWater
                          * (1.0 - 0.45 * deep))
                 * (1.0 + dither * uGrain * 0.25 * onWater);
    bodyCol = mix(bodyCol, col, fog);
    // Depth tint: the body keeps its own colour and is multiplied by the map's
    // depth ramp at its own depth, normalised so the surface is neutral. No hue
    // replacement — the whale stays the whale, only darker and bluer with depth.
    float wFrac = clamp(whaleDepthEff / WHALE_MAX_DEPTH, 0.0, 1.0);
    vec3 ramp = depthRamp(wFrac) / max(depthRamp(0.0), vec3(1e-3));
    bodyCol *= mix(vec3(1.0), ramp, WHALE_TINT);
    bodyCol = mix(bodyCol * gWhale, bodyCol, breach);
    // The waterline itself: a thin wet band where the top surface crosses Z=0.
    float wetBand = (1.0 - smoothstep(0.0, 0.75, abs(zTop))) * uWhaleShape.z;
    bodyCol = mix(bodyCol, vec3(0.62, 0.84, 0.98), wetBand * 0.55 * uFoam);
    col = mix(col, bodyCol, bodyMask);

    // ---- surface ring -------------------------------------------------------
    // The coast model with the same spatial frequencies and noise, only a
    // shorter 3.5-tile shore width and its own shelf width, so about one crest
    // line shows across the band. Scaling by uShoreW / WHALE_SHORE_W (6.4x)
    // would alias above Nyquist on the 1-tile texel grid.
    // The gate is a draw bound centred on the drawn position: 11.5 (half
    // length) + 5.69 (shelf = 3.5 * 26/16) + 3.0 (warp) = 20.19, rounded up.
    float ringR = max(dWhale, 0.0);
    float whaleShelfW = WHALE_SHORE_W * (uShelf / uShoreW);
    ShoreWaves ringWaves = shoreWaves(ShoreParams(
      p, flow, cycleTravel, ph1, ph2, w1, w2,
      ringR, WHALE_SHORE_W, whaleShelfW, 1.0, -1.0));
    float ringOn = 1.0 - bodyMask;
    col += vec3(0.58, 0.80, 0.94) * ringWaves.crest * ringWaves.shore
         * ringOn * uWhaleShape.z * uFoam;
    col += vec3(0.62, 0.84, 0.98) * ringWaves.edge * ringWaves.lap
         * ringOn * uWhaleShape.z * uFoam * 0.8;
    col *= 1.0 + ringWaves.shelf * ringOn * uWhaleShape.z * uFoam * 1.1;
  }

  // ---- whale wake ----------------------------------------------------------
  // The ring above is derived from the body's *current* depth, so it vanishes
  // the instant the whale dives. This is the circle it leaves behind: frozen at
  // the last surface point, drifting outward and fading, drawn with the coast's
  // own wave model so it reads as the same water. It outlives the body's gate
  // because the whale has usually swum away from it.
  // It hands over to the body's own ring rather than doubling it: as the body
  // rises into the top 1.5 tiles its ring takes the water back, so the wake
  // weight falls away with it.
  float wakeOn = uWhaleWake.z * (1.0 - uWhaleShape.z);
  if (uWhaleShape.w > 0.5 && wakeOn > 0.002) {
    float wDist = length(p - uWhaleWake.xy);
    if (wDist < uWhaleWake.w + WHALE_WAKE_SHELF + 4.0) {
      ShoreWaves wake = shoreWaves(ShoreParams(
        p, flow, cycleTravel, ph1, ph2, w1, w2,
        wDist - uWhaleWake.w, WHALE_SHORE_W, WHALE_WAKE_SHELF, 1.0, -1.0));
      col += vec3(0.58, 0.80, 0.94) * wake.crest * wake.shore
           * wakeOn * uFoam * 0.75;
      col += vec3(0.62, 0.84, 0.98) * wake.edge * wake.lap
           * wakeOn * uFoam * 0.5;
      col *= 1.0 + wake.shelf * wakeOn * uFoam * 0.7;
    }
  }

  // ---- colour controls -----------------------------------------------------
  // Saturation about the pixel's own luminance, then the hue rotation, then
  // brightness, which is the order the 2D path's CSS filters apply. Sea colour
  // only: the map border below is drawn after them, so the map stays the map.
  float cLum = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(vec3(cLum), col, uSat);
  col = hueRotate(col, uHue);
  col *= uBrightness;

  // ---- map border ----
  // The border lives on the texel grid: p is snapped to texel centres, so every
  // cell below is exactly one map texel wide and the edges stay crisp at any
  // zoom. The sea runs BLEED_TILES past the rectangle (the bakes clamp), then
  // the 9-texel band starts; outside it the page shows through. The band is an
  // opaque black backing with white rules on it, drawn after the sea, so it
  // takes no brightness, parallax or warp.
  // the sea content is clipped in by depth: quantise to the depth texel's 8-bit
  // code, then a hard step, so the reveal is a contour rather than a soft blend
  // — deep water first, the shore last. The trim below is not clipped.
  float dq = floor(depth01 * 255.0 + 0.5) / 255.0;
  float thr = 1.25 - 1.55 * uReveal;
  float seaA = step(thr, dq);
  // The loading grain, here rather than in a second canvas: until the reveal
  // reaches a pixel, the sea is the same dark pixel grain the pre-texture
  // placeholder drew. It is 8 CSS px cells re-randomised at ~9 fps in screen
  // space, so it lines up with the placeholder, and the reveal eats it away per
  // pixel at the depth texture's own resolution. The border band below writes
  // col/seaA unconditionally, so it is untouched.
  if (uReveal < 1.0) {
    float pxPerCss = max(uZoom / max(uZoomCss, 1e-4), 1e-4);
    vec2 cell = floor((gl_FragCoord.xy - uCenter) / (8.0 * pxPerCss));
    float tick = floor(uTime * 9.0);
    float g = hash(cell + vec2(tick * 17.3, tick * 31.7));
    // 1..10 of 255: as dark as it can be while still reading as grain
    // clip, not blend: a pixel is either still grain or already sea
    col = seaA >= 0.5 ? col : vec3((1.0 + floor(g * 10.0)) / 255.0);
    seaA = 1.0;
  }
  vec2 overTiles = max(vec2(0.0), max(-p, p - uSize));  // tiles out, >= 0
  vec2 outIdx = floor(overTiles);            // 0-based texel index outside
  float outT = max(outIdx.x, outIdx.y);      // Chebyshev: nearest side wins
  if (outT >= BLEED_TILES) {
    float b0 = BLEED_TILES;                  // black band starts here
    float b1 = b0 + BORDER_BLACK_IN;         // inner white line
    float b2 = b1 + BORDER_LINE1;            // black
    float b3 = b2 + BORDER_BLACK1;           // 3-texel zigzag
    float b4 = b3 + BORDER_ZIG;              // black
    float b5 = b4 + BORDER_BLACK2;           // outer white line
    float b6 = b5 + BORDER_LINE2;            // black
    float b7 = b6 + BORDER_BLACK_OUT;        // end of the band
    // every cell in the band is opaque; only past b7 is the page visible
    seaA = outT < b7 ? 1.0 : 0.0;
    col = vec3(0.0);                         // black backing
    if (outT >= b1 && outT < b2) {           // inner white line
      col = vec3(1.0);
    } else if (outT >= b3 && outT < b4) {    // 3-texel zigzag
      // along the nearest side: vertical position for left/right, horizontal
      // for top/bottom. The painted column steps 0,1,2,1 every 4 texels, so
      // the chain reads as a diagonal staircase.
      float along = floor(overTiles.x >= overTiles.y ? p.y : p.x);
      float across = outT - b3;              // 0..2 within the sub-band
      float k = mod(along, 4.0);
      float zigCol = k < 0.5 ? 0.0 : (k < 1.5 ? 1.0 : (k < 2.5 ? 2.0 : 1.0));
      if (abs(across - zigCol) < 0.5) {
        col = vec3(1.0);
      }
    } else if (outT >= b5 && outT < b6) {    // outer white line
      col = vec3(1.0);
    }
  }

  outColor = vec4(col, seaA);
}`;

/* ---- sea-ui.js ---- */
const SEA_UI_BTN_ID = 'zz-sea-btn';
const SEA_UI_MENU_ID = 'zz-sea-menu';
const SEA_UI_WRAP_ID = 'zz-sea-hud';
const SEA_UI_GAP = 8;             
const SEA_UI_RIGHT = 12;          
const SEA_UI_BTN = 30;            
const SEA_UI_MOUNT_MS = 30000;    


const SEA_UI_MODE_LABELS = {
  baseline: 'fancy',
  medium: 'medium',
  low: 'low',
  'extra-low': 'extra low',
  static: 'static',
};



const SEA_UI_CAP_LABELS = { 0: 'off', 60: '60', 30: '30' };





const SEA_UI_WAVE_PATH = 'M3 2h3v1h-3z M9 2h3v1h-3z M3 3h1v1h-1z M5 3h2v1h-2z M9 3h1v1h-1z M11 3h1v1h-1z M0 4h1v1h-1z M2 4h2v1h-2z M6 4h1v1h-1z M8 4h2v1h-2z M0 5h3v1h-3z M6 5h3v1h-3z M3 7h3v1h-3z M9 7h3v1h-3z M0 8h1v1h-1z M2 8h2v1h-2z M5 8h2v1h-2z M8 8h2v1h-2z M11 8h1v1h-1z M0 9h1v1h-1z M2 9h1v1h-1z M6 9h1v1h-1z M8 9h1v1h-1z M0 10h3v1h-3z M6 10h3v1h-3z';





const SEA_UI_ARROW_PATH = 'M2 0h1v1h-1z M1 1h3v1h-3z M0 2h5v1h-5z ' +
  'M2 3h1v1h-1z M2 4h1v1h-1z';





const WAVE_BAND = 6;              

function waveFrames(path, cells = 12, oppose = false) {
  const runs = [];
  String(path).replace(/M(\d+) (\d+)h(\d+)v1h-\d+z/g, (all, x, y, w) => {
    runs.push([Number(x), Number(y), Number(w)]);
    return all;
  });
  return Array.from({ length: cells }, (_, shift) => {
    const on = new Set();
    for (const [x, y, w] of runs) {
      const dir = oppose && y >= WAVE_BAND ? -1 : 1;
      for (let k = 0; k < w; k++) {
        on.add(`${(x + k + shift * dir + cells * 2) % cells},${y}`);
      }
    }
    const out = [];
    for (let y = 0; y < cells; y++) {
      let x = 0;
      while (x < cells) {
        if (!on.has(`${x},${y}`)) { x += 1; continue; }
        let n = 0;
        while (on.has(`${x + n},${y}`)) n += 1;
        out.push(`M${x} ${y}h${n}v1h-${n}z`);
        x += n;
      }
    }
    return out.join(' ');
  });
}

const SEA_UI_INK = '#dbe6ec';
const SEA_UI_TRACK = '#4a5f6b';
const SEA_UI_RULE = '#26323a';



function seaUiCss() {
  return [
    
    
    '@media (prefers-reduced-motion: reduce) {',
    '  #zz-sea-hud *, #zz-sea-menu * { transition: none !important; }',
    '}',
    '#zz-sea-menu, #zz-sea-menu * {',
    '  border-radius: 0 !important;',
    '  box-shadow: none !important;',
    '}',
    `#zz-sea-menu button, #zz-sea-menu label, #zz-sea-menu input { font-family: inherit; }`,
    '#zz-sea-menu button::before, #zz-sea-menu button::after,',
    '#zz-sea-menu input::before, #zz-sea-menu input::after { font-family: inherit; }',
    '#zz-sea-menu input[type="checkbox"], #zz-sea-menu input[type="radio"] {',
    '  appearance: none; -webkit-appearance: none;',
    '  width: 10px; height: 10px; flex: 0 0 10px;',
    '  margin: 0; padding: 0; border: 2px solid ' + SEA_UI_INK + ';',
    '  background-color: transparent; background-repeat: no-repeat;',
    '  background-position: center; box-sizing: border-box; cursor: pointer;',
    '}',
    '#zz-sea-menu input[type="checkbox"]:checked,',
    '#zz-sea-menu input[type="radio"]:checked {',
    '  background-image: linear-gradient(' + SEA_UI_INK + ', ' + SEA_UI_INK + ');',
    '}',
    '#zz-sea-menu input[type="checkbox"]:checked { background-size: 4px 4px; }',
    '#zz-sea-menu input[type="radio"]:checked { background-size: 8px 8px; }',
    '#zz-sea-menu input[type="checkbox"]:disabled,',
    '#zz-sea-menu input[type="radio"]:disabled { opacity: .35; cursor: default; }',
    '#zz-sea-menu input[type="range"] {',
    '  appearance: none; -webkit-appearance: none; height: 12px;',
    '  background: transparent;',
    '}',
    '#zz-sea-menu input[type="range"]::-webkit-slider-runnable-track {',
    '  height: 4px; background: ' + SEA_UI_TRACK + '; border: 0; border-radius: 0;',
    '  font-family: inherit;',
    '}',
    '#zz-sea-menu input[type="range"]::-webkit-slider-thumb {',
    '  -webkit-appearance: none; appearance: none; width: 10px; height: 10px;',
    '  margin-top: -3px; background: ' + SEA_UI_INK + '; border: 0; border-radius: 0;',
    '  font-family: inherit;',
    '}',
    '#zz-sea-menu input[type="range"]::-moz-range-track {',
    '  height: 4px; background: ' + SEA_UI_TRACK + '; border: 0; border-radius: 0;',
    '  font-family: inherit;',
    '}',
    '#zz-sea-menu input[type="range"]::-moz-range-thumb {',
    '  width: 10px; height: 10px; background: ' + SEA_UI_INK + ';',
    '  border: 0; border-radius: 0; font-family: inherit;',
    '}',
    '#zz-sea-menu fieldset { min-width: 0; }',
  ].join('\n');
}





function seaUiPlacement(rect, viewport, gap) {
  const g = gap === undefined ? SEA_UI_GAP : gap;
  return {
    right: viewport.width - rect.right,
    top: rect.bottom + g,
  };
}

function seaUiEl(tag, css) {
  const el = document.createElement(tag);
  if (css) el.style.cssText = css;
  return el;
}

function mountSeaUi(opts) {
  const getState = () => (opts && opts.getState ? opts.getState() : null);
  const onChange = patch => (opts && opts.onChange ? opts.onChange(patch) : null);
  const getStats = () => (opts && opts.getStats ? opts.getStats() : null);
  
  
  const isEnabled = () => !(opts && opts.getEnabled) || !!opts.getEnabled();

  let ui = null;                 
  let anchor = null;             

  function teardown() {
    if (ui) { ui.destroy(); ui = null; }
    anchor = null;
  }

  
  
  function tick() {
    if (!isEnabled()) { teardown(); return; }
    if (ui && anchor && anchor.isConnected &&
        document.getElementById(SEA_UI_WRAP_ID)) return;
    teardown();
    const live = document.querySelector('button[aria-label^="Notifications"]');
    if (!live) return;
    
    for (const id of [SEA_UI_WRAP_ID, SEA_UI_MENU_ID]) {
      const stale = document.getElementById(id);
      if (stale) stale.remove();
    }
    anchor = live;
    ui = build(live);
  }

  function refresh(state) {
    if (!isEnabled()) { teardown(); return; }
    if (!ui) tick();               
    const next = state || getState();
    if (ui && next) ui.sync(next);
  }

  function build(liveAnchor) {
    
    
    const hud = getComputedStyle(liveAnchor);
    const applyFont = el => {
      el.style.fontFamily = hud.fontFamily;
      el.style.fontSize = hud.fontSize;
      el.style.letterSpacing = hud.letterSpacing;
      el.style.color = hud.color;
    };

    
    
    
    
    
    
    
    const actions = liveAnchor.parentElement;  
    const header = liveAnchor.closest('header');
    const wrap = seaUiEl('div',
      'position:absolute;left:0;right:0;pointer-events:none;z-index:19');
    wrap.id = SEA_UI_WRAP_ID;
    applyFont(wrap);

    

    const button = seaUiEl('button', [
      'position:relative', 'width:30px', 'height:30px', 'margin:0', 'padding:0',
      'background:transparent', 'border:0', 'cursor:pointer', 'opacity:.6',
      'display:inline-flex', 'align-items:center', 'justify-content:center',
      'pointer-events:auto', 'transition:opacity .2s',
    ].join(';'));
    button.id = SEA_UI_BTN_ID;
    button.type = 'button';
    button.title = 'sea';
    button.setAttribute('aria-label', 'sea options');
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-expanded', 'false');
    applyFont(button);

    const wave = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    wave.setAttribute('width', '18');
    wave.setAttribute('height', '18');
    wave.setAttribute('viewBox', '0 0 12 12');
    wave.setAttribute('fill', 'currentColor');
    wave.setAttribute('aria-hidden', 'true');
    wave.setAttribute('focusable', 'false');
    wave.style.cssText = 'display:block;width:18px;height:18px;pointer-events:none;' +
      'opacity:.6;transition:opacity .2s';
    const wavePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    wavePath.setAttribute('d', SEA_UI_WAVE_PATH);
    wave.append(wavePath);

    
    
    const label = seaUiEl('span', [
      'position:absolute', 'right:34px', 'top:50%', 'transform:translateY(-50%)',
      'white-space:nowrap', 'max-width:0', 'margin-right:0', 'overflow:hidden',
      'opacity:0', 'pointer-events:none',
      'transition:max-width .55s cubic-bezier(.22,1,.36,1),' +
      'margin-right .55s cubic-bezier(.22,1,.36,1),' +
      'opacity .55s cubic-bezier(.22,1,.36,1)',
    ].join(';'));
    label.className = 'zz-sea-label';
    label.textContent = 'sea';
    applyFont(label);

    
    
    const loadingMark = seaUiEl('span', [
      'position:absolute', 'left:4px', 'right:4px', 'bottom:2px', 'height:2px',
      'background:currentColor', 'opacity:.8', 'pointer-events:none',
      'display:none',
    ].join(';'));
    loadingMark.id = 'zz-sea-loading';

    
    
    
    
    const updateArrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    updateArrow.setAttribute('width', '7.5');
    updateArrow.setAttribute('height', '7.5');
    updateArrow.setAttribute('viewBox', '0 0 5 5');
    updateArrow.setAttribute('fill', 'currentColor');
    updateArrow.setAttribute('aria-hidden', 'true');
    updateArrow.setAttribute('focusable', 'false');
    updateArrow.style.cssText = 'position:absolute;top:0;right:0;display:none;' +
      'width:7.5px;height:7.5px;pointer-events:none;shape-rendering:crispEdges';
    updateArrow.id = 'zz-sea-update-mark';
    const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arrowPath.setAttribute('d', SEA_UI_ARROW_PATH);
    updateArrow.append(arrowPath);

    button.append(wave, label, loadingMark, updateArrow);

    

    const rowCss = 'display:flex;align-items:center;gap:6px;margin:0 0 5px;' +
      'line-height:1.4;cursor:pointer';
    const groupCss = 'margin:7px 0 5px;border:0;padding:0';
    const titleCss = 'font-size:10px;letter-spacing:.08em;text-transform:uppercase;' +
      'opacity:.55;margin:0 0 4px';

    function row(input, text) {
      const el = seaUiEl('label', rowCss);
      el.style.fontFamily = 'inherit';
      el.append(input, document.createTextNode(text));
      return el;
    }

    
    function divider() {
      const el = seaUiEl('div',
        `height:2px;background:${SEA_UI_RULE};margin:8px 0;border:0`);
      el.setAttribute('aria-hidden', 'true');
      return el;
    }

    
    
    const menu = seaUiEl('div', [
      'position:fixed', 'width:190px', 'box-sizing:border-box',
      'background:#0a1016', 'border:2px solid ' + SEA_UI_RULE,
      'border-radius:0', 'padding:12px', 'overflow-y:auto',
      'pointer-events:auto', 'z-index:19',
    ].join(';'));
    menu.id = SEA_UI_MENU_ID;
    menu.hidden = true;
    menu.setAttribute('role', 'dialog');
    menu.setAttribute('aria-label', 'sea settings');
    applyFont(menu);

    const onBox = document.createElement('input');
    onBox.type = 'checkbox';
    onBox.style.margin = '0';
    onBox.style.fontFamily = 'inherit';
    const onRow = row(onBox, 'sea on/off');
    onRow.style.marginBottom = '6px';

    const quality = seaUiEl('fieldset', groupCss);
    const qualityTitle = seaUiEl('legend', titleCss);
    qualityTitle.textContent = 'quality';
    quality.append(qualityTitle);
    const radios = [];
    for (const id of MODE_IDS) {
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'zz-sea-mode';
      input.value = id;
      input.style.margin = '0';
      input.style.fontFamily = 'inherit';
      radios.push(input);
      quality.append(row(input, SEA_UI_MODE_LABELS[id] || id));
    }
    
    
    const note = seaUiEl('div', 'font-size:11px;line-height:1.35;opacity:.6;margin:2px 0 0');
    note.textContent = 'Animated modes need WebGL2 and an 8192 px texture limit.';
    note.hidden = true;
    quality.append(note);

    function rangeRow(text, min, max) {
      const el = seaUiEl('label', rowCss);
      el.style.fontFamily = 'inherit';
      const name = seaUiEl('span', 'flex:0 0 auto');
      name.textContent = text;
      const input = document.createElement('input');
      input.type = 'range';
      input.min = String(min);
      input.max = String(max);
      input.step = '1';
      input.style.flex = '1';
      input.style.minWidth = '0';
      input.style.margin = '0';
      input.style.fontFamily = 'inherit';
      const out = seaUiEl('span',
        'flex:0 0 34px;text-align:right;opacity:.7;font-variant-numeric:tabular-nums');
      el.append(name, input, out);
      
      
      
      
      input.addEventListener('wheel', e => {
        if (!e.deltaY) return;
        e.preventDefault();
        const step = e.shiftKey ? 5 : 1;
        input.value = String(Number(input.value) - Math.sign(e.deltaY) * step);
        
        
        
        const ev = new Event('input', { bubbles: true });
        ev.zzWheel = true;
        input.dispatchEvent(ev);
      }, { passive: false });
      return { el, input, out };
    }

    const opacity = rangeRow('opacity', 0, 100);
    const brightness = rangeRow('brightness', 50, 150);
    const hue = rangeRow('hue', -180, 180);
    const sat = rangeRow('saturation', 0, 120);

    
    
    
    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.id = 'zz-sea-reset';
    resetBtn.textContent = 'reset';
    resetBtn.title = 'brightness 110, hue 0, saturation 100, opacity 100';
    resetBtn.style.cssText = 'margin:0;padding:2px 6px;' +
      'background:#121a21;border:2px solid #3a4a55;border-radius:0;' +
      'color:inherit;font:inherit;font-family:inherit;font-size:10px;' +
      'cursor:pointer;display:block;margin-left:auto';

    const fpsBox = document.createElement('input');
    fpsBox.type = 'checkbox';
    fpsBox.style.margin = '0';
    fpsBox.style.fontFamily = 'inherit';
    const fpsRow = row(fpsBox, 'adaptive fps');
    fpsRow.style.marginBottom = '0';

    
    const cap = seaUiEl('fieldset', groupCss);
    const capTitle = seaUiEl('legend', titleCss);
    capTitle.textContent = 'frame cap';
    cap.append(capTitle);
    const capRadios = [];
    for (const id of FRAME_CAPS) {
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'zz-sea-cap';
      input.value = String(id);
      input.style.margin = '0';
      input.style.fontFamily = 'inherit';
      capRadios.push(input);
      cap.append(row(input, SEA_UI_CAP_LABELS[id]));
    }

    const hiddenBox = document.createElement('input');
    hiddenBox.type = 'checkbox';
    hiddenBox.style.margin = '0';
    hiddenBox.style.fontFamily = 'inherit';
    const hiddenRow = row(hiddenBox, 'static when tabbed out');
    hiddenRow.style.marginBottom = '0';

    
    
    
    
    const updateLine = document.createElement('button');
    updateLine.type = 'button';
    updateLine.id = 'zz-sea-update';
    updateLine.title = 'check now';
    updateLine.style.cssText = 'display:block;width:100%;margin:0;padding:0;' +
      'background:transparent;border:0;border-radius:0;color:inherit;' +
      'font:inherit;font-family:inherit;font-size:10px;line-height:1.4;' +
      'text-align:left;opacity:.7;cursor:pointer;overflow-wrap:anywhere';

    
    
    
    const updateMain = seaUiEl('span', '');
    const updateGet = seaUiEl('span',
      'font-weight:600;text-decoration:underline;margin-left:4px');
    updateLine.append(updateMain);

    const status = document.createElement('div');
    status.id = 'zz-sea-status';
    status.hidden = true;
    status.style.cssText = 'font-size:11px;line-height:1.35;opacity:.75;' +
      'margin:0 0 5px;overflow-wrap:anywhere';

    const retryBtn = document.createElement('button');
    retryBtn.type = 'button';
    retryBtn.id = 'zz-sea-retry';
    retryBtn.textContent = 'retry';
    retryBtn.style.cssText = 'display:none;margin:0 0 6px;padding:2px 6px;' +
      'background:#121a21;border:2px solid #3a4a55;border-radius:0;' +
      'color:inherit;font:inherit;font-family:inherit;font-size:10px;cursor:pointer';

    
    
    const diag = seaUiEl('div', 'display:flex;align-items:flex-start;gap:6px;margin:0');
    const diagText = seaUiEl('div', 'flex:1;min-width:0;font-family:inherit;' +
      'font-size:10px;line-height:1.4;opacity:.6');
    const diagLine1 = seaUiEl('div', 'white-space:normal;overflow-wrap:anywhere');
    const diagLine2 = seaUiEl('div', 'white-space:nowrap;overflow:hidden;text-overflow:ellipsis');
    diagText.append(diagLine1, diagLine2);
    diag.append(diagText);

    
    const diagnostics = seaUiEl('div', 'display:block;margin:0');
    diagnostics.append(status, retryBtn, diag);

    
    
    function paintUpdate(u) {
      const available = !!(u && u.available);
      
      
      
      const requested = !!(u && u.requested);
      const active = available || requested;
      updateArrow.style.display = active ? 'block' : 'none';
      button.title = requested ? 'sea — reload to finish updating'
        : available ? 'sea — update available' : 'sea';
      
      
      updateLine.style.opacity = active ? '1' : '.7';
      if (requested) {
        updateMain.textContent = `${u.latest} ready —`;
        updateGet.textContent = 'reload';
        if (!updateGet.parentNode) updateLine.append(updateGet);
        updateLine.title = `update ${u.latest} is installed; this page is still running ${u.current}`;
        return;
      }
      if (available) {
        updateMain.textContent = `${u.latest} available —`;
        updateGet.textContent = 'get';
        if (!updateGet.parentNode) updateLine.append(updateGet);
        updateLine.title = `update ${u.latest} (installed ${u.current})`;
        return;
      }
      if (updateGet.parentNode) updateGet.remove();
      if (!u) {
        updateMain.textContent = 'update';
        updateLine.title = 'check now';
      } else if (u.error) {
        updateMain.textContent = `couldn't check for updates · ${u.current}`;
        updateLine.title = String(u.error);
      } else if (u.latest) {
        updateMain.textContent = `up to date · ${u.current}`;
        updateLine.title = 'check again';
      } else {
        updateMain.textContent = `checking… · ${u.current}`;
        updateLine.title = 'check now';
      }
    }

    
    function paintStats(s) {
      if (!s) {
        diagLine1.textContent = '';
        diagLine2.textContent = '';
        return;
      }
      const mb = (Number(s.vramMB) || 0).toFixed(1);
      const kind = s.mode === 'static' ? 'image' : 'VRAM';
      const fps = Math.round(Number(s.fps) || 0);
      const ms = (Number(s.ms) || 0).toFixed(1);
      diagLine1.textContent = `${mb} MB ${kind} · ${fps} fps · ${ms} ms ${s.msKind || 'cpu'}`;
      diagLine2.textContent = s.renderer || '';
    }

    let statsTimer = 0;
    function stopStats() {
      if (statsTimer) clearInterval(statsTimer);
      statsTimer = 0;
    }
    function startStats() {
      stopStats();
      paintStats(getStats());
      statsTimer = setInterval(() => paintStats(getStats()), 500);
    }

    
    
    
    menu.append(
      onRow, quality, fpsRow, cap, hiddenRow, divider(),
      opacity.el, brightness.el, hue.el, sat.el, resetBtn, divider(),
      updateLine, diagnostics,
    );

    const css = document.createElement('style');
    css.textContent = seaUiCss();
    wrap.append(css, button);
    if (header && header.parentElement) {
      wrap.style.top = `${header.offsetTop}px`;
      wrap.style.height = `${header.offsetHeight}px`;
      header.after(wrap);
    } else {
      wrap.style.top = '0px';
      wrap.style.height = '36px';
      document.body.append(wrap);
    }
    document.body.append(menu);

    
    
    button.style.position = 'absolute';
    button.style.right = `${SEA_UI_RIGHT}px`;
    button.style.top = '100%';
    button.style.marginTop = `${SEA_UI_GAP}px`;
    button.style.pointerEvents = 'auto';

    
    function syncTransform() {
      const t = actions &&
        (actions.style.transform || getComputedStyle(actions).transform);
      button.style.transform = !t || t === 'none' ? '' : t;
    }
    syncTransform();

    

    function sync(s) {
      if (!s) return;
      onBox.checked = !!s.on;
      const shaderOff = s.canUseShader === false;
      for (const input of radios) {
        input.checked = input.value === s.mode;
        if (input.value !== 'static') input.disabled = shaderOff;
      }
      note.hidden = !shaderOff;
      const op = Math.round((Number.isFinite(s.opacity) ? s.opacity : 1) * 100);
      opacity.input.value = String(op);
      opacity.out.textContent = String(op);
      const br = Math.round((Number.isFinite(s.brightness) ? s.brightness : 1) * 100);
      brightness.input.value = String(br);
      brightness.out.textContent = `${br}%`;
      const hu = Math.round(Number.isFinite(s.hue) ? s.hue : 0);
      hue.input.value = String(hu);
      hue.out.textContent = `${hu}°`;
      const sa = Math.round(Number.isFinite(s.sat) ? s.sat : 100);
      sat.input.value = String(sa);
      sat.out.textContent = `${sa}%`;
      paintUpdate(s.update);
      fpsBox.checked = !!s.fps30;
      const capValue = Number(s.frameCap) || 0;
      for (const input of capRadios) input.checked = Number(input.value) === capValue;
      hiddenBox.checked = !!s.staticWhenHidden;

      
      
      const loading = !!s.loading;
      loadingMark.style.display = loading ? 'block' : 'none';
      const err = s.error ? String(s.error) : '';
      status.textContent = loading ? 'loading sea…' : err;
      status.title = err;
      status.hidden = !status.textContent;
      retryBtn.style.display =
        err && !loading && s.canUseShader !== false ? 'inline-block' : 'none';

      
      if (open) paintStats(getStats());
    }

    function emit(patch) {
      const next = onChange(patch);
      if (next) sync(next);
    }

    

    
    
    function reposition() {
      if (menu.hidden) return;
      const r = button.getBoundingClientRect();
      if (!r.width && !r.height) return;
      const view = { width: window.innerWidth, height: window.innerHeight };
      const place = seaUiPlacement({ right: r.right, bottom: r.bottom }, view);
      menu.style.right = `${place.right}px`;
      menu.style.top = `${place.top}px`;
      
      
      menu.style.maxHeight = `${Math.max(0, view.height - place.top - 8)}px`;
    }

    

    let open = false;

    function setOpen(next) {
      open = !!next;
      menu.hidden = !open;
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        sync(getState());          
        startStats();              
        reposition();
      } else {
        stopStats();
      }
    }

    
    
    
    
    const WAVE_MS = 350;
    const waveEase = bezierEase(0.4, 0, 0.2, 1);
    const wavePaths = waveFrames(SEA_UI_WAVE_PATH, 12, true);
    const calm = !!(window.matchMedia &&
      matchMedia('(prefers-reduced-motion: reduce)').matches);
    let waveRaf = 0;
    let wavePos = 0;        
    let waveFrom = 0;
    let waveAt = 0;
    let waveDur = WAVE_MS;

    function paintWave(pos) {
      const n = wavePaths.length;
      wavePath.setAttribute('d', wavePaths[Math.round(pos * n) % n]);
    }

    function waveStep(now) {
      const t = Math.min(1, (now - waveAt) / waveDur);
      wavePos = waveFrom + (1 - waveFrom) * waveEase(t);
      paintWave(wavePos);
      if (t < 1) {
        waveRaf = requestAnimationFrame(waveStep);
        return;
      }
      
      waveRaf = 0;
      wavePos = 0;
      paintWave(0);
    }

    
    
    
    function runWave() {
      if (calm || waveRaf) return;
      waveFrom = wavePos;
      waveDur = Math.max(16, WAVE_MS * (1 - waveFrom));
      waveAt = performance.now();
      waveRaf = requestAnimationFrame(waveStep);
    }

    function showLabel(on) {
      label.style.maxWidth = on ? '200px' : '0px';
      label.style.marginRight = on ? '4px' : '0px';
      label.style.opacity = on ? '.6' : '0';
      
      button.style.opacity = on ? '1' : '.6';
      wave.style.opacity = on ? '1' : '.6';
      if (on) runWave();
    }

    button.addEventListener('click', () => setOpen(!open));
    button.addEventListener('mouseenter', () => showLabel(true));
    button.addEventListener('mouseleave', () => showLabel(false));
    button.addEventListener('focus', () => showLabel(true));
    button.addEventListener('blur', () => showLabel(false));

    onBox.addEventListener('change', () => emit({ on: onBox.checked }));
    for (const input of radios) {
      input.addEventListener('change', () => {
        if (input.checked) emit({ mode: input.value });
      });
    }
    opacity.input.addEventListener('input', () => {
      opacity.out.textContent = opacity.input.value;
      emit({ opacity: Number(opacity.input.value) / 100 });
    });
    
    
    
    const snapInput = (e, raw, targets) => (e && e.zzWheel ? Number(raw)
      : snapTo(raw, targets));

    
    brightness.input.addEventListener('input', e => {
      const v = snapInput(e, brightness.input.value, [SNAP_AT]);
      brightness.input.value = String(v);
      brightness.out.textContent = `${v}%`;
      emit({ brightness: v / 100 });
    });
    hue.input.addEventListener('input', e => {
      const v = snapInput(e, hue.input.value, [0]);
      hue.input.value = String(v);
      hue.out.textContent = `${v}°`;
      emit({ hue: v });
    });
    sat.input.addEventListener('input', e => {
      const v = snapInput(e, sat.input.value, [0, 100]);
      sat.input.value = String(v);
      sat.out.textContent = `${v}%`;
      emit({ sat: v });
    });
    resetBtn.addEventListener('click', () => emit({ reset: true }));
    updateLine.addEventListener('click', () => {
      const u = (getState() || {}).update;
      
      
      if (u && u.requested) {
        location.reload();
        return;
      }
      if (u && u.available) {
        emit({ updateGet: true });
        return;
      }
      emit({ updateCheck: true });
    });
    fpsBox.addEventListener('change', () => emit({ fps30: fpsBox.checked }));
    for (const input of capRadios) {
      input.addEventListener('change', () => {
        if (input.checked) emit({ frameCap: Number(input.value) });
      });
    }
    hiddenBox.addEventListener('change', () =>
      emit({ staticWhenHidden: hiddenBox.checked }));
    retryBtn.addEventListener('click', () => emit({ retry: true }));

    const onResize = () => reposition();

    const onPointerDown = e => {
      if (open && !wrap.contains(e.target) && !menu.contains(e.target)) {
        setOpen(false);
      }
    };

    const onKeyDown = e => {
      if (open && e.key === 'Escape') {
        setOpen(false);
        button.focus();
      }
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);

    
    
    const rowObserver = new MutationObserver(() => {
      syncTransform();
      reposition();
    });
    if (actions) {
      rowObserver.observe(actions, { attributes: true, attributeFilter: ['style'] });
    }

    sync(getState());

    function destroy() {
      stopStats();
      if (waveRaf) cancelAnimationFrame(waveRaf);
      rowObserver.disconnect();
      window.removeEventListener('scroll', onResize, true);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
      wrap.remove();
      menu.remove();
    }

    return { sync, destroy };
  }

  

  const target = document.body || document.documentElement;
  const observer = new MutationObserver(tick);
  observer.observe(target, { childList: true, subtree: true });

  const started = Date.now();
  const interval = setInterval(() => {
    tick();
    if (ui || Date.now() - started >= SEA_UI_MOUNT_MS) clearInterval(interval);
  }, 500);
  tick();

  return {
    refresh,
    destroy() {
      clearInterval(interval);
      observer.disconnect();
      teardown();
    },
  };
}

/* ---- sea.js ---- */
(() => {
  'use strict';

  const OV_ID = 'zz-sea';
  const GL_ID = 'zz-sea-gl';
  const OUTDATED_ID = 'zz-sea-outdated';
  const WARP_MAX = 3.0;            

  
  
  
  let activePointer = parsePointer(null, seaConsts);
  let pointerLoaded = false;
  let pointerPromise = null;
  const mapW = () => activePointer.map.w;   
  const mapH = () => activePointer.map.h;

  
  
  
  
  const initialGate = paintHold();
  const initialMapCheck = initialGate.promise;
  
  
  
  
  const MANIFEST_TIMEOUT_MS = 5000;
  const INITIAL_HOLD_MS = MANIFEST_TIMEOUT_MS;
  let initialHoldTimer = setTimeout(() => settleInitialGate(null),
                                    INITIAL_HOLD_MS);

  const assetBase = window.__ZZ_SEA_ASSET_BASE || undefined;
  const errText = e => String((e && e.message) || e);

  
  
  
  function assetSources(name, rootVersion = activePointer.assetVersion) {
    return assetSourceList(name, {
      base: assetBase,
      assetVersion: activePointer.assetVersion,
      rootVersion,
      inlinedVersion: seaConsts.assetVersion,
      pointerLoaded,
    });
  }

  function fetchAsset(sources, label) {
    const attempt = i => fetch(sources[i])
      .then(res => {
        if (!res.ok) throw new Error(`${label}: HTTP ${res.status}`);
        return res;
      })
      .catch(e => {
        if (i + 1 < sources.length) return attempt(i + 1);
        throw e;
      });
    return attempt(0);
  }

  const POINTER_TIMEOUT_MS = 2500;

  
  
  
  function loadPointer() {
    if (pointerPromise) return pointerPromise;
    const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), POINTER_TIMEOUT_MS) : 0;
    pointerPromise = fetch(pointerUrl(assetBase), {
      cache: 'no-cache',
      signal: ctrl ? ctrl.signal : undefined,
    })
      .then(res => {
        if (!res.ok) throw new Error(`pointer: HTTP ${res.status}`);
        return res.json();
      })
      .then(json => {
        activePointer = parsePointer(json, seaConsts);
        pointerLoaded = true;
        return activePointer;
      })
      .catch(() => activePointer)
      .finally(() => { if (timer) clearTimeout(timer); });
    return pointerPromise;
  }

  
  
  
  function probeShader() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2');
      if (!gl) return { webgl2: false, maxTextureSize: 0 };
      const maxTextureSize = Number(gl.getParameter(gl.MAX_TEXTURE_SIZE)) || 0;
      const lose = gl.getExtension('WEBGL_lose_context');
      if (lose) { try { lose.loseContext(); } catch {} }
      return { webgl2: true, maxTextureSize };
    } catch {
      return { webgl2: false, maxTextureSize: 0 };
    }
  }

  const probe = probeShader();
  const canUseShader = shaderCapable(probe.webgl2, probe.maxTextureSize);

  
  
  const saved = parseState({
    mode: localStorage.getItem('zz-sea-mode'),
    on: localStorage.getItem('zz-sea-on'),
    opacity: localStorage.getItem('zz-sea-opacity'),
    brightness: localStorage.getItem('zz-sea-brightness'),
    hue: localStorage.getItem('zz-sea-hue'),
    sat: localStorage.getItem('zz-sea-sat'),
    fps30: localStorage.getItem('zz-sea-fps'),
    frameCap: localStorage.getItem('zz-sea-cap'),
    staticWhenHidden: localStorage.getItem('zz-sea-hidden'),
  });

  const env = {
    webgl2: probe.webgl2, maxTextureSize: probe.maxTextureSize,
    coarsePointer: !!(window.matchMedia && matchMedia('(pointer: coarse)').matches),
    narrow: window.innerWidth < 700,
  };
  
  
  
  const startupMode = canUseShader ? pickMode(saved.mode, env) : 'static';

  const state = {
    on: saved.on,
    mode: 'static',                
    img: null, raf: 0, timer: 0, sig: '', draws: 0,
    opacity: saved.opacity, brightness: saved.brightness, hue: saved.hue,
    sat: saved.sat, fps30: saved.fps30,
    frameCap: saved.frameCap, staticWhenHidden: saved.staticWhenHidden,
    glReady: false, error: null, loading: false, moving: false,
    colourFormat: null,            
    canUseShader, maxTextureSize: probe.maxTextureSize,
    whalePose: null,               
    mapOutdated: false,            
    liveMapStamp: null,
    mapCheck: {
      status: 'unknown',
      pointerStamp: activePointer.map.stamp,
      liveStamp: null,
      source: 'none',
      assetVersion: activePointer.assetVersion,
    },
  };
  window.__zzSea = state;

  
  
  
  
  
  const CLOCK_TIMEOUT_MS = 1500;
  const CLOCK_EASE_MS = 2000;
  const CLOCK_JUMP_SEC = 1;
  
  
  const CLOCK_URL = '/logos/logoicon.webp';

  let whaleRoute = null;        
  let whaleLoad = null;         
  let whaleEnabled = true;      
  let whalePinSec = null;       
  let whalePinPose = null;      

  
  
  
  
  
  
  const WAKE_SEC = 4.5;         
  const WAKE_SPREAD = 0.9;      
  const WAKE_R0 = 4.0;          
  const whaleWake = new Float32Array(4);
  let wakePeak = 0;             
  let wakeAt = 0;               
  let wakeX = 0;
  let wakeY = 0;

  function updateWhaleWake(nowMs, pose) {
    if (!pose) {
      wakePeak = 0;
      whaleWake[2] = 0;
      return;
    }
    const surf = clamp(1 - pose.depth / 1.5, 0, 1);
    if (surf > 0.05) {
      wakeX = pose.x;
      wakeY = pose.y;
      wakePeak = Math.max(surf, wakePeak);
      wakeAt = nowMs;
      whaleWake[0] = wakeX;
      whaleWake[1] = wakeY;
      whaleWake[2] = wakePeak;
      whaleWake[3] = WAKE_R0;
      return;
    }
    if (wakePeak <= 0) {
      whaleWake[2] = 0;
      return;
    }
    const age = Math.max(0, nowMs - wakeAt) / 1000;
    const k = 1 - age / WAKE_SEC;
    if (k <= 0) {
      wakePeak = 0;
      whaleWake[2] = 0;
      return;
    }
    whaleWake[0] = wakeX;
    whaleWake[1] = wakeY;
    whaleWake[2] = wakePeak * k * k;     
    whaleWake[3] = WAKE_R0 + age * WAKE_SPREAD;
  }
  let clockSource = 'local';    

  
  
  let wallAnchorFrom = Date.now() / 1000 - performance.now() / 1000;
  let wallAnchorTo = wallAnchorFrom;
  let wallAnchorEaseStart = 0;
  let wallAnchorEasing = false;

  function wallAnchorAt(nowMs) {
    if (!wallAnchorEasing) return wallAnchorTo;
    const u = clamp((nowMs - wallAnchorEaseStart) / CLOCK_EASE_MS, 0, 1);
    if (u >= 1) {
      wallAnchorEasing = false;
      wallAnchorFrom = wallAnchorTo;
      return wallAnchorTo;
    }
    return wallAnchorFrom + (wallAnchorTo - wallAnchorFrom) * u;
  }

  function wallNow(nowMs) {
    return wallAnchorAt(nowMs) + nowMs / 1000;
  }

  function setWallAnchor(anchorSec, source, immediate) {
    if (!isFinite(anchorSec)) return;
    const now = performance.now();
    const current = wallAnchorAt(now);
    clockSource = source;
    if (immediate) {
      wallAnchorFrom = wallAnchorTo = anchorSec;
      wallAnchorEasing = false;
      return;
    }
    
    
    if (Math.abs(anchorSec - current) < CLOCK_JUMP_SEC) return;
    wallAnchorFrom = current;
    wallAnchorTo = anchorSec;
    wallAnchorEaseStart = now;
    wallAnchorEasing = true;
  }

  function anchorClock(immediate) {
    const t0 = performance.now();
    let timer = 0;
    try {
      const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
      if (ctrl) timer = setTimeout(() => ctrl.abort(), CLOCK_TIMEOUT_MS);
      fetch(CLOCK_URL, {
        method: 'HEAD',
        cache: 'no-store',
        signal: ctrl ? ctrl.signal : undefined,
      }).then(res => {
        const t1 = performance.now();
        const date = res.headers.get('Date');
        const serverEpochSec = date ? Date.parse(date) / 1000 : NaN;
        
        
        
        if (!isFinite(serverEpochSec) || t1 - t0 > CLOCK_TIMEOUT_MS) {
          throw new Error('clock: HEAD timeout or no Date header');
        }
        const localEpochSec = Date.now() / 1000;
        const serverNow = localEpochSec
          + clockOffset(serverEpochSec, t1 - t0, localEpochSec);
        setWallAnchor(serverNow - t1 / 1000, 'network', immediate);
      }).catch(() => {
        
      }).finally(() => {
        if (timer) clearTimeout(timer);
      });
    } catch {
      if (timer) clearTimeout(timer);
    }
  }

  function loadWhale() {
    if (whaleRoute) return Promise.resolve(whaleRoute);
    if (whaleLoad) return whaleLoad;
    try {
      whaleLoad = fetchAsset(assetSources('sea-zag-whale.bin', activePointer.whaleVersion), 'whale route')
        .then(res => res.arrayBuffer())
        .then(buf => {
          whaleRoute = parseWhaleRoute(buf);
          return whaleRoute;
        })
        .catch(() => null)          
        .finally(() => { whaleLoad = null; });
    } catch {
      whaleLoad = null;
    }
    return whaleLoad || Promise.resolve(null);
  }

  
  
  
  
  
  
  
  
  
  const TEXELS_PER_TILE = 4;
  const SWIM_LOOP_SEC = 3.916;       
  let whaleMesh = null;
  let whaleMeshLoad = null;
  let whaleTexSize = [92, 34];
  let whaleTexBuf = new Uint8Array(92 * 34 * 4);
  let whalePos = null;
  let whaleHalf = [5.5, 2.0];        
  let whaleHeight = 1.0;             
  let whalePhase = 0;
  let whaleTurn = 0;
  let whaleSurfTime = 0;   
  let whaleSurfPose = 0;   
  let whalePrevHeading = null;
  let whalePrevMs = 0;

  function whaleTexture(gl) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, whaleTexSize[0], whaleTexSize[1], 0,
      gl.RGBA, gl.UNSIGNED_BYTE, whaleTexBuf);
    return tex;
  }

  function loadWhaleMesh() {
    if (whaleMesh) return Promise.resolve(whaleMesh);
    if (whaleMeshLoad) return whaleMeshLoad;
    try {
      whaleMeshLoad = fetchAsset(assetSources('sea-zag-whale-mesh.bin', activePointer.meshVersion), 'whale mesh')
        .then(res => res.arrayBuffer())
        .then(buf => {
          whaleMesh = parseWhaleMesh(buf);
          const h = whaleMesh.half;
          const zr = whaleMesh.zrange;
          const scale = WHALE_SHAPE.halfLen / Math.max(1e-6, h[0]);
          whaleHalf = [WHALE_SHAPE.halfLen, h[1] * scale];
          whaleHeight = Math.max(0.2, (zr[1] - zr[0]) * scale);
          
          
          const tall = Math.max(4, Math.round(2 * WHALE_SHAPE.halfLen * TEXELS_PER_TILE));
          whaleTexSize = [tall, Math.max(4, Math.round(tall * (h[1] / Math.max(1e-6, h[0]))))];
          whaleTexBuf = new Uint8Array(whaleTexSize[0] * whaleTexSize[1] * 4);
          whalePos = new Float32Array(whaleMesh.nverts * 3);
          return whaleMesh;
        })
        .catch(() => null)          
        .finally(() => { whaleMeshLoad = null; });
    } catch {
      whaleMeshLoad = null;
    }
    return whaleMeshLoad || Promise.resolve(null);
  }

  
  function updateWhaleMesh(nowMs) {
    const p = state.whalePose;
    if (!whaleMesh || !p) return;
    const dt = whalePrevMs ? Math.min(0.25, Math.max(0, (nowMs - whalePrevMs) / 1000)) : 0;
    whalePrevMs = nowMs;
    whalePhase = (whalePhase + dt / SWIM_LOOP_SEC) % 1;
    if (whalePrevHeading !== null && dt > 1e-3) {
      let dh = p.heading - whalePrevHeading;
      while (dh > Math.PI) dh -= Math.PI * 2;
      while (dh < -Math.PI) dh += Math.PI * 2;
      
      
      
      const want = Math.max(-1, Math.min(1, (dh / dt) / 0.065));
      whaleTurn += (want - whaleTurn) * Math.min(1, dt * 6);
    }
    whalePrevHeading = p.heading;
    
    
    const nearSurface = p.depth < 1.0;
    whaleSurfTime = nearSurface ? whaleSurfTime + dt : 0;
    const u = Math.max(0, Math.min(1, (whaleSurfTime - 1.5) / 1.7));
    const surfWant = nearSurface ? u * u * (3 - 2 * u) : 0;
    const ease = surfWant > whaleSurfPose ? 1.2 : 1.6;
    whaleSurfPose += (surfWant - whaleSurfPose) * Math.min(1, dt * ease);
    whalePos = poseWhale(whaleMesh, whalePhase, whaleTurn, whaleSurfPose, whalePos);
    rasterWhale(whaleMesh, whalePos, {
      w: whaleTexSize[0], h: whaleTexSize[1], out: whaleTexBuf,
      depth: p.depth, maxDepth: 14,
    });
    updateWhaleWake(nowMs, p);
    if (glc) glc.whaleDirty = true;
  }

  function updateWhalePose(nowMs) {
    if (state.mapOutdated) { paintOutdatedPlaceholder(); return; }
    if (state.mode === 'static' || !whaleEnabled || !whaleRoute || !mapGateOpen) {
      state.whalePose = null;
      return;
    }
    if (whalePinPose) {
      state.whalePose = whalePinPose;
      updateWhaleMesh(nowMs);
      return;
    }
    const tSec = whalePinSec !== null ? whalePinSec : wallNow(nowMs);
    setWhalePose(sampleWhale(whaleRoute, tSec));
    updateWhaleMesh(nowMs);
  }

  function whaleStats() {
    const p = state.whalePose;
    return {
      loaded: !!whaleRoute,
      timeSource: clockSource,
      x: p ? p.x : null,
      y: p ? p.y : null,
      depth: p ? p.depth : null,
      heading: p ? p.heading : null,
    };
  }

  
  
  function setWhale(arg) {
    if (arg === false) {
      whaleEnabled = false;
      whalePinSec = null;
      whalePinPose = null;
      state.whalePose = null;
      return whaleStats();
    }
    if (arg === null) {
      whaleEnabled = true;
      whalePinSec = null;
      whalePinPose = null;
      updateWhalePose(performance.now());
      return whaleStats();
    }
    if (arg && typeof arg === 'object' && arg.t !== undefined) {
      const t = Number(arg.t);
      if (isFinite(t)) {
        whaleEnabled = true;
        whalePinSec = t;
        whalePinPose = null;
        updateWhalePose(performance.now());
      }
    }
    return whaleStats();
  }

  
  
  
  
  function setWhaleAt(pose) {
    if (pose === null || pose === undefined) {
      whalePinPose = null;
      updateWhalePose(performance.now());
      return whaleStats();
    }
    
    
    const src = {
      x: state.camTarget ? state.camTarget[0] : 0,
      y: state.camTarget ? state.camTarget[1] : 0,
      ...(pose && typeof pose === 'object' ? pose : {}),
    };
    const p = {
      x: Number(src.x), y: Number(src.y),
      heading: Number(src.heading || 0), depth: Number(src.depth || 0),
    };
    if ([p.x, p.y, p.heading, p.depth].every(isFinite)) {
      whaleEnabled = true;
      whalePinSec = null;
      whalePinPose = p;
      updateWhalePose(performance.now());
    }
    return whaleStats();
  }


  
  
  let wantedMode = startupMode;

  
  
  let seaUi = null;
  function refreshUi() {
    if (seaUi) seaUi.refresh(uiState());
  }

  
  
  
  let pendingMode = null;
  let deckObserver = null;
  let deckTimer = 0;
  let deckWatchStart = 0;

  
  
  
  let holdStatic = false;
  const staticVisible = () => state.mode === 'static' || holdStatic;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const deckCanvas = () => document.getElementById('deckgl-overlay');

  
  
  
  
  
  
  
  
  
  
  let pirateRawLayers = null;    

  function hidePirateOcean(deck) {
    if (!deck || deck.__zzSeaOceanFiltered || typeof deck.setProps !== 'function') {
      return deck;
    }
    deck.__zzSeaOceanFiltered = true;
    const pass = deck.setProps.bind(deck);
    deck.setProps = next => {
      if (next && Array.isArray(next.layers)) {
        pirateRawLayers = next.layers;
        const kept = state.on ? withoutPirateOcean(next.layers) : next.layers;
        if (kept !== next.layers) next = { ...next, layers: kept };
      }
      return pass(next);
    };
    
    
    const live = deck.props && deck.props.layers;
    if (Array.isArray(live)) pirateRawLayers = live;
    if (Array.isArray(live) && state.on && withoutPirateOcean(live) !== live) {
      pass({ layers: withoutPirateOcean(live) });
    }
    return deck;
  }

  
  
  
  function syncPirateOcean() {
    const deck = deckInstance;
    if (!deck || !pirateRawLayers || typeof deck.setProps !== 'function') return;
    const want = state.on ? withoutPirateOcean(pirateRawLayers) : pirateRawLayers;
    if (deck.props && deck.props.layers !== want) deck.setProps({ layers: want });
  }

  let deckInstance = null;
  function findDeck(canvas) {
    if (deckInstance && deckInstance.canvas === canvas) return deckInstance;
    const key = Object.keys(canvas).find(k => k.startsWith('__reactFiber'));
    if (!key) return null;
    const isDeck = v => !!(v && v.canvas === canvas && v.viewManager);
    for (let f = canvas[key]; f; f = f.return) {
      if (isDeck(f.stateNode && f.stateNode.deck)) {
        return (deckInstance = hidePirateOcean(f.stateNode.deck));
      }
      for (let hook = f.memoizedState; hook; hook = hook.next) {
        if (isDeck(hook.memoizedState && hook.memoizedState.current && hook.memoizedState.current.deck)) {
          return (deckInstance = hidePirateOcean(hook.memoizedState.current.deck));
        }
      }
    }
    return null;
  }

  
  
  
  
  let mapFiber = null;
  let mapFiberCanvas = null;
  function mapStatus() {
    const canvas = deckCanvas();
    if (!canvas) return null;
    if (mapFiberCanvas !== canvas) { mapFiberCanvas = canvas; mapFiber = null; }
    const usable = f => !!(f && f.memoizedProps && 'status' in f.memoizedProps);
    if (!usable(mapFiber)) {
      mapFiber = null;
      const key = Object.keys(canvas).find(k => k.startsWith('__reactFiber'));
      if (!key) return null;
      for (let f = canvas[key]; f; f = f.return) {
        const p = f.memoizedProps;
        if (p && 'status' in p && 'layers' in p && 'viewState' in p) { mapFiber = f; break; }
      }
    }
    if (!mapFiber) return null;
    const s = mapFiber.memoizedProps.status;
    return s === undefined ? null : s;
  }

  
  
  
  
  
  
  
  function mapVariant() {
    const canvas = deckCanvas();
    if (!canvas) return null;
    const key = Object.keys(canvas).find(k => k.startsWith('__reactFiber'));
    if (!key) return null;
    
    
    
    for (let f = canvas[key]; f; f = f.return) {
      const rc = f.memoizedProps && f.memoizedProps.routeContext;
      if (!rc || !rc.matches) continue;
      const route = rc.matches.length ? rc.matches[rc.matches.length - 1].route : null;
      const v = route && route.handle && route.handle.mapVariant;
      return typeof v === 'string' ? v : null;
    }
    return null;
  }

  
  const onExplorationMap = () => mapVariant() === 'music';

  
  
  
  
  
  function viewState(canvas) {
    const deck = findDeck(canvas);
    const propsState = () => {
      const key = Object.keys(canvas).find(k => k.startsWith('__reactFiber'));
      if (key) {
        for (let f = canvas[key]; f; f = f.return) {
          const vs = f.memoizedProps && f.memoizedProps.viewState;
          if (vs) return vs;
        }
      }
      return (deck && deck.props && deck.props.viewState) || null;
    };
    const live = deck && deck.viewManager && deck.viewManager.viewState;
    
    
    if (live && live.target && isFinite(live.zoom) && live.padding) {
      return { source: 'viewManager', target: live.target, zoom: live.zoom, padding: live.padding };
    }
    const fallback = propsState() || {};
    
    if (live && (live.target || isFinite(live.zoom))) {
      return {
        source: 'viewManager',
        target: live.target || fallback.target,
        zoom: isFinite(live.zoom) ? live.zoom : fallback.zoom,
        padding: live.padding || fallback.padding,
      };
    }
    return fallback.target
      ? { source: 'props', target: fallback.target, zoom: fallback.zoom, padding: fallback.padding }
      : null;
  }

  function liveViewState() {
    const c = deckCanvas();
    const vs = c && viewState(c);
    if (!vs) return null;
    return { source: vs.source, target: vs.target, zoom: vs.zoom, padding: vs.padding };
  }

  

  function overlay(deck) {
    let ov = document.getElementById(OV_ID);
    if (!ov) {
      ov = document.createElement('canvas');
      ov.id = OV_ID;
    }
    
    
    const noise = document.getElementById(NOISE_ID);
    const marker = noise && noise.parentNode === deck.parentNode ? noise : deck;
    if (ov.parentNode !== deck.parentNode || ov.nextElementSibling !== marker) {
      deck.parentNode.insertBefore(ov, marker);
    }
    ov.style.cssText = (deck.getAttribute('style') || '') + ';pointer-events:none';
    
    
    ov.style.display =
      state.on && !(noise && state.mode !== 'static') ? '' : 'none';
    if (!staticFadeAt) ov.style.opacity = String(state.opacity);
    ov.style.filter = seaFilter();
    
    
    const cw = deck.clientWidth || deck.width;
    const ch = deck.clientHeight || deck.height;
    if (ov.width !== cw || ov.height !== ch) {
      ov.width = cw;
      ov.height = ch;
    }
    return ov;
  }

  function drawStatic(force) {
    if (state.mapOutdated) { paintOutdatedPlaceholder(); return; }
    
    
    if (!initialGate.settled()) { showNoise(); return; }
    if (!state.on || !staticVisible() || !mapGateOpen) return;
    const deck = deckCanvas();
    const img = state.img;
    if (!deck || !img) return;

    const vs = viewState(deck);
    if (!vs) return;

    const pad = vs.padding || {};
    const z = Math.pow(2, vs.zoom);
    const W = deck.clientWidth || deck.width;
    const H = deck.clientHeight || deck.height;

    const sig = [vs.zoom, vs.target[0], vs.target[1], pad.left, pad.right, W, H].join('|');
    if (!force && sig === state.sig) return;
    state.sig = sig;

    const ov = overlay(deck);
    const c = ov.getContext('2d');

    
    const dx = clamp(((pad.left || 0) + W - (pad.right || 0)) / 2, 0, W) - W / 2;
    const dy = clamp(((pad.top || 0) + H - (pad.bottom || 0)) / 2, 0, H) - H / 2;

    const pxt = img.width / mapW();                
    const s = z / pxt;                             
    
    
    
    
    const tx = vs.target[0] + 0.5, ty = vs.target[1];
    const ox = W / 2 + dx - tx * z;
    const oy = H / 2 + dy + (mapH() - 0.5 - ty) * z;   

    
    const wx0 = (0 - W / 2 - dx) / z + vs.target[0];
    const wx1 = (W - W / 2 - dx) / z + vs.target[0];
    const wy0 = (0 - H / 2 - dy) / z + vs.target[1];
    const wy1 = (H - H / 2 - dy) / z + vs.target[1];

    const sx0 = clamp(Math.floor((wx0 + 0.5) * pxt) - 1, 0, img.width);
    const sx1 = clamp(Math.ceil((wx1 + 0.5) * pxt) + 1, 0, img.width);
    const sy0 = clamp(Math.floor((mapH() - 0.5 - wy1) * pxt) - 1, 0, img.height);
    const sy1 = clamp(Math.ceil((mapH() - 0.5 - wy0) * pxt) + 1, 0, img.height);
    if (sx1 <= sx0 || sy1 <= sy0) return;

    const t0 = performance.now();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, W, H);
    c.imageSmoothingEnabled = false;               
    c.setTransform(s, 0, 0, -s, ox, oy);
    c.drawImage(img, sx0, sy0, sx1 - sx0, sy1 - sy0, sx0, sy0, sx1 - sx0, sy1 - sy0);
    lastDrawMs = performance.now() - t0;
    const now = performance.now();
    staticDraws.push(now);
    while (staticDraws.length && now - staticDraws[0] > 1000) staticDraws.shift();

    state.draws++;

    
    
    if (state.mode === 'static') {
      firstLoad = false;
      if (!staticFadeAt && noiseVisible()) {
        fadeStaticIn(ov);
        hideNoise(NOISE_FADE_MS);
      }
    }

    
    
    
    if (glc && glc.lost && glc.canvas && glc.canvas.style.display !== 'none') {
      glc.canvas.style.display = 'none';
    }
  }

  
  
  
  const AWAY_RENDER_MS = 100;      

  function nextTick(owner, fn) {
    if (awayVisible) {
      owner.timer = setTimeout(() => {
        owner.timer = 0;
        fn(performance.now());
      }, AWAY_RENDER_MS);
    } else {
      owner.raf = requestAnimationFrame(fn);
    }
  }

  function cancelTick(owner) {
    if (owner.raf) cancelAnimationFrame(owner.raf);
    if (owner.timer) clearTimeout(owner.timer);
    owner.raf = 0;
    owner.timer = 0;
  }

  const ticking = owner => !!(owner.raf || owner.timer);

  
  const loopAlive = () => (state.mode === 'static'
    ? ticking(state)
    : !!(glc && ticking(glc)));

  function staticTick(now) {
    state.raf = 0;
    state.timer = 0;
    
    
    
    
    if (document.hidden) { setBackground(true); return; }
    if (backgrounded || !state.on || !staticVisible()) return;
    if (!syncMapGate(false)) return;
    if (presenceCheck(now)) { setBackground(true); return; }
    checkDeckRemount();
    try { drawStatic(); } catch (e) { state.error = errText(e); }
    nextTick(state, staticTick);
  }

  function startStatic() {
    if (state.mapOutdated) { paintOutdatedPlaceholder(); return; }
    if (ticking(state) || backgrounded || !state.on || document.hidden ||
        !staticVisible() || !mapGateOpen) return;
    nextTick(state, staticTick);
  }

  function stopStatic() {
    cancelTick(state);
  }

  
  
  
  
  
  
  
  
  
  
  
  let awaySince = 0;              
  let backgrounded = false;       
  let awayVisible = false;        

  const awayNow = () => document.hidden || !document.hasFocus();

  function setAwayVisible(next) {
    if (awayVisible === next) return;
    awayVisible = next;
    
    
  }

  
  function presenceCheck(now) {
    if (!state.staticWhenHidden || !awayNow()) {
      awaySince = 0;
      setAwayVisible(false);
      return false;
    }
    if (!awaySince) awaySince = now;
    if (!backgroundDue(awaySince, now, BACKGROUND_MS)) return false;
    if (document.hidden) return true;
    setAwayVisible(true);
    return false;
  }

  function suspendLoops() {
    stopStatic();
    stopGL();
    hideNoise(0);
  }

  function resumeLoops() {
    if (!state.on || document.hidden || !mapGateOpen) return;
    anchorClock(false);           
    nextAt = 0;                   
    if (state.mode === 'static') {
      if (!state.img) loadColour().catch(() => {});
      startStatic();
    } else {
      if (holdStatic) startStatic();
      startGL();
    }
  }

  
  
  
  
  
  
  
  let mapGateOpen = null;

  function closeSeaForMap() {
    stopStatic();
    stopGL();
    hideNoise(0);
    removeStaticCanvas();
    if (glc && glc.canvas) {
      glc.canvas.style.display = 'none';
      glc.css = '';
    }
    state.sig = '';
    state.whalePose = null;
    state.moving = false;
    
    
    hideOutdatedPlaceholder();
    
    
    
    if (state.mode === 'static') state.img = null;
    refreshUi();                  
  }

  function openSeaForMap() {
    if (state.mapOutdated) {
      paintOutdatedPlaceholder();
      
      
      refreshUi();
      return;
    }
    checkLiveMap();
    refreshUi();
    if (!state.on || backgrounded || document.hidden) return;
    nextAt = 0;
    if (pendingMode) { applyMode(pendingMode); return; }
    if (state.mode === 'static') {
      if (!state.img) loadColour().catch(() => {});
      startStatic();
    } else if (glc && glc.ready && !glc.lost) {
      startGL();
    } else if (glc && !glc.lost) {
      startStatic();              
      startGL();
    } else {
      setMode(state.mode);
    }
  }

  
  
  
  function syncMapGate(restart) {
    const open = onExplorationMap();
    if (open === mapGateOpen) return open;
    mapGateOpen = open;
    if (open) {
      if (restart) openSeaForMap();
    } else {
      closeSeaForMap();
    }
    return open;
  }

  function setBackground(next) {
    if (backgrounded === next) return;
    backgrounded = next;
    if (next) {
      setAwayVisible(false);
      suspendLoops();
    } else {
      resumeLoops();
    }
  }

  
  
  
  function onPresenceChange() {
    if (!awayNow()) {
      awaySince = 0;
      setAwayVisible(false);
      setBackground(false);
      
      
      
      if (!loopAlive()) resumeLoops();
      return;
    }
    if (!state.staticWhenHidden) {
      
      awaySince = 0;
      setAwayVisible(false);
      setBackground(!!document.hidden);
      return;
    }
    if (!awaySince) awaySince = performance.now();
  }

  function removeStaticCanvas() {
    const ov = document.getElementById(OV_ID);
    if (ov) ov.remove();
  }

  
  
  
  
  
  
  const MANIFEST_URL = '/api/v2/maps/manifest';
  const MAP_CACHE = 'zigzag-map-binaries';
  let mapCheckInFlight = false;

  function settleInitialGate(verdict) {
    if (!initialGate.settle(verdict)) return;
    if (initialHoldTimer) {
      clearTimeout(initialHoldTimer);
      initialHoldTimer = 0;
    }
  }

  function timingUrls() {
    try {
      return performance.getEntriesByType('resource').map(e => e.name);
    } catch {
      return [];
    }
  }

  function cacheUrls() {
    if (typeof caches === 'undefined' || !caches || typeof caches.open !== 'function') {
      return Promise.resolve([]);
    }
    return caches.open(MAP_CACHE)
      .then(c => c.keys())
      .then(reqs => reqs.map(r => (typeof r === 'string' ? r : r.url)))
      .catch(() => []);
  }

  function fetchManifest() {
    const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), MANIFEST_TIMEOUT_MS) : 0;
    return fetch(MANIFEST_URL, {
      cache: 'no-store',
      signal: ctrl ? ctrl.signal : undefined,
    })
      .then(res => {
        if (!res.ok) throw new Error(`manifest: HTTP ${res.status}`);
        return res.json();
      })
      .catch(() => null)          
      .finally(() => { if (timer) clearTimeout(timer); });
  }

  function checkLiveMap() {
    if (!onExplorationMap() || state.mapOutdated || mapCheckInFlight) {
      return initialMapCheck;
    }
    mapCheckInFlight = true;
    loadPointer().then(() => {
      if (state.mapOutdated) { settleInitialGate(null); return; }
      const timing = timingUrls();
      
      
      const quick = checkMapGate({
        pointerStamp: activePointer.map.stamp, timingUrls: timing,
      });
      if (quick.status === 'outdated') {
        state.mapCheck = {
          ...quick,
          pointerStamp: activePointer.map.stamp,
          assetVersion: activePointer.assetVersion,
        };
        settleInitialGate(quick);
        enterOutdated(quick);
        return;
      }
      return cacheUrls().then(cache => fetchManifest().then(manifest => {
        if (state.mapOutdated) { settleInitialGate(null); return; }
        const verdict = checkMapGate({
          pointerStamp: activePointer.map.stamp,
          timingUrls: timing, cacheUrls: cache, manifest,
        });
        state.mapCheck = {
          ...verdict,
          pointerStamp: activePointer.map.stamp,
          assetVersion: activePointer.assetVersion,
        };
        settleInitialGate(verdict);
        if (verdict.status === 'outdated') enterOutdated(verdict);
      }));
    }).catch(() => {}).finally(() => {
      
      
      settleInitialGate(null);
      mapCheckInFlight = false;
    });
    return initialMapCheck;
  }

  
  
  function enterOutdated(verdict) {
    if (state.mapOutdated) { paintOutdatedPlaceholder(); return; }
    state.mapOutdated = true;
    state.liveMapStamp = verdict.liveStamp;
    state.mapCheck = {
      status: 'outdated',
      pointerStamp: activePointer.map.stamp,
      liveStamp: verdict.liveStamp,
      source: verdict.source,
      assetVersion: activePointer.assetVersion,
    };
    
    
    stopStatic();
    stopGL();
    hideNoise(0);
    removeStaticCanvas();
    releaseGL();
    state.whalePose = null;
    state.img = null;
    state.loading = false;
    paintOutdatedPlaceholder();
    refreshUi();
  }

  
  
  
  
  
  const COLOUR_SOURCES = [
    ['avif', 'sea-zag.avif'],
    ['webp', 'sea-zag.webp'],
  ];
  let colourPromise = null;

  function loadColour() {
    if (state.mapOutdated) return Promise.resolve(state.img);
    if (state.img) return Promise.resolve(state.img);
    if (colourPromise) return colourPromise;
    
    
    
    
    colourPromise = loadPointer().then(() => new Promise((resolve, reject) => {
      let i = 0;
      
      
      const sources = COLOUR_SOURCES.flatMap(([format, name]) =>
        assetSources(name).map(src => ({ format, src })));
      const tryNext = () => {
        if (i >= sources.length) {
          colourPromise = null;
          state.error = 'texture: colour';
          hideNoise(0);
          refreshUi();
          reject(new Error(state.error));
          return;
        }
        const { format, src } = sources[i++];
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          colourPromise = null;
          
          
          if (state.mapOutdated) { resolve(img); return; }
          state.colourFormat = format;
          state.img = img;
          state.sig = '';
          
          
          if (!mapGateOpen) { state.img = null; resolve(img); return; }
          if (staticVisible()) startStatic();
          
          
          
          if (glc && glc.ready && !glc.lost && state.mode !== 'static') state.img = null;
          resolve(img);
        };
        img.onerror = () => tryNext();
        img.src = src;
      };
      tryNext();
    }));
    return colourPromise;
  }

  
  
  
  
  
  
  
  
  
  
  
  const NOISE_ID = 'zz-sea-noise';
  const NOISE_MS = 110;
  const NOISE_FADE_MS = 300;   
  const NOISE_CELL = 8;        
  const STATIC_FADE_MS = 600;
  let noiseTimer = 0;
  let noiseFade = 0;
  let staticFadeAt = 0;
  let firstLoad = true;           
  let retryPending = false;

  const noiseVisible = () => !!document.getElementById(NOISE_ID);

  
  
  const NEUTRAL_RAMPS = { reveal: 1, wave: 1, grain: 1, flow: 1 };
  const ZERO_RAMPS = { reveal: 0, wave: 0, grain: 0, flow: 0 };
  
  let introStart = 0;             
  let introPending = false;       
  let introOverride = null;
  let introNoiseHidden = false;

  function introRamps(now) {
    if (introOverride) return introOverride;
    if (!introStart) return NEUTRAL_RAMPS;
    return introRampsAt(now - introStart);
  }

  function startIntro() {
    introStart = 0;
    introPending = true;
    introNoiseHidden = false;
  }

  
  
  function liveRamps(now) {
    if (introOverride) return introOverride;
    if (introPending) return ZERO_RAMPS;
    return introRamps(now);
  }

  function stopIntro() {
    introPending = false;
    introStart = 0;
  }

  
  
  function setIntro(v) {
    if (v === null || v === undefined) {
      introOverride = null;
      return introRamps(performance.now());
    }
    if (typeof v !== 'object') return introRamps(performance.now());
    const n = (x, d) => (isFinite(Number(x)) ? clamp(Number(x), 0, 1) : d);
    introOverride = {
      reveal: n(v.reveal, 1),
      wave: n(v.waveRamp, 1),
      grain: n(v.grainRamp, 1),
      flow: n(v.flowRamp, 1),
    };
    return introOverride;
  }

  function noiseCanvas() {
    let n = document.getElementById(NOISE_ID);
    if (!n) {
      n = document.createElement('canvas');
      n.id = NOISE_ID;
      n.style.pointerEvents = 'none';
    }
    return n;
  }

  
  
  function paintNoise() {
    if (noiseTimer) { clearTimeout(noiseTimer); noiseTimer = 0; }
    const n = document.getElementById(NOISE_ID);
    const deck = deckCanvas();
    if (!n || !deck || !state.on || document.hidden) { hideNoise(0); return; }
    
    
    
    const glEl = document.getElementById(GL_ID);
    const ovEl = document.getElementById(OV_ID);
    const seaEl = glEl && glEl.parentNode === n.parentNode ? glEl
      : ovEl && ovEl.parentNode === n.parentNode ? ovEl : null;
    if (seaEl && seaEl.nextSibling !== n) seaEl.parentNode.insertBefore(n, seaEl.nextSibling);
    
    
    
    const cw = deck.clientWidth || 0, ch = deck.clientHeight || 0;
    if (!cw || !ch) return;
    
    
    const gw = Math.max(1, Math.ceil(cw / NOISE_CELL));
    const gh = Math.max(1, Math.ceil(ch / NOISE_CELL));
    if (n.width !== gw || n.height !== gh) {
      n.width = gw;
      n.height = gh;
      n.style.width = `${cw}px`;
      n.style.height = `${ch}px`;
    }
    
    const c = n.getContext('2d');
    const img = c.createImageData(gw, gh);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = 1 + ((Math.random() * 10) | 0);   
      d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = 255;
    }
    c.putImageData(img, 0, 0);
    
    
    noiseTimer = setTimeout(paintNoise, NOISE_MS);
  }

  
  
  
  function showNoise() {
    if (!state.on || !mapGateOpen) return false;
    const deck = deckCanvas();
    if (!deck || !deck.parentNode) return false;
    if (noiseFade) { clearTimeout(noiseFade); noiseFade = 0; }
    const n = noiseCanvas();
    const gl = document.getElementById(GL_ID);
    const ov = document.getElementById(OV_ID);
    const sea = gl && gl.parentNode === deck.parentNode ? gl
      : ov && ov.parentNode === deck.parentNode ? ov : null;
    
    
    
    const before = sea ? sea.nextSibling : deck;
    if (n.parentNode !== deck.parentNode || n.nextElementSibling !== before) {
      deck.parentNode.insertBefore(n, before);
    }
    
    
    
    
    
    
    const w = deck.clientWidth || deck.width;
    const h = deck.clientHeight || deck.height;
    n.style.cssText = (deck.getAttribute('style') || '')
      + `;pointer-events:none;position:absolute;left:0;top:0;width:${w}px;height:${h}px`
      + ';image-rendering:pixelated';
    
    
    n.style.opacity = '1';
    paintNoise();
    return true;
  }

  function hideNoise(fadeMs) {
    if (noiseTimer) { clearTimeout(noiseTimer); noiseTimer = 0; }
    if (noiseFade) { clearTimeout(noiseFade); noiseFade = 0; }
    const n = document.getElementById(NOISE_ID);
    if (!n) return;
    const remove = () => {
      const el = document.getElementById(NOISE_ID);
      if (el) el.remove();
    };
    if (!fadeMs) { remove(); return; }
    const t0 = performance.now();
    const step = () => {
      const el = document.getElementById(NOISE_ID);
      if (!el) return;
      const t = Math.min(1, (performance.now() - t0) / fadeMs);
      el.style.opacity = String(1 - t);
      if (t < 1) noiseFade = setTimeout(step, 50);
      else { noiseFade = 0; remove(); }
    };
    step();
  }

  
  
  
  
  
  
  
  function paintOutdatedPlaceholder() {
    const deck = deckCanvas();
    if (!deck || !deck.parentNode || !state.on || !mapGateOpen || !state.mapOutdated) {
      hideOutdatedPlaceholder();
      return false;
    }
    const cw = deck.clientWidth || 0;
    const ch = deck.clientHeight || 0;
    if (!cw || !ch) return false;

    let el = document.getElementById(OUTDATED_ID);
    if (!el) {
      el = document.createElement('canvas');
      el.id = OUTDATED_ID;
    }
    
    if (el.parentNode !== deck.parentNode || el.nextSibling !== deck) {
      deck.parentNode.insertBefore(el, deck);
    }
    
    
    
    el.style.cssText = 'pointer-events:none;position:absolute;left:0;top:0'
      + `;width:${cw}px;height:${ch}px`;

    
    
    
    const layout = outdatedTileLayout(cw, ch, window.devicePixelRatio || 1);
    const bw = Math.round(cw * layout.dpr);
    const bh = Math.round(ch * layout.dpr);
    if (el.width !== bw || el.height !== bh) {
      el.width = bw;
      el.height = bh;
    }
    const c = el.getContext('2d');
    c.setTransform(layout.dpr, 0, 0, layout.dpr, 0, 0);
    c.fillStyle = '#050a0e';
    c.fillRect(0, 0, cw, ch);
    c.font = `500 ${layout.fontPx}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
    c.fillStyle = `rgba(155, 185, 205, ${layout.alpha})`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    
    for (let row = 0; row < layout.rows; row++) {
      const y = (row - 0.5) * layout.tileH;
      for (let col = 0; col < layout.cols; col++) {
        const x = (col - 0.5 + (row % 2) * 0.5) * layout.tileW;
        c.save();
        c.translate(x, y);
        c.rotate(layout.angleRad);
        c.fillText(OUTDATED_TEXT, 0, 0);
        c.restore();
      }
    }
    return true;
  }

  
  
  function showOutdatedPlaceholder() {
    return paintOutdatedPlaceholder();
  }

  function hideOutdatedPlaceholder() {
    const el = document.getElementById(OUTDATED_ID);
    if (el) el.remove();
  }

  
  function fadeStaticIn(ov) {
    staticFadeAt = performance.now();
    ov.style.opacity = '0';
    const step = () => {
      if (!staticFadeAt) return;
      const t = Math.min(1, (performance.now() - staticFadeAt) / STATIC_FADE_MS);
      if (ov.isConnected) ov.style.opacity = String(state.opacity * t);
      if (t < 1) setTimeout(step, 50);
      else staticFadeAt = 0;
    };
    step();
  }

  
  
  
  
  
  let deckAnchor = null;

  function checkDeckRemount() {
    const deck = deckCanvas();
    if (!deck || deck === deckAnchor) return false;
    const first = !deckAnchor;
    deckAnchor = deck;
    if (first) return false;
    
    firstLoad = true;
    state.sig = '';
    hideNoise(0);
    if (state.mode !== 'static' && state.on) {
      showNoise();                        
      if (glc && glc.ready && !glc.lost) startIntro();   
    }
    return true;
  }

  

  let glc = null;
  let nextAt = 0;                 
  let lastDrawnSig = null;        

  
  
  function viewSig(vs) {
    const pad = vs.padding || {};
    return [vs.target[0], vs.target[1], vs.zoom, pad.left || 0, pad.right || 0].join('|');
  }

  
  
  
  
  const FRAME_RING = 60;
  const frameMs = [];
  const frameGaps = [];
  let lastFrameAt = 0;
  let lastDrawMs = 0;
  let rendererName = '';          
  const staticDraws = [];         

  function pushRing(ring, v) {
    ring.push(v);
    if (ring.length > FRAME_RING) ring.shift();
  }

  const meanOf = a => a.reduce((s, v) => s + v, 0) / a.length;

  function compile(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(s);
      gl.deleteShader(s);
      throw new Error('shader compile: ' + log);
    }
    return s;
  }

  
  
  
  function withDefines(src, defs) {
    if (!defs) return src;
    const head = Object.keys(defs).sort()
      .map(k => `#define ${k} ${defs[k]}`).join('\n');
    return src.replace('#version 300 es', '#version 300 es\n' + head);
  }

  const definesKey = defs => (defs
    ? Object.keys(defs).sort().map(k => `${k}=${defs[k]}`).join(';')
    : '');

  function link(gl, defs) {
    const prog = gl.createProgram();
    let vs = null;
    let fs = null;
    try {
      vs = compile(gl, gl.VERTEX_SHADER, withDefines(VERT, defs));
      fs = compile(gl, gl.FRAGMENT_SHADER, withDefines(FRAG, defs));
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw new Error('shader link: ' + gl.getProgramInfoLog(prog));
      }
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      return prog;
    } catch (e) {
      if (vs) gl.deleteShader(vs);
      if (fs) gl.deleteShader(fs);
      gl.deleteProgram(prog);
      throw e;
    }
  }

  const UNIFORM_NAMES = [
    'uColour', 'uAux', 'uDist', 'uFlow', 'uSpeedTex', 'uCurve', 'uSliceCurve', 'uWarpCurve',
    'uTarget', 'uSize', 'uFlowSize', 'uSpeedSize', 'uAuxSpan', 'uCenter', 'uFlowCell',
    'uZoom', 'uTime', 'uDistMax', 'uShoreW', 'uShelf', 'uFlowSpeed', 'uGrain', 'uFoam',
    'uDeep', 'uSwell', 'uSnap', 'uWaveSpeed', 'uFlowMode', 'uZoomCss', 'uCycle',
    'uDeflect', 'uDeflectReach', 'uTravelMax', 'uWarp', 'uWarpBias', 'uDirA', 'uDirB',
    'uSpeedA', 'uSpeedB', 'uScaleA', 'uScaleB', 'uParallax', 'uDeepSlow', 'uWaveIn',
    'uWaveOut', 'uPomLayers', 'uAlongScale', 'uBrightness', 'uNoiseLayers',
    'uSpec', 'uSpecPow', 'uSpecSize', 'uSpecInvert', 'uSpecMode', 'uSpecFloor',
    'uHue', 'uSat',
    'uReveal', 'uWhalePose', 'uWhaleShape', 'uWhaleWake',
    'uWhaleTex', 'uWhaleHalf', 'uWhaleHeight',
  ];

  
  
  function buildProgram(gl, defs) {
    const prog = link(gl, defs);
    const uni = {};
    for (const name of UNIFORM_NAMES) uni[name] = gl.getUniformLocation(prog, name);
    gl.useProgram(prog);
    gl.uniform1i(uni.uColour, 0);
    gl.uniform1i(uni.uAux, 1);
    gl.uniform1i(uni.uDist, 2);
    gl.uniform1i(uni.uFlow, 3);
    gl.uniform1i(uni.uSpeedTex, 4);
    gl.uniform1i(uni.uCurve, 5);
    gl.uniform1i(uni.uSliceCurve, 6);
    gl.uniform1i(uni.uWarpCurve, 7);
    gl.uniform1i(uni.uWhaleTex, 8);
    
    gl.uniform2f(uni.uWhaleHalf, 5.5, 2.0);
    gl.uniform1f(uni.uWhaleHeight, 1.0);
    return { prog, uni };
  }

  
  
  function selectProgram(c, settings) {
    const defs = settings.defines;
    const key = definesKey(defs);
    let p = c.progs.get(key);
    if (!p) {
      try {
        p = buildProgram(c.gl, defs);
      } catch (e) {
        c.progs.set(key, c.progs.get(''));
        return;
      }
      c.progs.set(key, p);
    }
    c.prog = p.prog;
    c.uni = p.uni;
  }

  
  
  
  const WHALE_SHAPE = { halfLen: 11.5, halfWid: 3.6 };

  
  
  const PLAIN_UNIFORM = {
    shore: 'uShoreW', shelf: 'uShelf', flow: 'uFlowSpeed', wave: 'uWaveSpeed',
    grain: 'uGrain', foam: 'uFoam', deep: 'uDeep', swell: 'uSwell',
    aspeed: 'uSpeedA', ascale: 'uScaleA', bspeed: 'uSpeedB', bscale: 'uScaleB',
    dslow: 'uDeepSlow', win: 'uWaveIn', wout: 'uWaveOut',
    wbias: 'uWarpBias', deflect: 'uDeflect', deflectReach: 'uDeflectReach',
    flowMode: 'uFlowMode', noiseLayers: 'uNoiseLayers', travelMax: 'uTravelMax',
    spec: 'uSpec', specPow: 'uSpecPow', specSize: 'uSpecSize',
    specInvert: 'uSpecInvert', specMode: 'uSpecMode', snap: 'uSnap',
    specFloor: 'uSpecFloor',
  };

  function setModeUniforms(gl, uni, u) {
    const rad = deg => deg * Math.PI / 180;
    
    
    for (const k of Object.keys(u)) {
      switch (k) {
        case 'par': gl.uniform1f(uni.uParallax, -u.par); break;
        case 'pom': gl.uniform1f(uni.uPomLayers, Math.min(12, Math.max(1, u.pom))); break;
        case 'cycle': gl.uniform1f(uni.uCycle, Math.max(0.5, u.cycle)); break;
        case 'warp': gl.uniform1f(uni.uWarp, u.warp * WARP_MAX); break;
        case 'adir': gl.uniform2f(uni.uDirA, Math.cos(rad(u.adir)), Math.sin(rad(u.adir))); break;
        case 'bdir': gl.uniform2f(uni.uDirB, Math.cos(rad(u.bdir)), Math.sin(rad(u.bdir))); break;
        default: {
          const name = PLAIN_UNIFORM[k];
          if (name) gl.uniform1f(uni[name], u[k]);
        }
      }
    }
  }

  
  
  
  function decodeTexture(name) {
    const sources = assetSources(name);
    const load = src => {
      if (typeof createImageBitmap === 'function') {
        return fetch(src, { mode: 'cors' })
          .then(r => {
            if (!r.ok) throw new Error(`texture: ${src} HTTP ${r.status}`);
            return r.blob();
          })
          .then(b => createImageBitmap(b));
      }
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('texture: failed to load ' + src));
        img.src = src;
      });
    };
    return sources.length > 1
      ? load(sources[0]).catch(() => load(sources[1]))
      : load(sources[0]);
  }

  
  
  
  
  const TEX_FORMAT = {
    colour: ['RGBA8', 'RGBA'],
    dist: ['R8', 'RED'],            
    aux: ['RGB8', 'RGB'],           
    flow: ['RGB8', 'RGB'],          
    speed: ['R8', 'RED'],           
  };

  function uploadTexture(gl, source, nearest, key) {
    const [internal, format] = TEX_FORMAT[key];
    const tex = gl.createTexture();
    const f = nearest ? gl.NEAREST : gl.LINEAR;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, f);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, f);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);   
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl[internal], gl[format], gl.UNSIGNED_BYTE, source);
    
    
    const err = gl.getError();
    const w = source.width;
    const h = source.height;
    if (typeof source.close === 'function') source.close();
    if (err !== gl.NO_ERROR) {
      gl.deleteTexture(tex);
      throw new Error(`texture: ${key} upload GL error 0x${err.toString(16)}`);
    }
    return { tex, w, h };
  }

  
  function curveTexture(gl, pts) {
    const lut = new Uint8Array(128 * 4);
    for (let i = 0; i < 128; i++) {
      const x = (i / 127) * (pts.length - 1);
      const k = Math.min(pts.length - 2, Math.floor(x));
      const f = x - k;
      const v = Math.round((pts[k] * (1 - f) + pts[k + 1] * f) * 255);
      lut[i * 4] = lut[i * 4 + 1] = lut[i * 4 + 2] = v;
      lut[i * 4 + 3] = 255;
    }
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 128, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, lut);
    return tex;
  }

  function drainErrors(gl) {
    for (let i = 0; i < 16 && gl.getError() !== gl.NO_ERROR; i++) {  }
  }

  
  
  
  
  function buildGL() {
    loadPointer().then(() => {
      try { buildGLNow(); } catch (e) { fallbackToStatic(e); }
    }).catch(e => fallbackToStatic(e));
  }

  function buildGLNow() {
    if (!state.on || !mapGateOpen) return;      
    if (state.mapOutdated) { paintOutdatedPlaceholder(); return; }
    const deck = deckCanvas();
    if (!deck || !deck.parentNode) throw new Error('no deck canvas');
    if (!canUseShader) {
      throw new Error('shader unavailable: MAX_TEXTURE_SIZE ' + probe.maxTextureSize);
    }

    
    
    const stale = document.getElementById(GL_ID);
    if (stale) stale.remove();

    const canvas = document.createElement('canvas');
    canvas.id = GL_ID;
    if (!state.on) canvas.style.display = 'none';
    deck.parentNode.insertBefore(canvas, deck);

    const gl = canvas.getContext('webgl2', {
      alpha: true, premultipliedAlpha: false, antialias: false, depth: false,
    });
    if (!gl) { canvas.remove(); throw new Error('webgl2 unavailable'); }

    
    rendererName = '';
    frameMs.length = 0;
    frameGaps.length = 0;
    lastFrameAt = 0;
    try {
      const info = gl.getExtension('WEBGL_debug_renderer_info');
      if (info) rendererName = String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL) || '');
    } catch { rendererName = ''; }

    let first;
    try { first = buildProgram(gl, null); } catch (e) { canvas.remove(); throw e; }
    const { prog, uni } = first;

    const c = {
      canvas, gl, prog, uni, progs: new Map([['', first]]),
      tex: {
        curve: curveTexture(gl, seaConsts.curves.pc),
        slice: curveTexture(gl, seaConsts.curves.sc),
        warp: curveTexture(gl, seaConsts.curves.wc),
      },
      whaleTex: null,
      whaleDirty: true,
      size: {}, raf: 0, timer: 0, ready: false, css: '', lost: false, first: false,
      onLost: null, onRestored: null,
    };
    glc = c;
    c.onLost = e => onContextLost(c, e);
    c.onRestored = () => onContextRestored(c);
    canvas.addEventListener('webglcontextlost', c.onLost);
    canvas.addEventListener('webglcontextrestored', c.onRestored);

    drainErrors(gl);
    state.loading = true;
    refreshUi();

    
    
    loadWhale();
    loadWhaleMesh();

    
    
    
    
    const noisy = (firstLoad || retryPending) && showNoise();
    retryPending = false;
    if (!noisy) stopIntro();

    
    
    const specs = [
      ['colour', 'sea-zag.webp', true],
      ['dist', 'sea-zag-dist.webp', true],
      ['aux', 'sea-zag-aux.webp', false],
      ['flow', 'sea-zag-flow.webp', false],
      ['speed', 'sea-zag-speed.webp', false],
    ];
    Promise.all(specs.map(([key, name, nearest]) =>
      
      
      (key === 'colour' ? loadColour() : decodeTexture(name))
        .then(source => {
          if (glc !== c || c.lost) {
            if (typeof source.close === 'function') source.close();
            return;
          }
          const up = uploadTexture(gl, source, nearest, key);
          c.tex[key] = up.tex;
          c.size[key] = [up.w, up.h];
        }),
    )).then(() => {
      if (glc !== c || c.lost) return;
      
      
      const glErr = gl.getError();
      if (glErr !== gl.NO_ERROR) {
        throw new Error('texture: GL error 0x' + glErr.toString(16));
      }
      const max = Number(gl.getParameter(gl.MAX_TEXTURE_SIZE)) || probe.maxTextureSize;
      for (const key of ['colour', 'dist', 'aux', 'flow', 'speed']) {
        const [w, h] = c.size[key] || [0, 0];
        if (!w || !h || w > max || h > max) {
          throw new Error(`texture: ${key} ${w}x${h} > MAX_TEXTURE_SIZE ${max}`);
        }
      }
      c.ready = true;
      state.glReady = true;
      state.loading = false;
      state.error = null;
      if (noisy) startIntro();
      startGL();
      refreshUi();
    }).catch(e => {
      state.loading = false;
      if (glc === c && !c.lost) fallbackToStatic(e);
      else refreshUi();
    });
  }

  
  
  
  function paintStaticOverLost() {
    state.sig = '';
    try { drawStatic(); } catch (e) { state.error = errText(e); }
    startStatic();
  }

  
  
  
  function onContextLost(c, e) {
    if (e && e.preventDefault) e.preventDefault();
    if (glc !== c || c.lost) return;
    c.lost = true;
    c.ready = false;
    stopGL();
    state.glReady = false;
    state.loading = false;
    state.mode = 'static';
    state.sig = '';
    holdStatic = false;
    state.whalePose = null;
    state.error = 'context lost' +
      (e && e.statusMessage ? ': ' + e.statusMessage : '');
    
    
    if (state.img) {
      paintStaticOverLost();
    } else {
      loadColour().then(() => {
        if (glc !== c || !c.lost) return;
        paintStaticOverLost();
      }).catch(err => {
        if (glc === c) { state.error = errText(err); refreshUi(); }
      });
    }
    refreshUi();
  }

  function onContextRestored(c) {
    if (glc !== c) return;
    const canvas = c.canvas;
    glc = null;
    c.ready = false;
    state.glReady = false;
    if (canvas) {
      canvas.removeEventListener('webglcontextlost', c.onLost);
      canvas.removeEventListener('webglcontextrestored', c.onRestored);
      canvas.remove();
    }
    if (!canUseShader) { refreshUi(); return; }
    if (!wantedMode || wantedMode === 'static') {
      state.error = null;
      refreshUi();
      return;
    }
    try { setMode(wantedMode); } catch (e) { fallbackToStatic(e); }
  }

  function releaseGL() {
    if (!glc) return;
    const c = glc;
    glc = null;
    lastDrawnSig = null;
    if (c.raf) cancelAnimationFrame(c.raf);
    state.glReady = false;
    if (c.canvas) {
      if (c.onLost) c.canvas.removeEventListener('webglcontextlost', c.onLost);
      if (c.onRestored) c.canvas.removeEventListener('webglcontextrestored', c.onRestored);
    }
    try { c.gl.deleteProgram(c.prog); } catch {}
    for (const key of Object.keys(c.tex || {})) {
      try { c.gl.deleteTexture(c.tex[key]); } catch {}
    }
    if (!c.lost) {
      const lose = c.gl.getExtension('WEBGL_lose_context');
      if (lose) { try { lose.loseContext(); } catch {} }
    }
    if (c.canvas) c.canvas.remove();
  }

  function renderFrame(c, w, h, cam, t, settings, ramps) {
    const { gl, uni, tex, size } = c;
    gl.viewport(0, 0, w, h);
    gl.useProgram(c.prog);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform2f(uni.uTarget, cam.tx, cam.ty);
    gl.uniform2f(uni.uSize, mapW(), mapH());
    gl.uniform2f(uni.uFlowSize, size.flow[0], size.flow[1]);
    gl.uniform1f(uni.uFlowCell, mapW() / size.flow[0]);
    gl.uniform2f(uni.uSpeedSize, size.speed[0], size.speed[1]);
    gl.uniform2f(uni.uAuxSpan, size.aux[0] * activePointer.auxScale,
      size.aux[1] * activePointer.auxScale);
    gl.uniform2f(uni.uCenter, cam.centerX, cam.centerY);
    gl.uniform1f(uni.uZoom, cam.zoom);
    gl.uniform1f(uni.uZoomCss, cam.zoomCss);
    gl.uniform1f(uni.uTime, t);
    gl.uniform1f(uni.uDistMax, activePointer.distMax);
    gl.uniform1f(uni.uAlongScale, activePointer.alongScale);
    gl.uniform1f(uni.uBrightness, state.brightness);
    gl.uniform1f(uni.uHue, state.hue);
    gl.uniform1f(uni.uSat, state.sat / 100);
    setModeUniforms(gl, uni, settings.uniforms);

    
    
    const whale = whaleUniforms(state.whalePose, WHALE_SHAPE);
    
    if (!whaleMesh) whale.shape[3] = 0;
    gl.uniform4fv(uni.uWhalePose, whale.pose);
    gl.uniform4fv(uni.uWhaleShape, whale.shape);
    gl.uniform4fv(uni.uWhaleWake, whaleWake);
    if (whaleMesh) {
      if (!c.whaleTex) c.whaleTex = whaleTexture(gl);
      if (c.whaleDirty) {
        gl.activeTexture(gl.TEXTURE8);
        gl.bindTexture(gl.TEXTURE_2D, c.whaleTex);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, whaleTexSize[0], whaleTexSize[1],
          gl.RGBA, gl.UNSIGNED_BYTE, whaleTexBuf);
        c.whaleDirty = false;
      }
      gl.uniform2f(uni.uWhaleHalf, whaleHalf[0], whaleHalf[1]);
      gl.uniform1f(uni.uWhaleHeight, whaleHeight);
    }

    
    
    
    const r = ramps || NEUTRAL_RAMPS;
    const u = settings.uniforms;
    gl.uniform1f(uni.uReveal, r.reveal);
    if (r.wave < 1) {
      gl.uniform1f(uni.uWaveIn, u.win * r.wave);
      gl.uniform1f(uni.uWaveOut, u.wout * r.wave);
      gl.uniform1f(uni.uFoam, u.foam * r.wave);
    }
    if (r.grain < 1) gl.uniform1f(uni.uGrain, u.grain * r.grain);
    if (r.flow < 1) {
      const k = 1 + 0.5 * (1 - r.flow);
      gl.uniform1f(uni.uFlowSpeed, u.flow * k);
      gl.uniform1f(uni.uSpeedA, u.aspeed * k);
      gl.uniform1f(uni.uSpeedB, u.bspeed * k);
    }

    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex.colour);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tex.aux);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, tex.dist);
    gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, tex.flow);
    gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_2D, tex.speed);
    gl.activeTexture(gl.TEXTURE5); gl.bindTexture(gl.TEXTURE_2D, tex.curve);
    gl.activeTexture(gl.TEXTURE6); gl.bindTexture(gl.TEXTURE_2D, tex.slice);
    gl.activeTexture(gl.TEXTURE7); gl.bindTexture(gl.TEXTURE_2D, tex.warp);
    gl.activeTexture(gl.TEXTURE8); gl.bindTexture(gl.TEXTURE_2D, c.whaleTex || null);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  
  
  
  function sizeGL(renderScale) {
    if (!glc) return null;
    const deck = deckCanvas();
    if (!deck) return null;
    const cssW = deck.clientWidth || deck.width;
    const cssH = deck.clientHeight || deck.height;
    if (!cssW || !cssH) return null;

    const { w, h, scale } = renderSize(
      cssW, cssH, window.devicePixelRatio || 1, renderScale,
    );
    const canvas = glc.canvas;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    return { cssW, cssH, w, h, scale };
  }

  
  
  
  
  
  
  const seaTarget = vs => [vs.target[0] + 0.5, mapH() - 0.5 - vs.target[1]];

  function drawGL(t) {
    if (state.mapOutdated) { paintOutdatedPlaceholder(); return; }
    
    if (!initialGate.settled()) { showNoise(); return; }
    if (!glc || !glc.ready || glc.lost || !mapGateOpen) return;
    const deck = deckCanvas();
    if (!deck) return;
    const vs = viewState(deck);
    if (!vs) return;

    const settings = modeSettings(state.mode);
    selectProgram(glc, settings);
    const sized = sizeGL(settings.renderScale);
    if (!sized) return;
    const { cssW, cssH, w, h, scale } = sized;

    const canvas = glc.canvas;
    
    
    
    const noiseEl = document.getElementById(NOISE_ID);
    const anchor = noiseEl && noiseEl.parentNode === deck.parentNode ? noiseEl : deck;
    if (canvas.parentNode !== deck.parentNode || canvas.nextElementSibling !== anchor) {
      deck.parentNode.insertBefore(canvas, anchor);
    }
    const css = (deck.getAttribute('style') || '') +
      ';pointer-events:none;opacity:' + state.opacity +
      (state.on ? '' : ';display:none');
    if (glc.css !== css) {
      glc.css = css;
      canvas.style.cssText = css;
    }

    const cam = cameraUniforms(vs, cssW, cssH, w, h);
    const target = seaTarget(vs);
    state.camTarget = target;
    const now = performance.now();
    
    
    
    if (introPending) {
      const status = mapStatus();
      if (status === null || status === 'ready') {
        introPending = false;
        introStart = now;
      }
    }
    const ramps = liveRamps(now);
    const t0 = now;
    
    
    updateWhalePose(now);
    renderFrame(glc, w, h, {
      tx: target[0], ty: target[1],
      zoom: cam.zoomPx, zoomCss: cam.zoomPx / scale,
      centerX: cam.centerX, centerY: cam.centerY,
    }, t, settings, ramps);
    pushRing(frameMs, performance.now() - t0);
    state.draws++;
    lastDrawnSig = viewSig(vs);

    
    
    
    if (!introNoiseHidden && ramps.reveal >= 1 && noiseVisible()) {
      introNoiseHidden = true;
      hideNoise(NOISE_FADE_MS);
    }

    
    
    if (!glc.first && state.on) {
      glc.first = true;
      firstLoad = false;
      holdStatic = false;
      removeStaticCanvas();
      
      
      
      
      if (noiseVisible()) { introNoiseHidden = true; hideNoise(0); }
    }
    
    
    
    
    if (state.img && state.mode !== 'static') state.img = null;
  }

  function glTick(now) {
    if (!glc) return;
    glc.raf = 0;
    glc.timer = 0;
    if (document.hidden) { setBackground(true); return; }
    if (backgrounded || glc.lost || state.mode === 'static' || !state.on) return;
    if (!syncMapGate(false)) return;
    if (presenceCheck(now)) { setBackground(true); return; }
    try {
      checkDeckRemount();
      
      
      
      const deck = deckCanvas();
      const vs = deck && viewState(deck);
      const sig = vs ? viewSig(vs) : null;
      state.moving = !!sig && lastDrawnSig !== null && sig !== lastDrawnSig;
      const gate = fpsGate(now, nextAt, state.fps30, state.moving, state.frameCap);
      nextAt = gate.nextAt;
      
      
      
      if (gate.draw && (!awayVisible || state.moving)) {
        if (lastFrameAt) pushRing(frameGaps, now - lastFrameAt);
        lastFrameAt = now;
        drawGL(now / 1000);
      }
    } catch (e) {
      
      
      fallbackToStatic(e);
      return;
    }
    if (glc) nextTick(glc, glTick);
  }

  function startGL() {
    if (state.mapOutdated) { paintOutdatedPlaceholder(); return; }
    if (!glc || ticking(glc) || !glc.ready || glc.lost || !mapGateOpen) return;
    if (backgrounded || state.mode === 'static' || !state.on || document.hidden) return;
    nextTick(glc, glTick);
  }

  function stopGL() {
    if (glc) cancelTick(glc);
  }

  
  
  
  
  function fallbackToStatic(reason) {
    state.error = errText(reason);
    state.loading = false;
    pendingMode = null;
    state.mode = 'static';
    state.sig = '';
    holdStatic = false;
    state.whalePose = null;
    if (glc && glc.lost) {
      
      
      stopGL();
      if (state.img) {
        paintStaticOverLost();
      } else {
        loadColour().then(() => {
          if (glc && glc.lost) paintStaticOverLost();
        }).catch(e => {
          state.error = errText(e);
          refreshUi();
        });
      }
      refreshUi();
      return;
    }
    if (state.img) {
      releaseGL();
      try { drawStatic(); } catch (e) { state.error = errText(e); }
      startStatic();
      refreshUi();
      return;
    }
    
    
    
    const token = ++staticToken;
    stopGL();
    loadColour().then(() => {
      if (token !== staticToken || state.mode !== 'static') return;
      releaseGL();
      state.sig = '';
      try { drawStatic(); } catch (e) { state.error = errText(e); }
      startStatic();
      refreshUi();
    }).catch(e => {
      if (token !== staticToken) return;
      releaseGL();
      state.error = errText(e);
      refreshUi();
    });
  }

  
  
  let staticToken = 0;

  function enterStatic() {
    const token = ++staticToken;
    stopStatic();
    state.sig = '';
    holdStatic = false;
    if (state.img) {
      releaseGL();
      try { drawStatic(); } catch (e) { state.error = errText(e); }
      startStatic();
      return;
    }
    stopGL();
    loadColour().then(() => {
      if (token !== staticToken || state.mode !== 'static') return;
      releaseGL();
      state.sig = '';
      try { drawStatic(); } catch (e) { state.error = errText(e); }
      startStatic();
      refreshUi();
    }).catch(e => {
      if (token !== staticToken) return;
      releaseGL();
      state.error = errText(e);
      refreshUi();
    });
  }

  

  function setMode(id) {
    modeSettings(id);                       
    if (id !== 'static' && !canUseShader) {
      wantedMode = id;
      state.error = 'shader unavailable: MAX_TEXTURE_SIZE ' + probe.maxTextureSize;
      state.loading = false;
      state.mode = 'static';
      state.sig = '';
      holdStatic = false;
      state.whalePose = null;
      if (state.img) {
        try { drawStatic(); } catch (e) { state.error = errText(e); }
        startStatic();
      }
      refreshUi();
      return state.mode;
    }

    wantedMode = id;
    if (state.mode === id && id !== 'static' && glc && glc.ready && !glc.lost) return id;

    state.mode = id;
    state.sig = '';
    if (id === 'static') {
      state.error = null;
      state.loading = false;
      state.whalePose = null;         
      enterStatic();
    } else {
      state.error = null;
      stopStatic();
      
      
      if (glc && glc.ready && !glc.lost) {
        try {
          sizeGL(modeSettings(id).renderScale);
          nextAt = 0;                       
          drawGL(performance.now() / 1000);
        } catch (e) {
          fallbackToStatic(e);
          return state.mode;
        }
        startGL();
      } else if (glc && !glc.lost) {
        
        startStatic();
        startGL();
      } else {
        holdStatic = true;
        try { buildGL(); } catch (e) { fallbackToStatic(e); }
        
        startStatic();
      }
    }
    refreshUi();
    return state.mode;
  }

  
  
  
  

  function stopDeckWatch() {
    if (deckObserver) { deckObserver.disconnect(); deckObserver = null; }
    if (deckTimer) { clearInterval(deckTimer); deckTimer = 0; }
  }

  function applyMode(id) {
    pendingMode = null;
    stopDeckWatch();
    try { setMode(id); } catch (e) { fallbackToStatic(e); }
  }

  function applyPendingMode() {
    if (!pendingMode || !state.on) return false;
    if (pendingMode !== 'static' && !deckCanvas()) return false;
    
    if (!onExplorationMap()) return false;
    
    
    
    checkLiveMap();
    mapGateOpen = true;             
    applyMode(pendingMode);
    return true;
  }

  function watchForDeck() {
    if (deckObserver) return;
    deckWatchStart = Date.now();
    const target = document.body || document.documentElement;
    deckObserver = new MutationObserver(() => {
      syncMapGate(true);
      if (applyPendingMode()) stopDeckWatch();
    });
    deckObserver.observe(target, { childList: true, subtree: true });
    deckTimer = setInterval(() => {
      syncMapGate(true);
      if (applyPendingMode() || Date.now() - deckWatchStart >= 30000) {
        if (deckTimer) { clearInterval(deckTimer); deckTimer = 0; }
      }
    }, 500);
  }

  
  
  function requestMode(id) {
    modeSettings(id);                       
    wantedMode = id;
    if (id !== 'static' && !deckCanvas()) {
      pendingMode = id;
      watchForDeck();
      applyPendingMode();                   
      refreshUi();
      return state.mode;
    }
    pendingMode = null;
    stopDeckWatch();
    try { return setMode(id); } catch (e) { fallbackToStatic(e); return state.mode; }
  }

  
  
  
  function retry() {
    if (!canUseShader) {
      state.error = 'shader unavailable: MAX_TEXTURE_SIZE ' + probe.maxTextureSize;
      refreshUi();
      return state.mode;
    }
    const target = wantedMode && wantedMode !== 'static'
      ? wantedMode
      : pickMode('', env);
    retryPending = true;       
    return requestMode(target);
  }

  
  
  function debugRender(opts) {
    opts = opts || {};
    if (!glc || !glc.ready || glc.lost) throw new Error('gl path not ready');
    
    let live = null;
    if (opts.tx === undefined && opts.ty === undefined) {
      const c = deckCanvas();
      const vs = c && viewState(c);
      if (!vs) throw new Error('debugRender has no live camera');
      live = seaTarget(vs);
      opts = {
        ...opts,
        zoom: opts.zoom === undefined ? 2 ** vs.zoom : opts.zoom,
        width: opts.width === undefined ? (c.clientWidth || c.width) : opts.width,
        height: opts.height === undefined ? (c.clientHeight || c.height) : opts.height,
      };
    }
    const w = Math.max(1, Math.round(Number(opts.width)));
    const h = Math.max(1, Math.round(Number(opts.height)));
    const zoom = Number(opts.zoom);
    const t = opts.t === undefined ? 0 : Number(opts.t);
    const tx = live ? live[0] : Number(opts.tx);
    const ty = live ? live[1] : Number(opts.ty);
    if (![w, h, zoom, t, tx, ty].every(isFinite)) {
      throw new Error('debugRender needs finite tx, ty, width, height, zoom');
    }

    const canvas = glc.canvas;
    const prevW = canvas.width, prevH = canvas.height;
    const prevPose = state.whalePose;
    
    
    const settings = modeSettings(state.mode);
    selectProgram(glc, settings);       
    const scale = settings.renderScale;
    const bw = Math.max(1, Math.round(w * scale));
    const bh = Math.max(1, Math.round(h * scale));
    try {
      
      
      
      
      if (opts.whaleT !== undefined) {
        const whaleT = Number(opts.whaleT);
        if (!isFinite(whaleT)) {
          throw new Error('debugRender needs a finite whaleT');
        }
        if (!whaleRoute) throw new Error('whale route not loaded');
        setWhalePose(sampleWhale(whaleRoute, whaleT));
      } else {
        const pin = opts.whale !== undefined ? opts.whale : opts.whalePose;
        if (pin && typeof pin === 'object') {
          setWhalePose(pin);
        } else if (pin !== true) {
          state.whalePose = null;
        }
      }
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
      }
      renderFrame(glc, bw, bh, {
        tx, ty,
        zoom: zoom * scale, zoomCss: zoom,
        centerX: bw / 2, centerY: bh / 2,
      }, t, settings, liveRamps(performance.now()));

      const px = new Uint8Array(bw * bh * 4);
      glc.gl.readPixels(0, 0, bw, bh, glc.gl.RGBA, glc.gl.UNSIGNED_BYTE, px);

      
      
      
      
      const out = document.createElement('canvas');
      out.width = bw;
      out.height = bh;
      const ctx = out.getContext('2d');
      const img = ctx.createImageData(bw, bh);
      const row = bw * 4;
      for (let y = 0; y < bh; y++) {
        img.data.set(px.subarray((bh - 1 - y) * row, (bh - y) * row), y * row);
      }
      ctx.putImageData(img, 0, 0);
      return out.toDataURL('image/png');
    } finally {
      state.whalePose = prevPose;
      if (canvas.width !== prevW || canvas.height !== prevH) {
        canvas.width = prevW;
        canvas.height = prevH;
      }
      if (state.mode !== 'static' && glc && glc.ready && !glc.lost) {
        try { drawGL(performance.now() / 1000); } catch (e) { state.error = errText(e); }
      }
    }
  }

  
  
  function syncGL(gl) {
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
  }

  
  
  
  function bench() {
    const mode = state.mode;
    try {
      if (mode === 'static') {
        if (!state.img) throw new Error('static not ready');
        const t0 = performance.now();
        for (let i = 0; i < 60; i++) drawStatic(true);
        const ms = performance.now() - t0;
        startStatic();
        return { mode, ms, fps: ms > 0 ? 60000 / ms : 0 };
      }

      if (!glc || !glc.ready || glc.lost) throw new Error('gl path not ready');
      const deck = deckCanvas();
      const vs = deck && viewState(deck);
      if (!vs) throw new Error('no camera');
      const settings = modeSettings(mode);
      const sized = sizeGL(settings.renderScale);
      if (!sized) throw new Error('no viewport');

      const cam = cameraUniforms(vs, sized.cssW, sized.cssH, sized.w, sized.h);
      const target = seaTarget(vs);
      const frame = {
        tx: target[0], ty: target[1],
        zoom: cam.zoomPx, zoomCss: cam.zoomPx / sized.scale,
        centerX: cam.centerX, centerY: cam.centerY,
      };
      const start = performance.now();
      let ms;
      try {
        
        
        updateWhalePose(performance.now());
        renderFrame(glc, sized.w, sized.h, frame, start / 1000, settings,
          liveRamps(start));
        syncGL(glc.gl);
        const t0 = performance.now();
        for (let i = 0; i < 60; i++) {
          updateWhalePose(performance.now());
          renderFrame(glc, sized.w, sized.h, frame, start / 1000 + i / 60, settings,
            liveRamps(start));
        }
        syncGL(glc.gl);
        ms = performance.now() - t0;
      } finally {
        
        nextAt = 0;
        try { drawGL(performance.now() / 1000); } catch (e) { fallbackToStatic(e); }
        startGL();
      }
      return { mode: state.mode, ms, fps: ms > 0 ? 60000 / ms : 0 };
    } catch (e) {
      state.error = errText(e);
      refreshUi();
      return { mode: state.mode, ms: 0, fps: 0, error: state.error };
    }
  }

  
  
  
  
  function shortRenderer(raw) {
    if (!raw) return 'WebGL2';
    const m = /^ANGLE \(([^,)]+)/.exec(raw);
    const s = m ? `ANGLE (${m[1]})` : raw;
    return s.length > 40 ? s.slice(0, 39) + '…' : s;
  }

  function stats() {
    if (state.mode === 'static') {
      const now = performance.now();
      while (staticDraws.length && now - staticDraws[0] > 1000) staticDraws.shift();
      return {
        mode: state.mode,
        
        vramMB: (mapW() * mapH() * 4) / 1e6,
        fps: staticDraws.length,      
        ms: lastDrawMs,
        msKind: 'cpu',
        renderer: '2D',
        draws: state.draws,
        moving: false,
        intro: { ...liveRamps(performance.now()) },
        mapStatus: mapStatus(),
        mapVariant: mapVariant(),
        mapGate: mapGateOpen,
        mapCheck: state.mapCheck,
        colourFormat: state.colourFormat,
        firstLoad,
        introPending,
        backgrounded,
        whale: whaleStats(),
      };
    }
    return {
      mode: state.mode,
      vramMB: vramBytes(glc ? glc.size : null) / 1e6,
      fps: frameGaps.length >= 2 ? 1000 / meanOf(frameGaps) : 0,
      ms: frameMs.length ? meanOf(frameMs) : 0,
      msKind: 'cpu',
      renderer: shortRenderer(rendererName),
      draws: state.draws,
      moving: !!state.moving,
      intro: { ...liveRamps(performance.now()) },
      mapStatus: mapStatus(),
      mapVariant: mapVariant(),
      mapGate: mapGateOpen,
      mapCheck: state.mapCheck,
      colourFormat: state.colourFormat,
      firstLoad,
      introPending,
      backgrounded,
      awayVisible,
      update: updateState(),
      whale: whaleStats(),
    };
  }

  
  
  
  
  
  
  const UPDATE_TIMEOUT_MS = 10000;

  function scriptUrl() {
    return `${assetBase || seaConsts.assetBase}/sea-zag.user.js`;
  }

  let updateInfo = { latest: null, checkedAt: 0, error: null };
  let updateInFlight = false;
  
  
  
  
  let updateRequested = false;

  function updateState() {
    const current = seaConsts.version;
    const latest = updateInfo.latest;
    return {
      current, latest,
      checkedAt: updateInfo.checkedAt,
      error: updateInfo.error,
      available: !!latest && isNewer(latest, current),
      requested: updateRequested && !!latest && isNewer(latest, current),
      url: scriptUrl(),
    };
  }

  
  
  
  function checkUpdate() {
    if (updateInFlight) return;
    updateInFlight = true;
    const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), UPDATE_TIMEOUT_MS) : 0;
    fetch(scriptUrl(), {
      cache: 'no-store',
      signal: ctrl ? ctrl.signal : undefined,
    })
      .then(res => {
        if (!res.ok) throw new Error(`update: HTTP ${res.status}`);
        return res.text();
      })
      .then(text => {
        const latest = parseScriptVersion(text);
        if (!latest) throw new Error('update: no @version');
        updateInfo = { latest, checkedAt: Date.now(), error: null };
      })
      .catch(e => {
        
        updateInfo = { ...updateInfo, checkedAt: Date.now(), error: errText(e) };
      })
      .finally(() => {
        if (timer) clearTimeout(timer);
        updateInFlight = false;
        refreshUi();
      });
  }

  
  
  
  
  function seaFilter() {
    return `saturate(${state.sat}%) hue-rotate(${state.hue}deg)` +
      ` brightness(${state.brightness})`;
  }

  function applySeaFilter() {
    const ov = document.getElementById(OV_ID);
    if (ov) ov.style.filter = seaFilter();
  }
  
  
  function setBrightness(multiplier) {
    const v = Number(multiplier);
    state.brightness = clamp(isFinite(v) ? v : 1, 0.5, 1.5);
    applySeaFilter();
    refreshUi();
    return state.brightness;
  }

  
  
  function setHue(degrees) {
    const v = Number(degrees);
    state.hue = clamp(isFinite(v) ? v : 0, -180, 180);
    applySeaFilter();
    if (glc) glc.css = '';
    refreshUi();
    return state.hue;
  }

  function setSat(percent) {
    const v = Number(percent);
    state.sat = clamp(isFinite(v) ? v : 100, 0, 120);
    applySeaFilter();
    if (glc) glc.css = '';
    refreshUi();
    return state.sat;
  }

  
  
  function setOpacity(value) {
    const v = Number(value);
    state.opacity = clamp(isFinite(v) ? v : 1, 0, 1);
    const ov = document.getElementById(OV_ID);
    if (ov) ov.style.opacity = String(state.opacity);
    if (glc) {
      glc.css = '';
      glc.canvas.style.opacity = String(state.opacity);
    }
    refreshUi();
    return state.opacity;
  }

  
  
  function setAdaptiveFps(on) {
    state.fps30 = !!on;
    nextAt = 0;                    
    refreshUi();
    return state.fps30;
  }

  function setFps30(on) {
    return setAdaptiveFps(on);
  }

  
  
  function setFrameCap(cap) {
    const v = Number(cap);
    state.frameCap = FRAME_CAPS.includes(v) ? v : 0;
    nextAt = 0;
    refreshUi();
    return state.frameCap;
  }

  
  
  function setStaticWhenHidden(on) {
    state.staticWhenHidden = !!on;
    awaySince = 0;
    setBackground(!!on && awayNow());
    refreshUi();
    return state.staticWhenHidden;
  }

  
  
  
  function setWhalePose(pose) {
    if (!pose || typeof pose !== 'object') {
      state.whalePose = null;
      return state.whalePose;
    }
    const p = {
      x: Number(pose.x), y: Number(pose.y),
      depth: Number(pose.depth), heading: Number(pose.heading),
    };
    state.whalePose = [p.x, p.y, p.depth, p.heading].every(isFinite) ? p : null;
    return state.whalePose;
  }

  
  
  
  function setOn(on) {
    state.on = !!on;
    syncPirateOcean();
    for (const id of [OV_ID, GL_ID]) {
      const c = document.getElementById(id);
      if (c) c.style.display = state.on ? '' : 'none';
    }
    if (!state.on) {
      stopStatic();
      stopGL();
      hideNoise(0);
      
      
      hideOutdatedPlaceholder();
      refreshUi();
      return state.on;
    }
    if (!mapGateOpen) { refreshUi(); return state.on; }
    if (state.mapOutdated) {
      
      paintOutdatedPlaceholder();
      refreshUi();
      return state.on;
    }
    if (pendingMode && applyPendingMode()) return state.on;
    if (state.mode === 'static') {
      if (!state.img) loadColour().catch(() => {});
      startStatic();
    } else if (glc && glc.ready && !glc.lost) {
      startGL();
    } else {
      setMode(state.mode);
    }
    refreshUi();
    return state.on;
  }

  state.setMode = setMode;
  state.debugRender = debugRender;
  state.liveViewState = liveViewState;
  state.stats = stats;
  state.intro = setIntro;
  state.bench = bench;
  state.retry = retry;
  state.setFps30 = setFps30;
  state.setAdaptiveFps = setAdaptiveFps;
  state.setFrameCap = setFrameCap;
  state.setStaticWhenHidden = setStaticWhenHidden;
  state.setBrightness = setBrightness;
  state.setOpacity = setOpacity;
  state.setOn = setOn;
  state.setWhalePose = setWhalePose;
  state.whale = setWhale;
  state.whaleAt = setWhaleAt;
  
  
  state.mapGateStatus = () => state.mapCheck;
  state.applyMapCheckForTest = ({ pointer, timingUrls = [], cacheUrls = [], manifest = null }) => {
    if (pointer) activePointer = parsePointer(pointer, seaConsts);
    const v = checkMapGate({
      pointerStamp: activePointer.map.stamp, timingUrls, cacheUrls, manifest,
    });
    state.mapCheck = {
      ...v,
      pointerStamp: activePointer.map.stamp,
      assetVersion: activePointer.assetVersion,
    };
    if (v.status === 'outdated') enterOutdated(v);
    return state.mapCheck;
  };
  
  
  
  state.noise = (on = true) => {
    if (on === false) { hideNoise(0); return false; }
    return showNoise();
  };
  
  
  state.noiseInfo = () => {
    const n = document.getElementById(NOISE_ID);
    if (!n) return { present: false };
    const W = n.width, H = n.height;
    let minA = 255, maxA = 0, sumA = 0, count = 0, minRGB = 255, maxRGB = 0;
    try {
      const px = n.getContext('2d').getImageData(0, 0, W, H).data;
      const step = 4 * Math.max(1, Math.floor((W * H) / 20000));
      for (let i = 0; i < px.length; i += step) {
        const a = px[i + 3];
        if (a < minA) minA = a;
        if (a > maxA) maxA = a;
        sumA += a; count++;
        if (px[i] < minRGB) minRGB = px[i];
        if (px[i] > maxRGB) maxRGB = px[i];
      }
    } catch (e) {
      return { present: true, error: String(e) };
    }
    const cs = getComputedStyle(n);
    const ramps = liveRamps(performance.now());
    return {
      present: true, size: [W, H], css: [n.clientWidth || W, n.clientHeight || H],
      samples: count,
      alpha: { min: minA, max: maxA, mean: Math.round(sumA / count) },
      grey: { min: minRGB, max: maxRGB },
      style: {
        opacity: cs.opacity, zIndex: cs.zIndex, blend: cs.mixBlendMode,
        position: cs.position, display: cs.display,
      },
      reveal: Number(ramps.reveal.toFixed(3)),
    };
  };

  
  
  
  
  
  
  const COLOUR_DEFAULTS = { opacity: 1, brightness: 1.1, hue: 0, sat: 100 };

  function uiState() {
    return {
      on: state.on, mode: state.mode, opacity: state.opacity,
      brightness: state.brightness, hue: state.hue, sat: state.sat,
      fps30: state.fps30,
      frameCap: state.frameCap, staticWhenHidden: state.staticWhenHidden,
      canUseShader: state.canUseShader, maxTextureSize: state.maxTextureSize,
      loading: state.loading, error: state.error,
      update: updateState(),
    };
  }

  function applyChange(patch) {
    if (!patch) return uiState();
    if ('on' in patch) {
      localStorage.setItem('zz-sea-on', setOn(patch.on) ? '1' : '0');
    }
    if ('mode' in patch) {
      requestMode(patch.mode);       
      localStorage.setItem('zz-sea-mode', patch.mode);
    }
    if ('retry' in patch) {
      retry();
    }
    if ('opacity' in patch) {
      localStorage.setItem('zz-sea-opacity', String(setOpacity(patch.opacity)));
    }
    if ('brightness' in patch) {
      const v = setBrightness(patch.brightness);
      localStorage.setItem('zz-sea-brightness', String(Math.round(v * 100)));
    }
    if ('hue' in patch) {
      localStorage.setItem('zz-sea-hue', String(Math.round(setHue(patch.hue))));
    }
    if ('sat' in patch) {
      localStorage.setItem('zz-sea-sat', String(Math.round(setSat(patch.sat))));
    }
    if ('reset' in patch) {
      setOpacity(COLOUR_DEFAULTS.opacity);
      setBrightness(COLOUR_DEFAULTS.brightness);
      setHue(COLOUR_DEFAULTS.hue);
      setSat(COLOUR_DEFAULTS.sat);
      localStorage.setItem('zz-sea-opacity', String(COLOUR_DEFAULTS.opacity));
      localStorage.setItem('zz-sea-brightness',
        String(Math.round(COLOUR_DEFAULTS.brightness * 100)));
      localStorage.setItem('zz-sea-hue', String(COLOUR_DEFAULTS.hue));
      localStorage.setItem('zz-sea-sat', String(COLOUR_DEFAULTS.sat));
    }
    if ('updateCheck' in patch) {
      checkUpdate();
    }
    if ('updateGet' in patch) {
      
      
      updateRequested = true;
      try { window.open(scriptUrl(), '_blank', 'noopener'); } catch {}
    }
    if ('fps30' in patch) {
      localStorage.setItem('zz-sea-fps', setAdaptiveFps(patch.fps30) ? '1' : '0');
    }
    if ('frameCap' in patch) {
      localStorage.setItem('zz-sea-cap', String(setFrameCap(patch.frameCap)));
    }
    if ('staticWhenHidden' in patch) {
      localStorage.setItem('zz-sea-hidden',
        setStaticWhenHidden(patch.staticWhenHidden) ? '1' : '0');
    }
    return uiState();
  }

  seaUi = mountSeaUi({
    getState: uiState, onChange: applyChange, getStats: stats, bench,
    getEnabled: onExplorationMap,
  });

  
  
  document.addEventListener('visibilitychange', () => {
    
    
    
    if (!document.hidden) {
      anchorClock(false);
      checkLiveMap();
    }
    onPresenceChange();
  });
  window.addEventListener('blur', onPresenceChange);
  window.addEventListener('focus', () => {
    onPresenceChange();
    checkLiveMap();
  });
  
  
  setInterval(() => {
    if (!document.hidden && onExplorationMap()) checkLiveMap();
  }, MANIFEST_CHECK_MS);
  
  
  window.addEventListener('resize', () => {
    if (state.mapOutdated && state.on && mapGateOpen) paintOutdatedPlaceholder();
  });

  

  
  
  anchorClock(true);

  
  
  loadPointer();

  
  
  
  setTimeout(checkUpdate, 8000);
  setInterval(checkUpdate, UPDATE_CHECK_MS);

  
  
  
  

  
  
  
  
  if (startupMode !== 'static') {
    pendingMode = startupMode;
    watchForDeck();
    applyPendingMode();            
  } else if (state.on) {
    showNoise();                   
    startStatic();
  }

  
  
  
  setInterval(() => syncMapGate(true), 250);
  syncMapGate(true);
})();
})();
