import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { emitCatalog, emitDefense } from "./hub-bridge";
import {
  BRAIN,
  CATALOG_TOTAL,
  REGION_BY_ID,
  REGIONS,
  THREAT_TYPES,
  THREATS_PER_TYPE,
  type ThreatDef,
} from "./catalog";
import { createAudio } from "./audio";
import { setEngine, type EngineHandle } from "./engine-api";
import { createInput } from "./input";
import { autoHealCount, catalogedCount } from "./save";
import { useGameStore } from "./store";
import type { ThreatTypeId } from "./types";

const FIXED = 1 / 60;
const TURN = 1.65;
const PITCH_RATE = 1.15;
const THRUST = 22;
const RISE = 12;
const FOLLOW = 7.2;
const CAM_H = 1.6;
const SCAN_RANGE = 18;
const PULSE_RANGE = 20;
const PULSE_DOT = 0.42;
const DRAIN = 0.018;
const _f = new THREE.Vector3();
const _r = new THREE.Vector3();
const _u = new THREE.Vector3();
const _tmp = new THREE.Vector3();
const _tmp2 = new THREE.Vector3();
const _desired = new THREE.Vector3();
const _look = new THREE.Vector3();
const _ndc = new THREE.Vector3();
const WORLD_UP = new THREE.Vector3(0, 1, 0);

type Threat = {
  id: number;
  type: ThreatDef;
  mesh: THREE.Group;
  pos: THREE.Vector3;
  home: THREE.Vector3;
  health: number;
  alive: boolean;
  phase: number;
  identified: boolean;
};

type Spark = {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
  max: number;
  color: THREE.Color;
};

type Beam = {
  line: THREE.Line;
  life: number;
};

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ellipsoidPoint(rng: () => number, scale = 0.82) {
  let x = 0, y = 0, z = 0, m = 0;
  do {
    x = rng() * 2 - 1;
    y = rng() * 2 - 1;
    z = rng() * 2 - 1;
    m = x * x + y * y + z * z;
  } while (m > 1 || m < 0.04);
  return new THREE.Vector3(x * BRAIN.rx * scale, y * BRAIN.ry * scale, z * BRAIN.rz * scale);
}

function insideK(p: THREE.Vector3) {
  const nx = p.x / BRAIN.rx;
  const ny = p.y / BRAIN.ry;
  const nz = p.z / BRAIN.rz;
  return nx * nx + ny * ny + nz * nz;
}

