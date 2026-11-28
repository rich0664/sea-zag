// ==UserScript==
// @name         sea-zag
// @namespace    sea-zag
// @version      0.7.0-pre.80
// @description  Draws a bathymetric sea between the zig-zag.fm archipelagos: depth = distance from land, terrain = layered noise, rendered tile-aligned behind the map.
// @match        https://www.zig-zag.fm/*
// @grant        none
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/rich0664/sea-zag/pre-release/dist/sea-zag.user.js
// @downloadURL  https://raw.githubusercontent.com/rich0664/sea-zag/pre-release/dist/sea-zag.user.js
// ==/UserScript==

(() => {
const seaConsts = {"version":"0.7.0-pre.80","assetVersion":"2026-11-17a","whaleVersion":"2","assetBase":"https://raw.githubusercontent.com/rich0664/sea-zag/pre-release/dist","map":{"id":64,"stamp":"2026-11-01T22-21-31Z","w":7749,"h":5254},"pipelineStamp":"a5d89e90fc2c","distMax":600,"alongScale":1.03,"heightLo":0.1606,"heightHi":1,"auxScale":2,"soilScale":4,"palette":{"stops":[0.001,0.03,0.07,0.12,0.2,0.32,0.46,0.66,1],"cols":[[74,126,156],[58,104,134],[45,86,116],[35,70,98],[28,57,82],[22,46,67],[17,36,53],[12,25,37],[7,13,18]]},"coast":{"levels":5,"strength":0.15,"r":138,"g":199,"b":234},"flowCell":16,"speedCell":4,"pad":0,"backingCap":2560,"baseline":{"shore":16,"shelf":26,"flow":3.7,"wave":2.5,"spec":0.035,"specPow":14.5,"specMode":2,"specSize":0.76,"specInvert":0.02,"specFloor":0.3,"grain":0.04,"foam":0.25,"deep":0.6,"swell":0.008,"adir":254,"aspeed":1.42,"ascale":0.156,"bdir":45,"bspeed":1.16,"bscale":0.046,"par":0.78,"pom":5,"dslow":0.91,"win":0.58,"wout":0.82,"cycle":7,"warp":2.1,"wbias":1,"deflect":1,"deflectReach":50},"curves":{"pc":[0,0.187,0.339,0.578,1],"sc":[0,0.057,0.274,0.492,0.926],"wc":[0,0.187,0.426,0.594,1]},"presets":{"default":{"label":"default","dayNight":true,"S":{"tileBright":42,"surfStrength":118,"chopAmp":112,"crossAmp":122,"swellAmp":0,"macroAmp":29,"bandLimit":0,"swellDir":251,"macroAlign":0,"choppy":1,"painterly":75,"ridgeMix":100,"macroZoom":1.15,"chopScale":9.5,"crossScale":10,"swellScale":212,"macroScale":30,"warp":10,"wbias":1,"dslow":0.86,"grain":0.015,"adir":254,"bdir":45,"waveSpd":100,"flowSpd":100,"depthGamma":0.65,"depthContrast":1.8,"waterClarity":1.27,"bedVis":100,"kR":2.9,"kG":2.2,"kB":1.8,"soilMix":0,"soilLumLock":100,"soilDark":150,"soilSat":46,"murkGain":67,"murkAbsorb":129,"murkScatter":40,"murkDepthFade":0,"reliefFade":1.8,"deepVeil":13,"veilStart":0.52,"coastStrength":0.135,"coastLevels":14,"hue":7,"sat":95,"bright":135,"hour":88.29160000007323,"sunAzOff":-7,"sunMaxEl":85,"sunAz":191,"sunEl":41,"relief":31,"biolum":31,"shadowStr":49,"shadowLen":200,"shadowH":80,"shadowSoft":9,"shadowMaxEl":10,"shadowStretch":3.5,"whaleDepth":-1,"whaleSpeed":100,"whaleRadius":75,"specGain":29,"specOpacity":50,"roughTight":0.08,"roughBroad":0.33,"viewTilt":1.2,"peakBias":55,"specTilt":0.64,"specCut":14,"specDrift":0,"specStretch":1,"specSpread":1.5,"specRadius":0.98,"skyGain":69,"skyOpacity":49,"fresnelF0":0.075,"fresnelPow":2,"clouds":52,"skyNormal":15,"skyCel":11,"skyDir":0,"sunBloom":150,"shore":15.6,"shelf":65,"wave":1.95,"foam":0.39,"win":0.58,"wout":0.82,"fetchW":0,"shoalG":43,"flow":3.7,"cycle":7,"deflect":1,"deflectReach":50,"par":0.608,"pom":6,"spec":0.035,"specPow":14.5,"specSize":0.76,"specInvert":0.02,"specFloor":0.3,"murkCol":"#40776e"},"TOG":{"snap":1,"flowMode":1,"clamp":0,"pirate":0,"tiles":1,"specMode":2,"soilRes":"1x","timeMode":"custom","debugMode":0,"pomFloor":1,"surfMode":1,"skyOn":1,"specModel":0,"surfPattern":4,"macroZoomMode":1,"hemi":"S","whaleOn":1,"whalePause":0,"texelFbo":1,"specGizmo":0,"skyBlend":0,"specBlend":0},"defines":{"HAS_PARALLAX":1,"HAS_WARP":1,"NOISE_LAYERS":2,"FLOW_LOD":1,"HAS_LIGHTING":1,"HAS_SHADOWS":1,"SHADOW_STEPS":14,"HAS_SOIL":0,"HAS_MURK":1,"HAS_SKY_MATCAP":1,"HAS_GGX":2,"HAS_SURF_OCT":4,"HAS_SHOAL_BREAKERS":1,"HAS_BIOLUM":1,"HAS_WHALE":1,"USE_NOISE_LUT":0,"USE_HALF_SHADOW":1,"USE_POM_FAST":1},"KF":{"dawn":{"key":"#f52314","amb":"#e1a166","skyZ":"#415f90","skyH":"#ff5447","skyD":"#1c2a48","lightI":1,"skyI":1,"specI":1},"day":{"key":"#ffffff","amb":"#6e8ba8","skyZ":"#2d649e","skyH":"#9ec6e0","skyD":"#4c7ba3","lightI":1.15,"skyI":1,"specI":1.2},"dusk":{"key":"#ff8438","amb":"#666c9c","skyZ":"#341a5b","skyH":"#d35c3c","skyD":"#161e37","lightI":1,"skyI":1.3,"specI":3},"night":{"key":"#b8d3ff","amb":"#243452","skyZ":"#08111f","skyH":"#1b2d47","skyD":"#060c18","lightI":0.6,"skyI":0.55,"specI":2.4}},"curves":{"pc":[0,0.187,0.339,0.578,1],"sc":[0,0.057,0.274,0.492,0.926],"wc":[0,0.187,0.426,0.594,1]}},"classic":{"label":"classic","dayNight":false,"S":{"tileBright":42,"surfStrength":100,"chopAmp":100,"crossAmp":100,"swellAmp":0,"macroAmp":0,"bandLimit":60,"swellDir":250,"macroAlign":0,"choppy":2.5,"painterly":0,"ridgeMix":0,"macroZoom":0.95,"chopScale":8,"crossScale":22,"swellScale":55,"macroScale":110,"warp":2.1,"wbias":1,"dslow":0.91,"grain":0.04,"adir":254,"bdir":45,"waveSpd":100,"flowSpd":100,"depthGamma":1,"depthContrast":1,"waterClarity":1,"bedVis":0,"kR":0,"kG":0,"kB":0,"soilMix":0,"soilLumLock":100,"soilDark":100,"soilSat":100,"murkGain":0,"murkAbsorb":65,"murkScatter":55,"murkDepthFade":1,"reliefFade":1.8,"deepVeil":0,"veilStart":0.25,"coastStrength":0,"coastLevels":5,"hue":0,"sat":100,"bright":110,"hour":52,"sunAzOff":0,"sunMaxEl":58,"sunAz":245,"sunEl":22,"relief":0,"biolum":0,"shadowStr":0,"shadowLen":80,"shadowH":28,"shadowSoft":6,"shadowMaxEl":28,"shadowStretch":1.35,"whaleDepth":-1,"whaleSpeed":100,"whaleRadius":75,"specGain":0,"specOpacity":100,"roughTight":0.09,"roughBroad":0.38,"viewTilt":0.45,"peakBias":0,"specTilt":0,"specCut":25,"specDrift":0,"specStretch":1,"specSpread":1,"specRadius":1.5,"skyGain":0,"skyOpacity":0,"fresnelF0":0.02,"fresnelPow":4,"clouds":0,"skyNormal":100,"skyCel":0,"skyDir":0,"sunBloom":0,"shore":16,"shelf":26,"wave":2.5,"foam":0.25,"win":0.58,"wout":0.82,"fetchW":0,"shoalG":0,"flow":3.7,"cycle":7,"deflect":1,"deflectReach":50,"par":0.78,"pom":5,"spec":0.035,"specPow":14.5,"specSize":0.76,"specInvert":0.02,"specFloor":0.3,"murkCol":"#5f8791"},"TOG":{"snap":1,"flowMode":1,"clamp":0,"pirate":0,"tiles":1,"specMode":2,"soilRes":"off","timeMode":"off","debugMode":0,"pomFloor":1,"surfMode":0,"skyOn":0,"specModel":1,"surfPattern":0,"macroZoomMode":1,"hemi":"S","whaleOn":1,"whalePause":0,"texelFbo":1,"specGizmo":0,"skyBlend":0,"specBlend":0},"defines":{"HAS_PARALLAX":1,"HAS_WARP":1,"NOISE_LAYERS":2,"FLOW_LOD":1,"HAS_LIGHTING":0,"HAS_SHADOWS":0,"SHADOW_STEPS":14,"HAS_SOIL":0,"HAS_MURK":0,"HAS_SKY_MATCAP":0,"HAS_GGX":0,"HAS_SURF_OCT":1,"HAS_SHOAL_BREAKERS":0,"HAS_BIOLUM":0,"HAS_WHALE":1,"USE_NOISE_LUT":0,"USE_HALF_SHADOW":0,"USE_POM_FAST":0},"KF":{"dawn":{"key":"#f52314","amb":"#e1a166","skyZ":"#415f90","skyH":"#ff5447","skyD":"#1c2a48","lightI":1,"skyI":1,"specI":1},"day":{"key":"#ffffff","amb":"#6e8ba8","skyZ":"#2d649e","skyH":"#9ec6e0","skyD":"#4c7ba3","lightI":1.15,"skyI":1,"specI":1.2},"dusk":{"key":"#ff8438","amb":"#666c9c","skyZ":"#341a5b","skyH":"#d35c3c","skyD":"#161e37","lightI":1,"skyI":1.3,"specI":3},"night":{"key":"#b8d3ff","amb":"#243452","skyZ":"#08111f","skyH":"#1b2d47","skyD":"#060c18","lightI":0.6,"skyI":0.55,"specI":2.4}},"curves":{"pc":[0,0.187,0.339,0.578,1],"sc":[0,0.057,0.274,0.492,0.926],"wc":[0,0.187,0.426,0.594,1]}}},"meshVersion":"4"};

/* ---- sea-core.js ---- */
const MODE_IDS = ['baseline', 'medium', 'low', 'extra-low', 'static'];



const PRESET_IDS = Object.keys(seaConsts.presets || { default: {} });
const RES_SCALES = [1, 0.75, 0.5];
const TIME_MODES = ['auto', 'day', 'night', 'custom', 'off'];



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




const TIER_DEFINES = {
  medium: { HAS_PARALLAX: 0, SHADOW_STEPS: 8, HAS_GGX: 1, HAS_SURF_OCT: 3 },
  low: {
    HAS_PARALLAX: 0, HAS_WARP: 0, FLOW_LOD: 0, NOISE_LAYERS: 1,
    HAS_LIGHTING: 0, HAS_SHADOWS: 0, HAS_SOIL: 0, HAS_MURK: 0,
    HAS_SKY_MATCAP: 0, HAS_GGX: 1, HAS_SURF_OCT: 1,
    HAS_SHOAL_BREAKERS: 0, HAS_BIOLUM: 0,
  },
  'extra-low': {
    HAS_PARALLAX: 0, HAS_WARP: 0, FLOW_LOD: 0, NOISE_LAYERS: 1,
    HAS_LIGHTING: 0, HAS_SHADOWS: 0, HAS_SOIL: 0, HAS_MURK: 0,
    HAS_SKY_MATCAP: 0, HAS_GGX: 0, HAS_SURF_OCT: 1,
    HAS_SHOAL_BREAKERS: 0, HAS_BIOLUM: 0,
  },
};


function intersectDefines(base, tier) {
  const out = { ...(base || {}) };
  for (const [k, v] of Object.entries(tier || {})) {
    const have = Number(out[k]);
    const want = Number(v);
    out[k] = isFinite(have) ? Math.min(have, want) : want;
  }
  return out;
}





function modeSettings(id, presetId = 'default', resScale = 1) {
  if (!MODE_IDS.includes(id)) throw new Error(`unknown sea mode: ${id}`);
  const presets = seaConsts.presets || {};
  const key = presets[presetId] ? presetId : 'default';
  const preset = presets[key] || null;
  const scale = RES_SCALES.includes(Number(resScale)) ? Number(resScale) : 1;
  if (id === 'static') {
    return {
      shader: false, renderScale: 1, uniforms: null, defines: null,
      preset: key, kf: preset ? preset.KF || null : null,
      dayNight: !!(preset && preset.dayNight),
      curves: (preset && preset.curves) || seaConsts.curves,
    };
  }
  if (!preset) throw new Error(`unknown sea preset: ${presetId}`);

  const tog = preset.TOG || {};
  
  
  
  const defines = intersectDefines(preset.defines || {}, TIER_DEFINES[id] || {});
  defines.USE_NOISE_LUT = 0;
  const uniforms = {
    ...(preset.S || seaConsts.baseline),
    flowMode: tog.flowMode === undefined ? 1 : (tog.flowMode ? 1 : 0),
    noiseLayers: (preset.defines && preset.defines.NOISE_LAYERS) || 2,
    travelMax: 0,
    snap: tog.snap === undefined ? 1 : (tog.snap ? 1 : 0),
  };
  return {
    shader: true,
    renderScale: scale,
    uniforms,
    defines,
    preset: key,
    kf: preset.KF || null,
    dayNight: !!preset.dayNight,
    curves: preset.curves || seaConsts.curves,
  };
}




const TEX_BYTES = {
  colour: 4, dist: 1, aux: 3, flow: 3, speed: 3,
  height: 1, normal: 3, soil: 4, palette: 3, sky: 4,
  shadow: 1, texel: 4,
};
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




function resolveResetMode(env, capable = true) {
  return capable ? pickMode('', env || {}) : 'static';
}




const RESET_PERF = {
  mode: '', resScale: 1, fps30: true, frameCap: 0, staticWhenHidden: true,
};
const RESET_COLOUR = { opacity: 1, brightness: 1.1, hue: 0, sat: 100 };
const RESET_MOTION = { waveSpeed: 1, flowSpeed: 1 };
const RESET_STYLE = { preset: 'default', timeMode: 'auto', customHour: 13 };



function parseResScale(raw) {
  const n = num(raw, 1);
  if (RES_SCALES.includes(n)) return n;
  if (RES_SCALES.includes(n / 100)) return n / 100;
  return 1;
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
    
    waveSpeed: clamp(num(r.waveSpeed, 100) / 100, 0, 2),
    flowSpeed: clamp(num(r.flowSpeed, 100) / 100, 0, 2),
    
    fps30: !(r.fps30 === false || r.fps30 === '0' || r.fps30 === 'false'),
    
    frameCap: FRAME_CAPS.includes(Number(r.frameCap)) ? Number(r.frameCap) : 0,
    
    staticWhenHidden:
      !(r.staticWhenHidden === false || r.staticWhenHidden === '0' ||
        r.staticWhenHidden === 'false'),
    resScale: parseResScale(r.resScale),
    preset: PRESET_IDS.includes(r.preset) ? r.preset : 'default',
    timeMode: TIME_MODES.includes(r.timeMode) ? r.timeMode : 'auto',
    
    customHour: clamp(num(r.customHour, 13), 0, 24),
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




const LEGACY_BLEED_TILES = 6.0;







function staticBlitLayout(vs, cssW, cssH, imgW, imgH, mapW, mapH, pad = 0,
                          mapOx = 0, mapOy = 0) {
  const bw = mapW + 2 * pad;
  if (!(bw > 0 && imgW > 0 && imgH > 0)) return null;
  const p = vs.padding || {};
  const z = Math.pow(2, vs.zoom);
  const dx = clamp(((p.left || 0) + cssW - (p.right || 0)) / 2, 0, cssW) - cssW / 2;
  const dy = clamp(((p.top || 0) + cssH - (p.bottom || 0)) / 2, 0, cssH) - cssH / 2;
  const pxt = imgW / bw;                         
  const s = z / pxt;                             
  
  
  
  
  const tx = vs.target[0] - mapOx;
  const ty = vs.target[1] - mapOy;
  const ox = cssW / 2 + dx - (tx + 0.5 + pad) * z;
  const oy = cssH / 2 + dy + (mapH - 0.5 - ty + pad) * z;

  
  const wx0 = (0 - cssW / 2 - dx) / z + tx;
  const wx1 = (cssW - cssW / 2 - dx) / z + tx;
  const wy0 = (0 - cssH / 2 - dy) / z + ty;
  const wy1 = (cssH - cssH / 2 - dy) / z + ty;

  const sx0 = clamp(Math.floor((wx0 + 0.5 + pad) * pxt) - 1, 0, imgW);
  const sx1 = clamp(Math.ceil((wx1 + 0.5 + pad) * pxt) + 1, 0, imgW);
  const sy0 = clamp(Math.floor((mapH - 0.5 - wy1 + pad) * pxt) - 1, 0, imgH);
  const sy1 = clamp(Math.ceil((mapH - 0.5 - wy0 + pad) * pxt) + 1, 0, imgH);
  if (sx1 <= sx0 || sy1 <= sy0) return null;
  return { s, ox, oy, sx0, sy0, sx1, sy1 };
}




function seaTarget(vs, mapH, mapOx = 0, mapOy = 0) {
  return [vs.target[0] - mapOx + 0.5, mapH - 0.5 - (vs.target[1] - mapOy)];
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





function advancePhase(phase, dtSec, speed, maxDt = 0.25) {
  const dt = clamp(Number(dtSec) || 0, 0, maxDt);
  return (Number(phase) || 0) + dt * Math.max(0, Number(speed) || 0);
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






const KF_FIELDS = ['key', 'amb', 'skyZ', 'skyH', 'skyD'];
const KF_INT_FIELDS = ['lightI', 'skyI', 'specI'];
const KEY_ORDER = [['night', 1.0], ['dawn', 6.25], ['day', 12.5], ['dusk', 19.0]];




const KF_LIST = [['dusk', -5.0], ...KEY_ORDER, ['night', 25.0]];
const SUNRISE = 6.0;
const SUNSET = 19.0;
const MOONRISE = 19.5;
const MOONSET = 5.5;
const MAX_MOON_EL = 52;
const MIN_KEY_EL = 0.0175;

const clamp01 = v => Math.max(0, Math.min(1, Number(v) || 0));
const smoothstep01 = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const smoothMix = t => t * t * (3 - 2 * t);
const lerp3 = (a, b, t) => [0, 1, 2].map(i => a[i] + (b[i] - a[i]) * t);
const NEUTRAL_RGB = [1, 1, 1];

function hex01(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || ''));
  if (!m) return NEUTRAL_RGB;
  const n = parseInt(m[1], 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function kfSwatch(kf, name) {
  const src = (kf && kf[name]) || (kf && kf.night) || {};
  const out = {};
  for (const f of KF_FIELDS) out[f] = hex01(src[f]);
  for (const f of KF_INT_FIELDS) out[f] = num(src[f], 1);
  return out;
}


function kfAt(hour24, kf) {
  const h = ((Number(hour24) % 24) + 24) % 24;
  let a = KF_LIST[0];
  let b = KF_LIST[1];
  for (let i = 0; i < KF_LIST.length - 1; i++) {
    if (h >= KF_LIST[i][1] && h <= KF_LIST[i + 1][1]) {
      a = KF_LIST[i];
      b = KF_LIST[i + 1];
      break;
    }
  }
  let t = (h - a[1]) / Math.max(1e-6, b[1] - a[1]);
  t = t * t * (3 - 2 * t);
  const ca = kfSwatch(kf, a[0]);
  const cb = kfSwatch(kf, b[0]);
  const out = {};
  for (const f of KF_FIELDS) out[f] = lerp3(ca[f], cb[f], t);
  for (const f of KF_INT_FIELDS) out[f] = ca[f] + (cb[f] - ca[f]) * t;
  return out;
}

function nightAmount(h) {
  return clamp01(
    h < 5.0 || h > 20.5 ? 1
      : h < 7.0 ? 1 - (h - 5.0) / 2.0
        : h > 18.5 ? (h - 18.5) / 2.0 : 0,
  );
}

const horizonXY = d => {
  const len = Math.hypot(d[0], d[1]) || 1;
  return [d[0] / len, d[1] / len];
};



function bodyArc(hour, rise, set, maxEl, sign) {
  const span = set > rise ? set - rise : set + 24 - rise;
  let frac;
  if (set > rise) {
    if (hour >= rise && hour <= set) frac = (hour - rise) / span;
    else frac = 1 + ((((hour - set) % 24) + 24) % 24) / (24 - span);
  } else if (hour >= rise || hour <= set) {
    frac = ((((hour - rise) % 24) + 24) % 24) / span;
  } else {
    frac = 1 + (hour - set) / (24 - span);
  }
  const arc = sign * frac * Math.PI;
  const el = Math.sin(frac * Math.PI) * maxEl * Math.PI / 180;
  const ce = Math.cos(el);
  return {
    frac, arc, el,
    dir: [ce * Math.cos(arc), ce * Math.sin(arc), Math.sin(el)],
  };
}

function liftAboveHorizon(dir, minZ) {
  const [x, y, z] = dir;
  if (z >= minZ) return dir;
  const xyLen = Math.hypot(x, y) || 1;
  const ce = Math.sqrt(Math.max(0, 1 - minZ * minZ));
  return [x / xyLen * ce, y / xyLen * ce, minZ];
}

function rotateAz(dir, deg) {
  if (!deg) return dir;
  const a = deg * Math.PI / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [dir[0] * c - dir[1] * s, dir[0] * s + dir[1] * c, dir[2]];
}



function solarState(hour24, opts = {}) {
  const h = ((Number(hour24) % 24) + 24) % 24;
  const sign = opts.hemi === 'N' ? -1 : 1;
  const maxEl = Math.max(1, num(opts.sunMaxEl, 85));
  const azOff = num(opts.sunAzOff, 0);
  const sunArc = bodyArc(h, SUNRISE, SUNSET, maxEl, sign);
  const moonArc = bodyArc(h, MOONRISE, MOONSET, MAX_MOON_EL, sign);
  const sunDir = liftAboveHorizon(rotateAz(sunArc.dir, azOff), MIN_KEY_EL);
  const moonDir = liftAboveHorizon(rotateAz(moonArc.dir, azOff), MIN_KEY_EL);

  
  const sunSkyVis = smoothstep01(4.4, 6.4, h) * smoothstep01(20.6, 18.6, h);
  const sunKeyVis = smoothstep01(5.25, 6.4, h) * (1 - smoothstep01(18.6, 19.75, h));
  const moonSkyVis = h >= 12 ? smoothstep01(19.0, 21.0, h) : 1 - smoothstep01(4.0, 6.0, h);
  const moonKeyVis = h >= 12 ? smoothstep01(19.75, 21.0, h) : 1 - smoothstep01(4.0, 5.25, h);

  let isMoon = moonKeyVis > sunKeyVis;
  let keyDir = isMoon ? moonDir : sunDir;
  let keyVis = isMoon ? moonKeyVis : sunKeyVis;
  let sunVis = sunSkyVis;
  let moonVis = moonSkyVis;

  if (opts.timeMode === 'off') {
    keyDir = sunDir;
    sunVis = 1.0;
    moonVis = 0.0;
    keyVis = 1.0;
    isMoon = false;
  }

  const keyXY = horizonXY(keyDir);
  const lowSun = 1 - clamp01(keyDir[2]);
  const drift = num(opts.specDrift, 0);
  const anchor = [
    keyXY[0] * (drift * (0.20 + 0.80 * lowSun)),
    keyXY[1] * (drift * (0.20 + 0.80 * lowSun)),
  ];
  return {
    hour: h, sunDir, moonDir, keyDir, keyVis, isMoon,
    sunKeyVis, moonKeyVis, sunSkyVis: sunVis, moonSkyVis: moonVis,
    sunXY: horizonXY(sunDir), moonXY: horizonXY(moonDir), keyXY,
    lowSun, anchor,
  };
}



function dayNightState(hour24, kf, opts = {}) {
  const k = kfAt(hour24, kf);
  const solar = solarState(hour24, opts);
  const moonMix = solar.isMoon ? smoothMix(clamp01(solar.keyVis)) : 0;
  const night = kfSwatch(kf, 'night');
  const h = solar.hour;
  return {
    ...solar,
    lightCol: k.key.map(v => v * k.lightI),
    ambCol: k.amb.map(v => v * k.lightI),
    skyZ: k.skyZ,
    skyH: k.skyH,
    skyD: k.skyD,
    specTint: lerp3(k.key, night.key, moonMix),
    nightMix: nightAmount(h),
    lightI: k.lightI,
    skyI: k.skyI,
    specI: k.specI,
    
    nightKey: night.key,
    nightSkyH: night.skyH,
  };
}



function waveSetEnvelope(unixSec) {
  const s = Number(unixSec);
  if (!isFinite(s)) return 1;
  return 1
    + 0.20 * Math.sin(2 * Math.PI * s / 270)
    + 0.08 * Math.sin(2 * Math.PI * s / 2280);
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
  allowRootFallback = true,
} = {}) {
  
  
  
  if (!allowRootFallback) {
    return pointerLoaded && assetVersion
      ? [assetUrl(name, base, assetVersion, true)]
      : [];
  }
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





const MAP_KINDS = ['exploration', 'gems', 'supporters'];



const MAPS_RECORD_FILE = 'sea-zag-maps.json';




const MANIFEST_URLS = {
  exploration: '/api/v2/maps/manifest',
  gems: '/api/v2/maps/manifest',
  supporters: '/api/v2/supporter-map/manifest',
};



const SAILORS_ATLAS_RE = /^\/sailors-map(?:\/|$)/;

function mapKindForVariant(variant, pathname = '') {
  if (variant === 'music') return 'exploration';
  if (variant === 'community') return 'gems';
  if (variant === 'sailors') {
    return SAILORS_ATLAS_RE.test(String(pathname || '')) ? null : 'supporters';
  }
  return null;
}

function manifestUrlForKind(kind) {
  return MANIFEST_URLS[kind] || null;
}

function mapsRecordUrl(base = seaConsts.assetBase) {
  return `${base}/${MAPS_RECORD_FILE}`;
}



function snapshotUrl(assetVersion, base = seaConsts.assetBase) {
  return assetUrl(POINTER_FILE, base, assetVersion, true);
}



function parseKindRecord(raw, kind) {
  if (!raw || typeof raw !== 'object') return null;
  if (!MAP_KINDS.includes(kind)) return null;
  const e = raw[kind];
  if (!e || typeof e !== 'object') return null;
  if (typeof e.stamp !== 'string' || !e.stamp) return null;
  if (typeof e.assetVersion !== 'string' || !e.assetVersion) return null;
  return {
    stamp: e.stamp,
    pipelineStamp: pointerText(e.pipelineStamp, ''),
    assetVersion: e.assetVersion,
    rasterSha256: pointerText(e.rasterSha256, ''),
  };
}



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




function pickLiveEntry(kind, manifest) {
  if (kind === 'exploration') return pickLiveMainEntry(manifest);
  if (kind !== 'gems' && kind !== 'supporters') return null;
  const e = kind === 'gems'
    ? (manifest && typeof manifest === 'object' ? manifest.community : null)
    : manifest;
  if (!e || typeof e !== 'object') return null;
  const stamp = extractMapStamp(e.png_url || e.base_url);
  if (!stamp) return null;
  return {
    map_id: Number(e.map_id),
    stamp,
    png_url: e.png_url || '',
    base_url: e.base_url || '',
  };
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



function nonNegInt(raw, fallback = 0) {
  const n = Number(raw);
  if (raw === null || raw === '' || typeof raw === 'boolean') return fallback;
  return Number.isInteger(n) && n >= 0 ? n : fallback;
}




function intOr(raw, fallback = 0) {
  if (raw === null || raw === undefined || raw === '' || typeof raw === 'boolean') {
    return fallback;
  }
  const n = Number(raw);
  return Number.isInteger(n) ? n : fallback;
}





function parsePalette(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (!Array.isArray(raw.stops) || !Array.isArray(raw.cols)) return null;
  if (raw.stops.length < 2 || raw.stops.length !== raw.cols.length) return null;
  const stops = raw.stops.map(Number);
  if (!stops.every(v => isFinite(v) && v >= 0 && v <= 1)) return null;
  for (let i = 1; i < stops.length; i++) {
    if (!(stops[i] > stops[i - 1])) return null;
  }
  const cols = [];
  for (const c of raw.cols) {
    if (!Array.isArray(c) || c.length < 3) return null;
    const rgb = c.slice(0, 3).map(Number);
    if (!rgb.every(v => isFinite(v) && v >= 0 && v <= 255)) return null;
    cols.push(rgb);
  }
  return { stops, cols };
}

function parseCoast(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const levels = kindPositive(raw.levels);
  const strength = kindFinite(raw.strength);
  const r = kindFinite(raw.r);
  const g = kindFinite(raw.g);
  const b = kindFinite(raw.b);
  if ([levels, strength, r, g, b].some(v => v === null)) return null;
  if (![r, g, b].every(v => v >= 0 && v <= 255)) return null;
  return { levels, strength, r, g, b };
}



function parseBakes(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const height = pointerText(raw.height, '');
  const normal = pointerText(raw.normal, '');
  const soil = pointerText(raw.soil, '');
  if (!height || !normal || !soil) return null;
  return {
    height,
    heightEncoding: pointerText(raw.heightEncoding, 'sqrt-depth'),
    normal,
    soil,
    soilScale: positive(raw.soilScale, seaConsts.soilScale ?? 4),
    speedChannels: pointerText(raw.speedChannels, 'speed-fetch-murk'),
  };
}





function parsePointer(raw, fallback = seaConsts) {
  const hasRaw = !!(raw && typeof raw === 'object');
  const p = hasRaw ? raw : {};
  const fb = fallback || {};
  const map = p.map && typeof p.map === 'object' ? p.map : {};
  const fbMap = fb.map || {};
  const w = positive(map.w, fbMap.w);
  const h = positive(map.h, fbMap.h);
  
  
  
  
  const pad = hasRaw ? ('pad' in p ? nonNegInt(p.pad, 0) : 0) : nonNegInt(fb.pad, 0);
  
  
  
  const ox = hasRaw ? ('ox' in map ? intOr(map.ox, 0) : 0) : intOr(fbMap.ox, 0);
  const oy = hasRaw ? ('oy' in map ? intOr(map.oy, 0) : 0) : intOr(fbMap.oy, 0);
  return {
    schema: 1,
    assetVersion: pointerText(p.assetVersion, fb.assetVersion ?? fb.version),
    whaleVersion: pointerText(p.whaleVersion, fb.whaleVersion),
    meshVersion: pointerText(p.meshVersion, fb.meshVersion),
    map: {
      kind: pointerText(map.kind, fbMap.kind ?? 'exploration'),
      id: positive(map.id, fbMap.id),
      stamp: pointerText(map.stamp, fbMap.stamp),
      w,
      h,
      ox,
      oy,
    },
    pad,
    bakeW: w + 2 * pad,
    bakeH: h + 2 * pad,
    pipelineStamp: pointerText(p.pipelineStamp, fb.pipelineStamp),
    distMax: positive(p.distMax, fb.distMax),
    alongScale: positive(p.alongScale, fb.alongScale),
    heightLo: positive(p.heightLo, fb.heightLo),
    heightHi: positive(p.heightHi, fb.heightHi),
    auxScale: positive(p.auxScale, fb.auxScale),
    flowCell: positive(p.flowCell, fb.flowCell),
    speedCell: positive(p.speedCell, fb.speedCell),
    palette: parsePalette(p.palette) || parsePalette(fb.palette) || null,
    coast: parseCoast(p.coast) || parseCoast(fb.coast) || null,
    
    
    
    
    bakes: hasRaw ? parseBakes(p.bakes) : parseBakes(fb.bakes),
  };
}







function kindFinite(raw) {
  if (raw === null || raw === undefined || raw === '' || typeof raw === 'boolean') {
    return null;
  }
  const v = Number(raw);
  return isFinite(v) ? v : null;
}

function kindPositive(raw) {
  const v = kindFinite(raw);
  return v !== null && v > 0 ? v : null;
}

function kindPad(raw) {
  if (typeof raw !== 'number' && typeof raw !== 'string') return null;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 0 ? n : null;
}



function kindInt(raw) {
  const v = kindFinite(raw);
  return v !== null && Number.isInteger(v) ? v : null;
}

function parseKindPointer(raw, expectedKind) {
  if (!raw || typeof raw !== 'object') return null;
  if (!MAP_KINDS.includes(expectedKind)) return null;
  const map = raw.map;
  if (!map || typeof map !== 'object') return null;
  const kind = map.kind === undefined && expectedKind === 'exploration'
    ? 'exploration'
    : map.kind;
  if (kind !== expectedKind) return null;
  if (typeof raw.assetVersion !== 'string' || !raw.assetVersion) return null;
  if (typeof map.stamp !== 'string' || !map.stamp) return null;
  const w = kindPositive(map.w);
  const h = kindPositive(map.h);
  const distMax = kindPositive(raw.distMax);
  const alongScale = kindPositive(raw.alongScale);
  const heightHi = kindPositive(raw.heightHi);
  const auxScale = kindPositive(raw.auxScale);
  const flowCell = kindPositive(raw.flowCell);
  const speedCell = kindPositive(raw.speedCell);
  const heightLo = kindFinite(raw.heightLo);
  if (![w, h, distMax, alongScale, heightHi, auxScale, flowCell, speedCell]
    .every(v => v !== null)) return null;
  if (heightLo === null || heightLo < 0 || heightLo >= heightHi) return null;
  const pad = 'pad' in raw ? kindPad(raw.pad) : 0;
  if (pad === null) return null;
  
  
  if (('ox' in map) !== ('oy' in map)) return null;
  const ox = 'ox' in map ? kindInt(map.ox) : 0;
  const oy = 'oy' in map ? kindInt(map.oy) : 0;
  if (ox === null || oy === null) return null;
  const bakeW = w + 2 * pad;
  const bakeH = h + 2 * pad;
  for (const [key, want] of [['bakeW', bakeW], ['bakeH', bakeH]]) {
    if (!(key in raw)) continue;
    if (kindFinite(raw[key]) !== want) return null;
  }
  return {
    schema: 1,
    assetVersion: raw.assetVersion,
    whaleVersion: pointerText(raw.whaleVersion, ''),
    meshVersion: pointerText(raw.meshVersion, ''),
    map: {
      kind,
      id: kindPositive(map.id) ?? 0,
      stamp: map.stamp,
      w,
      h,
      ox,
      oy,
      rasterSha256: pointerText(map.rasterSha256, ''),
    },
    pad,
    bakeW,
    bakeH,
    pipelineStamp: pointerText(raw.pipelineStamp, ''),
    distMax,
    alongScale,
    heightLo,
    heightHi,
    auxScale,
    flowCell,
    speedCell,
    palette: parsePalette(raw.palette),
    coast: parseCoast(raw.coast),
    bakes: parseBakes(raw.bakes),
  };
}



function bakeDims(pointer) {
  if (!pointer || !pointer.map) return { pad: 0, bakeW: 0, bakeH: 0 };
  const pad = nonNegInt(pointer.pad, 0);
  return { pad, bakeW: pointer.map.w + 2 * pad, bakeH: pointer.map.h + 2 * pad };
}






function parallaxDepthScale(pointer, ref = seaConsts) {
  const p = pointer && typeof pointer === 'object' ? pointer : {};
  const r = ref && typeof ref === 'object' ? ref : {};
  const lo = kindFinite(p.heightLo);
  const hi = kindFinite(p.heightHi);
  const refLo = kindFinite(r.heightLo);
  const refHi = kindFinite(r.heightHi);
  if (lo === null || hi === null || refLo === null || refHi === null) return 1;
  const span = hi - lo;
  const refSpan = refHi - refLo;
  if (!(span > 0) || !(refSpan > 0)) return 1;
  return span / refSpan;
}






const MAP_BASE_RES = {
  exploration: /\/maps\/(?!seller-map\/)[^/]+\/[^/]+\/base\.bin\.br(?:[?#]|$)/,
  gems: /\/community-maps\/[^/]+\/[^/]+\/base\.bin\.br(?:[?#]|$)/,
  supporters: /\/supporter-maps\/[^/]+\/[^/]+\/base\.bin\.br(?:[?#]|$)/,
};



function newestBaseStamp(urls, kind = 'exploration') {
  const re = MAP_BASE_RES[kind];
  if (!re) return null;
  let best = null;
  for (const u of Array.isArray(urls) ? urls : []) {
    const s = String(u || '');
    if (!re.test(s)) continue;
    const stamp = extractMapStamp(s);
    if (stamp && (!best || stamp > best)) best = stamp;
  }
  return best;
}














function checkMapGate({
  kind = 'exploration', pointerStamp, timingUrls = [], cacheUrls = [],
  manifest = null, manifestFailed = false,
} = {}) {
  const timingStamp = newestBaseStamp(timingUrls, kind);
  const manifestEntry = pickLiveEntry(kind, manifest);
  const manifestStamp = manifestEntry ? manifestEntry.stamp : null;
  const unreadable = manifestFailed || (manifest != null && !manifestEntry);
  const cacheStamp = newestBaseStamp(cacheUrls, kind);
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

  if (!liveStamp || !pointer) {
    return unreadable && kind !== 'exploration'
      ? { status: 'unavailable', liveStamp: null, source: 'none' }
      : { status: 'unknown', liveStamp: null, source: 'none' };
  }
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
#ifndef HAS_LIGHTING
#define HAS_LIGHTING 1
#endif
#ifndef HAS_BIOLUM
#define HAS_BIOLUM 1
#endif
#ifndef HAS_SURF_OCT
#define HAS_SURF_OCT 4
#endif
#ifndef HAS_SKY_MATCAP
#define HAS_SKY_MATCAP 1
#endif
#ifndef HAS_GGX
#define HAS_GGX 2
#endif
#ifndef HAS_SHOAL_BREAKERS
#define HAS_SHOAL_BREAKERS 1
#endif
#ifndef HAS_WHALE
#define HAS_WHALE 1
#endif
#ifndef HAS_SHADOWS
#define HAS_SHADOWS 1
#endif
#ifndef SHADOW_STEPS
#define SHADOW_STEPS 14
#endif
// ---- compile-time paths (1 = optimized path, 0 = the reference path) -------
#ifndef USE_NOISE_LUT
#define USE_NOISE_LUT 1
#endif
#ifndef USE_HALF_SHADOW
#define USE_HALF_SHADOW 1
#endif
#ifndef USE_POM_FAST
#define USE_POM_FAST 1
#endif
#ifndef NOISE_LUT_UNPACK_G
// gradient channel unpack scale: 0.5 + 0.5 * gx * gScale / gMax
#define NOISE_LUT_UNPACK_G 7.3000
#endif
#ifndef HAS_SOIL
#define HAS_SOIL 1
#endif
#ifndef HAS_MURK
#define HAS_MURK 1
#endif
precision highp float;
precision highp sampler2D;
out vec4 outColor;

uniform sampler2D uHeight, uAux, uDist, uFlow, uSpeedTex, uNormal, uSoilTex, uPalette;
uniform sampler2D uCurve, uSliceCurve, uWarpCurve;
#if HAS_SKY_MATCAP
uniform sampler2D uSkyMatcap;
#endif
uniform vec2 uTarget, uSize, uFlowSize, uSpeedSize, uAuxSpan, uCenter;
#if USE_NOISE_LUT
// Seamless 256×256 RGBA8 noise + analytic-gradient table (see NOISE_LUT).
uniform sampler2D uNoiseLut;
#endif
#if HAS_SHADOWS && USE_HALF_SHADOW
uniform sampler2D uShadowTex;   // half-res cast-shadow target (R)
uniform vec2 uViewSize;         // full backing size the shadow target maps onto
#endif
// Exact map-texel pass: 0 = normal screen render, 1 = shade one map texel per
// fragment into the tile FBO (uTileOrigin + gl_FragCoord).
uniform vec2 uTileOrigin;
uniform float uTexelPass;
uniform float uFlowCell, uZoom, uZoomCss, uTime, uWaveTime, uFlowTime, uDistMax;
uniform float uShoreW, uShelf, uFlowSpeed, uGrain, uFoam, uSnap, uWaveSpeed, uFlowMode;
uniform float uCycle, uDeflect, uDeflectReach, uTravelMax, uWarp, uWarpBias;
uniform vec2 uDirA, uDirB;
uniform float uSpeedA, uSpeedB, uScaleA, uScaleB;
uniform float uParallax, uDepthScale, uDeepSlow, uWaveIn, uWaveOut, uPomLayers, uAlongScale;
uniform float uBrightness, uHue, uSat;
uniform float uHeightSpan;      // heightHi - heightLo, the physical height range the depth map spans
uniform float uPomDepthFloor;   // 1 = never shade above the POM ray's own depth (kills bright trench lips)
uniform float uBleed;           // tiles of water past uSize: 0 padded, 6 legacy
uniform float uReveal;          // 0..1 depth-masked intro (deep water first)

// Unified surface normal field
uniform float uSurfMode;        // 1 = unified N_surf, 0 = classic scalar grain (A/B)
uniform float uSurfStrength;    // overall normal/slope strength
uniform float uChopAmp;         // octave 0: capillary chop
uniform float uCrossAmp;        // octave 1: wind cross-sea
uniform float uSwellAmp;        // octave 2: exp-sine swell trains
uniform float uMacroAmp;        // octave 3: current-aligned lanes
uniform float uBandLimit;       // 0 = no zoom band-pass, 1 = full band-pass
uniform float uSwellDir;        // prevailing swell direction, degrees
uniform float uMacroAlign;      // 0 = isotropic lanes, 1 = fully flow-aligned slopes

// Painterly water surface primitives (uniform-driven, so A/B needs no recompile)
uniform float uSurfPattern;     // 0 = seascape, 1 = voronoi, 2 = ridged, 3 = simplex
uniform float uChoppy;          // crest sharpness vs calm glassy troughs
uniform float uPainterly;       // 0 = smooth physical BRDF, 1 = bold painted facets
// Per-layer wavelengths in map tiles (one unit of the pattern's wave-space)
uniform float uChopScale;       // octave 0 capillary chop
uniform float uCrossScale;      // octave 1 wind cross-sea
uniform float uSwellScale;      // octave 2 flow-advected swell
uniform float uMacroScale;      // octave 3 current-aligned macro lanes
uniform float uRidgeMix;        // pattern 4: 0 = soft simplex, 1 = crisp ridged crests
uniform float uMacroZoom;       // CSS zoom at which zoom-gated macro lanes fade out
uniform float uMacroZoomMode;   // 1 = macro lanes fade with zoom, 0 = always on
uniform float uPeakBias;        // shifts GGX specular glints onto raised crests
uniform float uSpecTilt;        // tilts the specular angle toward the sun

// Beer-Lambert underwater stack
uniform float uDepthGamma, uDepthContrast, uWaterClarity, uBedVis, uSoilLumLock;
uniform float uSoilDark, uSoilSat;   // live soil darkening / desaturation
uniform float uReliefFade, uDeepVeil, uVeilStart;  // deep-ocean relief + watercolor veil
uniform vec3 uAbsorbK;          // optical water absorption (kR > kG > kB)
uniform float uSoilMix, uIsPirate, uMurkGain;
uniform vec3 uMurkCol;          // suspended-silt colour
uniform float uMurkAbsorb, uMurkScatter, uMurkDepthFade;
uniform vec3 uCoastCol;
uniform float uCoastLevels, uCoastStrength;

// Day-night lighting
uniform float uDayNightOn;      // 0 = off (flat), 1 = active
uniform vec3 uSunDir, uLightCol, uAmbientCol;
uniform float uNightMix, uReliefStrength, uBiolumGain;
uniform float uKeyVis;          // 0..1 Option A sun/moon key handoff (0 at blue hour)
uniform float uShadowStrength;  // 0..1.5, blends the cast shadow into the key light
uniform float uShadowLen;       // max horizontal march distance, tiles
uniform float uShadowHeight;    // vertical scale of h in [0,1], tiles
uniform float uShadowSoft;      // penumbra sharpness, higher = crisper
uniform float uShadowMaxEl;     // curated cap on the shadow-casting elevation, degrees
uniform float uShadowStretch;   // artistic elongation of the cast shadow

// Sky matcap + GGX specular
uniform vec3 uSkyZenith, uSkyHorizon;
uniform float uSkyOn, uSkyGain, uFresnelF0, uFresnelPow;
uniform float uSkyOpacity, uSkyInt;  // post-threshold blend + per-keyframe HDR gain
uniform float uSkyNormal;       // sky-only normal softening (1 = surface normal)
uniform float uSkyCel;          // sky-only cel banding, decoupled from painterly
uniform float uSkyBlend;        // 0 = mix, 1 = screen, 2 = add, 3 = soft light
uniform float uSpecModel;       // 0 = GGX, 1 = classic radial disc (A/B)
uniform float uSpecGain, uRoughTight, uRoughBroad, uViewTilt, uSpecCut;
uniform float uSpecOpacity, uSpecInt;  // post-threshold blend + per-keyframe gain
uniform float uSpecBlend;       // 0 = add, 1 = screen, 2 = glow, 3 = colour dodge
uniform float uSpec, uSpecPow, uSpecSize, uSpecFloor, uSpecInvert, uSpecMode;
uniform vec3 uSpecTint;         // warm sun glint -> cool silver moon glint
uniform float uSpecDrift;       // how far the pool glides away from screen centre
uniform float uSpecStretch;     // sun-path elongation of the pool (1 = circular)
uniform float uSpecSpread;      // curated shimmer pool width, decoupled from view tilt
uniform float uSpecRadius;      // outer radius of the pool in half-screen-heights

// Fetch waves, shoal breakers, wave sets
uniform float uFetchWeight, uShoalGain, uWaveSet;

// Whale body: a baked 3D mesh posed and rasterised by the page into a live
// colour + height target, then sampled in the whale's local frame.
uniform vec4 uWhalePose;        // x, y, heading (rad), depth (tiles below water)
uniform vec4 uWhaleShape;       // half length, half width, surface fade, enabled
                                // (x/y keep the production ABI; the body's
                                // actual extents are uWhaleHalf)
uniform vec4 uWhaleWake;        // x, y, strength, radius: the ring left behind
uniform sampler2D uWhaleTex;     // body target: RGB colour, A height
uniform vec2 uWhaleHalf;         // body half extents in tiles (x, y)
uniform float uWhaleHeight;      // body height in tiles (A = 0..1 of this)

// ---- whale constants (exact production values, src/sea-glsl.js) -----------
const float WHALE_MAX_DEPTH = 14.0;
const float WHALE_SEABED_GAP = 1.0;
const float WHALE_SHORE_W = 3.5;
const float WHALE_WAKE_SHELF = 2.5;
const float WHALE_TINT = 0.4;
const float WHALE_TINT_FLOOR = 0.22;
const float WHALE_SHADOW_WASH = 0.45;
// v2's darker water needs a gentler body fog or a dive reads as a black hole.
const float WHALE_FOG_SCALE = 0.65;
// ---- map border (production) -----------------------------------------------
// Everything here is in map texels (one texel per tile), so the trim scales
// with zoom like the rest of the sea: the water bleeds uBleed past the
// rectangle (0 for a padded bake, whose ring is real water already; 6 for a
// legacy unpadded bake), then a 9-texel band: black, line, black, 3-texel
// zigzag, black, line, black. The band is a solid opaque-black backing, the
// zigzag's unpainted cells included; only past it does the page show through.
const float BORDER_BLACK_IN = 1.0;
const float BORDER_LINE1 = 1.0;
const float BORDER_BLACK1 = 1.0;
const float BORDER_ZIG = 3.0;
const float BORDER_BLACK2 = 1.0;
const float BORDER_LINE2 = 1.0;
const float BORDER_BLACK_OUT = 1.0;


vec3 hueRotate(vec3 c, float degrees) {
  float a = radians(degrees);
  float s = sin(a), k = cos(a);
  mat3 m = mat3(
    0.213 + k * 0.787 - s * 0.213, 0.213 - k * 0.213 + s * 0.143, 0.213 - k * 0.213 - s * 0.787,
    0.715 - k * 0.715 - s * 0.715, 0.715 + k * 0.285 + s * 0.140, 0.715 - k * 0.715 + s * 0.715,
    0.072 - k * 0.072 + s * 0.928, 0.072 - k * 0.072 - s * 0.283, 0.072 + k * 0.928 + s * 0.072
  );
  return max(m * c, vec3(0.0));
}

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
#if USE_NOISE_LUT
// One L1-cached hardware fetch each, instead of 4 hashes (vnoise) or the whole
// simplex kernel (snoise / snoiseD). Same lattice size and calibrated to the
// procedural height range and gradient RMS, so the A/B keeps the wave energy.
float vnoise(vec2 p) {
  return texture(uNoiseLut, p * (1.0 / 32.0)).a;
}
vec3 snoiseD(vec2 v) {
  vec4 t = texture(uNoiseLut, v * (1.0 / 32.0));
  return vec3(t.r * 2.0 - 1.0, (t.gb * 2.0 - 1.0) * NOISE_LUT_UNPACK_G);
}
float snoise(vec2 v) {
  return texture(uNoiseLut, v * (1.0 / 32.0)).r * 2.0 - 1.0;
}
#else
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i), b = hash(i + vec2(1, 0));
  float c = hash(i + vec2(0, 1)), d = hash(i + vec2(1, 1));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
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

// Exact value + analytic gradient of the same simplex kernel. dFdx/dFdy
// collapse inside texel-snapped cells and finite differences cost 3x the
// noise, while this costs ~12 multiply-adds on top of one snoise call.
// Returns vec3(height in ~[-1,1], dh/dx, dh/dy).
vec3 snoiseD(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec2 x1 = x0 - i1 + C.xx;
  vec2 x2 = x0 + C.zz;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                         + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m  = max(0.5 - vec3(dot(x0, x0), dot(x1, x1), dot(x2, x2)), 0.0);
  vec3 m2 = m * m;
  vec3 m3 = m2 * m;
  vec3 m4 = m2 * m2;
  vec3 x  = 2.0 * fract(p * C.www) - 1.0;
  vec3 h  = abs(x) - 0.5;
  vec3 a0 = x - floor(x + 0.5);
  vec3 norm = 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec2 g0 = vec2(a0.x, h.x) * norm.x;
  vec2 g1 = vec2(a0.y, h.y) * norm.y;
  vec2 g2 = vec2(a0.z, h.z) * norm.z;
  vec3 gv = vec3(dot(g0, x0), dot(g1, x1), dot(g2, x2));
  vec3 t  = -8.0 * m3 * gv;
  vec2 grad = m4.x * g0 + m4.y * g1 + m4.z * g2
            + t.x  * x0 + t.y  * x1 + t.z  * x2;
  return 130.0 * vec3(dot(m4, gv), grad);
}
#endif

float fbm(vec2 p) {
  return 0.58 * vnoise(p) + 0.30 * vnoise(p * 2.03 + 11.1) + 0.12 * vnoise(p * 4.01 + 23.7);
}

// ---- Painterly water surface primitives --------------------------------
// Every primitive returns vec3(signed height, dh/dq.x, dh/dq.y) where q is
// wave-space (one unit = one wavelength), evaluated only at texel-snapped q.
// The height is in ~[-1,1]; the analytic (or tight 2-tap) gradient is scaled
// toward a shared slope energy so one slope weight serves all four.
const mat2 ROT1 = mat2(0.8, 0.6, -0.6, 0.8);   // ~36.9 deg, irrational-ish twist

// TDM Seascape: wide, quiet concave troughs meeting at crisp diamond crests.
float seaOctaveH(vec2 uv, float choppy) {
  uv += snoise(uv * 0.55) * 0.85;
  vec2 wv  = 1.0 - abs(sin(uv));
  vec2 swv = abs(cos(uv));
  wv = mix(wv, swv, wv);
  return pow(1.0 - pow(max(wv.x * wv.y, 1e-5), 0.65), choppy);
}
vec3 seaOctaveD(vec2 q, float choppy) {
  // |sin| repeats every PI radians, so PI * q gives one wave per q-unit.
  const float e = 0.03;
  vec2 uv = q * 3.14159;
  float h  = seaOctaveH(uv, choppy);
  float hx = seaOctaveH(uv + vec2(e, 0.0), choppy);
  float hy = seaOctaveH(uv + vec2(0.0, e), choppy);
  // back into per-q units, tuned toward snoiseD's slope energy
  return vec3(h * 2.0 - 1.0, (vec2(hx - h, hy - h) / e) * (3.14159 * 3.0));
}

// Painterly cellular facets: wide concave bowls inside cells, crisp polygonal
// ridges along the cell seams. grad(F1) is exact and costs zero extra taps.
vec3 voronoiD(vec2 q, float choppy) {
  vec2 f = floor(q);
  vec2 r = q - f;
  float best = 9.0;
  vec2 v1 = vec2(0.0);
  float tt = uWaveTime * 0.65;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y));
      float rnd = hash(f + g);
      vec2 jit = 0.5 + 0.36 * vec2(
        sin(tt + 6.2831 * rnd),
        sin(tt + 6.2831 * fract(rnd * 7.137) + 1.7));
      vec2 v = g + jit - r;
      float dd = dot(v, v);
      if (dd < best) { best = dd; v1 = v; }
    }
  }
  float F1 = sqrt(best);
  float pwr = max(1.0, choppy * 0.65);
  float h = pow(clamp(F1, 0.0, 1.25), pwr);
  vec2 grad = pwr * pow(max(F1, 0.05), pwr - 1.0) * (-v1 / max(F1, 0.05));
  return vec3(h * 2.0 - 1.0, grad * 15.0);
}

// Sharp ridged brushstrokes: analytic chain rule on snoiseD, zero extra noise.
vec3 ridgedD(vec2 q, float choppy) {
  vec3 d = snoiseD(q);
  float r = 1.0 - abs(d.x);
  float pwr = max(1.0, choppy * 0.85);
  float h = pow(max(r, 1e-4), pwr);
  float sgn = d.x / sqrt(d.x * d.x + 0.015);   // smooth bevel at the apex
  vec2 grad = d.yz * (-sgn * pwr * pow(max(r, 1e-4), pwr - 1.0));
  return vec3(h * 2.0 - 1.0, grad);
}

// Continuous simplex <-> ridged blend on the SAME snoiseD sample: the ridged
// height and its analytic gradient are derived from d, so the hybrid costs
// zero extra noise evaluations.
vec3 hybridD(vec2 q, float choppy, float ridgeMix) {
  vec3 d = snoiseD(q);
  float r = 1.0 - abs(d.x);
  float pwr = max(1.0, choppy * 0.85);
  float rh = pow(max(r, 1e-4), pwr) * 2.0 - 1.0;
  float sgn = d.x / sqrt(d.x * d.x + 0.015);
  vec2 rg = d.yz * (-sgn * pwr * pow(max(r, 1e-4), pwr - 1.0));
  return vec3(mix(d.x, rh, ridgeMix), mix(d.yz, rg, ridgeMix));
}

vec3 surfPat(vec2 q, float choppy, int pat) {
  if (pat == 0) return seaOctaveD(q, choppy);
  if (pat == 1) return voronoiD(q, choppy);
  if (pat == 2) return ridgedD(q, choppy);
  if (pat == 4) return hybridD(q, choppy, uRidgeMix);
  return snoiseD(q);
}

// Octave 1 is twisted so seascape/voronoi interfere into organic diamond
// facets instead of an axis-aligned grid; the gradient follows the rotation.
vec3 surfPatRot(vec2 q, float choppy, int pat) {
  if (pat == 0 || pat == 1) {
    vec3 d = surfPat(ROT1 * q, choppy, pat);
    return vec3(d.x, transpose(ROT1) * d.yz);
  }
  return surfPat(q, choppy, pat);
}

// Continuous log2-zoom band-pass: a lambda-tile wave spans
// lambda * zoomCss CSS pixels per cycle, so fading on log2(px) hands every
// octave over smoothly per wheel notch with no Nyquist shimmer.
float bandW(float lambdaTiles, float zoomCss, float pxMin, float pxMax) {
  float logPx = log2(max(lambdaTiles * max(zoomCss, 0.02), 0.25));
  float lo = smoothstep(log2(pxMin), log2(pxMin * 2.4), logPx);
  float hi = pxMax > 9000.0 ? 1.0
           : 1.0 - smoothstep(log2(pxMax), log2(pxMax * 2.4), logPx);
  return lo * hi;
}

// Sharp-crested ocean swell with exact analytic slope (zero noise calls).
// phi is wobbled by the cross-sea height so crests break organically.
vec3 expWave(vec2 p, vec2 dir, float k, float speed, float time, float sharp, float wobble) {
  float phi = dot(p, dir) * k - time * speed + wobble;
  float e = exp(sharp * (sin(phi) - 1.0));     // [exp(-2*sharp), 1.0]
  float dphi = sharp * cos(phi) * e;
  return vec3(e * 2.0 - 1.0, dir * dphi);      // (signed height, normalized slope)
}

// Painterly quantisation: push mid-tones into flat paint dabs with soft
// bevels at low amt, tightening to a razor-crisp cel edge at amt = 1.
// amt = 0 returns x unchanged.
float paintStep(float x, float levels, float amt) {
  if (amt <= 0.001) return x;
  float s = x * levels;
  float i = floor(s);
  float f = fract(s);
  // Soft gouache bevel at low amt -> razor-crisp cel edge at amt = 1.0
  float edge = mix(0.24, 0.03, clamp(amt, 0.0, 1.0));
  float stepped = (i + smoothstep(0.5 - edge, 0.5 + edge, f)) / levels;
  return mix(x, stepped, amt);
}

float parCurve(float d) { return texture(uCurve, vec2(clamp(d, 0.0, 1.0), 0.5)).r; }
float sliceCurveAt(float t) { return texture(uSliceCurve, vec2(clamp(t, 0.0, 1.0), 0.5)).r; }
float warpCurveAt(float t) { return texture(uWarpCurve, vec2(clamp(t, 0.0, 1.0), 0.5)).r; }

vec2 parShift(vec2 w, float depth) {
#if HAS_PARALLAX
  float ds = uDepthScale > 0.0 ? uDepthScale : 1.0;
  float k = uParallax * parCurve(depth * ds) * (uZoomCss / 3.2);
  return (uTarget - w) * k;
#else
  return vec2(0.0);
#endif
}
vec2 parPos(vec2 p, float dep) {
#if HAS_PARALLAX
  vec2 w = p + parShift(p, dep);
  return mix(w, floor(w) + 0.5, uSnap);
#else
  return mix(p, floor(p) + 0.5, uSnap);
#endif
}

struct ShoreWaves { float crest, shore, edge, lap, shelf; };
ShoreWaves shoreWaves(vec2 p, vec2 flow, float travel, float ph1, float ph2, float w1, float w2,
                      float d, float w, float shelfW, float wetMul, float dir) {
  vec2 wet1 = p - flow * (travel * 0.30 * ph1);
  vec2 wet2 = p - flow * (travel * 0.30 * ph2);
  vec2 sh1 = p - flow * (travel * 0.40 * ph1);
  vec2 sh2 = p - flow * (travel * 0.40 * ph2);
  float lap2 = fbm(wet1 * 0.90 + 17.0) * w1 + fbm(wet2 * 0.90 + 17.0) * w2;
  float wob = (fbm(p * 0.14 + 31.0) - 0.5) * 2.2;
  float breakup = smoothstep(0.05, 0.60, fbm(p * 0.05 + 5.0));
  float phIn = (fbm(p * 0.045 + 7.0) - 0.5) * 6.2832;
  float phOut = (fbm(p * 0.055 + 23.0) - 0.5) * 6.2832;
  float wIn = sin((d + wob) * 1.05 + uWaveTime * uWaveSpeed * dir + phIn);
  float wOut = sin((d + wob * 1.3) * 0.74 - uWaveTime * uWaveSpeed * 0.63 * dir + phOut);
  float cIn = pow(max(wIn, 0.0), 3.0);
  float cOut = smoothstep(0.10, 0.90, wOut) * 0.55;
  float crest = (cIn * uWaveIn + cOut * uWaveOut) * breakup;
  float edge = (1.0 - smoothstep(0.0, 0.85, d)) * wetMul;
  float lap = 0.30 + 0.95 * smoothstep(0.34, 0.80, lap2);
  float shore = 1.0 - smoothstep(0.0, w, d);
  float shelfMask = 1.0 - smoothstep(0.0, shelfW, d);
  float shelfN = fbm(sh1 * 0.12 + 3.0) * w1 + fbm(sh2 * 0.12 + 3.0) * w2 - 0.5;
  return ShoreWaves(crest, shore, edge, lap, shelfN * (shelfMask * wetMul));
}

void main() {
  // The texel pass shades exactly one map texel per fragment (uTileOrigin +
  // gl_FragCoord), so a zoomed-in frame does the work once per map texel
  // instead of once per screen pixel. Everything downstream still sees the
  // real camera (uTarget/uZoom/uCenter), so the result is bit-identical to the
  // full-res screen render.
  vec2 world = uTexelPass > 0.5
    ? (uTileOrigin + floor(gl_FragCoord.xy) + 0.5)
    : (uTarget + (gl_FragCoord.xy - uCenter) / uZoom);
  vec2 p = uTexelPass > 0.5 ? world : mix(world, floor(world) + 0.5, uSnap);
  // fragP is the texel-snapped position in screen pixels: the same value the
  // full-res path computes, so the shadow lookup, the virtual perspective and
  // the classic disc all land exactly where they would without the FBO.
  vec2 fragP = (p - uTarget) * uZoom;

  float d = texture(uDist, p / uSize).r;
  d = d * d * uDistMax;
  vec4 aux0 = texture(uAux, p / uAuxSpan);
  float depth01 = aux0.r;
  float wet = step(0.0001, d);
  // Inner lakes are d == 0 yet carry a real height bake: water, but no ocean
  // distance. Their surface calms with size, so a pond stays glass still and a
  // big lake only gets a hint of ripple.
  float hSurf = texture(uHeight, p / uSize).r;
  float isWater = max(wet, step(0.0005, hSurf));
  float isLake = isWater * (1.0 - wet);
  float lakeWave = smoothstep(0.035, 0.13, hSurf * hSurf) * 0.30;
  float waveMask = mix(1.0, lakeWave, isLake) * isWater;

  // Flow + speed + fetch + murk
  vec4 fcoarse = texture(uFlow, p / (uFlowCell * uFlowSize));
  vec2 cdir = fcoarse.rg * 2.0 - 1.0;
  float cspd = fcoarse.b;
  vec2 flow;
  float fspeed;
  float fetchVal = 0.5;
  float murkVal = 0.0;
#if FLOW_LOD
  vec3 sfm = texture(uSpeedTex, p / (4.0 * uSpeedSize)).rgb;
  fetchVal = sfm.g;
  murkVal = sfm.b;
  if (uFlowMode > 0.5) {
    // LOD: project the gyre onto the baked along-coast tangent. The tangent is
    // a fixed rotational sense, so aiming the gyre at it forces a U-turn on the
    // opposing flank; projecting drops the into/out-of-land part instead.
    vec2 along = (aux0.gb * 2.0 - 1.0) * uAlongScale;
    float aLen = length(along);
    vec2 tHat = aLen > 1e-4 ? along / aLen : vec2(0.0);
    vec2 guided = tHat * dot(cdir, tHat);
    float near = uDeflect * exp(-d / max(1.0, uDeflectReach)) * clamp(aLen, 0.0, 1.0);
    vec2 bl = mix(cdir, guided, near);
    float bls = length(bl);
    flow = bls > 1e-4 ? bl / bls : (length(cdir) > 1e-4 ? normalize(cdir) : vec2(0.0));
    fspeed = sfm.r;
  } else {
    float m = length(cdir);
    flow = m > 1e-4 ? cdir / m : vec2(0.0);
    fspeed = cspd;
  }
#else
  float m = length(cdir);
  flow = m > 1e-4 ? cdir / m : vec2(0.0);
  fspeed = cspd;
#endif

  // Advection cycle driven by uFlowTime (zero creasing at 200%, zero jump)
  float ph1 = fract(uFlowTime / uCycle);
  float ph2 = fract(uFlowTime / uCycle + 0.5);
  float w1 = 1.0 - abs(2.0 * ph1 - 1.0);
  float w2 = 1.0 - w1;
  float cycleTravel = min(fspeed * uFlowSpeed * uCycle,
                          uTravelMax > 0.0 ? uTravelMax : 1e6);

  float deep = smoothstep(0.06, 0.75, d / uDistMax);
  float shallow = 1.0 - depth01;
  float slow = mix(uDeepSlow, 1.0, shallow);
  float travel = cycleTravel * slow;
  // A lake has no through-flow: let its ripples lap in place.
  travel *= mix(1.0, 0.25, isLake);
  // Surface noise is evaluated on the texel-snapped p: every primitive and
  // expWave carry a continuous derivative, so each map tile becomes one crisp
  // facet with a real slope and reflection, never a sub-pixel blur.
  vec2 s1 = p - flow * (travel * ph1);
  vec2 s2 = p - flow * (travel * ph2);
  vec2 scrollA = uDirA * (uFlowTime * uSpeedA);
  vec2 scrollB = uDirB * (uFlowTime * uSpeedB);
  float amp = inversesqrt(w1 * w1 + w2 * w2);

  // ---- 1. Unified multi-scale surface normal field ----
  float nA = 0.0, nB = 0.0, n = 0.0;
  float chopH = 0.0, crossH = 0.0, swellH = 0.0, macroH = 0.0, macroWt = 0.0;
  vec2 surfGrad = vec2(0.0);
  float surfH = 0.0;
  vec3 Nsurf = vec3(0.0, 0.0, 1.0);
  // Zoom-gated macro lanes: fade out for close-ups, fade in for overviews.
  float macroZoomGate = uMacroZoomMode > 0.5
    ? (1.0 - smoothstep(uMacroZoom * 0.55, uMacroZoom * 1.45, uZoomCss))
    : 1.0;
  if (uSurfMode > 0.5) {
    int pat = int(uSurfPattern + 0.5);
    // Octave 0 — capillary chop, two-phase flow-advected.
    float chopL = max(uChopScale, 1.0);
    float bw0 = mix(1.0, bandW(chopL, uZoomCss, 3.0, 12000.0), uBandLimit);
    float fullW = uChopAmp;
    float activeW = uChopAmp * bw0;
    vec3 d0 = (surfPat((s1 - scrollA) / chopL, uChoppy, pat) * w1
             + surfPat((s2 - scrollA) / chopL, uChoppy, pat) * w2) * amp;
    chopH = d0.x;
    surfGrad += d0.yz * (0.045 * uChopAmp * bw0);
    surfH += d0.x * 0.45 * uChopAmp * bw0;
#if HAS_SURF_OCT > 1
    // Octave 1 — wind cross-sea, bridge octave. Twisted per primitive.
    float crossL = max(uCrossScale, 1.0);
    float bw1 = mix(1.0, bandW(crossL, uZoomCss, 3.5, 12000.0), uBandLimit);
    fullW += uCrossAmp;
    activeW += uCrossAmp * bw1;
    vec3 d1 = (surfPatRot((s1 - scrollB) / crossL, uChoppy, pat) * w1
             + surfPatRot((s2 - scrollB) / crossL, uChoppy, pat) * w2) * amp;
    crossH = d1.x;
    surfGrad += d1.yz * (0.060 * uCrossAmp * bw1);
    surfH += d1.x * 0.55 * uCrossAmp * bw1;
#endif
#if HAS_SURF_OCT > 2
    // Octave 2 — directional exp-sine swell trains, both phases advected by
    // the same flow map as chop and cross-sea so the swell bends with them.
    float swellL = max(uSwellScale, 4.0);
    float bw2 = mix(1.0, bandW(swellL, uZoomCss, 4.0, 420.0), uBandLimit);
    fullW += uSwellAmp;
    activeW += uSwellAmp * bw2;
    float sa = radians(uSwellDir);
    vec2 sd = vec2(cos(sa), sin(sa));
    vec2 sd2 = normalize(vec2(-sd.y * 0.85 + sd.x * 0.35, sd.x * 0.85 + sd.y * 0.35));
    vec3 sw1 = (expWave(s1, sd, 6.2832 / swellL, 0.45, uWaveTime, 1.15, crossH * 1.6) * w1
              + expWave(s2, sd, 6.2832 / swellL, 0.45, uWaveTime, 1.15, crossH * 1.6) * w2) * amp;
    vec3 sw2 = (expWave(s1, sd2, 6.2832 / (swellL * 0.63), 0.30, uWaveTime * 1.08, 1.0, crossH * 1.2) * w1
              + expWave(s2, sd2, 6.2832 / (swellL * 0.63), 0.30, uWaveTime * 1.08, 1.0, crossH * 1.2) * w2) * amp;
    swellH = sw1.x * 0.6 + sw2.x * 0.4;
    surfGrad += (sw1.yz * 0.55 + sw2.yz * 0.35) * (0.15 * uSwellAmp * bw2);
    surfH += swellH * 0.9 * uSwellAmp * bw2;

    // Octave 3 — current-aligned macro lanes. Two-phase flow advection plus a
    // local 2-tap tangent average: the average is a short local step in noise
    // space, never a p*grad(dir) lever arm, so the lanes cannot spin around
    // the origin where the current curves.
    float macroL = max(uMacroScale, 1.0);
    // macroZoomGate owns the upper zoom handoff; bandW only drops lanes once
    // they shrink under a few pixels (no hidden 240px magic number).
    macroWt = uMacroAmp * macroZoomGate
            * mix(1.0, bandW(macroL, uZoomCss, 3.0, 12000.0), uBandLimit);
    fullW += uMacroAmp * macroZoomGate;
    activeW += macroWt;
    if (macroWt > 0.005) {
      float mCyc = max(uCycle, 1.0);
      float mph1 = ph1;
      float mph2 = ph2;
      float mw1 = w1;
      float mw2 = w2;
      float mTravel = min(max(fspeed, 0.30) * uFlowSpeed * mCyc, 220.0);
      vec2 ms1 = p - flow * (mTravel * mph1);
      vec2 ms2 = p - flow * (mTravel * mph2);
      vec2 flN = length(flow) > 1e-4 ? normalize(flow) : vec2(1.0, 0.0);
      vec2 flPerp = vec2(-flN.y, flN.x);
      float mAmp = inversesqrt(mw1 * mw1 + mw2 * mw2);
      vec2 nStep = flN * 0.28;
      // Same crisp liquid language as chop/cross-sea, just gentler: the macro
      // field must not turn back into soft clouds when zoomed out.
      float macroChoppy = mix(1.0, uChoppy, 0.4);
#if HAS_SURF_OCT > 3
      vec3 la = surfPat(ms1 / macroL + nStep, macroChoppy, pat)
              + surfPat(ms1 / macroL - nStep, macroChoppy, pat);
      vec3 lb = surfPat(ms2 / macroL + nStep, macroChoppy, pat)
              + surfPat(ms2 / macroL - nStep, macroChoppy, pat);
      vec3 lanes = (la * mw1 + lb * mw2) * (0.5 * mAmp);
#else
      vec3 la = surfPat(ms1 / macroL, macroChoppy, pat);
      vec3 lb = surfPat(ms2 / macroL, macroChoppy, pat);
      vec3 lanes = (la * mw1 + lb * mw2) * mAmp;
#endif
      // Cross-flow slope anisotropy orients reflective facets along the shear
      // lanes while keeping the field the same noise language as octaves 0-1.
      vec2 lg = lanes.yz;
      vec2 gAniso = flPerp * dot(lg, flPerp) * (1.0 + uMacroAlign)
                  + flN * dot(lg, flN) * (1.0 - 0.55 * uMacroAlign);
      macroH = lanes.x;
      surfGrad += gAniso * (0.12 * macroWt);
      surfH += lanes.x * 1.2 * macroWt;
    }
#endif
    // Energy-preserving zoom compensation: when fine octaves fade out at low
    // zoom, lift the surviving slope/height so reflections and crests stay alive.
    float zoomGain = clamp(sqrt(max(fullW, 0.01) / max(activeW, 0.12)), 1.0, 2.2);
    surfGrad *= zoomGain;
    surfH *= zoomGain;
    surfGrad *= waveMask;
    surfH *= waveMask;
    Nsurf = normalize(vec3(-surfGrad * (uSurfStrength * 0.55), 1.0));
    n = surfH * 0.9;
  } else {
    // Classic scalar grain path, kept for a clean A/B against the unified field.
    nA = snoise((s1 - scrollA) * uScaleA) * w1 + snoise((s2 - scrollA) * uScaleA) * w2;
#if NOISE_LAYERS > 1
    nB = snoise((s1 - scrollB) * uScaleB) * w1 + snoise((s2 - scrollB) * uScaleB) * w2;
    n = (nA + nB) * 0.5 * amp;
#else
    nB = 0.0;
    n = nA * amp;
#endif
    chopH = nA;
    crossH = nB;
    surfH = n;
    surfGrad = vec2(nA, nB) * 0.35;
    n *= waveMask;
    surfH *= waveMask;
    surfGrad *= waveMask;
    Nsurf = normalize(vec3(-surfGrad * uSurfStrength, 1.0));
  }
  // Positive on raised wave peaks/crests, negative in flat troughs: the
  // gate for peak-biased specular glints.
  float crestMask = smoothstep(-0.15, 0.55, surfH);
  float peakGate = mix(1.0, crestMask * crestMask, uPeakBias);

#if HAS_WARP
  float wdep = mix(1.0, warpCurveAt(depth01), uWarpBias);
  // Snell refraction bends the seabed perpendicular to wave crests. A mild
  // zoom compensation keeps macro slopes visibly refracting at overview zoom.
  float zoomRefr = mix(1.0, clamp(1.0 / sqrt(max(uZoomCss, 0.15)), 1.0, 2.6), 0.55);
  vec2 warp = uSurfMode > 0.5
    ? -Nsurf.xy * (uWarp * wdep * zoomRefr) / max(Nsurf.z, 0.35)
    : vec2(nA, nB) * (uWarp * wdep);
#else
  vec2 warp = vec2(0.0);
#endif
  vec2 base = p + warp;

  // ---- Parallax / POM -> hitPos ----
  float rayDep01 = depth01;
  float pomSlice = 0.0;
  float floorOn = 0.0;
  vec2 hitPos = parPos(base, depth01);
#if HAS_PARALLAX
  int N = int(uPomLayers + 0.5);
#if USE_POM_FAST
  // Dry land never has a seabed to march to, and a parallax shift that rounds
  // away is not worth 12 dependent uAux fetches: skip both.
  bool doPom = N > 1;
  if (doPom) {
    vec2 maxPar = parShift(base, 1.0);
    if (isWater < 0.5 || dot(maxPar, maxPar) < 0.25) doPom = false;
  }
#else
  bool doPom = N > 1;
#endif
  if (doPom) {
    floorOn = uPomDepthFloor;
    float hPrev = 1.0;
    bool hit = false;
    for (int i = 0; i < 12; i++) {
      if (i >= N) break;
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
        hitPos = parPos(base, 1.0 - b);
        rayDep01 = clamp(1.0 - b, 0.0, 1.0);
        pomSlice = float(i + 1) / float(N);
        hit = true;
        break;
      }
      hPrev = hRay;
    }
    if (!hit) {
      hitPos = parPos(base, 1.0);
      rayDep01 = 1.0;
      pomSlice = 1.0;
    }
  }
#endif

  // ---- Depth ramp shaping ----
  // rawDepth is physical (1 - h), the same units the height bake stores.
  float rayRawDepth = rayDep01 * (uHeightSpan > 0.0 ? uHeightSpan : 0.8394);
  float hs = texture(uHeight, hitPos / uSize).r;
  float sampledDepth = hs * hs;
  float rawDepth = mix(sampledDepth, max(sampledDepth, rayRawDepth), floorOn);
  float pomClip = max(0.0, rayRawDepth - sampledDepth);
  float dCurve = pow(clamp(rawDepth, 0.0, 1.0), uDepthGamma);
  float dShape = clamp(mix(dCurve, smoothstep(0.0, 1.0, dCurve),
                           clamp((uDepthContrast - 0.5) / 1.3, 0.0, 1.0)), 0.0, 1.0);
  vec3 palCol = texture(uPalette, vec2(dShape, 0.5)).rgb;
  vec3 pal0 = texture(uPalette, vec2(0.0, 0.5)).rgb;
  vec3 palDeep = texture(uPalette, vec2(1.0, 0.5)).rgb;

  // ---- Seabed albedo: passive reflectance, luminance-locked against glow ----
#if HAS_SOIL
  float soilW = uSoilMix * (1.0 - uIsPirate);
#else
  float soilW = 0.0;
#endif
  vec3 bedAlbedo = pal0;
  vec4 soil = vec4(0.0);
  vec3 soilTone = vec3(0.0);
  float sLum = 1.0;
#if HAS_SOIL
  if (soilW > 0.001) {
    soil = texture(uSoilTex, hitPos / uSize);
    // Live soil tone: desaturate about the soil's own luminance, then darken.
    // Applied BEFORE the luminance lock, so a dark soil stays dark.
    float sLum0 = max(dot(soil.rgb, vec3(0.2126, 0.7152, 0.0722)), 1e-3);
    soilTone = max(mix(vec3(sLum0), soil.rgb, uSoilSat), vec3(0.0)) * uSoilDark;
    sLum = max(dot(soilTone, vec3(0.2126, 0.7152, 0.0722)), 1e-3);
    float pLum = dot(pal0, vec3(0.2126, 0.7152, 0.0722));
    // Cap only ever caps DOWN: it can never lift darkened soil above 1.0.
    float cap = min(1.0, pLum / sLum);
    vec3 soilAlbedo = soilTone * mix(1.0, cap, uSoilLumLock);
    bedAlbedo = mix(pal0, soilAlbedo, soil.a * soilW * wet);
  }
#endif

  // ---- 3B: Day-night directional seabed lighting + cast terrain shadows ----
  vec3 bedLight = vec3(1.0);
  vec3 colLight = vec3(1.0);
  vec3 foamLight = vec3(1.0);
  float castShadow = 1.0;
  if (uDayNightOn > 0.5) {
    foamLight = mix(uAmbientCol + uLightCol * 0.55, vec3(1.0), 0.15);
    // The sun direction is shared by the shadow march and the relief lighting.
    vec3 L = normalize(uSunDir);
    // Curated 2.5D elevation and its matching seabed light vector. Relief and
    // cast shadows must agree on the same azimuth + compressed elevation for
    // the whole 24h cycle, so compute them once before both branches.
    vec2 sunXY = L.xy;
    float xyLen = length(sunXY);
    float rawEl = asin(clamp(L.z, 0.0, 1.0));
    float maxEl = radians(clamp(uShadowMaxEl, 5.0, 85.0));
    float shEl = min(maxEl, maxEl * (rawEl / max(rawEl + maxEl * 0.35, 1e-4)) * 1.35);
    vec3 Lbed = xyLen > 1e-3
      ? vec3((sunXY / xyLen) * cos(shEl), sin(shEl))
      : vec3(0.0, 0.0, 1.0);

    // Cast terrain shadows: march the height map toward the sun. The march
    // slope comes from the sun's elevation, so a low sunrise/sunset streaks
    // long shadows across the seabed and noon keeps them short and tight.
    // This lives outside HAS_LIGHTING on purpose: a tier can buy the shadow
    // mask without the normal-relief term, and vice versa.
#if HAS_SHADOWS
    float hSpan = uHeightSpan > 0.0 ? uHeightSpan : 0.8394;
    float shadowH = uShadowHeight * (hSpan / 0.8394);
    if (uShadowStrength > 0.001) {
#if USE_HALF_SHADOW
      // The half-res target was marched by FRAG_SHADOW_V2; here we only read
      // it. fragP is texel-snapped, so texel-res stays exactly 0-variance.
      vec2 shUv = clamp((fragP + uCenter) / max(uViewSize, vec2(1.0)), vec2(0.0), vec2(1.0));
      castShadow = texture(uShadowTex, shUv).r;
#else
      if (xyLen > 0.02) {
        vec2 rayDir = sunXY / xyLen;
        // Curated 2.5D shadow: shEl is the shared elevation cap computed
        // above, so the march and the relief lighting stay locked together.
        float raySlope = (tan(max(shEl, 0.035)) / max(uShadowStretch, 0.25)) / max(shadowH, 0.5);
        // Per-texel step jitter breaks the scalloped rings of long low-sun
        // shadows; floor(p) is one value per map texel, so texel-res is intact.
        float jitter = (hash(floor(p)) - 0.5) * (1.0 / float(SHADOW_STEPS));
        float h0 = 1.0 - texture(uAux, hitPos / uAuxSpan).r + 0.004;
        for (int k = 0; k < SHADOW_STEPS; k++) {
          float t = clamp((float(k) + 0.5) / float(SHADOW_STEPS) + jitter, 0.01, 1.0);
          float dist = 2.0 + uShadowLen * t * t;
          vec2 sp = hitPos + rayDir * dist;
          if (sp.x < 0.0 || sp.y < 0.0 || sp.x >= uAuxSpan.x || sp.y >= uAuxSpan.y) break;
          float auxDep = texture(uAux, sp / uAuxSpan).r;
          float hOcc = 1.0 - auxDep + 0.08 * (1.0 - smoothstep(0.0, 0.008, auxDep));
          float hRay = h0 + dist * raySlope;
          float pen = clamp((hOcc - hRay) * (uShadowSoft * shadowH / max(dist, 2.0)), 0.0, 1.0);
          float endFade = 1.0 - smoothstep(0.80, 1.0, t);
          castShadow = min(castShadow, 1.0 - pen * endFade);
        }
      }
#endif
    }
#endif

    float rawCast = uShadowStrength <= 1.0
      ? castShadow
      : pow(max(castShadow, 1e-4), uShadowStrength);
    // Attenuate cast shadow contrast gently with depth so shallow cliffs/shelves
    // stay crisp while deep abyssal basins soften naturally into the water column.
    float shadowDepthAtten = mix(1.0, exp(-rawDepth * max(uReliefFade, 0.45)), 0.70);
    float shAmt = clamp(uShadowStrength, 0.0, 1.0) * shadowDepthAtten;

#if HAS_LIGHTING
    vec2 nxy = texture(uNormal, hitPos / uSize).rg * 2.0 - 1.0;
    float nz = sqrt(max(0.01, 1.0 - dot(nxy, nxy)));
    vec3 N = normalize(vec3(nxy, nz));
    float ndotl = dot(N, Lbed);

    // Relief perturbs slopes around a flat-seabed baseline, so moving the
    // relief slider never changes flat open-ocean brightness.
    float baseLit = clamp(Lbed.z * 0.92 + 0.18, 0.0, 1.0);
    float depthFade = exp(-rawDepth * uReliefFade);
    float relief = clamp(uReliefStrength, 0.0, 1.5);
    float slopeTerm = clamp(baseLit + (ndotl - Lbed.z) * 2.6 * relief * depthFade, 0.0, 1.0);
    // Direct-key relief follows the Option A handoff: at blue hour (keyVis 0)
    // the bed settles onto flat ambient, then re-emerges with the next key.
    slopeTerm = mix(0.0, slopeTerm, clamp(uKeyVis, 0.0, 1.0));
    // Shadow is shadow: relief self-shadow and cast shadow converge on the
    // same ambient floor, with no second ambient crush and no double-darkening.
    float unified = min(slopeTerm, rawCast);
    float directVis = mix(slopeTerm, unified, shAmt);
    bedLight = mix(uAmbientCol, uLightCol, directVis);
    // Water column receives unshadowed sky/key light (not seabed cast shadows)
    // so deep water scatter and deepVeil sit visually OVER the shadowed seabed.
    float colLit = clamp(baseLit * 0.9 + 0.1, 0.0, 1.0) * clamp(uKeyVis, 0.0, 1.0);
    colLight = mix(uAmbientCol * 0.94, uLightCol, colLit);
#else
    vec3 flatLight = mix(uAmbientCol, uLightCol, 0.55);
    bedLight = mix(uAmbientCol, uLightCol, mix(0.55, min(0.55, rawCast), shAmt));
    colLight = flatLight;
#endif
  }

  // ---- 2. Beer-Lambert underwater colour stack ----
  // T(d) = exp(-opticalDepth * K_rgb); kR > kG > kB so red vanishes in the
  // shallows, green across the shelf and blue only in the deepest water.
  float dOpt = dCurve * uWaterClarity;
  vec3 T_water = exp(-dOpt * uAbsorbK);

  // Suspended murk: BOTH absorbs light reaching the seabed AND scatters
  // incident colLight, so it darkens in shadow and at night instead of glowing.
  float mDensity = 0.0;
  float murkAbsorb = 1.0;
#if HAS_MURK && FLOW_LOD
  if (uMurkGain > 0.001) {
    vec2 mPos1 = p - flow * (travel * 0.25 * ph1);
    vec2 mPos2 = p - flow * (travel * 0.25 * ph2);
    float mVal = texture(uSpeedTex, mPos1 / (4.0 * uSpeedSize)).b * w1
               + texture(uSpeedTex, mPos2 / (4.0 * uSpeedSize)).b * w2;
    mDensity = mVal * uMurkGain * exp(-dCurve * uMurkDepthFade) * wet;
  }
  murkAbsorb = exp(-mDensity * uMurkAbsorb);
#endif
  vec3 T_eff = T_water * murkAbsorb;

  // Authored depth palette: the exact old depth look, tinted by soil only
  // where the water lets it through. Never lifts toward pal0 — palCol already
  // carries the depth darkening, so bright shallow cyan cannot leak deep.
  vec3 palBase = palCol;
#if HAS_SOIL
  if (soilW > 0.001) {
    float pLum = dot(palCol, vec3(0.2126, 0.7152, 0.0722));
    float capPal = min(1.0, pLum / sLum);
    vec3 soilPal = soilTone * mix(1.0, capPal, uSoilLumLock);
    vec3 soilVis = clamp(T_eff * 1.35, 0.0, 1.0) * (soil.a * soilW * wet);
    palBase = mix(palCol, soilPal, soilVis);
  }
#endif
  palBase *= murkAbsorb;

  // Physical optical floor: the abyssal palette end, lifting to the real
  // seabed albedo only as far as the water lets light through.
  // Authored palette seabed (lit by bedLight, fading toward colLight with
  // water-column depth).
  vec3 palLit = palBase * mix(colLight, bedLight, clamp(T_water.b * 0.75 + 0.25, 0.0, 1.0));
  // Physical Beer-Lambert stack: deep water scatter sits OVER the shadowed seabed.
  vec3 beerLit = mix(palDeep * colLight, bedAlbedo * bedLight, T_eff);
  vec3 col = mix(palLit, beerLit, clamp(uBedVis, 0.0, 1.0));
  // Deep-water veil: dissolve deep seabed height/colour contrast into one
  // quiet, uniform watercolor wash (a constant base colour, so ridges and
  // trenches converge instead of tracking the terrain).
  // The veil sits OVER the seabed: lit by water-column colLight, never by the
  // seabed's cast shadows.
  if (uDeepVeil > 0.001) {
    float veilT = smoothstep(uVeilStart, 1.0, dCurve);
    vec3 veilCol = mix(texture(uPalette, vec2(0.72, 0.5)).rgb, palDeep, 0.6) * colLight;
    col = mix(col, veilCol, veilT * uDeepVeil);
  }
#if HAS_MURK
  if (mDensity > 0.001) {
    vec3 murkAlbedo = mix(uMurkCol, bedAlbedo, 0.35 * soilW);
    vec3 murkLit = murkAlbedo * colLight;
    float mScat = 1.0 - exp(-mDensity * uMurkScatter);
    col = mix(col, murkLit, clamp(mScat, 0.0, 0.75));
  }
#endif

  // Dry land sits under the map layer: keep it the top shallow height colour
  // (day-night tinted when active, pure pal0 in classic) with no seabed relief
  // or cast shadows. isWater (not wet) leaves inner lakes with their real
  // rendered seabed/water colour.
  vec3 landCol = pal0 * colLight;
  col = mix(landCol, col, isWater);

  // Live coast rim: lighten-only like editor n_coast, uCoastLevels tiles wide.
  float rimW = max(1.0, uCoastLevels);
  float rim = clamp(1.0 - d / rimW, 0.0, 1.0) * wet;
  col = max(col, mix(col, uCoastCol, uCoastStrength * rim));

  // User hue/saturation apply to the water column ONLY (before foam, reflection, glint, night, whale!)
  float cLum = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(vec3(cLum), col, uSat);
  col = hueRotate(col, uHue);

  // ---- 3C: Shore waves (GATED on d - skips 24 vnoise calls in open ocean!) ----
  float shore = 0.0;
  float shoreCrest = 0.0;
  float maxBand = max(uShoreW, uShelf) + 2.0;
  if (d < maxBand && wet > 0.5) {
    ShoreWaves coast = shoreWaves(p, flow, cycleTravel, ph1, ph2, w1, w2, d, uShoreW, uShelf, wet, 1.0);
    float fetchGain = mix(1.0, 0.45 + 0.95 * fetchVal, uFetchWeight);
    float waveEnv = fetchGain * uWaveSet;
    shore = coast.shore * wet;
    shoreCrest = coast.crest * shore * waveEnv;
    col += vec3(0.58, 0.80, 0.94) * foamLight * shoreCrest * uFoam;
    col += vec3(0.62, 0.84, 0.98) * foamLight * coast.edge * coast.lap * uFoam * 0.8 * waveEnv;
    col *= 1.0 + coast.shelf * uFoam * 1.1;
  }

  // ---- 3C: Contour-band offshore shoal breakers ----
  float shoalFoam = 0.0;
#if HAS_SHOAL_BREAKERS && FLOW_LOD
  if (uShoalGain > 0.001 && d > uShoreW * 0.45 && rawDepth < 0.14 && wet > 0.5) {
    float breakD = 0.015 + 0.055 * fetchVal;
    float band = exp(-pow((rawDepth - breakD) / 0.018, 2.0));
    float bNoise = smoothstep(0.15, 0.65, n) * smoothstep(0.35, 0.75, fbm(p * 0.08 + 19.0));
    shoalFoam = band * bNoise * smoothstep(0.25, 0.85, fetchVal) * uWaveSet * uShoalGain;
    col += vec3(0.64, 0.84, 0.96) * foamLight * shoalFoam * uFoam;
  }
#endif

  // ---- Surface grain: scalar modulation on top of the N_surf optics ----
  float onWater = wet * (1.0 - shore * 0.85) + isLake * lakeWave;
  float grainFade = mix(1.0, 0.62, macroWt);
  float grainN = fbm(p * 0.1 + 7.0) - 0.5;
  float dither = hash(floor(p)) - 0.5;
  // Grain belongs to the water column: apply it before the body/ring/wake so
  // a dry back is never stamped with the sea's surface grain.
  col *= 1.0 + (n * 1.2 + grainN * 0.16) * uGrain * 1.2 * grainFade * onWater * (1.0 - 0.45 * deep);
  col *= 1.0 + dither * uGrain * 0.25 * grainFade * onWater;

  // ---- Whale: real 3D body on its own water layer -------------------------
  // Everything here is evaluated from p (the texel-snapped map position): no
  // world or gl_FragCoord, so one map tile stays one crisp flat block.
  float whaleDry = 0.0;
  float whaleRingBio = 0.0;
  float whaleWakeBio = 0.0;
#if HAS_WHALE
  {
    // The sea under the *whale*, sampled once at its own position: the body's
    // cap, tint and fog must not change as it moves across the screen.
    float whaleSeabed01 = clamp(texture(uAux, uWhalePose.xy / uAuxSpan).r, 0.0, 1.0);
    float whaleD01Pre = clamp(min(uWhalePose.w,
      max(0.0, whaleSeabed01 * WHALE_MAX_DEPTH - WHALE_SEABED_GAP))
      / WHALE_MAX_DEPTH, 0.0, 1.0);
    // The body rides its own parallax layer: the sea draws a layer at depth k
    // by sampling p + (target - p) * k, so the body's layer positions it at
    // target + (w - target) / (1 - k). Exact mapping, no cap.
    float whaleK = uParallax * parCurve(whaleD01Pre) * (uZoomCss / 3.2);
    vec2 whaleAt = uWhalePose.xy
      + (uWhalePose.xy - uTarget) * (whaleK / max(1.0 - whaleK, 1e-3));
    vec2 whaleBox = abs(p - whaleAt);
    if (uWhaleShape.w > 0.5 && max(whaleBox.x, whaleBox.y) < 34.0) {
      float whaleDepth = uWhalePose.w;
      // Absolute pose depth, capped to the local seabed so a shallow bank
      // makes the whale surface instead of sinking through the ground.
      float whaleDepthEff = min(whaleDepth,
        max(0.0, whaleSeabed01 * WHALE_MAX_DEPTH - WHALE_SEABED_GAP));
      float whaleD01 = clamp(whaleDepthEff / WHALE_MAX_DEPTH, 0.0, 1.0);
      // A breach shows no warp; a deep body refracts with the surface waves.
      vec2 wq = p + clamp(warp * whaleD01, vec2(-3.0), vec2(3.0));

      // Local frame from the continuous pose: +X along the heading, +Y across.
      vec2 rel = wq - whaleAt;
      float hc = cos(uWhalePose.z), hs = sin(uWhalePose.z);
      vec2 wl = vec2(rel.x * hc + rel.y * hs, -rel.x * hs + rel.y * hc);

      // The body target is the page's rasterised 3D mesh: RGB = shaded body,
      // A = height above the body base (0 = empty).
      float halfLen = uWhaleHalf.x;
      float halfWid = uWhaleHalf.y;
      vec2 uvW = vec2(0.5) + 0.5 * wl / vec2(halfLen, halfWid);
      vec2 inRange = step(vec2(0.0), uvW) * step(uvW, vec2(1.0));
      vec4 wtex = texture(uWhaleTex, clamp(uvW, 0.0, 1.0));
      float bodyMask = step(0.5 / 255.0, wtex.a) * inRange.x * inRange.y;
      // Terrain occludes: a bank, shelf or coast shallower than the body's
      // depth hides it. Per pixel, while the body's own depth stays single.
      float groundHere = clamp(depth01, 0.0, 1.0) * WHALE_MAX_DEPTH;
      bodyMask *= step(whaleDepthEff, groundHere);
      float zTop = (wtex.a - 0.5) * uWhaleHeight - whaleDepthEff;
      vec3 bodyCol = wtex.rgb;

      // Signed distance to the body outline, for the ring only.
      float r2 = (wl.x * wl.x) / (halfLen * halfLen)
               + (wl.y * wl.y) / (halfWid * halfWid);
      float dWhale = (r2 - 1.0)
        / max(2.0 * length(vec2(wl.x / (halfLen * halfLen),
                                wl.y / (halfWid * halfWid))), 1e-4);

      // Underwater fog, tint floor and shadow wash, per texel like the rest
      // of the sea (the surface grain ran before the body).
      float submerged = max(0.0, -zTop);
      float fog = 1.0 - exp(-submerged * 0.22);
      float breach = smoothstep(0.0, 0.30, zTop);
      float under = clamp(-zTop / 0.6, 0.0, 1.0);
      fog = max(fog, WHALE_TINT_FLOOR * under);
      float bodyLum = dot(bodyCol, vec3(0.2126, 0.7152, 0.0722));
      float bodyShade = 1.0 - smoothstep(0.02, 0.30, bodyLum);
      fog = clamp(fog + WHALE_SHADOW_WASH * bodyShade * under, 0.0, 1.0);
      float gWhale = (1.0 + (n * 1.2 + grainN * 0.16) * uGrain * 1.2 * onWater
                            * (1.0 - 0.45 * deep))
                   * (1.0 + dither * uGrain * 0.25 * onWater);
      // Depth tint: the body keeps its own colour and is multiplied by the
      // map's depth ramp at its own depth, normalised neutral at the surface.
      float wFrac = clamp(whaleDepthEff / WHALE_MAX_DEPTH, 0.0, 1.0);
      vec3 ramp = texture(uPalette, vec2(wFrac, 0.5)).rgb
                / max(texture(uPalette, vec2(0.0, 0.5)).rgb, vec3(1e-3));
      bodyCol *= mix(vec3(1.0), ramp, WHALE_TINT);

      // Day-night body lighting: the same key/ambient mix as the seabed, so
      // the whale is lit by the current sun or moon instead of glowing.
      vec3 wSunL = normalize(uSunDir);
      vec3 whaleBodyLight = uDayNightOn > 0.5
        ? mix(uAmbientCol * 0.85, uLightCol,
              clamp(wSunL.z * 0.85 + 0.25, 0.0, 1.0))
        : vec3(1.0);
      bodyCol *= whaleBodyLight;

      // Beer-Lambert underwater attenuation: red is eaten first, then green.
      // Multiplying by the transmission normalised to its blue channel keeps
      // the body's blue shape cue.
      vec3 wT = exp(-(submerged / WHALE_MAX_DEPTH) * uWaterClarity * uAbsorbK);
      vec3 wTint = wT / max(wT.b, 1e-3);
      bodyCol *= mix(vec3(1.0), wTint, under);
      // The fog last: the lit/tinted body dissolves toward the water colour
      // instead of being darkened twice and reading as a hole in the sea. v2's
      // darker water needs a gentler blend at dive depths or the body vanishes
      // entirely; the deep-veil stack still takes over as it sinks further.
      bodyCol = mix(bodyCol, col, fog * WHALE_FOG_SCALE);

      bodyCol = mix(bodyCol * gWhale, bodyCol, breach);
      // The waterline itself: a thin wet band where the top crosses Z=0.
      float wetBand = (1.0 - smoothstep(0.0, 0.75, abs(zTop))) * uWhaleShape.z;
      bodyCol = mix(bodyCol, vec3(0.62, 0.84, 0.98) * foamLight,
                    wetBand * 0.55 * uFoam);
      col = mix(col, bodyCol, bodyMask);
      // Dry back: sky reflection and glitter must never paint over a breach.
      whaleDry = bodyMask * breach;

      // ---- surface ring ----
      // The coast model with a shorter 3.5-tile shore width and its own shelf,
      // so about one crest line shows across the band. dir = -1 radiates the
      // crests outward from the body instead of in toward a coast.
      float ringR = max(dWhale, 0.0);
      float whaleShelfW = WHALE_SHORE_W * (uShelf / max(uShoreW, 1e-3));
      ShoreWaves ringWaves = shoreWaves(
        p, flow, cycleTravel, ph1, ph2, w1, w2,
        ringR, WHALE_SHORE_W, whaleShelfW, 1.0, -1.0);
      float ringOn = 1.0 - bodyMask;
      float ringSurf = uWhaleShape.z;
      col += vec3(0.58, 0.80, 0.94) * foamLight * ringWaves.crest
           * ringWaves.shore * ringOn * ringSurf * uFoam;
      col += vec3(0.62, 0.84, 0.98) * foamLight * ringWaves.edge
           * ringWaves.lap * ringOn * ringSurf * uFoam * 0.8;
      col *= 1.0 + ringWaves.shelf * ringOn * ringSurf * uFoam * 1.1;
      whaleRingBio = (ringWaves.crest * ringWaves.shore
                    + ringWaves.edge * ringWaves.lap * 0.8)
                   * ringOn * ringSurf;
    }

    // ---- trailing wake ----
    // The body's ring exists only while it is near the surface, so the wake is
    // the circle it leaves behind: frozen at the last surface point, spreading
    // outward and fading. It hands over to the body's own ring as the whale
    // rises (1 - surfFade), never doubling it.
    float wakeOn = uWhaleWake.z * (1.0 - uWhaleShape.z);
    if (uWhaleShape.w > 0.5 && wakeOn > 0.002) {
      float wDist = length(p - uWhaleWake.xy);
      if (wDist < uWhaleWake.w + WHALE_WAKE_SHELF + 4.0) {
        ShoreWaves wake = shoreWaves(
          p, flow, cycleTravel, ph1, ph2, w1, w2,
          wDist - uWhaleWake.w, WHALE_SHORE_W, WHALE_WAKE_SHELF, 1.0, -1.0);
        col += vec3(0.58, 0.80, 0.94) * foamLight * wake.crest
             * wake.shore * wakeOn * uFoam * 0.75;
        col += vec3(0.62, 0.84, 0.98) * foamLight * wake.edge
             * wake.lap * wakeOn * uFoam * 0.5;
        col *= 1.0 + wake.shelf * wakeOn * uFoam * 0.7;
        whaleWakeBio = (wake.crest * wake.shore * 0.75
                      + wake.edge * wake.lap * 0.5) * wakeOn;
      }
    }
  }
#endif

  // ---- 3. Virtual-perspective sky matcap reflection + Schlick Fresnel ----
  // fragP follows the texel-snapped p, so a whole map tile shares one view
  // direction, one Fresnel term and one reflection — crisp pixel-art facets.
  vec2 screenOff = fragP / max(uCenter.y, 1.0);
  vec3 V = normalize(vec3(-screenOff * uViewTilt, 1.0));
  // Sky reflection gets its own softened normal: the surface normal stays
  // crisp for GGX specular, so silky sky and sharp glints are independent.
  vec3 Nsky = normalize(vec3(Nsurf.xy * max(uSkyNormal, 0.0), Nsurf.z));
  float ndotvSky = clamp(dot(Nsky, V), 0.0, 1.0);
  vec3 R = reflect(-V, Nsky);
  float rz = max(R.z, 0.0);
  vec3 skyCol;
#if HAS_SKY_MATCAP
  vec2 skyUv = (R.xy / (1.0 + rz)) * 0.5 + 0.5;
  skyCol = texture(uSkyMatcap, skyUv).rgb;
#else
  skyCol = mix(uSkyHorizon, uSkyZenith, clamp(rz, 0.0, 1.0));
#endif
  skyCol *= max(uSkyInt, 0.0);
  // A matcap sample is hemisphere radiance, so the Fresnel term is used
  // straight: no hidden gain, the slider owns the taste. Fsky acts purely on
  // the water surface: there is no depth bias, so F0 can never terrace the
  // reflection into depth contours.
  float Fsky = clamp(uFresnelF0 + (1.0 - uFresnelF0) * pow(1.0 - ndotvSky, uFresnelPow), 0.0, 1.0);
  // Surface reflection is never occluded by underwater seabed cast shadows.
  float reflMix = clamp(Fsky * uSkyGain * isWater, 0.0, 1.0);
  // The dry back of a breaching whale keeps its own body colour: the water's
  // sky mirror paints over submerged body and open water, never over it.
  reflMix *= (1.0 - whaleDry);
  reflMix = clamp(reflMix, 0.0, 1.0);
  // Sky cel is independent of painterly: smooth silky reflections can live
  // right beside crisp painted glints (raise it for banded sky strokes).
  if (uSkyCel > 0.001) {
    float skyBands = mix(5.0, 3.0, uSkyCel);
    reflMix = paintStep(reflMix, skyBands, uSkyCel);
  }
  if (uSkyOn < 0.5) reflMix = 0.0;
  // Post-threshold opacity: the crisp cel/Fresnel shape is already chosen, so
  // this only fades the final blend without eroding its edges.
  reflMix *= clamp(uSkyOpacity, 0.0, 1.0);
  vec3 skyTerm = skyCol * reflMix;
  int sb = int(uSkyBlend + 0.5);
  if (sb == 1) {
    // screen: builds soft luminosity without darkening water
    col = 1.0 - (1.0 - clamp(col, 0.0, 1.0)) * (1.0 - clamp(skyTerm, 0.0, 1.0));
  } else if (sb == 2) {
    // add: pure light-on-light luminosity buildup
    col = col + skyTerm;
  } else if (sb == 3) {
    // soft light (Pegtop): contrast-preserving sky sheen
    vec3 c0 = clamp(col, 0.0, 1.0);
    vec3 s0 = clamp(skyCol, 0.0, 1.0);
    vec3 soft = (1.0 - 2.0 * s0) * c0 * c0 + 2.0 * s0 * c0;
    col = mix(col, soft, reflMix);
  } else {
    // mix: classic Fresnel mirror replacement
    col = mix(col, skyCol, reflMix);
  }

  // ---- 4. Directional dual-lobe GGX sun/moon glitter ----
  float specAmt = 0.0;
  vec3 specAdd = vec3(0.0);
  // A still pond would mirror a flat normal into one solid white sun blob;
  // gate glitter up with the lake's own ripple strength instead.
  float specWater = isWater * mix(1.0, smoothstep(0.02, 0.20, lakeWave), isLake);
#if HAS_GGX > 0
  vec3 L = normalize(uSunDir);
  // ---- Screen-anchored drifting specular pool -----------------------------
  // The pool centre glides away from screen centre along the sun/moon compass
  // as the key light drops toward the horizon, then the offset is stretched
  // along that same axis into a classic sun-path streak.
  vec2 sunXY = length(L.xy) > 1e-3 ? normalize(L.xy) : vec2(0.0, 1.0);
  float lowSun = 1.0 - clamp(L.z, 0.0, 1.0);
  vec2 specAnchor = sunXY * (uSpecDrift * mix(0.20, 1.0, lowSun));
  vec2 relSpec = screenOff - specAnchor;
  vec2 specPerp = vec2(-sunXY.y, sunXY.x);
  float along = dot(relSpec, sunXY) / max(uSpecStretch, 1.0);
  float perp = dot(relSpec, specPerp);
  vec2 relShaped = sunXY * along + specPerp * perp;
  // Elliptical pool envelope from the PoC: stretch along the sun path but keep
  // the covered area in check, so the curated pool stays a pool instead of a
  // field of stray facets across the whole screen.
  float poolR = length(vec2(along, perp)) * sqrt(max(uSpecStretch, 1.0));
  float poolRad = max(uSpecRadius, 0.05);
  float poolMask = smoothstep(poolRad, poolRad * 0.10, poolR);
  // Curated view and half vector centred on the anchor: at the anchor and
  // specTilt 0 this is exactly H = (0,0,1), so the glitter peaks dead-on.
  vec3 Vspec = normalize(vec3(-relShaped * uSpecSpread, 1.0));
  vec3 Lspec = normalize(vec3(sunXY * (uSpecTilt * 0.85),
                              max(1.0 - 0.45 * uSpecTilt, 0.25)));
  vec3 H = normalize(Lspec + Vspec);
  float ndoth = clamp(dot(Nsurf, H), 0.0, 1.0);
  float ndotl = clamp(dot(Nsurf, L), 0.0, 1.0);
  float a1 = clamp(uRoughTight, 0.04, 0.65);
  float a2 = clamp(uRoughBroad, 0.18, 0.90);
  float d1 = ndoth * ndoth * (a1 * a1 - 1.0) + 1.0;
  float ggxTight = (a1 * a1) / max(3.14159 * d1 * d1, 1e-4);
#if HAS_GGX > 1
  float d2 = ndoth * ndoth * (a2 * a2 - 1.0) + 1.0;
  float ggxBroad = (a2 * a2) / max(3.14159 * d2 * d2, 1e-4);
  float specRaw = (ggxTight * 0.012 + ggxBroad * 0.09) * smoothstep(0.0, 0.15, ndotl);
#else
  float specRaw = ggxTight * 0.55 * smoothstep(0.0, 0.15, ndotl);
#endif
  // Crest height gate: highlights on raised wave peaks, not flat troughs.
  specRaw *= peakGate * poolMask;
  // Surface sun/moon glitter is never occluded by underwater seabed shadows.
  // The Option A handoff owns the glitter: 0 at 19:45 / 05:15, so the warm
  // sun glint and the silver moon glint switch with no visible pop.
  float effSpecGain = uSpecGain * max(uSpecInt, 0.0);
  specAmt = specRaw * effSpecGain * specWater * clamp(uKeyVis, 0.0, 1.0);
  // Water glitter belongs to water, not to the dry back above it.
  specAmt *= (1.0 - whaleDry);
  if (uPainterly > 0.001) {
    // Crop the dim halo and quantise the survivor into two crisp cel tiers:
    // a bright main stroke plus the hot peak core.
    float cut = 0.04 + uSpecCut * 0.45;
    float wEdge = mix(0.22, 0.025, uPainterly);
    float band1 = smoothstep(cut - wEdge, cut + wEdge, specAmt);
    float band2 = smoothstep(cut * 2.1 - wEdge, cut * 2.1 + wEdge, specAmt);
    float celSpec = band1 * 0.42 + band2 * 0.58;
    // Keep the gain slider meaningful for the cel look too.
    float celScale = clamp(0.45 + 0.55 * min(effSpecGain, 3.0), 0.0, 2.8) * step(0.001, effSpecGain);
    specAmt = mix(specAmt, celSpec * celScale, uPainterly);
  }
  vec3 glintTint = uDayNightOn > 0.5
    ? mix(vec3(1.0), uSpecTint, 0.76)
    : vec3(0.74, 0.87, 1.0);
  specAdd = glintTint * (specAmt / (1.0 + specAmt * 0.35)) * 0.65 * clamp(uSpecOpacity, 0.0, 1.0);
#endif

  // Classic static radial disc, kept for direct A/B against the GGX lobes.
  float pxPerCssS = max(uZoom / max(uZoomCss, 1e-4), 1e-4);
  float halfH = uCenter.y / pxPerCssS;
  float rad = max(uSpecSize, 0.02) * halfH;
  float rr = length(fragP) / pxPerCssS / max(rad, 1.0);
  float disc = 1.0 - smoothstep(0.0, 1.0, rr);
  float specMask = mix(disc, 1.0 - disc, clamp(uSpecInvert, 0.0, 1.0));
  float crest = smoothstep(0.10, 0.70, n);
  float specShape = mix(pow(max(crest, 0.0), max(uSpecPow, 1.0)), crest, 0.35);
  float sDisc = uSpec * specShape * specMask * specWater * (1.0 - whaleDry)
              * clamp(uSpecOpacity, 0.0, 1.0) * max(uSpecInt, 0.0);
  vec3 glintTintDisc = uDayNightOn > 0.5 ? mix(uLightCol, vec3(0.78, 0.88, 1.0), uNightMix * 0.5)
                                        : vec3(0.74, 0.87, 1.0);
  if (uSpecModel > 0.5) {
    int specMode = int(uSpecMode + 0.5);
    if (specMode == 1) {
      // screen: lifts the dark water, leaves what is already bright alone
      col = 1.0 - (1.0 - col) * (1.0 - glintTintDisc * sDisc);
    } else if (specMode == 2) {
      // water-coloured: glints pick up the hue under them; a floor takes over
      // as the pixel darkens, which is where the glints read best
      float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
      float dark = 1.0 - smoothstep(0.0, 0.22, lum);
      col += sDisc * (col * 2.0 + glintTintDisc * (0.12 + uSpecFloor * dark));
    } else if (specMode == 3) {
      vec3 warmTint = vec3(1.0, 0.92, 0.78) * mix(vec3(1.0), glintTintDisc,
                                                  uDayNightOn > 0.5 ? 0.75 : 0.0);
      col = 1.0 - (1.0 - col) * (1.0 - warmTint * sDisc);
    } else {
      col += glintTintDisc * sDisc;
    }
  } else {
    int spb = int(uSpecBlend + 0.5);
    if (spb == 1) {
      // screen: luminous buildup without chalky white clipping
      col = 1.0 - (1.0 - clamp(col, 0.0, 1.0)) * (1.0 - clamp(specAdd, 0.0, 1.0));
    } else if (spb == 2) {
      // glow (water-lit): builds luminosity through the water's own hue
      col += specAdd * (0.42 + clamp(col, 0.0, 1.0) * 1.85);
    } else if (spb == 3) {
      // colour dodge: vibrant sunlit highlight buildup
      vec3 c0 = clamp(col, 0.0, 1.0);
      vec3 dodged = min(vec3(1.0), c0 / max(vec3(0.08), 1.0 - clamp(specAdd * 0.85, 0.0, 0.92)));
      float spW = clamp(max(specAdd.r, max(specAdd.g, specAdd.b)), 0.0, 1.0);
      col = mix(col, dodged, spW) + specAdd * 0.20;
    } else {
      // add: pure additive sun/moon sparkle
      col += specAdd;
    }
  }

  // ---- 3B: Rare night bioluminescence (whale wake hero + sparse surf pockets) ----
#if HAS_BIOLUM
  if (uDayNightOn > 0.5 && uNightMix > 0.01 && uBiolumGain > 0.001) {
    float pocket = smoothstep(0.60, 0.84, fbm(p * 0.018 + vec2(3.1, 7.7)));
    float sparkle = 0.6 + 0.4 * smoothstep(0.3, 0.8, fbm(p * 0.35 + uTime * 0.8));
    vec3 bioCol = vec3(0.48, 0.90, 1.0);
    float surfBio = (shoreCrest + shoalFoam * 1.3) * pocket * 0.75;
    // The breaching whale's own ring is the centerpiece, not a pocket: it is
    // not gated by the sparse surf noise.
    float whaleBio = whaleRingBio * 1.6;
    float wakeBio = whaleWakeBio * 1.8;   // uWhaleWake ring + demo click wakes
    col += bioCol * (surfBio + whaleBio + wakeBio) * sparkle * uNightMix * uBiolumGain;
  }
#endif

  col *= uBrightness;


  // ---- intro: depth-ordered reveal + loading grain (production) -----------
  // The sea content is clipped in by depth: quantise to the depth texel's
  // 8-bit code, then a hard step, so the reveal is a contour rather than a
  // soft blend - deep water first, the shore last. The trim below is not
  // clipped.
  float seaA = 1.0;
  float dq = floor(depth01 * 255.0 + 0.5) / 255.0;
  float thr = 1.25 - 1.55 * uReveal;
  seaA = step(thr, dq);
  // Until the reveal reaches a pixel, the sea is the same dark pixel grain the
  // pre-texture placeholder drew: 8 CSS px cells re-randomised at ~9 fps in
  // screen space, so it lines up with the placeholder.
  if (uReveal < 1.0) {
    float pxPerCss = max(uZoom / max(uZoomCss, 1e-4), 1e-4);
    vec2 cell = floor((gl_FragCoord.xy - uCenter) / (8.0 * pxPerCss));
    float tick = floor(uTime * 9.0);
    float g = hash(cell + vec2(tick * 17.3, tick * 31.7));
    col = seaA >= 0.5 ? col : vec3((1.0 + floor(g * 10.0)) / 255.0);
    seaA = 1.0;
  }

  // ---- map border ----------------------------------------------------------
  vec2 overTiles = max(vec2(0.0), max(-p, p - uSize));  // tiles out, >= 0
  float maxOver = max(overTiles.x, overTiles.y);
  // The maxOver guard keeps interior water out of the band: with uBleed = 0 a
  // padded bake's band starts at the first texel outside, and an unguarded
  // 0.0 >= 0.0 would paint the whole sea black.
  if (maxOver > 0.0) {
    float outT = floor(maxOver);           // 0-based texel index outside
    if (outT >= uBleed) {
      float b0 = uBleed;                   // black band starts here
      float b1 = b0 + BORDER_BLACK_IN;     // inner white line
      float b2 = b1 + BORDER_LINE1;        // black
      float b3 = b2 + BORDER_BLACK1;       // 3-texel zigzag
      float b4 = b3 + BORDER_ZIG;          // black
      float b5 = b4 + BORDER_BLACK2;       // outer white line
      float b6 = b5 + BORDER_LINE2;        // black
      float b7 = b6 + BORDER_BLACK_OUT;    // end of the band
      // every cell in the band is opaque; only past b7 is the page visible
      seaA = outT < b7 ? 1.0 : 0.0;
      col = vec3(0.0);                     // black backing
      if (outT >= b1 && outT < b2) {       // inner white line
        col = vec3(1.0);
      } else if (outT >= b3 && outT < b4) { // 3-texel zigzag
        float along = floor(overTiles.x >= overTiles.y ? p.y : p.x);
        float across = outT - b3;          // 0..2 within the sub-band
        float k = mod(along, 4.0);
        float zigCol = k < 0.5 ? 0.0 : (k < 1.5 ? 1.0 : (k < 2.5 ? 2.0 : 1.0));
        if (abs(across - zigCol) < 0.5) {
          col = vec3(1.0);
        }
      } else if (outT >= b5 && outT < b6) { // outer white line
        col = vec3(1.0);
      }
    }
  }

  outColor = vec4(col, seaA);
}`;

const FRAG_SHADOW = `#version 300 es
#ifndef SHADOW_STEPS
#define SHADOW_STEPS 14
#endif
precision highp float;
precision highp sampler2D;
out vec4 outColor;

uniform sampler2D uAux, uCurve;
uniform vec2 uTarget, uAuxSpan, uCenter, uShadowScale;
uniform float uZoom, uZoomCss, uSnap, uParallax, uDepthScale, uHeightSpan;
uniform vec3 uSunDir;
uniform float uShadowStrength, uShadowLen, uShadowHeight, uShadowSoft;
uniform float uShadowMaxEl, uShadowStretch;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float parCurve(float d) { return texture(uCurve, vec2(clamp(d, 0.0, 1.0), 0.5)).r; }
vec2 parShift(vec2 w, float depth) {
  float ds = uDepthScale > 0.0 ? uDepthScale : 1.0;
  float k = uParallax * parCurve(depth * ds) * (uZoomCss / 3.2);
  return (uTarget - w) * k;
}
vec2 parPos(vec2 p, float dep) {
  vec2 w = p + parShift(p, dep);
  return mix(w, floor(w) + 0.5, uSnap);
}

void main() {
  // Map this half-res fragment onto the exact full-res screen coordinate it
  // stands for, then reconstruct the same texel-snapped p the sea pass uses.
  vec2 world = uTarget + (gl_FragCoord.xy * uShadowScale - uCenter) / uZoom;
  vec2 p = mix(world, floor(world) + 0.5, uSnap);
  float depth01 = clamp(texture(uAux, p / uAuxSpan).r, 0.0, 1.0);
  // Soft shadows do not need the POM march: the surface hit is enough, and it
  // keeps this pass to one uAux fetch plus the SHADOW_STEPS march.
  vec2 hitPos = parPos(p, depth01);

  float castShadow = 1.0;
  vec3 L = normalize(uSunDir);
  float hSpan = uHeightSpan > 0.0 ? uHeightSpan : 0.8394;
  float shadowH = uShadowHeight * (hSpan / 0.8394);
  vec2 sunXY = L.xy;
  float xyLen = length(sunXY);
  if (uShadowStrength > 0.001 && xyLen > 0.02) {
    vec2 rayDir = sunXY / xyLen;
    // Same curated elevation compression + stretch as the inline path, so the
    // half-res mask and the crisp pass agree on the shadow shape.
    float rawEl = asin(clamp(L.z, 0.0, 1.0));
    float maxEl = radians(clamp(uShadowMaxEl, 5.0, 85.0));
    float shEl = maxEl * (rawEl / max(rawEl + maxEl * 0.35, 1e-4)) * 1.35;
    shEl = min(shEl, maxEl);
    float raySlope = (tan(max(shEl, 0.035)) / max(uShadowStretch, 0.25)) / max(shadowH, 0.5);
    float jitter = (hash(floor(p)) - 0.5) / float(SHADOW_STEPS);
    float h0 = 1.0 - texture(uAux, hitPos / uAuxSpan).r + 0.004;
    for (int k = 0; k < SHADOW_STEPS; k++) {
      float t = clamp((float(k) + 0.5) / float(SHADOW_STEPS) + jitter, 0.01, 1.0);
      float dist = 2.0 + uShadowLen * t * t;
      vec2 sp = hitPos + rayDir * dist;
      if (sp.x < 0.0 || sp.y < 0.0 || sp.x >= uAuxSpan.x || sp.y >= uAuxSpan.y) break;
      float auxDep = texture(uAux, sp / uAuxSpan).r;
      float hOcc = 1.0 - auxDep + 0.08 * (1.0 - smoothstep(0.0, 0.008, auxDep));
      float hRay = h0 + dist * raySlope;
      float pen = clamp((hOcc - hRay) * (uShadowSoft * shadowH / max(dist, 2.0)), 0.0, 1.0);
      float endFade = 1.0 - smoothstep(0.80, 1.0, t);
      castShadow = min(castShadow, 1.0 - pen * endFade);
    }
  }
  outColor = vec4(castShadow, 0.0, 0.0, 1.0);
}`;

const FRAG_BLIT = `#version 300 es
precision highp float;
precision highp sampler2D;
out vec4 outColor;
uniform sampler2D uTexelFbo;
uniform vec2 uTarget, uCenter, uTileOrigin, uTileSpan;
uniform float uZoom;
void main() {
  vec2 world = uTarget + (gl_FragCoord.xy - uCenter) / uZoom;
  vec2 uv = (floor(world) + 0.5 - uTileOrigin) / uTileSpan;
  outColor = texture(uTexelFbo, uv);
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


const SEA_UI_RES_LABELS = { 1: '100%', 0.75: '75%', 0.5: '50%' };



const SEA_UI_TIME_LABELS = {
  auto: 'auto', day: 'day', night: 'night', custom: 'custom', off: 'off',
};



function formatHour24(hours) {
  const h = Number(hours);
  const total = Math.round((Number.isFinite(h) ? h : 0) * 60);
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}





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
    '#zz-sea-menu input[type="range"]:disabled { opacity: .35; cursor: default; }',
    '#zz-sea-menu select {',
    '  appearance: none; -webkit-appearance: none;',
    '  width: 100%; box-sizing: border-box; margin: 0;',
    '  border: 2px solid #3a4a55; background: #121a21; color: inherit;',
    '  font: inherit; font-family: inherit; padding: 3px 6px;',
    '  border-radius: 0; cursor: pointer;',
    '}',
    '#zz-sea-menu select:disabled { opacity: .35; cursor: default; }',
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
    '#zz-sea-menu #zz-sea-github:hover { opacity: 1; }',
  ].join('\n');
}





function seaUiPlacement(rect, viewport, gap) {
  const g = gap === undefined ? SEA_UI_GAP : gap;
  return {
    right: viewport.width - rect.right,
    top: rect.bottom + g,
  };
}





function stampDate(stamp) {
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})Z$/.exec(String(stamp || ''));
  if (!m) return null;
  const d = new Date(`${m[1]}T${m[2]}:${m[3]}:${m[4]}Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}


function stampAbsolute(stamp) {
  const d = stampDate(stamp);
  if (!d) return null;
  return d.toISOString().slice(0, 19).replace('T', ' ') + ' UTC';
}




function relativeAge(stamp, now = Date.now()) {
  const d = stampDate(stamp);
  if (!d) return null;
  const min = Math.floor(Math.max(0, Number(now) - d.getTime()) / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}



const SEA_UI_REPO_URL = 'https://github.com/rich0664/sea-zag';

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
      'position:fixed', 'width:204px', 'box-sizing:border-box',
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

    
    
    const resolution = seaUiEl('fieldset', groupCss);
    const resolutionTitle = seaUiEl('legend', titleCss);
    resolutionTitle.textContent = 'resolution';
    resolution.append(resolutionTitle);
    const resGrid = seaUiEl('div',
      'display:grid;grid-template-columns:repeat(3,1fr);gap:4px');
    const resRadios = [];
    for (const scale of RES_SCALES) {
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'zz-sea-res';
      input.value = String(scale);
      input.style.margin = '0';
      input.style.fontFamily = 'inherit';
      const cell = row(input, SEA_UI_RES_LABELS[scale] || String(scale));
      cell.style.margin = '0';
      resGrid.append(cell);
      resRadios.push(input);
    }
    resolution.append(resGrid);

    function rangeRow(text, min, max, id, outWidth = '34px') {
      const el = seaUiEl('label', rowCss);
      el.style.fontFamily = 'inherit';
      const name = seaUiEl('span', 'flex:0 0 auto');
      name.textContent = text;
      const input = document.createElement('input');
      input.type = 'range';
      if (id) input.id = id;
      input.min = String(min);
      input.max = String(max);
      input.step = '1';
      input.style.flex = '1';
      input.style.minWidth = '0';
      input.style.margin = '0';
      input.style.fontFamily = 'inherit';
      const out = seaUiEl('span',
        `flex:0 0 ${outWidth};text-align:right;opacity:.7;` +
        'font-variant-numeric:tabular-nums');
      el.append(name, input, out);
      
      
      
      
      input.addEventListener('wheel', e => {
        
        
        if (input.disabled) return;
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
    const waves = rangeRow('waves', 0, 200, 'zz-sea-waves');
    const flow = rangeRow('flow', 0, 200, 'zz-sea-flow');

    
    
    function resetButton(id, title) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.id = id;
      btn.textContent = 'reset';
      btn.title = title;
      btn.style.cssText = 'margin:0;padding:2px 6px;' +
        'background:#121a21;border:2px solid #3a4a55;border-radius:0;' +
        'color:inherit;font:inherit;font-family:inherit;font-size:10px;' +
        'cursor:pointer;display:block;margin-left:auto';
      return btn;
    }
    const perfResetBtn = resetButton('zz-sea-reset-perf',
      'quality default, resolution 100%, adaptive fps on, frame cap off, ' +
      'static when tabbed out on');
    const colourResetBtn = resetButton('zz-sea-reset-colour',
      'brightness 110, hue 0, saturation 100, opacity 100');
    const motionResetBtn = resetButton('zz-sea-reset-motion',
      'waves 100, flow 100');
    const styleResetBtn = resetButton('zz-sea-reset-style',
      'preset default, time of day auto');

    
    
    
    const style = seaUiEl('fieldset', groupCss);
    const styleTitle = seaUiEl('legend', titleCss);
    styleTitle.textContent = 'preset';
    const presetSelect = document.createElement('select');
    presetSelect.id = 'zz-sea-preset';
    presetSelect.style.fontFamily = 'inherit';
    for (const id of PRESET_IDS) {
      const opt = document.createElement('option');
      opt.value = id;
      const preset = typeof seaConsts !== 'undefined' && seaConsts.presets
        ? seaConsts.presets[id] : null;
      opt.textContent = (preset && preset.label) || id;
      presetSelect.append(opt);
    }
    style.append(styleTitle, presetSelect);

    const time = seaUiEl('fieldset', groupCss);
    time.id = 'zz-sea-time';
    const timeTitle = seaUiEl('legend', titleCss);
    timeTitle.textContent = 'time of day';
    const timeGrid = seaUiEl('div',
      'display:grid;grid-template-columns:1fr 1fr;gap:4px 8px');
    const timeRadios = [];
    for (const id of TIME_MODES) {
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'zz-sea-time';
      input.value = id;
      input.style.margin = '0';
      input.style.fontFamily = 'inherit';
      const cell = row(input, SEA_UI_TIME_LABELS[id] || id);
      cell.style.margin = '0';
      timeGrid.append(cell);
      timeRadios.push(input);
    }
    const hour = rangeRow('time', 0, 96, 'zz-sea-hour', '38px');
    time.append(timeTitle, timeGrid, hour.el);

    const motion = seaUiEl('fieldset', groupCss);
    const motionTitle = seaUiEl('legend', titleCss);
    motionTitle.textContent = 'motion';
    motion.append(motionTitle, waves.el, flow.el, motionResetBtn);

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

    
    
    
    
    
    
    const dates = seaUiEl('div', 'font-size:10px;line-height:1.4;opacity:.6;' +
      'margin:2px 0 0;overflow-wrap:anywhere');
    dates.id = 'zz-sea-dates';
    const mapAge = seaUiEl('div', '');
    const seaAge = seaUiEl('div', '');
    dates.append(mapAge, seaAge);
    dates.hidden = true;

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

    
    
    const repo = document.createElement('a');
    repo.id = 'zz-sea-github';
    repo.href = SEA_UI_REPO_URL;
    repo.target = '_blank';
    repo.rel = 'noopener noreferrer';
    repo.textContent = 'sea-zag on GitHub';
    repo.style.cssText = 'display:inline-block;margin:0;font:inherit;' +
      'font-family:inherit;font-size:10px;line-height:1.4;color:inherit;' +
      'opacity:.55;text-decoration:underline;text-underline-offset:2px';

    
    
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

    
    
    
    
    function paintDates(s) {
      const map = s ? relativeAge(s.mapStamp) : null;
      const sea = s ? relativeAge(s.seaStamp) : null;
      mapAge.textContent = map ? `map updated ${map}` : '';
      mapAge.title = map ? stampAbsolute(s.mapStamp) : '';
      seaAge.textContent = sea ? `sea baked ${sea}` : '';
      seaAge.title = sea ? stampAbsolute(s.seaStamp) : '';
      dates.hidden = !(map || sea);
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
      onRow, quality, resolution, fpsRow, cap, hiddenRow, perfResetBtn, divider(),
      style, time, styleResetBtn, divider(),
      opacity.el, brightness.el, hue.el, sat.el, colourResetBtn,
      motion, divider(),
      updateLine, dates, diagnostics, divider(), repo,
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
      
      
      
      const still = s.mode === 'static';
      const resOff = still || shaderOff;
      const resValue = Number.isFinite(s.resScale) ? s.resScale : 1;
      for (const input of resRadios) {
        input.checked = Number(input.value) === resValue;
        input.disabled = resOff;
      }
      resolution.style.opacity = resOff ? '.35' : '';
      presetSelect.value = s.preset || 'default';
      presetSelect.disabled = resOff;
      style.style.opacity = resOff ? '.35' : '';
      
      
      const timeOff = resOff || s.presetDayNight === false;
      const timeValue = s.timeMode || 'auto';
      for (const input of timeRadios) {
        input.checked = input.value === timeValue;
        input.disabled = timeOff;
      }
      time.style.opacity = timeOff ? '.35' : '';
      const hourValue = Number.isFinite(s.customHour) ? s.customHour : 13;
      hour.input.value = String(Math.round(hourValue * 4));
      hour.out.textContent = formatHour24(hourValue);
      hour.input.disabled = timeOff;
      hour.el.style.opacity = timeOff ? '.35' : '';
      
      
      const showHour = timeValue === 'custom';
      hour.el.hidden = !showHour;
      hour.el.style.display = showHour ? 'flex' : 'none';
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
      
      
      for (const [row, value] of [[waves, s.waveSpeed], [flow, s.flowSpeed]]) {
        const pct = Math.round((Number.isFinite(value) ? value : 1) * 100);
        row.input.value = String(pct);
        row.out.textContent = `${pct}%`;
        row.input.disabled = still;
        row.el.style.opacity = still ? '.35' : '';
      }
      paintUpdate(s.update);
      paintDates(s);
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
    for (const input of resRadios) {
      input.addEventListener('change', () => {
        if (input.checked) emit({ resScale: Number(input.value) });
      });
    }
    presetSelect.addEventListener('change', () => emit({ preset: presetSelect.value }));
    for (const input of timeRadios) {
      input.addEventListener('change', () => {
        if (input.checked) emit({ timeMode: input.value });
      });
    }
    
    hour.input.addEventListener('input', () => {
      const h = Number(hour.input.value) * 0.25;
      hour.out.textContent = formatHour24(h);
      emit({ customHour: h });
    });
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
    
    waves.input.addEventListener('input', e => {
      const v = snapInput(e, waves.input.value, [100, 0]);
      waves.input.value = String(v);
      waves.out.textContent = `${v}%`;
      emit({ waveSpeed: v / 100 });
    });
    flow.input.addEventListener('input', e => {
      const v = snapInput(e, flow.input.value, [100, 0]);
      flow.input.value = String(v);
      flow.out.textContent = `${v}%`;
      emit({ flowSpeed: v / 100 });
    });
    perfResetBtn.addEventListener('click', () => emit({ reset: 'perf' }));
    colourResetBtn.addEventListener('click', () => emit({ reset: 'colour' }));
    motionResetBtn.addEventListener('click', () => emit({ reset: 'motion' }));
    styleResetBtn.addEventListener('click', () => emit({ reset: 'style' }));
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

  
  let activeMapKind = null;
  let mapGateOpen = false;
  let routeEpoch = 0;               
  let mapsRecordPromise = null;
  const kindStates = new Map();

  const mapW = () => (activePointer ? activePointer.map.w : 0);   
  const mapH = () => (activePointer ? activePointer.map.h : 0);
  
  
  
  const mapOx = () => (activePointer && activePointer.map ? activePointer.map.ox || 0 : 0);
  const mapOy = () => (activePointer && activePointer.map ? activePointer.map.oy || 0 : 0);
  
  
  const mapPad = () => bakeDims(activePointer).pad;
  const bakeW = () => bakeDims(activePointer).bakeW;
  const bakeH = () => bakeDims(activePointer).bakeH;

  
  const MANIFEST_TIMEOUT_MS = 5000;
  const INITIAL_HOLD_MS = MANIFEST_TIMEOUT_MS;

  
  
  
  function getKindState(kind) {
    let ks = kindStates.get(kind);
    if (ks) return ks;
    ks = {
      kind,
      outdated: false,
      
      
      
      unverified: false,
      liveMapStamp: null,
      pointer: kind === 'exploration' ? parsePointer(null, seaConsts) : null,
      pointerLoaded: false,
      pointerPromise: null,
      recordStamp: null,
      gate: null,
      holdTimer: 0,
      checkInFlight: false,
      mapCheck: {
        kind,
        status: 'unknown',
        pointerStamp: kind === 'exploration' ? seaConsts.map.stamp : null,
        liveStamp: null,
        source: 'none',
        assetVersion: kind === 'exploration' ? seaConsts.assetVersion : null,
      },
    };
    kindStates.set(kind, ks);
    return ks;
  }

  
  
  
  
  
  
  
  
  
  
  function holdBudgetMs(kind) {
    if (kind === 'exploration') return INITIAL_HOLD_MS;
    return 2 * POINTER_TIMEOUT_MS + MANIFEST_TIMEOUT_MS + 1000;
  }

  function ensureKindGate(ks) {
    if (!ks.gate) {
      ks.gate = paintHold();
      ks.holdTimer = setTimeout(() => {
        ks.holdTimer = 0;
        
        
        if (ks.kind !== 'exploration') { closeUnverifiedSea(ks.kind); return; }
        settleKindGate(ks, null);
      }, holdBudgetMs(ks.kind));
    }
    return ks.gate;
  }

  function settleKindGate(ks, verdict) {
    if (!ks || !ks.gate) return false;
    if (ks.holdTimer) {
      clearTimeout(ks.holdTimer);
      ks.holdTimer = 0;
    }
    return ks.gate.settle(verdict);
  }

  function initialGateSettled() {
    const ks = activeMapKind ? kindStates.get(activeMapKind) : null;
    return Boolean(ks && ks.gate && ks.gate.settled());
  }

  
  
  function syncActiveMirrors(kind) {
    const ks = kind ? getKindState(kind) : null;
    
    
    activePointer = ks && !ks.unverified ? ks.pointer : null;
    pointerLoaded = ks ? ks.pointerLoaded : false;
    state.mapOutdated = ks ? ks.outdated : false;
    state.liveMapStamp = ks ? ks.liveMapStamp : null;
    state.mapCheck = ks ? ks.mapCheck : {
      kind: null, status: 'unknown', pointerStamp: null,
      liveStamp: null, source: 'none', assetVersion: null,
    };
  }

  const assetBase = window.__ZZ_SEA_ASSET_BASE || undefined;
  const errText = e => String((e && e.message) || e);

  
  
  
  
  function assetSources(name, rootVersion, kind = activeMapKind) {
    const ks = kind ? getKindState(kind) : null;
    if (!ks || !ks.pointer) return [];
    return assetSourceList(name, {
      base: assetBase,
      assetVersion: ks.pointer.assetVersion,
      rootVersion: rootVersion ?? ks.pointer.assetVersion,
      inlinedVersion: seaConsts.assetVersion,
      pointerLoaded: ks.pointerLoaded,
      allowRootFallback: kind === 'exploration',
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

  function fetchJsonWithTimeout(url, timeoutMs, cache = 'no-cache') {
    const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs) : 0;
    return fetch(url, {
      cache,
      signal: ctrl ? ctrl.signal : undefined,
    })
      .then(res => {
        if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
        return res.json();
      })
      .finally(() => { if (timer) clearTimeout(timer); });
  }

  
  
  
  function loadMapsRecord() {
    if (mapsRecordPromise) return mapsRecordPromise;
    mapsRecordPromise = fetchJsonWithTimeout(mapsRecordUrl(assetBase), POINTER_TIMEOUT_MS)
      .catch(() => null);
    return mapsRecordPromise;
  }

  
  
  
  
  function loadPointerForKind(kind) {
    const ks = getKindState(kind);
    if (ks.pointerPromise) return ks.pointerPromise;
    ks.pointerPromise = loadMapsRecord()
      .then(record => {
        const entry = parseKindRecord(record, kind);
        if (!entry) return null;
        ks.recordStamp = entry.stamp;
        return fetchJsonWithTimeout(snapshotUrl(entry.assetVersion, assetBase),
          POINTER_TIMEOUT_MS)
          .then(json => parseKindPointer(json, kind))
          .catch(() => null);
      })
      .then(parsed => {
        if (parsed) {
          ks.pointer = parsed;
          ks.pointerLoaded = true;
          ks.mapCheck.pointerStamp = parsed.map.stamp;
          ks.mapCheck.assetVersion = parsed.assetVersion;
          return;
        }
        if (kind !== 'exploration') return;
        
        
        return fetchJsonWithTimeout(pointerUrl(assetBase), POINTER_TIMEOUT_MS)
          .then(json => {
            const root = parsePointer(json, seaConsts);
            ks.pointer = root;
            ks.pointerLoaded = true;
            ks.mapCheck.pointerStamp = root.map.stamp;
            ks.mapCheck.assetVersion = root.assetVersion;
          })
          .catch(() => {});
      })
      .then(() => {
        if (activeMapKind === kind) syncActiveMirrors(kind);
        return ks;
      });
    return ks.pointerPromise;
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
    waveSpeed: localStorage.getItem('zz-sea-wave-speed'),
    flowSpeed: localStorage.getItem('zz-sea-flow-speed'),
    fps30: localStorage.getItem('zz-sea-fps'),
    frameCap: localStorage.getItem('zz-sea-cap'),
    staticWhenHidden: localStorage.getItem('zz-sea-hidden'),
    resScale: localStorage.getItem('zz-sea-res'),
    preset: localStorage.getItem('zz-sea-preset'),
    timeMode: localStorage.getItem('zz-sea-time-mode'),
    customHour: localStorage.getItem('zz-sea-custom-hour'),
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
    waveSpeed: saved.waveSpeed, flowSpeed: saved.flowSpeed,
    
    
    
    wavePhase: 0, flowPhase: 0, lastPhaseAt: 0,
    frameCap: saved.frameCap, staticWhenHidden: saved.staticWhenHidden,
    
    resScale: saved.resScale, preset: saved.preset,
    timeMode: saved.timeMode, customHour: saved.customHour,
    isPirate: false,                
    glReady: false, error: null, loading: false, moving: false,
    colourFormat: null,            
    canUseShader, maxTextureSize: probe.maxTextureSize,
    whalePose: null,               
    mapOutdated: false,            
    liveMapStamp: null,
    mapCheck: {
      kind: 'exploration',
      status: 'unknown',
      pointerStamp: activePointer.map.stamp,
      liveStamp: null,
      source: 'none',
      assetVersion: activePointer.assetVersion,
    },
  };
  window.__zzSea = state;

  
  
  const currentSettings = () => modeSettings(state.mode, state.preset, state.resScale);

  
  
  
  
  
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
  
  
  const ZERO_WAKE = new Float32Array(4);
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
      whaleLoad = fetchAsset(assetSources('sea-zag-whale.bin',
        activePointer && activePointer.whaleVersion), 'whale route')
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
      whaleMeshLoad = fetchAsset(assetSources('sea-zag-whale-mesh.bin',
        activePointer && activePointer.meshVersion), 'whale mesh')
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
    
    
    if (state.mode === 'static' || !whaleEnabled || !whaleRoute ||
        activeMapKind !== 'exploration') {
      state.whalePose = null;
      updateWhaleWake(nowMs, null);
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
  
  
  function syncPirateFlag() {
    state.isPirate = Array.isArray(pirateRawLayers) &&
      pirateRawLayers.some(isPirateOceanLayer);
  }

  function hidePirateOcean(deck) {
    if (!deck || deck.__zzSeaOceanFiltered || typeof deck.setProps !== 'function') {
      return deck;
    }
    deck.__zzSeaOceanFiltered = true;
    const pass = deck.setProps.bind(deck);
    deck.setProps = next => {
      if (next && Array.isArray(next.layers)) {
        pirateRawLayers = next.layers;
        syncPirateFlag();
        const kept = state.on ? withoutPirateOcean(next.layers) : next.layers;
        if (kept !== next.layers) next = { ...next, layers: kept };
      }
      return pass(next);
    };
    
    
    const live = deck.props && deck.props.layers;
    if (Array.isArray(live)) { pirateRawLayers = live; syncPirateFlag(); }
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

  
  
  
  const currentMapKind = () => mapKindForVariant(mapVariant(), location.pathname);

  
  
  
  
  
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
    
    
    if (!activePointer) return;
    if (state.mapOutdated) { paintOutdatedPlaceholder(); return; }
    
    
    if (!initialGateSettled()) { showNoise(); return; }
    if (!state.on || !staticVisible() || !mapGateOpen) return;
    const deck = deckCanvas();
    const img = state.img;
    if (!deck || !img) return;

    const vs = viewState(deck);
    if (!vs) return;

    const pad = vs.padding || {};
    const W = deck.clientWidth || deck.width;
    const H = deck.clientHeight || deck.height;

    const sig = [vs.zoom, vs.target[0], vs.target[1], pad.left, pad.right, W, H,
      mapOx(), mapOy()].join('|');
    if (!force && sig === state.sig) return;
    state.sig = sig;

    const ov = overlay(deck);
    const c = ov.getContext('2d');

    
    
    
    
    const blit = staticBlitLayout(
      vs, W, H, img.width, img.height, mapW(), mapH(), mapPad(), mapOx(), mapOy(),
    );
    if (!blit) return;
    const { s, ox, oy, sx0, sy0, sx1, sy1 } = blit;

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

  
  
  
  
  
  
  
  
  function closeSeaForMap() {
    stopStatic();
    stopGL();
    hideNoise(0);
    removeStaticCanvas();
    releaseGL();
    colourPromise = null;
    state.img = null;
    state.loading = false;
    state.error = null;
    state.sig = '';
    state.whalePose = null;
    wakePeak = 0;
    whaleWake[2] = 0;
    state.moving = false;
    firstLoad = true;             
    
    hideOutdatedPlaceholder();
    refreshUi();                  
  }

  function openSeaForMap(kind) {
    const ks = getKindState(kind);
    activeMapKind = kind;
    mapGateOpen = true;
    syncActiveMirrors(kind);
    ensureKindGate(ks);
    if (ks.outdated) {
      paintOutdatedPlaceholder();
      
      
      refreshUi();
      return;
    }
    if (ks.unverified) {
      
      
      hideNoise(0);
      refreshUi();
      return;
    }
    checkLiveMap(kind);
    refreshUi();
    if (pendingMode) { applyMode(pendingMode); return; }
    if (!state.on || backgrounded || document.hidden) return;
    nextAt = 0;
    if (state.mode === 'static') {
      if (!state.img) loadColour(kind).catch(() => {});
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
    const nextKind = currentMapKind();
    if (nextKind === activeMapKind) return nextKind !== null;
    routeEpoch++;
    if (activeMapKind !== null) closeSeaForMap();
    if (nextKind === null) {
      activeMapKind = null;
      mapGateOpen = false;
      syncActiveMirrors(null);
      refreshUi();
      return false;
    }
    openSeaForMap(nextKind);
    return false;
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

  
  
  
  
  
  
  
  const MAP_CACHE = 'zigzag-map-binaries';

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

  function fetchManifest(kind) {
    const url = manifestUrlForKind(kind);
    if (!url) return Promise.resolve(null);
    return fetchJsonWithTimeout(url, MANIFEST_TIMEOUT_MS, 'no-store')
      .catch(() => null);         
  }

  
  
  function hideSeaForNoPointer() {
    hideNoise(0);
    state.loading = false;
    refreshUi();
  }

  function checkLiveMap(kind = activeMapKind) {
    if (!kind || kind !== currentMapKind()) return null;
    const ks = getKindState(kind);
    const gate = ensureKindGate(ks);
    if (ks.outdated || ks.unverified || ks.checkInFlight) return gate.promise;
    const epoch = routeEpoch;
    ks.checkInFlight = true;
    loadPointerForKind(kind).then(() => {
      if (epoch !== routeEpoch || activeMapKind !== kind) return;
      const pointerStamp =
        (ks.pointer && ks.pointer.map.stamp) || ks.recordStamp || null;
      const assetVersion = ks.pointer ? ks.pointer.assetVersion : null;
      if (!pointerStamp) {
        
        ks.mapCheck = {
          kind, status: 'unavailable', pointerStamp: null, liveStamp: null,
          source: 'none', assetVersion: null,
        };
        settleKindGate(ks, null);
        hideSeaForNoPointer();
        return;
      }
      const timing = timingUrls();
      
      
      const quick = checkMapGate({ kind, pointerStamp, timingUrls: timing });
      if (quick.status === 'outdated') {
        ks.mapCheck = { ...quick, kind, pointerStamp, assetVersion };
        settleKindGate(ks, quick);
        enterOutdated(kind, quick);
        return;
      }
      return cacheUrls().then(cache => fetchManifest(kind).then(manifest => {
        if (epoch !== routeEpoch || activeMapKind !== kind) return;
        if (ks.outdated) { settleKindGate(ks, null); return; }
        const verdict = checkMapGate({
          kind, pointerStamp, timingUrls: timing, cacheUrls: cache, manifest,
          
          
          manifestFailed: !manifest,
        });
        ks.mapCheck = { ...verdict, kind, pointerStamp, assetVersion };
        settleKindGate(ks, verdict);
        if (verdict.status === 'outdated') {
          enterOutdated(kind, verdict);
          return;
        }
        if (verdict.status === 'unavailable') {
          closeUnverifiedSea(kind);
          return;
        }
        
        
        if (!ks.pointer) hideSeaForNoPointer();
      }));
    }).catch(() => {}).finally(() => {
      ks.checkInFlight = false;
      
      
      
      
      if (epoch !== routeEpoch || activeMapKind !== kind) {
        if (activeMapKind === kind && !ks.outdated && !ks.unverified) {
          checkLiveMap(kind);
        }
        return;
      }
      
      
      settleKindGate(ks, null);
      syncActiveMirrors(kind);
    });
    return gate.promise;
  }

  
  
  function enterOutdated(kind, verdict) {
    const ks = getKindState(kind);
    const pointerStamp =
      (ks.pointer && ks.pointer.map.stamp) || ks.recordStamp || null;
    ks.outdated = true;
    ks.liveMapStamp = verdict.liveStamp;
    ks.mapCheck = {
      kind,
      status: 'outdated',
      pointerStamp,
      liveStamp: verdict.liveStamp,
      source: verdict.source,
      assetVersion: ks.pointer ? ks.pointer.assetVersion : null,
    };
    if (kind !== activeMapKind) return;
    syncActiveMirrors(kind);
    
    
    tearDownSeaLayers();
    paintOutdatedPlaceholder();
    refreshUi();
  }

  
  
  
  
  
  
  function closeUnverifiedSea(kind) {
    const ks = getKindState(kind);
    ks.unverified = true;
    if (kind !== activeMapKind) return;
    syncActiveMirrors(kind);
    tearDownSeaLayers();
    refreshUi();
  }

  
  
  function tearDownSeaLayers() {
    stopStatic();
    stopGL();
    hideNoise(0);
    removeStaticCanvas();
    releaseGL();
    state.whalePose = null;
    wakePeak = 0;
    whaleWake[2] = 0;
    state.img = null;
    state.loading = false;
  }

  
  
  
  
  
  const COLOUR_SOURCES = [
    ['avif', 'sea-zag.avif'],
    ['webp', 'sea-zag.webp'],
  ];
  let colourPromise = null;
  let colourToken = 0;

  
  
  function releaseColour(token) {
    if (colourToken === token) colourPromise = null;
  }

  function loadColour(kind = activeMapKind) {
    if (!kind || kind !== activeMapKind) return Promise.resolve(null);
    const ks = getKindState(kind);
    if (ks.outdated) return Promise.resolve(state.img);
    if (ks.unverified) return Promise.resolve(null);
    if (state.img) return Promise.resolve(state.img);
    if (colourPromise) return colourPromise;
    const epoch = routeEpoch;
    const token = ++colourToken;
    
    
    
    
    colourPromise = loadPointerForKind(kind).then(() => {
      
      
      if (epoch !== routeEpoch || activeMapKind !== kind || ks.outdated) {
        releaseColour(token);
        return null;
      }
      if (!ks.pointer || ks.unverified) {
        
        
        releaseColour(token);
        hideSeaForNoPointer();
        return null;
      }
      return new Promise((resolve, reject) => {
        let i = 0;
        
        
        const sources = COLOUR_SOURCES.flatMap(([format, name]) =>
          assetSources(name, undefined, kind).map(src => ({ format, src })));
        const tryNext = () => {
          if (epoch !== routeEpoch || activeMapKind !== kind) {
            releaseColour(token);
            resolve(null);
            return;
          }
          if (i >= sources.length) {
            releaseColour(token);
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
            releaseColour(token);
            
            
            if (epoch !== routeEpoch || activeMapKind !== kind) { resolve(null); return; }
            if (ks.outdated) { resolve(img); return; }
            
            if (ks.unverified) { resolve(null); return; }
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
      });
    });
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
    
    
    if (state.mode !== 'static' && state.on && activePointer) {
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

  function link(gl, defs, vertSrc = VERT, fragSrc = FRAG) {
    const prog = gl.createProgram();
    let vs = null;
    let fs = null;
    try {
      vs = compile(gl, gl.VERTEX_SHADER, withDefines(vertSrc, defs));
      fs = compile(gl, gl.FRAGMENT_SHADER, withDefines(fragSrc, defs));
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
    'uHeight', 'uAux', 'uDist', 'uFlow', 'uSpeedTex', 'uNormal', 'uSoilTex',
    'uPalette', 'uSkyMatcap', 'uCurve', 'uSliceCurve', 'uWarpCurve',
    'uTarget', 'uSize', 'uFlowSize', 'uSpeedSize', 'uAuxSpan', 'uCenter',
    'uFlowCell', 'uZoom', 'uZoomCss', 'uTime', 'uWaveTime', 'uFlowTime',
    'uDistMax', 'uShoreW', 'uShelf', 'uFlowSpeed', 'uGrain', 'uFoam', 'uSnap',
    'uWaveSpeed', 'uFlowMode', 'uCycle', 'uDeflect', 'uDeflectReach',
    'uTravelMax', 'uWarp', 'uWarpBias', 'uSpec', 'uSpecPow', 'uSpecSize',
    'uSpecFloor', 'uSpecInvert', 'uSpecMode', 'uDirA', 'uDirB',
    'uSpeedA', 'uSpeedB', 'uScaleA', 'uScaleB', 'uParallax', 'uDepthScale',
    'uDeepSlow', 'uWaveIn', 'uWaveOut', 'uPomLayers', 'uAlongScale',
    'uHeightSpan', 'uPomDepthFloor', 'uBrightness', 'uHue', 'uSat',
    'uSurfMode', 'uSurfStrength', 'uChopAmp', 'uCrossAmp', 'uSwellAmp',
    'uMacroAmp', 'uBandLimit', 'uSwellDir', 'uMacroAlign', 'uSurfPattern',
    'uChoppy', 'uPainterly', 'uChopScale', 'uCrossScale', 'uSwellScale',
    'uMacroScale', 'uRidgeMix', 'uMacroZoom', 'uMacroZoomMode', 'uPeakBias',
    'uSpecTilt', 'uDepthGamma', 'uDepthContrast', 'uWaterClarity', 'uBedVis',
    'uSoilLumLock', 'uSoilDark', 'uSoilSat', 'uReliefFade', 'uDeepVeil',
    'uVeilStart', 'uSoilMix', 'uIsPirate', 'uMurkGain', 'uAbsorbK',
    'uMurkAbsorb', 'uMurkScatter', 'uMurkDepthFade', 'uCoastCol',
    'uCoastLevels', 'uCoastStrength', 'uMurkCol', 'uDayNightOn', 'uSunDir',
    'uLightCol', 'uAmbientCol', 'uSkyZenith', 'uSkyHorizon', 'uNightMix',
    'uReliefStrength', 'uBiolumGain', 'uShadowStrength', 'uShadowLen',
    'uShadowHeight', 'uShadowSoft', 'uShadowMaxEl', 'uShadowStretch', 'uKeyVis',
    'uSpecTint', 'uSpecDrift', 'uSpecStretch', 'uSpecSpread', 'uSpecRadius',
    'uSkyOn', 'uSkyGain', 'uSkyOpacity', 'uSkyInt', 'uFresnelF0', 'uFresnelPow',
    'uSkyNormal', 'uSkyCel', 'uSkyBlend', 'uSpecModel', 'uSpecGain',
    'uSpecOpacity', 'uSpecInt', 'uRoughTight', 'uRoughBroad', 'uViewTilt',
    'uSpecCut', 'uSpecBlend', 'uFetchWeight', 'uShoalGain', 'uWaveSet',
    'uWhalePose', 'uWhaleShape', 'uWhaleWake', 'uWhaleTex', 'uWhaleHalf',
    'uWhaleHeight', 'uBleed', 'uReveal', 'uViewSize', 'uTileOrigin',
    'uTexelPass', 'uNoiseLut', 'uShadowTex',
  ];

  const SHADOW_UNIFORMS = [
    'uAux', 'uCurve', 'uTarget', 'uAuxSpan', 'uCenter', 'uShadowScale',
    'uZoom', 'uZoomCss', 'uSnap', 'uParallax', 'uDepthScale', 'uHeightSpan',
    'uSunDir', 'uShadowStrength', 'uShadowLen', 'uShadowHeight', 'uShadowSoft',
    'uShadowMaxEl', 'uShadowStretch',
  ];
  const BLIT_UNIFORMS = [
    'uTexelFbo', 'uTarget', 'uCenter', 'uTileOrigin', 'uTileSpan', 'uZoom',
  ];

  
  
  
  function buildProgram(gl, defs) {
    const prog = link(gl, defs);
    const uni = {};
    for (const name of UNIFORM_NAMES) uni[name] = gl.getUniformLocation(prog, name);
    gl.useProgram(prog);
    gl.uniform1i(uni.uHeight, 0);
    gl.uniform1i(uni.uAux, 1);
    gl.uniform1i(uni.uDist, 2);
    gl.uniform1i(uni.uFlow, 3);
    gl.uniform1i(uni.uSpeedTex, 4);
    gl.uniform1i(uni.uNormal, 5);
    gl.uniform1i(uni.uSoilTex, 6);
    gl.uniform1i(uni.uPalette, 7);
    gl.uniform1i(uni.uCurve, 8);
    gl.uniform1i(uni.uSliceCurve, 9);
    gl.uniform1i(uni.uWarpCurve, 10);
    gl.uniform1i(uni.uSkyMatcap, 11);
    gl.uniform1i(uni.uWhaleTex, 12);
    gl.uniform1i(uni.uShadowTex, 13);
    
    gl.uniform2f(uni.uWhaleHalf, 5.5, 2.0);
    gl.uniform1f(uni.uWhaleHeight, 1.0);
    
    
    gl.uniform1f(uni.uBleed, 0.0);
    
    gl.uniform1f(uni.uDepthScale, 1.0);
    
    
    gl.uniform1f(uni.uWaveTime, 0.0);
    gl.uniform1f(uni.uFlowTime, 0.0);
    gl.uniform1f(uni.uTexelPass, 0.0);
    gl.uniform2f(uni.uTileOrigin, 0.0, 0.0);
    gl.uniform2f(uni.uViewSize, 1.0, 1.0);
    gl.uniform1f(uni.uWaveSet, 1.0);
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
        p = c.progs.values().next().value;
        if (!p) throw e;
      }
      c.progs.set(key, p);
    }
    c.prog = p.prog;
    c.uni = p.uni;
  }

  function getShadowProgram(c, defs) {
    const steps = (defs && defs.SHADOW_STEPS) || 14;
    let p = c.shadowProgs.get(steps);
    if (!p) {
      const prog = link(c.gl, { SHADOW_STEPS: steps }, VERT, FRAG_SHADOW);
      const uni = {};
      for (const name of SHADOW_UNIFORMS) uni[name] = c.gl.getUniformLocation(prog, name);
      c.gl.useProgram(prog);
      c.gl.uniform1i(uni.uAux, 1);
      c.gl.uniform1i(uni.uCurve, 8);
      p = { prog, uni };
      c.shadowProgs.set(steps, p);
    }
    return p;
  }

  function getBlitProgram(c) {
    if (!c.blitProg) {
      const prog = link(c.gl, null, VERT, FRAG_BLIT);
      const uni = {};
      for (const name of BLIT_UNIFORMS) uni[name] = c.gl.getUniformLocation(prog, name);
      c.gl.useProgram(prog);
      
      
      c.gl.uniform1i(uni.uTexelFbo, 13);
      c.blitProg = prog;
      c.blitUni = uni;
    }
    return { prog: c.blitProg, uni: c.blitUni };
  }

  
  
  
  const WHALE_SHAPE = { halfLen: 11.5, halfWid: 3.6 };

  
  const TRAVEL_CAP = 12.0;

  
  
  
  const PLAIN_UNIFORM = {
    shore: 'uShoreW', shelf: 'uShelf', flow: 'uFlowSpeed', wave: 'uWaveSpeed',
    grain: 'uGrain', foam: 'uFoam', dslow: 'uDeepSlow', win: 'uWaveIn',
    wout: 'uWaveOut', wbias: 'uWarpBias', deflect: 'uDeflect',
    deflectReach: 'uDeflectReach', flowMode: 'uFlowMode', snap: 'uSnap',
    spec: 'uSpec', specPow: 'uSpecPow', specSize: 'uSpecSize',
    specInvert: 'uSpecInvert', specFloor: 'uSpecFloor',
    specTilt: 'uSpecTilt', viewTilt: 'uViewTilt', roughTight: 'uRoughTight',
    roughBroad: 'uRoughBroad', chopScale: 'uChopScale', crossScale: 'uCrossScale',
    swellScale: 'uSwellScale', macroScale: 'uMacroScale', macroZoom: 'uMacroZoom',
    choppy: 'uChoppy', swellDir: 'uSwellDir', waterClarity: 'uWaterClarity',
    depthGamma: 'uDepthGamma', depthContrast: 'uDepthContrast',
    reliefFade: 'uReliefFade', veilStart: 'uVeilStart', shadowLen: 'uShadowLen',
    shadowH: 'uShadowHeight', shadowSoft: 'uShadowSoft',
    shadowMaxEl: 'uShadowMaxEl', shadowStretch: 'uShadowStretch',
    fresnelF0: 'uFresnelF0', fresnelPow: 'uFresnelPow', specDrift: 'uSpecDrift',
    specStretch: 'uSpecStretch', specSpread: 'uSpecSpread', specRadius: 'uSpecRadius',
    coastLevels: 'uCoastLevels', murkDepthFade: 'uMurkDepthFade',
    coastStrength: 'uCoastStrength',
  };

  const PERCENT_UNIFORM = {
    surfStrength: 'uSurfStrength', chopAmp: 'uChopAmp', crossAmp: 'uCrossAmp',
    swellAmp: 'uSwellAmp', macroAmp: 'uMacroAmp', bandLimit: 'uBandLimit',
    macroAlign: 'uMacroAlign', painterly: 'uPainterly', ridgeMix: 'uRidgeMix',
    peakBias: 'uPeakBias', soilLumLock: 'uSoilLumLock', soilDark: 'uSoilDark',
    soilSat: 'uSoilSat', bedVis: 'uBedVis', deepVeil: 'uDeepVeil',
    soilMix: 'uSoilMix', murkGain: 'uMurkGain', murkAbsorb: 'uMurkAbsorb',
    murkScatter: 'uMurkScatter', relief: 'uReliefStrength', biolum: 'uBiolumGain',
    specGain: 'uSpecGain', specOpacity: 'uSpecOpacity', specCut: 'uSpecCut',
    skyGain: 'uSkyGain', skyOpacity: 'uSkyOpacity', skyNormal: 'uSkyNormal',
    skyCel: 'uSkyCel', fetchW: 'uFetchWeight', shoalG: 'uShoalGain',
  };

  const hexRgb255 = hex => {
    const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || ''));
    const n = m ? parseInt(m[1], 16) : 0x5f8791;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };

  function setModeUniforms(gl, uni, u, settings, frame) {
    const rad = deg => deg * Math.PI / 180;
    const tog = (settings.preset && seaConsts.presets[settings.preset]
      ? seaConsts.presets[settings.preset].TOG : null) || {};
    const defs = settings.defines || {};
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
          const pct = PERCENT_UNIFORM[k];
          if (name) gl.uniform1f(uni[name], u[k]);
          else if (pct) gl.uniform1f(uni[pct], Number(u[k]) / 100);
        }
      }
    }

    
    gl.uniform1f(uni.uSurfMode, tog.surfMode ? 1 : 0);
    gl.uniform1f(uni.uSurfPattern, Number(tog.surfPattern) || 0);
    gl.uniform1f(uni.uMacroZoomMode, tog.macroZoomMode ? 1 : 0);
    gl.uniform1f(uni.uTravelMax, tog.clamp ? TRAVEL_CAP : 0);

    
    const b = seaConsts.baseline;
    gl.uniform1f(uni.uSpeedA, b.aspeed);
    gl.uniform1f(uni.uSpeedB, b.bspeed);
    gl.uniform1f(uni.uScaleA, b.ascale);
    gl.uniform1f(uni.uScaleB, b.bscale);

    
    gl.uniform3f(uni.uAbsorbK, Number(u.kR) || 0, Number(u.kG) || 0, Number(u.kB) || 0);
    const murk = hexRgb255(u.murkCol);
    gl.uniform3f(uni.uMurkCol, murk[0] / 255, murk[1] / 255, murk[2] / 255);
    const coast = (activePointer && activePointer.coast) || seaConsts.coast;
    gl.uniform3f(uni.uCoastCol, coast.r / 255, coast.g / 255, coast.b / 255);
    gl.uniform1f(uni.uSoilMix,
      defs.HAS_SOIL && frame && frame.soilReady ? Number(u.soilMix) / 100 : 0);
    gl.uniform1f(uni.uPomDepthFloor, tog.pomFloor ? 1 : 0);
    gl.uniform1f(uni.uIsPirate, state.isPirate ? 1 : 0);

    
    const dn = frame.dn;
    const on = frame.dayNight ? 1 : 0;
    gl.uniform1f(uni.uDayNightOn, on);
    gl.uniform3fv(uni.uSunDir, dn.keyDir);
    gl.uniform3fv(uni.uLightCol, dn.lightCol);
    gl.uniform3fv(uni.uAmbientCol, dn.ambCol);
    gl.uniform3fv(uni.uSkyZenith, dn.skyZ);
    gl.uniform3fv(uni.uSkyHorizon, dn.skyH);
    gl.uniform1f(uni.uNightMix, dn.nightMix);
    gl.uniform1f(uni.uKeyVis, dn.keyVis);
    gl.uniform3fv(uni.uSpecTint, dn.specTint);
    gl.uniform1f(uni.uSkyInt, frame.dayNight ? dn.skyI : 1.0);
    gl.uniform1f(uni.uSpecInt, frame.dayNight ? dn.specI : 1.0);
    gl.uniform1f(uni.uShadowStrength, frame.shadowEff);

    
    gl.uniform1f(uni.uSkyOn, tog.skyOn ? 1 : 0);
    gl.uniform1f(uni.uSkyBlend, Number(tog.skyBlend) || 0);
    gl.uniform1f(uni.uSpecBlend, Number(tog.specBlend) || 0);
    gl.uniform1f(uni.uSpecModel, tog.specModel ? 1 : 0);
    gl.uniform1f(uni.uSpecMode, Number(tog.specMode) || 0);
    gl.uniform1f(uni.uWaveSet, frame.waveSet);
  }

  
  
  
  function decodeTexture(name, kind = activeMapKind) {
    const sources = assetSources(name, undefined, kind);
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
    height: ['R8', 'RED'],          
    dist: ['R8', 'RED'],            
    aux: ['RGB8', 'RGB'],           
    flow: ['RGB8', 'RGB'],          
    speed: ['RGB8', 'RGB'],         
    normal: ['RGB8', 'RGB'],        
    soil: ['RGBA8', 'RGBA'],        
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

  
  function paletteTexture(gl, pal) {
    const p = pal && Array.isArray(pal.stops) && Array.isArray(pal.cols)
      ? pal : seaConsts.palette;
    const n = 256;
    const data = new Uint8Array(n * 3);
    const stops = p.stops;
    const cols = p.cols;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      let c = cols[cols.length - 1];
      if (t <= stops[0]) {
        c = cols[0];
      } else {
        for (let k = 1; k < stops.length; k++) {
          if (t <= stops[k]) {
            const f = (t - stops[k - 1]) / Math.max(1e-6, stops[k] - stops[k - 1]);
            c = [0, 1, 2].map(j => cols[k - 1][j] + (cols[k][j] - cols[k - 1][j]) * f);
            break;
          }
        }
      }
      data[i * 3] = Math.round(c[0]);
      data[i * 3 + 1] = Math.round(c[1]);
      data[i * 3 + 2] = Math.round(c[2]);
    }
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB8, n, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, data);
    return tex;
  }

  
  
  function solidTexture(gl, rgba) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
      new Uint8Array(rgba));
    return tex;
  }

  
  
  
  function makeTarget(gl, w, h, format, filter) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, format, w, h, 0,
      format === gl.R8 ? gl.RED : gl.RGBA, gl.UNSIGNED_BYTE, null);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    if (!ok) {
      gl.deleteFramebuffer(fb);
      gl.deleteTexture(tex);
      return null;
    }
    return { fb, tex, w, h, format, filter };
  }

  
  function acquireTarget(c, slot, w, h, format, filter, grow) {
    const gl = c.gl;
    const old = c.targets[slot];
    if (old && old.format === format && old.filter === filter &&
        (grow ? (old.w >= w && old.h >= h) : (old.w === w && old.h === h))) {
      return old;
    }
    if (old) {
      gl.deleteFramebuffer(old.fb);
      gl.deleteTexture(old.tex);
      c.targets[slot] = null;
    }
    const nw = grow ? Math.max(w, old ? old.w : 0) : w;
    const nh = grow ? Math.max(h, old ? old.h : 0) : h;
    const made = makeTarget(gl, nw, nh, format, filter);
    if (made) c.targets[slot] = made;
    return made;
  }

  function shadowTarget(c, w, h) {
    if (c.shadowFmt === null) {
      const gl = c.gl;
      const probeTarget = makeTarget(gl, 1, 1, gl.R8, gl.LINEAR);
      if (probeTarget) {
        gl.deleteFramebuffer(probeTarget.fb);
        gl.deleteTexture(probeTarget.tex);
      }
      gl.getError();                  
      c.shadowFmt = probeTarget ? gl.R8 : gl.RGBA8;
    }
    return acquireTarget(c, 'shadow', w, h, c.shadowFmt, c.gl.LINEAR, false);
  }

  
  
  
  
  const SKY_N = 128;
  let skyCanvas = null;
  let skyCtx = null;

  function skyNoise2(x, y) {
    const h = (ix, iy) => {
      const n = Math.sin(ix * 127.1 + iy * 311.7) * 43758.5453;
      return n - Math.floor(n);
    };
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);
    const a = h(ix, iy);
    const b = h(ix + 1, iy);
    const c = h(ix, iy + 1);
    const d = h(ix + 1, iy + 1);
    return (a + (b - a) * sx) + ((c + (d - c) * sx) - (a + (b - a) * sx)) * sy;
  }

  function renderSkyMatcap(dn, clouds, skyDir, sunBloom) {
    if (!skyCanvas) {
      skyCanvas = document.createElement('canvas');
      skyCanvas.width = skyCanvas.height = SKY_N;
      skyCtx = skyCanvas.getContext('2d');
    }
    const N = SKY_N;
    const img = skyCtx.createImageData(N, N);
    const px = img.data;
    const zen = dn.skyZ;
    const sunC = dn.skyH;
    const dark = dn.skyD;
    const key = dn.lightCol;
    const [sx, sy, sz] = dn.sunDir;
    const [mx, my, mz] = dn.moonDir;
    const sunH = dn.sunXY;
    const moonH = dn.moonXY;
    const sunVis = dn.sunSkyVis;
    const moonVis = dn.moonSkyVis;
    const dirExp = 1 + 5 * clamp(Number(skyDir) / 100, 0, 1);
    const bloomAmt = clamp(Number(sunBloom) / 100, 0, 1.5);
    const cloudAmt = clamp(Number(clouds) / 100, 0, 1);
    const moonHorizon = dn.nightSkyH;
    const moonKey = dn.nightKey;
    const mix = (a, b, t) => a + (b - a) * t;
    for (let y = 0; y < N; y++) {
      const dv = (y + 0.5) / N - 0.5;     
      const nv = -dv;                     
      for (let x = 0; x < N; x++) {
        const du = (x + 0.5) / N - 0.5;
        const dist = Math.hypot(du, dv);
        const r = Math.min(1.0, dist * 2.0);   
        let rx = 0;
        let ry = 0;
        let rz = 1;
        if (dist > 1e-6) {
          rz = (1 - r * r) / (1 + r * r);
          const hm = Math.sqrt(Math.max(0, 1 - rz * rz)) / dist;
          rx = du * hm;
          ry = nv * hm;
        }
        const invR = dist > 1e-6 ? 1 / dist : 0;
        const dx = du * invR;
        const dy = nv * invR;
        const rawSun = clamp(0.5 + 0.5 * (dx * sunH[0] + dy * sunH[1]), 0, 1);
        const rawMoon = clamp(0.5 + 0.5 * (dx * moonH[0] + dy * moonH[1]), 0, 1);
        const sideSun = Math.pow(rawSun, dirExp) * sunVis;
        const sideMoon = Math.pow(rawMoon, dirExp) * moonVis;
        const zc = clamp(rz, 0, 1);
        const gm = Math.pow(1 - zc, 0.62);
        const hR = mix(mix(dark[0], sunC[0], sideSun), moonHorizon[0], sideMoon);
        const hG = mix(mix(dark[1], sunC[1], sideSun), moonHorizon[1], sideMoon);
        const hB = mix(mix(dark[2], sunC[2], sideSun), moonHorizon[2], sideMoon);
        let cr = mix(zen[0], hR, gm);
        let cg = mix(zen[1], hG, gm);
        let cb = mix(zen[2], hB, gm);
        const horizonFall = Math.pow(1 - zc, 0.75);
        const bloomSun = Math.pow(rawSun, 2.5) * horizonFall * bloomAmt * sunVis;
        const bloomMoon = Math.pow(rawMoon, 2.5) * horizonFall * bloomAmt * 0.55 * moonVis;
        cr += sunC[0] * bloomSun * 0.85 + moonHorizon[0] * bloomMoon * 0.85;
        cg += sunC[1] * bloomSun * 0.85 + moonHorizon[1] * bloomMoon * 0.85;
        cb += sunC[2] * bloomSun * 0.85 + moonHorizon[2] * bloomMoon * 0.85;
        const cosSun = rx * sx + ry * sy + rz * sz;
        if (cosSun > 0.2 && sunVis > 0.001) {
          const tight = Math.pow(cosSun, 260) * 1.5 * sunVis;
          const broad = Math.pow(cosSun, 22) * 0.22 * bloomAmt * sunVis;
          cr += key[0] * (tight + broad);
          cg += key[1] * (tight + broad);
          cb += key[2] * (tight + broad);
        }
        const cosMoon = rx * mx + ry * my + rz * mz;
        if (cosMoon > 0.2 && moonVis > 0.001) {
          const tight = Math.pow(cosMoon, 320) * 1.15 * moonVis;
          const broad = Math.pow(cosMoon, 26) * 0.20 * bloomAmt * 0.55 * moonVis;
          cr += moonKey[0] * (tight + broad);
          cg += moonKey[1] * (tight + broad);
          cb += moonKey[2] * (tight + broad);
        }
        if (cloudAmt > 0.001 && r > 0.18) {
          const cu = x / N * 3.2 + 11.0;
          const cv = y / N * 3.2 + 4.0;
          const n = skyNoise2(cu, cv) * 0.62 + skyNoise2(cu * 2.1, cv * 2.1) * 0.28
            + skyNoise2(cu * 4.3, cv * 4.3) * 0.10;
          const band = Math.pow(Math.min(1, r), 0.7);
          const mask = clamp((n - 0.55) * 5.0, 0, 1) * band * cloudAmt;
          const cw = 0.55 + 0.35 * key[0];
          const cloudR = sunC[0] * 0.55 + cw;
          const cloudG = sunC[1] * 0.55 + cw;
          const cloudB = sunC[2] * 0.55 + cw;
          cr += (cloudR - cr) * mask * 0.34;
          cg += (cloudG - cg) * mask * 0.34;
          cb += (cloudB - cb) * mask * 0.34;
        }
        const i = (y * N + x) * 4;
        px[i] = Math.min(255, Math.max(0, cr * 255));
        px[i + 1] = Math.min(255, Math.max(0, cg * 255));
        px[i + 2] = Math.min(255, Math.max(0, cb * 255));
        px[i + 3] = 255;
      }
    }
    skyCtx.putImageData(img, 0, 0);
  }

  function updateSky(c, dn, settings) {
    if (!c.tex.sky) return;
    const s = settings.uniforms;
    const key = [
      settings.preset, dn.hour.toFixed(3),
      dn.sunDir.map(v => v.toFixed(3)).join(','),
      dn.moonDir.map(v => v.toFixed(3)).join(','),
      dn.skyZ.map(v => v.toFixed(3)).join(','),
      dn.skyH.map(v => v.toFixed(3)).join(','),
      dn.skyD.map(v => v.toFixed(3)).join(','),
      dn.sunSkyVis.toFixed(4), dn.moonSkyVis.toFixed(4),
      s.clouds, s.skyDir, s.sunBloom,
    ].join('|');
    if (key === c.skyKey) return;
    c.skyKey = key;
    renderSkyMatcap(dn, s.clouds, s.skyDir, s.sunBloom);
    const gl = c.gl;
    gl.bindTexture(gl.TEXTURE_2D, c.tex.sky);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);   
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, SKY_N, SKY_N, gl.RGBA, gl.UNSIGNED_BYTE,
      skyCanvas);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  }

  
  
  
  function ensureOptionalTextures(c, settings, kind, epoch) {
    const defs = settings.defines || {};
    if (defs.HAS_LIGHTING && !c.tex.normal && !c.optional.normal) {
      c.optional.normal = true;
      c.tex.normal = c.normalFallback;
      decodeTexture((activePointer && activePointer.bakes && activePointer.bakes.normal)
        || 'sea-zag-normal.webp', kind)
        .then(source => {
          if (epoch !== routeEpoch || glc !== c || c.lost) {
            if (source && typeof source.close === 'function') source.close();
            return;
          }
          const up = uploadTexture(c.gl, source, false, 'normal');
          c.tex.normal = up.tex;
          c.size.normal = [up.w, up.h];
        })
        .catch(() => {});
    }
    const soilWanted = defs.HAS_SOIL && Number(settings.uniforms.soilMix) > 0;
    if (soilWanted && !c.tex.soil && !c.optional.soil) {
      c.optional.soil = true;
      c.tex.soil = c.soilFallback;
      const name = activePointer && activePointer.bakes && activePointer.bakes.soil
        ? activePointer.bakes.soil : 'sea-zag-soil.webp';
      decodeTexture(name, kind)
        .then(source => {
          if (epoch !== routeEpoch || glc !== c || c.lost) {
            if (source && typeof source.close === 'function') source.close();
            return;
          }
          const up = uploadTexture(c.gl, source, false, 'soil');
          c.tex.soil = up.tex;
          c.size.soil = [up.w, up.h];
        })
        .catch(() => {});
    }
  }

  function drainErrors(gl) {
    for (let i = 0; i < 16 && gl.getError() !== gl.NO_ERROR; i++) {  }
  }

  
  
  
  
  function buildGL(kind = activeMapKind) {
    if (!kind || kind !== activeMapKind) return;
    const ks = getKindState(kind);
    const epoch = routeEpoch;
    loadPointerForKind(kind).then(() => {
      if (epoch !== routeEpoch || activeMapKind !== kind || !state.on || !mapGateOpen) return;
      if (ks.outdated) { paintOutdatedPlaceholder(); return; }
      if (!ks.pointer || ks.unverified) {
        
        
        
        hideSeaForNoPointer();
        return;
      }
      try { buildGLNow(kind, epoch); } catch (e) { fallbackToStatic(e); }
    }).catch(e => {
      if (epoch === routeEpoch && activeMapKind === kind) fallbackToStatic(e);
    });
  }

  function buildGLNow(kind, epoch) {
    if (!state.on || !mapGateOpen) return;      
    if (state.mapOutdated) { paintOutdatedPlaceholder(); return; }
    
    
    
    if (!activePointer || !activePointer.bakes || !activePointer.bakes.height) {
      fallbackToStatic(new Error('v2 bakes unavailable'));
      return;
    }
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

    const settings0 = currentSettings();
    let first;
    try {
      first = buildProgram(gl, settings0.defines);
    } catch (e) {
      canvas.remove();
      throw e;
    }
    const { prog, uni } = first;
    const curves = settings0.curves || seaConsts.curves;

    const skyTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, skyTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, SKY_N, SKY_N, 0, gl.RGBA,
      gl.UNSIGNED_BYTE, null);

    const c = {
      canvas, gl, prog, uni,
      progs: new Map([[definesKey(settings0.defines), first]]),
      shadowProgs: new Map(),
      blitProg: null, blitUni: null,
      tex: {
        curve: curveTexture(gl, curves.pc),
        slice: curveTexture(gl, curves.sc),
        warp: curveTexture(gl, curves.wc),
        palette: paletteTexture(gl, activePointer.palette || seaConsts.palette),
        sky: skyTex,
      },
      normalFallback: solidTexture(gl, [128, 128, 255, 255]),
      soilFallback: solidTexture(gl, [0, 0, 0, 0]),
      shadowFallback: solidTexture(gl, [255, 255, 255, 255]),
      optional: { normal: false, soil: false },
      targets: { shadow: null, texel: null },
      shadowFmt: null,
      skyKey: '',
      whaleTex: null,
      whaleDirty: true,
      size: { palette: [256, 1], sky: [SKY_N, SKY_N] },
      raf: 0, timer: 0, ready: false, css: '', lost: false, first: false,
      onLost: null, onRestored: null,
      epoch, kind,
    };
    glc = c;
    c.onLost = e => onContextLost(c, e);
    c.onRestored = () => onContextRestored(c);
    canvas.addEventListener('webglcontextlost', c.onLost);
    canvas.addEventListener('webglcontextrestored', c.onRestored);

    drainErrors(gl);
    state.loading = true;
    refreshUi();

    
    
    
    if (kind === 'exploration') { loadWhale(); loadWhaleMesh(); }

    
    
    
    
    const noisy = (firstLoad || retryPending) && showNoise();
    retryPending = false;
    if (!noisy) stopIntro();

    
    
    
    const specs = [
      ['height', activePointer.bakes.height, true],
      ['dist', 'sea-zag-dist.webp', true],
      ['aux', 'sea-zag-aux.webp', false],
      ['flow', 'sea-zag-flow.webp', false],
      ['speed', 'sea-zag-speed.webp', false],
    ];
    Promise.all(specs.map(([key, name, nearest]) => decodeTexture(name, kind)
      .then(source => {
        if (epoch !== routeEpoch || glc !== c || c.lost) {
          if (source && typeof source.close === 'function') source.close();
          return;
        }
        const up = uploadTexture(gl, source, nearest, key);
        c.tex[key] = up.tex;
        c.size[key] = [up.w, up.h];
      }))).then(() => {
      if (epoch !== routeEpoch || glc !== c || c.lost) return;
      
      
      const glErr = gl.getError();
      if (glErr !== gl.NO_ERROR) {
        throw new Error('texture: GL error 0x' + glErr.toString(16));
      }
      const max = Number(gl.getParameter(gl.MAX_TEXTURE_SIZE)) || probe.maxTextureSize;
      for (const key of ['height', 'dist', 'aux', 'flow', 'speed']) {
        const [w, h] = c.size[key] || [0, 0];
        if (!w || !h || w > max || h > max) {
          throw new Error(`texture: ${key} ${w}x${h} > MAX_TEXTURE_SIZE ${max}`);
        }
      }
      c.ready = true;
      state.glReady = true;
      state.loading = false;
      state.error = null;
      
      
      ensureOptionalTextures(c, currentSettings(), kind, epoch);
      if (noisy) startIntro();
      startGL();
      refreshUi();
    }).catch(e => {
      state.loading = false;
      if (epoch !== routeEpoch) return;         
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
    const progs = new Set();
    if (c.progs) for (const p of c.progs.values()) progs.add(p.prog);
    if (c.shadowProgs) for (const p of c.shadowProgs.values()) progs.add(p.prog);
    for (const p of progs) { try { c.gl.deleteProgram(p); } catch {} }
    if (c.blitProg) { try { c.gl.deleteProgram(c.blitProg); } catch {} }
    for (const slot of Object.keys(c.targets || {})) {
      const target = c.targets[slot];
      if (!target) continue;
      try { c.gl.deleteFramebuffer(target.fb); } catch {}
      try { c.gl.deleteTexture(target.tex); } catch {}
    }
    for (const key of Object.keys(c.tex || {})) {
      try { c.gl.deleteTexture(c.tex[key]); } catch {}
    }
    for (const key of ['normalFallback', 'soilFallback', 'shadowFallback']) {
      if (c[key]) { try { c.gl.deleteTexture(c[key]); } catch {} }
    }
    if (!c.lost) {
      const lose = c.gl.getExtension('WEBGL_lose_context');
      if (lose) { try { lose.loseContext(); } catch {} }
    }
    if (c.canvas) c.canvas.remove();
  }

  
  
  
  
  function currentHour() {
    if (state.timeMode === 'day') return 13.0;
    if (state.timeMode === 'night') return 1.0;
    if (state.timeMode === 'custom') return state.customHour;
    if (state.timeMode === 'off') return 12.0;
    const d = new Date();
    return d.getHours() + d.getMinutes() / 60;
  }

  
  
  
  function flatDayNight(settings) {
    if (!settings || !settings.kf) {
      const one = [1, 1, 1];
      return {
        hour: 12, sunDir: [0, 0, 1], moonDir: [0, 0, 1], keyDir: [0, 0, 1],
        keyVis: 1, isMoon: false, sunKeyVis: 1, moonKeyVis: 0,
        sunSkyVis: 1, moonSkyVis: 0, sunXY: [0, 1], moonXY: [0, 1],
        keyXY: [0, 1], anchor: [0, 0], lowSun: 0,
        lightCol: one, ambCol: one, skyZ: one, skyH: one,
        skyD: one, specTint: one, nightMix: 0, lightI: 1, skyI: 1,
        specI: 1, nightKey: one, nightSkyH: one,
      };
    }
    return dayNightState(12, settings.kf,
      { ...dnOptions(settings), timeMode: 'off' });
  }

  function dnOptions(settings) {
    const u = settings.uniforms || {};
    return {
      hemi: u.hemi || 'S',
      sunMaxEl: u.sunMaxEl,
      sunAzOff: u.sunAzOff,
      specDrift: u.specDrift,
    };
  }

  function liveDayNight(settings) {
    
    if (!settings.dayNight || state.timeMode === 'off') return flatDayNight(settings);
    return dayNightState(currentHour(), settings.kf,
      { ...dnOptions(settings), timeMode: state.timeMode });
  }

  function frameDayNight(settings, frameOpts) {
    if (frameOpts && frameOpts.hour !== undefined) {
      return dayNightState(frameOpts.hour, settings.kf,
        { ...dnOptions(settings), timeMode: 'custom' });
    }
    if (frameOpts && frameOpts.flat) return flatDayNight(settings);
    return liveDayNight(settings);
  }

  const presetTog = settings => (settings.preset && seaConsts.presets[settings.preset]
    ? seaConsts.presets[settings.preset].TOG || {} : {});

  function renderFrame(c, w, h, cam, t, settings, ramps, waveTime, flowTime,
                       frameOpts) {
    const { gl, uni, tex, size } = c;
    const u = settings.uniforms;
    const defs = settings.defines || {};
    const dn = frameDayNight(settings, frameOpts);
    const liveOff = !frameOpts && state.timeMode === 'off';
    const dayNight = !!(settings.dayNight && !(frameOpts && frameOpts.flat) && !liveOff);
    const shadowEff = dayNight
      ? (Number(u.shadowStr) || 0) / 100 * dn.keyVis * (dn.isMoon ? 0.65 : 1)
      : 0;
    const waveSet = frameOpts && frameOpts.waveSet !== undefined
      ? frameOpts.waveSet
      : waveSetEnvelope(wallNow(performance.now()));
    const kind = c.kind || activeMapKind;
    ensureOptionalTextures(c, settings, kind, c.epoch === undefined ? routeEpoch : c.epoch);
    if (defs.HAS_SKY_MATCAP) updateSky(c, dn, settings);

    
    
    
    const pad = mapPad();
    const targetX = cam.tx + pad;
    const targetY = cam.ty + pad;
    const hSpan = activePointer.heightHi - activePointer.heightLo;

    gl.useProgram(c.prog);
    gl.uniform2f(uni.uTarget, targetX, targetY);
    gl.uniform2f(uni.uSize, bakeW(), bakeH());
    gl.uniform2f(uni.uViewSize, w, h);
    gl.uniform2f(uni.uFlowSize, size.flow[0], size.flow[1]);
    
    
    
    
    gl.uniform1f(uni.uFlowCell,
      pad > 0 ? activePointer.flowCell : bakeW() / size.flow[0]);
    gl.uniform2f(uni.uSpeedSize, size.speed[0], size.speed[1]);
    gl.uniform2f(uni.uAuxSpan, size.aux[0] * activePointer.auxScale,
      size.aux[1] * activePointer.auxScale);
    
    
    gl.uniform1f(uni.uBleed, pad > 0 ? 0.0 : LEGACY_BLEED_TILES);
    gl.uniform2f(uni.uCenter, cam.centerX, cam.centerY);
    gl.uniform1f(uni.uZoom, cam.zoom);
    gl.uniform1f(uni.uZoomCss, cam.zoomCss);
    gl.uniform1f(uni.uTime, t);
    gl.uniform1f(uni.uWaveTime, waveTime);
    gl.uniform1f(uni.uFlowTime, flowTime);
    gl.uniform1f(uni.uDistMax, activePointer.distMax);
    gl.uniform1f(uni.uAlongScale, activePointer.alongScale);
    gl.uniform1f(uni.uHeightSpan, hSpan > 0 ? hSpan : 0.8394);
    
    
    gl.uniform1f(uni.uDepthScale, parallaxDepthScale(activePointer));
    setModeUniforms(gl, uni, u, settings, {
      dn, dayNight, shadowEff, waveSet,
      soilReady: !!c.tex.soil && c.tex.soil !== c.soilFallback,
    });

    
    
    gl.uniform1f(uni.uHue, (Number(u.hue) || 0) + state.hue);
    gl.uniform1f(uni.uSat, (Number(u.sat ?? 100) / 100) * (state.sat / 100));
    gl.uniform1f(uni.uBrightness,
      (Number(u.bright ?? 110) / 100) * (state.brightness / 1.1));

    
    
    
    
    const whale = whaleUniforms(state.whalePose, WHALE_SHAPE);
    
    if (!whaleMesh || activeMapKind !== 'exploration') whale.shape[3] = 0;
    
    
    const whalePose = [whale.pose[0] + pad, whale.pose[1] + pad, whale.pose[2], whale.pose[3]];
    const wake = activeMapKind === 'exploration'
      ? [whaleWake[0] + pad, whaleWake[1] + pad, whaleWake[2], whaleWake[3]]
      : [ZERO_WAKE[0] + pad, ZERO_WAKE[1] + pad, ZERO_WAKE[2], ZERO_WAKE[3]];
    gl.uniform4fv(uni.uWhalePose, whalePose);
    gl.uniform4fv(uni.uWhaleShape, whale.shape);
    gl.uniform4fv(uni.uWhaleWake, wake);
    if (whaleMesh && activeMapKind === 'exploration') {
      if (!c.whaleTex) c.whaleTex = whaleTexture(gl);
      if (c.whaleDirty) {
        gl.activeTexture(gl.TEXTURE12);
        gl.bindTexture(gl.TEXTURE_2D, c.whaleTex);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, whaleTexSize[0], whaleTexSize[1],
          gl.RGBA, gl.UNSIGNED_BYTE, whaleTexBuf);
        c.whaleDirty = false;
      }
      gl.uniform2f(uni.uWhaleHalf, whaleHalf[0], whaleHalf[1]);
      gl.uniform1f(uni.uWhaleHeight, whaleHeight);
    }

    
    
    
    const r = ramps || NEUTRAL_RAMPS;
    gl.uniform1f(uni.uReveal, r.reveal);
    if (r.wave < 1) {
      gl.uniform1f(uni.uWaveIn, u.win * r.wave);
      gl.uniform1f(uni.uWaveOut, u.wout * r.wave);
      gl.uniform1f(uni.uFoam, u.foam * r.wave);
    }
    if (r.grain < 1) gl.uniform1f(uni.uGrain, u.grain * r.grain);

    
    
    
    const tog = presetTog(settings);
    let texel = null;
    if (tog.texelFbo !== 0 && u.snap && cam.zoom > 1.05 &&
        (ramps || NEUTRAL_RAMPS).reveal >= 1) {
      const tx0 = Math.floor(targetX - w * 0.5 / cam.zoom) - 1;
      const ty0 = Math.floor(targetY - h * 0.5 / cam.zoom) - 1;
      const tx1 = Math.ceil(targetX + w * 0.5 / cam.zoom) + 1;
      const ty1 = Math.ceil(targetY + h * 0.5 / cam.zoom) + 1;
      const fw = Math.max(1, tx1 - tx0);
      const fh = Math.max(1, ty1 - ty0);
      if (fw * fh < w * h * 0.85 && fw <= 4096 && fh <= 4096) {
        texel = { tx0, ty0, fw, fh };
      }
    }
    const texelTarget = texel
      ? acquireTarget(c, 'texel', texel.fw, texel.fh, gl.RGBA8, gl.NEAREST, true)
      : null;
    if (!texelTarget) texel = null;
    if (texelTarget) c.size.texel = [texelTarget.w, texelTarget.h];

    
    const shadowOn = dayNight && defs.HAS_SHADOWS && defs.USE_HALF_SHADOW &&
      shadowEff > 0.001;
    const sw = Math.max(1, Math.round(w * 0.5));
    const sh = Math.max(1, Math.round(h * 0.5));
    let shTarget = null;
    if (shadowOn) {
      try {
        shTarget = shadowTarget(c, sw, sh);
        if (shTarget) c.size.shadow = [shTarget.w, shTarget.h];
      } catch { shTarget = null; }
    }
    if (shadowOn && shTarget) {
      try {
        const sp = getShadowProgram(c, defs);
        const su = sp.uni;
        
        gl.activeTexture(gl.TEXTURE13);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, shTarget.fb);
        gl.viewport(0, 0, shTarget.w, shTarget.h);
        gl.useProgram(sp.prog);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, tex.aux);
        gl.uniform1i(su.uAux, 1);
        gl.activeTexture(gl.TEXTURE8);
        gl.bindTexture(gl.TEXTURE_2D, tex.curve);
        gl.uniform1i(su.uCurve, 8);
        gl.uniform2f(su.uTarget, targetX, targetY);
        gl.uniform2f(su.uAuxSpan, size.aux[0] * activePointer.auxScale,
          size.aux[1] * activePointer.auxScale);
        gl.uniform2f(su.uCenter, cam.centerX, cam.centerY);
        gl.uniform2f(su.uShadowScale, w / shTarget.w, h / shTarget.h);
        gl.uniform1f(su.uZoom, cam.zoom);
        gl.uniform1f(su.uZoomCss, cam.zoomCss);
        gl.uniform1f(su.uSnap, u.snap);
        gl.uniform1f(su.uParallax, -(Number(u.par) || 0));
        gl.uniform1f(su.uDepthScale, parallaxDepthScale(activePointer));
        gl.uniform1f(su.uHeightSpan, hSpan > 0 ? hSpan : 0.8394);
        gl.uniform3fv(su.uSunDir, dn.keyDir);
        gl.uniform1f(su.uShadowStrength, shadowEff);
        gl.uniform1f(su.uShadowLen, u.shadowLen);
        gl.uniform1f(su.uShadowHeight, u.shadowH);
        gl.uniform1f(su.uShadowSoft, u.shadowSoft);
        gl.uniform1f(su.uShadowMaxEl, u.shadowMaxEl);
        gl.uniform1f(su.uShadowStretch, u.shadowStretch);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      } catch {
        
        
        shTarget = null;
      } finally {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }
    }

    
    gl.useProgram(c.prog);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const bind = (unit, name, tx) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tx || null);
      gl.uniform1i(uni[name], unit);
    };
    bind(0, 'uHeight', tex.height);
    bind(1, 'uAux', tex.aux);
    bind(2, 'uDist', tex.dist);
    bind(3, 'uFlow', tex.flow);
    bind(4, 'uSpeedTex', tex.speed);
    bind(5, 'uNormal', tex.normal || c.normalFallback);
    bind(6, 'uSoilTex', tex.soil || c.soilFallback);
    bind(7, 'uPalette', tex.palette);
    bind(8, 'uCurve', tex.curve);
    bind(9, 'uSliceCurve', tex.slice);
    bind(10, 'uWarpCurve', tex.warp);
    bind(11, 'uSkyMatcap', tex.sky);
    bind(12, 'uWhaleTex', c.whaleTex);
    bind(13, 'uShadowTex', shTarget ? shTarget.tex : c.shadowFallback);

    if (texel && texelTarget) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, texelTarget.fb);
      gl.viewport(0, 0, texel.fw, texel.fh);
      gl.uniform1f(uni.uTexelPass, 1.0);
      gl.uniform2f(uni.uTileOrigin, texel.tx0, texel.ty0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, w, h);
      const bp = getBlitProgram(c);
      gl.useProgram(bp.prog);
      gl.activeTexture(gl.TEXTURE13);
      gl.bindTexture(gl.TEXTURE_2D, texelTarget.tex);
      gl.uniform1i(bp.uni.uTexelFbo, 13);
      gl.uniform2f(bp.uni.uTarget, targetX, targetY);
      gl.uniform2f(bp.uni.uCenter, cam.centerX, cam.centerY);
      gl.uniform2f(bp.uni.uTileOrigin, texel.tx0, texel.ty0);
      gl.uniform2f(bp.uni.uTileSpan, texelTarget.w, texelTarget.h);
      gl.uniform1f(bp.uni.uZoom, cam.zoom);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    } else {
      gl.uniform1f(uni.uTexelPass, 0.0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
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

  
  
  
  
  
  
  
  const liveSeaTarget = vs => seaTarget(vs, mapH(), mapOx(), mapOy());

  function drawGL(t) {
    
    
    if (!activePointer) return;
    if (state.mapOutdated) { paintOutdatedPlaceholder(); return; }
    
    if (!initialGateSettled()) { showNoise(); return; }
    if (!glc || !glc.ready || glc.lost || !mapGateOpen) return;
    const deck = deckCanvas();
    if (!deck) return;
    const vs = viewState(deck);
    if (!vs) return;

    const settings = currentSettings();
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
      ';image-rendering:pixelated' +
      (state.on ? '' : ';display:none');
    if (glc.css !== css) {
      glc.css = css;
      canvas.style.cssText = css;
    }

    const cam = cameraUniforms(vs, cssW, cssH, w, h);
    const target = liveSeaTarget(vs);
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
    
    
    
    
    
    const dt = state.lastPhaseAt ? (now - state.lastPhaseAt) / 1000 : 0;
    
    
    if (!state.lastPhaseAt) {
      state.wavePhase = t;
      state.flowPhase = t;
    }
    state.lastPhaseAt = now;
    const r = ramps;
    const k = 1 + 0.5 * (1 - r.flow);
    state.wavePhase = advancePhase(state.wavePhase, dt, state.waveSpeed);
    state.flowPhase = advancePhase(state.flowPhase, dt, state.flowSpeed * k);
    const t0 = now;
    
    
    updateWhalePose(now);
    renderFrame(glc, w, h, {
      tx: target[0], ty: target[1],
      zoom: cam.zoomPx, zoomCss: cam.zoomPx / scale,
      centerX: cam.centerX, centerY: cam.centerY,
    }, t, settings, ramps, state.wavePhase, state.flowPhase);
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
          sizeGL(currentSettings().renderScale);
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
    
    const kind = currentMapKind();
    if (!kind) return false;
    
    
    openSeaForMap(kind);
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
      live = liveSeaTarget(vs);
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
    
    
    const waveTime = t * state.waveSpeed;
    const flowTime = t * state.flowSpeed;

    const canvas = glc.canvas;
    const prevW = canvas.width, prevH = canvas.height;
    const prevPose = state.whalePose;
    
    
    
    const settings = currentSettings();
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
      
      
      const frameOpts = {
        waveSet: opts.waveSetT !== undefined
          ? waveSetEnvelope(Number(opts.waveSetT)) : 1.0,
      };
      if (opts.hour !== undefined) {
        const hour = Number(opts.hour);
        if (!isFinite(hour)) throw new Error('debugRender needs a finite hour');
        frameOpts.hour = hour;
      } else {
        frameOpts.flat = true;
      }
      renderFrame(glc, bw, bh, {
        tx, ty,
        zoom: zoom * scale, zoomCss: zoom,
        centerX: bw / 2, centerY: bh / 2,
      }, t, settings, liveRamps(performance.now()), waveTime, flowTime, frameOpts);

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
      const settings = currentSettings();
      const sized = sizeGL(settings.renderScale);
      if (!sized) throw new Error('no viewport');

      const cam = cameraUniforms(vs, sized.cssW, sized.cssH, sized.w, sized.h);
      const target = liveSeaTarget(vs);
      const frame = {
        tx: target[0], ty: target[1],
        zoom: cam.zoomPx, zoomCss: cam.zoomPx / sized.scale,
        centerX: cam.centerX, centerY: cam.centerY,
      };
      const start = performance.now();
      const tStart = start / 1000;
      let ms;
      try {
        
        
        updateWhalePose(performance.now());
        renderFrame(glc, sized.w, sized.h, frame, tStart, settings,
          liveRamps(start), tStart * state.waveSpeed, tStart * state.flowSpeed);
        syncGL(glc.gl);
        const t0 = performance.now();
        for (let i = 0; i < 60; i++) {
          const t = tStart + i / 60;
          updateWhalePose(performance.now());
          renderFrame(glc, sized.w, sized.h, frame, t, settings, liveRamps(start),
            t * state.waveSpeed, t * state.flowSpeed);
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
        
        vramMB: (bakeW() * bakeH() * 4) / 1e6,
        fps: staticDraws.length,      
        ms: lastDrawMs,
        msKind: 'cpu',
        renderer: '2D',
        draws: state.draws,
        moving: false,
        pad: mapPad(),
        mapOrigin: [mapOx(), mapOy()],
        depthScale: parallaxDepthScale(activePointer),
        intro: { ...liveRamps(performance.now()) },
        mapStatus: mapStatus(),
        mapVariant: mapVariant(),
        mapKind: activeMapKind,
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
      mapKind: activeMapKind,
      mapGate: mapGateOpen,
      mapCheck: state.mapCheck,
      colourFormat: state.colourFormat,
      firstLoad,
      introPending,
      backgrounded,
      awayVisible,
      pad: mapPad(),
      mapOrigin: [mapOx(), mapOy()],
      depthScale: parallaxDepthScale(activePointer),
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

  
  
  function setWaveSpeed(multiplier) {
    const v = Number(multiplier);
    state.waveSpeed = clamp(isFinite(v) ? v : 1, 0, 2);
    refreshUi();
    return state.waveSpeed;
  }

  function setFlowSpeed(multiplier) {
    const v = Number(multiplier);
    state.flowSpeed = clamp(isFinite(v) ? v : 1, 0, 2);
    refreshUi();
    return state.flowSpeed;
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

  
  
  function setResScale(scale) {
    const n = Number(scale);
    state.resScale = RES_SCALES.includes(n) ? n
      : RES_SCALES.includes(n / 100) ? n / 100 : 1;
    nextAt = 0;
    refreshUi();
    return state.resScale;
  }

  function setPreset(id) {
    if (!PRESET_IDS.includes(id)) return state.preset;
    state.preset = id;
    if (glc) glc.css = '';         
    nextAt = 0;
    refreshUi();
    return state.preset;
  }

  function setTimeMode(id) {
    if (!TIME_MODES.includes(id)) return state.timeMode;
    state.timeMode = id;
    nextAt = 0;
    refreshUi();
    return state.timeMode;
  }

  function setCustomHour(hour) {
    const v = Number(hour);
    state.customHour = clamp(isFinite(v) ? v : 13, 0, 24);
    nextAt = 0;
    refreshUi();
    return state.customHour;
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
  state.setResScale = setResScale;
  state.setPreset = setPreset;
  state.setTimeMode = setTimeMode;
  state.setCustomHour = setCustomHour;
  state.setOn = setOn;
  state.setWhalePose = setWhalePose;
  state.whale = setWhale;
  state.whaleAt = setWhaleAt;
  
  
  
  state.mapGateStatus = () => state.mapCheck;
  state.applyMapCheckForTest = ({
    kind = activeMapKind || 'exploration',
    pointer, timingUrls: urls = [], cacheUrls: cached = [], manifest = null,
    manifestFailed = false,
  }) => {
    const ks = getKindState(kind);
    if (pointer) {
      const parsed = kind === 'exploration'
        ? parsePointer(pointer, seaConsts)
        : parseKindPointer(pointer, kind);
      ks.pointer = parsed;
      ks.pointerLoaded = !!parsed;
    }
    const pointerStamp = ks.pointer ? ks.pointer.map.stamp : null;
    const v = checkMapGate({
      kind, pointerStamp, timingUrls: urls, cacheUrls: cached, manifest,
      manifestFailed,
    });
    ks.mapCheck = {
      ...v,
      kind,
      pointerStamp,
      assetVersion: ks.pointer ? ks.pointer.assetVersion : null,
    };
    if (v.status === 'outdated') enterOutdated(kind, v);
    if (v.status === 'unavailable') closeUnverifiedSea(kind);
    if (kind === activeMapKind) syncActiveMirrors(kind);
    return ks.mapCheck;
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

  
  
  
  
  
  
  
  function resetPerf() {
    
    
    requestMode(resolveResetMode(env, canUseShader));
    localStorage.setItem('zz-sea-mode', RESET_PERF.mode);   
    localStorage.setItem('zz-sea-fps', setAdaptiveFps(RESET_PERF.fps30) ? '1' : '0');
    localStorage.setItem('zz-sea-cap', String(setFrameCap(RESET_PERF.frameCap)));
    localStorage.setItem('zz-sea-hidden',
      setStaticWhenHidden(RESET_PERF.staticWhenHidden) ? '1' : '0');
    localStorage.setItem('zz-sea-res', String(setResScale(RESET_PERF.resScale)));
  }

  function resetColour() {
    setOpacity(RESET_COLOUR.opacity);
    setBrightness(RESET_COLOUR.brightness);
    setHue(RESET_COLOUR.hue);
    setSat(RESET_COLOUR.sat);
    localStorage.setItem('zz-sea-opacity', String(RESET_COLOUR.opacity));
    localStorage.setItem('zz-sea-brightness',
      String(Math.round(RESET_COLOUR.brightness * 100)));
    localStorage.setItem('zz-sea-hue', String(RESET_COLOUR.hue));
    localStorage.setItem('zz-sea-sat', String(RESET_COLOUR.sat));
  }

  function resetMotion() {
    setWaveSpeed(RESET_MOTION.waveSpeed);
    setFlowSpeed(RESET_MOTION.flowSpeed);
    localStorage.setItem('zz-sea-wave-speed',
      String(Math.round(RESET_MOTION.waveSpeed * 100)));
    localStorage.setItem('zz-sea-flow-speed',
      String(Math.round(RESET_MOTION.flowSpeed * 100)));
  }

  
  
  function resetStyle() {
    setPreset(RESET_STYLE.preset);
    setTimeMode(RESET_STYLE.timeMode);
    setCustomHour(RESET_STYLE.customHour);
    localStorage.setItem('zz-sea-preset', RESET_STYLE.preset);
    localStorage.setItem('zz-sea-time-mode', RESET_STYLE.timeMode);
    localStorage.setItem('zz-sea-custom-hour', String(RESET_STYLE.customHour));
  }

  function uiState() {
    return {
      on: state.on, mode: state.mode, opacity: state.opacity,
      brightness: state.brightness, hue: state.hue, sat: state.sat,
      waveSpeed: state.waveSpeed, flowSpeed: state.flowSpeed,
      fps30: state.fps30,
      frameCap: state.frameCap, staticWhenHidden: state.staticWhenHidden,
      resScale: state.resScale, preset: state.preset,
      timeMode: state.timeMode, customHour: state.customHour,
      
      
      presetDayNight:
        modeSettings(state.mode, state.preset, state.resScale).dayNight,
      canUseShader: state.canUseShader, maxTextureSize: state.maxTextureSize,
      loading: state.loading, error: state.error,
      update: updateState(),
      
      
      mapStamp: state.mapCheck ? state.mapCheck.liveStamp : null,
      seaStamp: activePointer && activePointer.map ? activePointer.map.stamp : null,
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
    if ('resScale' in patch) {
      localStorage.setItem('zz-sea-res', String(setResScale(patch.resScale)));
    }
    if ('preset' in patch) {
      localStorage.setItem('zz-sea-preset', setPreset(patch.preset));
    }
    if ('timeMode' in patch) {
      localStorage.setItem('zz-sea-time-mode', setTimeMode(patch.timeMode));
    }
    if ('customHour' in patch) {
      localStorage.setItem('zz-sea-custom-hour', String(setCustomHour(patch.customHour)));
    }
    if ('resetStyle' in patch && patch.resetStyle) {
      resetStyle();
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
    if ('waveSpeed' in patch) {
      localStorage.setItem('zz-sea-wave-speed',
        String(Math.round(setWaveSpeed(patch.waveSpeed) * 100)));
    }
    if ('flowSpeed' in patch) {
      localStorage.setItem('zz-sea-flow-speed',
        String(Math.round(setFlowSpeed(patch.flowSpeed) * 100)));
    }
    if ('reset' in patch) {
      const which = patch.reset;
      if (which === 'perf') resetPerf();
      else if (which === 'colour') resetColour();
      else if (which === 'motion') resetMotion();
      else if (which === 'style') resetStyle();
      
      
      else if (which === true) { resetColour(); resetMotion(); }
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
    getEnabled: () => currentMapKind() !== null,
  });

  
  
  document.addEventListener('visibilitychange', () => {
    
    
    
    if (!document.hidden) {
      anchorClock(false);
      checkLiveMap(activeMapKind);
    }
    onPresenceChange();
  });
  window.addEventListener('blur', onPresenceChange);
  window.addEventListener('focus', () => {
    onPresenceChange();
    checkLiveMap(activeMapKind);
  });
  
  
  setInterval(() => {
    if (!document.hidden && currentMapKind()) checkLiveMap(activeMapKind);
  }, MANIFEST_CHECK_MS);
  
  
  window.addEventListener('resize', () => {
    if (state.mapOutdated && state.on && mapGateOpen) paintOutdatedPlaceholder();
  });

  

  
  
  anchorClock(true);

  
  
  loadMapsRecord();

  
  
  
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
