import { createContext, Suspense, useContext, useEffect, useRef, type ReactNode } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, OrbitControls, Stars, useTexture } from "@react-three/drei";
import {
  CylinderCollider,
  Physics,
  RigidBody,
  useBeforePhysicsStep,
  useRapier,
  type RapierRigidBody,
} from "@react-three/rapier";
import { RigidBodyType } from "@dimforge/rapier3d-compat";
import * as THREE from "three";
import {
  BOX_SIZE,
  CYL_HEIGHT,
  CYL_RADIUS,
  EARTH_RADIUS,
  SPHERE_RADIUS,
  isTheaterNow,
  usePlayground,
  type SpawnedBody,
} from "./store";
import { healTier, isLearned, learnedCount, sightTier, rankFor, sigKey, useProgress } from "@/lib/progress";
import { usePulse } from "@/lib/pulse";
import { useFieldQuality } from "@/lib/platform";

const NEURAL_FOG = "#140a0c";
const ORBIT_FOG = "#020308";
const _up = new THREE.Vector3(0, 1, 0);

const SPIKES = (
  [
    [1, 1, 1],
    [1, 1, -1],
    [1, -1, 1],
    [1, -1, -1],
    [-1, 1, 1],
    [-1, 1, -1],
    [-1, -1, 1],
    [-1, -1, -1],
  ] as const
).map(([x, y, z]) => {
  const dir = new THREE.Vector3(x, y, z).normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(_up, dir);
  return { dir, quat };
});

const PHI = (1 + Math.sqrt(5)) / 2;
const ICO_VERTS = (
  [
    [-1, PHI, 0],
    [1, PHI, 0],
    [-1, -PHI, 0],
    [1, -PHI, 0],
    [0, -1, PHI],
    [0, 1, PHI],
    [0, -1, -PHI],
    [0, 1, -PHI],
    [PHI, 0, -1],
    [PHI, 0, 1],
    [-PHI, 0, -1],
    [-PHI, 0, 1],
  ] as const
).map(([x, y, z]) => new THREE.Vector3(x, y, z).normalize());

const GYRI: { p: [number, number, number]; r: number; lesion: 0 | 1 | 2 }[] = [
  { p: [0, 0.92, 0], r: 1.22, lesion: 0 },
  { p: [-1.52, 0.82, 0.42], r: 1.02, lesion: 0 },
  { p: [1.48, 0.86, 0.22], r: 1.06, lesion: 1 },
  { p: [-0.28, 0.88, 1.42], r: 0.96, lesion: 0 },
  { p: [0.52, 0.8, -1.38], r: 1.0, lesion: 1 },
  { p: [-1.68, 0.76, -1.12], r: 0.9, lesion: 0 },
  { p: [1.62, 0.78, -1.18], r: 0.86, lesion: 0 },
  { p: [1.66, 0.74, 1.32], r: 0.88, lesion: 2 },
  { p: [-0.12, 1.42, -0.12], r: 0.68, lesion: 0 },
  { p: [0.22, 1.36, 0.82], r: 0.6, lesion: 2 },
  { p: [-0.88, 1.28, -0.66], r: 0.66, lesion: 0 },
];

type DeckTex = {
  cortex: THREE.Texture;
  lesion: THREE.Texture;
  skull: THREE.Texture;
  virus: THREE.Texture;
  helix: THREE.Texture;
  earth: THREE.Texture;
};

const TexCtx = createContext<DeckTex | null>(null);

function useDeckTex() {
  const t = useContext(TexCtx);
  if (!t) throw new Error("textures");
  return t;
}

