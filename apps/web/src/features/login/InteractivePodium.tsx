import { Suspense, useEffect, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Group, MathUtils, type Mesh } from "three";
import { useAccessibility } from "../accessibility/AccessibilityProvider";
import { ErrorBoundary } from "../../components/error-boundary";

type Target = { x: number; y: number };
function Scene({
  target,
  invalidateRef,
  activity,
  theme,
}: {
  target: MutableRefObject<Target>;
  invalidateRef: MutableRefObject<(() => void) | null>;
  activity: number;
  theme: "light" | "dark";
}) {
  const group = useRef<Group>(null);
  const halo = useRef<Mesh>(null);
  const { invalidate } = useThree();
  useEffect(() => {
    invalidateRef.current = invalidate;
    return () => {
      invalidateRef.current = null;
    };
  }, [invalidate, invalidateRef]);
  useFrame((_, delta) => {
    if (!group.current) return;
    const x = target.current.y * 0.06,
      y = target.current.x * 0.16 + (activity % 4) * 0.06;
    group.current.rotation.x = MathUtils.damp(
      group.current.rotation.x,
      x,
      7,
      Math.min(delta, 0.06),
    );
    group.current.rotation.y = MathUtils.damp(
      group.current.rotation.y,
      y,
      7,
      Math.min(delta, 0.06),
    );
    if (
      Math.abs(group.current.rotation.x - x) +
        Math.abs(group.current.rotation.y - y) >
      0.001
    )
      invalidate();
  });
  const dark = theme === "dark";
  return (
    <>
      <ambientLight intensity={dark ? 0.7 : 1.4} />
      <directionalLight
        position={[3, 6, 4]}
        intensity={dark ? 3 : 3.8}
        color={dark ? "#b5eee0" : "#fff6de"}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight
        position={[-4, 2, 1]}
        intensity={dark ? 18 : 7}
        color="#61d9c0"
      />
      <pointLight
        position={[1, 2, -2]}
        intensity={activity ? 24 : 8}
        color="#ffc67a"
      />
      <group ref={group} position={[0, -0.7, 0]}>
        <mesh receiveShadow position={[0, -0.22, 0]}>
          <cylinderGeometry args={[3.1, 3.2, 0.25, 64]} />
          <meshStandardMaterial
            color={dark ? "#173c42" : "#cfe6de"}
            metalness={0.25}
            roughness={0.5}
          />
        </mesh>
        {[
          { x: -1.3, h: 1.15, rank: 2, color: dark ? "#5da796" : "#8fcbb7" },
          { x: 0, h: 1.9, rank: 1, color: dark ? "#b9dcbd" : "#d9ecd1" },
          { x: 1.3, h: 0.85, rank: 3, color: dark ? "#397f78" : "#62aa96" },
        ].map(({ x, h, rank, color }) => (
          <group key={rank} position={[x, 0, 0]}>
            <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.16, h, 1.16]} />
              <meshStandardMaterial
                color={color}
                metalness={0.35}
                roughness={0.34}
              />
            </mesh>
            <mesh position={[0, h + 0.02, 0]}>
              <boxGeometry args={[1.19, 0.055, 1.19]} />
              <meshStandardMaterial
                color={rank === 1 ? "#f4d495" : "#bbebd7"}
                emissive={rank === 1 ? "#b98530" : "#1e796c"}
                emissiveIntensity={activity ? 0.35 : 0.1}
                metalness={0.7}
                roughness={0.3}
              />
            </mesh>
            <mesh position={[0, h * 0.55, 0.589]}>
              <torusGeometry args={[0.17, 0.018, 12, 32]} />
              <meshStandardMaterial color="#173f43" />
            </mesh>
            <mesh position={[0, h * 0.55, 0.59]}>
              <circleGeometry
                args={[0.1, rank === 1 ? 3 : rank === 2 ? 4 : 6]}
              />
              <meshStandardMaterial color="#173f43" />
            </mesh>
          </group>
        ))}
        <mesh
          ref={halo}
          position={[0, 2.8, 0]}
          rotation={[0, 0, Math.PI / 4]}
          castShadow
        >
          <torusGeometry args={[0.43, 0.095, 16, 64]} />
          <meshStandardMaterial
            color="#efcf8d"
            metalness={0.8}
            roughness={0.23}
          />
        </mesh>
        <mesh position={[0, 2.8, 0]}>
          <octahedronGeometry args={[0.23]} />
          <meshStandardMaterial
            color="#ffe5ae"
            metalness={0.65}
            roughness={0.15}
          />
        </mesh>
      </group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.96, 0]}
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <shadowMaterial transparent opacity={dark ? 0.3 : 0.12} />
      </mesh>
    </>
  );
}
export function StaticPodium() {
  return (
    <div className="static-podium" aria-hidden="true">
      <span className="static-orbit">✧</span>
      <div>
        <span className="podium-step step-two">2</span>
        <span className="podium-step step-one">1</span>
        <span className="podium-step step-three">3</span>
      </div>
    </div>
  );
}
export default function InteractivePodium({
  activity = 0,
}: {
  activity?: number;
}) {
  const { theme } = useAccessibility();
  const target = useRef<Target>({ x: 0, y: 0 });
  const invalidate = useRef<(() => void) | null>(null);
  return (
    <ErrorBoundary FallbackComponent={StaticPodium}>
      <div
        className="podium-canvas"
        aria-hidden="true"
        onPointerMove={(e) => {
          const box = e.currentTarget.getBoundingClientRect();
          target.current = {
            x: ((e.clientX - box.left) / box.width - 0.5) * 2,
            y: ((e.clientY - box.top) / box.height - 0.5) * 2,
          };
          invalidate.current?.();
        }}
        onPointerLeave={() => {
          target.current = { x: 0, y: 0 };
          invalidate.current?.();
        }}
      >
        <Canvas
          frameloop="demand"
          shadows
          dpr={[1, 1.5]}
          orthographic
          camera={{ position: [5, 4.5, 7], zoom: 75 }}
          gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
          fallback={<StaticPodium />}
        >
          <Suspense fallback={null}>
            <Scene
              theme={theme}
              target={target}
              invalidateRef={invalidate}
              activity={activity}
            />
          </Suspense>
        </Canvas>
      </div>
    </ErrorBoundary>
  );
}
