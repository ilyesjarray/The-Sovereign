'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function CrownMesh() {
    const meshRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.01;
            meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
        }
    });

    return (
        <group ref={meshRef}>
            {/* Base Ring */}
            <mesh position={[0, -0.5, 0]}>
                <torusGeometry args={[1, 0.1, 16, 100]} />
                <meshStandardMaterial color="#fbbf24" metalness={1} roughness={0.1} />
            </mesh>

            {/* Spikes */}
            {[0, 72, 144, 216, 288].map((angle, i) => (
                <mesh key={i} position={[
                    Math.cos(THREE.MathUtils.degToRad(angle)) * 0.9,
                    0.2,
                    Math.sin(THREE.MathUtils.degToRad(angle)) * 0.9
                ]}>
                    <coneGeometry args={[0.2, 1.2, 4]} />
                    <meshStandardMaterial color="#fbbf24" metalness={1} roughness={i % 2 === 0 ? 0.1 : 0.3} />
                </mesh>
            ))}

            {/* Central Jewel */}
            <mesh position={[0, 0, 0]}>
                <octahedronGeometry args={[0.4]} />
                <MeshDistortMaterial
                    color="#fbbf24"
                    emissive="#fbbf24"
                    emissiveIntensity={0.5}
                    distort={0.3}
                    speed={2}
                />
            </mesh>
        </group>
    );
}

export default function Crown3D() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="w-16 h-16" />;

    return (
        <div className="w-16 h-16 pointer-events-none">
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#fbbf24" />
                <CrownMesh />
            </Canvas>
        </div>
    );
}