function TextureGate({ children }: { children: ReactNode }) {
  const tex = useTexture({
    cortex: "/textures/cortex.jpg",
    lesion: "/textures/lesion.jpg",
    skull: "/textures/skull.jpg",
    virus: "/textures/virus.jpg",
    helix: "/textures/helix.jpg",
    earth: "/textures/earth.jpg",
  });

  useEffect(() => {
    const list = [tex.cortex, tex.lesion, tex.skull, tex.virus, tex.helix, tex.earth];
    for (const t of list) {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      t.needsUpdate = true;
    }
    tex.cortex.wrapS = tex.cortex.wrapT = THREE.RepeatWrapping;
    tex.cortex.repeat.set(2, 2);
    tex.lesion.wrapS = tex.lesion.wrapT = THREE.RepeatWrapping;
    tex.lesion.repeat.set(1.6, 1.6);
    tex.skull.wrapS = tex.skull.wrapT = THREE.RepeatWrapping;
    tex.skull.repeat.set(2.4, 1.6);
    tex.earth.wrapS = THREE.RepeatWrapping;
    tex.earth.wrapT = THREE.ClampToEdgeWrapping;
  }, [tex]);

  return <TexCtx.Provider value={tex}>{children}</TexCtx.Provider>;
}

function CentralPull() {
  const g = usePlayground((s) => s.gravity);
  const { world } = useRapier();
  useBeforePhysicsStep(() => {
    world.forEachRigidBody((body) => {
      if (!body.isValid() || body.isFixed()) return;
      if (body.bodyType() === RigidBodyType.KinematicPositionBased) return;
      const t = body.translation();
      const len = Math.hypot(t.x, t.y, t.z);
      if (len < 0.05) return;
      const mag = g * Math.max(body.mass(), 0.2);
      body.addForce({ x: (-t.x / len) * mag, y: (-t.y / len) * mag, z: (-t.z / len) * mag }, true);
    });
  });
  return null;
}

let csfPhase = 0;

function CsfFlow() {
  const { world } = useRapier();
  useBeforePhysicsStep(() => {
    csfPhase += 1 / 60;
    const pulse = 0.62 + 0.38 * Math.sin(csfPhase * 1.15);
    world.forEachRigidBody((body) => {
      if (!body.isValid() || body.isFixed()) return;
      if (body.bodyType() === RigidBodyType.KinematicPositionBased) return;
      const p = body.translation();
      const m = Math.max(body.mass(), 0.12) * pulse;
      body.addForce(
        {
          x: -p.z * 0.28 * m,
          y: Math.sin(p.x * 0.65 + csfPhase) * 0.16 * m,
          z: p.x * 0.28 * m,
        },
        true,
      );
    });
  });
  return null;
}

function Spikes({ radius, color }: { radius: number; color: string }) {
  return (
    <>
      {SPIKES.map((s, i) => (
        <mesh key={i} position={s.dir.clone().multiplyScalar(radius * 0.9)} quaternion={s.quat}>
          <coneGeometry args={[radius * 0.15, radius * 0.4, 6]} />
          <meshPhysicalMaterial color={color} roughness={0.34} metalness={0.22} clearcoat={0.35} />
        </mesh>
      ))}
    </>
  );
}

function FlaviKnobs({ radius, color }: { radius: number; color: string }) {
  return (
    <>
      {ICO_VERTS.map((v, i) => (
        <mesh key={i} position={[v.x * radius * 1.04, v.y * radius * 1.04, v.z * radius * 1.04]}>
          <sphereGeometry args={[radius * 0.15, 8, 6]} />
          <meshPhysicalMaterial color={color} roughness={0.28} metalness={0.12} clearcoat={0.45} />
        </mesh>
      ))}
    </>
  );
}

function KnownRing({ radius }: { radius: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += Math.min(dt, 0.1) * 0.85;
  });
  return (
    <group ref={ref}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 1.42, radius * 0.04, 8, 28]} />
        <meshBasicMaterial color="#7d9a7e" transparent opacity={0.62} />
      </mesh>
    </group>
  );
}

function useNowLock() {
  return usePulse((s) => s.lastSeverity === "snap" || s.repairForced);
}

function nowEmissive(base: number, now: boolean) {
  return now ? Math.min(0.92, base * 3.4) : base;
}

