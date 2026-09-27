import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Html, Lightformer, useAnimations, useGLTF, useProgress } from "@react-three/drei";
import { clone } from "three/addons/utils/SkeletonUtils.js";
import * as THREE from "three";

const CROWD_COUNT = 720;
const CROWD_COLORS = ["#f4c72f", "#2159a6", "#f4efe4", "#d73831"];

function Loader() {
  const { progress } = useProgress();
  return <Html center><span className="stadium-loader">{Math.round(progress)}%</span></Html>;
}

function CameraFlight({ active }: { active: boolean }) {
  const elapsed = useRef(0);

  useEffect(() => {
    elapsed.current = 0;
  }, [active]);

  useFrame(({ camera, clock }, rawDelta) => {
    if (!active) return;
    const delta = Math.min(rawDelta, 0.05);
    elapsed.current = Math.min(6.6, elapsed.current + delta);
    const t = elapsed.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      camera.position.set(7.5, 4.2, 11);
      camera.lookAt(0, 2, 0);
      return;
    }

    if (t < 1.45) {
      const p = t / 1.45;
      camera.position.set(0, 92 - p * 46, 82 - p * 35);
      camera.lookAt(0, -12 + p * 10, 0);
    } else if (t < 3.65) {
      const p = (t - 1.45) / 2.2;
      const eased = 1 - Math.pow(1 - p, 3);
      camera.position.set(18 * (1 - eased), 46 - eased * 34, 47 - eased * 26);
      camera.lookAt(0, 1.3, 0);
    } else {
      const p = Math.min(1, (t - 3.65) / 2.3);
      const eased = 1 - Math.pow(1 - p, 3);
      camera.position.set(6.5 + Math.sin(clock.elapsedTime * 0.28) * .35, 12 - eased * 7.2, 21 - eased * 10.2);
      camera.lookAt(0, 2.15, 0);
    }
    camera.fov = THREE.MathUtils.lerp(camera.fov, t < 1.45 ? 62 : 46, 1 - Math.exp(-3 * delta));
    camera.updateProjectionMatrix();
  });
  return null;
}

function Stars() {
  const positions = useMemo(() => {
    const values = new Float32Array(420 * 3);
    for (let i = 0; i < 420; i += 1) {
      const angle = i * 2.399963;
      const radius = 58 + (i % 17) * 2.7;
      values[i * 3] = Math.cos(angle) * radius;
      values[i * 3 + 1] = 22 + (i % 31) * 3.2;
      values[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return values;
  }, []);
  return <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry><pointsMaterial color="#f8f2d4" size={.28} sizeAttenuation /></points>;
}

function Field() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 384;
    const context = canvas.getContext("2d");
    if (!context) return null;
    for (let y = 0; y < 12; y += 1) {
      context.fillStyle = y % 2 ? "#28693d" : "#337b49";
      context.fillRect(0, y * 32, 256, 32);
    }
    context.strokeStyle = "#e9f0dd";
    context.lineWidth = 4;
    context.strokeRect(10, 10, 236, 364);
    context.beginPath(); context.moveTo(10, 192); context.lineTo(246, 192); context.stroke();
    context.beginPath(); context.arc(128, 192, 45, 0, Math.PI * 2); context.stroke();
    context.strokeRect(72, 10, 112, 62);
    context.strokeRect(72, 312, 112, 62);
    const fieldTexture = new THREE.CanvasTexture(canvas);
    fieldTexture.colorSpace = THREE.SRGBColorSpace;
    fieldTexture.anisotropy = 4;
    return fieldTexture;
  }, []);

  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[38, 56]} />
      <meshStandardMaterial map={texture ?? undefined} roughness={.92} />
    </mesh>
  );
}

function Crowd() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    for (let i = 0; i < CROWD_COUNT; i += 1) {
      const side = i % 4;
      const row = Math.floor(i / 180) % 9;
      const slot = i % 180;
      const along = (slot / 179 - .5) * (side < 2 ? 58 : 40);
      const edge = side < 2 ? 22 : 31;
      dummy.position.set(side < 2 ? along : (side === 2 ? -edge : edge), 2.2 + row * .62, side < 2 ? (side === 0 ? -edge : edge) : along);
      dummy.scale.set(.25, .42 + (i % 5) * .025, .25);
      dummy.rotation.y = (i % 7) * .31;
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, color.set(CROWD_COLORS[i % CROWD_COLORS.length]));
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [color, dummy]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (mesh) mesh.position.y = Math.sin(clock.elapsedTime * 6) * .07;
  });

  return <instancedMesh ref={meshRef} args={[undefined, undefined, CROWD_COUNT]}><capsuleGeometry args={[.45, .7, 2, 5]} /><meshStandardMaterial roughness={.75} /></instancedMesh>;
}