export function createEngine(canvas: HTMLCanvasElement): EngineHandle {
  const store = useGameStore.getState();
  const rng = mulberry(0x51e7);
  const mobile =
    window.matchMedia("(max-width: 768px)").matches ||
    window.matchMedia("(pointer: coarse)").matches;
  store.setCoarse(mobile);
  store.setEngineReady(true);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !mobile,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.25 : 1.75));
  renderer.setSize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.22;
  renderer.setClearColor(0x08090c, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x08090c, 0.007);

  const camera = new THREE.PerspectiveCamera(
    62,
    (canvas.clientWidth || 1) / (canvas.clientHeight || 1),
    0.15,
    260,
  );
  camera.position.set(0, 18, 78);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(canvas.clientWidth || 1, canvas.clientHeight || 1),
    mobile ? 0.42 : 0.62,
    0.72,
    0.18,
  );
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(o: T) => {
    disposables.push(o);
    return o;
  };

  scene.add(new THREE.AmbientLight(0xb8c4c8, 0.32));
  const hemi = new THREE.HemisphereLight(0x9ec9c4, 0x2a2228, 0.7);
  scene.add(hemi);
  const coreLight = new THREE.PointLight(0x9ec9c4, 2.4, 70, 1.4);
  coreLight.position.set(0, 8, 0);
  scene.add(coreLight);

  const membraneGeo = track(new THREE.SphereGeometry(1, 32, 20));
  const membraneMat = track(
    new THREE.MeshBasicMaterial({
      color: 0x9ec9c4,
      transparent: true,
      opacity: 0.07,
      side: THREE.BackSide,
      depthWrite: false,
    }),
  );
  const membrane = new THREE.Mesh(membraneGeo, membraneMat);
  membrane.scale.set(BRAIN.rx, BRAIN.ry, BRAIN.rz);
  scene.add(membrane);
  const wire = new THREE.Mesh(
    track(new THREE.SphereGeometry(1, 24, 16)),
    track(
      new THREE.MeshBasicMaterial({
        color: 0x9ec9c4,
        wireframe: true,
        transparent: true,
        opacity: 0.09,
      }),
    ),
  );
  wire.scale.set(BRAIN.rx, BRAIN.ry, BRAIN.rz);
  scene.add(wire);

  const somaCount = mobile ? 90 : 160;
  const somaGeo = track(new THREE.SphereGeometry(1, 8, 6));
  const somaMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x3a484c,
      emissive: 0x7eb8b2,
      emissiveIntensity: 1.15,
      roughness: 0.55,
      metalness: 0.08,
    }),
  );
  const somas = new THREE.InstancedMesh(somaGeo, somaMat, somaCount);
  const dummy = new THREE.Object3D();
  const somaPos: THREE.Vector3[] = [];
  for (let i = 0; i < somaCount; i++) {
    const p = ellipsoidPoint(rng, 0.88);
    somaPos.push(p);
    const s = 0.55 + rng() * 2.1;
    dummy.position.copy(p);
    dummy.scale.setScalar(s);
    dummy.rotation.set(rng() * 6, rng() * 6, rng() * 6);
    dummy.updateMatrix();
    somas.setMatrixAt(i, dummy.matrix);
  }
  somas.instanceMatrix.needsUpdate = true;
  scene.add(somas);

  const axonGeos: THREE.BufferGeometry[] = [];
  const axonN = mobile ? 14 : 22;
  const axonMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x243034,
      emissive: 0x5ea8a0,
      emissiveIntensity: 1.15,
      roughness: 0.4,
      metalness: 0.15,
    }),
  );
  for (let i = 0; i < axonN; i++) {
    const a = somaPos[(rng() * somaPos.length) | 0]!;
    const b = somaPos[(rng() * somaPos.length) | 0]!;
    if (a.distanceTo(b) < 12) continue;
    const mid = a.clone().lerp(b, 0.5);
    mid.add(
      new THREE.Vector3((rng() - 0.5) * 10, (rng() - 0.5) * 8, (rng() - 0.5) * 10),
    );
    const curve = new THREE.CatmullRomCurve3([a, mid, b]);
    const geo = new THREE.TubeGeometry(curve, 16, 0.12 + rng() * 0.18, 5, false);
    axonGeos.push(geo);
  }
  if (axonGeos.length) {
    const merged = track(mergeGeometries(axonGeos, false)!);
    axonGeos.forEach((g) => g.dispose());
    scene.add(new THREE.Mesh(merged, axonMat));
  }

  for (const r of REGIONS) {
    const pl = new THREE.PointLight(r.color, 1.15, 36, 1.6);
    pl.position.set(...r.pos);
    scene.add(pl);
    const glowGeo = track(new THREE.SphereGeometry(5.4, 12, 10));
    const glowMat = track(
      new THREE.MeshBasicMaterial({
        color: r.color,
        transparent: true,
        opacity: 0.1,
        depthWrite: false,
      }),
    );
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.set(...r.pos);
    scene.add(glow);
  }

  const moteN = mobile ? 220 : 420;
  const moteGeo = track(new THREE.BufferGeometry());
  const motePos = new Float32Array(moteN * 3);
  for (let i = 0; i < moteN; i++) {
    const p = ellipsoidPoint(rng, 0.95);
    motePos[i * 3] = p.x;
    motePos[i * 3 + 1] = p.y;
    motePos[i * 3 + 2] = p.z;
  }
  moteGeo.setAttribute("position", new THREE.BufferAttribute(motePos, 3));
  const motes = new THREE.Points(
    moteGeo,
    track(
      new THREE.PointsMaterial({
        color: 0x9ec9c4,
        size: 0.22,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    ),
  );
  scene.add(motes);

  const coreGeo = track(new THREE.OctahedronGeometry(1.15, 0));
  const coreMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x9ec9c4,
      emissive: 0x9ec9c4,
      emissiveIntensity: 1.4,
      roughness: 0.2,
      metalness: 0.4,
    }),
  );
  const sentinelCore = new THREE.Mesh(coreGeo, coreMat);
  sentinelCore.position.set(0, 8, 0);
  scene.add(sentinelCore);
  const coreHalo = new THREE.Mesh(
    track(new THREE.SphereGeometry(1.8, 16, 16)),
    track(
      new THREE.MeshBasicMaterial({
        color: 0x9ec9c4,
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
      }),
    ),
  );
  coreHalo.position.copy(sentinelCore.position);
  scene.add(coreHalo);

  const probe = new THREE.Group();
  const probeMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xd5ece8,
      emissive: 0x9ec9c4,
      emissiveIntensity: 1.6,
      roughness: 0.25,
      metalness: 0.35,
    }),
  );
  const soma = new THREE.Mesh(track(new THREE.SphereGeometry(0.36, 16, 16)), probeMat);
  probe.add(soma);
  const halo = new THREE.Mesh(
    track(new THREE.SphereGeometry(0.52, 14, 14)),
    track(
      new THREE.MeshBasicMaterial({
        color: 0x9ec9c4,
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
      }),
    ),
  );
  probe.add(halo);
  const dendGeo = track(new THREE.CylinderGeometry(0.025, 0.07, 0.62, 5));
  dendGeo.rotateX(Math.PI / 2);
  for (let i = 0; i < 4; i++) {
    const d = new THREE.Mesh(dendGeo, probeMat);
    const a = (i / 4) * Math.PI * 2;
    d.position.set(Math.cos(a) * 0.22, Math.sin(a) * 0.18, 0.28);
    d.lookAt(d.position.x * 3, d.position.y * 3, 1.4);
    probe.add(d);
  }
  const axon = new THREE.Mesh(track(new THREE.ConeGeometry(0.12, 0.7, 6)), probeMat);
  axon.rotation.x = Math.PI / 2;
  axon.position.z = -0.5;
  probe.add(axon);
  probe.position.set(-42, 6, 22);
  scene.add(probe);
  const probeLight = new THREE.PointLight(0x9ec9c4, 1.6, 16, 2);
  probe.add(probeLight);

  const trailN = 28;
  const trailGeo = track(new THREE.BufferGeometry());
  const trailArr = new Float32Array(trailN * 3);
  trailGeo.setAttribute("position", new THREE.BufferAttribute(trailArr, 3));
  const trail = new THREE.Line(
    trailGeo,
    track(new THREE.LineBasicMaterial({ color: 0x9ec9c4, transparent: true, opacity: 0.55 })),
  );
  scene.add(trail);
  const trailHist: THREE.Vector3[] = Array.from({ length: trailN }, () => probe.position.clone());

  const typeMats = new Map<ThreatTypeId, THREE.MeshStandardMaterial>();
  for (const t of THREAT_TYPES) {
    typeMats.set(
      t.id,
      track(
        new THREE.MeshStandardMaterial({
          color: t.color,
          emissive: t.color,
          emissiveIntensity: 1.35,
          roughness: 0.38,
          metalness: 0.22,
          transparent: true,
          opacity: 0.96,
        }),
      ),
    );
  }

  function makeThreatMesh(def: ThreatDef): THREE.Group {
    const g = new THREE.Group();
    const mat = typeMats.get(def.id)!;
    switch (def.id) {
      case "capsid": {
        g.add(new THREE.Mesh(track(new THREE.IcosahedronGeometry(0.85, 0)), mat));
        const spike = track(new THREE.ConeGeometry(0.1, 0.4, 5));
        spike.rotateX(Math.PI / 2);
        for (let i = 0; i < 7; i++) {
          const s = new THREE.Mesh(spike, mat);
          const phi = Math.acos(1 - (2 * (i + 0.5)) / 7);
          const theta = Math.PI * (1 + Math.sqrt(5)) * i;
          s.position.setFromSphericalCoords(0.85, phi, theta);
          s.lookAt(s.position.clone().multiplyScalar(2));
          g.add(s);
        }
        break;
      }
      case "amyloid": {
        for (let i = 0; i < 5; i++) {
          const s = new THREE.Mesh(track(new THREE.SphereGeometry(0.3 + (i % 3) * 0.08, 8, 8)), mat);
          s.position.set(((i % 3) - 1) * 0.45, (i - 2) * 0.18, ((i * 0.37) % 1) - 0.4);
          g.add(s);
        }
        break;
      }
      case "prion": {
        g.add(new THREE.Mesh(track(new THREE.TorusKnotGeometry(0.52, 0.13, 64, 7, 2, 3)), mat));
        break;
      }
      case "cytokine": {
        g.add(new THREE.Mesh(track(new THREE.SphereGeometry(0.52, 14, 14)), mat));
        const ring = new THREE.Mesh(track(new THREE.TorusGeometry(0.82, 0.045, 6, 20)), mat);
        g.add(ring);
        break;
      }
      case "leech": {
        const body = new THREE.Mesh(track(new THREE.CapsuleGeometry(0.26, 1.05, 4, 8)), mat);
        body.rotation.z = Math.PI / 2;
        g.add(body);
        break;
      }
      case "stripper": {
        for (let i = 0; i < 4; i++) {
          const d = new THREE.Mesh(track(new THREE.TorusGeometry(0.32 + i * 0.14, 0.045, 5, 14)), mat);
          d.rotation.x = Math.PI / 2;
          d.position.z = (i - 1.5) * 0.2;
          g.add(d);
        }
        break;
      }
    }
    return g;
  }

  const threats: Threat[] = [];
  let threatId = 0;
  function spawnThreats() {
    for (const t of threats) scene.remove(t.mesh);
    threats.length = 0;
    for (const def of THREAT_TYPES) {
      const region = REGION_BY_ID[def.region];
      for (let n = 0; n < THREATS_PER_TYPE; n++) {
        const mesh = makeThreatMesh(def);
        const home = new THREE.Vector3(...region.pos);
        home.x += (rng() - 0.5) * 16;
        home.y += (rng() - 0.5) * 10;
        home.z += (rng() - 0.5) * 14;
        if (def.id === "amyloid" && n === 0) home.set(-36, 6, 14);
        if (insideK(home) > 0.75) home.multiplyScalar(0.7);
        mesh.position.copy(home);
        mesh.scale.setScalar(1.45);
        scene.add(mesh);
        const known = store.knowledge[def.id]?.identified ?? false;
        threats.push({
          id: ++threatId,
          type: def,
          mesh,
          pos: home.clone(),
          home: home.clone(),
          health: def.health,
          alive: true,
          phase: rng() * 6,
          identified: known,
        });
      }
    }
  }
  spawnThreats();

  const sparkPos = new Float32Array(90 * 3);
  const sparkCol = new Float32Array(90 * 3);
  const sparkGeo = track(new THREE.BufferGeometry());
  sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3));
  sparkGeo.setAttribute("color", new THREE.BufferAttribute(sparkCol, 3));
  const sparksMesh = new THREE.Points(
    sparkGeo,
    track(
      new THREE.PointsMaterial({
        size: 0.18,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      }),
    ),
  );
  scene.add(sparksMesh);
  const sparks: Spark[] = [];

  function burst(at: THREE.Vector3, color: number, n = 14, speed = 8) {
    const c = new THREE.Color(color);
    for (let i = 0; i < n; i++) {
      if (sparks.length > 80) sparks.shift();
      sparks.push({
        pos: at.clone(),
        vel: new THREE.Vector3(rng() - 0.5, rng() - 0.5, rng() - 0.5).normalize().multiplyScalar(speed * (0.4 + rng())),
        life: 0.45 + rng() * 0.35,
        max: 0.8,
        color: c,
      });
    }
  }

  const beams: Beam[] = [];
  const beamMat = track(new THREE.LineBasicMaterial({ color: 0x9ec9c4, transparent: true, opacity: 0.85 }));

  const ringGeo = track(new THREE.TorusGeometry(0.6, 0.03, 6, 24));
  const ringMat = track(new THREE.MeshBasicMaterial({ color: 0x9ec9c4, transparent: true, opacity: 0, depthWrite: false }));
  const pulseRing = new THREE.Mesh(ringGeo, ringMat);
  scene.add(pulseRing);

  const input = createInput(canvas);
  const audio = createAudio();
  audio.setMuted(store.settings.muted);
  audio.setMaster(store.settings.master);

  let yaw = 0.4;
  let pitch = -0.12;
  let speed = 0;
  let integrity = 72;
  let camBlend = 0;
  let orbitT = 0;
  let trauma = 0;
  let hitstop = 0;
  let pulseCd = 0;
  let viewerSync = 0;
  let sentinelSync = 0;
  let scanTick = 0;
  let autoHealAcc = 0;
  let nagAcc = 0;
  let hudAcc = 0;
  let acc = 0;
  let lastBeat = -1;
  let warnedLow = false;
  let running = true;
  let playActive = false;
  let steerInject: number | null = null;
  const timer = new THREE.Timer();

  const onMove = (e: MouseEvent) => {
    if (document.pointerLockElement !== canvas) return;
    const sens = useGameStore.getState().settings.sensitivity;
    yaw -= e.movementX * 0.0015 * sens;
    pitch -= e.movementY * 0.0012 * sens;
    pitch = Math.max(-1.1, Math.min(1.1, pitch));
    input.setPointerDelta(e.movementX, e.movementY);
  };
  const onClick = () => {
    if (useGameStore.getState().phase === "playing") {
      canvas.requestPointerLock?.();
    }
  };
  canvas.addEventListener("click", onClick);
  document.addEventListener("mousemove", onMove);

  function facing(outF: THREE.Vector3, outR: THREE.Vector3) {
    const cp = Math.cos(pitch);
    outF.set(-Math.sin(yaw) * cp, Math.sin(pitch), -Math.cos(yaw) * cp).normalize();
    outR.set(Math.cos(yaw), 0, -Math.sin(yaw)).normalize();
  }

  function say(from: "SENTINEL" | "SYSTEM" | "VIEWER", text: string) {
    useGameStore.getState().pushComms(from, text);
    if (from === "SENTINEL") audio.playComms();
  }

  function persistKnow() {
    useGameStore.getState().persist();
  }

  function autonomyPct() {
    return Math.round((autoHealCount(useGameStore.getState().knowledge) / CATALOG_TOTAL) * 100);
  }

  function pickTarget(): Threat | null {
    const live = threats.filter((t) => t.alive);
    if (!live.length) return null;
    const k = useGameStore.getState().knowledge;
    const unknown = live.filter((t) => !k[t.type.id]?.identified);
    const teach = live.filter((t) => k[t.type.id]?.identified && !k[t.type.id]?.autoHeal);
    const pool = unknown.length ? unknown : teach.length ? teach : live;
    let best: Threat | null = null;
    let bestD = Infinity;
    for (const t of pool) {
      const d = t.pos.distanceTo(probe.position);
      if (d < bestD) {
        bestD = d;
        best = t;
      }
    }
    return best;
  }

  function nearestRegionName() {
    let best = REGIONS[0]!;
    let d = Infinity;
    for (const r of REGIONS) {
      const dist = probe.position.distanceTo(_tmp.set(...r.pos));
      if (dist < d) {
        d = dist;
        best = r;
      }
    }
    return best.name;
  }

  function damageThreat(t: Threat, amount: number, source: "viewer" | "os") {
    if (!t.alive) return;
    t.health -= amount;
    burst(t.pos, t.type.color, 12, 9);
    trauma = Math.min(1, trauma + 0.28);
    hitstop = Math.max(hitstop, 0.04);
    audio.playHit();
    if (t.health <= 0) {
      t.alive = false;
      t.mesh.visible = false;
      burst(t.pos, 0x9ec9c4, 22, 11);
      audio.playNeutralize();
      trauma = Math.min(1, trauma + 0.45);
      hitstop = 0.07;
      integrity = Math.min(100, integrity + (source === "os" ? 5 : 8));
      const st = useGameStore.getState();
      const entry = st.knowledge[t.type.id];
      const neutralized = entry.neutralized + 1;
      const auto = neutralized >= t.type.autoHealAfter || entry.autoHeal;
      st.patchKnowledge(t.type.id, { neutralized, autoHeal: auto });
      persistKnow();
      emitDefense({
        attackType: t.type.id,
        outcome: "blocked",
        xpGain: source === "viewer" ? (auto && !entry.autoHeal ? 30 : 14) : 8,
      });
      if (source === "viewer") {
        say("SENTINEL", `Down. ${t.type.short} is in the catalog. I will not forget this fold.`);
        if (auto && !entry.autoHeal) {
          say(
            "SYSTEM",
            `SENTINEL OS internalized ${t.type.short}. Autonomous defense is live for this class.`,
          );
          audio.playIdentify();
        }
      } else {
        say("SENTINEL", `Handled a ${t.type.short} in ${REGION_BY_ID[t.type.region].name}.`);
        audio.playAutoHeal();
      }
    }
  }

  function firePulse() {
    if (pulseCd > 0) return;
    pulseCd = 0.55;
    audio.playPulse();
    trauma = Math.min(1, trauma + 0.12);
    facing(_f, _r);
    pulseRing.position.copy(probe.position);
    pulseRing.lookAt(probe.position.clone().add(_f));
    pulseRing.scale.setScalar(1);
    ringMat.opacity = 0.85;
    let hit = false;
    for (const t of threats) {
      if (!t.alive) continue;
      _tmp.copy(t.pos).sub(probe.position);
      const dist = _tmp.length();
      if (dist > PULSE_RANGE || dist < 0.2) continue;
      _tmp.multiplyScalar(1 / dist);
      if (_tmp.dot(_f) < PULSE_DOT) continue;
      const known = useGameStore.getState().knowledge[t.type.id]?.identified;
      const dmg = known ? 1 : 0.35;
      damageThreat(t, dmg, "viewer");
      hit = true;
      if (!known) say("SENTINEL", "Unfocused. Tissue cannot reject what we have not named. Scan first.");
    }
    if (!hit) burst(probe.position.clone().add(_f.multiplyScalar(2)), 0x9ec9c4, 8, 5);
  }

  function startMission() {
    const st = useGameStore.getState();
    st.clearComms();
    st.setKnowledgeOpen(false);
    integrity = 72;
    warnedLow = false;
    viewerSync = 0;
    sentinelSync = 0;
    lastBeat = -1;
    autoHealAcc = 0;
    nagAcc = 4;
    yaw = 0.55;
    pitch = -0.08;
    speed = 0;
    probe.position.set(-42, 6, 22);
    spawnThreats();
    playActive = true;
    camBlend = 0;
    st.setPhase("playing");
    audio.unlock();
    audio.playJackIn();
    const auto = autoHealCount(st.knowledge);
    const cat = catalogedCount(st.knowledge);
    say("SYSTEM", "Remote Viewer link established. SENTINEL OS on comms.");
    if (cat === 0) {
      say("SENTINEL", "I have a mark. Unknown signature. Follow the vector — we read it together.");
    } else if (auto === CATALOG_TOTAL) {
      say("SENTINEL", "Catalog is complete. I have the watch. Fly if you want — I will auto-heal the rest.");
    } else {
      say(
        "SENTINEL",
        `I still remember ${auto} class${auto === 1 ? "" : "es"}. I will handle those. Hunt what I have not learned.`,
      );
    }
  }

  function checkEnd() {
    const live = threats.filter((t) => t.alive).length;
    if (live === 0 && playActive) {
      playActive = false;
      const a = autonomyPct();
      useGameStore.getState().recordClear(a);
      useGameStore.getState().setPhase("debrief");
      useGameStore.getState().setHud({ integrity, autonomy: a, threatsLeft: 0 });
      document.exitPointerLock?.();
      say("SENTINEL", "Brain integrity restoring. Catalog written. Next time I already know them.");
      if (a >= 100) say("SYSTEM", "SENTINEL OS can now defend this brain without a Viewer.");
    }
    if (integrity <= 0 && playActive) {
      playActive = false;
      useGameStore.getState().setPhase("collapse");
      document.exitPointerLock?.();
      audio.playAlarm();
      say("SENTINEL", "Integrity failed. Cognitive cascade. Pulling you out, Viewer.");
    }
  }

  function simulate(dt: number) {
    const st = useGameStore.getState();
    const phase = st.phase;
    if (phase === "paused" || phase === "briefing" || phase === "debrief" || phase === "collapse") {
      orbitT += dt;
      return;
    }
    if (!playActive) return;

    if (input.consumePause()) {
      st.setPhase("paused");
      document.exitPointerLock?.();
      return;
    }
    if (input.consumeKnowledge()) st.setKnowledgeOpen(!st.knowledgeOpen);

    const actions = input.update();
    if (steerInject !== null) actions.steer = steerInject;

    facing(_f, _r);
    speed = THREE.MathUtils.damp(speed, actions.throttle * THRUST, 4.2, dt);
    yaw += actions.steer * TURN * dt;
    pitch += actions.pitch * PITCH_RATE * dt;
    pitch = Math.max(-1.15, Math.min(1.15, pitch));
    facing(_f, _r);

    probe.position.addScaledVector(_f, speed * dt);
    probe.position.y += actions.rise * RISE * dt;
    const k = insideK(probe.position);
    if (k > 0.9) {
      probe.position.multiplyScalar(0.9 / Math.sqrt(k));
    }
    _look.copy(probe.position).add(_f);
    probe.lookAt(_look);

    pulseCd = Math.max(0, pulseCd - dt);
    if (input.consumePulse()) firePulse();

    const target = pickTarget();
    let inRange = false;
    if (target) {
      const dist = target.pos.distanceTo(probe.position);
      inRange = dist < SCAN_RANGE;
      audio.setProximity(Math.max(0, 1 - dist / 28));
    } else audio.setProximity(0);

    const scanning = actions.scan && inRange && target !== null;
    if (scanning && target) {
      const def = target.type;
      const already = st.knowledge[def.id]?.identified;
      const rate = 1 / def.scanSeconds;
      viewerSync = Math.min(1, viewerSync + dt * rate);
      sentinelSync = Math.min(1, sentinelSync + dt * rate * 0.92);
      scanTick += dt;
      if (scanTick > 0.22) {
        scanTick = 0;
        audio.playScanTick();
      }
      const beat = Math.min(def.scanBeats.length - 1, Math.floor(viewerSync * def.scanBeats.length));
      if (beat !== lastBeat && beat >= 0 && !already) {
        lastBeat = beat;
        say("SENTINEL", def.scanBeats[beat]!);
      }
      if (!already && viewerSync >= 1 && sentinelSync >= 1) {
        target.identified = true;
        for (const t of threats) if (t.type.id === def.id) t.identified = true;
        st.patchKnowledge(def.id, {
          identified: true,
          encounters: st.knowledge[def.id].encounters + 1,
          learnedAt: Date.now(),
        });
        persistKnow();
        emitCatalog({ typeId: def.id, name: def.name });
        audio.playIdentify();
        say("SENTINEL", `${def.name}. ${def.protocol}`);
        say("VIEWER", "Mapped. I see it.");
        viewerSync = 0;
        sentinelSync = 0;
        lastBeat = -1;
      }
      if (already) {
        viewerSync = 1;
        sentinelSync = 1;
      }
    } else {
      viewerSync = Math.max(0, viewerSync - dt * 0.45);
      sentinelSync = Math.max(0, sentinelSync - dt * 0.35);
      if (!scanning) lastBeat = -1;
    }

    if (inRange && target && !scanning && !st.knowledge[target.type.id]?.identified && nagAcc > 6) {
      say("SENTINEL", "In range. Hold scan. We read it together.");
      nagAcc = 0;
    }

    autoHealAcc += dt;
    if (autoHealAcc > 2.6) {
      autoHealAcc = 0;
      const know = useGameStore.getState().knowledge;
      const autoT = threats.find((t) => t.alive && know[t.type.id]?.autoHeal);
      if (autoT) {
        const geo = new THREE.BufferGeometry().setFromPoints([
          sentinelCore.position.clone(),
          autoT.pos.clone(),
        ]);
        const line = new THREE.Line(geo, beamMat);
        scene.add(line);
        beams.push({ line, life: 0.35 });
        damageThreat(autoT, 1, "os");
      }
    }

    const live = threats.filter((t) => t.alive);
    integrity -= live.length * DRAIN * dt;
    if (integrity < 28 && !warnedLow) {
      warnedLow = true;
      say("SENTINEL", "Integrity falling. Stay on the mark.");
      audio.playAlarm();
    }

    nagAcc += dt;
    if (nagAcc > 14 && target) {
      nagAcc = 0;
      const r = REGION_BY_ID[target.type.region].name;
      const known = st.knowledge[target.type.id]?.identified;
      say(
        "SENTINEL",
        known
          ? `Mark is a ${target.type.short} in ${r}. Pulse when you have the angle.`
          : `Unknown in ${r}. Close in and scan — I cannot heal what I cannot name.`,
      );
    }

    for (const t of live) {
      t.phase += dt;
      t.pos.copy(t.home);
      t.pos.x += Math.sin(t.phase * 0.7) * 1.6;
      t.pos.y += Math.cos(t.phase * 0.55) * 1.1;
      t.pos.z += Math.sin(t.phase * 0.4 + 1) * 1.4;
      t.mesh.position.copy(t.pos);
      t.mesh.rotation.y += dt * 0.6;
      t.mesh.rotation.x = Math.sin(t.phase) * 0.2;
      const s = 1 + Math.sin(t.phase * 2.2) * 0.06;
      t.mesh.scale.setScalar(1.45 * s);
    }

    checkEnd();
  }

  function visuals(dt: number) {
    orbitT += dt;
    sentinelCore.rotation.y += dt * 0.35;
    sentinelCore.rotation.x += dt * 0.12;
    coreHalo.scale.setScalar(1.6 + Math.sin(orbitT * 1.4) * 0.12);
    motes.rotation.y += dt * 0.012;

    const phase = useGameStore.getState().phase;
    const chase = phase === "playing" || phase === "paused";
    camBlend = THREE.MathUtils.damp(camBlend, chase ? 1 : 0, 2.4, dt);

    facing(_f, _r);
    _u.crossVectors(_r, _f).normalize();
    _desired.copy(probe.position).addScaledVector(WORLD_UP, CAM_H).addScaledVector(_f, -FOLLOW);
    const ox = Math.cos(orbitT * 0.12) * 46;
    const oz = Math.sin(orbitT * 0.12) * 46;
    const orbitPos = _tmp2.set(ox, 12 + Math.sin(orbitT * 0.2) * 5, oz);
    const orbitLook = _tmp.set(0, 4, 0);
    const camPos = orbitPos.lerp(_desired, camBlend);
    const lookAt = orbitLook.lerp(_look.copy(probe.position).addScaledVector(_f, 3.2), camBlend);

    if (useGameStore.getState().settings.shake && trauma > 0.001) {
      const s = trauma * trauma;
      camPos.x += (rng() - 0.5) * s * 0.7;
      camPos.y += (rng() - 0.5) * s * 0.5;
      camera.rotation.z = (rng() - 0.5) * s * 0.04;
    } else camera.rotation.z = 0;
    trauma = Math.max(0, trauma - dt * 1.6);

    camera.position.copy(camPos);
    camera.lookAt(lookAt);

    trailHist.pop();
    trailHist.unshift(probe.position.clone());
    for (let i = 0; i < trailN; i++) {
      const p = trailHist[i]!;
      trailArr[i * 3] = p.x;
      trailArr[i * 3 + 1] = p.y;
      trailArr[i * 3 + 2] = p.z;
    }
    trailGeo.attributes.position.needsUpdate = true;

    ringMat.opacity = Math.max(0, ringMat.opacity - dt * 1.8);
    pulseRing.scale.addScalar(dt * 14);
    pulseRing.position.copy(probe.position);

    for (let i = beams.length - 1; i >= 0; i--) {
      const b = beams[i]!;
      b.life -= dt;
      if (b.life <= 0) {
        scene.remove(b.line);
        b.line.geometry.dispose();
        beams.splice(i, 1);
      }
    }

    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i]!;
      s.life -= dt;
      s.pos.addScaledVector(s.vel, dt);
      s.vel.multiplyScalar(0.94);
      if (s.life <= 0) sparks.splice(i, 1);
    }
    sparkPos.fill(0);
    sparkCol.fill(0);
    for (let i = 0; i < sparks.length; i++) {
      const s = sparks[i]!;
      sparkPos[i * 3] = s.pos.x;
      sparkPos[i * 3 + 1] = s.pos.y;
      sparkPos[i * 3 + 2] = s.pos.z;
      sparkCol[i * 3] = s.color.r;
      sparkCol[i * 3 + 1] = s.color.g;
      sparkCol[i * 3 + 2] = s.color.b;
    }
    sparkGeo.attributes.position.needsUpdate = true;
    sparkGeo.attributes.color.needsUpdate = true;

    hudAcc += dt;
    if (hudAcc > 1 / 12) {
      hudAcc = 0;
      const t = pickTarget();
      let wp = { x: 0.5, y: 0.42, behind: false, visible: false };
      let dist = 0;
      if (t) {
        dist = t.pos.distanceTo(probe.position);
        _ndc.copy(t.pos).project(camera);
        const behind = _ndc.z > 1;
        let x = _ndc.x * 0.5 + 0.5;
        let y = -_ndc.y * 0.5 + 0.5;
        if (behind) {
          x = x < 0.5 ? 0.06 : 0.94;
          y = 0.45;
        }
        x = Math.max(0.04, Math.min(0.96, x));
        y = Math.max(0.08, Math.min(0.88, y));
        wp = { x, y, behind, visible: true };
      }
      const know = useGameStore.getState().knowledge;
      useGameStore.getState().setHud({
        region: nearestRegionName(),
        integrity: Math.max(0, integrity),
        autonomy: autonomyPct(),
        scanProgress: Math.min(viewerSync, sentinelSync),
        viewerSync,
        sentinelSync,
        scanning: viewerSync > 0.02,
        targetName: t ? (know[t.type.id]?.identified ? t.type.name : "Unknown signature") : null,
        targetKnown: t ? !!know[t.type.id]?.identified : false,
        inScanRange: t ? t.pos.distanceTo(probe.position) < SCAN_RANGE : false,
        waypointDist: dist,
        threatsLeft: threats.filter((th) => th.alive).length,
        pulseReady: pulseCd <= 0,
        cataloged: catalogedCount(know),
        catalogTotal: CATALOG_TOTAL,
        waypoint: wp,
      });
    }
  }

  const onResize = () => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloom.resolution.set(w, h);
  };
  window.addEventListener("resize", onResize);
  onResize();
  requestAnimationFrame(onResize);

  function frame() {
    if (!running) return;
    timer.update();
    let delta = Math.min(timer.getDelta(), 0.1);
    if (hitstop > 0) {
      hitstop -= delta;
      delta *= 0.15;
    }
    acc += delta;
    while (acc >= FIXED) {
      simulate(FIXED);
      acc -= FIXED;
    }
    visuals(delta);
    composer.render();
  }
  renderer.setAnimationLoop(frame);

  const handle: EngineHandle = {
    dispose() {
      running = false;
      renderer.setAnimationLoop(null);
      input.dispose();
      audio.dispose();
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("click", onClick);
      document.removeEventListener("mousemove", onMove);
      document.exitPointerLock?.();
      composer.dispose();
      renderer.dispose();
      for (const d of disposables) {
        try {
          d.dispose();
        } catch {
          /* */
        }
      }
      setEngine(null);
      useGameStore.getState().setEngineReady(false);
      delete window.__controlsTest;
    },
    startMission,
    pause() {
      if (useGameStore.getState().phase === "playing") {
        useGameStore.getState().setPhase("paused");
        document.exitPointerLock?.();
      }
    },
    resume() {
      if (useGameStore.getState().phase === "paused") {
        useGameStore.getState().setPhase("playing");
      }
    },
    setTouch(t) {
      input.setTouch(t);
    },
    applySettings() {
      const s = useGameStore.getState().settings;
      audio.setMuted(s.muted);
      audio.setMaster(s.master);
    },
  };

  window.__controlsTest = {
    getYaw: () => yaw,
    getSpeed: () => Math.abs(speed),
    getPitch: () => pitch,
    setSteer: (v) => {
      steerInject = v;
      input.setSteerOverride(v);
    },
    setKeys: (codes) => input.setKeysOverride(codes),
  };

  setEngine(handle);
  return handle;
}