function ShapeVisual({ body }: { body: SpawnedBody }) {
  const { virus, helix } = useDeckTex();
  const theater = usePlayground((s) => s.theater);
  const learned = useProgress((s) => s.learned);
  const now = useNowLock();
  const { kind, color, scale, role } = body;
  const sentinel = role === "sentinel";
  const r = SPHERE_RADIUS * scale;
  const orbit = theater === "orbit";
  const known = role === "threat" && isLearned(learned, sigKey(theater, kind));

  if (kind === "sphere") {
    return (
      <group>
        <mesh castShadow receiveShadow>
          {orbit ? <octahedronGeometry args={[r, 0]} /> : <sphereGeometry args={[r, 28, 20]} />}
          <meshPhysicalMaterial
            color={color}
            roughness={sentinel ? 0.22 : orbit ? 0.18 : 0.28}
            metalness={sentinel ? 0.08 : orbit ? 0.42 : 0.14}
            clearcoat={0.55}
            clearcoatRoughness={0.24}
            bumpMap={orbit ? undefined : virus}
            bumpScale={orbit ? 0 : 0.07}
            emissive={color}
            emissiveIntensity={nowEmissive(sentinel ? 0.35 : orbit ? 0.22 : 0.08, now && !sentinel)}
            sheen={orbit ? 0 : 0.4}
            sheenColor={color}
          />
        </mesh>
        {sentinel || orbit ? null : <Spikes radius={r} color={color} />}
        {known ? <KnownRing radius={r} /> : null}
      </group>
    );
  }

  if (kind === "box") {
    if (orbit) {
      const s = BOX_SIZE * scale;
      return (
        <group>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[s, s * 0.55, s]} />
            <meshPhysicalMaterial
              color={color}
              roughness={0.38}
              metalness={0.22}
              clearcoat={0.4}
              emissive={color}
              emissiveIntensity={nowEmissive(0.1, now)}
            />
          </mesh>
          {known ? <KnownRing radius={s * 0.72} /> : null}
        </group>
      );
    }
    const capsid = r * 0.88;
    return (
      <group>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[capsid, 28, 20]} />
          <meshPhysicalMaterial
            color={color}
            roughness={0.26}
            metalness={0.08}
            clearcoat={0.62}
            bumpMap={virus}
            bumpScale={0.05}
            emissive={color}
            emissiveIntensity={nowEmissive(0.1, now)}
            sheen={0.5}
            sheenColor={color}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[capsid * 1.32, 28, 20]} />
          <meshPhysicalMaterial
            color={color}
            transparent
            opacity={0.2}
            roughness={0.06}
            metalness={0}
            clearcoat={0.85}
            depthWrite={false}
          />
        </mesh>
        <FlaviKnobs radius={capsid} color={color} />
        {known ? <KnownRing radius={capsid * 1.2} /> : null}
      </group>
    );
  }

  if (orbit) {
    return (
      <group>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[CYL_RADIUS * scale, CYL_RADIUS * scale * 0.86, CYL_HEIGHT * scale, 28]} />
          <meshPhysicalMaterial
            color={color}
            roughness={0.28}
            metalness={0.45}
            clearcoat={0.3}
            emissive={color}
            emissiveIntensity={nowEmissive(0.16, now)}
          />
        </mesh>
        {known ? <KnownRing radius={CYL_RADIUS * scale * 1.8} /> : null}
      </group>
    );
  }

  const h = CYL_HEIGHT * scale;
  const br = CYL_RADIUS * scale * 1.05;
  return (
    <group>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[br * 0.22, br, h * 0.78, 22]} />
        <meshPhysicalMaterial
          color={color}
          map={helix}
          roughness={0.34}
          metalness={0.12}
          clearcoat={0.42}
          emissive={color}
          emissiveIntensity={nowEmissive(0.06, now)}
        />
      </mesh>
      <mesh castShadow receiveShadow position={[0, -h * 0.32, 0]}>
        <sphereGeometry args={[br, 22, 16]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.3}
          metalness={0.1}
          clearcoat={0.4}
          emissive={color}
          emissiveIntensity={nowEmissive(0.05, now)}
        />
      </mesh>
      {known ? <KnownRing radius={br * 1.4} /> : null}
    </group>
  );
}

function NowPulse({ active, children }: { active: boolean; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const reduce = useRef(false);
  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    if (!active || reduce.current) {
      if (g.scale.x !== 1) g.scale.setScalar(1);
      return;
    }
    g.scale.setScalar(1 + Math.sin(clock.elapsedTime * 12) * 0.07);
  });
  return <group ref={ref}>{children}</group>;
}

