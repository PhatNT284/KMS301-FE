import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const nodeColors = [0x19c2b1, 0xff6f61, 0xc8f05a, 0x7c9cff, 0xffc857];

export default function KnowledgeScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 100);
    camera.position.set(0, 1.3, 6.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const pointer = new THREE.Vector2(0, 0);
    const group = new THREE.Group();
    scene.add(group);

    const ambient = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambient);

    const key = new THREE.PointLight(0x9fffe8, 40, 18);
    key.position.set(2.5, 4, 4);
    scene.add(key);

    const rim = new THREE.PointLight(0xff8f70, 24, 14);
    rim.position.set(-4, -1, 3);
    scene.add(rim);

    const coreGeometry = new THREE.IcosahedronGeometry(0.82, 2);
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0f1720,
      emissive: 0x18c7b6,
      emissiveIntensity: 0.55,
      metalness: 0.45,
      roughness: 0.18,
      transmission: 0.2,
      transparent: true,
      opacity: 0.92
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    group.add(core);

    const nodes = [];
    const lines = [];
    const radius = 2.35;

    for (let index = 0; index < 10; index += 1) {
      const angle = (index / 10) * Math.PI * 2;
      const y = index % 2 === 0 ? 0.72 : -0.74;
      const z = Math.sin(angle * 1.5) * 0.45;
      const x = Math.cos(angle) * radius;
      const material = new THREE.MeshStandardMaterial({
        color: nodeColors[index % nodeColors.length],
        emissive: nodeColors[index % nodeColors.length],
        emissiveIntensity: 0.22,
        roughness: 0.32,
        metalness: 0.28
      });
      const node = new THREE.Mesh(new THREE.SphereGeometry(0.16, 28, 28), material);
      node.position.set(x, y, z);
      node.userData = { baseY: y, angle, speed: 0.55 + index * 0.04 };
      nodes.push(node);
      group.add(node);

      const points = [new THREE.Vector3(0, 0, 0), node.position.clone()];
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: nodeColors[index % nodeColors.length],
        transparent: true,
        opacity: 0.34
      });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      lines.push(line);
      group.add(line);
    }

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide
    });
    const rings = [1.65, 2.2, 2.85].map((size, index) => {
      const torus = new THREE.Mesh(new THREE.TorusGeometry(size, 0.007, 10, 160), ringMaterial.clone());
      torus.rotation.x = Math.PI / 2.6 + index * 0.28;
      torus.rotation.y = index * 0.42;
      group.add(torus);
      return torus;
    });

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / height || 1;
      camera.updateProjectionMatrix();
    };

    const onPointerMove = (event) => {
      const rect = mount.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    };

    const clock = new THREE.Clock();
    let animationId = 0;
    const animate = () => {
      const elapsed = clock.getElapsedTime();
      group.rotation.y += (pointer.x * 0.32 - group.rotation.y) * 0.035;
      group.rotation.x += (pointer.y * 0.22 - group.rotation.x) * 0.035;
      core.rotation.x = elapsed * 0.28;
      core.rotation.y = elapsed * 0.38;

      nodes.forEach((node, index) => {
        node.position.y = node.userData.baseY + Math.sin(elapsed * node.userData.speed + index) * 0.12;
        node.scale.setScalar(1 + Math.sin(elapsed * 1.5 + index) * 0.08);
        lines[index].geometry.setFromPoints([new THREE.Vector3(0, 0, 0), node.position.clone()]);
      });

      rings.forEach((ring, index) => {
        ring.rotation.z = elapsed * (0.12 + index * 0.04);
        ring.material.opacity = 0.12 + Math.sin(elapsed + index) * 0.035;
      });

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    resize();
    animate();
    mount.addEventListener("pointermove", onPointerMove);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationId);
      mount.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      nodes.forEach((node) => {
        node.geometry.dispose();
        node.material.dispose();
      });
      lines.forEach((line) => {
        line.geometry.dispose();
        line.material.dispose();
      });
      rings.forEach((ring) => {
        ring.geometry.dispose();
        ring.material.dispose();
      });
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="knowledge-scene" ref={mountRef} aria-label="Interactive 3D knowledge map" />;
}