function Stadium() {
  return (
    <group>
      <Field />
      <Crowd />
      {[[-24, 5, 0], [24, 5, 0], [0, 5, -33], [0, 5, 33]].map((position, index) => (
        <mesh key={index} position={position as [number, number, number]} rotation-y={index < 2 ? Math.PI / 2 : 0} receiveShadow>
          <boxGeometry args={[61, 8, 7]} />
          <meshStandardMaterial color="#252a31" roughness={.7} metalness={.16} />
        </mesh>
      ))}
      {[[-22, 18, -29], [22, 18, -29], [-22, 18, 29], [22, 18, 29]].map((position, index) => (
        <group key={index} position={position as [number, number, number]}>
          <mesh><boxGeometry args={[.5, 28, .5]} /><meshStandardMaterial color="#81868b" metalness={.8} /></mesh>
          <spotLight position={[0, 14, 0]} angle={.52} penumbra={.7} intensity={360} distance={75} color="#f5e9be" target-position={[0, -10, index < 2 ? 18 : -18]} />
          <mesh position={[0, 14, 0]}><boxGeometry args={[5.5, 2.4, .5]} /><meshStandardMaterial color="#f6ebc4" emissive="#f6ebc4" emissiveIntensity={3} /></mesh>
        </group>
      ))}
    </group>
  );
}

function Footballer({ active }: { active: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/animated-human.glb");
  const model = useMemo(() => {
    const object = clone(scene);
    const bounds = new THREE.Box3().setFromObject(object);
    const size = bounds.getSize(new THREE.Vector3());
    object.scale.setScalar(3.35 / (size.y || 1));
    const scaled = new THREE.Box3().setFromObject(object);
    const center = scaled.getCenter(new THREE.Vector3());
    object.position.set(-center.x, -scaled.min.y, -center.z);
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return object;
  }, [scene]);
  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    if (!active) return;
    const jumpName = names.find((name) => name.toLowerCase().includes("jump")) ?? names[0];
    if (!jumpName) return;
    const action = actions[jumpName];
    action?.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(.2).play();
    return () => { action?.fadeOut(.15); };
  }, [actions, active, names]);

  useFrame(({ clock }, rawDelta) => {
    const current = group.current;
    if (!current || !active) return;
    const delta = Math.min(rawDelta, .05);
    const targetRotation = Math.sin(clock.elapsedTime * .55) * .08;
    current.rotation.y = THREE.MathUtils.damp(current.rotation.y, targetRotation, 4, delta);
  });

  return <group ref={group} position={[0, .08, 0]} rotation-y={Math.PI}><primitive object={model} /></group>;
}

function Scene({ active }: { active: boolean }) {
  return (
    <>
      <color attach="background" args={["#050b17"]} />
      <fogExp2 attach="fog" args={["#071220", .012]} />
      <Stars />
      <hemisphereLight args={["#8eb9df", "#193621", 1.35]} />
      <directionalLight position={[12, 25, 8]} intensity={2.4} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <Environment>
        <Lightformer intensity={2.2} position={[0, 12, -10]} scale={[18, 8, 1]} />
        <Lightformer intensity={1.2} color="#d8c36f" position={[-12, 5, 0]} rotation-y={Math.PI / 2} scale={[18, 3, 1]} />
      </Environment>
      <CameraFlight active={active} />
      <Stadium />
      <Suspense fallback={<Loader />}><Footballer active={active} /></Suspense>
    </>
  );
}

export function RonaldoStadium({ active }: { active: boolean }) {
  return (
    <div className="stadium-canvas" aria-label="3D-staadion ja tähistav jalgpallur">
      <Canvas shadows dpr={[1, 1.5]} camera={{ position: [0, 92, 82], fov: 62, near: .1, far: 300 }} gl={{ antialias: true, powerPreference: "high-performance" }}>
        <Scene active={active} />
      </Canvas>
      <div className="stadium-vignette" aria-hidden="true" />
    </div>
  );
}

useGLTF.preload("/models/animated-human.glb");