function Body({ body, restitution }: { body: SpawnedBody; restitution: number }) {
  const ref = useRef<RapierRigidBody>(null);
  const gl = useThree((s) => s.gl);
  const theater = usePlayground((s) => s.theater);
  const lookMode = usePlayground((s) => s.lookMode);
  const now = useNowLock();
  const kind = body.kind;
  const neural = theater === "neural";
  const auto = kind === "sphere" ? "ball" : kind === "box" ? (neural ? "ball" : "cuboid") : false;
  const threat = body.role === "threat";

  return (
    <RigidBody
      ref={ref}
      position={body.position}
      rotation={body.rotation}
      colliders={auto}
      restitution={neural ? Math.min(restitution, 0.2) : restitution}
      friction={neural ? 0.1 : 0.72}
      linearDamping={neural ? 1.65 : 0.14}
      angularDamping={neural ? 1.35 : 0.2}
      gravityScale={neural ? 0.42 : 1}
      ccd
    >
      {kind === "cylinder" && (
        <CylinderCollider
          args={[(CYL_HEIGHT * body.scale) / 2, CYL_RADIUS * body.scale]}
          restitution={neural ? Math.min(restitution, 0.2) : restitution}
          friction={neural ? 0.1 : 0.72}
        />
      )}
      <group
        onPointerOver={() => {
          if (!lookMode || now) gl.domElement.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          gl.domElement.style.cursor = "auto";
        }}
        onPointerDown={(e: ThreeEvent<PointerEvent>) => {
          if (usePlayground.getState().lookMode && !isTheaterNow()) return;
          e.stopPropagation();
          if (body.role !== "threat") return;
          usePlayground.getState().markSeize(body.id);
        }}
      >
        <NowPulse active={now && threat}>
          <ShapeVisual body={body} />
        </NowPulse>
      </group>
    </RigidBody>
  );
}

function Bodies() {
  const bodies = usePlayground((s) => s.bodies);
  const restitution = usePlayground((s) => s.restitution);
  return (
    <>
      {bodies.map((b) => (
        <Body key={b.id} body={b} restitution={restitution} />
      ))}
    </>
  );
}

function NeuralArena() {
  const { cortex, lesion, skull } = useDeckTex();
  const healed = useProgress((s) => s.healed);
  const tier = healTier(healed);
  const shadows = useFieldQuality().shadows;
  return (
    <>
      <RigidBody type="fixed" colliders="cuboid" friction={0.18} restitution={0.04}>
        <mesh position={[0, 0.22, 0]} receiveShadow>
          <boxGeometry args={[12, 0.5, 12]} />
          <meshPhysicalMaterial
            map={cortex}
            roughness={0.38}
            metalness={0.03}
            clearcoat={0.48}
            clearcoatRoughness={0.38}
          />
        </mesh>
      </RigidBody>

      {GYRI.map((g, i) => {
        const sick = g.lesion > tier;
        return (
        <RigidBody key={i} type="fixed" colliders="ball" friction={0.16} restitution={0.04} position={g.p}>
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[g.r, 28, 20]} />
            <meshPhysicalMaterial
              map={sick ? lesion : cortex}
              roughness={sick ? 0.5 : 0.32}
              metalness={0.03}
              clearcoat={sick ? 0.22 : 0.58}
              clearcoatRoughness={0.32}
              emissive={sick ? "#4a1814" : "#000000"}
              emissiveIntensity={sick ? 0.12 : 0}
            />
          </mesh>
        </RigidBody>
        );
      })}

      <mesh position={[0, 2.55, 0]} scale={[1, 0.8, 1]} renderOrder={2}>
        <sphereGeometry args={[8.7, 40, 28]} />
        <meshPhysicalMaterial
          color="#8ebbb4"
          transparent
          opacity={0.08}
          roughness={0.14}
          metalness={0}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, 3.1, 0]} scale={[1, 0.84, 1]}>
        <sphereGeometry args={[9.6, 48, 32]} />
        <meshStandardMaterial
          map={skull}
          side={THREE.BackSide}
          roughness={0.82}
          metalness={0.04}
          color="#e6d4c4"
        />
      </mesh>

      <RigidBody type="fixed" colliders="cuboid" position={[0, 2.6, -11.1]}>
        <mesh>
          <boxGeometry args={[22, 8, 0.4]} />
          <meshBasicMaterial color={NEURAL_FOG} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" position={[0, 2.6, 11.1]}>
        <mesh>
          <boxGeometry args={[22, 8, 0.4]} />
          <meshBasicMaterial color={NEURAL_FOG} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" position={[-11.1, 2.6, 0]}>
        <mesh>
          <boxGeometry args={[0.4, 8, 22]} />
          <meshBasicMaterial color={NEURAL_FOG} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" position={[11.1, 2.6, 0]}>
        <mesh>
          <boxGeometry args={[0.4, 8, 22]} />
          <meshBasicMaterial color={NEURAL_FOG} />
        </mesh>
      </RigidBody>

      {shadows ? (
        <ContactShadows position={[0, 0.48, 0]} opacity={0.5} scale={14} blur={2.6} far={8} />
      ) : null}
    </>
  );
}

