'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertexShaderSource = `
  uniform float time;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vec3 pos = position;
    float angle = time * 0.2;
    float y_factor = (pos.y + 80.0) / 160.0;
    float x_z = cos(angle) * pos.x - sin(angle) * pos.z;
    pos.x = cos(angle * y_factor) * pos.x - sin(angle * y_factor) * pos.z;
    pos.z = sin(angle * y_factor) * pos.x + cos(angle * y_factor) * pos.z;
    float pulse = sin(time * 0.5) * 2.0;
    pos.y += pulse * y_factor;
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShaderSource = `
  uniform vec3 color;
  uniform vec3 bgColor;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
    float viewDistance = length(vPosition);
    float alpha = 1.0 - smoothstep(50.0, 250.0, viewDistance);
    gl_FragColor = vec4(mix(color, bgColor, intensity * 0.4), alpha * 0.85);
  }
`;

export default function ArchitecturalHeroCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mountNode = mountRef.current;
    if (!mountNode) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x1a1a1a, 0.008);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 180;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x1a1a1a, 1);
    mountNode.appendChild(renderer.domElement);

    const geometry = new THREE.IcosahedronGeometry(40, 2);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0xf3efe6) },
        bgColor: { value: new THREE.Color(0x1a1a1a) },
      },
      transparent: true,
      side: THREE.DoubleSide,
      vertexShader: vertexShaderSource,
      fragmentShader: fragmentShaderSource,
    });
    const mainForm = new THREE.Mesh(geometry, material);
    scene.add(mainForm);

    const shardGeometry = new THREE.TetrahedronGeometry(2, 0);
    const shardMaterial = new THREE.MeshBasicMaterial({
      color: 0xf3efe6,
      transparent: true,
      opacity: 0.6,
    });
    const shards = new THREE.Group();
    for (let i = 0; i < 40; i++) {
      const shard = new THREE.Mesh(shardGeometry, shardMaterial);
      shard.position.set(
        (Math.random() - 0.5) * 300,
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 100
      );
      shard.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      shards.add(shard);
    }
    scene.add(shards);

    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.001;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.001;
    };
    window.addEventListener('mousemove', onMouseMove);

    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      if (!mountedRef.current) return;
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      material.uniforms.time.value = elapsedTime;

      mainForm.rotation.y += (mouseX - mainForm.rotation.y) * 0.05;
      mainForm.rotation.x += (mouseY - mainForm.rotation.x) * 0.05;

      const scale = 1 + Math.sin(elapsedTime * 0.5) * 0.02;
      mainForm.scale.set(scale, scale, scale);

      shards.rotation.y = elapsedTime * 0.05;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      shardGeometry.dispose();
      shardMaterial.dispose();
      if (mountNode) {
        mountNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 z-0"
      style={{ touchAction: 'none' }}
    />
  );
}