function NeuralLights() {
  return (
    <>
      <hemisphereLight args={["#f0c4b0", "#2a1214", 0.72]} />
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[5, 9, 4]}
        intensity={1.45}
        color="#ffd8c8"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={36}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0002}
      />
      <pointLight position={[2.1, 3.2, 1.1]} intensity={1.15} distance={11} color="#c45c4a" />
      <pointLight position={[-2.4, 2.6, -1.2]} intensity={0.7} distance={9} color="#7d9a7e" />
      <pointLight position={[0, 5.2, 0]} intensity={0.55} distance={12} color="#f0e0d0" />
    </>
  );
}

function Earth() {
  const { earth } = useDeckTex();
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (mesh.current) mesh.current.rotation.y += Math.min(dt, 0.1) * 0.035;
  });
  return (
    <group>
      <RigidBody type="fixed" colliders="ball" friction={0.8} restitution={0.08}>
        <mesh ref={mesh} castShadow receiveShadow>
          <sphereGeometry args={[EARTH_RADIUS, 64, 48]} />
          <meshStandardMaterial map={earth} roughness={0.58} metalness={0.06} />
        </mesh>
      </RigidBody>
      <mesh scale={1.046}>
        <sphereGeometry args={[EARTH_RADIUS, 32, 24]} />
        <meshBasicMaterial color="#6aa0d8" transparent opacity={0.16} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

function OrbitLights() {
  return (
    <>
      <hemisphereLight args={["#c5d2e6", "#020308", 0.32]} />
      <ambientLight intensity={0.1} />
      <directionalLight
        position={[9, 4.5, 6]}
        intensity={2.35}
        color="#fff4e4"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0002}
      />
      <directionalLight position={[-8, -2, -4]} intensity={0.22} color="#7d9a7e" />
    </>
  );
}

function SceneTint() {
  const theater = usePlayground((s) => s.theater);
  const healed = useProgress((s) => s.healed);
  const cleared = useProgress((s) => s.cleared);
  const xp = useProgress((s) => s.xp);
  const now = useNowLock();
  const { gl, scene } = useThree();
  useEffect(() => {
    const heal = healTier(healed);
    const sight = sightTier(cleared, rankFor(xp).level);
    if (theater === "neural") {
      gl.setClearColor(now ? "#2a0c0c" : NEURAL_FOG, 1);
      scene.fog = new THREE.FogExp2(now ? "#2a0c0c" : NEURAL_FOG, 0.052 - heal * 0.01);
    } else {
      gl.setClearColor(now ? "#140606" : ORBIT_FOG, 1);
      scene.fog = new THREE.Fog(now ? "#140606" : ORBIT_FOG, 14 + sight * 4, 48 + sight * 10);
    }
  }, [theater, healed, cleared, xp, now, gl, scene]);
  return null;
}

function CameraRig() {
  const theater = usePlayground((s) => s.theater);
  const { camera } = useThree();
  useEffect(() => {
    if (theater === "neural") camera.position.set(4.1, 3.35, 5.15);
    else camera.position.set(6.8, 2.8, 8.0);
  }, [theater, camera]);
  return null;
}

function SentinelOs() {
  const acc = useRef(0);
  useFrame((_, dt) => {
    const n = learnedCount(useProgress.getState().learned);
    if (n <= 0) {
      acc.current = 0;
      return;
    }
    const interval = n >= 6 ? 4.8 : n >= 3 ? 7.2 : 11;
    acc.current += Math.min(dt, 0.1);
    if (acc.current < interval) return;
    acc.current = 0;
    usePlayground.getState().osStrike();
  });
  return null;
}

function GlGuard() {
  const { gl } = useThree();
  useEffect(() => {
    const el = gl.domElement;
    const onLost = (e: Event) => {
      e.preventDefault();
    };
    el.addEventListener("webglcontextlost", onLost);
    return () => el.removeEventListener("webglcontextlost", onLost);
  }, [gl]);
  return null;
}

function World() {
  const gravity = usePlayground((s) => s.gravity);
  const theater = usePlayground((s) => s.theater);
  const lookMode = usePlayground((s) => s.lookMode);
  const now = useNowLock();
  const neural = theater === "neural";
  const q = useFieldQuality();

  return (
    <Physics
      key={theater}
      gravity={neural ? [0, -gravity, 0] : [0, 0, 0]}
      timeStep={1 / 60}
      interpolate
      numSolverIterations={8}
      numInternalPgsIterations={2}
    >
      <GlGuard />
      <SceneTint />
      <CameraRig />
      {neural ? <NeuralLights /> : <OrbitLights />}
      {neural ? <NeuralArena /> : <Earth />}
      {neural ? null : <Stars radius={48} depth={24} count={q.stars} factor={3.2} saturation={0} fade speed={0.35} />}
      {neural ? <CsfFlow /> : <CentralPull />}
      <SentinelOs />
      <Bodies />
      <OrbitControls
        key={theater}
        makeDefault
        enableDamping
        dampingFactor={0.08}
        enableRotate={lookMode && !now}
        enablePan={lookMode && !q.coarse && !now}
        enableZoom
        target={neural ? [0, 1.15, 0] : [0, 0, 0]}
        minPolarAngle={neural ? 0.28 : 0.12}
        maxPolarAngle={neural ? Math.PI / 2 - 0.08 : Math.PI - 0.18}
        minDistance={neural ? 2.0 : 4.8}
        maxDistance={neural ? 10 : 22}
        rotateSpeed={q.coarse ? 0.72 : 1}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN,
        }}
      />
    </Physics>
  );
}

export function PlaygroundCanvas() {
  const q = useFieldQuality();
  const tap = useRef({ x: 0, y: 0, t: 0 });
  return (
    <Canvas
      shadows={q.shadows}
      dpr={q.dpr}
      camera={{ position: [4.1, 3.35, 5.15], fov: 46, near: 0.08, far: 90 }}
      gl={{ antialias: q.antialias, alpha: false, powerPreference: q.power }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(NEURAL_FOG, 1);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.08;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        scene.fog = new THREE.FogExp2(NEURAL_FOG, 0.048);
      }}
      onPointerDown={(e) => {
        tap.current = { x: e.clientX, y: e.clientY, t: performance.now() };
      }}
      onPointerMissed={(e) => {
        const look = usePlayground.getState().lookMode;
        const now = isTheaterNow();
        if (look && !now) return;
        const dx = e.clientX - tap.current.x;
        const dy = e.clientY - tap.current.y;
        if (dx * dx + dy * dy > 144) return;
        if (performance.now() - tap.current.t > 500) return;
        if (now) usePlayground.getState().seizeNow();
        else usePlayground.getState().spawn();
      }}
      style={{ touchAction: "none", height: "100%", width: "100%" }}
    >
      <Suspense fallback={null}>
        <TextureGate>
          <World />
        </TextureGate>
      </Suspense>
    </Canvas>
  );
}
